// تقرير المتابعة الأسبوعي للمعلمين — يُبنى من البيانات التي تحفظها ميزة
// assets/js/features/madrasati/teachers-week.js:
//   "teachers-week" = { [teacherId]: { total_lessons, days:[صفوف GetCal], lessons:{ [Data]: {notcreated:true} | {ethrat, homeworks, exams, actives} } } }
//   "teachers"      = [ {name, phone, id} ]
// المعاملات: school_id, date, school_name, admin_name
CorbitReports.register("teachers-week", {
    title: "تقرير المتابعة الأسبوعي للمعلمين",
    subtitle: function (data, params) {
        return params.date ? "الأسبوع: " + params.date : "متابعة إعداد الدروس في منصة مدرستي";
    },
    keys: ["teachers-week", "teachers"],
    render: function (data, params, h) {
        var week = data["teachers-week"];
        var teachers = Array.isArray(data["teachers"]) ? data["teachers"] : [];
        if (!week || typeof week !== "object" || !Object.keys(week).length) {
            return "<div class='notice'><strong>لا توجد بيانات متابعة محفوظة.</strong><br>" +
                "افتح صفحة المعلمين في مدرستي، ثم شغّل «تقرير المتابعة الأسبوعي للمعلمين» من قائمة سكول بت واختر المعلمين، وانتظر اكتمال التحميل حتى يُفتح التقرير.</div>";
        }

        // ── أدوات صغيرة ──
        function pick(o, names) {
            for (var i = 0; i < names.length; i++) {
                var v = o ? o[names[i]] : undefined;
                if (v !== undefined && v !== null && String(v).trim() !== "") return v;
            }
            return "";
        }
        function num(v) { v = Number(v); return isNaN(v) ? 0 : v; }
        function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
        function rateBadge(p, total) {
            if (!total) return h.badge("لا حصص", "muted");
            if (p >= 90) return h.badge("ممتاز", "ok");
            if (p >= 70) return h.badge("جيد", "ok");
            if (p >= 50) return h.badge("يحتاج متابعة", "warn");
            return h.badge("ضعيف", "danger");
        }
        function cell(v) { return "<span class='num'>" + h.esc(v) + "</span>"; }

        var byId = {};
        teachers.forEach(function (t) { byId[String(t.id)] = t; });

        // ── تجميع لكل معلم ──
        var rows = [];
        var tot = { teachers: 0, lessons: 0, created: 0, notcreated: 0, pending: 0, ethrat: 0, homeworks: 0, exams: 0, actives: 0 };
        Object.keys(week).forEach(function (id) {
            var rec = week[id] || {};
            var t = byId[id] || { name: "معلم (" + id + ")", phone: "", id: id };
            var days = Array.isArray(rec.days) ? rec.days : [];
            var lessons = rec.lessons || {};
            var r = { id: id, name: t.name, phone: t.phone, total: days.length || num(rec.total_lessons),
                created: 0, notcreated: 0, pending: 0, ethrat: 0, homeworks: 0, exams: 0, actives: 0, detail: [] };
            days.forEach(function (d, i) {
                var l = lessons[d.Data];
                var st;
                if (!l) { st = "pending"; r.pending++; }
                else if (l.notcreated) { st = "notcreated"; r.notcreated++; }
                else {
                    st = "created"; r.created++;
                    r.ethrat += num(l.ethrat); r.homeworks += num(l.homeworks); r.exams += num(l.exams); r.actives += num(l.actives);
                }
                r.detail.push({
                    n: i + 1,
                    day: pick(d, ["Day", "DayName", "DayTitle", "Date", "LessonDate"]),
                    period: pick(d, ["Period", "PeriodName", "PeriodNumber", "Order", "Index"]),
                    subject: pick(d, ["Title", "SubjectName", "Subject", "CourseName", "LessonTitle", "LessonName"]),
                    cls: pick(d, ["ClassName", "Class", "ClassroomName", "Classroom", "SectionName"]),
                    st: st, l: l || {}
                });
            });
            // صفوف بلا تفاصيل (حالات نادرة: درس في lessons وليس في days)
            Object.keys(lessons).forEach(function (k) {
                var found = days.some(function (d) { return d.Data === k; });
                if (!found) { if (lessons[k].notcreated) r.notcreated++; else r.created++; r.total++; }
            });
            r.pct = pct(r.created, r.total);
            rows.push(r);
            tot.teachers++; tot.lessons += r.total; tot.created += r.created; tot.notcreated += r.notcreated; tot.pending += r.pending;
            tot.ethrat += r.ethrat; tot.homeworks += r.homeworks; tot.exams += r.exams; tot.actives += r.actives;
        });
        // ترتيب: الأقل إعداداً أولاً ثم بالاسم
        rows.sort(function (a, b) { return (b.pct - a.pct) || String(a.name).localeCompare(String(b.name), "ar"); });

        var html = "";
        html += h.stats([
            { label: "المعلمون", value: tot.teachers },
            { label: "إجمالي الحصص", value: tot.lessons },
            { label: "حصص مُعدّة", value: tot.created },
            { label: "حصص غير مُعدّة", value: tot.notcreated },
            { label: "نسبة الإعداد", value: pct(tot.created, tot.lessons) + "%" },
            { label: "الإثراءات", value: tot.ethrat },
            { label: "الواجبات", value: tot.homeworks },
            { label: "الاختبارات", value: tot.exams },
            { label: "الأنشطة", value: tot.actives }
        ]);
        if (tot.pending) {
            html += "<div class='notice'>تعذّر جلب تفاصيل <strong>" + tot.pending + "</strong> حصة (انتهت مهلة التحميل أو حدث خطأ في الشبكة)؛ لم تُحتسب ضمن المُعدّة ولا غير المُعدّة.</div>";
        }

        html += "<h2>ملخص المتابعة لكل معلم</h2>";
        html += h.table([
            { key: "name", label: "المعلم", cls: "text", width: "170px" },
            { key: "phone", label: "الجوال", cls: "num", width: "88px" },
            { key: "total", label: "الحصص", fmt: cell },
            { key: "created", label: "مُعدّة", fmt: cell },
            { key: "notcreated", label: "غير مُعدّة", fmt: function (v) { return v ? "<span class='num' style='color:var(--danger);font-weight:700'>" + h.esc(v) + "</span>" : cell(0); } },
            { key: "pct", label: "نسبة الإعداد", fmt: function (v, r) { return r.total ? cell(v + "%") : "—"; } },
            { key: "ethrat", label: "إثراءات", fmt: cell },
            { key: "homeworks", label: "واجبات", fmt: cell },
            { key: "exams", label: "اختبارات", fmt: cell },
            { key: "actives", label: "أنشطة", fmt: cell },
            { key: "pct", label: "التقدير", fmt: function (v, r) { return rateBadge(v, r.total); } }
        ], rows, { cls: "summary" });

        // ── تفاصيل كل معلم ──
        html += "<h2 style='margin-top:18px'>تفاصيل الحصص الأسبوعية</h2>";
        html += "<p style='color:var(--muted);font-size:11px'>الحصة «مُعدّة» إذا أنشأ المعلم الدرس في مدرستي؛ والأعمدة الرقمية هي عدد الإثراءات والواجبات والاختبارات والأنشطة المرفقة بالدرس.</p>";
        rows.forEach(function (r) {
            html += "<section class='teacher-block' data-id='" + h.esc(r.id) + "'>";
            html += "<h3>" + h.esc(r.name) + " <span style='color:var(--muted);font-weight:400;font-size:12px'>— " +
                h.esc(r.total) + " حصة، مُعدّة " + h.esc(r.created) + "، غير مُعدّة " + h.esc(r.notcreated) + "</span> " + rateBadge(r.pct, r.total) + "</h3>";
            if (!r.detail.length) {
                html += "<div class='notice'>لا توجد حصص في جدول هذا المعلم لهذا الأسبوع.</div>";
            } else {
                var hasDay = r.detail.some(function (d) { return d.day !== ""; });
                var hasPeriod = r.detail.some(function (d) { return d.period !== ""; });
                var hasSubject = r.detail.some(function (d) { return d.subject !== ""; });
                var hasCls = r.detail.some(function (d) { return d.cls !== ""; });
                var cols = [];
                if (hasDay) cols.push({ key: "day", label: "اليوم", cls: "text", width: "70px" });
                if (hasPeriod) cols.push({ key: "period", label: "الحصة", fmt: cell, width: "48px" });
                if (hasSubject) cols.push({ key: "subject", label: "المادة", cls: "text" });
                if (hasCls) cols.push({ key: "cls", label: "الفصل", cls: "text" });
                if (!hasDay && !hasSubject) cols.push({ key: "n", label: "الدرس", fmt: function (v) { return cell("درس " + v); } });
                cols.push({ key: "st", label: "حالة الإعداد", fmt: function (v) {
                    return v === "created" ? h.badge("مُعدّة", "ok") : v === "notcreated" ? h.badge("غير مُعدّة", "danger") : h.badge("لم يُجلب", "muted");
                } });
                ["ethrat|إثراءات", "homeworks|واجبات", "exams|اختبارات", "actives|أنشطة"].forEach(function (s) {
                    var p = s.split("|");
                    cols.push({ key: function (d) { return d.st === "created" ? num(d.l[p[0]]) : ""; }, label: p[1], width: "60px",
                        fmt: function (v, d) { return d.st === "created" ? cell(v) : "—"; } });
                });
                html += h.table(cols, r.detail, { cls: "detail" });
            }
            html += "</section>";
        });

        html += h.signatures(["وكيل الشؤون التعليمية", "مدير المدرسة"]);
        return html;
    },
    onReady: function (root, data, params, h) {
        // زر لإخفاء/إظهار التفاصيل لتسهيل طباعة الملخص وحده
        var blocks = root.querySelectorAll(".teacher-block");
        if (!blocks.length) return;
        var bar = document.createElement("div");
        bar.className = "no-print";
        bar.style.cssText = "margin:8px 0;display:flex;gap:8px;align-items:center";
        var btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = "إخفاء التفاصيل (طباعة الملخص فقط)";
        var shown = true;
        btn.addEventListener("click", function () {
            shown = !shown;
            Array.prototype.forEach.call(root.querySelectorAll(".teacher-block, #report h2:nth-of-type(2), #report h2:nth-of-type(2) + p"), function (el) {
                el.style.display = shown ? "" : "none";
            });
            btn.textContent = shown ? "إخفاء التفاصيل (طباعة الملخص فقط)" : "إظهار التفاصيل";
        });
        bar.appendChild(btn);
        var first = root.querySelector("h2");
        if (first) first.parentNode.insertBefore(bar, first);
    }
});
