<?php
namespace Opencart\Catalog\Controller\Extension\Corbit\Module;
require_once(DIR_EXTENSION . 'corbit/system/library/corbit/sms/client.php');
require_once(DIR_EXTENSION . 'corbit/system/library/corbit/sms/otp.php');
use Corbit\Sms\Client;
use Corbit\Sms\Otp;
class CorbitSms extends \Opencart\System\Engine\Controller {
	private const ROUTE = 'extension/corbit/module/corbit_sms';

	/**
	 * Order status before addHistory() runs, keyed by order_id.
	 */
	private static array $previous_status = [];

	/**
	 * Event: catalog/model/checkout/order/addHistory/before
	 */
	public function orderHistoryBefore(string &$route, array &$args): void {
		if (!$this->config->get('module_corbit_sms_status')) {
			return;
		}

		$order_id = (int)($args[0] ?? 0);

		$query = $this->db->query("SELECT `order_status_id` FROM `" . DB_PREFIX . "order` WHERE `order_id` = '" . $order_id . "'");

		self::$previous_status[$order_id] = $query->num_rows ? (int)$query->row['order_status_id'] : 0;
	}

	/**
	 * Event: catalog/model/checkout/order/addHistory/after
	 */
	public function orderHistoryAfter(string &$route, array &$args, mixed &$output): void {
		if (!$this->config->get('module_corbit_sms_status')) {
			return;
		}

		$order_id = (int)($args[0] ?? 0);
		$order_status_id = (int)($args[1] ?? 0);
		$previous_status_id = self::$previous_status[$order_id] ?? 0;

		unset(self::$previous_status[$order_id]);

		if (!$order_status_id || $order_status_id == $previous_status_id) {
			return;
		}

		$this->load->model('checkout/order');

		$order_info = $this->model_checkout_order->getOrder($order_id);

		if (!$order_info) {
			return;
		}

		$vars = $this->orderVars($order_info, $order_status_id);

		try {
			if (!$previous_status_id) {
				// Order confirmed for the first time.
				if ($this->config->get('module_corbit_sms_order_customer_status')) {
					$this->client()->send($order_info['telephone'], Client::render((string)$this->config->get('module_corbit_sms_order_customer_text'), $vars), 'order');
				}

				if ($this->config->get('module_corbit_sms_order_admin_status')) {
					$admin_numbers = preg_split('/[\s,;]+/', (string)$this->config->get('module_corbit_sms_admin_telephone'), -1, PREG_SPLIT_NO_EMPTY);

					$this->client()->send($admin_numbers, Client::render((string)$this->config->get('module_corbit_sms_order_admin_text'), $vars), 'admin');
				}
			} else {
				$templates = (array)$this->config->get('module_corbit_sms_order_status');

				if (!empty($templates[$order_status_id]['status']) && trim($templates[$order_status_id]['text'] ?? '') !== '') {
					$this->client()->send($order_info['telephone'], Client::render($templates[$order_status_id]['text'], $vars), 'status');
				}
			}
		} catch (\Throwable $e) {
			// Never interrupt checkout because of SMS.
			$this->log->write('Corbit SMS: ' . $e->getMessage());
		}
	}

	/**
	 * Event: catalog/model/account/customer/addCustomer/before
	 *
	 * Blocks account registration until the mobile number is verified with OTP.
	 */
	public function customerAddBefore(string &$route, array &$args): void {
		if (!$this->otpEnabled()) {
			return;
		}

		// Only the registration page shows the OTP field; leave checkout / API registrations alone.
		if (strpos((string)($this->request->get['route'] ?? ''), 'account/register') !== 0) {
			return;
		}

		$this->load->language(self::ROUTE);

		$telephone = (string)($args[0]['telephone'] ?? '');
		$code = (string)($this->request->post['corbit_otp_code'] ?? '');

		$otp = $this->otp();

		if ($otp->isVerified($telephone)) {
			return;
		}

		if (trim($code) === '') {
			$error = $this->language->get('error_otp_required');
		} else {
			$result = $otp->verify($telephone, $code);

			$error = $result['success'] ? '' : $this->language->get('error_otp_' . $result['error']);
		}

		if ($error) {
			// The registration controller is AJAX; answer in the same JSON shape and stop before the account is created.
			$this->response->addHeader('Content-Type: application/json');
			$this->response->setOutput(json_encode(['error' => ['warning' => $error, 'corbit_otp' => $error]]));
			$this->response->output();

			exit();
		}
	}

	/**
	 * Event: catalog/model/account/customer/addCustomer/after
	 */
	public function customerAdd(string &$route, array &$args, mixed &$output): void {
		if (!$this->config->get('module_corbit_sms_status')) {
			return;
		}

		if ($this->otpEnabled()) {
			$this->otp()->clear();
		}

		if (!$this->config->get('module_corbit_sms_register_status')) {
			return;
		}

		$data = $args[0] ?? [];

		if (empty($data['telephone'])) {
			return;
		}

		$vars = [
			'firstname'  => $data['firstname'] ?? '',
			'lastname'   => $data['lastname'] ?? '',
			'email'      => $data['email'] ?? '',
			'telephone'  => $data['telephone'],
			'store_name' => $this->config->get('config_name'),
			'store_url'  => $this->config->get('config_url')
		];

		try {
			$this->client()->send($data['telephone'], Client::render((string)$this->config->get('module_corbit_sms_register_text'), $vars), 'register');
		} catch (\Throwable $e) {
			$this->log->write('Corbit SMS: ' . $e->getMessage());
		}
	}

