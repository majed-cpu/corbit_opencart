var arr = [{
  title: "نموذج الالتزام المدرسي",
  id: 10001,
  custom: true
}, {
  title: "نموذج فارغ للمدرسة",
  id: 1,
  custom: true
}, {
  title: "سجل مشتريات المدرسة",
  id: 2,
  custom: true
}, {
  title: "طلب ( إصدار /  إلغاء /  تعديل  ) وثيقة",
  id: 3,
  custom: true
}, {
  title: "اسم النموذج : استمارة موافقة ولي أمر الطالب للاشتراك في النقل المدرسي",
  id: 5,
  custom: true
}, {
  title: "اسم النموذج : إشعار موعد التدقيق الداخلي",
  id: 6,
  custom: true
}, {
  title: "اسم النموذج : الخطة الفصلية للتجارب العلمية",
  id: 7,
  custom: true
}, {
  title: "اسم النموذج : أمر مطالبة",
  id: 8
}, {
  title: "اسم النموذج : بيان اطلاع الموظفين على التعاميم",
  id: 9
}, {
  title: "بيان اطلاع الموظفين على تقويم الاداء الوظيفي",
  id: 10
}, {
  title: "اسم النموذج : تسليم نسخ موثقة",
  id: 11
}, {
  title: "اسم النموذج : تقرير التدقيق الداخلي",
  id: 12,
  custom: true
}, {
  title: "اسم النموذج : جرد المعامل",
  id: 13
}, {
  title: "اسم النموذج : خطة التدقيق الداخلي النصف سنوية",
  id: 14
}, {
  title: "اسم النموذج : خطة الزيارات الصفية لقائد المدرسة",
  id: 15
}, {
  title: "اسم النموذج : سجل زيارات الفصول",
  id: 16
}, {
  title: "اسم النموذج : سجل استئذان الموظفين",
  id: 17
}, {
  title: "اسم النموذج : سجل استعارة كتب للطلاب",
  id: 18
}, {
  title: "اسم النموذج : سجل التردد اليومي",
  id: 20
}, {
  title: "اسم النموذج : سجل الصادر العام",
  id: 21
}, {
  title: "اسم النموذج : سجل العمل الرسمي",
  id: 22
}, {
  title: "اسم النموذج : سجل الوارد العام",
  id: 23
}, {
  title: "اسم النموذج : سجل تنفيذ التجارب العملية",
  id: 24
}, {
  title: "اسم النموذج : سجل توديع المعاملات",
  id: 25
}, {
  title: "اسم النموذج : سجل جرد المختبر والمواد الكيميائية",
  id: 26,
  custom: true
}, {
  title: "اسم النموذج : سجل حصر الناقص والزائد والتالف في المختبر",
  id: 27
}, {
  title: "اسم النموذج : سجل طلبات إجراءات تصحيحية",
  id: 28
}, {
  title: "اسم النموذج : طلب صيانة",
  id: 29
}, {
  title: "اسم النموذج : عدم المطابقة",
  id: 30
}, {
  title: "قرار حسم غياب",
  id: 31
}, {
  title: "اسم النموذج : قرار حسم مجموع ساعات تأخر وخروج مبكر",
  id: 33
}, {
  title: "اسم النموذج : قياس اتجاهات المتعلمين نحو المدرسة",
  id: 34,
  custom: true
}, {
  title: "اسم النموذج : كشف بموجودات المستودع العام للمدرسة",
  id: 35
}, {
  title: "اسم النموذج : محضر فقد أو إتلاف مواد",
  id: 36
}, {
  title: "اسم النموذج : مساءلة غياب",
  id: 37
}, {
  title: "اسم النموذج : نموذج التدقيق الداخلي",
  id: 38
}, {
  title: "اسم النموذج :سجل استلام عهدة",
  id: 39
}, {
  title: "اسم النموذج: تقويم الأداء الوظيفي لشاغلي الوظائف الإدارية",
  id: 40,
  custom: true
}, {
  title: "اسم النموذج: تنبيه عن تأخر / انصراف",
  id: 41
}, {
  title: "اسم النموذج: نموذج تقويم الأداء الوظيفي لشاغلي الوظائف التعليمية",
  id: 42,
  custom: true
}, {
  title: "اسم النموذج: التقرير الاسبوعي لقائد المدرسة من وكيل المدرسة للشؤون المدرسية",
  id: 43
}];
var d = arr.map(function (v1) {
  if (v1.id == 10001) {
    return "<button class=\"list-group-item i10001 list-group-item-action\" style='width: 100%'>" + v1.title + " <span class='btn btn-sm btn-danger' style='padding: 3px'>جديد</span></button>";
  }
  if (v1.custom) {
    return "<a target='_blank' href='" + corbit_report_url("school-form") + "&id=" + v1.id + "&title=" + encodeURIComponent(v1.title) + "&school_name=" + encodeURIComponent(localStorage.getItem("school_name") || "") + "&admin_name=" + encodeURIComponent(localStorage.getItem("admin_name") || "") + "' class=\"list-group-item list-group-item-action\" style='width: 100%'>" + v1.title + "</a>";
  } else {
    return "<a target='_blank' href='" + corbit_report_url("school-form") + "&id=" + v1.id + "&title=" + encodeURIComponent(v1.title) + "&school_name=" + encodeURIComponent(localStorage.getItem("school_name") || "") + "&admin_name=" + encodeURIComponent(localStorage.getItem("admin_name") || "") + "' class=\"list-group-item list-group-item-action\" style='width: 100%'>" + v1.title + "</a>";
  }
});
alert("" + d);
$(".i10001").click(function () {
  corbit_loadScript(corbit_api_frontend + "/files/js/madrasati/reports-attends-print.js?_id=" + Math.random().toString(), function () {});
});