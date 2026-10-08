// =====================================================================
//  جسرُ سكول بت — النداءُ والإعدادات
// =====================================================================
//
//  يكشف `window.schoolBit` بـ:
//    - getSettings() / saveSettings(s)  → {baseUrl, token}
//    - isConfigured()                   → bool
//    - status()                         → Promise<{school, counts, ...}>
//    - importStudents(rows)             → Promise<summary>
//    - importTeachers(rows)             → Promise<summary>
//    - linkSchool(noorSchoolId)         → Promise
//
//  ولماذا لا يُنادى `fetch` مباشرةً من هنا؟ لسببين، والثاني أهمّ:
//
//    ١) CORS — صفحةُ نور أصلٌ آخر.
//    ٢) حاجزُ LOCAL-MODE في رأس `main.js` يعترض كلَّ `fetch` و`XHR`
//       و`$.ajax` في عالم الصفحة ويردّ عليها محلّياً. فالمرورُ بـ
//       postMessage → background.js → service worker يتجاوزه **بنيةً لا
//       حيلة**، وهو نفسُ الطريق الذي تسلكه وحدةُ الرسائل.
//
//  والمفتاحُ يُخزَّن في `chrome.storage.local` عبر جسر التخزين، لا في
//  `localStorage` الصفحة: الأخيرةُ يقرؤها أيُّ سكربتٍ في صفحة نور.

