// إنذارات الغياب — يُبنى من البيانات التي تحفظها ميزة assets/js/features/noor/alerts.js
// (زر «طباعة وارسال انذارات الغياب» في تقرير نور: الغياب على مستوى الطالب AbsenceOnStudentLevel):
//   "alerts" = [ { name, count (عدد أيام الغياب بدون عذر), days: [ { date: "1448/03/02", day: "الأحد" }, ... ] } ]
//   "n_students_<school_id>" / "m_students_<school_id>" (اختياري) = قائمة الطلاب المستوردة لمعرفة الصف وجوال ولي الأمر
// المعاملات: school_id, school_name
CorbitReports.register("students-alerts", {
    title: "إنذارات الغياب بدون عذر",
    subtitle: function (data, params) {
        var a = Array.isArray(data.alerts) ? data.alerts : [];
        return a.length ? "خطابات إنذار لأولياء أمور " + a.length + " طالباً وفق تقرير الغياب في نظام نور" : "حسب تقرير الغياب على مستوى الطالب في نظام نور";
    },
    keys: function (params) { return ["alerts", "n_students_" + params.school_id, "m_students_" + params.school_id]; },

    render: function (data, params, h) {
        var alerts = Array.isArray(data.alerts) ? data.alerts : null;
        var school = params.school_name || data.school_name || "";

        if (!alerts) {
            return "<div class='notice'><strong>لا توجد بيانات إنذارات محفوظة.</strong><br>" +
                "افتح في نظام نور: التقارير ← تقارير الغياب ← «الغياب على مستوى الطالب»، اعرض التقرير ثم اضغط زر " +
                "«طباعة وارسال انذارات الغياب» من سكول بت وانتظر حتى تُقرأ جميع الصفحات.</div>";
        }
        if (!alerts.length) {
            return "<div class='notice'><strong>لا يوجد طلاب لديهم غياب بدون عذر في التقرير المعروض.</strong><br>" +
                "لا حاجة لإصدار إنذارات. تأكد من اختيار الفترة الصحيحة في تقرير نور ثم أعد المحاولة.</div>";
        }

        // ── مطابقة اسم الطالب مع قائمة الطلاب المستوردة (نور أولاً ثم مدرستي) ──
        var util = buildUtil(data, params, h);
        var rows = alerts.map(function (a) {
            var st = util.find(a.name);
            var days = Array.isArray(a.days) ? a.days : [];
            var count = parseInt(a.count, 10);
            if (isNaN(count)) count = days.length;
            return {
                name: a.name, count: count, days: days,
                className: st ? util.className(st) : "",
                phone: st ? util.phone(st) : "",
                level: util.level(count)
            };
        });
        rows.sort(function (x, y) { return y.count - x.count || String(x.name).localeCompare(String(y.name), "ar"); });
        var totalDays = rows.reduce(function (s, r) { return s + r.count; }, 0);
        var withPhone = rows.filter(function (r) { return r.phone; }).length;
        var matched = rows.filter(function (r) { return r.className; }).length;

        var html = "<style>" +
            ".alert-letter .lt-title{text-align:center;font-size:20px;font-weight:800;color:var(--primary);margin:4px 0 2px}" +
            ".alert-letter .lt-sub{text-align:center;color:var(--muted);font-size:12px;margin-bottom:10px}" +
            ".alert-letter .lt-meta{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);border-bottom:1px dashed var(--line);padding-bottom:4px;margin-bottom:8px}" +
            ".alert-letter .lt-to{font-weight:800;font-size:15px;margin:6px 0}" +
            ".alert-letter .lt-box{border:1px solid var(--line);border-radius:8px;padding:6px 12px;margin:8px 0;background:#fafafa;display:flex;gap:18px;flex-wrap:wrap}" +
            ".alert-letter .lt-box span b{color:var(--primary)}" +
            ".alert-letter table.rpt{font-size:12px;line-height:1.4;width:70%;margin:6px auto}" +
            ".alert-letter .lt-ack{border:1px dashed var(--ink);border-radius:8px;padding:8px 12px;margin-top:14px;font-size:13px}" +
            ".alert-letter .lt-ack .t{font-weight:800;margin-bottom:2px}" +
            ".alert-letter .sign{margin-top:14px}" +
            ".alert-letter .sign .line{margin-top:22px}" +
            ".sms-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 10px;padding:8px 12px;border:1px dashed var(--primary);border-radius:8px;background:#fff8fa}" +
            ".sms-bar .st{color:var(--muted);font-size:12px}" +
            "</style>";

        html += "<div class='no-print sms-bar'>" +
            "<button class='btn btn-primary' id='alerts-sms'>📱 إرسال رسائل الإنذار لأولياء الأمور (" + withPhone + ")</button>" +
            "<span class='st' id='alerts-sms-status'>" +
            (withPhone ? "تُرسل رسالة لكل ولي أمر له رقم جوال في قائمة الطلاب المستوردة." : "لا توجد أرقام جوال — استورد بيانات الطلاب من نور (قائمة سكول بت) لتفعيل الإرسال.") +
            "</span></div>";

        // ── الملخص ──
        html += h.stats([
            { label: "طلاب لديهم غياب بدون عذر", value: rows.length },
            { label: "إجمالي أيام الغياب بدون عذر", value: totalDays },
            { label: "أعلى غياب لطالب", value: rows.length ? rows[0].count : 0 },
            { label: "إنذار ثالث فأعلى (10 أيام+)", value: rows.filter(function (r) { return r.count >= 10; }).length }
        ]);
        if (!util.hasStudents) {
            html += "<div class='notice'>لم يتم العثور على قائمة الطلاب المستوردة لهذه المدرسة، لذا لن يظهر الصف ولا جوال ولي الأمر. " +
                "استورد بيانات الطلاب أولاً من قائمة سكول بت (من نور أو من مدرستي) ثم أعد فتح التقرير.</div>";
        } else if (matched < rows.length) {
            html += "<div class='notice'>" + (rows.length - matched) + " من الطلاب لم يُطابَق اسمهم مع قائمة الطلاب المستوردة؛ حُدّد مكان الصف والجوال بخط فارغ للتعبئة يدوياً.</div>";
        }

        html += "<h2>كشف الطلاب المستحقين للإنذار</h2>" +
            h.table([
                { key: "name", label: "اسم الطالب", cls: "text" },
                { key: "className", label: "الصف / الفصل", fmt: function (v) { return v ? h.esc(v) : "—"; } },
                { key: "count", label: "أيام الغياب بدون عذر", width: "70px", fmt: function (v) { return "<strong>" + h.esc(v) + "</strong>"; } },
                { key: "level", label: "درجة الإنذار", width: "90px", fmt: function (v, r) { return h.badge(v, r.count >= 10 ? "danger" : r.count >= 3 ? "warn" : "muted"); } },
                { key: "days", label: "تواريخ الغياب", cls: "text", fmt: function (v) {
                    return "<span style='font-size:11px;line-height:1.6'>" + h.esc(util.datesLine(v)) + "</span>";
                } },
                { key: "phone", label: "جوال ولي الأمر", cls: "num", width: "95px", fmt: function (v) { return v ? h.esc(v) : "—"; } }
            ], rows) +
            "<p style='font-size:11px;color:var(--muted)'>درجة الإنذار استرشادية: تنبيه (أقل من 3 أيام)، إنذار أول (3–4)، إنذار ثانٍ (5–9)، إنذار ثالث (10 أيام فأكثر). يلي هذا الكشف خطاب إنذار مستقل لكل طالب في صفحة خاصة.</p>" +
            h.signatures(["الموجه الطلابي", "وكيل شؤون الطلاب", "مدير المدرسة"]);

        // ── خطاب لكل طالب ──
        html += h.pageBreak();
        rows.forEach(function (r) {
            html += "<div class='letter alert-letter'>" +
                "<div class='lt-meta'><span>مدرسة: " + h.esc(school || "—") + "</span><span>التاريخ: " + h.esc(h.today()) + "</span></div>" +
                "<div class='lt-title'>" + h.esc(r.level === "تنبيه" ? "تنبيه غياب" : r.level + " — غياب بدون عذر") + "</div>" +
                "<div class='lt-sub'>وفق لائحة السلوك والمواظبة لطلبة التعليم العام</div>" +
                "<div class='lt-to'>المكرم ولي أمر الطالب / " + h.esc(r.name) + " &nbsp;&nbsp;&nbsp; حفظه الله</div>" +
                "<p>السلام عليكم ورحمة الله وبركاته، وبعد:</p>" +
                "<p>نفيدكم بأن ابنكم المذكور أعلاه قد تغيّب عن المدرسة <strong>بدون عذر</strong> لعدد <strong>(" + h.esc(r.count) + ")</strong> " + h.esc(util.dayWord(r.count)) +
                " حسب سجلات الحضور في نظام نور، وذلك في التواريخ المبيّنة أدناه:</p>" +
                "<div class='lt-box'>" +
                "<span>الطالب: <b>" + h.esc(r.name) + "</b></span>" +
                "<span>الصف / الفصل: <b>" + (r.className ? h.esc(r.className) : "....................") + "</b></span>" +
                "<span>أيام الغياب بدون عذر: <b>" + h.esc(r.count) + "</b></span>" +
                "</div>" +
                (r.days.length ? h.table([
                    { key: "day", label: "اليوم" },
                    { key: "date", label: "التاريخ", cls: "num" }
                ], r.days.slice(0, 15), { index: true }) +
                (r.days.length > 15 ? "<p style='font-size:11px;color:var(--muted);text-align:center'>و(" + (r.days.length - 15) + ") أيام أخرى مثبتة في سجل نور.</p>" : "")
                : "<p style='color:var(--muted)'>تفاصيل التواريخ مثبتة في سجل الغياب بنظام نور.</p>") +
                "<p>ولأن انتظام الطالب في الحضور أساس تحصيله الدراسي، ولما يترتب على تكرار الغياب من إجراءات نظامية تصل إلى الحسم من درجات المواظبة، " +
                "نأمل منكم <strong>مراجعة المدرسة خلال ثلاثة أيام</strong> من تاريخه لتوضيح أسباب الغياب، والتعاون معنا في متابعة انتظام ابنكم.</p>" +
                "<p>شاكرين لكم حسن تعاونكم، وتقبّلوا تحياتنا.</p>" +
                h.signatures(["الموجه الطلابي", "وكيل شؤون الطلاب", "مدير المدرسة"]) +
                "<div class='lt-ack'><div class='t'>إقرار ولي الأمر</div>" +
                "أقر أنا ولي أمر الطالب / " + h.esc(r.name) + " بأنني اطلعت على هذا الإنذار، وأتعهد بمتابعة انتظام ابني في الحضور.<br>" +
                "الاسم: .......................................... &nbsp; التوقيع: ........................ &nbsp; التاريخ: &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp; / 14&nbsp;&nbsp;&nbsp;&nbsp;هـ" +
                "</div>" +
                "</div>";
        });
        return html;

        // ── أدوات داخلية ──
        function buildUtil(data, params, h) {
            var n = data["n_students_" + params.school_id];
            var m = data["m_students_" + params.school_id];
            var list = (Array.isArray(n) && n.length ? n : []).concat(Array.isArray(m) ? m : []);
            function norm(s) {
                return String(s == null ? "" : s)
                    .replace(/[ً-ْـ]/g, "")      // تشكيل وتطويل
                    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
                    .replace(/\b(بن|بنت|ابن)\b/g, " ")
                    .replace(/\s+/g, " ").trim();
            }
            var byName = {};
            list.forEach(function (s) { var k = norm(s && s.name); if (k && !byName[k]) byName[k] = s; });
            var keys = Object.keys(byName);
            return {
                hasStudents: list.length > 0,
                find: function (name) {
                    var k = norm(name);
                    if (!k) return null;
                    if (byName[k]) return byName[k];
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].indexOf(k) === 0 || k.indexOf(keys[i]) === 0) return byName[keys[i]];
                    }
                    return null;
                },
                className: function (s) {
                    var grade = s.classname || s.row_name || "";
                    var room = s.classroom || s.class_name || "";
                    if (grade && room && grade !== room) return (grade + " / " + room).trim();
                    return (grade || room || "").trim();
                },
                phone: function (s) { return String(s.parent_phone || s.phone || s.student_phone || "").trim(); },
                level: function (c) { return c >= 10 ? "إنذار ثالث" : c >= 5 ? "إنذار ثانٍ" : c >= 3 ? "إنذار أول" : "تنبيه"; },
                dayWord: function (c) { return c === 1 ? "يوم واحد" : c === 2 ? "يومين" : c <= 10 ? "أيام" : "يوماً"; },
                datesLine: function (days) {
                    return (days || []).map(function (d) { return (d.day ? d.day + " " : "") + (d.date || ""); }).join("، ");
                }
            };
        }
    },

    onReady: function (root, data, params, h) {
        var btn = root.querySelector("#alerts-sms");
        var statusEl = root.querySelector("#alerts-sms-status");
        if (!btn) return;
        var school = params.school_name || data.school_name || "المدرسة";
        // نعيد بناء قائمة المستهدفين من جدول الكشف الأول (الاسم + الجوال + العدد) حتى لا نكرر منطق المطابقة
        var targets = [];
        var summary = root.querySelector("table.rpt");
        (summary ? summary.querySelectorAll("tbody tr") : []).forEach(function (tr) {
            var tds = tr.querySelectorAll("td");
            if (tds.length < 7) return;
            var name = tds[1].textContent.trim(), count = tds[3].textContent.trim(), phone = tds[6].textContent.trim();
            if (!/\d{9,}/.test(phone)) return;
            targets.push({ phone: phone, message: "ولي أمر الطالب " + name + ": نفيدكم بأن ابنكم تغيّب بدون عذر (" + count + ") يوم حسب سجل نور. نأمل مراجعة المدرسة خلال 3 أيام لتوضيح الأسباب. " + school });
        });
        if (!targets.length) { btn.disabled = true; return; }
        btn.addEventListener("click", function () {
            if (!window.CorbitSMS) { statusEl.textContent = "خدمة الرسائل غير متاحة في هذه الصفحة."; return; }
            CorbitSMS.isConfigured().then(function (ok) {
                if (!ok) { statusEl.textContent = "لم تُضبط إعدادات الرسائل بعد — افتح الإعدادات أولاً."; CorbitSMS.openSettings(); return; }
                if (!window.confirm("سيتم إرسال " + targets.length + " رسالة إنذار لأولياء الأمور. هل أنت متأكد؟")) return;
                btn.disabled = true;
                statusEl.textContent = "جاري الإرسال…";
                CorbitSMS.send(targets, function (p) {
                    if (p && typeof p.done === "number") statusEl.textContent = "تم إرسال " + p.done + " من " + targets.length + "…";
                }).then(function (res) {
                    statusEl.textContent = "اكتمل الإرسال: نجح " + (res.sent || 0) + "، فشل " + (res.failed || 0) + ".";
                }).catch(function (e) {
                    statusEl.textContent = "تعذّر الإرسال: " + (e && e.message || e);
                }).then(function () { btn.disabled = false; });
            });
        });
    }
});
