// تقرير دخول الطلاب اليومي لمنصة مدرستي — يُبنى من البيانات التي تحفظها ميزة
// assets/js/features/madrasati/students_access.js:
//   "dates"                  = { [اسم المستخدم في مدرستي]: "تاريخ آخر دخول" }  (من سجل المستخدمين SchoolManagmentReports/UserLog)
//   "m_students_<school_id>" = [ {name, username, email, number, uname, id, class_name, row_name, parent_phone, ...} ]  (المستوردون من مدرستي)
// المعاملات: school_id (ومعها school_name/admin_name اختيارياً)
CorbitReports.register("students-access", {
    title: "تقرير دخول الطلاب لمنصة مدرستي",
    subtitle: function (data, params) {
        var dates = data["dates"];
        var n = dates && typeof dates === "object" ? Object.keys(dates).length : 0;
        return "آخر دخول لكل طالب حسب سجل المستخدمين" + (n ? " — " + n + " سجل دخول" : "");
    },
    keys: function (params) { return ["dates", "m_students_" + params.school_id]; },
    render: function (data, params, h) {
        var dates = data["dates"];
        var students = h.students(data, { school_id: params.school_id, type: "m" });

        if (!dates || typeof dates !== "object" || Array.isArray(dates)) {
            return "<div class='notice'><strong>لا توجد بيانات دخول محفوظة.</strong><br>" +
                "افتح منصة مدرستي، ثم شغّل «تقرير دخول الطلاب» من قائمة سكول بت واختر «الطلاب من مدرستي»، وانتظر اكتمال قراءة سجل المستخدمين حتى يُفتح التقرير.</div>";
        }
        if (!students.length) {
            return "<div class='notice'><strong>لم يتم استيراد بيانات الطلاب.</strong><br>" +
                "استورد بيانات الطلاب أولاً من قائمة سكول بت (استيراد الطلاب من مدرستي) ثم أعد تشغيل تقرير دخول الطلاب.</div>";
        }

        // ── مطابقة اسم المستخدم ──
        // سجل المستخدمين قد يعرض اسم المستخدم كاملاً (s1000@moe.gov.sa) أو الجزء الأول منه فقط.
        function norm(s) { return String(s == null ? "" : s).trim().toLowerCase(); }
        function local(s) { s = norm(s); var i = s.indexOf("@"); return i > 0 ? s.slice(0, i) : s; }
        var byUser = {};
        Object.keys(dates).forEach(function (k) {
            var v = dates[k];
            if (norm(k) === "") return;
            byUser[norm(k)] = v;
            if (!(local(k) in byUser)) byUser[local(k)] = v;
        });
        function lookup(st) {
            var cands = [st.username, st.email, st.uname, st.number, st.id];
            for (var i = 0; i < cands.length; i++) {
                var c = cands[i];
                if (c == null || norm(c) === "") continue;
                if (norm(c) in byUser) return { key: norm(c), raw: byUser[norm(c)] };
                if (local(c) in byUser) return { key: local(c), raw: byUser[local(c)] };
            }
            return null;
        }

        // ── تحليل التاريخ (ميلادي dd/mm/yyyy أو yyyy/mm/dd، أو هجري أم القرى) ──
        var today = new Date(); today.setHours(0, 0, 0, 0);
        var hijriMap = null;
        function hijriTable() {
            if (hijriMap) return hijriMap;
            hijriMap = {};
            try {
                var f = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { year: "numeric", month: "numeric", day: "numeric" });
                for (var i = -30; i <= 420; i++) {
                    var d = new Date(today); d.setDate(d.getDate() - i);
                    var p = {};
                    f.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
                    var y = parseInt(String(p.year).replace(/\D/g, ""), 10);
                    hijriMap[y + "/" + parseInt(p.month, 10) + "/" + parseInt(p.day, 10)] = d;
                }
            } catch (_) { /* لا يدعم المتصفح التقويم الهجري */ }
            return hijriMap;
        }
        function parseDate(raw) {
            var s = String(raw == null ? "" : raw).replace(/[٠-٩]/g, function (c) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(c)); }).trim();
            var m = s.match(/(\d{1,4})\s*[\/\.\-]\s*(\d{1,2})\s*[\/\.\-]\s*(\d{1,4})/);
            if (!m) return null;
            var a = parseInt(m[1], 10), b = parseInt(m[2], 10), c = parseInt(m[3], 10);
            var y, mo, d;
            if (m[1].length === 4) { y = a; mo = b; d = c; } else { d = a; mo = b; y = c; }
            if (y < 100) y += 2000;
            if (y < 1600) { // هجري
                return hijriTable()[y + "/" + mo + "/" + d] || null;
            }
            var dt = new Date(y, mo - 1, d);
            return isNaN(dt.getTime()) ? null : dt;
        }
        function daysSince(dt) { return Math.round((today - dt) / 86400000); }
        function fmtDate(dt) {
            var g = "<span class='num'>" + h.esc(dt.toLocaleDateString("en-GB")) + "</span>";
            try { return g + "<div style='font-size:10px;color:var(--muted)'>" + h.esc(dt.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { year: "numeric", month: "numeric", day: "numeric" })) + "</div>"; }
            catch (_) { return g; }
        }
        function status(r) {
            if (!r.found) return { kind: "never", label: "لا يوجد دخول", badge: "danger", order: 4 };
            if (r.days == null) return { kind: "unknown", label: "تاريخ غير مفهوم", badge: "muted", order: 3 };
            if (r.days <= 2) return { kind: "active", label: r.days === 0 ? "دخل اليوم" : r.days === 1 ? "دخل أمس" : "نشط", badge: "ok", order: 0 };
            if (r.days <= 7) return { kind: "late", label: "متأخر", badge: "warn", order: 1 };
            return { kind: "absent", label: "منقطع", badge: "danger", order: 2 };
        }

        // ── بناء الصفوف ──
        var rows = students.map(function (st) {
            var hit = lookup(st);
            var dt = hit ? parseDate(hit.raw) : null;
            var r = {
                name: st.name || "", username: st.username || st.email || st.uname || "", number: st.number || "",
                phone: st.parent_phone || st.phone || st.student_phone || "",
                cls: [st.class_name, st.row_name].filter(function (x) { return x && String(x).trim(); }).join(" - ") || "بدون فصل",
                found: !!hit, key: hit ? hit.key : "", raw: hit ? String(hit.raw).trim() : "", date: dt, days: dt ? daysSince(dt) : null
            };
            r.st = status(r);
            return r;
        });
        var cnt = { active: 0, late: 0, absent: 0, never: 0, unknown: 0 };
        rows.forEach(function (r) { cnt[r.st.kind]++; });
        var pct = function (a, b) { return b ? Math.round(a / b * 100) : 0; };
        var unmatchedLogs = Object.keys(dates).filter(function (k) {
            var nk = norm(k), lk = local(k);
            return nk !== "" && !rows.some(function (r) { return r.found && (r.key === nk || r.key === lk); });
        }).length;

        var html = "";
        html += h.stats([
            { label: "إجمالي الطلاب", value: rows.length },
            { label: "دخلوا خلال يومين", value: cnt.active },
            { label: "متأخرون (3–7 أيام)", value: cnt.late },
            { label: "منقطعون (أكثر من أسبوع)", value: cnt.absent },
            { label: "لا يوجد دخول", value: cnt.never },
            { label: "نسبة الدخول النشط", value: pct(cnt.active, rows.length) + "%" }
        ]);
        html += "<p style='color:var(--muted);font-size:11px'>الحالة تُحسب من تاريخ آخر دخول للطالب حتى تاريخ اليوم (" + h.esc(today.toLocaleDateString("en-GB")) + "): " +
            "<b>نشط</b> خلال يومين، <b>متأخر</b> من 3 إلى 7 أيام، <b>منقطع</b> أكثر من أسبوع، و<b>لا يوجد دخول</b> إذا لم يظهر اسم المستخدم في سجل المستخدمين.</p>";
        if (unmatchedLogs > 0) {
            html += "<div class='notice' style='font-size:11px'>يحوي سجل المستخدمين <strong>" + unmatchedLogs + "</strong> سجلاً لمستخدمين ليسوا في قائمة الطلاب المستوردة (معلمون أو أولياء أمور أو طلاب غير مستوردين)؛ لم تُعرض في هذا التقرير.</div>";
        }

        // ── فلتر الحالة (لا يُطبع) ──
        html += "<div class='no-print access-filter' style='margin:8px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap'>" +
            "<label>عرض: <select class='access-select' style='font-family:inherit;padding:4px 8px;border:1px solid var(--line);border-radius:6px'>" +
            "<option value='all'>جميع الطلاب</option>" +
            "<option value='problem'>المتأخرون والمنقطعون ومن لا دخول لهم</option>" +
            "<option value='absent'>المنقطعون فقط (أكثر من أسبوع)</option>" +
            "<option value='never'>من لا يوجد لهم دخول فقط</option>" +
            "<option value='active'>النشطون فقط</option>" +
            "</select></label>" +
            "<button type='button' class='btn btn-sms'>إرسال رسالة SMS لأولياء أمور المعروضين من المتأخرين والمنقطعين</button>" +
            "<span class='sms-status' style='font-size:11px;color:var(--muted)'></span></div>";

        // ── جدول حسب الفصل ──
        var groups = h.group(rows, function (r) { return r.cls; });
        var classNames = Object.keys(groups); // بترتيب ظهورها في قائمة الطلاب المستوردة
        var cols = [
            { key: "name", label: "اسم الطالب", cls: "text" },
            { key: "number", label: "رقم الطالب", cls: "num", width: "80px" },
            { key: "username", label: "اسم المستخدم", cls: "num", width: "150px" },
            { key: "date", label: "آخر دخول", width: "100px", fmt: function (v, r) {
                if (v) return fmtDate(v);
                if (r.found) return "<span class='num'>" + h.esc(r.raw) + "</span>";
                return "—";
            } },
            { key: "days", label: "منذ (يوم)", width: "70px", fmt: function (v, r) {
                if (v == null) return "—";
                var color = r.st.badge === "danger" ? "var(--danger)" : r.st.badge === "warn" ? "var(--warn)" : "var(--ok)";
                return "<span class='num' style='font-weight:700;color:" + color + "'>" + h.esc(v) + "</span>";
            } },
            { key: "st", label: "الحالة", width: "90px", fmt: function (v) { return h.badge(v.label, v.badge); } }
        ];
        classNames.forEach(function (c) {
            var list = groups[c].slice().sort(function (a, b) {
                return (b.st.order - a.st.order) || ((b.days == null ? -1 : b.days) - (a.days == null ? -1 : a.days)) || a.name.localeCompare(b.name, "ar");
            });
            var cc = { active: 0, late: 0, absent: 0, never: 0, unknown: 0 };
            list.forEach(function (r) { cc[r.st.kind]++; });
            html += "<section class='class-block' data-class='" + h.esc(c) + "'>";
            html += "<h2>" + h.esc(c) + " <span style='color:var(--muted);font-weight:400;font-size:12px'>— " + list.length + " طالب: " +
                "نشط " + cc.active + "، متأخر " + cc.late + "، منقطع " + cc.absent + "، لا دخول " + cc.never + "</span></h2>";
            html += "<table class='rpt'><thead><tr><th style='width:36px'>#</th>" +
                cols.map(function (col) { return "<th" + (col.width ? " style='width:" + col.width + "'" : "") + ">" + h.esc(col.label) + "</th>"; }).join("") +
                "</tr></thead><tbody>";
            list.forEach(function (r, i) {
                html += "<tr class='st-row' data-kind='" + r.st.kind + "' data-phone='" + h.esc(r.phone) + "' data-name='" + h.esc(r.name) + "' data-days='" + (r.days == null ? "" : r.days) + "'>";
                html += "<td class='idx'>" + (i + 1) + "</td>";
                cols.forEach(function (col) {
                    var v = r[col.key];
                    html += "<td class='" + (col.cls || "") + "'>" + (col.fmt ? col.fmt(v, r) : h.esc(v)) + "</td>";
                });
                html += "</tr>";
            });
            html += "</tbody></table></section>";
        });

        html += h.signatures(["رائد النشاط / المرشد الطلابي", "وكيل الشؤون التعليمية", "مدير المدرسة"]);
        return html;
    },
    onReady: function (root, data, params, h) {
        var sel = root.querySelector(".access-select");
        var btn = root.querySelector(".btn-sms");
        var statusEl = root.querySelector(".sms-status");
        if (!sel) return;
        var school = params.school_name || data.school_name || "";

        function apply() {
            var mode = sel.value;
            Array.prototype.forEach.call(root.querySelectorAll(".class-block"), function (sec) {
                var shown = 0, n = 0;
                Array.prototype.forEach.call(sec.querySelectorAll("tr.st-row"), function (tr) {
                    var k = tr.getAttribute("data-kind");
                    var ok = mode === "all" || (mode === "problem" && k !== "active") || (mode === "absent" && k === "absent") ||
                        (mode === "never" && k === "never") || (mode === "active" && k === "active");
                    tr.style.display = ok ? "" : "none";
                    if (ok) { shown++; n++; tr.querySelector("td.idx").textContent = n; }
                });
                sec.style.display = shown ? "" : "none";
            });
        }
        sel.addEventListener("change", apply);

        if (btn) {
            btn.addEventListener("click", function () {
                var targets = [];
                Array.prototype.forEach.call(root.querySelectorAll("tr.st-row"), function (tr) {
                    if (tr.style.display === "none") return;
                    var k = tr.getAttribute("data-kind");
                    if (k !== "late" && k !== "absent" && k !== "never") return;
                    var phone = (tr.getAttribute("data-phone") || "").replace(/\D/g, "");
                    if (!phone) return;
                    var days = tr.getAttribute("data-days");
                    var msg = "ولي أمر الطالب " + tr.getAttribute("data-name") + "، نفيدكم بأن ابنكم " +
                        (k === "never" ? "لم يسجّل دخوله لمنصة مدرستي" : "لم يدخل منصة مدرستي منذ " + days + " يوم") +
                        ". نأمل متابعته وحثه على الدخول اليومي للمنصة. " + (school ? "— " + school : "");
                    targets.push({ phone: phone, message: msg });
                });
                if (!targets.length) { statusEl.textContent = "لا يوجد أولياء أمور (بأرقام جوال) ضمن المعروضين من المتأخرين أو المنقطعين."; return; }
                if (!window.CorbitSMS) { statusEl.textContent = "خدمة الرسائل غير متاحة في هذه الصفحة."; return; }
                CorbitSMS.isConfigured().then(function (ok) {
                    if (!ok) { statusEl.textContent = "لم تُضبط إعدادات الرسائل بعد — افتح الإعدادات أولاً."; CorbitSMS.openSettings(); return; }
                    if (!window.confirm("سيتم إرسال " + targets.length + " رسالة لأولياء الأمور. هل أنت متأكد؟")) return;
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
