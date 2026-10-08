// تقرير الطلاب غير المفعّلين لمنصة مدرستي.
// البيانات: المفتاح "not_active" تحفظه ميزة madrasati/not-active.js كمصفوفة:
//   { name, u_name, dd (true = تطابق تام مع اسم المستخدم في القائمة المستوردة), classroom, phone }
// المعاملات: school_id. القائمة المستوردة m_students_<school_id> تُستخدم لحساب الإجمالي.
CorbitReports.register("not-active", {
    title: "تقرير الطلاب غير المفعّلين للمنصة",
    subtitle: function (data, params) {
        var rows = Array.isArray(data.not_active) ? data.not_active : [];
        return "الطلاب الذين لم يسجّلوا أي نشاط على منصة مدرستي — " + rows.length + " طالب";
    },
    keys: function (params) { return ["not_active", "m_students_" + params.school_id]; },
    render: function (data, params, h) {
        var rows = Array.isArray(data.not_active) ? data.not_active : null;
        if (!rows) {
            return "<div class='notice'><strong>لا توجد بيانات لهذا التقرير.</strong><br>" +
                "شغّل «الطلاب غير المفعّلين» من قائمة سكول بت داخل مدرستي (بعد استيراد بيانات الطلاب من مدرستي) ثم افتح التقرير مرة أخرى.</div>";
        }
        var students = h.students(data, { school_id: params.school_id, type: "m" });
        var total = students.length;
        var withPhone = rows.filter(function (r) { return String(r.phone || "").trim(); }).length;
        var approx = rows.filter(function (r) { return !r.dd; }).length;
        var groups = h.group(rows, function (r) { return (r.classroom || "").trim() || "غير محدد"; });
        // ترتيب الفصول حسب الصف (الأول، الثاني، الثالث...) ثم أبجدياً
        var ORD = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"];
        function rank(c) { for (var i = ORD.length - 1; i >= 0; i--) { if (c.indexOf(ORD[i]) === 0) return i; } return 99; }
        var classes = Object.keys(groups).sort(function (a, b) { return rank(a) - rank(b) || a.localeCompare(b, "ar", { numeric: true }); });

        var stats = [
            { label: "إجمالي الطلاب المستوردين", value: total || "—" },
            { label: "غير مفعّل", value: rows.length },
            { label: "نسبة غير المفعّلين", value: total ? (rows.length / total * 100).toFixed(1) + "%" : "—" },
            { label: "لديهم رقم جوال", value: withPhone },
            { label: "عدد الفصول", value: classes.length }
        ];

        var html = h.stats(stats);
        if (!rows.length) {
            html += "<div class='notice'>ممتاز: جميع الطلاب (" + total + ") سجّلوا نشاطاً على المنصة.</div>";
            return html + h.signatures(["وكيل الشؤون التعليمية", "مدير المدرسة"]);
        }
        if (approx) {
            html += "<div class='notice'>هناك <strong>" + approx + "</strong> طالباً تمت مطابقة اسمهم تقريبياً مع القائمة المستوردة (علامة «تقريبي» في عمود المطابقة). " +
                "إن لاحظت خطأ في الفصل أو الجوال فحدّث بيانات الطلاب من مدرستي ثم أعد تجهيز التقرير.</div>";
        }

        // ملخص الفصول
        html += "<h2>ملخص حسب الفصل</h2>" + h.table([
            { key: "cls", label: "الفصل", cls: "text" },
            { key: "count", label: "غير مفعّل" },
            { key: "phones", label: "لديهم جوال" },
            { key: "pct", label: "من إجمالي غير المفعّلين", fmt: function (v) { return h.badge(v, "warn"); } }
        ], classes.map(function (c) {
            var g = groups[c];
            return {
                cls: c,
                count: g.length,
                phones: g.filter(function (r) { return String(r.phone || "").trim(); }).length,
                pct: (g.length / rows.length * 100).toFixed(1) + "%"
            };
        }));

        // جدول لكل فصل
        var cols = [
            { key: "name", label: "اسم الطالب في المنصة", cls: "text" },
            { key: "u_name", label: "الاسم في القائمة المستوردة", cls: "text", fmt: function (v, r) { return v && v !== r.name ? h.esc(v) : "<span style='color:#999'>مطابق</span>"; } },
            { key: "phone", label: "جوال ولي الأمر", cls: "num", fmt: function (v) { return String(v || "").trim() ? h.esc(v) : h.badge("لا يوجد", "muted"); } },
            { key: "dd", label: "المطابقة", fmt: function (v) { return v ? h.badge("تام", "ok") : h.badge("تقريبي", "warn"); } },
            { key: function () { return ""; }, label: "تم التواصل", width: "70px" }
        ];
        classes.forEach(function (c) {
            html += "<h2>" + h.esc(c) + " <span style='font-weight:normal;color:#666;font-size:12px'>(" + groups[c].length + " طالب)</span></h2>" +
                h.table(cols, groups[c]);
        });

        html += h.signatures(["رائد النشاط / المرشد الطلابي", "وكيل الشؤون التعليمية", "مدير المدرسة"]);
        return html;
    }
});
