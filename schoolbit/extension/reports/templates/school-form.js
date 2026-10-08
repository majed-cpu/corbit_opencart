// نماذج وسجلات المدرسة (طباعة السجلات المدرسية).
//
// كانت النماذج الـ 43 صفحاتٍ على خادم كوربت القديم وضاعت تصاميمها. هذا القالب
// يطبع نموذجاً رسمياً عاماً بعنوان النموذج المختار وبيانات المدرسة، مع جدول
// يحدّد المستخدم أعمدته وصفوفه قبل الطباعة، وسطر التوقيعات.
CorbitReports.register("school-form", {
    title: "نموذج مدرسي",
    subtitle: function (data, params) { return params.title || ""; },
    keys: [],
    render: function (data, params, h) {
        var title = params.title || "نموذج مدرسي";
        return "" +
            "<div class='notice no-print' id='sf-tools'>" +
            "  <strong>إعداد النموذج قبل الطباعة:</strong> " +
            "  <label>عدد الأعمدة <input type='number' id='sf-cols' min='1' max='12' value='5' style='width:60px'></label> " +
            "  <label>عدد الصفوف <input type='number' id='sf-rows' min='1' max='60' value='15' style='width:60px'></label> " +
            "  <label>عناوين الأعمدة (افصل بينها بفاصلة) <input type='text' id='sf-heads' value='م, البيان, التاريخ, العدد, ملاحظات' style='width:360px'></label> " +
            "  <button class='btn btn-outline' id='sf-apply'>تحديث</button>" +
            "  <div class='small' style='margin-top:6px;color:#666'>ملاحظة: التصميم الأصلي لهذا النموذج كان على الخادم القديم؛ هذا نموذج عام بالعنوان نفسه، ويمكن تعديل الأعمدة لتناسبه.</div>" +
            "</div>" +
            "<h2 style='text-align:center'>" + h.esc(title.replace(/^اسم النموذج\s*:?\s*/, "")) + "</h2>" +
            "<table class='rpt' style='margin-bottom:8px'><tbody>" +
            "<tr><td class='text'>المدرسة: " + h.esc(params.school_name || data.school_name || "") + "</td>" +
            "<td class='text'>المستخدم: " + h.esc(params.admin_name || "") + "</td>" +
            "<td class='text'>التاريخ: " + h.esc(h.today()) + "</td></tr>" +
            "</tbody></table>" +
            "<div id='sf-grid'></div>" +
            "<p>ملاحظات: ....................................................................................................................</p>" +
            h.signatures(["المُعِدّ", "وكيل المدرسة", "قائد المدرسة"]);
    },
    onReady: function (root, data, params, h) {
        function build() {
            var cols = Math.max(1, Math.min(12, parseInt(root.querySelector("#sf-cols").value, 10) || 5));
            var rows = Math.max(1, Math.min(60, parseInt(root.querySelector("#sf-rows").value, 10) || 15));
            var heads = root.querySelector("#sf-heads").value.split(/[,،]/).map(function (x) { return x.trim(); });
            var html = "<table class='rpt'><thead><tr>";
            for (var c = 0; c < cols; c++) html += "<th>" + h.esc(heads[c] || "") + "</th>";
            html += "</tr></thead><tbody>";
            for (var r = 0; r < rows; r++) {
                html += "<tr>";
                for (var c2 = 0; c2 < cols; c2++) html += "<td style='height:26px'>" + (c2 === 0 && /^م$/.test(heads[0] || "") ? (r + 1) : "&nbsp;") + "</td>";
                html += "</tr>";
            }
            html += "</tbody></table>";
            root.querySelector("#sf-grid").innerHTML = html;
        }
        root.querySelector("#sf-apply").addEventListener("click", build);
        build();
    }
});
