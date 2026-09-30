<?php
namespace Opencart\Catalog\Controller\Extension\Corbit\Module;
if (!class_exists('\\Opencart\\System\\Library\\Extension\\Corbit\\Corbit')) {
	require_once(DIR_EXTENSION . 'corbit/system/library/corbit.php');
}
use Opencart\System\Library\Extension\Corbit\Corbit;
class CorbitSms extends \Opencart\System\Engine\Controller {
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
					$this->client()->send($order_info['telephone'], Corbit::render((string)$this->config->get('module_corbit_sms_order_customer_text'), $vars), 'order');
				}

				if ($this->config->get('module_corbit_sms_order_admin_status')) {
					$admin_numbers = preg_split('/[\s,;]+/', (string)$this->config->get('module_corbit_sms_admin_telephone'), -1, PREG_SPLIT_NO_EMPTY);

					$this->client()->send($admin_numbers, Corbit::render((string)$this->config->get('module_corbit_sms_order_admin_text'), $vars), 'admin');
				}
			} else {
				$templates = (array)$this->config->get('module_corbit_sms_order_status');

				if (!empty($templates[$order_status_id]['status']) && trim($templates[$order_status_id]['text'] ?? '') !== '') {
					$this->client()->send($order_info['telephone'], Corbit::render($templates[$order_status_id]['text'], $vars), 'status');
				}
			}
		} catch (\Throwable $e) {
			// Never interrupt checkout because of SMS.
			$this->log->write('Corbit SMS: ' . $e->getMessage());
		}
	}

	/**
	 * Event: catalog/model/account/customer/addCustomer/after
	 */
	public function customerAdd(string &$route, array &$args, mixed &$output): void {
		if (!$this->config->get('module_corbit_sms_status') || !$this->config->get('module_corbit_sms_register_status')) {
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
			$this->client()->send($data['telephone'], Corbit::render((string)$this->config->get('module_corbit_sms_register_text'), $vars), 'register');
		} catch (\Throwable $e) {
			$this->log->write('Corbit SMS: ' . $e->getMessage());
		}
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

	private function client(): Corbit {
		return new Corbit((string)$this->config->get('module_corbit_sms_api_key'), (string)$this->config->get('module_corbit_sms_sender'), $this->db);
	}
}
