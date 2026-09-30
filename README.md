# Corbit SMS for OpenCart

إضافة مجانية ومفتوحة المصدر لربط متجر OpenCart ببوابة الرسائل النصية من [كوربت](https://corbit.sa).

A free, open-source OpenCart extension that sends SMS notifications and OTP codes through the [Corbit](https://corbit.sa) gateway (`https://api.mobile.net.sa`).

## المزايا / Features

- رسالة للعميل عند إنشاء طلب جديد، ورسالة لجوال الإدارة (عدة أرقام) — SMS to customer and store admins on new orders
- رسالة مخصصة لكل حالة من حالات الطلب (تم الشحن، مكتمل...) — Custom SMS per order status
- رسالة ترحيب عند تسجيل عميل جديد — Welcome SMS on customer registration
- **التحقق من الجوال برمز OTP عند التسجيل** — **OTP mobile verification on registration**
- إرسال يدوي أو جماعي: أرقام محددة، كل العملاء، مشتركو النشرة، مجموعة عملاء — Manual / bulk send
- إرسال تجربة وعرض الرصيد من لوحة التحكم — Test send and balance check
- سجل كامل للرسائل مع رد البوابة (رموز OTP تُحفظ مخفية) — Message log with gateway responses (OTP codes are masked)
- تحويل تلقائي للأرقام السعودية (05xxxxxxxx ← 9665xxxxxxxx) ودعم الأرقام العربية — Automatic Saudi number normalisation, Arabic-Indic digits
- عدّاد أحرف وأجزاء الرسالة (70 حرفاً عربياً / 160 لاتينياً) — Character / SMS part counter
- واجهة عربية وإنجليزية — Arabic and English

## التوافق / Compatibility

| OpenCart | الملف / Package | PHP |
|---|---|---|
| 4.0.x – 4.1.x | `opencart-4/corbit.ocmod.zip` | 8.0+ |
| 3.0.x | `opencart-3/corbit_sms.ocmod.zip` | 7.1+ |

cURL مطلوب / cURL required.

## التثبيت / Installation

### OpenCart 4

1. حمّل `corbit.ocmod.zip` (لا تغيّر اسم الملف).
2. **Extensions › Installer** ← ارفع الملف ثم اضغط تثبيت.
3. **Extensions › Extensions › Modules** ← ثبّت **Corbit SMS** ثم تعديل.
4. أدخل مفتاح API واسم المرسل المعتمد، فعّل الإضافة واحفظ.

> لكي يعمل التحقق OTP يجب أن يكون حقل الجوال ظاهراً في نموذج التسجيل. إن لم يكن ظاهراً تضيفه الإضافة تلقائياً.

### OpenCart 3

1. **Extensions › Installer** ← ارفع `corbit_sms.ocmod.zip`.
2. **Extensions › Modifications** ← اضغط **Refresh** (ضروري لتفعيل التحقق OTP).
3. **Extensions › Extensions › Modules** ← ثبّت **Corbit SMS** ثم تعديل.
4. أدخل مفتاح API واسم المرسل، فعّل الإضافة واحفظ.

## التحقق OTP / OTP verification

عند التفعيل يظهر في صفحة التسجيل حقل «رمز التحقق» وزر «إرسال الرمز» تحت حقل الجوال، ولا يُنشأ الحساب حتى يُدخل العميل الرمز الصحيح.

When enabled, the registration page shows a "Send code" button and a code field under the telephone input; the account is only created after the correct code is entered.

**الحماية من إساءة الاستخدام (SMS pumping) / Abuse protection:**

| الإعداد / Setting | الافتراضي / Default |
|---|---|
| عدد أرقام الرمز / Code length | 4 |
| صلاحية الرمز / Code validity | 5 دقائق / minutes |
| الانتظار بين كل إرسال (لكل رقم و IP) / Wait between sends (per number and IP) | 60 ثانية / seconds |
| الحد في الساعة لكل رقم ولكل IP / Hourly limit per number and per IP | 5 |
| الحد اليومي للمتجر / Daily cap for the store | 300 |
| الدول المسموحة / Allowed countries | 966 |
| المحاولات الخاطئة قبل طلب رمز جديد / Wrong attempts before a new code is needed | 5 |

الرمز لا يُحفظ نصاً صريحاً: يُخزَّن في الجلسة كبصمة HMAC، ويظهر في السجل مخفياً (****).
The code is never stored in plain text: the session holds an HMAC, and the log shows it masked.

## المتغيرات في نص الرسالة / Message placeholders

| Placeholder | الوصف |
|---|---|
| `{order_id}` | رقم الطلب |
| `{firstname}` `{lastname}` | اسم العميل |
| `{email}` `{telephone}` | بريد وجوال العميل |
| `{total}` | إجمالي الطلب بالعملة |
| `{status}` | اسم حالة الطلب |
| `{store_name}` `{store_url}` | اسم ورابط المتجر |
| `{date}` | تاريخ الطلب |
| `{code}` `{minutes}` | رمز التحقق ومدة صلاحيته (رسالة OTP) |

## البناء من المصدر / Building

```sh
./build.sh   # dist/opencart-4/corbit.ocmod.zip + dist/opencart-3/corbit_sms.ocmod.zip
```

## بنية المشروع / Structure

```
shared/                        مشترك بين الإصدارين / used by both builds
├── library/corbit/sms/
│   ├── client.php             Corbit API client (the only file that talks to the gateway)
│   └── otp.php                OTP engine: codes, rate limits, verification
└── language/{admin,catalog}/{ar,en-gb}.php
oc4/                           OpenCart 4.x extension (admin, catalog, install.json)
oc3/                           OpenCart 3.0.x extension (upload/, install.xml OCMOD)
tests/                         OTP engine tests + mock gateway
```

## الاختبار / Testing

For development, point the extension at a sandbox or mock gateway by adding this to `config.php` and `admin/config.php`:

```php
define('CORBIT_SMS_BASE_URL', 'http://127.0.0.1:8099');
```

```sh
php -S 127.0.0.1:8099 -t tests/mock-gateway &
DB_USER=root DB_PASS= DB_NAME=otptest php tests/otp_test.php
```

## الترخيص / License

GPL-3.0 — see [LICENSE](LICENSE).
