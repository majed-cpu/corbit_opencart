<?php
require_once(DIR_SYSTEM . 'library/corbit/sms/client.php');
require_once(DIR_SYSTEM . 'library/corbit/sms/otp.php');
class ControllerExtensionModuleCorbitSms extends Controller {
	const ROUTE = 'extension/module/corbit_sms';

	/**
	 * Order status before addOrderHistory() runs, keyed by order_id.
	 */
	private static $previous_status = array();

	/**
	 * Event: catalog/model/checkout/order/addOrderHistory/before
	 */
	public function orderHistoryBefore(&$route, &$args) {
		if (!$this->config->get('module_corbit_sms_status')) {
			return;
		}

		$order_id = isset($args[0]) ? (int)$args[0] : 0;

		$query = $this->db->query("SELECT `order_status_id` FROM `" . DB_PREFIX . "order` WHERE `order_id` = '" . $order_id . "'");

		self::$previous_status[$order_id] = $query->num_rows ? (int)$query->row['order_status_id'] : 0;
	}

	/**
	 * Event: catalog/model/checkout/order/addOrderHistory/after
	 */
	public function orderHistoryAfter(&$route, &$args, &$output) {
		if (!$this->config->get('module_corbit_sms_status')) {
			return;
		}

		$order_id = isset($args[0]) ? (int)$args[0] : 0;
		$order_status_id = isset($args[1]) ? (int)$args[1] : 0;
		$previous_status_id = isset(self::$previous_status[$order_id]) ? self::$previous_status[$order_id] : 0;

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
					$this->client()->send($order_info['telephone'], \Corbit\Sms\Client::render((string)$this->config->get('module_corbit_sms_order_customer_text'), $vars), 'order');
				}

