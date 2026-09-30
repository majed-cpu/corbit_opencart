<?php
class ModelExtensionModuleCorbitSms extends Model {
	const EVENT_CODE = 'corbit_sms';

	public function install() {
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

		$this->model_setting_event->deleteEventByCode(self::EVENT_CODE);

		$action = 'extension/module/corbit_sms/';

		$events = array(
			'catalog/model/checkout/order/addOrderHistory/before' => 'orderHistoryBefore',
			'catalog/model/checkout/order/addOrderHistory/after'  => 'orderHistoryAfter',
			'catalog/model/account/customer/addCustomer/after'    => 'customerAdd',
			'catalog/view/account/register/after'                 => 'registerView'
		);

		foreach ($events as $trigger => $method) {
			$this->model_setting_event->addEvent(self::EVENT_CODE, $trigger, $action . $method);
		}
	}

	public function uninstall() {
		$this->load->model('setting/event');

		$this->model_setting_event->deleteEventByCode(self::EVENT_CODE);

		$this->db->query("DROP TABLE IF EXISTS `" . DB_PREFIX . "corbit_sms_log`");
		$this->db->query("DROP TABLE IF EXISTS `" . DB_PREFIX . "corbit_sms_otp`");
	}

	public function getLogs($start = 0, $limit = 20) {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "corbit_sms_log` ORDER BY `log_id` DESC LIMIT " . max(0, (int)$start) . "," . max(1, (int)$limit));

		return $query->rows;
	}

	public function getTotalLogs() {
		$query = $this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "corbit_sms_log`");

		return (int)$query->row['total'];
	}

	public function clearLogs() {
		$this->db->query("TRUNCATE TABLE `" . DB_PREFIX . "corbit_sms_log`");
	}

	/**
	 * @param string $group all | newsletter | customer_group
	 */
	public function getCustomerTelephones($group, $customer_group_id = 0) {
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
