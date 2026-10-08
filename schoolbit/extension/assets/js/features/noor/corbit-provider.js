// «Corbit - المدار» في صفحة «إعداد حساب الرسائل الخاص بالمدرسة» في نور
// (Noor/SystemSettings/HierarchyMessageSettings.aspx — مدير المدرسة).
//
// يعمل فقط حين يكون مزوّد الشبكة «المدار التقني»: قيمة ddlNetworkType تبدأ بـ "2;"،
// أو قيمة ddlProvider = "2"، أو نص lblNetworkTypeDescription «المدار التقني».
//
// المبادئ (من مرجع تصميم صفحة نور):
//   • كل ما تضيفه الأداة بفئات نور نفسها وخطوطها وألوانها (#009E8F، Droid Arabic Kufi، StandardFont…).
//   • لا postback من الأداة إطلاقاً: لا dispatch لـ change على ddlNetworkType ولا على حقول
//     المستخدم/كلمة السر (onchange فيها يعمل postback أو EnableDDLs). الحفظ يضغطه المستخدم.
//   • عرض الرصيد يعيد استخدام نافذة نور الأصلية (#divBalance) ودالتي showBalancePopup/hideBalancePopup.
//   • tbSenderName يأتي disabled ولا يرسله ASP.NET؛ نفعّله (ونفعّل ddlNetworkType) قبل «حفظ».
//   • المفتاح لا يُطبع ولا يُعرض. يُقرأ من حقل كلمة السر فقط ليُخزَّن محلياً إن طابق شكل مفتاح Corbit.
//
// الاتصال بـ api.corbit.sa عبر جسر الإضافة (هذه الوحدة تعمل في سياق الصفحة).
// الأداة لا ترسل رسائل؛ الإرسال يبقى من نور عبر البوابة.

