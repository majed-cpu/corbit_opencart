// Popup script لإضافة «سكول بت». لا JS داخل popup.html (CSP).

var SETTINGS_KEY = "corbitSmsSettings";

// رقم الإصدار من manifest
try {
    document.getElementById("version").textContent = chrome.runtime.getManifest().version;
} catch (_) {}

// زر الإعدادات → صفحة الخيارات
document.getElementById("open-sms").addEventListener("click", function () {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        chrome.tabs.create({ url: chrome.runtime.getURL("options/settings.html") });
    }
    window.close();
});

// حالة بوابة الرسائل: هل أُدخل مفتاح API أم لا (لا شرط على الرصيد).
chrome.storage.local.get([SETTINGS_KEY], function (data) {
    var settings = {};
    try {
        var raw = data[SETTINGS_KEY];
        settings = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    } catch (_) {}
    var badge = document.getElementById("sms-badge");
    if (settings.apiKey) {
        badge.textContent = "مضبوطة" + (settings.sender ? " — " + settings.sender : "");
        badge.className = "badge badge-on";
    } else {
        badge.textContent = "غير مضبوطة (اختيارية)";
        badge.className = "badge badge-muted";
    }
});
