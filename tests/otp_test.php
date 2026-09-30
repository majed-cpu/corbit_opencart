<?php
/**
 * Tests for the shared OTP engine against a real MySQL/MariaDB database and the mock gateway.
 *
 *   mysql -e "CREATE DATABASE otptest"            (tables are created below)
 *   php -S 127.0.0.1:8099 -t tests/mock-gateway &
 *   DB_USER=oc DB_PASS=oc php tests/otp_test.php
 */
define('DB_PREFIX', 'oc_');
define('CORBIT_SMS_BASE_URL', 'http://127.0.0.1:8099');
require __DIR__ . '/../shared/library/corbit/sms/client.php';
require __DIR__ . '/../shared/library/corbit/sms/otp.php';
use Corbit\Sms\{Client, Otp};

// Minimal stand-in for OpenCart's DB class (same query/escape API, real MariaDB).
class Db {
	private $link;
	public function __construct() {
		$this->link = new mysqli(getenv('DB_HOST') ?: '127.0.0.1', getenv('DB_USER') ?: 'root', getenv('DB_PASS') ?: '', getenv('DB_NAME') ?: 'otptest');
		$this->link->query("CREATE TABLE IF NOT EXISTS oc_corbit_sms_otp (otp_id INT AUTO_INCREMENT PRIMARY KEY, telephone VARCHAR(32), ip VARCHAR(40), date_added DATETIME)");
		$this->link->query("CREATE TABLE IF NOT EXISTS oc_corbit_sms_log (log_id INT AUTO_INCREMENT PRIMARY KEY, numbers TEXT, message TEXT, source VARCHAR(32), status TINYINT, response TEXT, date_added DATETIME)");
		$this->link->query("TRUNCATE oc_corbit_sms_log");
		$this->link->query("TRUNCATE oc_corbit_sms_otp");
	}
	public function escape($v) { return $this->link->real_escape_string($v); }
	public function query($sql) {
		$r = $this->link->query($sql);
		if ($r instanceof mysqli_result) { $rows = $r->fetch_all(MYSQLI_ASSOC); return (object)['row' => $rows[0] ?? [], 'rows' => $rows, 'num_rows' => count($rows)]; }
		return true;
	}
}

$pass = 0; $fail = 0;
function check($name, $ok, $extra = '') { global $pass, $fail; $ok ? $pass++ : $fail++; echo ($ok ? 'PASS ' : 'FAIL ') . $name . ($extra ? " — $extra" : '') . "\n"; }
function lastCode() { $l = file(__DIR__ . '/mock-gateway/requests.jsonl', FILE_IGNORE_NEW_LINES); preg_match('/\d{4,8}/', json_decode(end($l), true)['body']['message'], $m); return $m[0]; }

$db = new Db();
$client = new Client('k', 'S', $db);
$reset = function () use ($db) { $db->query('TRUNCATE oc_corbit_sms_otp'); };

// Cooldown 0 so we can hit the hourly limit quickly.
$session = [];
$otp = new Otp($client, $db, $session, ['cooldown' => 0, 'hourly' => 3, 'daily' => 100, 'countries' => '966', 'template' => 'Code {code}', 'expiry' => 5, 'length' => 6]);
for ($i = 0; $i < 3; $i++) $r = $otp->send('0501234567', '1.1.1.1');
check('3 sends within hourly limit', $r['success']);
check('code length setting respected', strlen(lastCode()) === 6);
$r = $otp->send('0501234567', '1.1.1.1');
check('4th send blocked by per-number hourly limit', !$r['success'] && $r['error'] === 'limit');
$r = $otp->send('0509999999', '1.1.1.1');
check('same IP, other number also blocked (per-IP limit)', !$r['success'] && $r['error'] === 'limit');
$r = $otp->send('0508888888', '2.2.2.2');
check('other IP + number allowed', $r['success']);

$reset();
$r = $otp->send('+971501234567', '3.3.3.3');
check('number outside allowed countries rejected', !$r['success'] && $r['error'] === 'country');
$r = $otp->send('12', '3.3.3.3');
check('invalid number rejected', !$r['success'] && $r['error'] === 'telephone');

