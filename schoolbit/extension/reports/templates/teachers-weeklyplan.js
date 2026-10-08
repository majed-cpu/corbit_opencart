// الخطة الأسبوعية (تلقائياً) — تُبنى من البيانات التي تحفظها ميزة
// assets/js/features/madrasati/weeklyplan.js:
//   "teachers-weeklyplan"          = { [teacherId]: { total_lessons, days:[صفوف GetCal], lessons:{ [Data]: {notcreated:true} | {ethrat, homeworks_html, homeworks, exams, id} } } }
//   "teachers"                     = [ {name, phone, id} ]
//   "teachers-weeklyplan-subjects" = { [courseId]: "اسم المادة" }
//   "teachers-weeklyplan-goals"    = { [lessonId]: { goals: encodeURIComponent("هدف<br>هدف<br>"), url, videos:[youtubeId] } }
// المعاملات: school_id, date, school_name, admin_name
CorbitReports.register("teachers-weeklyplan", {
    title: "الخطة الأسبوعية للمعلمين",
    subtitle: function (data, params) {
        return params.date ? "الأسبوع: " + params.date : "خطة الدروس الأسبوعية من منصة مدرستي";
    },
    keys: ["teachers-weeklyplan", "teachers", "teachers-weeklyplan-subjects", "teachers-weeklyplan-goals"],
    landscape: true,
    render: function (data, params, h) {
        var week = data["teachers-weeklyplan"];
        var teachers = Array.isArray(data["teachers"]) ? data["teachers"] : [];
        var subjects = (data["teachers-weeklyplan-subjects"] && typeof data["teachers-weeklyplan-subjects"] === "object") ? data["teachers-weeklyplan-subjects"] : {};
        var goalsMap = (data["teachers-weeklyplan-goals"] && typeof data["teachers-weeklyplan-goals"] === "object") ? data["teachers-weeklyplan-goals"] : {};

        if (!week || typeof week !== "object" || !Object.keys(week).length) {
            return "<div class='notice'><strong>لا توجد خطة أسبوعية محفوظة.</strong><br>" +
                "افتح صفحة المعلمين في مدرستي، ثم شغّل «الخطة الأسبوعية (تلقائياً)» من قائمة سكول بت واختر المعلمين، وانتظر اكتمال التحميل حتى يُفتح التقرير.</div>";
        }

        // ── أدوات صغيرة ──
        var DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
        function pick(o, names) {
            for (var i = 0; i < names.length; i++) {
                var v = o ? o[names[i]] : undefined;
                if (v !== undefined && v !== null && String(v).trim() !== "") return v;
            }
            return "";
        }
        function num(v) { v = Number(v); return isNaN(v) ? 0 : v; }
        function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
        function cell(v) { return "<span class='num'>" + h.esc(v) + "</span>"; }
        function normDay(v) {
            var s = String(v == null ? "" : v).trim().replace(/^ال/, "").replace(/إ/g, "ا").replace(/أ/g, "ا");
            var m = { "احد": 0, "اثنين": 1, "ثلاثاء": 2, "اربعاء": 3, "خميس": 4, "sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4 };
            var low = s.toLowerCase();
            if (m[low] !== undefined) return m[low];
            if (/^\d+$/.test(low)) { var n = Number(low); return n >= 0 && n <= 6 ? (n > 4 ? -1 : n) : -1; }
            return -1;
        }
        function dayLabel(d, idx) {
            var raw = pick(d, ["Day", "DayName", "DayTitle", "WeekDay", "DayOfWeek"]);
            if (idx >= 0 && idx < DAYS.length) return DAYS[idx];
            return raw || "";
        }
        function subjectOf(d) {
            // نحاول أولاً مطابقة معرّف المقرر مع قائمة المواد المحفوظة
            var idFields = ["CourseId", "CourseID", "SubjectId", "SubjectID", "LectureCourseId", "TeacherCourseId", "CourseGuid", "SchoolCourseId"];
            for (var i = 0; i < idFields.length; i++) {
                var v = d[idFields[i]];
                if (v !== undefined && v !== null && subjects[String(v)]) return subjects[String(v)];
            }
            var s = pick(d, ["SubjectName", "Subject", "CourseName", "Course"]);
            if (s) return s;
            // قد يكون العنوان بصيغة "المادة - الفصل"
            var t = String(pick(d, ["Title", "LessonTitle", "LessonName"]));
            if (t.indexOf(" - ") > 0) return t.split(" - ")[0].trim();
            return t;
        }
        function lessonTitleOf(d, subject) {
            var t = String(pick(d, ["LessonTitle", "LessonName", "Title", "Name"])).trim();
            if (t === subject) return "";
            if (t.indexOf(" - ") > 0 && t.split(" - ")[0].trim() === subject) return t.split(" - ").slice(1).join(" - ").trim();
            return t;
        }
        function goalsList(lessonId) {
            var g = goalsMap[String(lessonId)];
            if (!g) return null;
            var raw = String(g.goals == null ? "" : g.goals);
            try { raw = decodeURIComponent(raw); } catch (_) { /* نص غير مُرمَّز */ }
            var parts = raw.split(/<br\s*\/?>/i).map(function (s) {
                return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
            }).filter(function (s) { return s && s !== "undefined" && s !== "null"; });
            return { list: parts, url: g.url || "", videos: Array.isArray(g.videos) ? g.videos.filter(function (v) { return v; }) : [] };
        }
        function statusBadge(st) {
            return st === "created" ? h.badge("مُعدّة", "ok") : st === "notcreated" ? h.badge("غير مُعدّة", "danger") : h.badge("لم يُجلب", "muted");
        }

        var byId = {};
        teachers.forEach(function (t) { byId[String(t.id)] = t; });

        // ── تجميع لكل معلم ──
        var blocks = [];
        var tot = { teachers: 0, lessons: 0, created: 0, notcreated: 0, pending: 0, withGoals: 0, goals: 0, homeworks: 0, ethrat: 0, exams: 0, videos: 0 };
        Object.keys(week).forEach(function (id) {
            var rec = week[id] || {};
            var t = byId[id] || { name: "معلم (" + id + ")", phone: "", id: id };
            var days = Array.isArray(rec.days) ? rec.days : [];
            var lessons = rec.lessons || {};
            var b = { id: id, name: t.name, phone: t.phone, total: days.length || num(rec.total_lessons),
                created: 0, notcreated: 0, pending: 0, withGoals: 0, goals: 0, homeworks: 0, ethrat: 0, exams: 0, videos: 0,
                rows: [], subjects: {}, classes: {}, maxPeriod: 0, dayIdx: {} };
            days.forEach(function (d, i) {
                var l = lessons[d.Data];
                var st;
                if (!l) { st = "pending"; b.pending++; }
                else if (l.notcreated) { st = "notcreated"; b.notcreated++; }
                else { st = "created"; b.created++; b.homeworks += num(l.homeworks); b.ethrat += num(l.ethrat); b.exams += num(l.exams); }
                var subject = subjectOf(d);
                var di = normDay(pick(d, ["DayIndex", "Day", "DayName", "DayTitle", "WeekDay", "DayOfWeek", "DayId"]));
                if (di < 0) di = normDay(pick(d, ["Day", "DayName", "DayTitle", "WeekDay", "DayOfWeek"]));
                var period = num(pick(d, ["Period", "PeriodNumber", "PeriodIndex", "PeriodOrder", "Order", "Index", "LectureOrder"]));
                var g = (st === "created" && l.id !== undefined) ? goalsList(l.id) : null;
                if (g && g.list.length) { b.withGoals++; b.goals += g.list.length; }
                if (g) b.videos += g.videos.length;
                var row = {
                    n: i + 1, data: d.Data, st: st, l: l || {},
                    dayIdx: di, day: dayLabel(d, di), period: period, time: pick(d, ["StartTime", "Time", "FromTime", "PeriodTime"]),
                    subject: subject, title: lessonTitleOf(d, subject),
                    cls: pick(d, ["ClassName", "Class", "ClassroomName", "Classroom", "SectionName", "ClassRoomName"]),
                    goals: g
                };
                if (row.subject) b.subjects[row.subject] = 1;
                if (row.cls) b.classes[row.cls] = 1;
                if (period > b.maxPeriod) b.maxPeriod = period;
                if (di >= 0) b.dayIdx[di] = 1;
                b.rows.push(row);
            });
            b.rows.sort(function (a, c) { return (a.dayIdx - c.dayIdx) || (a.period - c.period) || (a.n - c.n); });
            b.pct = pct(b.created, b.total);
            blocks.push(b);
            tot.teachers++; tot.lessons += b.total; tot.created += b.created; tot.notcreated += b.notcreated; tot.pending += b.pending;
            tot.withGoals += b.withGoals; tot.goals += b.goals; tot.homeworks += b.homeworks; tot.ethrat += b.ethrat; tot.exams += b.exams; tot.videos += b.videos;
        });
        blocks.sort(function (a, b) { return String(a.name).localeCompare(String(b.name), "ar"); });

        // ── الملخص العام ──
        var html = "";
        html += h.stats([
            { label: "المعلمون", value: tot.teachers },
            { label: "إجمالي الحصص", value: tot.lessons },
            { label: "حصص مُعدّة", value: tot.created },
            { label: "حصص غير مُعدّة", value: tot.notcreated },
            { label: "نسبة الإعداد", value: pct(tot.created, tot.lessons) + "%" },
            { label: "حصص بأهداف", value: tot.withGoals },
            { label: "الواجبات", value: tot.homeworks },
            { label: "الإثراءات", value: tot.ethrat },
            { label: "الاختبارات", value: tot.exams },
            { label: "مقاطع فيديو", value: tot.videos }
        ]);
        if (tot.pending) {
            html += "<div class='notice'>تعذّر جلب تفاصيل <strong>" + tot.pending + "</strong> حصة (انتهت مهلة التحميل أو حدث خطأ في الشبكة)؛ لم تُحتسب ضمن المُعدّة ولا غير المُعدّة.</div>";
        }
        html += "<h2>ملخص الخطة الأسبوعية</h2>";
        html += h.table([
            { key: "name", label: "المعلم", cls: "text", width: "190px" },
            { key: "phone", label: "الجوال", cls: "num", width: "90px" },
            { key: function (b) { return Object.keys(b.subjects).join("، "); }, label: "المواد", cls: "text" },
            { key: function (b) { return Object.keys(b.classes).join("، "); }, label: "الفصول", cls: "text" },
            { key: "total", label: "الحصص", fmt: cell, width: "55px" },
            { key: "created", label: "مُعدّة", fmt: cell, width: "55px" },
            { key: "notcreated", label: "غير مُعدّة", width: "70px", fmt: function (v) { return v ? "<span class='num' style='color:var(--danger);font-weight:700'>" + h.esc(v) + "</span>" : cell(0); } },
            { key: "pct", label: "نسبة الإعداد", width: "80px", fmt: function (v, b) { return b.total ? cell(v + "%") : "—"; } },
            { key: "withGoals", label: "حصص بأهداف", fmt: cell, width: "80px" },
            { key: "homeworks", label: "واجبات", fmt: cell, width: "55px" },
            { key: "pct", label: "التقدير", width: "90px", fmt: function (v, b) {
                if (!b.total) return h.badge("لا حصص", "muted");
                return v >= 90 ? h.badge("ممتاز", "ok") : v >= 70 ? h.badge("جيد", "ok") : v >= 50 ? h.badge("يحتاج متابعة", "warn") : h.badge("ضعيف", "danger");
            } }
        ], blocks, { cls: "summary" });
        html += h.signatures(["وكيل الشؤون التعليمية", "مدير المدرسة"]);

        // ── خطة كل معلم في صفحة مستقلة ──
        blocks.forEach(function (b) {
            html += h.pageBreak();
            html += "<section class='teacher-block' data-id='" + h.esc(b.id) + "'>";
            html += "<h2 style='margin-top:0'>الخطة الأسبوعية — " + h.esc(b.name) + "</h2>";
            html += "<p style='color:var(--muted);font-size:12px'>" +
                (params.date ? "الأسبوع: <strong>" + h.esc(params.date) + "</strong> &nbsp;|&nbsp; " : "") +
                "المواد: <strong>" + h.esc(Object.keys(b.subjects).join("، ") || "—") + "</strong> &nbsp;|&nbsp; " +
                "الفصول: <strong>" + h.esc(Object.keys(b.classes).join("، ") || "—") + "</strong> &nbsp;|&nbsp; " +
                "الجوال: <span class='num'>" + h.esc(b.phone || "—") + "</span></p>";
            html += h.stats([
                { label: "الحصص", value: b.total },
                { label: "مُعدّة", value: b.created },
                { label: "غير مُعدّة", value: b.notcreated },
                { label: "نسبة الإعداد", value: b.total ? b.pct + "%" : "—" },
                { label: "حصص بأهداف", value: b.withGoals },
                { label: "الأهداف", value: b.goals },
                { label: "واجبات", value: b.homeworks },
                { label: "إثراءات", value: b.ethrat }
            ]);

            if (!b.rows.length) {
                html += "<div class='notice'>لا توجد حصص في جدول هذا المعلم لهذا الأسبوع.</div>";
                html += "</section>";
                return;
            }

            // جدول الأيام × الحصص
            var canGrid = b.maxPeriod > 0 && Object.keys(b.dayIdx).length > 0;
            if (canGrid) {
                var grid = {};
                b.rows.forEach(function (r) {
                    if (r.dayIdx < 0 || !r.period) return;
                    (grid[r.dayIdx + "|" + r.period] = grid[r.dayIdx + "|" + r.period] || []).push(r);
                });
                var P = Math.max(b.maxPeriod, 1);
                html += "<h3>جدول الحصص الأسبوعي</h3>";
                html += "<table class='rpt wp-grid'><thead><tr><th style='width:70px'>اليوم</th>";
                for (var p = 1; p <= P; p++) html += "<th>الحصة " + p + "</th>";
                html += "</tr></thead><tbody>";
                DAYS.forEach(function (dn, di) {
                    html += "<tr><th class='text' style='background:var(--head)'>" + h.esc(dn) + "</th>";
                    for (var q = 1; q <= P; q++) {
                        var list = grid[di + "|" + q] || [];
                        if (!list.length) { html += "<td class='wp-empty'>—</td>"; continue; }
                        html += "<td class='wp-cell wp-" + h.esc(list[0].st) + "'>" + list.map(function (r) {
                            return "<div class='wp-sub'>" + h.esc(r.subject || r.title || "حصة") + "</div>" +
                                (r.cls ? "<div class='wp-cls'>" + h.esc(r.cls) + "</div>" : "") +
                                (r.title ? "<div class='wp-title'>" + h.esc(r.title) + "</div>" : "") +
                                "<div>" + statusBadge(r.st) + "</div>";
                        }).join("<hr class='wp-sep'>") + "</td>";
                    }
                    html += "</tr>";
                });
                html += "</tbody></table>";
            }

            // تفاصيل الدروس والأهداف
            html += "<h3>الدروس وأهدافها</h3>";
            html += h.table([
                { key: "day", label: "اليوم", cls: "text", width: "62px" },
                { key: "period", label: "الحصة", width: "42px", fmt: function (v) { return v ? cell(v) : "—"; } },
                { key: "subject", label: "المادة", cls: "text", width: "90px" },
                { key: "cls", label: "الفصل", cls: "text", width: "62px" },
                { key: "title", label: "عنوان الدرس", cls: "text", width: "150px", fmt: function (v, r) { return v ? h.esc(v) : (r.st === "created" ? "<span style='color:var(--muted)'>—</span>" : "—"); } },
                { key: "goals", label: "أهداف الدرس", cls: "text", fmt: function (g, r) {
                    if (r.st === "notcreated") return "<span style='color:var(--danger)'>لم يُنشأ الدرس في مدرستي</span>";
                    if (r.st === "pending") return "<span style='color:var(--muted)'>لم تُجلب التفاصيل</span>";
                    if (!g || !g.list.length) return "<span style='color:var(--warn)'>لم تُسجَّل أهداف</span>";
                    return "<ol class='wp-goals'>" + g.list.map(function (s) { return "<li>" + h.esc(s) + "</li>"; }).join("") + "</ol>";
                } },
                { key: "l", label: "واجبات", width: "50px", fmt: function (l, r) { return r.st === "created" ? cell(num(l.homeworks)) : "—"; } },
                { key: "l", label: "إثراءات", width: "50px", fmt: function (l, r) { return r.st === "created" ? cell(num(l.ethrat)) : "—"; } },
                { key: "l", label: "اختبارات", width: "52px", fmt: function (l, r) { return r.st === "created" ? cell(num(l.exams)) : "—"; } },
                { key: "goals", label: "فيديو", width: "48px", fmt: function (g, r) { return r.st === "created" && g ? cell(g.videos.length) : "—"; } },
                { key: "st", label: "الحالة", width: "70px", fmt: statusBadge }
            ], b.rows, { cls: "detail" });

            // ملاحظات الواجبات إن وُجدت
            var hws = b.rows.filter(function (r) { return r.st === "created" && r.l.homeworks_html && String(r.l.homeworks_html).trim(); });
            if (hws.length) {
                html += "<h3>الواجبات المسجّلة</h3><ul class='wp-hw'>" + hws.map(function (r) {
                    return "<li><strong>" + h.esc(r.day) + (r.period ? " / الحصة " + h.esc(r.period) : "") + " — " + h.esc(r.subject) + (r.cls ? " (" + h.esc(r.cls) + ")" : "") + ":</strong> " +
                        h.esc(String(r.l.homeworks_html).replace(/\s+/g, " ").trim());
                }).join("") + "</ul>";
            }

            html += h.signatures(["المعلم", "وكيل الشؤون التعليمية", "مدير المدرسة"]);
            html += "</section>";
        });

        html += "<style>" +
            ".wp-grid td{vertical-align:top;padding:4px 4px;font-size:11px;min-width:84px}" +
            ".wp-grid .wp-empty{color:#bbb}" +
            ".wp-grid .wp-sub{font-weight:800}" +
            ".wp-grid .wp-cls{color:var(--muted);font-size:10.5px}" +
            ".wp-grid .wp-title{font-size:10.5px;margin:1px 0 2px;line-height:1.35}" +
            ".wp-grid .wp-created{background:#f3fbf5}" +
            ".wp-grid .wp-notcreated{background:#fdf1f0}" +
            ".wp-grid .wp-sep{border:0;border-top:1px dashed var(--line);margin:3px 0}" +
            "ol.wp-goals{margin:0;padding-right:16px;line-height:1.55;font-size:11.5px}" +
            "ul.wp-hw{margin:4px 0 0;padding-right:18px;line-height:1.7;font-size:12px}" +
            "table.rpt.detail td{font-size:11.5px}" +
            ".teacher-block{page-break-inside:auto}" +
            "</style>";
        return html;
    },
    onReady: function (root, data, params, h) {
        // قائمة لاختيار معلم واحد (لطباعة خطته وحدها) وزر لإظهار الكل
        var blocks = root.querySelectorAll(".teacher-block");
        if (!blocks.length) return;
        var bar = document.createElement("div");
        bar.className = "no-print";
        bar.style.cssText = "margin:8px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap";
        var label = document.createElement("span");
        label.textContent = "عرض خطة معلم واحد:";
        var sel = document.createElement("select");
        sel.className = "btn";
        var all = document.createElement("option");
        all.value = "";
        all.textContent = "جميع المعلمين";
        sel.appendChild(all);
        Array.prototype.forEach.call(blocks, function (b) {
            var o = document.createElement("option");
            o.value = b.getAttribute("data-id");
            o.textContent = (b.querySelector("h2") || {}).textContent || o.value;
            o.textContent = o.textContent.replace(/^الخطة الأسبوعية — /, "");
            sel.appendChild(o);
        });
        var summaryEls = [];
        var firstBlock = blocks[0];
        var n = root.firstChild;
        while (n && n !== firstBlock) { summaryEls.push(n); n = n.nextSibling; }
        function apply() {
            var v = sel.value;
            Array.prototype.forEach.call(blocks, function (b) {
                b.style.display = (!v || b.getAttribute("data-id") === v) ? "" : "none";
            });
            summaryEls.forEach(function (el) {
                if (el === bar || el.nodeType !== 1) return;
                el.style.display = v ? "none" : "";
            });
            // فاصل الصفحة قبل الكتلة الظاهرة الأولى يُخفى عند اختيار معلم واحد
            Array.prototype.forEach.call(root.querySelectorAll(".page-break"), function (pb) { pb.style.display = v ? "none" : ""; });
        }
        sel.addEventListener("change", apply);
        bar.appendChild(label);
        bar.appendChild(sel);
        root.insertBefore(bar, root.firstChild);
        summaryEls.push(bar);
    }
});
