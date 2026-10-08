// تقرير الحصص المجمّع (حضور/غياب/تأخر لكل طالب) من مدرستي.
// البيانات: المفتاح "full_lessons" تحفظه ميزة madrasati/full-lessons.js كمصفوفة:
//   { name, classroom, parent, phone, attend, ghiab, ghiab_ex, late, late_ex }  (القيم نصوص رقمية)
// المعاملات: school_id.
CorbitReports.register("full-lessons", {
    title: "تقرير الحصص المجمّع",
    subtitle: function (data) {
        var rows = Array.isArray(data.full_lessons) ? data.full_lessons : [];
        return "حصص الحضور والغياب والتأخر لكل طالب منذ بداية الفصل الدراسي — " + rows.length + " طالب";
    },
    keys: ["full_lessons"],
    landscape: false,
    render: function (data, params, h) {
        var rows = Array.isArray(data.full_lessons) ? data.full_lessons : null;
        if (!rows) {
            return "<div class='notice'><strong>لا توجد بيانات لهذا التقرير.</strong><br>" +
                "شغّل «تقرير الحصص المجمّع» من قائمة سكول بت داخل مدرستي ثم افتح التقرير مرة أخرى.</div>";
        }
        if (!rows.length) {
            return "<div class='notice'>لم يُعثر على أي طالب في تقرير الحضور بمدرستي. تأكد من وجود طلاب مسجّلين ثم أعد التجهيز.</div>";
        }
        function n(v) { var x = parseInt(String(v == null ? "" : v).replace(/[^\d.-]/g, ""), 10); return isNaN(x) ? 0 : x; }
        function sum(list, k) { return list.reduce(function (a, r) { return a + n(r[k]); }, 0); }
        function pct(a, b) { return b ? (a / b * 100).toFixed(1) + "%" : "—"; }

        // نسبة الحضور لكل طالب = الحضور / (الحضور + الغياب)
        rows.forEach(function (r) {
            r._attend = n(r.attend); r._ghiab = n(r.ghiab); r._ghiab_ex = n(r.ghiab_ex);
            r._late = n(r.late); r._late_ex = n(r.late_ex);
            r._total = r._attend + r._ghiab;
            r._rate = r._total ? r._attend / r._total * 100 : 0;
        });

        var T = { attend: sum(rows, "_attend"), ghiab: sum(rows, "_ghiab"), ghiab_ex: sum(rows, "_ghiab_ex"), late: sum(rows, "_late"), late_ex: sum(rows, "_late_ex") };
        var allTotal = T.attend + T.ghiab;
        var noGhiab = rows.filter(function (r) { return r._ghiab === 0; }).length;
        var risky = rows.filter(function (r) { return r._total && r._rate < 85; }).length;

        function rateBadge(rate) {
            var kind = rate >= 95 ? "ok" : rate >= 85 ? "warn" : "danger";
            return h.badge(rate.toFixed(1) + "%", kind);
        }
        function numCell(v, kind) {
            return v ? "<span class='badge badge-" + kind + "'>" + v + "</span>" : "<span style='color:#aaa'>0</span>";
        }

        var html = h.stats([
            { label: "عدد الطلاب", value: rows.length },
            { label: "حصص الحضور", value: T.attend },
            { label: "حصص الغياب", value: T.ghiab },
            { label: "منها بعذر", value: T.ghiab_ex },
            { label: "حصص التأخر", value: T.late },
            { label: "منها بعذر", value: T.late_ex },
            { label: "نسبة الحضور العامة", value: pct(T.attend, allTotal) },
            { label: "بلا غياب", value: noGhiab },
            { label: "حضور أقل من 85%", value: risky }
        ]);

        var groups = h.group(rows, function (r) { return (r.classroom || "").trim() || "غير محدد"; });
        // ترتيب الفصول حسب الصف (الأول، الثاني، الثالث...) ثم أبجدياً
        var ORD = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"];
        function rank(c) { for (var i = ORD.length - 1; i >= 0; i--) { if (c.indexOf(ORD[i]) === 0) return i; } return 99; }
        var classes = Object.keys(groups).sort(function (a, b) { return rank(a) - rank(b) || a.localeCompare(b, "ar", { numeric: true }); });

        // ملخص الفصول
        html += "<h2>ملخص حسب الفصل</h2>" + h.table([
            { key: "cls", label: "الفصل", cls: "text" },
            { key: "count", label: "الطلاب" },
            { key: "attend", label: "حضور" },
            { key: "ghiab", label: "غياب" },
            { key: "ghiab_ex", label: "غياب بعذر" },
            { key: "late", label: "تأخر" },
            { key: "late_ex", label: "تأخر بعذر" },
            { key: "rate", label: "نسبة الحضور", fmt: function (v) { return rateBadge(v); } }
        ], classes.map(function (c) {
            var g = groups[c];
            var a = sum(g, "_attend"), gh = sum(g, "_ghiab");
            return { cls: c, count: g.length, attend: a, ghiab: gh, ghiab_ex: sum(g, "_ghiab_ex"), late: sum(g, "_late"), late_ex: sum(g, "_late_ex"), rate: (a + gh) ? a / (a + gh) * 100 : 0 };
        }).concat([{ cls: "الإجمالي", count: rows.length, attend: T.attend, ghiab: T.ghiab, ghiab_ex: T.ghiab_ex, late: T.late, late_ex: T.late_ex, rate: allTotal ? T.attend / allTotal * 100 : 0 }]));

        // تفصيل الطلاب لكل فصل (مرتّب تنازلياً حسب الغياب)
        var cols = [
            { key: "name", label: "اسم الطالب", cls: "text" },
            { key: "parent", label: "ولي الأمر", cls: "text" },
            { key: "phone", label: "الجوال", cls: "num", fmt: function (v) { return String(v || "").trim() ? h.esc(v) : "<span style='color:#aaa'>—</span>"; } },
            { key: "_attend", label: "حضور" },
            { key: "_ghiab", label: "غياب", fmt: function (v) { return numCell(v, "danger"); } },
            { key: "_ghiab_ex", label: "بعذر", fmt: function (v) { return numCell(v, "muted"); } },
            { key: "_late", label: "تأخر", fmt: function (v) { return numCell(v, "warn"); } },
            { key: "_late_ex", label: "بعذر", fmt: function (v) { return numCell(v, "muted"); } },
            { key: "_rate", label: "نسبة الحضور", fmt: function (v, r) { return r._total ? rateBadge(v) : h.badge("—", "muted"); } }
        ];
        classes.forEach(function (c) {
            var g = groups[c].slice().sort(function (a, b) { return b._ghiab - a._ghiab || b._late - a._late; });
            html += "<h2>" + h.esc(c) + " <span style='font-weight:normal;color:#666;font-size:12px'>(" + g.length + " طالب)</span></h2>" + h.table(cols, g);
        });

        html += "<p style='color:#666;font-size:11px'>نسبة الحضور = حصص الحضور ÷ (حصص الحضور + حصص الغياب). الألوان: أخضر ≥ 95%، برتقالي ≥ 85%، أحمر أقل من 85%.</p>";
        html += h.signatures(["المرشد الطلابي", "وكيل شؤون الطلاب", "مدير المدرسة"]);
        return html;
    }
});
