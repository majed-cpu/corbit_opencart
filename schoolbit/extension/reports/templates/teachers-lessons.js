// تقرير تحضير الدروس للمعلمين (مدرستي) — بديل محلي لصفحة /reports/teachers-lessons القديمة.
//
// الميزة: assets/js/features/madrasati/teachers-lessons.js
// المفاتيح المحفوظة:
//   teachersLessonsHTML : [{ id, name, phone, data: { TimeTable: [ { Data, PresenterUrl, LessonType, ... } ] } }]
//                         (رغم الاسم فهي JSON لا HTML — جدول حصص كل معلم المختار في اليوم المحدد)
//   teachers            : [{ name, phone, id }]  كل معلمي المدرسة (للمقارنة)
//   datas               : { <Data>: { ethrat, homeworks, exams, actives, pre, voc, goals, strat, tools, skills, close, notes } }
//                         تُملأ فقط عند تفعيل «الاستعلام عن العناصر الغير معدة في الدروس»، وإلا تكون {}
// المعاملات: school_id, dayindex, date
(function () {
    "use strict";

    // الحصة تُعدّ «محضَّرة» بنفس شرط الميزة: ليست (PresenterUrl فارغ && بلا LessonType)
    function isPrepared(l) {
        var noUrl = l.PresenterUrl == null || l.PresenterUrl === "";
        return !(noUrl && !l.LessonType);
    }

    // قراءة مرنة لحقول حصة مدرستي (تختلف أسماؤها بين الإصدارات)
    function pick(obj, keys) {
        for (var i = 0; i < keys.length; i++) {
            var v = obj[keys[i]];
            if (v != null && String(v).trim() !== "" && typeof v !== "object") return String(v).trim();
        }
        return "";
    }
    var SUBJECT = ["SubjectName", "Subject", "CourseName", "Course", "MaterialName", "Material"];
    var CLASS = ["ClassName", "ClassRoomName", "ClassRoom", "SectionName", "Section", "GradeName", "Grade", "ClassSection"];
    var PERIOD = ["PeriodName", "Period", "PeriodIndex", "PeriodNumber", "LectureIndex", "Index", "Order", "Sequence"];
    var START = ["StartTime", "Start", "FromTime", "From", "Time"];
    var END = ["EndTime", "End", "ToTime", "To"];
    var TITLE = ["Title", "LessonTitle", "LessonName", "LectureTitle", "Name", "Description"];
    var SKIP = { Data: 1, PresenterUrl: 1, LessonType: 1, Id: 1, ID: 1 };

    function lessonInfo(l) {
        var info = {
            subject: pick(l, SUBJECT),
            cls: pick(l, CLASS),
            period: pick(l, PERIOD),
            time: pick(l, START) + (pick(l, END) ? " - " + pick(l, END) : ""),
            title: pick(l, TITLE)
        };
        if (!info.subject && !info.title && !info.cls) {
            // شكل غير معروف: اعرض كل النصوص القصيرة كوصف
            var parts = [];
            Object.keys(l).forEach(function (k) {
                var v = l[k];
                if (SKIP[k] || v == null || typeof v === "object") return;
                var s = String(v).trim();
                if (!s || /^https?:\/\//i.test(s) || s.length > 80) return;
                parts.push(s);
            });
            info.title = parts.join(" / ");
        }
        return info;
    }

    // عناصر التحضير كما تحفظها الميزة في «datas»
    var COUNT_ELS = [
        { key: "ethrat", label: "إثراءات" },
        { key: "homeworks", label: "واجبات" },
        { key: "exams", label: "اختبارات" },
        { key: "actives", label: "أنشطة" }
    ];
    var FLAG_ELS = [
        { key: "pre", label: "تمهيد" },
        { key: "voc", label: "مفردات" },
        { key: "goals", label: "أهداف" },
        { key: "strat", label: "استراتيجيات" },
        { key: "tools", label: "وسائل" },
        { key: "skills", label: "مهارات تفكير" },
        { key: "close", label: "غلق" },
        { key: "notes", label: "ملاحظات" }
    ];
    function missingCount(d) {
        var n = 0;
        COUNT_ELS.concat(FLAG_ELS).forEach(function (e) { if (!Number(d[e.key])) n++; });
        return n;
    }

    function pct(a, b) { return b ? Math.round(a * 100 / b) : 0; }
    function pctBadge(h, a, b) {
        var p = pct(a, b);
        return h.badge(p + "%", p >= 90 ? "ok" : p >= 60 ? "warn" : "danger");
    }

    CorbitReports.register("teachers-lessons", {
        title: "تقرير تحضير الدروس للمعلمين",
        subtitle: function (data, params) {
            var s = [];
            if (params.date) s.push("اليوم: " + params.date);
            else if (params.dayindex) s.push("اليوم رقم " + params.dayindex + " من الأسبوع");
            var datas = data.datas;
            if (datas && typeof datas === "object" && Object.keys(datas).length) s.push("مع الاستعلام عن عناصر التحضير");
            return s.join(" — ");
        },
        keys: ["teachersLessonsHTML", "teachers", "datas"],
        render: function (data, params, h) {
            var rows = data.teachersLessonsHTML;
            if (typeof rows === "string") { try { rows = JSON.parse(rows); } catch (_) { rows = null; } }
            if (!Array.isArray(rows) || !rows.length) {
                return "<div class='notice'><strong>لا توجد بيانات لهذا التقرير.</strong><br>" +
                    "من داخل مدرستي افتح قائمة سكول بت ← <b>تقرير تحضير الدروس للمعلمين</b>، اختر اليوم من الجدول ثم حدّد المعلمين واضغط «عرض التقرير الآن».</div>";
            }
            var allTeachers = Array.isArray(data.teachers) ? data.teachers : [];
            var datas = (data.datas && typeof data.datas === "object") ? data.datas : {};
            var detailed = Object.keys(datas).length > 0;

            // ── تجميع ──
            var totalLessons = 0, prepared = 0, totalMissing = 0, teachersNoLessons = 0;
            var summary = rows.map(function (t) {
                var tt = (t.data && Array.isArray(t.data.TimeTable)) ? t.data.TimeTable : [];
                var p = 0, miss = 0, checked = 0;
                tt.forEach(function (l) {
                    if (isPrepared(l)) p++;
                    var d = l.Data != null ? datas[l.Data] : null;
                    if (d) { checked++; miss += missingCount(d); }
                });
                totalLessons += tt.length; prepared += p; totalMissing += miss;
                if (!tt.length) teachersNoLessons++;
                return { name: t.name || "", phone: t.phone || "", id: t.id, lessons: tt, count: tt.length, prepared: p, notPrepared: tt.length - p, missing: miss, checked: checked };
            });

            var html = "";
            html += "<style>" +
                ".tl-teacher{margin-top:14px;padding-top:6px;border-top:2px solid #eee;page-break-inside:avoid}" +
                ".tl-teacher h2{display:flex;justify-content:space-between;align-items:center;gap:8px}" +
                ".tl-teacher h2 .ph{font-size:12px;color:#666;font-family:Tahoma,Arial,sans-serif;direction:ltr}" +
                ".tl-teacher h2 .sm{font-size:12px;font-weight:400;color:#666}" +
                "table.tl-els th,table.tl-els td{font-size:11px;padding:3px 4px}" +
                "table.tl-els{table-layout:fixed}table.tl-els th{font-size:10px;padding:3px 1px;line-height:1.3}" +
                "table.tl-els td.text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
                "table.tl-els th:first-child{width:24px}table.tl-els th:nth-child(2){width:96px}" +
                "table.tl-els .ok{color:#1B7E3A;font-weight:800}table.tl-els .no{color:#B3261E;font-weight:800}" +
                ".tl-legend{font-size:11px;color:#666;margin:2px 0 8px}" +
                "</style>";

            // ── الإحصائيات ──
            var stats = [
                { label: "المعلمون المختارون", value: rows.length + (allTeachers.length ? " / " + allTeachers.length : "") },
                { label: "إجمالي الحصص", value: totalLessons },
                { label: "حصص محضَّرة", value: prepared },
                { label: "حصص غير محضَّرة", value: totalLessons - prepared },
                { label: "نسبة التحضير", value: pct(prepared, totalLessons) + "%" }
            ];
            if (detailed) stats.push({ label: "عناصر غير معدّة", value: totalMissing });
            if (teachersNoLessons) stats.push({ label: "معلمون بلا حصص اليوم", value: teachersNoLessons });
            html += h.stats(stats);

            // ── ملخص المعلمين ──
            html += "<h2>ملخص تحضير المعلمين</h2>";
            var sumCols = [
                { key: "name", label: "المعلم", cls: "text" },
                { key: "phone", label: "الجوال", cls: "num" },
                { key: "count", label: "الحصص" },
                { key: "prepared", label: "محضَّرة" },
                { key: "notPrepared", label: "غير محضَّرة", fmt: function (v) { return v ? h.badge(v, "danger") : h.esc(v); } },
                { key: function (r) { return r; }, label: "نسبة التحضير", fmt: function (r) { return r.count ? pctBadge(h, r.prepared, r.count) : h.badge("لا حصص", "muted"); } }
            ];
            if (detailed) sumCols.push({ key: "missing", label: "عناصر غير معدّة", fmt: function (v, r) { return r.checked ? (v ? h.badge(v, "warn") : h.badge("مكتمل", "ok")) : h.badge("—", "muted"); } });
            html += h.table(sumCols, summary);

            // ── تفاصيل كل معلم ──
            html += "<h2>تفاصيل حصص اليوم لكل معلم</h2>";
            var lessonCols = [
                { key: "period", label: "الحصة" },
                { key: "time", label: "الوقت", cls: "num" },
                { key: "subject", label: "المادة", cls: "text" },
                { key: "cls", label: "الفصل", cls: "text" },
                { key: "title", label: "عنوان الدرس", cls: "text" },
                { key: "status", label: "حالة التحضير", fmt: function (v) { return h.badge(v ? "تم التحضير" : "لم يُحضَّر", v ? "ok" : "danger"); } }
            ];
            summary.forEach(function (t) {
                html += "<div class='tl-teacher'><h2><span>" + h.esc(t.name) + "</span>" +
                    "<span class='sm'>" + h.esc(t.count) + " حصص · محضَّرة " + h.esc(t.prepared) + " · غير محضَّرة " + h.esc(t.notPrepared) + "</span>" +
                    "<span class='ph'>" + h.esc(t.phone) + "</span></h2>";
                if (!t.count) {
                    html += "<div class='notice'>لا توجد حصص لهذا المعلم في اليوم المحدد.</div></div>";
                    return;
                }
                var lrows = t.lessons.map(function (l) {
                    var info = lessonInfo(l);
                    info.status = isPrepared(l);
                    info.els = l.Data != null ? datas[l.Data] : null;
                    info.raw = l;
                    return info;
                });
                html += h.table(lessonCols, lrows);

                if (detailed) {
                    var withEls = lrows.filter(function (r) { return r.els; });
                    if (withEls.length) {
                        html += "<h3>عناصر التحضير</h3>";
                        var elCols = [
                            { key: function (r) { return r.period || r.title || r.subject; }, label: "الحصة", cls: "text" }
                        ];
                        COUNT_ELS.forEach(function (e) {
                            elCols.push({ key: function (r) { return r.els[e.key]; }, label: e.label, fmt: function (v) {
                                var n = Number(v) || 0;
                                return "<span class='" + (n ? "ok" : "no") + "'>" + n + "</span>";
                            } });
                        });
                        FLAG_ELS.forEach(function (e) {
                            elCols.push({ key: function (r) { return r.els[e.key]; }, label: e.label, fmt: function (v) {
                                return Number(v) ? "<span class='ok'>✓</span>" : "<span class='no'>✗</span>";
                            } });
                        });
                        elCols.push({ key: function (r) { return missingCount(r.els); }, label: "ناقص", fmt: function (v) { return v ? h.badge(v, "warn") : h.badge("0", "ok"); } });
                        html += h.table(elCols, withEls, { cls: "tl-els" });
                        html += "<div class='tl-legend'>الأرقام = عدد العناصر المضافة، ✓ = معدّ، ✗ = غير معدّ. الحصص غير المحضَّرة لا تُستعلم عناصرها.</div>";
                    } else {
                        html += "<div class='tl-legend'>لم تُستعلم عناصر التحضير لهذا المعلم (لا توجد حصص محضَّرة).</div>";
                    }
                }
                html += "</div>";
            });

            // ── معلمون لم يُختاروا ──
            if (allTeachers.length) {
                var chosen = {};
                rows.forEach(function (t) { chosen[String(t.id)] = 1; });
                var notChosen = allTeachers.filter(function (t) { return !chosen[String(t.id)]; });
                if (notChosen.length) {
                    html += "<h3>معلمون لم يُشملوا في هذا التقرير (" + notChosen.length + ")</h3>" +
                        "<p>" + notChosen.map(function (t) { return h.esc(t.name); }).join("، ") + "</p>";
                }
            }

            html += h.signatures(["وكيل الشؤون التعليمية", "مدير المدرسة"]);
            return html;
        }
    });
})();