(function () {
  if (window.schoolBit) return;

  var STORAGE_KEY = "corbitSchoolBitSettings";

  var DEFAULT_SETTINGS = {
    baseUrl: "https://fingerprint-cp.mobile.net.sa/api/smos",
    token: ""
  };

  /** نسخةُ الإضافة — تُرسل مع كلِّ استيراد فيُعرف بأيِّ نسخةٍ كُتب الصفّ. */
  var EXT_VERSION = (function () {
    try { return chrome.runtime.getManifest().version; } catch (_) { return null; }
  })();

  var cached = null;

  /* ── جسرُ التخزين ─────────────────────────────────────────────── */

  function bridgeStorage(op, key, value) {
    return new Promise(function (resolve) {
      var rid  = "sb_st_" + Math.random().toString(36).slice(2);
      var done = false;

      function handler(e) {
        if (!e.data || e.data.requestId !== rid) return;
        if (e.data.type !== "corbit.storage.get.response" &&
            e.data.type !== "corbit.storage.set.response") return;
        done = true;
        window.removeEventListener("message", handler);
        resolve(e.data.result);
      }

      window.addEventListener("message", handler);
      window.postMessage({ type: "corbit.storage." + op, requestId: rid, key: key, value: value }, "*");

      setTimeout(function () {
        if (!done) { window.removeEventListener("message", handler); resolve(undefined); }
      }, 5000);
    });
  }

  function loadSettings() {
    return bridgeStorage("get", STORAGE_KEY).then(function (raw) {
      try {
        var s = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
        cached = Object.assign({}, DEFAULT_SETTINGS, s);
      } catch (_) {
        cached = Object.assign({}, DEFAULT_SETTINGS);
      }
      return cached;
    });
  }

  function saveSettings(s) {
    cached = Object.assign({}, DEFAULT_SETTINGS, cached || {}, s || {});
    return bridgeStorage("set", STORAGE_KEY, JSON.stringify(cached)).then(function () {
      return cached;
    });
  }

  /* ── النداء ───────────────────────────────────────────────────── */

  function bridgeFetch(url, opts) {
    return new Promise(function (resolve, reject) {
      var rid  = "sb_fx_" + Math.random().toString(36).slice(2);
      var done = false;

      function handler(e) {
        if (!e.data || e.data.type !== "corbit.schoolbit.fetch.response") return;
        if (e.data.requestId !== rid) return;
        done = true;
        window.removeEventListener("message", handler);
        if (e.data.error) { reject(new Error(e.data.error)); return; }
        resolve(e.data.result);
      }

      window.addEventListener("message", handler);
      window.postMessage({ type: "corbit.schoolbit.fetch", requestId: rid, url: url, opts: opts }, "*");

      /* مهلةٌ صريحة: دفعةُ خمسمئة صفٍّ قد تطول، لكنّ الانتظارَ إلى الأبد
         يترك الشاشةَ «جارٍ الإرسال…» بلا نهاية ولا يعرف المستخدم ما جرى. */
      setTimeout(function () {
        if (!done) {
          window.removeEventListener("message", handler);
          reject(new Error("انقطع الاتصال بسكول بت — تجاوز الطلبُ ٩٠ ثانية."));
        }
      }, 90000);
    });
  }

  function request(method, path, body) {
    return (cached ? Promise.resolve(cached) : loadSettings()).then(function (s) {
      if (!s.token) throw new Error("لم يُضبط مفتاح الربط. افتح الإعدادات وألصق المفتاح من شاشة «ربط نور» في سكول بت.");
      if (!s.baseUrl) throw new Error("لم يُضبط رابط سكول بت.");

      var url = s.baseUrl.replace(/\/+$/, "") + path;

      return bridgeFetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Bearer " + s.token,
          "X-Corbit-Extension-Version": EXT_VERSION || ""
        },
        body: body ? JSON.stringify(body) : undefined
      });
    }).then(function (res) {
      if (!res) throw new Error("لا استجابة من سكول بت.");

      if (!res.ok) {
        /* رسالةُ الخادم أصدقُ من رسالةٍ عامّة: هو وحده يعرف أنّ المفتاح
           أُبطل أو أنّ الاشتراك انقضى. ويُذكر الرمزُ معها لأن ٤٠٢ و٤٠٣
           علاجُهما مختلف: هذه تجديدُ اشتراك، وتلك مفتاحٌ جديد. */
        var msg = (res.body && res.body.message) || ("خطأ من سكول بت (" + res.status + ")");
        var err = new Error(msg);
        err.status = res.status;
        throw err;
      }

      return res.body && Object.prototype.hasOwnProperty.call(res.body, "data")
        ? res.body.data
        : res.body;
    });
  }

  /* ── الواجهة ──────────────────────────────────────────────────── */

  window.schoolBit = {
    EXT_VERSION: EXT_VERSION,

    getSettings: function () { return cached ? Promise.resolve(cached) : loadSettings(); },
    saveSettings: saveSettings,
    isConfigured: function () { return !!(cached && cached.token); },

    status: function () { return request("GET", "/noor-bridge/status"); },

    linkSchool: function (noorSchoolId, name) {
      return request("POST", "/noor-bridge/import/school", {
        noor_school_id: String(noorSchoolId),
        name: name || null
      });
    },

    importStudents: function (rows, opts) {
      return request("POST", "/noor-bridge/import/students", {
        students: rows,
        deactivate_missing: !!(opts && opts.deactivateMissing),
        extension_version: EXT_VERSION
      });
    },

    importTeachers: function (rows) {
      return request("POST", "/noor-bridge/import/teachers", {
        teachers: rows,
        extension_version: EXT_VERSION
      });
    },

    /* ── طابورُ رفع الغياب ─────────────────────────────────────── */

    /** يسحب **ويحجز** — فلا ينفّذ متصفّحان العملياتِ نفسَها. */
    pendingOperations: function (limit) {
      return request("POST", "/noor-bridge/operations/pending", { limit: limit || 50 });
    },

    reportOperation: function (operationId, success, noorResult) {
      return request("POST", "/noor-bridge/operations/" + encodeURIComponent(operationId) + "/result", {
        success: !!success,
        noor_result: noorResult || null,
        extension_version: EXT_VERSION
      });
    }
  };

  // تُحمَّل مبكراً كي يجدها الزرُّ جاهزةً بلا انتظار
  loadSettings();
})();
