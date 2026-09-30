# Corbit SMS for OpenCart

إضافة مجانية ومفتوحة المصدر لربط متجر OpenCart ببوابة الرسائل النصية من [كوربت](https://corbit.sa).

A free, open-source OpenCart extension that sends SMS notifications through the [Corbit](https://corbit.sa) gateway (`https://api.mobile.net.sa`).

## المزايا / Features

- رسالة للعميل عند إنشاء طلب جديد، ورسالة لجوال الإدارة (عدة أرقام) — SMS to customer and store admins on new orders
- رسالة مخصصة لكل حالة من حالات الطلب (تم الشحن، مكتمل...) — Custom SMS per order status
- رسالة ترحيب عند تسجيل عميل جديد — Welcome SMS on customer registration
- إرسال يدوي أو جماعي: أرقام محددة، كل العملاء، مشتركو النشرة، مجموعة عملاء — Manual / bulk send
- إرسال تجربة وعرض الرصيد من لوحة التحكم — Test send and balance check
- سجل كامل للرسائل مع رد البوابة — Full message log with gateway responses
- تحويل تلقائي للأرقام السعودية (05xxxxxxxx ← 9665xxxxxxxx) ودعم الأرقام العربية — Automatic Saudi number normalisation
- عدّاد أحرف وأجزاء الرسالة (70 حرفاً عربياً / 160 لاتينياً) — Character / SMS part counter
- واجهة عربية وإنجليزية — Arabic and English admin UI

## التوافق / Compatibility

OpenCart 4.0.x – 4.1.x, PHP 8.0+ with cURL.

## التثبيت / Installation

1. حمّل الملف `corbit.ocmod.zip` (لا تغيّر اسمه).
2. من لوحة التحكم: **Extensions › Installer** ثم ارفع الملف واضغط تثبيت.
3. **Extensions › Extensions** ثم اختر **Modules** وثبّت **Corbit SMS** ثم اضغط تعديل.
4. أدخل مفتاح API واسم المرسل المعتمد، وفعّل الإضافة واحفظ.

1. Download `corbit.ocmod.zip` (keep the file name — it becomes the extension code).
2. Admin › **Extensions › Installer** → upload.
3. **Extensions › Extensions › Modules** → install **Corbit SMS** → edit.
4. Enter your API key and approved sender name, enable, and save.

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

## البناء من المصدر / Building

```sh
./build.sh   # produces dist/corbit.ocmod.zip
```

## بنية المشروع / Structure

```
src/
├── install.json
├── admin/      controller, model, language (ar, en-gb), view
├── catalog/    event handlers (order history, customer registration)
└── system/library/corbit.php   Corbit API client (the only file that talks to the gateway)
```

## الترخيص / License

GPL-3.0 — see [LICENSE](LICENSE).
