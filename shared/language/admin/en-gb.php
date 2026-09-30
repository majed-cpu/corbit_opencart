<?php
// Heading
$_['heading_title']             = 'Corbit SMS';

// Text
$_['text_extension']            = 'Extensions';
$_['text_success']              = 'Success: You have modified Corbit SMS settings!';
$_['text_edit']                 = 'Edit Corbit SMS';
$_['text_intro']                = 'Send SMS notifications to your customers through the Corbit gateway. Get your API key and approved sender name from <a href="https://corbit.sa" target="_blank">corbit.sa</a>.';
$_['text_tab_general']          = 'General';
$_['text_tab_order']            = 'Order Notifications';
$_['text_tab_status']           = 'Order Status';
$_['text_tab_customer']         = 'Customers';
$_['text_tab_send']             = 'Send SMS';
$_['text_tab_log']              = 'Log';
$_['text_placeholders']         = 'Available placeholders: {order_id} {firstname} {lastname} {email} {telephone} {total} {status} {store_name} {store_url} {date}';
$_['text_placeholders_customer']= 'Available placeholders: {firstname} {lastname} {email} {telephone} {store_name} {store_url}';
$_['text_status_help']          = 'Enable the statuses that should notify the customer when an order changes to them. Leave the message empty to skip.';
$_['text_test_message']         = 'Corbit SMS test message from your OpenCart store.';
$_['text_test_success']         = 'Test message sent successfully.';
$_['text_balance']              = 'Current balance: %s';
$_['text_send_success']         = 'Message sent to %s of %s numbers.';
$_['text_log_cleared']          = 'Log cleared.';
$_['text_to_custom']            = 'Specific numbers';
$_['text_to_all']               = 'All customers';
$_['text_to_newsletter']        = 'Newsletter subscribers';
$_['text_to_customer_group']    = 'Customer group';
$_['text_confirm_send']         = 'Send this message now?';
$_['text_source_order']         = 'New order (customer)';
$_['text_source_admin']         = 'New order (admin)';
$_['text_source_status']        = 'Order status';
$_['text_source_register']      = 'Registration';
$_['text_source_bulk']          = 'Manual / bulk';
$_['text_source_test']          = 'Test';
$_['text_source_manual']        = 'Manual';
$_['text_characters']           = 'characters';

// Defaults
$_['default_order_customer']    = 'Hi {firstname}, your order #{order_id} with a total of {total} has been received. Thank you for shopping at {store_name}.';
$_['default_order_admin']       = 'New order #{order_id} from {firstname} {lastname} - total {total}.';
$_['default_register']          = 'Welcome {firstname}! Your account at {store_name} has been created.';

// OTP
$_['text_tab_otp']        = 'OTP Verification';
$_['text_otp_help']       = 'Customers must verify their mobile number with a one-time code before creating an account.';
$_['text_otp_protection'] = 'Protection against SMS abuse: codes are limited per number and per IP address, with a waiting period between sends and a daily cap for the whole store.';
$_['text_otp_placeholders'] = 'Available placeholders: {code} {minutes} {store_name}';
$_['text_otp_ocmod']      = 'The OCMOD modification is not applied yet. Go to Extensions > Modifications and click Refresh, otherwise OTP will not be enforced on registration.';
$_['text_source_otp']     = 'OTP';
$_['default_otp']         = 'Your verification code for {store_name} is {code}. Valid for {minutes} minutes.';
$_['entry_otp_status']    = 'Verify mobile on registration';
$_['entry_otp_text']      = 'OTP message';
$_['entry_otp_length']    = 'Code length';
$_['entry_otp_expiry']    = 'Code validity (minutes)';
$_['entry_otp_cooldown']  = 'Wait between sends (seconds)';
$_['entry_otp_hourly']    = 'Max codes per number / IP per hour';
$_['entry_otp_daily']     = 'Max codes per day (whole store)';
$_['entry_otp_countries'] = 'Allowed country codes';
$_['help_otp_countries']  = 'Comma separated, e.g. 966,971. Leave empty to allow all countries (not recommended).';
$_['help_otp_daily']      = '0 = unlimited.';
$_['error_otp_text']      = 'The OTP message must contain {code}!';

// Entry
$_['entry_status']              = 'Status';
$_['entry_api_key']             = 'API Key';
$_['entry_sender']              = 'Sender Name';
$_['entry_admin_telephone']     = 'Admin Mobile Numbers';
$_['entry_test_telephone']      = 'Test Mobile Number';
$_['entry_order_customer']      = 'SMS to customer on new order';
$_['entry_order_admin']         = 'SMS to admin on new order';
$_['entry_message']             = 'Message';
$_['entry_register']            = 'Welcome SMS on registration';
$_['entry_to']                  = 'To';
$_['entry_numbers']             = 'Mobile Numbers';
$_['entry_customer_group']      = 'Customer Group';

// Help
$_['help_sender']               = 'Sender name approved on your Corbit account.';
$_['help_admin_telephone']      = 'Separate multiple numbers with commas.';
$_['help_numbers']              = 'One number per line or comma separated. Saudi numbers like 05xxxxxxxx are converted automatically.';

// Column
$_['column_date']               = 'Date';
$_['column_numbers']            = 'Numbers';
$_['column_message']            = 'Message';
$_['column_source']             = 'Type';
$_['column_status']             = 'Status';
$_['column_response']           = 'Gateway Response';

// Button
$_['button_test']               = 'Send Test';
$_['button_balance']            = 'Check Balance';
$_['button_send']               = 'Send';
$_['button_clear']              = 'Clear Log';

// Error
$_['error_permission']          = 'Warning: You do not have permission to modify Corbit SMS!';
$_['error_warning']             = 'Warning: Please check the form carefully for errors!';
$_['error_api_key']             = 'API key is required!';
$_['error_sender']              = 'Sender name is required!';
$_['error_telephone']           = 'Please enter a valid mobile number!';
$_['error_message']             = 'Message cannot be empty!';
$_['error_numbers']             = 'No valid mobile numbers found!';
$_['error_gateway']             = 'Gateway error: %s';
