// مصمم البيان — يبني بطاقات/شهادات/خطابات من بيانات الطلاب المستوردة أو المعلمين.
// البيانات: "teachers" = [{name, phone, id}] تحفظها ميزة مصمم البيان،
// و"m_students_<school_id>" (أو n_students_) قائمة الطلاب المستوردة.
// المصمم كله DOM + CSS بلا سكربتات مضمّنة (CSP: script-src 'self').
CorbitReports.register("desinger", {
    title: "مصمم البيان",
    subtitle: function (data, params) {
        var s = CorbitReports.helpers.students(data, params);
        var t = Array.isArray(data.teachers) ? data.teachers : [];
        return "الطلاب المستوردون: " + s.length + " — المعلمون: " + t.length;
    },
    keys: function (params) {
        return ["teachers", "m_students_" + params.school_id, "n_students_" + params.school_id];
    },

    // ── الإعدادات الافتراضية لكل تخطيط ──
    _layouts: {
        card: {
            label: "بطاقة بيانات",
            title: "بطاقة بيانات الطالب",
            body: "الاسم: {name}\nالصف: {class}\nرقم الطالب: {number}\nالجوال: {phone}\nالمدرسة: {school}",
            mode: "grid"
        },
        cert: {
            label: "شهادة",
            title: "شهادة شكر وتقدير",
            body: "تتقدم إدارة {school} بخالص الشكر والتقدير إلى الطالب\n{name}\nمن الصف {class}\nنظير تميزه وجهوده المبذولة خلال الفصل الدراسي، سائلين الله له دوام التوفيق والنجاح.",
            mode: "page"
        },
        letter: {
            label: "خطاب",
            title: "خطاب لولي الأمر",
            body: "المكرم ولي أمر الطالب / {name}\nالصف: {class}\n\nالسلام عليكم ورحمة الله وبركاته،\n\nنفيدكم بأن ابنكم مسجّل لدينا في {school}، ونأمل منكم التواصل مع إدارة المدرسة على الجوال المسجّل ({phone}) لمتابعة شؤونه الدراسية.\n\nشاكرين لكم حسن تعاونكم.",
            mode: "page"
        }
    },

    render: function (data, params, h) {
        var students = h.students(data, params);
        var teachers = Array.isArray(data.teachers) ? data.teachers : [];
        var L = this._layouts;

        var html = "";
        if (!students.length && !teachers.length) {
            return "<div class='notice'><strong>لا توجد بيانات لتصميم البيان.</strong><br>" +
                "استورد بيانات الطلاب أولاً من قائمة سكول بت (استيراد الطلاب من مدرستي)، أو افتح «مصمم البيان» من داخل مدرستي ليتم جلب قائمة المعلمين.</div>";
        }

        // ── لوحة التصميم (لا تُطبع) ──
        var classes = Object.keys(h.group(students, function (s) { return s.row_name || s.class_name || "بدون صف"; })).sort();
        html += "<div class='dsg-panel no-print' id='dsg-panel'>";
        html += "<div class='dsg-row'>";
        html += "<label>الفئة <select id='dsg-aud'>" +
            "<option value='students'>الطلاب (الكل)</option>" +
            "<option value='class'>طلاب صف محدد</option>" +
            "<option value='teachers'>المعلمون</option>" +
            "</select></label>";
        html += "<label id='dsg-class-wrap' class='dsg-hidden'>الصف <select id='dsg-class'>" +
            classes.map(function (c) { return "<option value='" + h.esc(c) + "'>" + h.esc(c) + "</option>"; }).join("") +
            "</select></label>";
        html += "<label>التخطيط <select id='dsg-layout'>" +
            Object.keys(L).map(function (k) { return "<option value='" + k + "'>" + h.esc(L[k].label) + "</option>"; }).join("") +
            "</select></label>";
        html += "<label>العرض <select id='dsg-mode'>" +
            "<option value='grid'>شبكة بطاقات</option>" +
            "<option value='page'>عنصر في كل صفحة</option>" +
            "</select></label>";
        html += "<label id='dsg-cols-wrap'>الأعمدة <select id='dsg-cols'>" +
            "<option value='1'>1</option><option value='2' selected>2</option><option value='3'>3</option>" +
            "</select></label>";
        html += "<label>حجم الخط <input type='range' id='dsg-font' min='10' max='28' value='14'> <span id='dsg-font-v'>14</span></label>";
        html += "</div>";

        html += "<div class='dsg-row'>";
        html += "<label class='dsg-grow'>العنوان <input type='text' id='dsg-title' value='" + h.esc(L.card.title) + "'></label>";
        html += "</div>";
        html += "<div class='dsg-row'>";
        html += "<label class='dsg-grow'>نص البيان <textarea id='dsg-body' rows='5'>" + h.esc(L.card.body) + "</textarea></label>";
        html += "</div>";
        html += "<div class='dsg-row dsg-hint'>المتغيرات المتاحة: " +
            ["{name}", "{class}", "{phone}", "{school}", "{number}", "{date}"].map(function (p) { return "<code class='dsg-ph' data-ph='" + p + "'>" + p + "</code>"; }).join(" ") +
            " — اضغط على المتغير لإدراجه في النص.</div>";
        html += "<div class='dsg-row'>";
        html += "<label><input type='checkbox' id='dsg-sign'> سطر التوقيعات</label>";
        html += "<label><input type='checkbox' id='dsg-nohdr'> إخفاء ترويسة الصفحة عند الطباعة</label>";
        html += "<label><input type='checkbox' id='dsg-frame' checked> إطار مزخرف</label>";
        html += "<span class='dsg-grow'></span>";
        html += "<button type='button' class='btn' id='dsg-reset'>إعادة النص الافتراضي</button>";
        html += "<button type='button' class='btn btn-primary' id='dsg-print'>🖨️ طباعة</button>";
        html += "</div>";
        html += "<div class='dsg-row dsg-summary' id='dsg-summary'></div>";
        html += "</div>";

        // ── المعاينة ──
        html += "<div id='dsg-preview' class='dsg-preview'></div>";
        return html;
    },

    onReady: function (root, data, params, h) {
        var self = this;
        var L = this._layouts;
        var students = h.students(data, params);
        var teachers = Array.isArray(data.teachers) ? data.teachers : [];
        var school = params.school_name || data.school_name || "";
        if (!students.length && !teachers.length) return;

        // أنماط المصمم (CSP يمنع السكربت المضمّن لا الأنماط)
        var css = document.createElement("style");
        css.textContent = [
            ".dsg-panel{background:#fafafa;border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:0 0 12px}",
            ".dsg-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:4px 0}",
            ".dsg-row label{display:flex;align-items:center;gap:6px;font-weight:700;font-size:12px}",
            ".dsg-row label.dsg-grow,.dsg-grow{flex:1 1 auto}",
            ".dsg-row select,.dsg-row input[type=text],.dsg-row textarea{font-family:inherit;font-size:13px;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:#fff}",
            ".dsg-row input[type=text],.dsg-row textarea{flex:1 1 auto;width:100%}",
            ".dsg-row textarea{line-height:1.6;resize:vertical}",
            ".dsg-hint{font-size:11px;color:var(--muted)}",
            ".dsg-ph{background:#fff1e6;color:var(--warn);padding:1px 6px;border-radius:4px;cursor:pointer;font-family:Tahoma,monospace;direction:ltr;display:inline-block}",
            ".dsg-summary{font-size:12px;color:var(--muted);border-top:1px dashed var(--line);padding-top:6px}",
            ".dsg-hidden{display:none!important}",
            ".dsg-grid{display:grid;gap:8mm;grid-template-columns:repeat(var(--dsg-cols,2),1fr)}",
            ".dsg-item{border:1px solid var(--line);border-radius:8px;padding:8mm 6mm;break-inside:avoid;page-break-inside:avoid;line-height:1.9;background:#fff}",
            ".dsg-item.framed{border:3px double var(--primary);outline:1px solid var(--primary);outline-offset:3px}",
            ".dsg-item .dsg-t{font-weight:800;color:var(--primary);font-size:1.35em;margin:0 0 4mm;text-align:center}",
            ".dsg-item .dsg-b{white-space:normal}",
            ".dsg-page{min-height:250mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always;break-after:page}",
            ".dsg-page:last-child{page-break-after:auto;break-after:auto}",
            ".dsg-page .dsg-item{min-height:230mm;display:flex;flex-direction:column;justify-content:center;padding:14mm 12mm}",
            ".dsg-page .dsg-t{font-size:2.1em;margin-bottom:10mm}",
            ".dsg-cert .dsg-b{text-align:center;font-size:1.15em}",
            ".dsg-letter .dsg-t{text-align:right}",
            ".dsg-letter .dsg-b{text-align:right}",
            ".dsg-item .dsg-school{margin-top:auto;padding-top:6mm;color:var(--muted);font-size:.85em;text-align:center}",
            ".dsg-item .dsg-sch-num{font-family:Tahoma,Arial,sans-serif;direction:ltr;unicode-bidi:embed}",
            ".dsg-item .sign{margin-top:12mm;padding:0}",
            "body.dsg-nohdr .report-header,body.dsg-nohdr .report-footer{display:none}",
            "@media print{.dsg-grid{gap:6mm}.dsg-item{background:#fff}}"
        ].join("\n");
        document.head.appendChild(css);

        var $ = function (id) { return root.querySelector("#" + id); };
        var el = {
            aud: $("dsg-aud"), cls: $("dsg-class"), clsWrap: $("dsg-class-wrap"), layout: $("dsg-layout"),
            mode: $("dsg-mode"), cols: $("dsg-cols"), colsWrap: $("dsg-cols-wrap"), font: $("dsg-font"), fontV: $("dsg-font-v"),
            title: $("dsg-title"), body: $("dsg-body"), sign: $("dsg-sign"), nohdr: $("dsg-nohdr"), frame: $("dsg-frame"),
            reset: $("dsg-reset"), print: $("dsg-print"), preview: $("dsg-preview"), summary: $("dsg-summary")
        };

        var storeKey = "corbit_desinger_" + (params.school_id || "");
        function save() {
            try {
                localStorage.setItem(storeKey, JSON.stringify({
                    aud: el.aud.value, cls: el.cls.value, layout: el.layout.value, mode: el.mode.value, cols: el.cols.value,
                    font: el.font.value, title: el.title.value, body: el.body.value, sign: el.sign.checked, nohdr: el.nohdr.checked, frame: el.frame.checked
                }));
            } catch (_) { /* تجاهل */ }
        }
        function load() {
            try {
                var s = JSON.parse(localStorage.getItem(storeKey) || "null");
                if (!s) return;
                if (s.aud) el.aud.value = s.aud;
                if (s.cls) el.cls.value = s.cls;
                if (s.layout && L[s.layout]) el.layout.value = s.layout;
                if (s.mode) el.mode.value = s.mode;
                if (s.cols) el.cols.value = s.cols;
                if (s.font) el.font.value = s.font;
                if (typeof s.title === "string") el.title.value = s.title;
                if (typeof s.body === "string") el.body.value = s.body;
                el.sign.checked = !!s.sign; el.nohdr.checked = !!s.nohdr; el.frame.checked = s.frame !== false;
            } catch (_) { /* تجاهل */ }
        }

        // إن لم يوجد طلاب فالفئة الوحيدة هي المعلمون، والعكس
        if (!students.length) { el.aud.value = "teachers"; el.aud.querySelector("[value=students]").disabled = true; el.aud.querySelector("[value=class]").disabled = true; }
        if (!teachers.length) el.aud.querySelector("[value=teachers]").disabled = true;

        function audience() {
            var a = el.aud.value;
            if (a === "teachers") return teachers.map(function (t) {
                return { name: t.name, cls: "معلم", phone: t.phone, number: t.id || "" };
            });
            var list = students;
            if (a === "class") {
                var c = el.cls.value;
                list = students.filter(function (s) { return (s.row_name || s.class_name || "بدون صف") === c; });
            }
            return list.map(function (s) {
                var cls = s.class_name || s.row_name || "";
                if (s.row_name && s.class_name && s.row_name !== s.class_name) cls = s.class_name + " (" + s.row_name + ")";
                return { name: s.name, cls: cls, phone: s.phone || s.parent_phone || s.student_phone || "", number: s.number || "" };
            });
        }

        function fill(text, item, today) {
            return String(text || "")
                .replace(/\{name\}/g, item.name || "")
                .replace(/\{class\}/g, item.cls || "")
                .replace(/\{phone\}/g, item.phone || "")
                .replace(/\{school\}/g, school || "")
                .replace(/\{number\}/g, item.number || "")
                .replace(/\{date\}/g, today);
        }

        function update() {
            var layout = el.layout.value;
            var mode = el.mode.value;
            el.clsWrap.classList.toggle("dsg-hidden", el.aud.value !== "class");
            el.colsWrap.classList.toggle("dsg-hidden", mode !== "grid");
            el.fontV.textContent = el.font.value;
            document.body.classList.toggle("dsg-nohdr", el.nohdr.checked);

            var items = audience();
            var today = h.today();
            var signHtml = el.sign.checked ? h.signatures(el.aud.value === "teachers" ? ["المعلم", "مدير المدرسة"] : ["ولي الأمر", "المرشد الطلابي", "مدير المدرسة"]) : "";
            var framed = el.frame.checked ? " framed" : "";
            var out = "";
            items.forEach(function (it) {
                var t = h.esc(fill(el.title.value, it, today));
                var b = h.esc(fill(el.body.value, it, today)).replace(/\n/g, "<br>");
                var card = "<div class='dsg-item dsg-" + layout + framed + "' style='font-size:" + parseInt(el.font.value, 10) + "px'>" +
                    (t ? "<div class='dsg-t'>" + t + "</div>" : "") +
                    "<div class='dsg-b'>" + b + "</div>" +
                    signHtml +
                    (mode === "page" && school ? "<div class='dsg-school'>" + h.esc(school) + " — " + h.esc(today) + "</div>" : "") +
                    "</div>";
                out += mode === "page" ? "<div class='dsg-page'>" + card + "</div>" : card;
            });
            if (!items.length) out = "<div class='notice'>لا يوجد أفراد في هذه الفئة.</div>";
            el.preview.className = "dsg-preview" + (mode === "grid" ? " dsg-grid" : "");
            el.preview.style.setProperty("--dsg-cols", el.cols.value);
            el.preview.innerHTML = out;
            el.summary.textContent = "سيُطبع " + items.length + " " + (el.aud.value === "teachers" ? "بيان للمعلمين" : "بيان للطلاب") +
                (mode === "page" ? " — صفحة لكل فرد." : " — " + el.cols.value + " في كل صف.");
            save();
        }

        function applyLayoutDefaults() {
            var d = L[el.layout.value] || L.card;
            el.title.value = d.title;
            el.body.value = d.body;
            el.mode.value = d.mode;
        }

        load();
        el.layout.addEventListener("change", function () { applyLayoutDefaults(); update(); });
        el.reset.addEventListener("click", function () { applyLayoutDefaults(); update(); });
        ["aud", "cls", "mode", "cols", "sign", "nohdr", "frame"].forEach(function (k) { el[k].addEventListener("change", update); });
        ["font", "title", "body"].forEach(function (k) { el[k].addEventListener("input", update); });
        el.print.addEventListener("click", function () { window.print(); });
        Array.prototype.forEach.call(root.querySelectorAll(".dsg-ph"), function (c) {
            c.addEventListener("click", function () {
                var ph = c.getAttribute("data-ph");
                var ta = el.body, s = ta.selectionStart || 0, e = ta.selectionEnd || 0;
                ta.value = ta.value.slice(0, s) + ph + ta.value.slice(e);
                ta.focus(); ta.selectionStart = ta.selectionEnd = s + ph.length;
                update();
            });
        });
        update();
    }
});
