// صفحة المعاينة: تزرع عيّنة البيانات ثم تفتح التقرير (بلا سكربت مضمّن احتراماً لـ CSP).
(function () {
    var box = document.getElementById("btns");
    Object.keys(window.PREVIEW).forEach(function (n) {
        var b = document.createElement("button");
        b.textContent = n;
        b.addEventListener("click", function () {
            var f = window.PREVIEW[n];
            chrome.storage.local.set(f.storage || {}, function () {
                var q = Object.entries(f.params || {}).map(function (kv) { return encodeURIComponent(kv[0]) + "=" + encodeURIComponent(kv[1]); }).join("&");
                window.open("view.html?r=" + n + (q ? "&" + q : ""), "_blank", "noopener");
            });
        });
        box.appendChild(b);
    });
})();
