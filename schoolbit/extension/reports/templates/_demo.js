// قالب تجريبي للتحقق من عمل العارض — ليس تقريراً حقيقياً.
CorbitReports.register("_demo", {
    title: "تقرير تجريبي",
    subtitle: function (data, params) { return "مدرسة رقم " + (params.school_id || "—"); },
    keys: function (params) { return ["demo_rows", "m_students_" + params.school_id]; },
    render: function (data, params, h) {
        var rows = data.demo_rows || [];
        var students = h.students(data, params);
        return h.stats([{ label: "الصفوف", value: rows.length }, { label: "الطلاب المستوردون", value: students.length }]) +
            "<h2>جدول تجريبي</h2>" +
            h.table([
                { key: "name", label: "الاسم", cls: "text" },
                { key: "phone", label: "الجوال", cls: "num" },
                { key: "status", label: "الحالة", fmt: function (v) { return h.badge(v, v === "حاضر" ? "ok" : "danger"); } }
            ], rows) +
            h.signatures();
    }
});
