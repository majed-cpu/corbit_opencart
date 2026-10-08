// =====================================================================
//  Corbit SMS module — bridges /api/messages/send to api.mobile.net.sa
// =====================================================================
//
// Loads on madrasati.sa / noor pages. Exposes window.corbitSMS with:
//   - isConfigured()      → bool
//   - getSettings()       → {baseUrl, apiKey, sender, username, password}
//   - saveSettings(s)     → persist to localStorage
//   - openSettings()      → render floating settings panel
//   - send(messages)      → Promise<{success, sent, failed, results}>
//                            messages = [{phone, message}, ...]
//
// CORS: api.mobile.net.sa requests fail under page-world fetch from a
// third-party origin (madrasati.sa). To bypass, we postMessage to the
// content script (background.js) which forwards to the service worker
// (content.js), which has host_permissions and can fetch freely.
//
// Settings live in localStorage["corbitSmsSettings"] (simple JSON blob).
//
// API contract assumed for api.mobile.net.sa (configurable):
//   POST {baseUrl}/api/v1/Send
//     Headers:  Authorization: Bearer {apiKey}
//               Content-Type:  application/json
//     Body:     { "userName": "...", "numbers": "966...,966...",
//                 "userSender": "...", "msg": "...", "msgEncoding": "UTF-8" }
//   Response: { "code": 200, "message": "Success", "Detail": ... }
//
// User can override via the settings panel.

