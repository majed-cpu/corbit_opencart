// تقرير غياب الحصص (حضور الطلاب بالحصص لليوم) — يُبنى من البيانات التي تحفظها ميزة
// assets/js/features/madrasati/students-lessons.js:
//   "students-lessons"       = [ { name, classroom, number, lessons: [ { lesson: "الاولى"…"الثامنة", status } ] } ]
//                              (حالة الطالب في كل حصة من شاشة «رصد حضور الطلاب» في مدرستي لليوم الحالي)
//   "m_students_<school_id>" = [ {name, id, parent_phone, class_name, row_name, ...} ]  (المستوردون من مدرستي — اختياري لجوال ولي الأمر)
// المعاملات: school_id (ومعها school_name/admin_name اختيارياً)
(function () {
    "use strict";

    var ORDER = ["الاولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة"];

    function norm(s) {
        return String(s == null ? "" : s).trim().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ");
    }
    function periodIndex(p) {
        var i = ORDER.indexOf(norm(p));
        if (i >= 0) return i;
        var n = parseInt(String(p).replace(/[٠-٩]/g, function (c) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(c)); }), 10);
        return isNaN(n) ? 100 : 50 + n;
    }
    // تصنيف نص الحالة كما يظهر في مدرستي (حاضر / غائب / متأخر / غائب بعذر / مستأذن ...)
    function kind(status) {
        var s = norm(status);
        if (!s) return "none";
        if (/بعذر|مستاذن|استئذان|استاذان|معذور/.test(s)) return "excused";
        if (/غائب|غياب|غايب/.test(s)) return "absent";
        if (/متاخر|تاخر|تأخر/.test(s)) return "late";
        if (/حاضر|حضور/.test(s)) return "present";
        return "other";
    }
    var MARK = {
        present: { t: "✓", bg: "#e6f6ea", c: "#1B7E3A", title: "حاضر" },
        absent: { t: "غ", bg: "#fde8e6", c: "#B3261E", title: "غائب" },
        late: { t: "ت", bg: "#fff1e6", c: "#C2410C", title: "متأخر" },
        excused: { t: "ع", bg: "#eef2ff", c: "#3b4fa8", title: "غائب بعذر / مستأذن" },
        other: { t: "؟", bg: "#eee", c: "#555", title: "حالة غير معروفة" },
        none: { t: "—", bg: "#fff", c: "#bbb", title: "لم تُرصد" }
    };
    function cell(k, status) {
        var m = MARK[k] || MARK.other;
        return "<td class='pcell' title='" + CorbitReports.helpers.esc(status || m.title) + "' style='background:" + m.bg + ";color:" + m.c + ";font-weight:800'>" + m.t + "</td>";
    }

    // يبني نموذج التقرير من البيانات الخام (مستخدم في render و onReady)
    function build(data, params, h) {
        var raw = data["students-lessons"];
        var rows = Array.isArray(raw) ? raw : [];
        var students = h.students(data, { school_id: params.school_id, type: "m" });

        var byId = {}, byName = {};
        students.forEach(function (st) {
            if (st.id != null && String(st.id).trim()) byId[String(st.id).trim()] = st;
            if (st.name) byName[norm(st.name)] = st;
        });

        var periodsSet = {};
        var model = [];
        rows.forEach(function (r) {
            var lessons = Array.isArray(r.lessons) ? r.lessons : [];
            var map = {}, present = 0, absent = 0, late = 0, excused = 0;
            lessons.forEach(function (l) {
                var p = norm(l.lesson);
                periodsSet[p] = l.lesson;
                var k = kind(l.status);
                map[p] = { k: k, status: l.status };
                if (k === "present") present++;
                else if (k === "absent") absent++;
                else if (k === "late") late++;
                else if (k === "excused") excused++;
            });
            var st = byId[String(r.number == null ? "" : r.number).trim()] || byName[norm(r.name)] || null;
            model.push({
                name: r.name || "", classroom: r.classroom || "بدون فصل", number: r.number || "",
                map: map, present: present, absent: absent, late: late, excused: excused, recorded: lessons.length,
                phone: st ? (st.parent_phone || st.phone || st.student_phone || "") : ""
            });
        });
        var periods = Object.keys(periodsSet).sort(function (a, b) { return periodIndex(a) - periodIndex(b); });
        var groups = h.group(model, function (r) { return r.classroom; });
        var classes = Object.keys(groups).sort(function (a, b) { return a.localeCompare(b, "ar"); });
        classes.forEach(function (c) {
            groups[c].sort(function (a, b) { return a.name.localeCompare(b.name, "ar"); });
        });
        return { rows: rows, model: model, periods: periods, labels: periodsSet, groups: groups, classes: classes, students: students };
    }

    CorbitReports.register("students-lessons", {
        title: "تقرير غياب الحصص",
        subtitle: function (data, params) {
            var raw = data["students-lessons"];
            var n = Array.isArray(raw) ? raw.length : 0;
            return "حضور الطلاب في حصص اليوم حسب رصد المعلمين في مدرستي" + (n ? " — " + n + " طالب" : "");
        },
        keys: function (params) { return ["students-lessons", "m_students_" + params.school_id]; },
        render: function (data, params, h) {
            var raw = data["students-lessons"];
            if (!Array.isArray(raw) || !raw.length) {
                return "<div class='notice'><strong>لا توجد بيانات محفوظة لتقرير غياب الحصص.</strong><br>" +
                    "افتح منصة مدرستي، ثم شغّل «تقرير غياب الحصص» من قائمة سكول بت (خدمات الطلاب) واختر «الطلاب من مدرستي»، " +
                    "وانتظر اكتمال الاستعلام عن جميع الفصول حتى يظهر زر «عرض التقرير الآن».<br>" +
                    "<small>ملاحظة: التقرير يقرأ حصص اليوم الحالي فقط، ولا تظهر إلا الفصول التي لها حصص مرصودة اليوم.</small></div>";
            }
            var m = build(data, params, h);
            var totAbs = 0, totLate = 0, totExc = 0, totPres = 0, withAbs = 0, withIssue = 0;
            m.model.forEach(function (r) {
                totAbs += r.absent; totLate += r.late; totExc += r.excused; totPres += r.present;
                if (r.absent) withAbs++;
                if (r.absent || r.late) withIssue++;
            });

            var html = "";
            if (!m.students.length) {
                html += "<div class='notice no-print'>لم يتم استيراد بيانات الطلاب من مدرستي، لذلك لن تظهر أرقام جوال أولياء الأمور ولن يمكن إرسال الرسائل. " +
                    "استورد بيانات الطلاب أولاً من قائمة سكول بت (تحديث بيانات الطلاب من مدرستي).</div>";
            }

            // ── شريط التحكم (لا يُطبع) ──
            html += "<div class='no-print sl-bar' style='margin:8px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap'>" +
                "<label>عرض: <select class='sl-filter' style='font-family:inherit;padding:4px 8px'>" +
                "<option value='all'>جميع الطلاب</option>" +
                "<option value='issue'>من لديهم غياب أو تأخر فقط</option>" +
                "<option value='absent'>من لديهم غياب فقط</option>" +
                "</select></label>" +
                "<button type='button' class='btn btn-primary sl-sms'>إرسال رسالة لأولياء أمور الغائبين والمتأخرين (المعروضين)</button>" +
                "<span class='sl-status' style='color:#666'></span></div>";

            // ── الإحصائيات ──
            html += h.stats([
                { label: "الفصول", value: m.classes.length },
                { label: "الطلاب", value: m.model.length },
                { label: "الحصص المرصودة", value: m.periods.length },
                { label: "حالات الغياب", value: totAbs },
                { label: "حالات التأخر", value: totLate },
                { label: "غياب بعذر", value: totExc },
                { label: "طلاب لديهم غياب", value: withAbs }
            ]);

            // ── دليل الرموز ──
            html += "<p style='font-size:12px;color:#555'><strong>دليل الرموز:</strong> ";
            ["present", "absent", "late", "excused", "none"].forEach(function (k) {
                var mk = MARK[k];
                html += "<span style='display:inline-block;margin:0 0 0 10px'><span style='display:inline-block;width:22px;text-align:center;border:1px solid #cfcfcf;background:" + mk.bg + ";color:" + mk.c + ";font-weight:800'>" + mk.t + "</span> " + mk.title + "</span>";
            });
            html += "</p>";

            // ── ملخص الفصول ──
            html += "<h2>ملخص الفصول</h2>";
            html += h.table([
                { key: "cls", label: "الفصل", cls: "text" },
                { key: "n", label: "الطلاب" },
                { key: "pres", label: "حالات الحضور" },
                { key: "abs", label: "حالات الغياب", fmt: function (v) { return v ? h.badge(v, "danger") : "0"; } },
                { key: "late", label: "حالات التأخر", fmt: function (v) { return v ? h.badge(v, "warn") : "0"; } },
                { key: "exc", label: "بعذر" },
                { key: "withAbs", label: "طلاب لديهم غياب" },
                { key: "rate", label: "نسبة الحضور", fmt: function (v) { return v == null ? "—" : h.badge(v + "%", v >= 90 ? "ok" : v >= 75 ? "warn" : "danger"); } }
            ], m.classes.map(function (c) {
                var g = m.groups[c], a = 0, l = 0, e = 0, p = 0, w = 0, rec = 0;
                g.forEach(function (r) { a += r.absent; l += r.late; e += r.excused; p += r.present; rec += r.recorded; if (r.absent) w++; });
                return { cls: c, n: g.length, pres: p, abs: a, late: l, exc: e, withAbs: w, rate: rec ? Math.round((rec - a - e) / rec * 100) : null };
            }));

            // ── شبكة الطلاب × الحصص لكل فصل ──
            m.classes.forEach(function (c) {
                var g = m.groups[c];
                var a = 0, l = 0;
                g.forEach(function (r) { a += r.absent; l += r.late; });
                html += "<section class='class-block' data-class='" + h.esc(c) + "'>";
                html += "<h3 style='display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #cfcfcf;padding-bottom:3px'>" +
                    "<span>الفصل: " + h.esc(c) + "</span>" +
                    "<span style='font-size:11px;color:#666;font-weight:400'>" + g.length + " طالب — غياب " + a + " — تأخر " + l + "</span></h3>";
                html += "<table class='rpt sl-grid'><thead><tr><th style='width:30px'>#</th><th class='text'>اسم الطالب</th>";
                m.periods.forEach(function (p) {
                    html += "<th style='width:34px;font-size:11px;padding:4px 2px'>" + h.esc(m.labels[p]) + "</th>";
                });
                html += "<th style='width:40px'>حضور</th><th style='width:40px'>غياب</th><th style='width:40px'>تأخر</th></tr></thead><tbody>";
                g.forEach(function (r, i) {
                    var dk = r.absent ? "absent" : r.late ? "late" : "ok";
                    html += "<tr class='st-row' data-kind='" + dk + "' data-name='" + h.esc(r.name) + "' data-phone='" + h.esc(r.phone) + "'" +
                        " data-absent='" + r.absent + "' data-late='" + r.late + "' data-class='" + h.esc(c) + "'>";
                    html += "<td class='idx'>" + (i + 1) + "</td><td class='text'>" + h.esc(r.name) + "</td>";
                    m.periods.forEach(function (p) {
                        var x = r.map[p];
                        html += x ? cell(x.k, x.status) : cell("none", "");
                    });
                    html += "<td>" + r.present + "</td>";
                    html += "<td style='font-weight:800;" + (r.absent ? "color:#B3261E" : "color:#999") + "'>" + r.absent + "</td>";
                    html += "<td style='font-weight:800;" + (r.late ? "color:#C2410C" : "color:#999") + "'>" + r.late + "</td>";
                    html += "</tr>";
                });
                html += "</tbody></table></section>";
            });

            // ── قائمة المتابعة: الطلاب الغائبون والمتأخرون ──
            var issues = m.model.filter(function (r) { return r.absent || r.late; });
            html += "<h2>قائمة المتابعة — الطلاب الذين لديهم غياب أو تأخر اليوم (" + issues.length + ")</h2>";
            if (!issues.length) {
                html += "<div class='notice'>لا يوجد طلاب لديهم غياب أو تأخر في حصص اليوم.</div>";
            } else {
                issues.sort(function (a, b) { return (b.absent - a.absent) || (b.late - a.late) || a.classroom.localeCompare(b.classroom, "ar"); });
                html += h.table([
                    { key: "name", label: "اسم الطالب", cls: "text", width: "150px" },
                    { key: "classroom", label: "الفصل", cls: "text", width: "60px" },
                    { key: function (r) { return listOf(r, "absent"); }, label: "حصص الغياب", cls: "text", fmt: function (v) { return v ? h.esc(v) : "—"; } },
                    { key: function (r) { return listOf(r, "late"); }, label: "حصص التأخر", cls: "text", fmt: function (v) { return v ? h.esc(v) : "—"; } },
                    { key: "absent", label: "غياب", fmt: function (v) { return v ? h.badge(v, "danger") : "0"; } },
                    { key: "late", label: "تأخر", fmt: function (v) { return v ? h.badge(v, "warn") : "0"; } },
                    { key: "phone", label: "جوال ولي الأمر", cls: "num", width: "100px", fmt: function (v) { return v ? h.esc(v) : "<span style='color:#999'>غير مستورد</span>"; } }
                ], issues);
            }

            function listOf(r, k) {
                return m.periods.filter(function (p) { return r.map[p] && r.map[p].k === k; }).map(function (p) { return m.labels[p]; }).join("، ");
            }

            html += "<p style='font-size:11px;color:#777'>المصدر: شاشة «رصد حضور الطلاب» في منصة مدرستي لحصص اليوم الحالي. الحصة التي لم يرصدها المعلم تظهر بعلامة (—).</p>";
            html += h.signatures(["المرشد الطلابي", "وكيل شؤون الطلاب", "مدير المدرسة"]);
            return html;
        },
        onReady: function (root, data, params, h) {
            var sel = root.querySelector(".sl-filter");
            var btn = root.querySelector(".sl-sms");
            var statusEl = root.querySelector(".sl-status");
            if (!sel) return;
            var school = params.school_name || data.school_name || "";

            function apply() {
                var mode = sel.value;
                Array.prototype.forEach.call(root.querySelectorAll(".class-block"), function (sec) {
                    var shown = 0;
                    Array.prototype.forEach.call(sec.querySelectorAll("tr.st-row"), function (tr) {
                        var k = tr.getAttribute("data-kind");
                        var ok = mode === "all" || (mode === "issue" && k !== "ok") || (mode === "absent" && k === "absent");
                        tr.style.display = ok ? "" : "none";
                        if (ok) { shown++; tr.querySelector("td.idx").textContent = shown; }
                    });
                    sec.style.display = shown ? "" : "none";
                });
            }
            sel.addEventListener("change", apply);

            if (btn) {
                btn.addEventListener("click", function () {
                    var targets = [], noPhone = 0;
                    Array.prototype.forEach.call(root.querySelectorAll("tr.st-row"), function (tr) {
                        if (tr.style.display === "none") return;
                        if (tr.getAttribute("data-kind") === "ok") return;
                        var phone = (tr.getAttribute("data-phone") || "").replace(/\D/g, "");
                        if (!phone) { noPhone++; return; }
                        var a = parseInt(tr.getAttribute("data-absent"), 10) || 0;
                        var l = parseInt(tr.getAttribute("data-late"), 10) || 0;
                        var parts = [];
                        if (a) parts.push("غاب عن " + a + (a === 1 ? " حصة" : a <= 10 ? " حصص" : " حصة"));
                        if (l) parts.push("تأخر عن " + l + (l === 1 ? " حصة" : l <= 10 ? " حصص" : " حصة"));
                        var msg = "ولي أمر الطالب " + tr.getAttribute("data-name") + " (" + tr.getAttribute("data-class") + ")، نفيدكم بأن ابنكم " +
                            parts.join(" و") + " اليوم. نأمل متابعته والتواصل مع المدرسة. " + (school ? "— " + school : "");
                        targets.push({ phone: phone, message: msg });
                    });
                    if (!targets.length) {
                        statusEl.textContent = noPhone ? "لا توجد أرقام جوال للطلاب المعروضين — استورد بيانات الطلاب من مدرستي أولاً." : "لا يوجد طلاب غائبون أو متأخرون ضمن المعروضين.";
                        return;
                    }
                    if (!window.CorbitSMS) { statusEl.textContent = "خدمة الرسائل غير متاحة في هذه الصفحة."; return; }
                    CorbitSMS.isConfigured().then(function (ok) {
                        if (!ok) { statusEl.textContent = "لم تُضبط إعدادات الرسائل بعد — افتح الإعدادات أولاً."; CorbitSMS.openSettings(); return; }
                        if (!window.confirm("سيتم إرسال " + targets.length + " رسالة لأولياء الأمور" + (noPhone ? " (" + noPhone + " طالب بلا رقم جوال سيُتجاهل)" : "") + ". هل أنت متأكد؟")) return;
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
        }
    });
})();
