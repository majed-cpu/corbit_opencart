<?php
/**
 * One-time password (OTP) verification of mobile numbers over Corbit SMS.
 *
 * State for the visitor lives in the session; send counters live in the
 * `corbit_sms_otp` table so limits survive a new session (SMS pumping protection).
 *
 * Kept compatible with PHP 7.1+ for OpenCart 3 stores.
 */
namespace Corbit\Sms;
class Otp {
	const SESSION_KEY = 'corbit_sms_otp';
	const MAX_ATTEMPTS = 5;
	// How long a verified number stays valid for completing the form (seconds).
	const VERIFIED_TTL = 1800;

	/** @var Client */
	private $client;
	/** @var object OpenCart database object */
	private $db;
	/** @var array Reference to the OpenCart session data array */
	private $session;
	/** @var array */
	private $settings;

	/**
	 * @param array $settings length, expiry (minutes), cooldown (seconds), hourly, daily, countries, template, store_name
	 */
	public function __construct(Client $client, $db, array &$session, array $settings) {
		$this->client = $client;
		$this->db = $db;
		$this->session = &$session;
		// Missing or blank numeric limits fall back to the safe defaults below.
		// An empty country list is kept on purpose: it means "all countries".
		foreach (['length', 'expiry', 'cooldown', 'hourly', 'daily'] as $key) {
			if (isset($settings[$key]) && !is_numeric($settings[$key])) {
				$settings[$key] = null;
			}
		}

		$this->settings = array_filter($settings, function ($value) {
			return $value !== null;
		}) + [
			'length'     => 4,
			'expiry'     => 5,
			'cooldown'   => 60,
			'hourly'     => 5,
			'daily'      => 300,
			'countries'  => '966',
			'template'   => '{code}',
			'store_name' => ''
		];
	}

	/**
	 * Send a new code to $telephone.
	 *
	 * @return array{success: bool, error?: string, wait?: int, message?: string}
	 *         error is one of: telephone, country, wait, limit, gateway
	 */
	public function send(string $telephone, string $ip): array {
		$number = Client::normalizeNumber($telephone);

		if (!$number) {
			return ['success' => false, 'error' => 'telephone'];
		}

		if (!$this->isAllowedCountry($number)) {
			return ['success' => false, 'error' => 'country'];
		}

		$table = "`" . DB_PREFIX . "corbit_sms_otp`";
		$sql_number = "'" . $this->db->escape($number) . "'";
		$sql_ip = "'" . $this->db->escape($ip) . "'";

		$this->db->query("DELETE FROM " . $table . " WHERE `date_added` < DATE_SUB(NOW(), INTERVAL 2 DAY)");

		$cooldown = max(0, (int)$this->settings['cooldown']);

		$query = $this->db->query("SELECT TIMESTAMPDIFF(SECOND, MAX(`date_added`), NOW()) AS `elapsed` FROM " . $table . " WHERE `telephone` = " . $sql_number . " OR `ip` = " . $sql_ip);

		if ($query->row['elapsed'] !== null && (int)$query->row['elapsed'] < $cooldown) {
			return ['success' => false, 'error' => 'wait', 'wait' => $cooldown - (int)$query->row['elapsed']];
		}

		$hourly = max(1, (int)$this->settings['hourly']);

		foreach (["`telephone` = " . $sql_number, "`ip` = " . $sql_ip] as $where) {
			$query = $this->db->query("SELECT COUNT(*) AS `total` FROM " . $table . " WHERE " . $where . " AND `date_added` > DATE_SUB(NOW(), INTERVAL 1 HOUR)");

			if ((int)$query->row['total'] >= $hourly) {
				return ['success' => false, 'error' => 'limit'];
			}
		}

		$daily = (int)$this->settings['daily'];

		if ($daily > 0) {
			$query = $this->db->query("SELECT COUNT(*) AS `total` FROM " . $table . " WHERE `date_added` > DATE_SUB(NOW(), INTERVAL 1 DAY)");

			if ((int)$query->row['total'] >= $daily) {
				return ['success' => false, 'error' => 'limit'];
			}
		}

		$length = min(8, max(4, (int)$this->settings['length']));
		$code = '';

		for ($i = 0; $i < $length; $i++) {
			$code .= random_int(0, 9);
		}

		$template = (string)$this->settings['template'];

		if (strpos($template, '{code}') === false) {
			$template .= ' {code}';
		}

		$vars = ['store_name' => $this->settings['store_name'], 'minutes' => (int)$this->settings['expiry']];

		$message = Client::render($template, ['code' => $code] + $vars);
		$masked = Client::render($template, ['code' => str_repeat('*', $length)] + $vars);

		// Record the attempt before calling the gateway so failures still count toward limits.
		$this->db->query("INSERT INTO " . $table . " SET `telephone` = " . $sql_number . ", `ip` = " . $sql_ip . ", `date_added` = NOW()");

		$result = $this->client->send($number, $message, 'otp', $masked);

		if (!$result['success']) {
			return ['success' => false, 'error' => 'gateway', 'message' => $result['message']];
		}

		$salt = bin2hex(random_bytes(16));

		$this->session[self::SESSION_KEY] = [
			'telephone' => $number,
			'salt'      => $salt,
			'hash'      => $this->hash($number, $code, $salt),
			'expires'   => time() + max(1, (int)$this->settings['expiry']) * 60,
			'attempts'  => 0,
			'verified'  => 0
		];

		return ['success' => true, 'wait' => $cooldown];
	}

	/**
	 * Check a code the visitor typed for $telephone.
	 *
	 * @return array{success: bool, error?: string} error is one of: required, attempts, expired, invalid
	 */
	public function verify(string $telephone, string $code): array {
		$number = Client::normalizeNumber($telephone);
		$data = isset($this->session[self::SESSION_KEY]) ? $this->session[self::SESSION_KEY] : null;

		if (!$number || !$data || $data['telephone'] !== $number) {
			return ['success' => false, 'error' => 'required'];
		}

		if (!empty($data['verified'])) {
			return ['success' => true];
		}

		if ($data['attempts'] >= self::MAX_ATTEMPTS) {
			return ['success' => false, 'error' => 'attempts'];
		}

		if (time() > $data['expires']) {
			return ['success' => false, 'error' => 'expired'];
		}

		$code = preg_replace('/\D+/', '', Client::latinDigits($code));

		$this->session[self::SESSION_KEY]['attempts']++;

		if ($code === '' || !hash_equals($data['hash'], $this->hash($number, $code, $data['salt']))) {
			return ['success' => false, 'error' => 'invalid'];
		}

		$this->session[self::SESSION_KEY]['verified'] = time();

		return ['success' => true];
	}

	public function isVerified(string $telephone): bool {
		$number = Client::normalizeNumber($telephone);
		$data = isset($this->session[self::SESSION_KEY]) ? $this->session[self::SESSION_KEY] : null;

		return $number && $data && $data['telephone'] === $number && !empty($data['verified']) && (time() - $data['verified']) < self::VERIFIED_TTL;
	}

	public function clear(): void {
		unset($this->session[self::SESSION_KEY]);
	}

	private function isAllowedCountry(string $number): bool {
		$countries = array_filter(array_map(function ($code) {
			return preg_replace('/\D+/', '', $code);
		}, explode(',', (string)$this->settings['countries'])));

		if (!$countries) {
			return true;
		}

		foreach ($countries as $country) {
			if (strpos($number, $country) === 0) {
				return true;
			}
		}

		return false;
	}

	private function hash(string $number, string $code, string $salt): string {
		return hash_hmac('sha256', $number . '|' . $code, $salt);
	}
}