(function () {
  "use strict";
  if (window.__corbitNoorProvider) return;
  window.__corbitNoorProvider = true;

  var API = "https://api.corbit.sa/api/v1";
  var KEYS_STORAGE = "corbitNoorKeys";
  var KEY_RE = /^[A-Za-z0-9]{40,128}$/;
  var NOOR_PW_MAX = 50;                     // maxlength حقل كلمة السر في نور
  var MADAR_TEXT = "المدار التقني";
  var CORBIT_TEXT = "Corbit - المدار";
  var SENDERS_ERROR = "استرجاع اسماء المرسلين";
  var P = "ctl00_PlaceHolderMain_";
  var GRID = P + "gvHierarchyMessageSettings";
  var TEAL = "#009E8F";

  function onPage() { return /\/systemsettings\/hierarchymessagesettings\.aspx$/i.test(location.pathname); }
  if (!onPage()) return;

  // ───────────── الجسر ─────────────
  function bridge(type, payload, respType, timeout) {
    return new Promise(function (resolve, reject) {
      var rid = "cnp_" + Math.random().toString(36).slice(2);
      var done = false;
      function handler(e) {
        if (e.source !== window || !e.data || e.data.requestId !== rid || e.data.type !== respType) return;
        done = true;
        window.removeEventListener("message", handler);
        if (e.data.error) reject(new Error(e.data.error)); else resolve(e.data.result);
      }
      window.addEventListener("message", handler);
      window.postMessage(Object.assign({ type: type, requestId: rid }, payload), window.location.origin);
      setTimeout(function () {
        if (!done) { window.removeEventListener("message", handler); reject(new Error("timeout")); }
      }, timeout || 20000);
    });
  }
  function apiCall(method, path, key) {
    return bridge("corbit.sms.fetch", {
      url: API + path,
      opts: { method: method, headers: { "Authorization": "Bearer " + key, "Accept": "application/json" } }
    }, "corbit.sms.fetch.response");
  }
  function storageGet() {
    return bridge("corbit.storage.get", { key: KEYS_STORAGE }, "corbit.storage.get.response", 8000)
      .then(function (raw) { try { return typeof raw === "string" ? JSON.parse(raw) : (raw || {}); } catch (_) { return {}; } })
      .catch(function () { return {}; });
  }
  function storageSet(obj) {
    return bridge("corbit.storage.set", { key: KEYS_STORAGE, value: JSON.stringify(obj) }, "corbit.storage.set.response", 8000).catch(function () {});
  }
  function scopeId() {
    var el = document.querySelector("[id$='lblUserName']:not([id*='gvHierarchyMessageSettings']), [id*='oHeader_lblName']");
    return "noor:" + ((el && el.textContent.trim()) || "default");
  }
  function loadKey() { return storageGet().then(function (a) { return a[scopeId()] || null; }); }
  function rememberKey(key) {
    if (!validKey(key)) return Promise.resolve();
    return storageGet().then(function (a) { if (a[scopeId()] === key) return; a[scopeId()] = key; return storageSet(a); });
  }
  function validKey(k) { return KEY_RE.test(k || "") && !/^[0-9a-fA-F]+$/.test(k) && k.length <= NOOR_PW_MAX; }

  // ───────────── Corbit API ─────────────
  function getBalance(key) {
    return apiCall("POST", "/get-balance", key).then(function (r) {
      var b = r && r.body;
      if (!r || r.status === 401) throw new Error("المفتاح غير صحيح");
      if (!r.ok || !b || b.status !== "Success") throw new Error("تعذّر جلب الرصيد");
      return Number(b.data && b.data.balance);
    });
  }
  function getSenders(key) {
    return apiCall("GET", "/sendernames?per_page=100", key).then(function (r) {
      var b = r && r.body;
      if (!r || !r.ok || !b || b.status !== "Success" || !Array.isArray(b.data)) throw new Error("تعذّر جلب أسماء المرسلين");
      return b.data.filter(function (s) { return s && s.status === "approved" && s.name; }).map(function (s) { return s.name; });
    });
  }

  // ───────────── أدوات ─────────────
  function isMadarValue(v) { v = String(v == null ? "" : v); return v.indexOf("2;") === 0 || v === "2"; }
  function isMadarText(t) { t = String(t || "").trim(); return t === MADAR_TEXT || t === CORBIT_TEXT; }
  function rowOf(el) { return el && el.closest ? el.closest("tr") : null; }
  function q(sel, root) { return (root || document).querySelector(sel); }

  // ١) التسمية — النص فقط، القيم والمعرّفات كما هي.
  function renameLabels() {
    document.querySelectorAll("span[id$='lblNetworkTypeDescription']").forEach(function (s) {
      if (s.textContent.trim() === MADAR_TEXT) s.textContent = CORBIT_TEXT;
    });
    document.querySelectorAll("select[id$='ddlNetworkType'] option, select#" + P + "ddlProvider option").forEach(function (o) {
      if (isMadarValue(o.value) && o.textContent.indexOf(MADAR_TEXT) !== -1) o.textContent = o.textContent.replace(MADAR_TEXT, CORBIT_TEXT);
    });
    // نص select2 المعروض (القائمة الأصلية مخفية خلفه) ونتائج قائمة select2 المفتوحة.
    document.querySelectorAll(".select2-selection__rendered, .select2-results__option").forEach(function (s) {
      if (s.textContent.trim() === MADAR_TEXT) {
        s.textContent = CORBIT_TEXT;
        if (s.getAttribute("title")) s.setAttribute("title", CORBIT_TEXT);
      }
    });
  }

  function displayRowIsMadar(row) {
    var lbl = row && q("span[id$='lblNetworkTypeDescription']", row);
    return !!lbl && isMadarText(lbl.textContent);
  }

  // ٢) عرض الرصيد في نافذة نور الأصلية.
  var ourBalancePopup = false;
  function showBalance(text, isError) {
    var lbl = document.getElementById(P + "lblBalance");
    if (lbl) {
      lbl.textContent = "";
      if (isError) { lbl.textContent = text; lbl.className = "ValidationClass"; }
      else {
        lbl.className = "StandardFont";
        var parts = text.split(/(\d+)/);
        parts.forEach(function (p) {
          if (/^\d+$/.test(p)) { var b = document.createElement("b"); b.textContent = p; lbl.appendChild(b); }
          else lbl.appendChild(document.createTextNode(p));
        });
      }
    }
    ourBalancePopup = true;
    if (typeof window.showBalancePopup === "function") { try { window.showBalancePopup(); return; } catch (_) {} }
    var d = document.getElementById("divBalance");
    if (d) { d.style.display = "block"; d.style.left = "50%"; d.style.top = "30%"; d.style.transform = "translateX(-50%)"; }
  }
  function hideBalance() {
    ourBalancePopup = false;
    if (typeof window.hideBalancePopup === "function") { try { window.hideBalancePopup(); return; } catch (_) {} }
    var d = document.getElementById("divBalance"); if (d) d.style.display = "none";
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    // «عرض الرصيد» لصفّ مزوّده المدار: نمنع __doPostBack ونعرض رصيد Corbit.
    var a = t.closest ? t.closest("a[id$='lbtnDisplayBalance']") : null;
    if (a && displayRowIsMadar(rowOf(a))) {
      e.preventDefault(); e.stopImmediatePropagation();
      loadKey().then(function (key) {
        if (!key) { showBalance("لم تُربط Corbit بعد على هذا الجهاز — اضغط «تعديل» ثم «ربط Corbit».", true); return; }
        getBalance(key).then(function (bal) {
          showBalance("رصيد Corbit - المدار: " + (isFinite(bal) ? String(bal) : "—") + " رسالة", false);
        }).catch(function () { showBalance("تعذّر جلب الرصيد من Corbit — تحقق من المفتاح", true); });
      });
      return;
    }
    // زر «إغلاق» في النافذة من نوع submit: حين فتحناها نحن نمنع postback ونغلقها.
    if (ourBalancePopup && t.closest && t.closest("#" + P + "ibtnClose, #btnCancelBalance")) {
      e.preventDefault(); e.stopImmediatePropagation(); hideBalance(); return;
    }
    // «حفظ» في صفّ المدار: نفعّل الحقول المعطّلة حتى يرسلها ASP.NET.
    var up = t.closest ? t.closest("a[id$='lbtnUpdate']") : null;
    if (up) {
      var row = rowOf(up);
      var net = row && q("select[id$='ddlNetworkType']", row);
      if (net && isMadarValue(net.value)) {
        net.disabled = false;
        var sn = q("input[id$='tbSenderName']", row);
        if (sn) sn.disabled = false;
      }
    }
  }, true);

  // ٣) و٤) وضع التعديل.
  function enhanceEditRow(row) {
    var net = q("select[id$='ddlNetworkType']", row);
    if (!net || !isMadarValue(net.value)) return;

    // التقاط المفتاح المخزّن في نور (حقل كلمة السر يحمل القيمة في .value) للتخزين المحلي فقط.
    var pw = q("input[type=password][id$='tbUserPassword']", row);
    if (pw && validKey((pw.value || "").trim())) rememberKey(pw.value.trim());

    hideSendersError();
    addSenderPicker(row);
    addLinkAction(row);
  }

  function hideSendersError() {
    var r = document.getElementById(P + "lblOperationResult");
    if (r && r.textContent.indexOf(SENDERS_ERROR) !== -1) r.style.display = "none";
  }

  function addSenderPicker(row, names) {
    var input = q("input[id$='tbSenderName']", row);
    if (!input) return;
    var sel = q("select.corbit-sender-picker", row);
    if (!sel) {
      sel = document.createElement("select");
      sel.className = "control-dropdownlist corbit-sender-picker";
      sel.style.cssText = "width:110px;height:23px;font-family:'Droid Arabic Kufi';font-size:12px";
      sel.innerHTML = "<option value=''>اختر اسم المرسل</option>";
      input.insertAdjacentElement("afterend", sel);
      sel.addEventListener("change", function () { if (sel.value) { input.disabled = false; input.value = sel.value; } });
    }
    // الحقل الأصلي يبقى في الـDOM مخفياً ومفعّلاً ليرسله ASP.NET.
    input.style.display = "none";
    input.disabled = false;

    function fill(list) {
      var cur = input.value;
      while (sel.options.length > 1) sel.remove(1);
      list.forEach(function (n) {
        var o = document.createElement("option"); o.value = n; o.textContent = n;
        if (n === cur) o.selected = true;
        sel.appendChild(o);
      });
      if (!list.length) sel.options[0].textContent = "لا توجد أسماء معتمدة";
      else sel.options[0].textContent = "اختر اسم المرسل";
      // الاسم الحالي غير معتمد في Corbit (مثل اسم الحساب القديم): إن كان هناك اسم معتمد واحد نختاره،
      // وإلا نُفرغ الحقل فيطلب مُحقّق نور «ادخل اسم المرسل» بدل إرسال اسم ستُرفض به الرسائل.
      if (list.length && list.indexOf(cur) === -1) {
        if (list.length === 1) { sel.value = list[0]; input.value = list[0]; }
        else { sel.value = ""; input.value = ""; }
      }
    }
    if (names) { fill(names); return; }
    if (sel.dataset.loaded) return;
    sel.dataset.loaded = "1";
    loadKey().then(function (key) {
      if (!key) { fill([]); sel.options[0].textContent = "اربط Corbit أولاً"; return; }
      getSenders(key).then(fill).catch(function () { fill([]); });
    });
  }

  // رابط «ربط Corbit» بجانب «حفظ» و«إلغاء» — بنفس شكل روابط نور.
  function addLinkAction(row) {
    var upd = q("a[id$='lbtnUpdate']", row);
    if (!upd || q("a.corbit-link", row)) return;
    var a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.className = "StandardFont corbit-link";
    a.style.cssText = "color:" + TEAL + ";text-decoration:none;display:inline-block;margin-top:4px";
    a.textContent = "ربط Corbit";
    var cell = upd.closest("td") || upd.parentNode;
    cell.appendChild(document.createElement("br"));
    cell.appendChild(a);
    a.addEventListener("click", function (e) { e.preventDefault(); openLinkPopup(row); });
  }

  // نافذة ربط المفتاح بنفس بنية نافذة نور (form-ModalPopup) وفئاتها.
  function openLinkPopup(row) {
    var old = document.getElementById("corbitLinkPopup"); if (old) old.remove();
    var oldBg = document.getElementById("corbitLinkPopupBg"); if (oldBg) oldBg.remove();
    var bg = document.createElement("div");
    bg.id = "corbitLinkPopupBg";
    bg.className = "form-ModalPopup-Background";
    bg.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.5)";
    var wrap = document.createElement("div");
    wrap.id = "corbitLinkPopup";
    wrap.className = "ModalPopupExtender";
    wrap.style.cssText = "position:fixed;z-index:100001;left:50%;top:25%;transform:translateX(-50%);min-width:380px";
    wrap.innerHTML =
      "<div class='form-ModalPopup' style='background:#fff;border:2px solid #D1D1D1;box-shadow:0 4px 23px 5px rgba(0,0,0,.2)'>" +
      " <div class='form-ModalPopup-header' style='background:rgb(0,157,143);color:#fff;padding:7px 10px 7px 35px;min-height:30px;position:relative'>" +
      "  <span class='StandardFont' style='color:#fff'>ربط Corbit - المدار</span>" +
      "  <button type='button' class='btnCloseModalPopup' data-act='close' style='position:absolute;left:8px;top:6px;background:none;border:none;color:#fff;cursor:pointer'><i class='fa fa-times'></i>✕</button></div>" +
      " <div class='form-ModalPopup-body' style='padding:5px 10px'><div class='form-controls'><div class='form-controls-body'>" +
      "  <p class='StandardFontPlain' style='margin:8px 0'>ألصق مفتاح API من <b>sms.corbit.sa</b>:</p>" +
      "  <input type='password' maxlength='" + NOOR_PW_MAX + "' autocomplete='off' class='StandardFontPlain' data-act='key' style='width:150px;height:23px'>" +
      "  <div data-act='msg' class='StandardFont' style='margin:8px 0;min-height:18px'></div>" +
      " </div></div></div>" +
      " <div class='form-ModalPopup-footer'><div class='form-actions'><ul style='list-style:none;margin:0;padding:0 0 4px;text-align:center'>" +
      "  <li style='display:inline-block'><input type='button' class='btnstyle' data-act='verify' value='تحقق وربط' style='background:" + TEAL + ";color:#fff;border:none;padding:4px 30px;margin:10px 6px;cursor:pointer'></li>" +
      "  <li style='display:inline-block'><input type='button' class='btnstyle' data-act='close' value='إغلاق' style='background:" + TEAL + ";color:#fff;border:none;padding:4px 30px;margin:10px 6px;cursor:pointer'></li>" +
      " </ul></div></div></div>";
    document.body.appendChild(bg);
    document.body.appendChild(wrap);
    var keyIn = q("[data-act=key]", wrap), msg = q("[data-act=msg]", wrap), btn = q("[data-act=verify]", wrap);
    function say(text, ok) { msg.textContent = text; msg.className = ok ? "StandardFont" : "ValidationClass"; msg.style.color = ok ? TEAL : ""; }
    function close() { wrap.remove(); bg.remove(); }
    wrap.querySelectorAll("[data-act=close]").forEach(function (b) { b.addEventListener("click", close); });
    bg.addEventListener("click", close);
    keyIn.focus();

    btn.addEventListener("click", function () {
      var key = (keyIn.value || "").trim();
      if (key.length > NOOR_PW_MAX) { say("المفتاح أطول من " + NOOR_PW_MAX + " حرفاً ولا يقبله نور. تواصل مع الدعم الفني 920006900.", false); return; }
      if (!KEY_RE.test(key) || /^[0-9a-fA-F]+$/.test(key)) { say("شكل المفتاح غير صحيح — انسخه كما هو من sms.corbit.sa.", false); return; }
      var net = q("select[id$='ddlNetworkType']", row);
      if (net && !isMadarValue(net.value)) { say("اختر «" + CORBIT_TEXT + "» في نوع الشبكة أولاً، ثم أعد الربط.", false); return; }
      btn.disabled = true; say("جارٍ التحقق…", true);
      getBalance(key).then(function (bal) {
        // تعبئة بلا أحداث change: لا postback ولا EnableDDLs.
        var u = q("input[id$='tbUserName']", row);
        var pw = q("input[type=password][id$='tbUserPassword']", row);
        var cpw = q("input[type=password][id$='tbConfirmPassword']", row);
        if (u) u.value = "corbit";
        if (pw) pw.value = key;
        if (cpw) cpw.value = key;
        if (net) net.disabled = false;
        var sn = q("input[id$='tbSenderName']", row); if (sn) sn.disabled = false;
        keyIn.value = "";
        rememberKey(key);
        say("تم التحقق ✓ الرصيد " + (isFinite(bal) ? String(bal) : "—") + " رسالة. اختر اسم المرسل ثم اضغط «حفظ» في الجدول.", true);
        getSenders(key).then(function (names) { addSenderPicker(row, names); }).catch(function () {});
      }).catch(function (err) {
        say(err && err.message === "المفتاح غير صحيح" ? "المفتاح غير صحيح — تحقق منه في sms.corbit.sa." : "تعذّر الاتصال بـ Corbit، حاول مجدداً.", false);
      }).then(function () { btn.disabled = false; });
    });
  }

  // ───────────── المسح وإعادة الربط بعد كل postback ─────────────
  function scan() {
    renameLabels();
    document.querySelectorAll("#" + GRID + " tr").forEach(function (row) {
      if (q("select[id$='ddlNetworkType']", row)) enhanceEditRow(row);
    });
  }
  scan();
  var pending = null;
  function schedule() { if (pending) return; pending = setTimeout(function () { pending = null; scan(); }, 120); }
  var mo = new MutationObserver(schedule);
  try { mo.observe(document.getElementById(P + "UpdatePanel7") || document.body, { childList: true, subtree: true, characterData: true }); } catch (_) {}
  // select2 يبني قائمة النتائج في body عند الفتح.
  try { new MutationObserver(schedule).observe(document.body, { childList: true }); } catch (_) {}
  try {
    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
      Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
        // UpdatePanel7 قد يُستبدل كلياً: نعيد ربط المراقب.
        try { mo.disconnect(); mo.observe(document.getElementById(P + "UpdatePanel7") || document.body, { childList: true, subtree: true, characterData: true }); } catch (_) {}
        scan();
      });
    }
  } catch (_) {}
})();