				if ($this->config->get('module_corbit_sms_order_admin_status')) {
					$admin_numbers = preg_split('/[\s,;]+/', (string)$this->config->get('module_corbit_sms_admin_telephone'), -1, PREG_SPLIT_NO_EMPTY);

					$this->client()->send($admin_numbers, \Corbit\Sms\Client::render((string)$this->config->get('module_corbit_sms_order_admin_text'), $vars), 'admin');
				}
			} else {
				$templates = (array)$this->config->get('module_corbit_sms_order_status');

				if (!empty($templates[$order_status_id]['status']) && isset($templates[$order_status_id]['text']) && trim($templates[$order_status_id]['text']) !== '') {
					$this->client()->send($order_info['telephone'], \Corbit\Sms\Client::render($templates[$order_status_id]['text'], $vars), 'status');
				}
			}
		} catch (\Throwable $e) {
			// Never interrupt checkout because of SMS.
			$this->log->write('Corbit SMS: ' . $e->getMessage());
		}
	}

	/**
	 * Called from account/register validate() through the OCMOD patch in install.xml.
	 *
	 * @return string Error message, or '' when the mobile number is verified.
	 */
	public function registerValidate() {
		if (!$this->otpEnabled()) {
			return '';
		}

		$this->load->language(self::ROUTE);

		$telephone = isset($this->request->post['telephone']) ? (string)$this->request->post['telephone'] : '';
		$code = isset($this->request->post['corbit_otp_code']) ? (string)$this->request->post['corbit_otp_code'] : '';

		$otp = $this->otp();

		if ($otp->isVerified($telephone)) {
			return '';
		}

		if (trim($code) === '') {
			return $this->language->get('error_otp_required');
		}

		$result = $otp->verify($telephone, $code);

		return $result['success'] ? '' : $this->language->get('error_otp_' . $result['error']);
	}

	/**
	 * Event: catalog/model/account/customer/addCustomer/after
	 */
	public function customerAdd(&$route, &$args, &$output) {
		if (!$this->config->get('module_corbit_sms_status')) {
			return;
		}

		if ($this->otpEnabled()) {
			$this->otp()->clear();
		}

		if (!$this->config->get('module_corbit_sms_register_status')) {
			return;
		}

		$data = isset($args[0]) ? $args[0] : array();

		if (empty($data['telephone'])) {
			return;
		}

		$vars = array(
			'firstname'  => isset($data['firstname']) ? $data['firstname'] : '',
			'lastname'   => isset($data['lastname']) ? $data['lastname'] : '',
			'email'      => isset($data['email']) ? $data['email'] : '',
			'telephone'  => $data['telephone'],
			'store_name' => $this->config->get('config_name'),
			'store_url'  => $this->config->get('config_url')
		);

		try {
			$this->client()->send($data['telephone'], \Corbit\Sms\Client::render((string)$this->config->get('module_corbit_sms_register_text'), $vars), 'register');
		} catch (\Throwable $e) {
			$this->log->write('Corbit SMS: ' . $e->getMessage());
		}
	}

	/**
	 * Event: catalog/view/account/register/after
	 *
	 * Adds the verification code field under the telephone input.
	 */
	public function registerView(&$route, &$data, &$output) {
		if (!$this->otpEnabled() || !is_string($output)) {
			return;
		}

		if (!preg_match('/<input[^>]*\bname="telephone"[^>]*>/i', $output, $match, PREG_OFFSET_CAPTURE)) {
			return;
		}

		$this->load->language(self::ROUTE);

		$view = array(
			'send_url'          => str_replace('&amp;', '&', $this->url->link(self::ROUTE . '/sendOtp', '', true)),
			'entry_otp_code'    => $this->language->get('entry_otp_code'),
			'button_otp_send'   => $this->language->get('button_otp_send'),
			'button_otp_resend' => $this->language->get('button_otp_resend'),
			'text_otp_resend'   => $this->language->get('text_otp_resend'),
			'text_otp_title'    => $this->language->get('text_otp_title')
		);

		$position = $match[0][1] + strlen($match[0][0]);

		$output = substr_replace($output, $this->load->view(self::ROUTE . '_otp', $view), $position, 0);
	}

	/**
	 * AJAX: send a verification code to the posted telephone.
	 */
	public function sendOtp() {
		$this->load->language(self::ROUTE);

		$json = array();

		if (!$this->otpEnabled() || $this->request->server['REQUEST_METHOD'] != 'POST') {
			$json['error'] = $this->language->get('error_otp_gateway');
		} else {
			$telephone = isset($this->request->post['telephone']) ? (string)$this->request->post['telephone'] : '';
			$ip = isset($this->request->server['REMOTE_ADDR']) ? (string)$this->request->server['REMOTE_ADDR'] : '';

			$result = $this->otp()->send($telephone, $ip);

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

	private function orderVars($order_info, $order_status_id) {
		$query = $this->db->query("SELECT `name` FROM `" . DB_PREFIX . "order_status` WHERE `order_status_id` = '" . (int)$order_status_id . "' AND `language_id` = '" . (int)$order_info['language_id'] . "'");

		return array(
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
		);
	}

	private function otpEnabled() {
		return $this->config->get('module_corbit_sms_status') && $this->config->get('module_corbit_sms_otp_status');
	}

	private function otp() {
		return new \Corbit\Sms\Otp($this->client(), $this->db, $this->session->data, array(
			'length'     => $this->config->get('module_corbit_sms_otp_length'),
			'expiry'     => $this->config->get('module_corbit_sms_otp_expiry'),
			'cooldown'   => $this->config->get('module_corbit_sms_otp_cooldown'),
			'hourly'     => $this->config->get('module_corbit_sms_otp_hourly'),
			'daily'      => $this->config->get('module_corbit_sms_otp_daily'),
			'countries'  => $this->config->get('module_corbit_sms_otp_countries'),
			'template'   => $this->config->get('module_corbit_sms_otp_text'),
			'store_name' => $this->config->get('config_name')
		));
	}

	private function client() {
		return new \Corbit\Sms\Client((string)$this->config->get('module_corbit_sms_api_key'), (string)$this->config->get('module_corbit_sms_sender'), $this->db);
	}
}
