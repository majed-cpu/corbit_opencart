// تقرير أداء الطلاب الشامل (مدرستي) — بديل محلي لصفحة /reports/homeworks-full القديمة.
//
// الميزة: assets/js/features/madrasati/homeworks.js (خيار «تقرير أداء الطلاب الشامل»)
// المفتاح المحفوظ fullReportData (JSON):
//   { counts: { homeworks, exams, activities },                // عدد العناصر المنشورة لكل نوع (صفحتا 1 و2)
//     students: [{ name,
//                  homeworks:  { completed, attempted, total, notCompleted },
//                  exams:      { ... }, activities: { ... }, total: { ... },
//                  percentage }] }                             // completed/total × 100
//   completed = درجة أكبر من صفر، attempted = سُلّم (درجة أو نص لا يحوي "لم")، total = عدد العناصر المطلوبة من الطالب.
// المعاملات: school_id. الفصل وجوال ولي الأمر يُقرآن من القائمة المستوردة m_students_/n_students_<school_id>.
(function () {
    "use strict";

    var LOW = 50; // حدّ الإنجاز المنخفض (%)

    function clean(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }
    function nameKey(s) {
        return clean(s).replace(/[ً-ْـ]/g, "")
            .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
            .replace(/\bبن\b|\bبنت\b/g, "").replace(/\s+/g, " ").trim();
    }
    function part(p) {
        p = p || {};
        var total = +p.total || 0, completed = +p.completed || 0;
        return { total: total, completed: completed, attempted: +p.attempted || 0, notCompleted: p.notCompleted != null ? +p.notCompleted : total - completed };
    }

    function directory(data, params) {
        var lists = [data["m_students_" + params.school_id], data["n_students_" + params.school_id]];
        var dir = {};
        lists.forEach(function (list) {
            if (!Array.isArray(list)) return;
            list.forEach(function (s) {
                if (!s || !s.name) return;
                var k = nameKey(s.name);
                if (dir[k]) return;
                dir[k] = { phone: clean(s.parent_phone || s.phone || s.student_phone || ""), classroom: clean(s.classroom || s.row_name || s.classname || "") };
            });
        });
        return dir;
    }
    function lookup(dir, name) {
        var k = nameKey(name);
        if (dir[k]) return dir[k];
        for (var key in dir) { if (key.indexOf(k) === 0 || k.indexOf(key) === 0) return dir[key]; }
        return null;
    }

    function normalize(data, params) {
        var raw = data.fullReportData;
        if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch (_) { raw = null; } }
        if (!raw || !Array.isArray(raw.students)) return null;
        var dir = directory(data, params);
        var rows = raw.students.map(function (s) {
            var hw = part(s.homeworks), ex = part(s.exams), ac = part(s.activities);
            var tt = s.total ? part(s.total) : { total: hw.total + ex.total + ac.total, completed: hw.completed + ex.completed + ac.completed, attempted: hw.attempted + ex.attempted + ac.attempted };
            tt.notCompleted = tt.total - tt.completed;
            var d = lookup(dir, s.name);
            return {
                name: clean(s.name), classroom: d ? d.classroom : "", phone: d ? d.phone : "",
                homeworks: hw, exams: ex, activities: ac, total: tt,
                percentage: s.percentage != null ? +s.percentage : (tt.total ? Math.round(tt.completed / tt.total * 100) : 0)
            };
        });
        return { counts: raw.counts || {}, rows: rows, hasDir: Object.keys(dir).length > 0 };
    }

    function pctBadge(p, h) {
        return h.badge(p + "%", p >= 75 ? "ok" : p >= LOW ? "warn" : "danger");
    }

    // جدول بترويسة من صفّين (مجموعة لكل نوع)
    function perfTable(rows, h, startIndex) {
        var groups = [["الواجبات", "homeworks"], ["الاختبارات", "exams"], ["الأنشطة", "activities"], ["الإجمالي", "total"]];
        var html = "<table class='rpt'><thead><tr>" +
            "<th rowspan='2' style='width:30px'>#</th><th rowspan='2'>اسم الطالب</th><th rowspan='2' style='width:60px'>الفصل</th>";
        groups.forEach(function (g) { html += "<th colspan='3'>" + g[0] + "</th>"; });
        html += "<th rowspan='2' style='width:64px'>نسبة الإنجاز</th></tr><tr>";
        groups.forEach(function () { html += "<th>مطلوب</th><th>محلول</th><th>لم يُحل</th>"; });
        html += "</tr></thead><tbody>";
        if (!rows.length) html += "<tr><td colspan='16'>لا توجد بيانات</td></tr>";
        rows.forEach(function (r, i) {
            html += "<tr><td>" + ((startIndex || 0) + i + 1) + "</td><td class='text'>" + h.esc(r.name) + "</td><td>" + h.esc(r.classroom || "—") + "</td>";
            groups.forEach(function (g) {
                var p = r[g[1]];
                html += "<td>" + p.total + "</td><td>" + p.completed + "</td><td" + (p.notCompleted > 0 ? " style='color:#B3261E;font-weight:700'" : "") + ">" + p.notCompleted + "</td>";
            });
            html += "<td>" + pctBadge(r.percentage, h) + "</td></tr>";
        });
        // صف المجموع
        if (rows.length) {
            html += "<tr style='font-weight:800;background:#f3f3f5'><td colspan='3'>المجموع (" + rows.length + " طالباً)</td>";
            groups.forEach(function (g) {
                var t = 0, c = 0, n = 0;
                rows.forEach(function (r) { t += r[g[1]].total; c += r[g[1]].completed; n += r[g[1]].notCompleted; });
                html += "<td>" + t + "</td><td>" + c + "</td><td>" + n + "</td>";
            });
            var avg = rows.length ? Math.round(rows.reduce(function (a, r) { return a + r.percentage; }, 0) / rows.length) : 0;
            html += "<td>" + avg + "%</td></tr>";
        }
        return html + "</tbody></table>";
    }

    CorbitReports.register("homeworks-full", {
        title: "تقرير أداء الطلاب الشامل",
        subtitle: function (data) {
            var r = data.fullReportData, c = r && r.counts ? r.counts : {};
            return "إنجاز الواجبات والاختبارات والأنشطة المنشورة في مدرستي للفصل الدراسي الحالي" +
                (c.homeworks != null ? " — " + (+c.homeworks || 0) + " واجب، " + (+c.exams || 0) + " اختبار، " + (+c.activities || 0) + " نشاط" : "");
        },
        landscape: true,
        keys: function (params) { return ["fullReportData", "m_students_" + params.school_id, "n_students_" + params.school_id]; },
        render: function (data, params, h) {
            var d = normalize(data, params);
            if (!d) {
                return "<div class='notice'><strong>لا توجد بيانات لهذا التقرير.</strong><br>" +
                    "من قائمة سكول بت في مدرستي اختر «الواجبات والاختبارات والأنشطة للطلاب» ثم «تقرير أداء الطلاب الشامل» واضغط «عرض التقرير»؛ " +
                    "سيُجمَّع التقرير من مدرستي ثم يُفتح هنا.</div>";
            }
            var rows = d.rows.slice().sort(function (a, b) {
                return (a.classroom || "").localeCompare(b.classroom || "", "ar") || b.percentage - a.percentage || a.name.localeCompare(b.name, "ar");
            });
            var c = d.counts;
            var avg = rows.length ? Math.round(rows.reduce(function (a, r) { return a + r.percentage; }, 0) / rows.length) : 0;
            var low = rows.filter(function (r) { return r.percentage < LOW; });
            var full = rows.filter(function (r) { return r.percentage >= 100; }).length;
            var out = "";

            out += h.stats([
                { label: "الواجبات المنشورة", value: +c.homeworks || 0 },
                { label: "الاختبارات المنشورة", value: +c.exams || 0 },
                { label: "الأنشطة المنشورة", value: +c.activities || 0 },
                { label: "عدد الطلاب", value: rows.length },
                { label: "متوسط الإنجاز", value: avg + "%" },
                { label: "أنجزوا كل المطلوب", value: full },
                { label: "إنجاز أقل من " + LOW + "%", value: low.length }
            ]);
            out += "<p style='color:#666;font-size:11px'>«مطلوب» = عدد العناصر المسنَدة للطالب، «محلول» = ما حصل فيه على درجة أكبر من صفر، «لم يُحل» = الفرق بينهما. " +
                "نسبة الإنجاز = المحلول ÷ المطلوب. الصفوف مرتّبة حسب الفصل ثم نسبة الإنجاز تنازلياً.</p>";

            if (!rows.length) {
                out += "<div class='notice'>لم يُعثر على أي طالب في العناصر المنشورة. تأكد من وجود واجبات أو اختبارات أو أنشطة منشورة في الفصل الدراسي الحالي.</div>";
                return out;
            }
            if (!d.hasDir) {
                out += "<div class='notice no-print'>لم تُستورد قائمة الطلاب بعد، لذلك لا تظهر الفصول وأرقام الجوال. " +
                    "استورد بيانات الطلاب أولاً من قائمة سكول بت (استيراد الطلاب من مدرستي أو من نور) لتجميع التقرير حسب الفصل وإرسال التنبيهات.</div>";
            }

            // جدول لكل فصل عند توفر الفصول، وإلا جدول واحد
            var groups = h.group(rows, function (r) { return r.classroom || ""; });
            var keys = Object.keys(groups);
            if (keys.length > 1 || (keys.length === 1 && keys[0])) {
                keys.sort(function (a, b) { return (a || "ي").localeCompare(b || "ي", "ar"); });
                var idx = 0;
                keys.forEach(function (k) {
                    var g = groups[k];
                    var gavg = Math.round(g.reduce(function (a, r) { return a + r.percentage; }, 0) / g.length);
                    out += "<h2>" + (k ? "الفصل: " + h.esc(k) : "طلاب بلا فصل في القائمة المستوردة") + " <small style='color:#666;font-weight:400'>(" + g.length + " طالباً — متوسط الإنجاز " + gavg + "%)</small></h2>";
                    out += perfTable(g, h, idx);
                    idx += g.length;
                });
            } else {
                out += "<h2>أداء الطلاب (" + rows.length + ")</h2>" + perfTable(rows, h, 0);
            }

            // الطلاب الأقل إنجازاً
            out += "<h2>الطلاب الذين تقل نسبة إنجازهم عن " + LOW + "% (" + low.length + ")</h2>";
            if (!low.length) {
                out += "<div class='notice'>لا يوجد طالب تقل نسبة إنجازه عن " + LOW + "%.</div>";
            } else {
                var lowSorted = low.slice().sort(function (a, b) { return a.percentage - b.percentage; });
                out += h.table([
                    { key: "name", label: "اسم الطالب", cls: "text" },
                    { key: "classroom", label: "الفصل", fmt: function (v) { return h.esc(v || "—"); } },
                    { key: function (r) { return r.total.total; }, label: "المطلوب" },
                    { key: function (r) { return r.total.completed; }, label: "المحلول" },
                    { key: function (r) { return r.total.notCompleted; }, label: "لم يُحل" },
                    { key: "percentage", label: "نسبة الإنجاز", fmt: function (v) { return pctBadge(v, h); } },
                    { key: "phone", label: "جوال ولي الأمر", cls: "num", fmt: function (v) { return v ? h.esc(v) : h.badge("غير متوفر", "muted"); } }
                ], lowSorted);

                var withPhone = lowSorted.filter(function (r) { return r.phone; }).length;
                var school = data.school_name || params.school_name || "";
                var defMsg = "ولي أمر الطالب {الطالب}، نفيدكم بأن نسبة إنجاز ابنكم للواجبات والاختبارات والأنشطة في منصة مدرستي بلغت {النسبة}% ({المحلول} من {المطلوب}). نأمل متابعته وحثّه على الإنجاز. " + (school ? "إدارة " + school : "إدارة المدرسة");
                out += "<div class='notice no-print' id='sms-panel'>" +
                    "<strong>إرسال تنبيه لأولياء أمور الطلاب الأقل إنجازاً</strong> — المستهدفون: " + lowSorted.length +
                    " طالباً، منهم " + withPhone + " لديهم رقم جوال في القائمة المستوردة.<br>" +
                    "<label style='display:block;margin:6px 0 2px'>نص الرسالة (يمكن استخدام {الطالب} {النسبة} {المحلول} {المطلوب}):</label>" +
                    "<textarea id='sms-text' rows='3' style='width:100%;font-family:inherit;font-size:13px;padding:6px;border:1px solid #cfcfcf;border-radius:6px'>" + h.esc(defMsg) + "</textarea>" +
                    "<div style='margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap'>" +
                    "<button class='btn btn-primary' id='sms-send' type='button'>📨 إرسال التنبيهات</button>" +
                    "<button class='btn' id='sms-settings' type='button'>⚙️ إعدادات بوابة الرسائل</button>" +
                    "<span id='sms-status' style='color:#666'></span></div></div>";
            }

            out += h.signatures(["وكيل الشؤون التعليمية", "الموجّه الطلابي", "مدير المدرسة"]);
            return out;
        },
        onReady: function (root, data, params) {
            var btn = root.querySelector("#sms-send");
            if (!btn) return;
            var status = root.querySelector("#sms-status");
            root.querySelector("#sms-settings").addEventListener("click", function () { if (window.CorbitSMS) CorbitSMS.openSettings(); });
            var d = normalize(data, params);
            var low = d ? d.rows.filter(function (r) { return r.percentage < LOW && r.phone; }) : [];

            btn.addEventListener("click", function () {
                if (!window.CorbitSMS) { status.textContent = "وحدة الرسائل غير محمّلة."; return; }
                var tpl = root.querySelector("#sms-text").value || "";
                var msgs = low.map(function (r) {
                    return { phone: r.phone, message: tpl.replace(/\{الطالب\}/g, r.name).replace(/\{النسبة\}/g, String(r.percentage)).replace(/\{المحلول\}/g, String(r.total.completed)).replace(/\{المطلوب\}/g, String(r.total.total)) };
                });
                if (!msgs.length) { status.textContent = "لا يوجد طالب لديه رقم جوال. استورد قائمة الطلاب أولاً."; return; }
                CorbitSMS.isConfigured().then(function (ok) {
                    if (!ok) { status.textContent = "بوابة الرسائل غير معدّة — افتح الإعدادات وأدخل مفتاح API أولاً."; return; }
                    if (!window.confirm("سيتم إرسال " + msgs.length + " رسالة. هل أنت متأكد؟")) return;
                    btn.disabled = true;
                    status.textContent = "جارٍ الإرسال…";
                    CorbitSMS.send(msgs, function (done, total) { status.textContent = "جارٍ الإرسال… " + done + " / " + total; })
                        .then(function (res) {
                            status.textContent = res.success ? "تم إرسال " + res.sent + " رسالة بنجاح." : "أُرسلت " + res.sent + " وفشلت " + res.failed + ". راجع إعدادات البوابة والرصيد.";
                        })
                        .catch(function (e) { status.textContent = "خطأ: " + (e && e.message || e); })
                        .then(function () { btn.disabled = false; });
                });
            });
        }
    });
})();
