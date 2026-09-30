<?php
/**
 * Corbit SMS gateway client.
 *
 * All communication with the Corbit gateway (https://api.mobile.net.sa) lives in this class so the
 * rest of the extension does not depend on the wire format.
 *
 * @link https://api.mobile.net.sa/
 */
namespace Opencart\System\Library\Extension\Corbit;
class Corbit {
	public const BASE_URL = 'https://api.mobile.net.sa';

	// NOTE: verify these paths and payload fields against https://api.mobile.net.sa/
	public const PATH_SEND = '/api/v1/sms/send';
	public const PATH_BALANCE = '/api/v1/account/balance';

	private string $api_key;
	private string $sender;
	private int $timeout;
	private ?object $db;

	public function __construct(string $api_key, string $sender, ?object $db = null, int $timeout = 20) {
		$this->api_key = trim($api_key);
		$this->sender = trim($sender);
		$this->db = $db;
		$this->timeout = $timeout;
	}

	/**
	 * Send one message to one or more numbers.
	 *
	 * @param string|array $numbers
	 *
	 * @return array{success: bool, message: string, response: mixed}
	 */
	public function send(string|array $numbers, string $message, string $source = 'manual'): array {
		$numbers = array_values(array_unique(array_filter(array_map([self::class, 'normalizeNumber'], (array)$numbers))));

		if (!$numbers) {
			return $this->log([], $message, $source, ['success' => false, 'message' => 'No valid mobile numbers', 'response' => null]);
		}

		if (trim($message) === '') {
			return $this->log($numbers, $message, $source, ['success' => false, 'message' => 'Empty message', 'response' => null]);
		}

		$result = $this->request('POST', self::PATH_SEND, [
			'sender'  => $this->sender,
			'numbers' => $numbers,
			'message' => $message
		]);

		return $this->log($numbers, $message, $source, $result);
	}

	/**
	 * @return array{success: bool, message: string, response: mixed, balance?: mixed}
	 */
	public function getBalance(): array {
		$result = $this->request('GET', self::PATH_BALANCE);

		if ($result['success'] && is_array($result['response'])) {
			$response = $result['response'];
			$result['balance'] = $response['balance'] ?? $response['data']['balance'] ?? $response['credit'] ?? null;
		}

		return $result;
	}

	/**
	 * Convert local Saudi formats (05xxxxxxxx, 5xxxxxxxx, +9665..., 009665...) to 9665xxxxxxxx.
	 * Numbers from other countries are kept in international format without "+" / "00".
	 */
	public static function normalizeNumber(string $number): string {
		$number = strtr($number, ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9']);
		$number = preg_replace('/\D+/', '', $number);

		if (str_starts_with($number, '00')) {
			$number = substr($number, 2);
		}

		if (preg_match('/^05\d{8}$/', $number)) {
			$number = '966' . substr($number, 1);
		} elseif (preg_match('/^5\d{8}$/', $number)) {
			$number = '966' . $number;
		} elseif (preg_match('/^9660(5\d{8})$/', $number, $match)) {
			$number = '966' . $match[1];
		}

		return (strlen($number) >= 9 && strlen($number) <= 15) ? $number : '';
	}

	/**
	 * Replace {placeholder} tokens in a template.
	 */
	public static function render(string $template, array $vars): string {
		$replace = [];

		foreach ($vars as $key => $value) {
			$replace['{' . $key . '}'] = (string)$value;
		}

		return trim(strtr($template, $replace));
	}

	private function request(string $method, string $path, array $data = []): array {
		if ($this->api_key === '') {
			return ['success' => false, 'message' => 'API key is not set', 'response' => null];
		}

		if (!function_exists('curl_init')) {
			return ['success' => false, 'message' => 'PHP cURL extension is required', 'response' => null];
		}

		$curl = curl_init(self::BASE_URL . $path);

		$headers = [
			'Accept: application/json',
			'Authorization: Bearer ' . $this->api_key
		];

		if ($method === 'POST') {
			$headers[] = 'Content-Type: application/json';

			curl_setopt($curl, CURLOPT_POST, true);
			curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_UNICODE));
		}

		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_TIMEOUT, $this->timeout);
		curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
		curl_setopt($curl, CURLOPT_USERAGENT, 'Corbit-OpenCart/1.0');

		$body = curl_exec($curl);
		$status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
		$error = curl_error($curl);

		curl_close($curl);

		if ($body === false) {
			return ['success' => false, 'message' => 'Connection error: ' . $error, 'response' => null];
		}

		$json = json_decode($body, true);
		$response = is_array($json) ? $json : $body;

		$success = $status >= 200 && $status < 300;

		if ($success && is_array($json) && isset($json['success']) && !$json['success']) {
			$success = false;
		}

		if (is_array($json)) {
			$message = $json['message'] ?? $json['error'] ?? ('HTTP ' . $status);
		} else {
			$message = 'HTTP ' . $status;
		}

		if (is_array($message)) {
			$message = json_encode($message, JSON_UNESCAPED_UNICODE);
		}

		return ['success' => $success, 'message' => (string)$message, 'response' => $response];
	}

	private function log(array $numbers, string $message, string $source, array $result): array {
		if ($this->db) {
			try {
				$this->db->query("INSERT INTO `" . DB_PREFIX . "corbit_sms_log` SET `numbers` = '" . $this->db->escape(implode(',', $numbers)) . "', `message` = '" . $this->db->escape($message) . "', `source` = '" . $this->db->escape($source) . "', `status` = '" . (int)$result['success'] . "', `response` = '" . $this->db->escape(mb_substr($result['message'], 0, 1000)) . "', `date_added` = NOW()");
			} catch (\Throwable $e) {
				// Logging must never break checkout.
			}
		}

		return $result;
	}
}
