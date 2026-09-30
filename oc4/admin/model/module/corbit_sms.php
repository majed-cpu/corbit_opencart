<?php
namespace Opencart\Admin\Model\Extension\Corbit\Module;
class CorbitSms extends \Opencart\System\Engine\Model {
	public const EVENT_CODE = 'corbit_sms';

	public function install(): void {
		$this->db->query("CREATE TABLE IF NOT EXISTS `" . DB_PREFIX . "corbit_sms_log` (
			`log_id` INT(11) NOT NULL AUTO_INCREMENT,
			`numbers` TEXT NOT NULL,
			`message` TEXT NOT NULL,
			`source` VARCHAR(32) NOT NULL,
			`status` TINYINT(1) NOT NULL DEFAULT '0',
			`response` TEXT NOT NULL,
			`date_added` DATETIME NOT NULL,
			PRIMARY KEY (`log_id`),
			KEY `date_added` (`date_added`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

		$this->db->query("CREATE TABLE IF NOT EXISTS `" . DB_PREFIX . "corbit_sms_otp` (
			`otp_id` INT(11) NOT NULL AUTO_INCREMENT,
			`telephone` VARCHAR(32) NOT NULL,
			`ip` VARCHAR(40) NOT NULL,
			`date_added` DATETIME NOT NULL,
			PRIMARY KEY (`otp_id`),
			KEY `telephone` (`telephone`),
			KEY `ip` (`ip`),
			KEY `date_added` (`date_added`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

		$this->load->model('setting/event');

		$separator = version_compare(VERSION, '4.0.2.0', '>=') ? '.' : '|';
		$action = 'extension/corbit/module/corbit_sms' . $separator;

		// OpenCart 4.1 names model method events "customer.addCustomer" instead of "customer/addCustomer".
		$method = version_compare(VERSION, '4.1.0.0', '>=') ? '.' : '/';

		$events = [
			['trigger' => 'catalog/model/checkout/order' . $method . 'addHistory/before', 'action' => $action . 'orderHistoryBefore', 'description' => 'Corbit SMS: remember previous order status'],
			['trigger' => 'catalog/model/checkout/order' . $method . 'addHistory/after', 'action' => $action . 'orderHistoryAfter', 'description' => 'Corbit SMS: new order / order status SMS'],
			['trigger' => 'catalog/model/account/customer' . $method . 'addCustomer/before', 'action' => $action . 'customerAddBefore', 'description' => 'Corbit SMS: require OTP verification on registration'],
			['trigger' => 'catalog/model/account/customer' . $method . 'addCustomer/after', 'action' => $action . 'customerAdd', 'description' => 'Corbit SMS: welcome SMS on registration'],
			['trigger' => 'catalog/view/account/register/after', 'action' => $action . 'registerView', 'description' => 'Corbit SMS: OTP field on the registration form']
		];

		$this->model_setting_event->deleteEventByCode(self::EVENT_CODE);

		foreach ($events as $event) {
			if (version_compare(VERSION, '4.0.2.0', '>=')) {
				$this->model_setting_event->addEvent([
					'code'        => self::EVENT_CODE,
					'description' => $event['description'],
					'trigger'     => $event['trigger'],
					'action'      => $event['action'],
					'status'      => 1,
					'sort_order'  => 0
				]);
			} else {
				$this->model_setting_event->addEvent(self::EVENT_CODE, $event['description'], $event['trigger'], $event['action'], 1, 0);
			}
		}
	}

	public function uninstall(): void {
		$this->load->model('setting/event');

		$this->model_setting_event->deleteEventByCode(self::EVENT_CODE);

		$this->db->query("DROP TABLE IF EXISTS `" . DB_PREFIX . "corbit_sms_log`");
		$this->db->query("DROP TABLE IF EXISTS `" . DB_PREFIX . "corbit_sms_otp`");
	}

	public function getLogs(int $start = 0, int $limit = 20): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "corbit_sms_log` ORDER BY `log_id` DESC LIMIT " . max(0, $start) . "," . max(1, $limit));

		return $query->rows;
	}

	public function getTotalLogs(): int {
		$query = $this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "corbit_sms_log`");

		return (int)$query->row['total'];
	}

	public function clearLogs(): void {
		$this->db->query("TRUNCATE TABLE `" . DB_PREFIX . "corbit_sms_log`");
	}

	/**
	 * @param string $group all | newsletter | customer_group
	 */
	public function getCustomerTelephones(string $group, int $customer_group_id = 0): array {
		$sql = "SELECT DISTINCT `telephone` FROM `" . DB_PREFIX . "customer` WHERE `status` = '1' AND `telephone` != ''";

		if ($group == 'newsletter') {
			$sql .= " AND `newsletter` = '1'";
		} elseif ($group == 'customer_group') {
			$sql .= " AND `customer_group_id` = '" . (int)$customer_group_id . "'";
		}

		$query = $this->db->query($sql);

		return array_column($query->rows, 'telephone');
	}
}
