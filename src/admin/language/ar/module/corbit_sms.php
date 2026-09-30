<?php
// Heading
$_['heading_title']             = 'رسائل كوربت SMS';

// Text
$_['text_extension']            = 'الإضافات';
$_['text_success']              = 'تم حفظ إعدادات رسائل كوربت بنجاح!';
$_['text_edit']                 = 'تعديل إعدادات رسائل كوربت';
$_['text_intro']                = 'أرسل إشعارات SMS لعملائك عبر بوابة كوربت. احصل على مفتاح API واسم المرسل المعتمد من <a href="https://corbit.sa" target="_blank">corbit.sa</a>.';
$_['text_tab_general']          = 'عام';
$_['text_tab_order']            = 'إشعارات الطلبات';
$_['text_tab_status']           = 'حالات الطلب';
$_['text_tab_customer']         = 'العملاء';
$_['text_tab_send']             = 'إرسال رسالة';
$_['text_tab_log']              = 'السجل';
$_['text_placeholders']         = 'المتغيرات المتاحة: {order_id} {firstname} {lastname} {email} {telephone} {total} {status} {store_name} {store_url} {date}';
$_['text_placeholders_customer']= 'المتغيرات المتاحة: {firstname} {lastname} {email} {telephone} {store_name} {store_url}';
$_['text_status_help']          = 'فعّل الحالات التي يُرسل فيها إشعار للعميل عند تحويل الطلب إليها. اترك الرسالة فارغة لتجاهل الحالة.';
$_['text_test_message']         = 'رسالة تجريبية من متجرك عبر بوابة كوربت.';
$_['text_test_success']         = 'تم إرسال الرسالة التجريبية بنجاح.';
$_['text_balance']              = 'الرصيد الحالي: %s';
$_['text_send_success']         = 'تم الإرسال إلى %s من أصل %s رقم.';
$_['text_log_cleared']          = 'تم مسح السجل.';
$_['text_to_custom']            = 'أرقام محددة';
$_['text_to_all']               = 'جميع العملاء';
$_['text_to_newsletter']        = 'المشتركون في النشرة البريدية';
$_['text_to_customer_group']    = 'مجموعة عملاء';
$_['text_confirm_send']         = 'هل تريد إرسال الرسالة الآن؟';
$_['text_source_order']         = 'طلب جديد (العميل)';
$_['text_source_admin']         = 'طلب جديد (الإدارة)';
$_['text_source_status']        = 'حالة الطلب';
$_['text_source_register']      = 'تسجيل عميل';
$_['text_source_bulk']          = 'إرسال يدوي / جماعي';
$_['text_source_test']          = 'تجربة';
$_['text_source_manual']        = 'يدوي';
$_['text_characters']           = 'حرف';

// Defaults
$_['default_order_customer']    = 'مرحباً {firstname}، تم استلام طلبك رقم {order_id} بإجمالي {total}. شكراً لتسوقك من {store_name}.';
$_['default_order_admin']       = 'طلب جديد رقم {order_id} من {firstname} {lastname} بإجمالي {total}.';
$_['default_register']          = 'أهلاً {firstname}! تم إنشاء حسابك في {store_name} بنجاح.';

// Entry
$_['entry_status']              = 'الحالة';
$_['entry_api_key']             = 'مفتاح API';
$_['entry_sender']              = 'اسم المرسل';
$_['entry_admin_telephone']     = 'جوالات الإدارة';
$_['entry_test_telephone']      = 'رقم جوال للتجربة';
$_['entry_order_customer']      = 'رسالة للعميل عند الطلب الجديد';
$_['entry_order_admin']         = 'رسالة للإدارة عند الطلب الجديد';
$_['entry_message']             = 'نص الرسالة';
$_['entry_register']            = 'رسالة ترحيب عند تسجيل عميل';
$_['entry_to']                  = 'إرسال إلى';
$_['entry_numbers']             = 'أرقام الجوال';
$_['entry_customer_group']      = 'مجموعة العملاء';

// Help
$_['help_sender']               = 'اسم المرسل المعتمد في حسابك لدى كوربت.';
$_['help_admin_telephone']      = 'افصل بين الأرقام بفاصلة.';
$_['help_numbers']              = 'رقم في كل سطر أو مفصولة بفواصل. تُحوَّل الأرقام السعودية مثل 05xxxxxxxx تلقائياً.';

// Column
$_['column_date']               = 'التاريخ';
$_['column_numbers']            = 'الأرقام';
$_['column_message']            = 'الرسالة';
$_['column_source']             = 'النوع';
$_['column_status']             = 'الحالة';
$_['column_response']           = 'رد البوابة';

// Button
$_['button_test']               = 'إرسال تجربة';
$_['button_balance']            = 'عرض الرصيد';
$_['button_send']               = 'إرسال';
$_['button_clear']              = 'مسح السجل';

// Error
$_['error_permission']          = 'تحذير: ليس لديك صلاحية تعديل إعدادات رسائل كوربت!';
$_['error_warning']             = 'تحذير: يرجى مراجعة الحقول والتأكد من صحتها!';
$_['error_api_key']             = 'مفتاح API مطلوب!';
$_['error_sender']              = 'اسم المرسل مطلوب!';
$_['error_telephone']           = 'يرجى إدخال رقم جوال صحيح!';
$_['error_message']             = 'نص الرسالة لا يمكن أن يكون فارغاً!';
$_['error_numbers']             = 'لا توجد أرقام جوال صحيحة!';
$_['error_gateway']             = 'خطأ من البوابة: %s';
