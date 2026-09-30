<?php
namespace Opencart\Admin\Controller\Extension\Corbit\Module;
if (!class_exists('\\Opencart\\System\\Library\\Extension\\Corbit\\Corbit')) {
	require_once(DIR_EXTENSION . 'corbit/system/library/corbit.php');
}
class CorbitSms extends \Opencart\System\Engine\Controller {
	private const ROUTE = 'extension/corbit/module/corbit_sms';

	public function index(): void {
		$this->load->language(self::ROUTE);

		$this->document->setTitle($this->language->get('heading_title'));

		$separator = $this->separator();
		$token = 'user_token=' . $this->session->data['user_token'];

		$data['breadcrumbs'] = [];

		$data['breadcrumbs'][] = [
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', $token)
		];

		$data['breadcrumbs'][] = [
			'text' => $this->language->get('text_extension'),
			'href' => $this->url->link('marketplace/extension', $token . '&type=module')
		];

		$data['breadcrumbs'][] = [
			'text' => $this->language->get('heading_title'),
			'href' => $this->url->link(self::ROUTE, $token)
		];

		$data['save'] = $this->url->link(self::ROUTE . $separator . 'save', $token);
		$data['back'] = $this->url->link('marketplace/extension', $token . '&type=module');
		$data['test'] = $this->url->link(self::ROUTE . $separator . 'test', $token);
		$data['balance'] = $this->url->link(self::ROUTE . $separator . 'balance', $token);
		$data['send'] = $this->url->link(self::ROUTE . $separator . 'send', $token);
		$data['log'] = $this->url->link(self::ROUTE . $separator . 'log', $token);
		$data['clear_log'] = $this->url->link(self::ROUTE . $separator . 'clearLog', $token);

		$defaults = [
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
			'order_status'          => []
		];

		foreach ($defaults as $key => $default) {
			$value = $this->config->get('module_corbit_sms_' . $key);

			$data['module_corbit_sms_' . $key] = $value !== null ? $value : $default;
		}

		$this->load->model('localisation/order_status');

		$data['order_statuses'] = $this->model_localisation_order_status->getOrderStatuses();

		$this->load->model('customer/customer_group');

		$data['customer_groups'] = $this->model_customer_customer_group->getCustomerGroups();

		$data['user_token'] = $this->session->data['user_token'];

		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view(self::ROUTE, $data));
	}

	public function save(): void {
		$this->load->language(self::ROUTE);

		$json = [];

		if (!$this->user->hasPermission('modify', self::ROUTE)) {
			$json['error']['warning'] = $this->language->get('error_permission');
		}

		$post = $this->request->post;

		if (!empty($post['module_corbit_sms_status'])) {
			if (trim($post['module_corbit_sms_api_key'] ?? '') === '') {
				$json['error']['api_key'] = $this->language->get('error_api_key');
			}

			if (trim($post['module_corbit_sms_sender'] ?? '') === '') {
				$json['error']['sender'] = $this->language->get('error_sender');
			}
		}

		if (isset($json['error']) && !isset($json['error']['warning'])) {
			$json['error']['warning'] = $this->language->get('error_warning');
		}

		if (!$json) {
			$this->load->model('setting/setting');

			$this->model_setting_setting->editSetting('module_corbit_sms', $post);

			$json['success'] = $this->language->get('text_success');
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	public function test(): void {
		$this->load->language(self::ROUTE);

		$json = [];

		if (!$this->user->hasPermission('modify', self::ROUTE)) {
			$json['error'] = $this->language->get('error_permission');
		} elseif (!\Opencart\System\Library\Extension\Corbit\Corbit::normalizeNumber($this->request->post['telephone'] ?? '')) {
			$json['error'] = $this->language->get('error_telephone');
		} else {
			$result = $this->client()->send($this->request->post['telephone'], $this->language->get('text_test_message'), 'test');

			if ($result['success']) {
				$json['success'] = $this->language->get('text_test_success');
			} else {
				$json['error'] = sprintf($this->language->get('error_gateway'), $result['message']);
			}
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	public function balance(): void {
		$this->load->language(self::ROUTE);

		$json = [];

		if (!$this->user->hasPermission('access', self::ROUTE)) {
			$json['error'] = $this->language->get('error_permission');
		} else {
			$result = $this->client()->getBalance();

			if ($result['success']) {
				$json['success'] = sprintf($this->language->get('text_balance'), $result['balance'] ?? '-');
			} else {
				$json['error'] = sprintf($this->language->get('error_gateway'), $result['message']);
			}
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	public function send(): void {
		$this->load->language(self::ROUTE);

		$json = [];

		$to = $this->request->post['to'] ?? 'custom';
		$message = trim($this->request->post['message'] ?? '');

		if (!$this->user->hasPermission('modify', self::ROUTE)) {
			$json['error'] = $this->language->get('error_permission');
		} elseif ($message === '') {
			$json['error'] = $this->language->get('error_message');
		}

		if (!$json) {
			if ($to == 'custom') {
				$numbers = preg_split('/[\s,;]+/', $this->request->post['numbers'] ?? '', -1, PREG_SPLIT_NO_EMPTY);
			} else {
				$this->load->model(self::ROUTE);

				$numbers = $this->model_extension_corbit_module_corbit_sms->getCustomerTelephones($to, (int)($this->request->post['customer_group_id'] ?? 0));
			}

			$numbers = array_values(array_unique(array_filter(array_map([\Opencart\System\Library\Extension\Corbit\Corbit::class, 'normalizeNumber'], $numbers))));

			if (!$numbers) {
				$json['error'] = $this->language->get('error_numbers');
			} else {
				$sent = 0;
				$errors = [];

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

	public function log(): void {
		$this->load->language(self::ROUTE);

		$this->response->setOutput($this->getLog());
	}

	private function getLog(): string {
		$page = max(1, (int)($this->request->get['page'] ?? 1));
		$limit = 20;

		$this->load->model(self::ROUTE);

		$data['logs'] = [];

		foreach ($this->model_extension_corbit_module_corbit_sms->getLogs(($page - 1) * $limit, $limit) as $result) {
			$data['logs'][] = [
				'numbers'    => $result['numbers'],
				'message'    => $result['message'],
				'source'     => $this->language->get('text_source_' . $result['source']),
				'status'     => (bool)$result['status'],
				'response'   => $result['response'],
				'date_added' => date($this->language->get('datetime_format'), strtotime($result['date_added']))
			];
		}

		$total = $this->model_extension_corbit_module_corbit_sms->getTotalLogs();

		$data['pagination'] = $this->load->controller('common/pagination', [
			'total' => $total,
			'page'  => $page,
			'limit' => $limit,
			'url'   => $this->url->link(self::ROUTE . $this->separator() . 'log', 'user_token=' . $this->session->data['user_token'] . '&page={page}')
		]);

		$data['results'] = sprintf($this->language->get('text_pagination'), $total ? (($page - 1) * $limit) + 1 : 0, ((($page - 1) * $limit) > ($total - $limit)) ? $total : ((($page - 1) * $limit) + $limit), $total, ceil($total / $limit));

		return $this->load->view('extension/corbit/module/corbit_sms_log', $data);
	}

	public function clearLog(): void {
		$this->load->language(self::ROUTE);

		$json = [];

		if (!$this->user->hasPermission('modify', self::ROUTE)) {
			$json['error'] = $this->language->get('error_permission');
		} else {
			$this->load->model(self::ROUTE);

			$this->model_extension_corbit_module_corbit_sms->clearLogs();

			$json['success'] = $this->language->get('text_log_cleared');
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	public function install(): void {
		if ($this->user->hasPermission('modify', 'extension/module')) {
			$this->load->model(self::ROUTE);

			$this->model_extension_corbit_module_corbit_sms->install();
		}
	}

	public function uninstall(): void {
		if ($this->user->hasPermission('modify', 'extension/module')) {
			$this->load->model(self::ROUTE);

			$this->model_extension_corbit_module_corbit_sms->uninstall();
		}
	}

	private function client(): \Opencart\System\Library\Extension\Corbit\Corbit {
		// Allow testing with unsaved values from the form.
		$api_key = $this->request->post['module_corbit_sms_api_key'] ?? (string)$this->config->get('module_corbit_sms_api_key');
		$sender = $this->request->post['module_corbit_sms_sender'] ?? (string)$this->config->get('module_corbit_sms_sender');

		return new \Opencart\System\Library\Extension\Corbit\Corbit($api_key, $sender, $this->db);
	}

	private function separator(): string {
		return version_compare(VERSION, '4.0.2.0', '>=') ? '.' : '|';
	}
}
