# التقارير المحلية — عقد القوالب

كانت التقارير تُفتح على خادم كوربت القديم (`app.invalid/reports/...`) الذي أُزيل. الآن
تُعرض محلياً من صفحة الإضافة `reports/view.html` بلا أي خادم.

## كيف تفتح الميزة تقريراً

في كود الميزة (عالم الصفحة في نور/مدرستي) استبدل:

```js
window.open(corbit_api_frontend + "/reports/teachers-week?school_id=" + school_id + "&date=" + d)
```

بـ:

```js
window.open(corbit_report_url("teachers-week") + "&school_id=" + school_id + "&date=" + d)
```

`corbit_report_url(name)` معرّفة في `main.js` وتعيد `chrome-extension://<id>/reports/view.html?r=<name>`.
وكذلك أي `<a href='" + corbit_api_frontend + "/reports/x?...'>` تصبح `<a href='" + corbit_report_url("x") + "&...'>`.
المعاملات بعد `?r=name` تصل للقالب في `params` (مثل `school_id`, `date`, `type`, `teacher`).

## البيانات

الميزة تحفظ ما جمعته بـ `corbit_set("key", JSON.stringify(obj))` (يُكتب في `chrome.storage.local`).
العارض يقرأ المفاتيح التي يطلبها القالب ويفكّ JSON تلقائياً، ويمرّرها في `data[key]`.
قوائم الطلاب المستوردة موجودة تحت `m_students_<school_id>` (من مدرستي) و`n_students_<school_id>` (من نور)،
ويمكن قراءتها بـ `h.students(data, params)` (تختار حسب `params.type` = `m` أو `n`).

## القالب: `reports/templates/<name>.js`

```js
CorbitReports.register("teachers-week", {
    title: "تقرير المتابعة الأسبوعي للمعلمين",
    subtitle: function (data, params) { return "الأسبوع: " + params.date; },   // اختياري
    keys: ["teachers-week", "teachers"],          // أو دالة: function (params) { return ["m_students_" + params.school_id]; }
    landscape: false,                             // اختياري
    render: function (data, params, h) {
        var teachers = data["teachers"] || [];
        return h.table([
            { key: "name",  label: "المعلم", cls: "text" },
            { key: "phone", label: "الجوال", cls: "num" },
            { key: function (r) { return r.lessons.length; }, label: "الحصص" },
            { key: "status", label: "الحالة", fmt: function (v) { return h.badge(v, v === "تم" ? "ok" : "danger"); } }
        ], teachers);
    },
    onReady: function (root, data, params, h) { /* اختياري: أزرار وتفاعل */ }
});
```

### المساعدات `h`
- `h.esc(s)` — تهريب HTML (استخدمه لكل نص من البيانات).
- `h.table(columns, rows, {index:true, cls})` — جدول بترقيم تلقائي.
- `h.badge(text, "ok"|"warn"|"danger"|"muted")`
- `h.stats([{label, value}])` — بطاقات أرقام.
- `h.signatures([...])` — سطر التوقيعات.
- `h.students(data, params)` — قائمة الطلاب المستوردة.
- `h.group(rows, r => r.classname)` — تجميع.
- `h.pageBreak()` — فاصل صفحة للطباعة.
- `h.today()` — التاريخ هجري/ميلادي.

الأنماط الجاهزة في `reports.css`: `table.rpt`, `.badge-*`, `.stats`, `.sign`, `.notice`, `.letter` (خطاب لكل صفحة).

## العيّنة: `reports/fixtures/<name>.json`

لكل قالب ملف عيّنة يحوي البيانات بنفس المفاتيح والشكل الذي تحفظه الميزة فعلاً، لاختبار العرض بلا نور/مدرستي:

```json
{ "params": { "school_id": "123", "date": "1448-03-01" },
  "storage": { "teachers-week": {...}, "teachers": [...], "school_name": "مدرسة التجربة" } }
```

اختبار يدوي: افتح `chrome-extension://<id>/reports/view.html?r=<name>&...` بعد وضع القيم في `chrome.storage.local`.
