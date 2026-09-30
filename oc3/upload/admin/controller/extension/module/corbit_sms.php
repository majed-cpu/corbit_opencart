<?php
require_once(DIR_SYSTEM . 'library/corbit/sms/client.php');
class ControllerExtensionModuleCorbitSms extends Controller {
	const ROUTE = 'extension/module/corbit_sms';

	private $error = array();

	public function index() {
		$this->load->language(self::ROUTE);

		$this->document->setTitle($this->language->get('heading_title'));

		$this->load->model('setting/setting');

		$token = 'user_token=' . $this->session->data['user_token'];

		if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
			$this->model_setting_setting->editSetting('module_corbit_sms', $this->request->post);

			$this->session->data['success'] = $this->language->get('text_success');

			$this->response->redirect($this->url->link(self::ROUTE, $token, true));
		}

		foreach (array('warning', 'api_key', 'sender', 'otp_text') as $key) {
			$data['error_' . $key] = isset($this->error[$key]) ? $this->error[$key] : '';
		}

		if (isset($this->session->data['success'])) {
			$data['success'] = $this->session->data['success'];

			unset($this->session->data['success']);
		} else {
			$data['success'] = '';
		}

		$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', $token, true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_extension'),
			'href' => $this->url->link('marketplace/extension', $token . '&type=module', true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('heading_title'),
			'href' => $this->url->link(self::ROUTE, $token, true)
		);

		$data['action'] = $this->url->link(self::ROUTE, $token, true);
		$data['cancel'] = $this->url->link('marketplace/extension', $token . '&type=module', true);
		$data['test'] = $this->url->link(self::ROUTE . '/test', $token, true);
		$data['balance'] = $this->url->link(self::ROUTE . '/balance', $token, true);
		$data['send'] = $this->url->link(self::ROUTE . '/send', $token, true);
		$data['log'] = $this->url->link(self::ROUTE . '/log', $token, true);
		$data['clear_log'] = $this->url->link(self::ROUTE . '/clearLog', $token, true);

		$defaults = array(
			'status'                => 0,
			'api_key'               => '',
			'sender'                => '',
			'admin_telephone'       => $this->config->get('config_telephone'),
			'order_customer_status' => 1,
			'order_customer_text'   => $this->language->get('default_order_customer'),
			'order_admin_status'    => 1,
			'order_admin_text'      => $this->language->get('default_order_admin'),
			'register_status'       => 0,
			'register_text'         => $this->language->get('default_register'),
			'otp_status'            => 0,
			'otp_text'              => $this->language->get('default_otp'),
			'otp_length'            => 4,
			'otp_expiry'            => 5,
			'otp_cooldown'          => 60,
			'otp_hourly'            => 5,
			'otp_daily'             => 300,
			'otp_countries'         => '966',
			'order_status'          => array()
		);

		foreach ($defaults as $key => $default) {
			$name = 'module_corbit_sms_' . $key;

			if (isset($this->request->post[$name])) {
				$data[$name] = $this->request->post[$name];
			} elseif ($this->config->get($name) !== null) {
				$data[$name] = $this->config->get($name);
			} else {
				$data[$name] = $default;
			}
		}

		$this->load->model('localisation/order_status');

		$data['order_statuses'] = array();

		$templates = (array)$data['module_corbit_sms_order_status'];

		foreach ($this->model_localisation_order_status->getOrderStatuses() as $order_status) {
			$id = $order_status['order_status_id'];

			$data['order_statuses'][] = array(
				'order_status_id' => $id,
				'name'            => $order_status['name'],
				'status'          => !empty($templates[$id]['status']),
				'text'            => isset($templates[$id]['text']) ? $templates[$id]['text'] : ''
			);
		}

		$this->load->model('customer/customer_group');

		$data['customer_groups'] = $this->model_customer_customer_group->getCustomerGroups();

		$data['otp_fields'] = array();

		foreach (array('length', 'expiry', 'cooldown', 'hourly', 'daily') as $field) {
			$data['otp_fields'][] = array(
				'name'  => 'module_corbit_sms_otp_' . $field,
				'id'    => 'input-otp-' . $field,
				'label' => $this->language->get('entry_otp_' . $field),
				'value' => $data['module_corbit_sms_otp_' . $field],
				'min'   => $field == 'length' ? 4 : 0,
				'max'   => $field == 'length' ? 8 : '',
				'help'  => $field == 'daily' ? $this->language->get('help_otp_daily') : ''
			);
		}

		// OTP enforcement on registration needs the OCMOD patch to be applied.
		$data['ocmod_missing'] = $data['module_corbit_sms_otp_status'] && !$this->isModificationApplied();

		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view(self::ROUTE, $data));
	}

	public function test() {
		$this->load->language(self::ROUTE);

		$json = array();

		$telephone = isset($this->request->post['telephone']) ? (string)$this->request->post['telephone'] : '';

		if (!$this->user->hasPermission('modify', self::ROUTE)) {
			$json['error'] = $this->language->get('error_permission');
		} elseif (!\Corbit\Sms\Client::normalizeNumber($telephone)) {
			$json['error'] = $this->language->get('error_telephone');
		} else {
			$result = $this->client()->send($telephone, $this->language->get('text_test_message'), 'test');

			if ($result['success']) {
				$json['success'] = $this->language->get('text_test_success');
			} else {
				$json['error'] = sprintf($this->language->get('error_gateway'), $result['message']);
			}
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	public function balance() {
		$this->load->language(self::ROUTE);

		$json = array();

		if (!$this->user->hasPermission('access', self::ROUTE)) {
			$json['error'] = $this->language->get('error_permission');
		} else {
			$result = $this->client()->getBalance();

			if ($result['success']) {
				$json['success'] = sprintf($this->language->get('text_balance'), isset($result['balance']) ? $result['balance'] : '-');
			} else {
				$json['error'] = sprintf($this->language->get('error_gateway'), $result['message']);
			}
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	public function send() {
		$this->load->language(self::ROUTE);

		$json = array();

		$to = isset($this->request->post['to']) ? $this->request->post['to'] : 'custom';
		$message = isset($this->request->post['message']) ? trim($this->request->post['message']) : '';

		if (!$this->user->hasPermission('modify', self::ROUTE)) {
			$json['error'] = $this->language->get('error_permission');
		} elseif ($message === '') {
			$json['error'] = $this->language->get('error_message');
		}

		if (!$json) {
			if ($to == 'custom') {
				$numbers = preg_split('/[\s,;]+/', isset($this->request->post['numbers']) ? $this->request->post['numbers'] : '', -1, PREG_SPLIT_NO_EMPTY);
			} else {
				$this->load->model(self::ROUTE);

				$customer_group_id = isset($this->request->post['customer_group_id']) ? (int)$this->request->post['customer_group_id'] : 0;

				$numbers = $this->model_extension_module_corbit_sms->getCustomerTelephones($to, $customer_group_id);
			}

			$numbers = array_values(array_unique(array_filter(array_map(array('\Corbit\Sms\Client', 'normalizeNumber'), $numbers))));

			if (!$numbers) {
				$json['error'] = $this->language->get('error_numbers');
			} else {
				$sent = 0;
				$errors = array();

				// Send in batches to keep request size reasonable.
				foreach (array_chunk($numbers, 100) as $batch) {
					$result = $this->client()->send($batch, $message, 'bulk');

					if ($result['success']) {
						$sent += count($batch);
					} else {
						$errors[] = $result['message'];
					}
				}

				if ($sent) {
					$json['success'] = sprintf($this->language->get('text_send_success'), $sent, count($numbers));
				}

				if ($errors) {
					$json['error'] = sprintf($this->language->get('error_gateway'), implode(' | ', array_unique($errors)));
				}
			}
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	public function log() {
		$this->load->language(self::ROUTE);

		$page = isset($this->request->get['page']) ? max(1, (int)$this->request->get['page']) : 1;
		$limit = 20;

		$this->load->model(self::ROUTE);

		$data['logs'] = array();

		foreach ($this->model_extension_module_corbit_sms->getLogs(($page - 1) * $limit, $limit) as $result) {
			$data['logs'][] = array(
				'numbers'    => $result['numbers'],
				'message'    => $result['message'],
				'source'     => $this->language->get('text_source_' . $result['source']),
				'status'     => (bool)$result['status'],
				'response'   => $result['response'],
				'date_added' => date($this->language->get('datetime_format'), strtotime($result['date_added']))
			);
		}

		$total = $this->model_extension_module_corbit_sms->getTotalLogs();

		$pagination = new Pagination();
		$pagination->total = $total;
		$pagination->page = $page;
		$pagination->limit = $limit;
		$pagination->url = $this->url->link(self::ROUTE . '/log', 'user_token=' . $this->session->data['user_token'] . '&page={page}', true);

		$data['pagination'] = $pagination->render();

		$data['results'] = sprintf($this->language->get('text_pagination'), $total ? (($page - 1) * $limit) + 1 : 0, ((($page - 1) * $limit) > ($total - $limit)) ? $total : ((($page - 1) * $limit) + $limit), $total, ceil($total / $limit));

		$this->response->setOutput($this->load->view('extension/module/corbit_sms_log', $data));
	}

	public function clearLog() {
		$this->load->language(self::ROUTE);

		$json = array();

		if (!$this->user->hasPermission('modify', self::ROUTE)) {
			$json['error'] = $this->language->get('error_permission');
		} else {
			$this->load->model(self::ROUTE);

			$this->model_extension_module_corbit_sms->clearLogs();

			$json['success'] = $this->language->get('text_log_cleared');
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	public function install() {
		$this->load->model(self::ROUTE);

		$this->model_extension_module_corbit_sms->install();
	}

	public function uninstall() {
		$this->load->model(self::ROUTE);

		$this->model_extension_module_corbit_sms->uninstall();
	}

	protected function validate() {
		if (!$this->user->hasPermission('modify', self::ROUTE)) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		$post = $this->request->post;

		if (!empty($post['module_corbit_sms_status'])) {
			if (empty($post['module_corbit_sms_api_key']) || trim($post['module_corbit_sms_api_key']) === '') {
				$this->error['api_key'] = $this->language->get('error_api_key');
			}

			if (empty($post['module_corbit_sms_sender']) || trim($post['module_corbit_sms_sender']) === '') {
				$this->error['sender'] = $this->language->get('error_sender');
			}
		}

		if (!empty($post['module_corbit_sms_otp_status']) && strpos(isset($post['module_corbit_sms_otp_text']) ? $post['module_corbit_sms_otp_text'] : '', '{code}') === false) {
			$this->error['otp_text'] = $this->language->get('error_otp_text');
		}

		if ($this->error && !isset($this->error['warning'])) {
			$this->error['warning'] = $this->language->get('error_warning');
		}

		return !$this->error;
	}

	private function isModificationApplied() {
		if (!defined('DIR_MODIFICATION')) {
			return true;
		}

		$file = DIR_MODIFICATION . 'catalog/controller/account/register.php';

		return is_file($file) && strpos(file_get_contents($file), 'corbit_sms') !== false;
	}

	private function client() {
		// Allow testing with unsaved values from the form.
		$api_key = isset($this->request->post['module_corbit_sms_api_key']) ? $this->request->post['module_corbit_sms_api_key'] : (string)$this->config->get('module_corbit_sms_api_key');
		$sender = isset($this->request->post['module_corbit_sms_sender']) ? $this->request->post['module_corbit_sms_sender'] : (string)$this->config->get('module_corbit_sms_sender');

		return new \Corbit\Sms\Client($api_key, $sender, $this->db);
	}
}
