// التقرير التراكمي للمعلمين (مدرستي) — بديل محلي لصفحة /reports/teachers-full القديمة.
//
// الميزة: assets/js/features/madrasati/teachers-full.js
// المفاتيح المحفوظة:
//   teachersReportsHTML : نص HTML خام (ليس JSON) مكوّن من مقاطع متتالية، مقطع لكل معلم مختار:
//                         "<div class='caaaa'><id>معرّف المعلم</id>…HTML صفحة إحصائيات مواد المعلم في مدرستي…</div>"
//                         (الصفحة: TeachersReports/Subjects/GetTeacherSubjectStatistics — جدول المواد والفصول وأعداد الحصص/العناصر)
//   teachers            : [{ name, phone, id }]  كل معلمي المدرسة (لربط المعرّف بالاسم والجوال)
// المعاملات: school_id (وتُقرأ school_name من التخزين)
//
// الخادم القديم كان يعرض الجدول كما أرسلته مدرستي؛ هنا نحلّل كل مقطع بـ DOMParser، نحذف السكربتات
// والمعالجات المضمّنة، ونعيد بناء جدول نظيف لكل معلم مع صف إجمالي، وجدولاً تراكمياً لكل المعلمين.
(function () {
    "use strict";

    var SPLIT_RE = /<div[^>]*class=['"]?caaaa['"]?[^>]*>/i;

    // يقسّم القيمة المحفوظة (نص متصل أو مصفوفة مقاطع) إلى مقاطع HTML
    function toSnippets(raw) {
        if (Array.isArray(raw)) {
            var all = [];
            raw.forEach(function (x) { all = all.concat(toSnippets(x)); });
            return all;
        }
        if (raw == null) return [];
        var s = String(raw);
        if (!s.trim()) return [];
        var parts = s.split(SPLIT_RE);
        var out = [];
        parts.forEach(function (p) { if (p && p.trim()) out.push(p); });
        return out;
    }

    // يحذف السكربتات والأنماط والإطارات وكل معالجات الأحداث وروابط javascript:
    function sanitize(root) {
        var bad = root.querySelectorAll("script, style, iframe, object, embed, link, meta, noscript, form, input, button, select, textarea");
        for (var i = bad.length - 1; i >= 0; i--) bad[i].parentNode && bad[i].parentNode.removeChild(bad[i]);
        var all = root.querySelectorAll("*");
        for (var j = 0; j < all.length; j++) {
            var el = all[j];
            var attrs = el.attributes;
            for (var k = attrs.length - 1; k >= 0; k--) {
                var n = attrs[k].name.toLowerCase();
                var v = String(attrs[k].value || "");
                if (n.indexOf("on") === 0 || n === "style" || n === "srcdoc" ||
                    ((n === "href" || n === "src" || n === "action" || n === "formaction") && /^\s*javascript:/i.test(v))) {
                    el.removeAttribute(attrs[k].name);
                }
            }
        }
    }

    function clean(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }

    // تحويل النص إلى رقم (يدعم الأرقام العربية الهندية والنسب المئوية)
    var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
    function toNum(s) {
        s = clean(s);
        if (!s) return null;
        s = s.replace(/[٠-٩]/g, function (d) { return String(AR_DIGITS.indexOf(d)); }).replace(/[,،]/g, "");
        var isPct = /[%٪]\s*$/.test(s) || /^\s*[%٪]/.test(s);
        s = s.replace(/[%٪]/g, "").trim();
        if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
        return { v: parseFloat(s), pct: isPct };
    }

    // يحلّل مقطع معلم واحد: المعرّف + جداول (رؤوس وصفوف) + نص بديل إن لم يوجد جدول
    function parseSnippet(html) {
        var doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
        var body = doc.body;
        sanitize(body);
        var idEl = body.querySelector("id");
        var id = idEl ? clean(idEl.textContent) : "";
        if (idEl && idEl.parentNode) idEl.parentNode.removeChild(idEl);

        var tables = [];
        var tEls = body.querySelectorAll("table");
        for (var i = 0; i < tEls.length; i++) {
            var t = tEls[i];
            if (t.querySelector("table")) continue; // جدول حاوٍ لجداول أخرى — نأخذ الداخلية
            var trs = t.querySelectorAll("tr");
            var heads = [];
            var rows = [];
            for (var r = 0; r < trs.length; r++) {
                var tr = trs[r];
                var cells = tr.children;
                var vals = [];
                var isHead = tr.querySelectorAll("th").length > 0 && tr.querySelectorAll("td").length === 0;
                var hasSpan = false;
                for (var c = 0; c < cells.length; c++) {
                    var cell = cells[c];
                    if (cell.tagName !== "TD" && cell.tagName !== "TH") continue;
                    if (cell.hasAttribute("colspan") && parseInt(cell.getAttribute("colspan"), 10) > 1) hasSpan = true;
                    vals.push(clean(cell.textContent));
                }
                if (!vals.length) continue;
                if (isHead) { if (!heads.length) heads = vals; continue; }
                if (hasSpan && vals.length === 1) continue; // صف "لا توجد بيانات" أو صف دمج
                if (!vals.join("")) continue;
                rows.push(vals);
            }
            if (!heads.length && rows.length) heads = rows.shift();
            if (!heads.length && !rows.length) continue;
            tables.push({ heads: heads, rows: rows });
        }
        var text = tables.length ? "" : clean(body.textContent).slice(0, 600);
        return { id: id, tables: tables, text: text };
    }

    // تحديد الأعمدة الرقمية (كل قيمها غير الفارغة أرقام) وحساب المجاميع
    function analyze(tbl) {
        var n = tbl.heads.length;
        tbl.rows.forEach(function (r) { while (r.length < n) r.push(""); });
        var numeric = [];
        var sums = [];
        for (var c = 0; c < n; c++) {
            var ok = true, any = false, pct = false, sum = 0;
            tbl.rows.forEach(function (r) {
                var x = toNum(r[c]);
                if (x === null) { if (clean(r[c])) ok = false; return; }
                any = true; sum += x.v; if (x.pct) pct = true;
            });
            // العمود الأول عادةً اسم المادة؛ لا نجمعه حتى لو كان رقماً
            numeric[c] = ok && any && c > 0;
            sums[c] = numeric[c] ? { v: sum, pct: pct } : null;
        }
        tbl.numeric = numeric;
        tbl.sums = sums;
        return tbl;
    }

    function fmtNum(x) {
        if (x == null) return "";
        var v = Math.round(x.v * 100) / 100;
        return String(v) + (x.pct ? "%" : "");
    }

    function renderTable(tbl, h) {
        var html = "<table class='rpt'><thead><tr><th style='width:36px'>#</th>";
        tbl.heads.forEach(function (hd) { html += "<th>" + h.esc(hd) + "</th>"; });
        html += "</tr></thead><tbody>";
        if (!tbl.rows.length) {
            html += "<tr><td colspan='" + (tbl.heads.length + 1) + "'>لا توجد بيانات</td></tr>";
        }
        tbl.rows.forEach(function (r, i) {
            html += "<tr><td>" + (i + 1) + "</td>";
            r.forEach(function (v, c) {
                html += "<td class='" + (tbl.numeric[c] ? "num" : (c === 0 ? "text" : "")) + "'>" + h.esc(v) + "</td>";
            });
            html += "</tr>";
        });
        if (tbl.rows.length && tbl.sums.some(function (s) { return s; })) {
            html += "<tr class='total'><td></td>";
            tbl.heads.forEach(function (_, c) {
                var s = tbl.sums[c];
                if (c === 0) html += "<td class='text'><strong>الإجمالي</strong></td>";
                else if (s && s.pct) {
                    // النسب لا تُجمع؛ نعرض متوسطها
                    var cnt = tbl.rows.filter(function (r) { return toNum(r[c]) !== null; }).length;
                    html += "<td class='num'><strong>" + h.esc(cnt ? Math.round(s.v / cnt) + "%" : "") + "</strong></td>";
                }
                else if (s) html += "<td class='num'><strong>" + h.esc(fmtNum(s)) + "</strong></td>";
                else html += "<td></td>";
            });
            html += "</tr>";
        }
        html += "</tbody></table>";
        return html;
    }

    CorbitReports.register("teachers-full", {
        title: "التقرير التراكمي للمعلمين",
        subtitle: function () { return "إحصائيات المواد والحصص وعناصر الإعداد لكل معلم — منصة مدرستي"; },
        keys: ["teachersReportsHTML", "teachers"],
        landscape: true,
        render: function (data, params, h) {
            var snippets = toSnippets(data["teachersReportsHTML"]);
            var teachers = Array.isArray(data["teachers"]) ? data["teachers"] : [];
            if (!snippets.length) {
                return "<div class='notice'><strong>لا توجد بيانات محفوظة لهذا التقرير.</strong><br>" +
                    "افتح صفحة المعلمين في مدرستي، ثم شغّل «التقرير التراكمي للمعلمين» من قائمة سكول بت، واختر المعلمين واضغط «عرض التقرير الآن»، وانتظر اكتمال التحميل حتى يُفتح التقرير.</div>";
            }
            var byId = {};
            teachers.forEach(function (t) { byId[String(t.id)] = t; });

            var items = [];
            snippets.forEach(function (s, i) {
                var p = parseSnippet(s);
                var t = byId[p.id] || { name: p.id ? "معلم (" + p.id + ")" : "معلم " + (i + 1), phone: "", id: p.id };
                p.name = t.name; p.phone = t.phone || "";
                p.tables.forEach(analyze);
                items.push(p);
            });

            // الجدول التراكمي: صف لكل معلم بمجاميع الأعمدة الرقمية (حسب رؤوس أول جدول)
            var refHeads = null;
            items.some(function (p) { if (p.tables.length) { refHeads = p.tables[0]; return true; } return false; });
            var totalRows = 0, totalTables = 0;
            items.forEach(function (p) { p.tables.forEach(function (t) { totalTables++; totalRows += t.rows.length; }); });

            var html = h.stats([
                { label: "المعلمون في التقرير", value: items.length },
                { label: "إجمالي السطور (المواد/الفصول)", value: totalRows },
                { label: "معلمون بلا بيانات", value: items.filter(function (p) { return !p.tables.length || !p.tables.some(function (t) { return t.rows.length; }); }).length }
            ]);

            if (refHeads) {
                var numCols = [];
                refHeads.heads.forEach(function (hd, c) { if (refHeads.numeric[c]) numCols.push({ c: c, label: hd }); });
                html += "<h2>الملخص التراكمي لكل المعلمين</h2>";
                html += "<table class='rpt'><thead><tr><th style='width:36px'>#</th><th>المعلم</th><th>الجوال</th><th>عدد السطور</th>";
                numCols.forEach(function (nc) { html += "<th>" + h.esc(nc.label) + "</th>"; });
                html += "</tr></thead><tbody>";
                var grand = {}; numCols.forEach(function (nc) { grand[nc.c] = { v: 0, pct: false, n: 0 }; });
                items.forEach(function (p, i) {
                    var rows = 0;
                    html += "<tr><td>" + (i + 1) + "</td><td class='text'>" + h.esc(p.name) + "</td><td class='num'>" + h.esc(p.phone) + "</td>";
                    var sums = {};
                    p.tables.forEach(function (t) {
                        rows += t.rows.length;
                        if (t.heads.join("|") !== refHeads.heads.join("|")) return; // جدول بتركيبة مختلفة
                        numCols.forEach(function (nc) {
                            var s = t.sums[nc.c];
                            if (!s) return;
                            sums[nc.c] = sums[nc.c] || { v: 0, pct: s.pct, n: 0 };
                            sums[nc.c].v += s.v;
                            sums[nc.c].n += t.rows.filter(function (r) { return toNum(r[nc.c]) !== null; }).length;
                        });
                    });
                    html += "<td class='num'>" + rows + "</td>";
                    numCols.forEach(function (nc) {
                        var s = sums[nc.c];
                        var cellTxt = "";
                        if (s) {
                            cellTxt = s.pct ? (s.n ? Math.round(s.v / s.n) + "%" : "") : fmtNum(s);
                            grand[nc.c].v += s.v; grand[nc.c].n += s.n; grand[nc.c].pct = s.pct;
                        }
                        html += "<td class='num'>" + h.esc(cellTxt) + "</td>";
                    });
                    html += "</tr>";
                });
                html += "<tr class='total'><td></td><td class='text'><strong>الإجمالي</strong></td><td></td><td class='num'><strong>" + totalRows + "</strong></td>";
                numCols.forEach(function (nc) {
                    var g = grand[nc.c];
                    html += "<td class='num'><strong>" + h.esc(g.pct ? (g.n ? Math.round(g.v / g.n) + "%" : "") : fmtNum(g)) + "</strong></td>";
                });
                html += "</tr></tbody></table>";
                html += "<p class='muted-note'>الأعمدة الرقمية تُجمع من جدول كل معلم، والنسب المئوية تُعرض كمتوسط للسطور.</p>";
            }

            // تفاصيل كل معلم — معلم في كل صفحة
            items.forEach(function (p, i) {
                html += h.pageBreak();
                html += "<div class='teacher-block'><h2>" + (i + 1) + ". " + h.esc(p.name) +
                    (p.phone ? " <span class='badge badge-muted num'>" + h.esc(p.phone) + "</span>" : "") + "</h2>";
                if (!p.tables.length) {
                    html += "<div class='notice'>لم يُعثر على جدول إحصائيات لهذا المعلم في بيانات مدرستي." +
                        (p.text ? "<br><small>" + h.esc(p.text) + "</small>" : "") + "</div>";
                } else {
                    p.tables.forEach(function (t, k) {
                        if (p.tables.length > 1) html += "<h3>جدول " + (k + 1) + "</h3>";
                        html += renderTable(t, h);
                    });
                }
                html += "</div>";
            });

            html += h.signatures(["وكيل الشؤون التعليمية", "مدير المدرسة"]);
            return html;
        },
        onReady: function (root) {
            // تمييز صفوف الإجمالي (بلا أنماط مضمّنة)
            var st = document.createElement("style");
            st.textContent = "table.rpt tr.total td{background:#f3f3f5;font-weight:800} .muted-note{color:#666;font-size:11px} .teacher-block{page-break-inside:auto}";
            root.appendChild(st);
        }
    });
})();
