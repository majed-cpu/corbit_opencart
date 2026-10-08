// تقرير الإحصائيات الأسبوعي للمعلمين — يُبنى من البيانات التي تحفظها ميزة
// assets/js/features/madrasati/teachers-stats.js:
//   "teachers-week" = { [teacherId]: { total_lessons, days:[صفوف GetCal], lessons:{ [Data]:
//        {notcreated:true} | {ethrat, homeworks, exams, actives, pre, voc, goals, strat, tools, skills, close, notes} } } }
//   "teachers"      = [ {name, phone, id} ]
// المعاملات: school_id, date, school_name, admin_name
CorbitReports.register("teachers-stats", {
    title: "تقرير الإحصائيات الأسبوعي للمعلمين",
    subtitle: function (data, params) {
        return params.date ? "الأسبوع: " + params.date : "إحصائيات عناصر إعداد الدروس في منصة مدرستي";
    },
    keys: ["teachers-week", "teachers"],
    landscape: true,
    render: function (data, params, h) {
        var week = data["teachers-week"];
        var teachers = Array.isArray(data["teachers"]) ? data["teachers"] : [];
        if (!week || typeof week !== "object" || !Object.keys(week).length) {
            return "<div class='notice'><strong>لا توجد بيانات إحصائيات محفوظة.</strong><br>" +
                "افتح صفحة المعلمين في مدرستي، ثم شغّل «تقرير الإحصائيات الأسبوعي للمعلمين» من قائمة سكول بت واختر المعلمين، وانتظر اكتمال التحميل حتى يُفتح التقرير.</div>";
        }

        function num(v) { v = Number(v); return isNaN(v) ? 0 : v; }
        function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
        function cell(v) { return "<span class='num'>" + h.esc(v) + "</span>"; }
        function rateBadge(p, total) {
            if (!total) return h.badge("لا حصص", "muted");
            if (p >= 85) return h.badge("ممتاز", "ok");
            if (p >= 70) return h.badge("جيد", "ok");
            if (p >= 50) return h.badge("متوسط", "warn");
            return h.badge("ضعيف", "danger");
        }
        // عناصر خطة الدرس (قيمة 0/1 لكل حصة مُعدّة) — بأسماء حقول مدرستي
        var ELEMENTS = [
            { key: "pre", label: "التهيئة" },
            { key: "voc", label: "المفردات" },
            { key: "goals", label: "الأهداف" },
            { key: "strat", label: "الاستراتيجيات" },
            { key: "tools", label: "الوسائل" },
            { key: "skills", label: "مهارات التفكير" },
            { key: "close", label: "الغلق" },
            { key: "notes", label: "ملاحظات المعلم" }
        ];
        // المرفقات (أعداد لكل حصة)
        var ATTACH = [
            { key: "ethrat", label: "الإثراءات" },
            { key: "homeworks", label: "الواجبات" },
            { key: "exams", label: "الاختبارات" },
            { key: "actives", label: "الأنشطة" }
        ];

        var byId = {};
        teachers.forEach(function (t) { byId[String(t.id)] = t; });

        var rows = [];
        var tot = { teachers: 0, lessons: 0, created: 0, notcreated: 0, pending: 0, el: {}, at: {} };
        ELEMENTS.forEach(function (e) { tot.el[e.key] = 0; });
        ATTACH.forEach(function (a) { tot.at[a.key] = 0; });

        Object.keys(week).forEach(function (id) {
            var rec = week[id] || {};
            var t = byId[id] || { name: "معلم (" + id + ")", phone: "", id: id };
            var days = Array.isArray(rec.days) ? rec.days : [];
            var lessons = rec.lessons || {};
            var keys = Object.keys(lessons);
            // الحصص = صفوف الجدول، وإن غابت فالدروس المحفوظة، وإن غابت فالعدد الإجمالي
            var total = days.length || keys.length || num(rec.total_lessons);
            var r = { id: id, name: t.name, phone: t.phone, total: total, created: 0, notcreated: 0, pending: 0, el: {}, at: {}, score: 0 };
            ELEMENTS.forEach(function (e) { r.el[e.key] = 0; });
            ATTACH.forEach(function (a) { r.at[a.key] = 0; });
            var seen = {};
            function take(l) {
                if (!l) { r.pending++; return; }
                if (l.notcreated) { r.notcreated++; return; }
                r.created++;
                ELEMENTS.forEach(function (e) { if (num(l[e.key]) > 0) r.el[e.key]++; });
                ATTACH.forEach(function (a) { r.at[a.key] += num(l[a.key]); });
            }
            if (days.length) {
                days.forEach(function (d) { seen[d.Data] = true; take(lessons[d.Data]); });
                keys.forEach(function (k) { if (!seen[k]) { r.total++; take(lessons[k]); } });
            } else {
                keys.forEach(function (k) { take(lessons[k]); });
            }
            // مؤشر الاكتمال: متوسط نسبة تحقق العناصر في الحصص المُعدّة × نسبة الإعداد
            var elSum = 0;
            ELEMENTS.forEach(function (e) { elSum += r.el[e.key]; });
            r.elPct = r.created ? Math.round(elSum / (r.created * ELEMENTS.length) * 100) : 0;
            r.prepPct = pct(r.created, r.total);
            r.score = r.total ? Math.round(r.prepPct * r.elPct / 100) : 0;
            rows.push(r);
            tot.teachers++; tot.lessons += r.total; tot.created += r.created; tot.notcreated += r.notcreated; tot.pending += r.pending;
            ELEMENTS.forEach(function (e) { tot.el[e.key] += r.el[e.key]; });
            ATTACH.forEach(function (a) { tot.at[a.key] += r.at[a.key]; });
        });
        rows.sort(function (a, b) { return (b.score - a.score) || String(a.name).localeCompare(String(b.name), "ar"); });

        var html = "";
        html += h.stats([
            { label: "المعلمون", value: tot.teachers },
            { label: "إجمالي الحصص", value: tot.lessons },
            { label: "حصص مُعدّة", value: tot.created },
            { label: "غير مُعدّة", value: tot.notcreated },
            { label: "نسبة الإعداد", value: pct(tot.created, tot.lessons) + "%" },
            { label: "الإثراءات", value: tot.at.ethrat },
            { label: "الواجبات", value: tot.at.homeworks },
            { label: "الاختبارات", value: tot.at.exams },
            { label: "الأنشطة", value: tot.at.actives }
        ]);
        if (tot.pending) {
            html += "<div class='notice'>تعذّر جلب تفاصيل <strong>" + tot.pending + "</strong> حصة (انتهت مهلة التحميل أو حدث خطأ في الشبكة)؛ لم تُحتسب ضمن المُعدّة ولا غير المُعدّة.</div>";
        }

        // ── جدول 1: عناصر خطة الدرس لكل معلم ──
        html += "<h2>أولاً: عناصر إعداد الدرس لكل معلم</h2>";
        html += "<p style='color:var(--muted);font-size:11px'>كل خلية = عدد الحصص المُعدّة التي حوت العنصر من إجمالي الحصص المُعدّة للمعلم. المؤشر العام = نسبة الإعداد × متوسط اكتمال العناصر.</p>";
        var cols1 = [
            { key: "name", label: "المعلم", cls: "text" },
            { key: "total", label: "الحصص", fmt: cell, width: "52px" },
            { key: "created", label: "مُعدّة", fmt: cell, width: "52px" },
            { key: "notcreated", label: "غير مُعدّة", width: "62px", fmt: function (v) { return v ? "<span class='num' style='color:var(--danger);font-weight:700'>" + h.esc(v) + "</span>" : cell(0); } }
        ];
        ELEMENTS.forEach(function (e) {
            cols1.push({ key: function (r) { return r.el[e.key]; }, label: e.label, width: "64px", fmt: function (v, r) {
                if (!r.created) return "—";
                var p = pct(v, r.created);
                var color = p >= 70 ? "var(--ok)" : p >= 40 ? "var(--warn)" : "var(--danger)";
                return "<span class='num' style='color:" + color + ";font-weight:700'>" + h.esc(v) + "</span><br><span style='font-size:10px;color:var(--muted)'>" + p + "%</span>";
            } });
        });
        cols1.push({ key: "score", label: "المؤشر العام", width: "70px", fmt: function (v, r) { return r.total ? cell(v + "%") : "—"; } });
        cols1.push({ key: "score", label: "التقدير", width: "70px", fmt: function (v, r) { return rateBadge(v, r.total); } });
        html += h.table(cols1, rows, { cls: "elements" });

        // ── جدول 2: المرفقات لكل معلم ──
        html += "<h2>ثانياً: الإثراءات والواجبات والاختبارات والأنشطة</h2>";
        var cols2 = [
            { key: "name", label: "المعلم", cls: "text" },
            { key: "phone", label: "الجوال", cls: "num", width: "95px" },
            { key: "created", label: "الحصص المُعدّة", fmt: cell, width: "90px" }
        ];
        ATTACH.forEach(function (a) {
            cols2.push({ key: function (r) { return r.at[a.key]; }, label: a.label, fmt: cell });
            cols2.push({ key: function (r) { return r.created ? (r.at[a.key] / r.created).toFixed(1) : "—"; }, label: "لكل حصة", width: "70px",
                fmt: function (v) { return v === "—" ? v : "<span class='num' style='color:var(--muted)'>" + h.esc(v) + "</span>"; } });
        });
        html += h.table(cols2, rows, { cls: "attach" });

        // ── جدول 3: إجمالي المدرسة لكل عنصر ──
        html += "<h2>ثالثاً: نسبة تحقق كل عنصر على مستوى المدرسة</h2>";
        var elRows = ELEMENTS.map(function (e) {
            return { label: e.label, count: tot.el[e.key], p: pct(tot.el[e.key], tot.created) };
        });
        html += h.table([
            { key: "label", label: "العنصر", cls: "text" },
            { key: "count", label: "الحصص المُعدّة التي حوت العنصر", fmt: cell },
            { key: function () { return tot.created; }, label: "إجمالي الحصص المُعدّة", fmt: cell },
            { key: "p", label: "النسبة", fmt: function (v) {
                var color = v >= 70 ? "var(--ok)" : v >= 40 ? "var(--warn)" : "var(--danger)";
                return "<div style='display:flex;align-items:center;gap:8px;direction:rtl'><div style='flex:1;height:8px;background:#eee;border-radius:4px;overflow:hidden'><div style='width:" + v + "%;height:100%;background:" + color + "'></div></div><span class='num' style='min-width:36px;font-weight:700;color:" + color + "'>" + v + "%</span></div>";
            } }
        ], elRows, { cls: "school-elements" });

        html += h.signatures(["وكيل الشؤون التعليمية", "مدير المدرسة"]);
        return html;
    }
});
