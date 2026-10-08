# رفع «سكول بت» على متجر كروم — ما يُلصق في كل خانة

الحزمة: `schoolbit-1.4-store.zip` — ارفعها هي فقط.

---

## ١) إعدادات الحساب (Account → Settings)

**Trader declaration:** اختر **This is a trader account** — الإضافة منتجٌ تجاري
لشركة. واختيار non-trader لشركة إقرارٌ غير صحيح، وقد يُعلَّق بسببه الحساب.

بيانات التاجر (تظهر علناً لمستخدمي أوروبا فقط، وهي منشورة أصلاً على corbit.sa):

| الخانة | القيمة |
|---|---|
| Publisher name | Orbit Technology — أو: كوربت - المدار |
| Legal name | شركة المدار |
| Address | المدينة المنورة، حي الراية، طريق الملك عبدالله بن عبدالعزيز، مبنى 8443، الرمز البريدي 42312، المملكة العربية السعودية |
| Phone | +966 920006900 |
| Email | info@corbit.sa |

وفعّل التحقق بخطوتين (2-Step Verification) على حساب Google نفسه، فالنشر مشروطٌ به.

---

## ٢) بطاقة بيانات المتجر (Store listing)

**الوصف المفصّل (Description):**

```
«سكول بت» مساعدٌ لإداريي المدارس ومعلميها في المملكة العربية السعودية، يعمل داخل منصتي «نور» و«مدرستي» ويختصر الأعمال المتكررة فيهما.

أبرز ما يقدّمه:
• تحديث بيانات الطلاب من مدرستي، وإضافة الطلاب من نور إلى مدرستي بملف الإرشاد الطلابي.
• تقارير مدرستي تُعرض وتُطبع وتُصدَّر إلى Excel داخل الإضافة: تحضير الدروس، المتابعة والإحصائيات الأسبوعية للمعلمين، التقرير التراكمي، الخطة الأسبوعية، الواجبات والاختبارات والأنشطة، أداء الطلاب الشامل، دخول الطلاب، الطلاب غير المفعّلين، غياب الحصص، الحصص المجمّع.
• رصد غياب اليوم يدوياً وطباعته، ومصمم بطاقات وشهادات وخطابات للطلاب والمعلمين، ونماذج مدرسية للطباعة.
• في نور: ربط حساب الرسائل بـ «Corbit - المدار» (عرض الرصيد وأسماء المرسلين المعتمدة)، رصد الغياب اليومي، رصد السلوك الإيجابي، إنذارات الغياب لأولياء الأمور، تصدير بيانات أولياء الأمور، وأزرار تصدير أي تقرير (Excel / Word / PDF).
• إرسال رسائل نصية لأولياء الأمور من داخل التقارير عبر حساب المدرسة في بوابة رسائل كوربت sms.corbit.sa (اختياري، لمن لديه حساب).
• ربط المدرسة بنظام «سكول بت»: قراءة بيانات الطلاب والمعلمين من ملفات نور المصدَّرة، ورفع الغياب المعتمد إلى نور.

الخصوصية:
تعمل الإضافة داخل جلسة المستخدم المفتوحة في نور ومدرستي، ولا تطّلع على كلمة مرورهما ولا ترسلها إلى أي جهة. ولا تخرج البيانات من المتصفح إلا إلى خدمتين تابعتين لشركة المدار، وبطلبٍ من المستخدم: بوابة الرسائل النصية، ونظام سكول بت إن فعّلت المدرسة الربط.

الدعم الفني:
على مدار الساعة 24/7، اتصالاً وواتساب، على الرقم الموحّد 920006900.

تنبيه:
«سكول بت» منتجٌ مستقل من تطوير شركة المدار (كوربت)، وليس تابعاً لوزارة التعليم ولا لمنصتي نور ومدرستي.
```

| الخانة | القيمة |
|---|---|
| Category | Education (التعليم) |
| Language | Arabic (العربية) |
| Official URL | https://corbit.sa — يشترط توثيق النطاق في Google Search Console بالحساب نفسه |
| Support URL | https://corbit.sa/contact — والدعم الفني 920006900 (اتصال وواتساب 24/7) |
| Screenshots | 1280×800 — الخمسة في مجلد `store-assets`، كلها مركّبة ولا تحوي بيانات طلاب حقيقية |
| Small promo tile | 440×280 — `store-assets/promo-440x280.png` |
| Marquee promo tile | 1400×560 — `store-assets/promo-1400x560.png` |

---

## ٣) الخصوصية (Privacy practices) — بالإنجليزية لأن المراجع يقرؤها

**Single purpose description:**

