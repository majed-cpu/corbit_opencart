// عارض التقارير المحلي لإضافة «سكول بت».
//
// يُفتح من صفحات نور/مدرستي هكذا:
//   window.open(corbit_report_url("teachers-week") + "&school_id=..&date=..")
// أي: reports/view.html?r=<اسم التقرير>&<بقية المعاملات>
//
// يحمّل القالب reports/templates/<اسم التقرير>.js، ثم يقرأ البيانات التي حفظتها
// الميزة في chrome.storage.local (عبر corbit_set في الصفحة)، ويعرض التقرير
// مع أزرار الطباعة والتصدير إلى Excel. لا يتصل بأي خادم.
//
// عقد القالب (انظر reports/README.md):
//   CorbitReports.register("name", {
//     title: "…",                       // عنوان التقرير
//     keys: ["k1", "k2"] | (params) => [...],   // مفاتيح التخزين المطلوبة
//     landscape: false,                 // اتجاه الصفحة
//     render(data, params, h) → HTML    // data[key] = القيمة (JSON مفكوك إن أمكن)
//     onReady(root, data, params, h)    // اختياري: تفاعل بعد العرض
//   });

(function () {
    "use strict";

    var registry = {};
    var current = null;

    // ── أدوات مساعدة تُمرَّر للقوالب ──
    var h = {
        esc: function (s) {
            return String(s == null ? "" : s)
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        },
        // جدول من أعمدة [{key, label, cls?, fmt?}] وصفوف (كائنات)
        table: function (columns, rows, opts) {
            opts = opts || {};
            var html = "<table class='rpt" + (opts.cls ? " " + opts.cls : "") + "'><thead><tr>";
            if (opts.index !== false) html += "<th style='width:36px'>#</th>";
            columns.forEach(function (c) { html += "<th" + (c.width ? " style='width:" + c.width + "'" : "") + ">" + h.esc(c.label) + "</th>"; });
            html += "</tr></thead><tbody>";
            if (!rows || !rows.length) {
                html += "<tr><td colspan='" + (columns.length + (opts.index !== false ? 1 : 0)) + "'>لا توجد بيانات</td></tr>";
            }
            (rows || []).forEach(function (r, i) {
                html += "<tr>";
                if (opts.index !== false) html += "<td>" + (i + 1) + "</td>";
                columns.forEach(function (c) {
                    var v = typeof c.key === "function" ? c.key(r, i) : r[c.key];
                    var cell = c.fmt ? c.fmt(v, r, i) : h.esc(v);
                    html += "<td class='" + (c.cls || "") + "'>" + cell + "</td>";
                });
                html += "</tr>";
            });
            html += "</tbody></table>";
            return html;
        },
        badge: function (text, kind) {
            return "<span class='badge badge-" + (kind || "muted") + "'>" + h.esc(text) + "</span>";
        },
        stats: function (items) {
            return "<div class='stats'>" + items.map(function (s) {
                return "<div class='stat'><div class='v'>" + h.esc(s.value) + "</div><div class='l'>" + h.esc(s.label) + "</div></div>";
            }).join("") + "</div>";
        },
        signatures: function (names) {
            return "<div class='sign'>" + (names || ["المعلم", "وكيل الشؤون التعليمية", "مدير المدرسة"]).map(function (n) {
                return "<div>" + h.esc(n) + "<div class='line'>&nbsp;</div></div>";
            }).join("") + "</div>";
        },
        // يقرأ قائمة الطلاب المستوردة (من مدرستي m_ أو من نور n_) للمدرسة
        students: function (data, params) {
            var m = data["m_students_" + params.school_id];
            var n = data["n_students_" + params.school_id];
            var type = params.type || (m ? "m" : "n");
            var list = type === "n" ? n : m;
            return Array.isArray(list) ? list : [];
        },
        today: function () {
            var d = new Date();
            try {
                return d.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { year: "numeric", month: "long", day: "numeric" }) +
                    " — " + d.toLocaleDateString("en-GB");
            } catch (_) { return d.toLocaleDateString("en-GB"); }
        },
        group: function (rows, keyFn) {
            var out = {};
            (rows || []).forEach(function (r) { var k = keyFn(r); (out[k] = out[k] || []).push(r); });
            return out;
        },
        pageBreak: function () { return "<div class='page-break'></div>"; }
    };

    window.CorbitReports = {
        register: function (name, def) { registry[name] = def; },
        helpers: h
    };

    function qs() {
        var p = {};
        var q = window.location.search.replace(/^\?/, "");
        q.split("&").forEach(function (kv) {
            if (!kv) return;
            var i = kv.indexOf("=");
            var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
            var v = i < 0 ? "" : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, " "));
            if (!(k in p)) p[k] = v;
        });
        return p;
    }

    function parseMaybe(v) {
        if (typeof v !== "string") return v;
        var t = v.trim();
        if (t === "undefined" || t === "") return undefined;
        if (t[0] === "{" || t[0] === "[" || t[0] === "\"") {
            try { return JSON.parse(t); } catch (_) { /* نص عادي */ }
        }
        return v;
    }

    function storageGet(keys) {
        return new Promise(function (resolve) {
            chrome.storage.local.get(keys, function (items) {
                var out = {};
                keys.forEach(function (k) { out[k] = parseMaybe(items ? items[k] : undefined); });
                resolve(out);
            });
        });
    }

    function loadTemplate(name) {
        return new Promise(function (resolve, reject) {
            if (!/^[a-z0-9_-]+$/i.test(name)) return reject(new Error("اسم تقرير غير صالح"));
            if (registry[name]) return resolve(registry[name]);
            var s = document.createElement("script");
            s.src = "templates/" + name + ".js";
            s.onload = function () {
                if (registry[name]) resolve(registry[name]);
                else reject(new Error("القالب لم يسجّل نفسه: " + name));
            };
            s.onerror = function () { reject(new Error("لا يوجد قالب لهذا التقرير: " + name)); };
            document.head.appendChild(s);
        });
    }

    function showError(msg) {
        document.getElementById("report").innerHTML =
            "<div class='notice error'><strong>تعذّر عرض التقرير.</strong><br>" + h.esc(msg) +
            "<br><br>أعد تجهيز التقرير من داخل مدرستي/نور ثم افتحه مرة أخرى. الدعم الفني: 920006900</div>";
    }

    function setHeader(def, params, data) {
        document.title = "سكول بت — " + (def.title || "تقرير");
        document.getElementById("hdr-title").textContent = def.title || "تقرير";
        document.getElementById("hdr-subtitle").textContent = typeof def.subtitle === "function" ? (def.subtitle(data, params) || "") : (def.subtitle || "");
        var school = params.school_name || data.school_name || "";
        document.getElementById("hdr-school").textContent = school ? "مدرسة: " + school : "";
        document.getElementById("hdr-admin").textContent = params.admin_name ? "المستخدم: " + params.admin_name : "";
        document.getElementById("hdr-date").textContent = params.date || h.today();
        if (def.landscape) document.getElementById("page").classList.add("landscape");
    }

    function exportExcel() {
        if (typeof XLSX === "undefined") { alert("مكتبة Excel غير محمّلة."); return; }
        var tables = document.querySelectorAll("#report table");
        if (!tables.length) { alert("لا توجد جداول في هذا التقرير."); return; }
        var wb = XLSX.utils.book_new();
        tables.forEach(function (t, i) {
            var ws = XLSX.utils.table_to_sheet(t, { raw: true });
            if (!ws["!cols"]) ws["!cols"] = [];
            XLSX.utils.book_append_sheet(wb, ws, ("جدول " + (i + 1)).slice(0, 31));
        });
        wb.Workbook = wb.Workbook || {};
        wb.Workbook.Views = [{ RTL: true }];
        var name = (current && current.def.title ? current.def.title : "report").replace(/[\\/:*?"<>|]/g, "_");
        XLSX.writeFile(wb, "SchoolBit_" + name + ".xlsx");
    }

    document.getElementById("btn-print").addEventListener("click", function () { window.print(); });
    document.getElementById("btn-excel").addEventListener("click", exportExcel);
    document.getElementById("btn-landscape").addEventListener("click", function () {
        document.getElementById("page").classList.toggle("landscape");
    });

    var params = qs();
    var name = params.r || "";
    if (!name) { showError("لم يُحدَّد اسم التقرير (r)."); return; }

    loadTemplate(name).then(function (def) {
        var keys = typeof def.keys === "function" ? def.keys(params) : (def.keys || []);
        keys = keys.concat(["school_name"]).filter(function (k, i, a) { return k && a.indexOf(k) === i; });
        return storageGet(keys).then(function (data) {
            current = { def: def, data: data, params: params };
            setHeader(def, params, data);
            var html = def.render(data, params, h);
            document.getElementById("report").innerHTML = html || "<div class='notice'>لا توجد بيانات لعرضها.</div>";
            if (typeof def.onReady === "function") def.onReady(document.getElementById("report"), data, params, h);
        });
    }).catch(function (e) {
        console.error(e);
        showError(e && e.message || String(e));
    });
})();