	/**
	 * Event: catalog/view/account/register/after
	 *
	 * Adds the verification code field under the telephone input.
	 */
	public function registerView(string &$route, array &$args, mixed &$output): void {
		if (!$this->otpEnabled() || !is_string($output)) {
			return;
		}

		$this->load->language(self::ROUTE);

		$has_telephone = (bool)preg_match('/<input[^>]*\bname="telephone"[^>]*>/i', $output);

		// Insert after the field's error container when the theme has one, otherwise right after the input.
		$field = $has_telephone ? 'telephone' : 'email';
		$patterns = [
			'/<div[^>]*\bid="error-' . $field . '"[^>]*>\s*<\/div>/i',
			'/<input[^>]*\bname="' . $field . '"[^>]*>/i'
		];

		$position = null;

		foreach ($patterns as $pattern) {
			if (preg_match($pattern, $output, $match, PREG_OFFSET_CAPTURE)) {
				$position = $match[0][1] + strlen($match[0][0]);

				break;
			}
		}

		if ($position === null) {
			return;
		}

		$separator = version_compare(VERSION, '4.0.2.0', '>=') ? '.' : '|';

		$data = [
			'has_telephone'     => $has_telephone,
			'telephone'         => $this->request->post['telephone'] ?? '',
			'send_url'          => str_replace('&amp;', '&', $this->url->link(self::ROUTE . $separator . 'sendOtp', 'language=' . $this->config->get('config_language'))),
			'entry_telephone'   => $this->language->get('entry_otp_telephone'),
			'entry_otp_code'    => $this->language->get('entry_otp_code'),
			'button_otp_send'   => $this->language->get('button_otp_send'),
			'button_otp_resend' => $this->language->get('button_otp_resend'),
			'text_otp_resend'   => $this->language->get('text_otp_resend'),
			'text_otp_title'    => $this->language->get('text_otp_title')
		];

		$output = substr_replace($output, $this->load->view(self::ROUTE . '_otp', $data), $position, 0);
	}

	/**
	 * AJAX: send a verification code to the posted telephone.
	 */
	public function sendOtp(): void {
		$this->load->language(self::ROUTE);

		$json = [];

		if (!$this->otpEnabled() || $this->request->server['REQUEST_METHOD'] != 'POST') {
			$json['error'] = $this->language->get('error_otp_gateway');
		} else {
			$result = $this->otp()->send((string)($this->request->post['telephone'] ?? ''), (string)($this->request->server['REMOTE_ADDR'] ?? ''));

			if ($result['success']) {
				$json['success'] = $this->language->get('text_otp_sent');
			} elseif ($result['error'] == 'wait') {
				$json['error'] = sprintf($this->language->get('error_otp_wait'), $result['wait']);
			} else {
				$json['error'] = $this->language->get('error_otp_' . $result['error']);
			}

			if (!empty($result['wait'])) {
				$json['wait'] = (int)$result['wait'];
			}
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	private function orderVars(array $order_info, int $order_status_id): array {
		$query = $this->db->query("SELECT `name` FROM `" . DB_PREFIX . "order_status` WHERE `order_status_id` = '" . (int)$order_status_id . "' AND `language_id` = '" . (int)$order_info['language_id'] . "'");

		return [
			'order_id'   => $order_info['order_id'],
			'firstname'  => $order_info['firstname'],
			'lastname'   => $order_info['lastname'],
			'email'      => $order_info['email'],
			'telephone'  => $order_info['telephone'],
			'total'      => $this->currency->format($order_info['total'], $order_info['currency_code'], $order_info['currency_value']),
			'status'     => $query->num_rows ? $query->row['name'] : '',
			'store_name' => $order_info['store_name'],
			'store_url'  => $order_info['store_url'],
			'date'       => date('Y-m-d H:i', strtotime($order_info['date_added']))
		];
	}

	private function otpEnabled(): bool {
		return $this->config->get('module_corbit_sms_status') && $this->config->get('module_corbit_sms_otp_status');
	}

	private function otp(): Otp {
		$settings = ['store_name' => $this->config->get('config_name')];

		// OpenCart 4 returns '' for missing config keys; pass null so Otp applies its safe defaults.
		foreach (['length', 'expiry', 'cooldown', 'hourly', 'daily', 'countries', 'text'] as $key) {
			$settings[$key == 'text' ? 'template' : $key] = $this->config->has('module_corbit_sms_otp_' . $key) ? $this->config->get('module_corbit_sms_otp_' . $key) : null;
		}

		return new Otp($this->client(), $this->db, $this->session->data, $settings);
	}

	private function client(): Client {
		return new Client((string)$this->config->get('module_corbit_sms_api_key'), (string)$this->config->get('module_corbit_sms_sender'), $this->db);
	}
}