```
schoolBit is an assistant for school staff in Saudi Arabia that works inside the Ministry of Education's Noor (noor.moe.gov.sa) and Madrasati (schools.madrasati.sa) web platforms. It automates repetitive data-entry and reporting tasks on those two sites, and—only when the school enables it—sends notices through the school's own SMS account and syncs Noor data with the school's schoolBit account.
```

**storage justification:**

```
Saves the user's own settings on the device: the SMS-gateway API key and sender name, the schoolBit connection key, and the temporary progress of multi-page tasks (for example, entering a list of late arrivals one teacher at a time across Noor page reloads). Nothing in storage is sent anywhere except the keys, which go only to the service they belong to.
```

**Host permission justification:**

```
Content scripts run only on noor.moe.gov.sa and schools.madrasati.sa, because every feature is a tool added to those two pages.

The host permissions are Corbit's own services, called from the service worker because Noor pages cannot call them directly (CORS). The service worker only forwards requests whose origin is exactly one of these; anything else is rejected:
- api.corbit.sa — Corbit SMS API: on Noor's SMS-account settings page, verify the school's API key, show its balance and approved sender names (read-only; no messages are sent by the extension).
- sms.corbit.sa / app.mobile.net.sa — the school's SMS gateway: fetch the approved sender names, check the message balance, and send messages the user composes.
- fingerprint-cp.mobile.net.sa (and api.corbit.sa) — the schoolBit API: upload student/teacher data the user exported from Noor, and fetch approved absences to enter into Noor.
No other host is contacted.
```

**Are you using remote code?** → **No, I am not using remote code.**

```
All JavaScript ships inside the package and is loaded with chrome.runtime.getURL. There is no eval, no new Function, and no script is fetched from any server.
```

**Data usage — ضع علامة على هذه فقط:**

| النوع | ✔/✘ | السبب |
|---|---|---|
| Personally identifiable information | ✔ | أسماء الطلاب والمعلمين وأولياء الأمور وأرقام هوياتهم، تُقرأ من نور |
| Health information | ✘ | |
| Financial and payment information | ✘ | |
| Authentication information | ✔ | مفتاحا بوابة الرسائل وسكول بت، يُدخلهما المستخدم |
| Personal communications | ✔ | نص الرسالة النصية التي يكتبها المستخدم |
| Location | ✘ | |
| Web history | ✘ | |
| User activity | ✘ | |
| Website content | ✔ | تقرأ صفحات نور ومدرستي وتقاريرهما |

والإقرارات الثلاثة كلها ✔ (لا بيع لطرف ثالث، ولا استعمال لغير الغرض، ولا لتقدير الملاءة).

**Privacy policy URL:** رابط صفحة `PRIVACY.md` بعد نشرها على corbit.sa (مثلاً https://corbit.sa/schoolbit/privacy). **لا بد أن تكون منشورة قبل الإرسال**، وإلا رُفضت الإضافة لأنها تتعامل مع بيانات شخصية.

---

## ٤) التوزيع (Distribution)

- Visibility: **Unlisted** — لا تظهر في البحث، ويثبّتها من معه الرابط.
- Regions: المملكة العربية السعودية (أو كل المناطق).
- Pricing: Free. ولا تحوي الإضافة أي اشتراك أو تفعيل أو شرط رصيد — كل الميزات مفتوحة من التثبيت.

---

## ٥) تعليمات الاختبار (Test instructions) — للمراجع

```
schoolBit works only inside the Saudi Ministry of Education's Noor (noor.moe.gov.sa) and Madrasati (schools.madrasati.sa) platforms. Both require a school-staff account issued by the Ministry, so we cannot provide test credentials for a government system.

What can be verified without an account:
1. Click the toolbar icon: the popup shows the version, whether the optional SMS gateway is configured, support contacts, and a button to the settings page. The extension is free: there is no trial, no activation and no payment.
2. The settings page: optional SMS-gateway settings (API key, sender name, balance display).
3. Open https://noor.moe.gov.sa or https://schools.madrasati.sa: the extension loads its scripts only on these two sites.

A screen recording of the features working inside Noor and Madrasati (student data blurred): <VIDEO_LINK>

Support: +966 920006900 (phone and WhatsApp, 24/7), info@corbit.sa.

The extension never reads or stores Noor/Madrasati passwords; it works inside the session the user already opened.
```

> سجّل فيديو قصيراً (دقيقتان) للأداة داخل نور ومدرستي، مع تمويه بيانات الطلاب،
> وارفعه على يوتيوب «غير مدرج» وضع رابطه مكان `<VIDEO_LINK>`. المراجع لا يملك
> حساب نور، فبغير الفيديو قد يرى الإضافة «لا تعمل» فيرفضها (Red Nickel).