// Cooldown
$reset(); $session = [];
$otp2 = new Otp($client, $db, $session, ['cooldown' => 60, 'countries' => '']);
$otp2->send('0501234567', '4.4.4.4');
$r = $otp2->send('0501234567', '5.5.5.5');
check('cooldown per number across IPs', !$r['success'] && $r['error'] === 'wait' && $r['wait'] > 55, json_encode($r));
$r = $otp2->send('+971501234567', '6.6.6.6');
check('empty country list allows all countries', $r['success']);

// Daily cap for the whole store
$reset(); $session = [];
$otp3 = new Otp($client, $db, $session, ['cooldown' => 0, 'hourly' => 100, 'daily' => 2, 'countries' => '966']);
$otp3->send('0501111111', '7.7.7.1'); $otp3->send('0502222222', '7.7.7.2');
$r = $otp3->send('0503333333', '7.7.7.3');
check('daily store-wide cap', !$r['success'] && $r['error'] === 'limit');

// Blank numeric settings fall back to safe defaults (not "unlimited")
$reset(); $session = [];
$otp4 = new Otp($client, $db, $session, ['cooldown' => '', 'hourly' => '', 'daily' => '', 'expiry' => '', 'countries' => '966']);
$otp4->send('0501234567', '8.8.8.8');
$r = $otp4->send('0501234567', '8.8.8.8');
check('blank cooldown falls back to 60s default', !$r['success'] && $r['error'] === 'wait' && $r['wait'] > 55, json_encode($r));

// Verification
$reset(); $session = [];
$otp5 = new Otp($client, $db, $session, ['cooldown' => 0, 'countries' => '966', 'expiry' => 5]);
$otp5->send('0501234567', '9.9.9.9');
$code = lastCode();
check('verify rejects other number', $otp5->verify('0507654321', $code)['error'] === 'required');
check('verify rejects wrong code', $otp5->verify('0501234567', '0000' === $code ? '1111' : '0000')['error'] === 'invalid');
$arabic = strtr($code, ['0'=>'٠','1'=>'١','2'=>'٢','3'=>'٣','4'=>'٤','5'=>'٥','6'=>'٦','7'=>'٧','8'=>'٨','9'=>'٩']);
check('verify accepts Arabic-Indic digits + local number format', $otp5->verify('+966 50 123 4567', $arabic)['success']);
check('isVerified after success', $otp5->isVerified('0501234567') && !$otp5->isVerified('0507654321'));
$otp5->clear();
check('clear() resets verification', !$otp5->isVerified('0501234567'));

// Max attempts
$reset(); $session = [];
$otp6 = new Otp($client, $db, $session, ['cooldown' => 0, 'countries' => '966']);
$otp6->send('0501234567', '10.0.0.1');
$code = lastCode();
for ($i = 0; $i < 5; $i++) $otp6->verify('0501234567', $code === '0000' ? '1111' : '0000');
check('correct code refused after 5 wrong attempts', $otp6->verify('0501234567', $code)['error'] === 'attempts');

// Expiry
$reset(); $session = [];
$otp7 = new Otp($client, $db, $session, ['cooldown' => 0, 'countries' => '966', 'expiry' => 5]);
$otp7->send('0501234567', '10.0.0.2');
$code = lastCode();
$session[Otp::SESSION_KEY]['expires'] = time() - 1;
check('expired code refused', $otp7->verify('0501234567', $code)['error'] === 'expired');

// Gateway failure does not leave a usable code and is still counted for limits
$reset(); $session = [];
$bad = new Otp(new Client('bad-key', 'S', $db), $db, $session, ['cooldown' => 0, 'countries' => '966']);
$r = $bad->send('0501234567', '10.0.0.3');
check('gateway error reported', !$r['success'] && $r['error'] === 'gateway' && $r['message'] === 'Invalid API key', json_encode($r));
check('no session code after gateway failure', empty($session[Otp::SESSION_KEY]));

// Log never stores the code
$log = $db->query("SELECT message FROM oc_corbit_sms_log WHERE source='otp'")->rows;
check('OTP log entries are masked', count($log) > 0 && !array_filter($log, fn($r) => preg_match('/\d{4}/', $r['message'])));

echo "\n$pass passed, $fail failed\n";
exit($fail ? 1 : 0);
