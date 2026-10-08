// إرسال الرسائل النصية من صفحات الإضافة (التقارير والصفحات المحلية).
//
// يعكس عقد بوابة رسائل كوربت نفسه المستخدم في assets/js/features/sms/mobile-net-sa.js،
// لكن من صفحة الإضافة مباشرة (لها host_permissions فلا تحتاج جسر الصفحة):
//   POST {baseUrl}/api/v1/send       { number, senderName, sendAtOption, messageBody, allow_duplicate }
//   POST {baseUrl}/api/v1/send-bulk  { numbers: [...], senderName, sendAtOption, messageBody }
//   Headers: Authorization: Bearer {apiKey}, Accept/Content-Type: application/json
//
// الإعدادات من chrome.storage.local["corbitSmsSettings"] (تُضبط من صفحة إعدادات الإضافة).
//
//   CorbitSMS.getSettings()                  → Promise<settings>
//   CorbitSMS.isConfigured()                 → Promise<boolean>
//   CorbitSMS.normalizePhone("05xxxxxxxx")   → "9665xxxxxxxx"
//   CorbitSMS.send([{phone, message}], onProgress) → Promise<{success, sent, failed, results}>
//   CorbitSMS.balance()                      → Promise<number|null>
//   CorbitSMS.openSettings()                 → يفتح صفحة الإعدادات

(function () {
    "use strict";
    var STORAGE_KEY = "corbitSmsSettings";
    var DEFAULTS = {
        baseUrl: "https://app.mobile.net.sa",
        pathSend: "/api/v1/send",
        pathSendBulk: "/api/v1/send-bulk",
        pathBalance: "/api/v1/get-balance",
        apiKey: "",
        sender: "",
        sendAtOption: "NOW",
        allowDuplicate: false,
        countryCode: "966"
    };

    function getSettings() {
        return new Promise(function (resolve) {
            chrome.storage.local.get([STORAGE_KEY], function (items) {
                var raw = items ? items[STORAGE_KEY] : null;
                var s = {};
                try { s = typeof raw === "string" ? JSON.parse(raw) : (raw || {}); } catch (_) { s = {}; }
                resolve(Object.assign({}, DEFAULTS, s));
            });
        });
    }

    function normalizePhone(p, cc) {
        cc = cc || "966";
        var x = String(p == null ? "" : p).replace(/[^\d+]/g, "");
        if (x.indexOf("+") === 0) x = x.slice(1);
        if (x.indexOf("00") === 0) x = x.slice(2);
        if (x.indexOf("0") === 0) x = cc + x.slice(1);
        if (x.indexOf(cc) !== 0 && x.length === 9) x = cc + x;
        return x;
    }

    function headers(s) {
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Bearer " + s.apiKey
        };
    }

    function call(url, body, s) {
        return fetch(url, { method: "POST", headers: headers(s), body: JSON.stringify(body) }).then(function (r) {
            return r.text().then(function (t) {
                var b; try { b = JSON.parse(t); } catch (_) { b = t; }
                var ok = !!(r.ok && b && (b.status === "Success" || (b.data && b.data.message) || b.code === 200));
                return { ok: ok, status: r.status, body: b };
            });
        });
    }

    // messages = [{phone, message}] — يجمّع المتطابقة نصاً في إرسال جماعي واحد
    function send(messages, onProgress) {
        return getSettings().then(function (s) {
            if (!s.apiKey) throw new Error("بوابة الرسائل غير معدّة. أدخل مفتاح API في إعدادات الإضافة أولاً.");
            var byText = new Map();
            var valid = 0;
            (messages || []).forEach(function (m) {
                var phone = normalizePhone(m.phone, s.countryCode);
                if (!phone || phone.length < 12) return;
                valid++;
                var key = m.message || "";
                if (!byText.has(key)) byText.set(key, []);
                byText.get(key).push(phone);
            });
            var base = (s.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, "");
            var results = [];
            var done = 0;
            var seq = Promise.resolve();
            byText.forEach(function (numbers, text) {
                seq = seq.then(function () {
                    var p = numbers.length > 1
                        ? call(base + (s.pathSendBulk || DEFAULTS.pathSendBulk), { numbers: numbers, senderName: s.sender, sendAtOption: s.sendAtOption || "NOW", messageBody: text }, s)
                        : call(base + (s.pathSend || DEFAULTS.pathSend), { number: numbers[0], senderName: s.sender, sendAtOption: s.sendAtOption || "NOW", messageBody: text, allow_duplicate: !!s.allowDuplicate }, s);
                    return p.then(function (res) {
                        results.push({ count: numbers.length, ok: res.ok, status: res.status, body: res.body });
                    }).catch(function (err) {
                        results.push({ count: numbers.length, ok: false, error: String(err) });
                    }).then(function () {
                        done += numbers.length;
                        if (typeof onProgress === "function") onProgress(done, valid);
                    });
                });
            });
            return seq.then(function () {
                var sent = results.reduce(function (a, r) { return a + (r.ok ? r.count : 0); }, 0);
                return { success: sent === valid && valid > 0, sent: sent, failed: (messages || []).length - sent, results: results };
            });
        });
    }

    function balance() {
        return getSettings().then(function (s) {
            if (!s.apiKey) return null;
            var base = (s.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, "");
            return call(base + (s.pathBalance || DEFAULTS.pathBalance), {}, s).then(function (res) {
                var b = res.body;
                var cands = [b, b && b.data, b && b.Detail, b && b.detail];
                for (var i = 0; i < cands.length; i++) {
                    var o = cands[i];
                    if (o && typeof o === "object") {
                        for (var k in o) {
                            if (/^(balance|credit|points|amount|sms_credit)$/i.test(k)) {
                                var n = Number(String(o[k]).replace(/[^\d.-]/g, ""));
                                if (isFinite(n)) return n;
                            }
                        }
                    }
                }
                return null;
            }).catch(function () { return null; });
        });
    }

    function openSettings() {
        if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
        else window.open(chrome.runtime.getURL("options/settings.html"));
    }

    window.CorbitSMS = {
        getSettings: getSettings,
        isConfigured: function () { return getSettings().then(function (s) { return !!s.apiKey; }); },
        normalizePhone: normalizePhone,
        send: send,
        balance: balance,
        openSettings: openSettings
    };
})();