(function () {
  if (window.corbitSMS) return;
  var STORAGE_KEY = "corbitSmsSettings";
  // MadarSMSAPI (Mobile.SA) — see https://api.mobile.net.sa/ (Postman docs)
  // Base host is app.mobile.net.sa (NOT api.) — verified from official collection.
  var DEFAULT_SETTINGS = {
    baseUrl: "https://app.mobile.net.sa",
    pathSend: "/api/v1/send",
    pathSendBulk: "/api/v1/send-bulk",
    pathBalance: "/api/v1/get-balance",
    pathSenders: "/api/v1/sendernames",
    pathStatus: "/api/v1/message-status",
    apiKey: "",
    sender: "Mobile.SA",
    sendAtOption: "NOW",
    // NOW | LATER (with sendAt timestamp)
    allowDuplicate: false,
    countryCode: "966" // KSA default
  };

  // Cached settings (loaded once on startup; written through to chrome.storage)
  var cached = null;
  function bridgeStorage(op, key, value) {
    return new Promise(function (resolve) {
      var rid = "st_" + Math.random().toString(36).slice(2);
      var done = false;
      function handler(e) {
        if (!e.data || e.data.requestId !== rid) return;
        if (e.data.type !== "corbit.storage.get.response" && e.data.type !== "corbit.storage.set.response") return;
        done = true;
        window.removeEventListener("message", handler);
        resolve(e.data.result);
      }
      window.addEventListener("message", handler);
      window.postMessage({
        type: "corbit.storage." + op,
        requestId: rid,
        key: key,
        value: value
      }, "*");
      setTimeout(function () {
        if (!done) {
          window.removeEventListener("message", handler);
          resolve(undefined);
        }
      }, 5000);
    });
  }
  function loadSettingsAsync() {
    return bridgeStorage("get", STORAGE_KEY).then(function (raw) {
      try {
        var s = typeof raw === "string" ? JSON.parse(raw) : raw || {};
        cached = Object.assign({}, DEFAULT_SETTINGS, s, {
          fieldMap: Object.assign({}, DEFAULT_SETTINGS.fieldMap, s.fieldMap || {})
        });
      } catch (_) {
        cached = Object.assign({}, DEFAULT_SETTINGS);
      }
      return cached;
    }).catch(function () {
      cached = Object.assign({}, DEFAULT_SETTINGS);
      return cached;
    });
  }
  function getSettings() {
    if (cached) return cached;
    // First sync call before async load completed — fall back to localStorage
    // legacy slot (allows seamless migration from the old localStorage path).
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        cached = Object.assign({}, DEFAULT_SETTINGS, s, {
          fieldMap: Object.assign({}, DEFAULT_SETTINGS.fieldMap, s.fieldMap || {})
        });
        // Migrate to chrome.storage and clear legacy
        bridgeStorage("set", STORAGE_KEY, JSON.stringify(cached));
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        return cached;
      }
    } catch (_) {}
    cached = Object.assign({}, DEFAULT_SETTINGS);
    return cached;
  }
  function saveSettings(s) {
    cached = Object.assign({}, DEFAULT_SETTINGS, s, {
      fieldMap: Object.assign({}, DEFAULT_SETTINGS.fieldMap, s.fieldMap || {})
    });
    // Persist via chrome.storage bridge (kept out of page-world localStorage)
    bridgeStorage("set", STORAGE_KEY, JSON.stringify(cached));
  }
  function isConfigured() {
    var s = getSettings();
    return !!s.apiKey;
  }
  function normalizePhone(p, cc) {
    var x = String(p).replace(/[^\d+]/g, "");
    if (x.startsWith("+")) x = x.slice(1);
    if (x.startsWith("00")) x = x.slice(2);
    if (x.startsWith("0")) x = (cc || "966") + x.slice(1);
    if (!x.startsWith(cc || "966") && x.length === 9) x = (cc || "966") + x;
    return x;
  }

  // ---- HTTP via the content-script bridge (avoids CORS) -------------
  function bridgeFetch(url, opts) {
    return new Promise(function (resolve, reject) {
      var requestId = "rq_" + Math.random().toString(36).slice(2);
      var done = false;
      function handler(e) {
        if (!e.data || e.data.type !== "corbit.sms.fetch.response") return;
        if (e.data.requestId !== requestId) return;
        done = true;
        window.removeEventListener("message", handler);
        if (e.data.error) reject(new Error(e.data.error));else resolve(e.data.result);
      }
      window.addEventListener("message", handler);
      window.postMessage({
        type: "corbit.sms.fetch",
        requestId: requestId,
        url: url,
        opts: opts || {}
      }, "*");
      // 30-second timeout safeguard
      setTimeout(function () {
        if (!done) {
          window.removeEventListener("message", handler);
          reject(new Error("Bridge timeout — is the content script loaded?"));
        }
      }, 30000);
    });
  }

  // ---- Send a batch of {phone, message} via MadarSMSAPI ----------------
  // Uses /api/v1/send-bulk when all messages share the same text (efficient),
  // and falls back to one-at-a-time /api/v1/send when texts differ.
  //
  // Official Madar API (Mobile.SA / app.mobile.net.sa):
  //   POST /api/v1/send       body { number, senderName, sendAtOption, messageBody, allow_duplicate }
  //   POST /api/v1/send-bulk  body { numbers:[…], senderName, sendAtOption, messageBody }
  //   Headers: Authorization: Bearer {token}, Accept: application/json, Content-Type: application/json
  function sendBatch(messages) {
    var s = getSettings();
    if (!isConfigured()) {
      return Promise.reject(new Error("بوابة الرسائل غير معدّة. أدخل API Key في الإعدادات أولاً."));
    }
    // Group by message text — bulk-send when text is identical
    var byText = new Map();
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var phone = normalizePhone(m.phone, s.countryCode);
      if (!phone || phone.length < 9) continue;
      var key = m.message || "";
      if (!byText.has(key)) byText.set(key, []);
      byText.get(key).push(phone);
    }
    var baseUrl = (s.baseUrl || DEFAULT_SETTINGS.baseUrl).replace(/\/+$/, "");
    var urlBulk = baseUrl + (s.pathSendBulk || DEFAULT_SETTINGS.pathSendBulk);
    var urlSingle = baseUrl + (s.pathSend || DEFAULT_SETTINGS.pathSend);
    var headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + s.apiKey
    };
    var allResults = [];
    var seq = Promise.resolve();
    byText.forEach(function (numbers, text) {
      seq = seq.then(function () {
        // Choose bulk vs single based on count
        if (numbers.length > 1) {
          var body = {
            numbers: numbers,
            senderName: s.sender,
            sendAtOption: s.sendAtOption || "NOW",
            messageBody: text
          };
          return bridgeFetch(urlBulk, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
          }).then(function (res) {
            var success = !!(res.ok && res.body && (res.body.status === "Success" || res.body.data && res.body.data.message));
            allResults.push({
              count: numbers.length,
              ok: success,
              status: res.status,
              body: res.body
            });
          }).catch(function (err) {
            allResults.push({
              count: numbers.length,
              ok: false,
              error: String(err)
            });
          });
        }
        // Single send
        var body = {
          number: numbers[0],
          senderName: s.sender,
          sendAtOption: s.sendAtOption || "NOW",
          messageBody: text,
          allow_duplicate: !!s.allowDuplicate
        };
        return bridgeFetch(urlSingle, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body)
        }).then(function (res) {
          var success = !!(res.ok && res.body && (res.body.status === "Success" || res.body.data && res.body.data.message));
          allResults.push({
            count: 1,
            ok: success,
            status: res.status,
            body: res.body
          });
        }).catch(function (err) {
          allResults.push({
            count: 1,
            ok: false,
            error: String(err)
          });
        });
      });
    });
    return seq.then(function () {
      var sent = allResults.reduce(function (a, r) {
        return a + (r.ok ? r.count : 0);
      }, 0);
      var failed = messages.length - sent;
      return {
        success: failed === 0,
        sent: sent,
        failed: failed,
        results: allResults
      };
    });
  }

  // ---- Settings UI (floating panel) ---------------------------------
  var panel = null;
  function openSettings() {
    if (panel) {
      panel.style.display = "";
      return;
    }
    var s = getSettings();
    panel = document.createElement("div");
    panel.id = "corbit-sms-settings";
    panel.dir = "rtl";
    panel.style.cssText = ["position:fixed", "top:80px", "right:24px", "z-index:2147483647", "width:380px", "background:#fff", "border:2px solid #4682b4", "border-radius:12px", "box-shadow:0 8px 32px rgba(0,0,0,.25)", "font-family:'Tahoma','Segoe UI',sans-serif", "font-size:13px", "color:#222", "padding:14px"].join(";");
    panel.innerHTML = "<div style='display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:10px'>" + "<strong style='font-size:15px;color:#4682b4'>📱 إعدادات بوابة SMS — سكول بت</strong>" + "<button id='cs-close' style='background:none;border:none;font-size:18px;cursor:pointer'>×</button>" + "</div>" + "<div style='font-size:12px;color:#666;margin-bottom:10px'>" + "متوافقة مع <code>sms.corbit.sa</code>. اضبط بياناتك مرة واحدة." + "</div>" + row("baseUrl", "رابط البوابة", s.baseUrl) + row("path", "مسار الإرسال", s.path) + row("apiKey", "API Key (Bearer)", s.apiKey, "password") + row("username", "اسم المستخدم", s.username) + row("password", "كلمة المرور", s.password, "password") + row("sender", "اسم المرسِل", s.sender) + row("countryCode", "كود الدولة", s.countryCode) + "<div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px'>" + "<button id='cs-save' style='background:#228b22;color:#fff;border:none;padding:8px;border-radius:6px;font-weight:bold;cursor:pointer'>💾 حفظ</button>" + "<button id='cs-test' style='background:#4682b4;color:#fff;border:none;padding:8px;border-radius:6px;font-weight:bold;cursor:pointer'>📡 اختبار اتصال</button>" + "</div>" + "<div id='cs-status' style='margin-top:8px;font-size:12px;text-align:center'></div>";
    document.body.appendChild(panel);
    panel.querySelector("#cs-close").onclick = function () {
      panel.style.display = "none";
    };
    panel.querySelector("#cs-save").onclick = function () {
      var ns = collect();
      saveSettings(ns);
      setStatus("✅ تم الحفظ", "#228b22");
    };
    panel.querySelector("#cs-test").onclick = function () {
      var ns = collect();
      saveSettings(ns);
      setStatus("📡 جارٍ الاختبار...", "#4682b4");
      sendBatch([{
        phone: ns.username || ns.sender || "966500000000",
        message: "Corbit test"
      }]).then(function (r) {
        var msg = r.success ? "✅ نجح: أُرسل " + r.sent : "❌ فشل: " + JSON.stringify(r.results[0]?.error || r.results[0]?.body || "unknown");
        setStatus(msg, r.success ? "#228b22" : "#dc143c");
      }).catch(function (e) {
        setStatus("❌ " + e.message, "#dc143c");
      });
    };
    function row(id, label, val, type) {
      return "<div style='margin-bottom:6px'>" + "<label style='display:block;font-size:11px;color:#555'>" + label + "</label>" + "<input id='cs-" + id + "' type='" + (type || "text") + "' value='" + (val || "").replace(/'/g, "&#39;") + "' style='width:100%;border:1px solid #bbb;padding:6px;border-radius:4px;font-size:12px;direction:ltr;text-align:left'>" + "</div>";
    }
    function collect() {
      return {
        baseUrl: panel.querySelector("#cs-baseUrl").value.trim(),
        path: panel.querySelector("#cs-path").value.trim(),
        apiKey: panel.querySelector("#cs-apiKey").value.trim(),
        username: panel.querySelector("#cs-username").value.trim(),
        password: panel.querySelector("#cs-password").value,
        sender: panel.querySelector("#cs-sender").value.trim(),
        countryCode: panel.querySelector("#cs-countryCode").value.trim() || "966"
      };
    }
    function setStatus(text, color) {
      var el = panel.querySelector("#cs-status");
      el.textContent = text;
      el.style.color = color || "#666";
    }
  }
  window.corbitSMS = {
    isConfigured: isConfigured,
    getSettings: getSettings,
    saveSettings: saveSettings,
    openSettings: openSettings,
    send: sendBatch,
    normalizePhone: normalizePhone,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS
  };
  // Kick off async load from chrome.storage so subsequent getSettings() is fresh.
  loadSettingsAsync().then(function () {
    console.log("[corbit-sms] settings loaded from chrome.storage (configured:", isConfigured(), ")");
  });
  console.log("[corbit-sms] module loaded — call corbitSMS.openSettings() to configure");
})();