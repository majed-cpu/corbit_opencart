// تقرير واجب/اختبار/نشاط واحد (مدرستي) — بديل محلي لصفحة /reports/homeworks القديمة.
//
// الميزة: assets/js/features/madrasati/homeworks.js
// المفاتيح المحفوظة (كلها نصوص، ليست JSON):
//   type    : "homeworks" | "exams" | "activity"
//   html    : للواجبات/الاختبارات: innerHTML لعنصر ".card-body .list-group" في صفحة تفاصيل العنصر
//             (كل طالب ".list-group-item": <h6>الاسم</h6> + <li>الحالة:/الدرجة:/تاريخ التسليم:</li> + input.decimal للدرجة)
//             للأنشطة: html القادم من POST /Projects/Projects/GetGradeStudentsList
//             (كل طالب ".card-group-vertical": ".form-check .fs-6" الاسم + input.decimal الدرجة)
//             وفي الحالتين استُبدلت كلمة textarea بـ gg (ملاحظات المعلم).
//   name    : HTML سطر المادة/الفصل من قائمة العناصر     title : عنوان العنصر     details : HTML تفاصيل العنصر
// المعاملات: school_id (+ type=activity للأنشطة).
// أرقام الجوال تُقرأ من قائمة الطلاب المستوردة m_students_<school_id> أو n_students_<school_id> لإرسال التنبيهات.
//
// لا يُحقن HTML مدرستي أبداً: يُحلَّل بـ DOMParser ويُعاد بناء جدول نظيف.
(function () {
    "use strict";

    var TYPE_LABEL = { homeworks: "واجب", exams: "اختبار", activity: "نشاط" };
    var TYPE_PLURAL = { homeworks: "الواجبات", exams: "الاختبارات", activity: "الأنشطة" };
    var VERB = { homeworks: "حل الواجب", exams: "أداء الاختبار", activity: "تسليم النشاط" };

    function clean(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }

    // نص خالٍ من الوسوم من مقطع HTML (name/details محفوظة كـ HTML)
    function textOf(html) {
        if (html == null) return "";
        var doc = new DOMParser().parseFromString("<body>" + String(html) + "</body>", "text/html");
        return clean(doc.body.textContent);
    }

    var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
    function toNum(s) {
        s = clean(s).replace(/[٠-٩]/g, function (d) { return String(AR_DIGITS.indexOf(d)); }).replace(/[,،]/g, ".");
        var m = s.match(/-?\d+(\.\d+)?/);
        return m ? parseFloat(m[0]) : NaN;
    }

    // مفتاح مطابقة الأسماء بين قائمة مدرستي والقائمة المستوردة
    function nameKey(s) {
        return clean(s).replace(/[ً-ْـ]/g, "")
            .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
            .replace(/\bبن\b|\bبنت\b/g, "").replace(/\s+/g, " ").trim();
    }

    // يحلّل html مدرستي إلى صفوف {name, status, degree, date, note, state}
    // state: "done" (درجة > 0) | "attempted" (سُلّم دون درجة) | "notdone"  — نفس منطق الميزة في التقرير الشامل
    function parseItems(html) {
        var doc = new DOMParser().parseFromString("<body>" + String(html || "") + "</body>", "text/html");
        var body = doc.body;
        var items = body.querySelectorAll(".list-group-item");
        if (!items.length) items = body.querySelectorAll(".card-group-vertical");
        var rows = [];
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var nameEl = it.querySelector("h6") || it.querySelector(".form-check .fs-6") || it.querySelector(".fs-6");
            var name = nameEl ? clean(nameEl.textContent) : "";
            if (!name) continue;
            var degree = "", status = "", date = "", labels = {};
            var lis = it.querySelectorAll("li");
            for (var j = 0; j < lis.length; j++) {
                var t = clean(lis[j].textContent);
                var k = t.indexOf(":");
                if (k < 0) continue;
                var label = clean(t.slice(0, k)), val = clean(t.slice(k + 1));
                labels[label] = val;
                if (label.indexOf("الدرجة") >= 0 && !degree) degree = val;
                else if (label.indexOf("الحالة") >= 0 && !status) status = val;
                else if (label.indexOf("تاريخ") >= 0 && !date) date = val;
            }
            var dec = it.querySelector(".decimal");
            if (dec) {
                var dv = clean(dec.getAttribute("value") != null ? dec.getAttribute("value") : dec.value);
                if (dv !== "") degree = dv;          // الميزة تفضّل .decimal عند وجوده
                else if (!degree) degree = "";
            }
            var noteEl = it.querySelector("gg") || it.querySelector("textarea");
            var note = noteEl ? clean(noteEl.textContent) : "";

            var n = toNum(degree);
            var state;
            if (!isNaN(n) && n > 0) state = "done";
            else if (status && status.indexOf("لم") >= 0) state = "notdone";
            else if (degree !== "" && degree.indexOf("لم") < 0) state = "attempted";
            else if (status && status.indexOf("لم") < 0 && !/^-?$/.test(status)) state = "attempted";
            else state = "notdone";
            if (date === "-" || date === "—") date = "";
            rows.push({ name: name, status: status, degree: degree, date: date, note: note, state: state });
        }
        return rows;
    }

    // دليل الطلاب المستوردين: اسم → {phone, classroom}
    function directory(data, params) {
        var lists = [data["m_students_" + params.school_id], data["n_students_" + params.school_id]];
        var dir = {};
        lists.forEach(function (list) {
            if (!Array.isArray(list)) return;
            list.forEach(function (s) {
                if (!s || !s.name) return;
                var k = nameKey(s.name);
                if (dir[k]) return;
                dir[k] = {
                    phone: clean(s.parent_phone || s.phone || s.student_phone || ""),
                    classroom: clean(s.classroom || s.row_name || s.classname || ""),
                    number: clean(s.number || "")
                };
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

    function stateBadge(r, h) {
        var text = r.status || (r.state === "done" ? "تم الحل" : r.state === "attempted" ? "تم التسليم" : "لم يتم الحل");
        return h.badge(text, r.state === "done" ? "ok" : r.state === "attempted" ? "warn" : "danger");
    }

    CorbitReports.register("homeworks", {
        title: "تقرير متابعة الواجبات والاختبارات والأنشطة",
        subtitle: function (data, params) {
            var type = params.type || data.type || "";
            var t = TYPE_LABEL[type] || "عنصر";
            return t + ": " + textOf(data.title || "");
        },
        keys: function (params) {
            return ["type", "html", "name", "title", "details", "m_students_" + params.school_id, "n_students_" + params.school_id];
        },
        render: function (data, params, h) {
            var type = params.type || data.type || "";
            var typeLabel = TYPE_LABEL[type] || "العنصر";
            var title = textOf(data.title), subject = textOf(data.name), details = textOf(data.details);
            var out = "";

            if (!data.html) {
                return "<div class='notice'><strong>لا توجد بيانات لهذا التقرير.</strong><br>" +
                    "من قائمة سكول بت في مدرستي اختر «الواجبات والاختبارات والأنشطة للطلاب»، ثم اضغط «عرض التقريـر» بجانب العنصر المطلوب ليُجهَّز هذا التقرير.</div>";
            }

            var rows = parseItems(data.html);
            var dir = directory(data, params);
            var hasDir = Object.keys(dir).length > 0;
            rows.forEach(function (r) {
                var d = lookup(dir, r.name);
                r.classroom = d ? d.classroom : "";
                r.phone = d ? d.phone : "";
            });

            var done = rows.filter(function (r) { return r.state === "done"; }).length;
            var attempted = rows.filter(function (r) { return r.state === "attempted"; }).length;
            var notdone = rows.length - done - attempted;
            var pct = rows.length ? Math.round(done / rows.length * 100) : 0;

            // بطاقة العنصر
            out += "<table class='rpt' style='margin-top:0'><tbody>" +
                "<tr><th style='width:110px'>النوع</th><td class='text'>" + h.esc(typeLabel) + "</td>" +
                "<th style='width:110px'>العنوان</th><td class='text'>" + h.esc(title || "—") + "</td></tr>" +
                "<tr><th>المادة / الفصل</th><td class='text'>" + h.esc(subject || "—") + "</td>" +
                "<th>التفاصيل</th><td class='text'>" + h.esc(details || "—") + "</td></tr>" +
                "</tbody></table>";

            out += h.stats([
                { label: "عدد الطلاب", value: rows.length },
                { label: "تم الحل", value: done },
                { label: "سُلّم دون درجة", value: attempted },
                { label: "لم يتم الحل", value: notdone },
                { label: "نسبة الإنجاز", value: pct + "%" }
            ]);

            if (!rows.length) {
                out += "<div class='notice'>تعذّر التعرّف على قائمة الطلاب في صفحة مدرستي. أعد فتح التقرير من مدرستي مرة أخرى.</div>";
                return out;
            }
            if (!hasDir) {
                out += "<div class='notice no-print'>لم تُستورد قائمة الطلاب بعد، لذلك لا تظهر الفصول وأرقام الجوال. " +
                    "استورد بيانات الطلاب أولاً من قائمة سكول بت (استيراد الطلاب من مدرستي أو من نور) لتتمكن من إرسال التنبيهات.</div>";
            }

            var cols = [
                { key: "name", label: "اسم الطالب", cls: "text" },
                { key: "classroom", label: "الفصل", fmt: function (v) { return h.esc(v || "—"); } },
                { key: "status", label: "الحالة", fmt: function (v, r) { return stateBadge(r, h); } },
                { key: "degree", label: "الدرجة", cls: "num", fmt: function (v) { return h.esc(v === "" ? "—" : v); } },
                { key: "date", label: "تاريخ التسليم", cls: "num", fmt: function (v) { return h.esc(v || "—"); } },
                { key: "note", label: "ملاحظات المعلم", cls: "text", fmt: function (v) { return h.esc(v || ""); } }
            ];

            out += "<h2>قائمة الطلاب (" + rows.length + ")</h2>" + h.table(cols, rows);

            var pending = rows.filter(function (r) { return r.state !== "done"; });
            out += "<h2>الطلاب الذين لم يُنجزوا " + h.esc(typeLabel === "العنصر" ? "العنصر" : "ال" + typeLabel) + " (" + pending.length + ")</h2>";
            if (!pending.length) {
                out += "<div class='notice'>جميع الطلاب أنجزوا " + h.esc(typeLabel === "العنصر" ? "العنصر" : "ال" + typeLabel) + ". أحسنتم!</div>";
            } else {
                out += h.table([
                    { key: "name", label: "اسم الطالب", cls: "text" },
                    { key: "classroom", label: "الفصل", fmt: function (v) { return h.esc(v || "—"); } },
                    { key: "status", label: "الحالة", fmt: function (v, r) { return stateBadge(r, h); } },
                    { key: "phone", label: "جوال ولي الأمر", cls: "num", fmt: function (v) { return v ? h.esc(v) : h.badge("غير متوفر", "muted"); } },
                    { key: function () { return ""; }, label: "توقيع ولي الأمر", width: "120px" }
                ], pending);

                // لوحة إرسال التنبيهات (لا تُطبع)
                var withPhone = pending.filter(function (r) { return r.phone; }).length;
                var school = data.school_name || params.school_name || "";
                var defMsg = "ولي أمر الطالب {الطالب}، نفيدكم بأن ابنكم لم يقم بـ" + (VERB[type] || "إنجاز") + " «{العنوان}» في {المادة}. نأمل متابعته وحثّه على الإنجاز عبر منصة مدرستي. " + (school ? "إدارة " + school : "إدارة المدرسة");
                out += "<div class='notice no-print' id='sms-panel'>" +
                    "<strong>إرسال تنبيه لأولياء أمور الطلاب الذين لم يُنجزوا</strong> — المستهدفون: " + pending.length +
                    " طالباً، منهم <span id='sms-count'>" + withPhone + "</span> لديهم رقم جوال في القائمة المستوردة.<br>" +
                    "<label style='display:block;margin:6px 0 2px'>نص الرسالة (يمكن استخدام {الطالب} {العنوان} {المادة}):</label>" +
                    "<textarea id='sms-text' rows='3' style='width:100%;font-family:inherit;font-size:13px;padding:6px;border:1px solid #cfcfcf;border-radius:6px'>" + h.esc(defMsg) + "</textarea>" +
                    "<div style='margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap'>" +
                    "<button class='btn btn-primary' id='sms-send' type='button'>📨 إرسال التنبيهات</button>" +
                    "<button class='btn' id='sms-settings' type='button'>⚙️ إعدادات بوابة الرسائل</button>" +
                    "<span id='sms-status' style='color:#666'></span></div></div>";
            }

            out += h.signatures(["المعلم", "وكيل الشؤون التعليمية", "مدير المدرسة"]);
            return out;
        },
        onReady: function (root, data, params, h) {
            var btn = root.querySelector("#sms-send");
            if (!btn) return;
            var status = root.querySelector("#sms-status");
            var settingsBtn = root.querySelector("#sms-settings");
            var type = params.type || data.type || "";
            var title = textOf(data.title), subject = textOf(data.name);
            var dir = directory(data, params);
            var pending = parseItems(data.html).filter(function (r) { return r.state !== "done"; });

            settingsBtn.addEventListener("click", function () { if (window.CorbitSMS) CorbitSMS.openSettings(); });

            btn.addEventListener("click", function () {
                if (!window.CorbitSMS) { status.textContent = "وحدة الرسائل غير محمّلة."; return; }
                var tpl = root.querySelector("#sms-text").value || "";
                var msgs = [];
                pending.forEach(function (r) {
                    var d = lookup(dir, r.name);
                    if (!d || !d.phone) return;
                    msgs.push({ phone: d.phone, message: tpl.replace(/\{الطالب\}/g, r.name).replace(/\{العنوان\}/g, title).replace(/\{المادة\}/g, subject || TYPE_PLURAL[type] || "") });
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
