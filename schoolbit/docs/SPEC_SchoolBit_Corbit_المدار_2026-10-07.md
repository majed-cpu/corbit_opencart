طلب من ماجد — إضافة ميزة «Corbit – المدار» إلى SchoolBit (الإصدار التالي بعد 1.3). كل ما يلي مُتحقَّق منه حيًّا على صفحة نور يوم 2026-10-07.

## الصفحة المستهدفة
https://noor.moe.gov.sa/Noor/SystemSettings/HierarchyMessageSettings.aspx (إعداد حساب الرسائل الخاص بالمدرسة — مدير المدرسة).
- الجدول: gvHierarchyMessageSettings. الصف الأول = ctl02. الأعمدة: اسم المستخدم | كلمة السر (******) | نوع الشبكة | اسم المرسل | خيارات (عرض الرصيد · تعديل · حذف).
- رابط الرصيد: a#ctl00_PlaceHolderMain_gvHierarchyMessageSettings_ctl02_lbtnDisplayBalance → __doPostBack(...lbtnDisplayBalance). اليوم يقود نور إلى ServiceNotAvailable.aspx?id=-99 («الخدمة غير متوفرة») لأن نور لا يتصل بالمزوّد أصلًا (مثبت بـ tcpdump على سيرفر البوابة).
- تعديل: a#...ctl02_lbtnEdit → وضع التعديل فيه:
  - select#ctl00_PlaceHolderMain_gvHierarchyMessageSettings_ctl02_ddlNetworkType — قيمة «المدار التقني» = "2;https://mobile.net.sa/sms/noor/Sender.php" (القيمة لا تُغيَّر).
  - input#...ctl02_tbUserName ، input[type=password]#...ctl02_tbUserPassword ، #...ctl02_tbConfirmPassword — نور يضع كلمة السر المخزنة فعليًا في ‎.value‎ (getAttribute('value') فارغ لكن ‎.value‎ ممتلئ) → يمكن قراءة المفتاح المخزن من هنا.
  - input#...ctl02_tbSenderName (نص حر). حفظ: a#...ctl02_lbtnUpdate ، إلغاء: a#...ctl02_lbtnCancel.
  - في وضع التعديل يظهر الخطأ «حدث خطأ من مزود الخدمة اثناء استرجاع اسماء المرسلين.» — نخفيه حين يكون المزوّد المدار.
- قائمة إضافة مزوّد جديد: select#ctl00_PlaceHolderMain_ddlProvider (قيمة المدار = "2").

## المطلوب (فقط حين نوع الشبكة = المدار التقني: قيمة تبدأ بـ "2;" أو نص الخلية «المدار التقني»)
1. الاسم: اعرض «Corbit - المدار» بدل «المدار التقني» في خلية الجدول وفي نص الخيار داخل القائمتين (النص فقط، القيمة كما هي).
2. عرض الرصيد: اعترض النقر على lbtnDisplayBalance (preventDefault + stopImmediatePropagation، في مرحلة capture قبل __doPostBack) واعرض الرصيد في المكان نفسه بهوية SchoolBit: «رصيد Corbit: 4963 رسالة». المفتاح من تخزين الأداة (البند 4)، وإن لم يوجد اطلب من المستخدم الضغط على «تعديل» مرة لتلتقطه الأداة.
3. أسماء المرسلين: في وضع التعديل ضع بجانب/مكان tbSenderName قائمة منسدلة تُملأ من Corbit (approved فقط)، وعند الاختيار اكتب القيمة في tbSenderName الأصلي (أبقه موجودًا ومخفيًا حتى يرسله ASP.NET في postback). أخفِ رسالة الخطأ أعلاه.
4. الربط بالمفتاح: زر «ربط Corbit» في وضع التعديل/الإضافة: يطلب مفتاح API (من sms.corbit.sa) → يتحقق منه (get-balance) → يملأ: tbUserName = "corbit" (قيمة شكلية تتجاهلها البوابة)، tbUserPassword و tbConfirmPassword = المفتاح، نوع الشبكة = المدار، ويملأ قائمة المرسلين → المستخدم يضغط «حفظ» بنفسه. خزّن المفتاح في chrome.storage.local مربوطًا بالمدرسة/المستخدم، وحدّثه كلما فُتح وضع التعديل وكان المفتاح بالشكل الصحيح.
   - شكل المفتاح: ^[A-Za-z0-9]{40,128}$ وليس hex فقط (المفتاح التجريبي 48 خانة). القيم الأقصر/hex32 = حسابات قديمة → لا يتغير معها إلا الاسم.

## API Corbit (https://api.corbit.sa/doc — مُختبر حيًّا)
- Authorization: Bearer <KEY> ، Accept: application/json. الاستدعاء من service worker الأداة (host_permissions: "https://api.corbit.sa/*") لتجاوز CORS.
- POST https://api.corbit.sa/api/v1/get-balance → {"status":"Success","data":{"balance":4963}} ؛ مفتاح خاطئ → HTTP 401 {"message":"Unauthenticated."}
- GET https://api.corbit.sa/api/v1/sendernames?per_page=100 → {"status":"Success","data":[{"name":"Arbiter","status":"approved",...}],"pagination":{...,"last_page":1}} — اعرض status=approved فقط.
- مفتاح تجريبي (من ماجد): «[محذوف من المستودع — موجود عند ماجد]» — المرسل المعتمد: Arbiter — الرصيد 4963. للاختبار فقط، لا يوضع في الشيفرة.
- لا ترسل الأداة رسائل؛ الإرسال يبقى من نور.

## جهة البوابة (منفّذة وحيّة — v4، لا تحتاج شيئًا من الأداة)
نور يرسل كالمعتاد إلى https://mobile.net.sa/sms/noor/index.php (userName/userPassword/userSender/numbers/msg/By=noor). إن كانت userPassword مفتاح Corbit بالشكل أعلاه، تتجاهل البوابة userName وترسل عبر api.corbit.sa (‎/api/v1/send‎ أو send-bulk) وتترجم الرد لرموز نور (1 نجاح، 1020 مفتاح خاطئ، 1070 رصيد، 1110 مرسل، 1150 مكرر، 1170 رقم، 1100 تعذر). وكذلك querysender=1 و Sender.php و Credits.php صارت تعمل بالمفتاح (مُختبر حيًّا: querysender → "Arbiter"، الرصيد → 4963).

## تحقق القبول
مدير مدرسة ابتدائية الأقصى (المستخدم الحالي في الصفحة 146564، حساب قديم). بعد الربط بالمفتاح: الاسم «Corbit - المدار»، «عرض الرصيد» يعرض 4963 دون صفحة خطأ، قائمة المرسلين تعرض Arbiter، والحفظ يخزن المفتاح في نور، وإرسال نور التالي يمر عبر Corbit.
