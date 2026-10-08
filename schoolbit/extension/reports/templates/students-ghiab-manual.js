// رصد غياب اليوم يدوياً — صفحة تفاعلية تُبنى من قائمة الطلاب المستوردة:
//   "m_students_<school_id>" (من مدرستي) = [ {name, number, class_name, row_name, classroom, parent_phone, phone, student_phone, ...} ]
//   "n_students_<school_id>" (من نور)    = [ {name, number, classname, class_number, classroom, phone} ]
// تفتحها ميزة assets/js/features/madrasati/students-ghiab-manual.js بالمعاملات: type (m|n)، school_id.
//
// ما تفعله الصفحة:
//   1. تحديد الغائبين (بعذر / بدون عذر) والمتأخرين من قائمة الطلاب، مع تصفية بالفصل وبحث بالاسم.
//   2. طباعة كشف غياب وتأخر اليوم مجمّعاً بالفصول مع سطر التوقيعات.
// (أُزيل منها إرسال الرسائل لأولياء الأمور ورصد الغياب في نور بناءً على طلب المستخدم: غير مستخدمة.)
// المسودّة تُحفظ في "ghiab-manual-draft" حتى لا تضيع عند تحديث الصفحة.
CorbitReports.register("students-ghiab-manual", {
    title: "رصد غياب اليوم يدوياً",
    subtitle: function (data, params) {
        return "قائمة الطلاب من " + (params.type === "n" ? "نور" : "مدرستي") + " — حدّد الغائبين والمتأخرين ثم اطبع كشف اليوم";
    },
    keys: function (params) { return ["m_students_" + params.school_id, "n_students_" + params.school_id, "ghiab-manual-draft"]; },

    STATUSES: [
        { v: "1", label: "حاضر", badge: "ok" },
        { v: "48,", label: "غائب بدون عذر", badge: "danger" },
        { v: "141,", label: "غائب بعذر", badge: "warn" },
        { v: "late", label: "متأخر", badge: "warn" }
    ],

    render: function (data, params, h) {
        var T = this;
        var rows = T._rows(h.students(data, params), params);
        var isoDate = new Date().toISOString().split("T")[0];
        var draft = data["ghiab-manual-draft"];
        var marks = {};
        if (draft && typeof draft === "object" && draft.date === isoDate && draft.school_id === params.school_id && draft.type === (params.type || "m") && draft.marks) {
            marks = draft.marks;
        }
        rows.forEach(function (r) { r.status = marks[r.id] || "1"; });
        T._rows_cache = rows;
        T._isoDate = isoDate;

        if (!rows.length) {
            return "<div class='notice'><strong>لم يتم استيراد بيانات الطلاب" + (params.type === "n" ? " من نور" : " من مدرستي") + ".</strong><br>" +
                "استورد بيانات الطلاب أولاً من قائمة سكول بت في منصة مدرستي (" + (params.type === "n" ? "تحديث بيانات الطلاب من نور" : "تحديث بيانات الطلاب من مدرستي") + ")، ثم أعد فتح «رصد غياب اليوم يدوياً».</div>";
        }

        var classes = [];
        rows.forEach(function (r) { if (classes.indexOf(r.cls) < 0) classes.push(r.cls); });
        classes.sort(function (a, b) { return a.localeCompare(b, "ar", { numeric: true }); });

        var inp = "font-family:inherit;padding:5px 8px;border:1px solid var(--line);border-radius:6px;font-size:12px";
        var panel = "margin:10px 0;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:#fafafa";
        var html = "";

        // ── الإحصاءات ──
        html += "<div class='gm-stats'>" + T._stats(rows, h) + "</div>";

        // ── أدوات التحديد (لا تُطبع) ──
        html += "<div class='no-print' style='" + panel + "'>";
        html += "<div style='display:flex;gap:10px;align-items:center;flex-wrap:wrap'>";
        html += "<label>الفصل: <select class='gm-cls' style='" + inp + "'><option value=''>جميع الفصول (" + rows.length + ")</option>";
        classes.forEach(function (c) {
            var n = rows.filter(function (r) { return r.cls === c; }).length;
            html += "<option value='" + h.esc(c) + "'>" + h.esc(c) + " (" + n + ")</option>";
        });
        html += "</select></label>";
        html += "<label>بحث: <input class='gm-search' type='search' placeholder='اسم الطالب أو رقمه' style='" + inp + ";width:200px'></label>";
        html += "<button type='button' class='btn gm-all-absent'>تعيين المعروضين «غائب بدون عذر»</button>";
        html += "<button type='button' class='btn gm-reset'>إعادة الجميع «حاضر»</button>";
        html += "<button type='button' class='btn btn-primary gm-print-btn'>طباعة كشف اليوم</button>";
        html += "<span class='gm-save' style='font-size:11px;color:var(--muted)'></span>";
        html += "</div>";
        html += "<p style='font-size:11px;color:var(--muted);margin:6px 0 0'>اضغط على صف الطالب لتبديل حالته بين حاضر وغائب بدون عذر، أو اختر الحالة من القائمة. الحالات تُحفظ تلقائياً لهذا اليوم، ولا يُطبع إلا كشف الغائبين والمتأخرين أدناه.</p>";
        html += "</div>";

        // ── جدول التحديد (لا يُطبع) ──
        html += "<div class='no-print'><table class='rpt gm-table'><thead><tr>" +
            "<th style='width:32px'>#</th><th style='text-align:right'>اسم الطالب</th><th style='width:70px'>الرقم</th><th style='width:70px'>الفصل</th><th style='width:92px'>جوال ولي الأمر</th><th style='width:150px'>الحالة</th>" +
            "</tr></thead><tbody>";
        rows.forEach(function (r, i) {
            html += "<tr class='gm-row' data-id='" + h.esc(r.id) + "' data-cls='" + h.esc(r.cls) + "' data-search='" + h.esc(T._norm(r.name + " " + r.number)) + "' style='cursor:pointer'>";
            html += "<td class='gm-idx'>" + (i + 1) + "</td>";
            html += "<td class='text' style='white-space:nowrap'>" + h.esc(r.name) + "</td>";
            html += "<td class='num'>" + h.esc(r.number) + "</td>";
            html += "<td style='white-space:nowrap' title='" + h.esc(r.classname) + "'>" + h.esc(r.cls) + "</td>";
            html += "<td class='num'>" + (r.phone ? h.esc(r.phone) : "<span style='color:var(--danger)'>بدون جوال</span>") + "</td>";
            html += "<td><select class='gm-status' style='" + inp + ";width:100%'>";
            T.STATUSES.forEach(function (s) {
                html += "<option value='" + h.esc(s.v) + "'" + (s.v === r.status ? " selected" : "") + ">" + h.esc(s.label) + "</option>";
            });
            html += "</select></td></tr>";
        });
        html += "</tbody></table></div>";

        // ── كشف الغياب (يُطبع) ──
        html += "<div class='gm-print'>" + T._printList(rows, params, data, h) + "</div>";

        return html;
    },

    onReady: function (root, data, params, h) {
        var T = this;
        var rows = T._rows_cache || [];
        if (!rows.length) return;
        var byId = {};
        rows.forEach(function (r) { byId[r.id] = r; });

        var statsEl = root.querySelector(".gm-stats");
        var printEl = root.querySelector(".gm-print");
        var saveEl = root.querySelector(".gm-save");
        var clsSel = root.querySelector(".gm-cls");
        var search = root.querySelector(".gm-search");

        function refresh() {
            statsEl.innerHTML = T._stats(rows, h);
            printEl.innerHTML = T._printList(rows, params, data, h);
            saveDraft();
        }
        function setStatus(id, v, fromSelect) {
            var r = byId[id]; if (!r) return;
            r.status = v;
            var tr = root.querySelector("tr.gm-row[data-id='" + CSS.escape(id) + "']");
            if (tr) {
                if (!fromSelect) tr.querySelector(".gm-status").value = v;
                tr.style.background = v === "1" ? "" : v === "late" ? "#fff1e6" : "#fde8e6";
            }
        }
        var saveTimer = null;
        function saveDraft() {
            var marks = {};
            rows.forEach(function (r) { if (r.status !== "1") marks[r.id] = r.status; });
            var obj = {};
            obj["ghiab-manual-draft"] = JSON.stringify({ date: T._isoDate, school_id: params.school_id, type: params.type || "m", marks: marks });
            clearTimeout(saveTimer);
            saveTimer = setTimeout(function () {
                try {
                    chrome.storage.local.set(obj, function () { if (saveEl) saveEl.textContent = "تم الحفظ تلقائياً " + new Date().toLocaleTimeString("ar-SA"); });
                } catch (_) { /* خارج الإضافة */ }
            }, 300);
        }
        function applyFilter() {
            var c = clsSel.value;
            var q = T._norm(search.value);
            var n = 0;
            Array.prototype.forEach.call(root.querySelectorAll("tr.gm-row"), function (tr) {
                var ok = (!c || tr.getAttribute("data-cls") === c) && (!q || tr.getAttribute("data-search").indexOf(q) >= 0);
                tr.style.display = ok ? "" : "none";
                if (ok) { n++; tr.querySelector(".gm-idx").textContent = n; }
            });
        }

        // تلوين الحالات المستعادة من المسودّة
        rows.forEach(function (r) { if (r.status !== "1") setStatus(r.id, r.status); });

        clsSel.addEventListener("change", applyFilter);
        search.addEventListener("input", applyFilter);

        Array.prototype.forEach.call(root.querySelectorAll("tr.gm-row"), function (tr) {
            var id = tr.getAttribute("data-id");
            var sel = tr.querySelector(".gm-status");
            sel.addEventListener("change", function () { setStatus(id, sel.value, true); refresh(); });
            sel.addEventListener("click", function (e) { e.stopPropagation(); });
            tr.addEventListener("click", function (e) {
                if (e.target === sel) return;
                setStatus(id, byId[id].status === "1" ? "48," : "1");
                refresh();
            });
        });
        root.querySelector(".gm-all-absent").addEventListener("click", function () {
            Array.prototype.forEach.call(root.querySelectorAll("tr.gm-row"), function (tr) {
                if (tr.style.display !== "none") setStatus(tr.getAttribute("data-id"), "48,");
            });
            refresh();
        });
        root.querySelector(".gm-reset").addEventListener("click", function () {
            if (!window.confirm("إعادة جميع الطلاب إلى «حاضر»؟")) return;
            rows.forEach(function (r) { setStatus(r.id, "1"); });
            refresh();
        });
        root.querySelector(".gm-print-btn").addEventListener("click", function () {
            var marked = rows.filter(function (r) { return r.status !== "1"; });
            if (!marked.length && !window.confirm("لم يُحدَّد أي طالب غائب أو متأخر. طباعة الكشف فارغاً؟")) return;
            window.print();
        });
    },

    // ── أدوات داخلية ──
    _st: function (v) {
        var out = null;
        this.STATUSES.forEach(function (s) { if (s.v === v) out = s; });
        return out;
    },
    _norm: function (s) {
        return String(s == null ? "" : s)
            .replace(/[٠-٩]/g, function (c) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(c)); })
            .replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
            .replace(/\s+/g, " ").trim().toLowerCase();
    },
    _rows: function (students, params) {
        var isN = params.type === "n";
        var seen = {};
        return (students || []).map(function (st, i) {
            var classname = String(isN ? (st.classname || st.class_number || "") : (st.class_name || "")).trim();
            var classroom = String(isN ? (st.classroom || "") : (st.row_name || st.classroom || "")).trim();
            var cls = isN ? [classname, classroom].filter(Boolean).join(" - ") : (classroom || classname);
            var number = String(st.number == null ? "" : st.number).trim();
            var id = number || String(st.id || st.username || st.name || i);
            while (seen[id]) id = id + "_";
            seen[id] = true;
            return {
                id: id,
                name: String(st.name || "").trim(),
                number: number,
                classname: classname,
                classroom: classroom,
                cls: cls || "بدون فصل",
                phone: String(st.parent_phone || st.phone || st.student_phone || "").trim(),
                status: "1"
            };
        }).filter(function (r) { return r.name; });
    },
    _stats: function (rows, h) {
        var c = { "1": 0, "48,": 0, "141,": 0, "late": 0 };
        rows.forEach(function (r) { if (c[r.status] != null) c[r.status]++; });
        var absent = c["48,"] + c["141,"];
        return h.stats([
            { label: "إجمالي الطلاب", value: rows.length },
            { label: "حاضرون", value: c["1"] },
            { label: "غائبون بدون عذر", value: c["48,"] },
            { label: "غائبون بعذر", value: c["141,"] },
            { label: "متأخرون", value: c["late"] },
            { label: "نسبة الغياب", value: (rows.length ? Math.round(absent / rows.length * 100) : 0) + "%" }
        ]);
    },
    _printList: function (rows, params, data, h) {
        var T = this;
        var marked = rows.filter(function (r) { return r.status !== "1"; });
        var html = "<h2>كشف غياب وتأخر الطلاب — " + h.esc(params.date || h.today()) + "</h2>";
        if (!marked.length) {
            html += "<div class='notice'>لم يُحدَّد أي طالب غائب أو متأخر بعد. حدّد الحالات من جدول الطلاب أعلاه وسيظهر الكشف هنا جاهزاً للطباعة.</div>";
            return html;
        }
        var groups = h.group(marked, function (r) { return r.cls; });
        Object.keys(groups).sort(function (a, b) { return a.localeCompare(b, "ar", { numeric: true }); }).forEach(function (c) {
            var list = groups[c].slice().sort(function (a, b) { return a.name.localeCompare(b.name, "ar"); });
            html += "<h3>" + h.esc(c) + " <span style='color:var(--muted);font-weight:400;font-size:12px'>— " + list.length + " طالب</span></h3>";
            html += h.table([
                { key: "name", label: "اسم الطالب", cls: "text" },
                { key: "number", label: "رقم الطالب", cls: "num", width: "100px" },
                { key: "phone", label: "جوال ولي الأمر", cls: "num", width: "110px" },
                { key: "status", label: "الحالة", width: "130px", fmt: function (v) { var s = T._st(v); return s ? h.badge(s.label, s.badge) : h.esc(v); } },
                { key: function () { return ""; }, label: "ملاحظات", width: "120px" }
            ], list);
        });
        html += h.signatures(["وكيل شؤون الطلاب", "المرشد الطلابي", "مدير المدرسة"]);
        return html;
    }
});
