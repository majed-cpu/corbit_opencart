// ============================================================
// === LOCAL-MODE: يحلّ محلّ الخادم القديم بمعالجة محلية داخل المتصفح ==
// (Excel يُبنى محلياً، والرسائل تمرّ بوحدة SMS، وما عدا ذلك يُهمَل)
// ============================================================
(function () {
  var OK_RESP = {
    valid: true,
    status: 100,
    response: {
      valid: true,
      status: 100
    }
  };
  var EMPTY_RESP = {
    status: 100,
    response: [],
    valid: true
  };
  function isExcelURL(u) {
    return typeof u === "string" && /\/api\/excel(\b|\/)/i.test(u);
  }
  function isNeutralURL(u) {
    // /api/messages/* is handled separately by handleMessagesRequest.
    return typeof u === "string" && (/\/api\/views(\b|\/)/i.test(u) || /\binvalid\b/i.test(u) || /^\/?ads(\b|\?)/i.test(u));
  }

  // ---- Local Excel builder (replaces /api/excel/students) -----------
  // Generates a SpreadsheetML 2003 XML-in-HTML file. Excel opens it
  // natively, with proper RTL, Arabic, and text-format for phone numbers.
  function htmlEscape(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function buildExcelHtml(rows, schoolName) {
    if (!rows || !rows.length) rows = [{
      note: "لا توجد بيانات"
    }];
    var headers = Object.keys(rows[0]);
    var labels = {
      number: "رقم الطالب",
      name: "الاسم",
      phone: "الجوال",
      classname: "الفصل",
      classroom: "المرحلة",
      class_number: "رقم الفصل"
    };
    var html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " + "xmlns:x='urn:schemas-microsoft-com:office:excel' " + "xmlns='http://www.w3.org/TR/REC-html40'>" + "<head><meta charset='UTF-8'><title>" + htmlEscape(schoolName || "Corbit Export") + "</title>" + "<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>" + "<x:ExcelWorksheet><x:Name>الطلاب</x:Name>" + "<x:WorksheetOptions><x:DisplayRightToLeft/></x:WorksheetOptions>" + "</x:ExcelWorksheet>" + "</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->" + "</head><body dir='rtl'>" + "<table border='1' cellspacing='0' cellpadding='4' " + "style='border-collapse:collapse;font-family:Arial,sans-serif'>" + "<thead><tr style='background:#4682b4;color:white'>";
    for (var i = 0; i < headers.length; i++) {
      html += "<th>" + htmlEscape(labels[headers[i]] || headers[i]) + "</th>";
    }
    html += "</tr></thead><tbody>";
    for (var r = 0; r < rows.length; r++) {
      html += "<tr>";
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        // Phone / number columns: force text format so leading zeros stay
        var styleAttr = key === "phone" || key === "number" ? " style=\"mso-number-format:'\\@'\"" : "";
        html += "<td" + styleAttr + ">" + htmlEscape(rows[r][key]) + "</td>";
      }
      html += "</tr>";
    }
    html += "</tbody></table></body></html>";
    return html;
  }
  function triggerExcelDownload(students, schoolName) {
    var html = buildExcelHtml(students, schoolName);
    // \uFEFF (BOM) ensures Excel detects UTF-8 for Arabic.
    var blob = new Blob(["\uFEFF" + html], {
      type: "application/vnd.ms-excel;charset=utf-8"
    });
    var url = URL.createObjectURL(blob);
    var dt = new Date().toISOString().slice(0, 10);
    var safeSchool = String(schoolName || "students").replace(/[^\w\u0600-\u06FF.-]/g, "_");
    var fname = "Corbit_" + safeSchool + "_" + dt + ".xls";
    var a = document.createElement("a");
    a.href = url;
    a.download = fname;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      try {
        a.remove();
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 5000);
    console.log("[corbit-local] Excel built locally:", fname, students.length, "rows");
    return {
      url: url,
      filename: fname
    };
  }
  function handleExcelRequest(data) {
    var students = [];
    try {
      if (data && data.arr) {
        students = typeof data.arr === "string" ? JSON.parse(data.arr) : data.arr;
      }
    } catch (e) {
      console.warn("[corbit-local] excel payload parse failed:", e);
    }
    var schoolName = data && data.school_name && String(data.school_name).trim() || "students";
    try {
      var dl = triggerExcelDownload(students, schoolName);
      window.__corbitLastExcelBlobUrl = dl.url;
      window.__corbitLastExcelFilename = dl.filename;
      return {
        status: 100,
        response: "LOCAL_OK",
        valid: true,
        blobUrl: dl.url,
        filename: dl.filename
      };
    } catch (e) {
      console.error("[corbit-local] Excel build failed:", e);
      return {
        status: 0,
        response: null,
        error: String(e)
      };
    }
  }
  function isMessagesURL(u) {
    return typeof u === "string" && /\/api\/messages(\b|\/)/i.test(u);
  }
  function pickResp(u, data) {
    if (isExcelURL(u)) return handleExcelRequest(data);
    if (isMessagesURL(u)) return handleMessagesRequest(data);
    if (isNeutralURL(u)) return EMPTY_RESP;
    return null;
  }

  // === /api/messages/send → routes EXCLUSIVELY through corbitSMS =====
  // We removed all other gateway paths (whatsapp-api, smart-whatsapp,
  // generic SMS providers). Every messaging request goes through
  // window.corbitSMS → api.mobile.net.sa.
  function handleMessagesRequest(data) {
    var arr = [];
    try {
      if (data && data.arr) {
        arr = typeof data.arr === "string" ? JSON.parse(data.arr) : data.arr;
      }
    } catch (e) {
      console.warn("[corbit-local] messages payload parse failed:", e);
    }
    var sms = window.corbitSMS;
    if (!sms) {
      // Module not loaded yet (race condition or wrong host).
      console.error("[corbit-local] window.corbitSMS not available");
      return {
        status: 0,
        response: "وحدة SMS غير محمّلة",
        valid: false
      };
    }
    if (!sms.isConfigured()) {
      // Open settings UI immediately on next tick.
      setTimeout(function () {
        try {
          alert("⚙️ بوابة SMS (sms.corbit.sa) غير معدّة.\n" + "ستفتح نافذة الإعدادات الآن — أدخل بياناتك ثم أعد المحاولة.");
          sms.openSettings();
        } catch (_) {}
      }, 50);
      return {
        status: 0,
        response: "البوابة غير معدّة",
        valid: false
      };
    }
    if (!arr.length) {
      return {
        status: 0,
        response: "لا توجد رسائل",
        valid: false
      };
    }
    sms.send(arr).then(function (r) {
      try {
        if (r.success) {
          alert("✅ تم الإرسال عبر SMS بنجاح: " + r.sent + " من " + arr.length);
        } else {
          alert("⚠️ نجح: " + r.sent + " — فشل: " + r.failed + "\n\n" + JSON.stringify(r.results, null, 2).slice(0, 500));
        }
      } catch (_) {}
    }, function (err) {
      try {
        alert("❌ خطأ في إرسال SMS:\n" + err.message);
      } catch (_) {}
    });
    return {
      status: 100,
      response: "جاري الإرسال عبر SMS...",
      valid: true
    };
  }
  function fakeJqXHR(resp) {
    resp = resp || OK_RESP;
    var d = typeof jQuery !== "undefined" && jQuery.Deferred ? jQuery.Deferred() : null;
    if (d) {
      d.resolve(resp, "success", {
        responseJSON: resp,
        status: 200
      });
      var p = d.promise();
      p.done = p.then;
      p.fail = function () {
        return p;
      };
      p.always = function (cb) {
        try {
          cb(resp, "success", {});
        } catch (e) {}
        return p;
      };
      return p;
    }
    return {
      then: function (cb) {
        try {
          cb && cb(resp, "success", {});
        } catch (e) {}
        return this;
      },
      done: function (cb) {
        try {
          cb && cb(resp, "success", {});
        } catch (e) {}
        return this;
      },
      fail: function () {
        return this;
      },
      always: function (cb) {
        try {
          cb && cb(resp, "success", {});
        } catch (e) {}
        return this;
      }
    };
  }
  function patchJQ() {
    if (typeof $ === "undefined" || !$.post || !$.ajax) return false;
    if ($.__corbitFreeMode) return true;
    $.__corbitFreeMode = true;
    var origPost = $.post;
    $.post = function (url, data, success, dataType) {
      // Accept the (url, success) overload too.
      if (typeof data === "function") {
        dataType = success;
        success = data;
        data = undefined;
      }
      var resp = pickResp(url, data);
      if (resp) {
        if (typeof success === "function") {
          setTimeout(function () {
            try {
              success(resp, "success", {});
            } catch (e) {}
          }, 0);
        }
        return fakeJqXHR(resp);
      }
      return origPost.apply(this, arguments);
    };
    var origAjax = $.ajax;
    $.ajax = function (opts, settings) {
      var s = typeof opts === "string" ? Object.assign({
        url: opts
      }, settings || {}) : opts || {};
      var resp = pickResp(s.url, s.data);
      if (resp) {
        if (typeof s.success === "function") {
          setTimeout(function () {
            try {
              s.success(resp, "success", {});
            } catch (e) {}
          }, 0);
        }
        if (typeof s.complete === "function") {
          setTimeout(function () {
            try {
              s.complete({}, "success");
            } catch (e) {}
          }, 0);
        }
        return fakeJqXHR(resp);
      }
      return origAjax.apply(this, arguments);
    };

    // === XMLHttpRequest interception ====================================
    // 1. local.maaref.invalid/excel & /table → parse locally with SheetJS,
    //    return the JSON shape the features expect (array of arrays).
    // 2. .invalid hosts            → blocked (no DNS leak).
    try {
      var origXHROpen = XMLHttpRequest.prototype.open;
      var origXHRSend = XMLHttpRequest.prototype.send;
      function fakeXhrSuccess(xhr, body) {
        Object.defineProperty(xhr, "readyState", {
          value: 4,
          configurable: true
        });
        Object.defineProperty(xhr, "status", {
          value: 200,
          configurable: true
        });
        Object.defineProperty(xhr, "statusText", {
          value: "OK",
          configurable: true
        });
        Object.defineProperty(xhr, "responseText", {
          value: body,
          configurable: true
        });
        Object.defineProperty(xhr, "response", {
          value: body,
          configurable: true
        });
        try {
          xhr.onreadystatechange && xhr.onreadystatechange.call(xhr);
        } catch (e) {}
        try {
          xhr.dispatchEvent(new Event("readystatechange"));
        } catch (e) {}
        try {
          xhr.onload && xhr.onload.call(xhr);
        } catch (e) {}
        try {
          xhr.dispatchEvent(new Event("load"));
        } catch (e) {}
        try {
          xhr.onloadend && xhr.onloadend.call(xhr);
        } catch (e) {}
        try {
          xhr.dispatchEvent(new Event("loadend"));
        } catch (e) {}
      }
      function fakeXhrError(xhr, msg) {
        Object.defineProperty(xhr, "readyState", {
          value: 4,
          configurable: true
        });
        Object.defineProperty(xhr, "status", {
          value: 500,
          configurable: true
        });
        try {
          xhr.onreadystatechange && xhr.onreadystatechange.call(xhr);
        } catch (e) {}
        try {
          xhr.onerror && xhr.onerror.call(xhr, new Error(msg));
        } catch (e) {}
      }
      XMLHttpRequest.prototype.open = function (method, url) {
        if (typeof url === "string") {
          if (/local\.maaref\.invalid\/(excel|table)\b/i.test(url)) {
            this._corbitLocalExcel = true;
            // Open about:blank so the real network request is harmless.
            arguments[1] = "about:blank";
          } else if (/\binvalid\b/i.test(url)) {
            console.warn("[corbit-local] blocked XHR to:", url);
            arguments[1] = "data:,";
          }
        }
        return origXHROpen.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function (body) {
        if (this._corbitLocalExcel) {
          var xhr = this;
          // Find the file in the FormData payload
          var file = null;
          if (body instanceof FormData) {
            try {
              var entries = body.entries();
              for (var pair = entries.next(); !pair.done; pair = entries.next()) {
                if (pair.value[1] instanceof File) {
                  file = pair.value[1];
                  break;
                }
              }
            } catch (e) {}
          } else if (body instanceof File || body instanceof Blob) {
            file = body;
          }
          if (!file) {
            console.error("[corbit-excel] no file found in XHR send body");
            fakeXhrError(xhr, "no file in request body");
            return;
          }
          if (!window.corbitExcelParser) {
            console.error("[corbit-excel] parser module not loaded");
            fakeXhrError(xhr, "corbitExcelParser missing");
            return;
          }
          console.log("[corbit-excel] parsing locally:", file.name, "(" + file.size + " bytes)");
          window.corbitExcelParser.parseFile(file).then(function (rows) {
            console.log("[corbit-excel] parsed", rows.length, "rows; faking 200 response");
            fakeXhrSuccess(xhr, JSON.stringify(rows));
          }, function (err) {
            console.error("[corbit-excel] parse error:", err);
            fakeXhrError(xhr, err && err.message || String(err));
          });
          return; // don't actually send
        }
        return origXHRSend.apply(this, arguments);
      };
    } catch (e) {
      console.warn("[corbit-local] XHR patch failed:", e);
    }

    // Block fetch() to .invalid hosts.
    try {
      var origFetch = window.fetch;
      window.fetch = function (input, init) {
        var url = typeof input === "string" ? input : input && input.url || "";
        if (/\binvalid\b/i.test(url)) {
          console.warn("[corbit-local] blocked fetch to:", url);
          return Promise.resolve(new Response(JSON.stringify(EMPTY_RESP), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }));
        }
        return origFetch.apply(this, arguments);
      };
    } catch (e) {}

    // === al3orf MDB feature → friendly fallback notice ==================
    // Al-Urf timetable export is a Microsoft Access .mdb file. There's no
    // reliable pure-JS MDB parser, so instead of breaking silently we:
    //   - Change the .mdb input to accept .xlsx / .xls / .csv
    //   - Show a clear notice telling the user to export from Al-Urf as
    //     Excel first (modern Al-Urf supports CSV/XLSX export)
    //   - Or use the "اضافة الجدول من نظام التايم تيبل" (asc) feature
    //     which works fully locally with SheetJS.
    var al3orfPatchIv = setInterval(function () {
      var input = document.getElementById("ingredient_file");
      if (!input || input.dataset.corbitPatched) return;
      input.dataset.corbitPatched = "1";
      input.accept = ".xlsx,.xls,.csv";
      // Update the surrounding label/instructions
      var label = input.previousElementSibling;
      if (label && label.tagName === "LABEL") {
        label.textContent = "ملف الجدول (Excel/CSV) — صدِّر من العُرف أولاً";
      }
      var container = input.closest(".form-group");
      if (container && !container.querySelector(".corbit-al3orf-notice")) {
        var notice = document.createElement("div");
        notice.className = "alert alert-info corbit-al3orf-notice";
        notice.style.cssText = "margin-top:8px;font-size:13px;direction:rtl";
        notice.innerHTML = "ℹ️ <strong>ملاحظة سكول بت:</strong> " + "صيغة <code>.mdb</code> الأصلية لبرنامج العُرف تتطلب سيرفر معالجة (محذوف). " + "صدِّر جدولك من العُرف كـ Excel/CSV ثم اختره هنا. " + "أو استخدم ميزة <strong>&quot;اضافة الجدول من نظام التايم تيبل&quot;</strong> " + "التي تعمل محلياً بدون أي تحويل.";
        container.appendChild(notice);
      }
    }, 500);
    setTimeout(function () {
      clearInterval(al3orfPatchIv);
    }, 60000);

    // === FORM-SUBMIT interception for the local Excel sentinel ==========
    // /excel2 (import-students-from-noor) and /noor-to-madrasati (move)
    // were HTML form submissions, not XHRs. We catch them at the document
    // capture phase, parse the chosen Excel file locally with SheetJS,
    // store rows in localStorage["corbitImportedStudents"], and show a
    // success card inside the modal so the user knows it worked.
    document.addEventListener("submit", function (ev) {
      var form = ev.target;
      if (!form || !form.action) return;
      var action = String(form.action || "");
      if (!/local\.maaref\.invalid\/(excel2|noor-to-madrasati)\b/i.test(action)) return;
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation && ev.stopImmediatePropagation();
      var fileInput = form.querySelector("input[type='file']");
      var file = fileInput && fileInput.files && fileInput.files[0];
      if (!file) {
        alert("لم يتم اختيار ملف");
        return;
      }
      if (!window.corbitExcelParser) {
        alert("وحدة Excel لم تُحمَّل بعد، انتظر ثانية وحاول مجدداً");
        return;
      }
      var modal = form.closest && form.closest(".modal");
      var loader = modal && modal.querySelector(".nloadingy");
      var doneEl = modal && modal.querySelector("#Doneee");
      if (loader) loader.style.display = "";
      console.log("[corbit-excel] form submit intercepted →", action);
      window.corbitExcelParser.parseFile(file).then(function (rows) {
        if (loader) loader.style.display = "none";
        // Skip an obvious header row if all cells are non-numeric strings
        var dataRows = rows.slice();
        if (dataRows.length && dataRows[0].every(function (c) {
          return typeof c !== "number" && (typeof c !== "string" || isNaN(parseFloat(c)));
        })) {
          dataRows = dataRows.slice(1);
        }
        try {
          localStorage.setItem("corbitImportedStudents", JSON.stringify({
            rows: dataRows,
            source: action,
            importedAt: new Date().toISOString(),
            fileName: file.name
          }));
        } catch (_) {}
        if (doneEl) {
          doneEl.innerHTML = "<div class='alert alert-success' dir='rtl' style='padding:14px;border-radius:8px'>" + "<h4 style='margin:0 0 6px'>✅ تم تحليل الملف محلياً</h4>" + "<p style='margin:4px 0'>عدد السجلات: <strong>" + dataRows.length + "</strong></p>" + "<p style='margin:4px 0;font-size:13px;color:#555'>" + "البيانات محفوظة في <code>localStorage[\"corbitImportedStudents\"]</code>. " + "استخدم زر &quot;تحديث بيانات الطلاب من نور&quot; من قائمة سكول بت لتحميلها." + "</p>" + "</div>";
        }
      }, function (err) {
        if (loader) loader.style.display = "none";
        if (doneEl) {
          doneEl.innerHTML = "<div class='alert alert-danger' dir='rtl'>" + "<h4>❌ فشل تحليل الملف</h4><pre style='direction:ltr;text-align:left'>" + (err && err.message || String(err)) + "</pre></div>";
        } else {
          alert("❌ فشل تحليل الملف: " + (err && err.message || err));
        }
      });
    }, true); // capture-phase so we beat any inner handlers

    // Hide the obsolete "smart whatsapp" credentials popup (a legacy gateway).
    // Also tames the dead "/tmp/Students_" download fallback button.
    var style = document.createElement("style");
    style.id = "corbit-local-mode-style";
    style.textContent = [
    // Defunct legacy smart-whatsapp credential capture UI
    "a.swa{display:none !important}", "input#smart_phone, input#smart_password,", "label[for='smart_phone'], label[for='smart_password']{", "display:none !important", "}", ".form-group:has(#smart_phone),", ".form-group:has(#smart_password){display:none !important}",
    // Old-Excel-fallback link (the real file is auto-downloaded)
    "a[href*='/tmp/Students_']{", "background:#888 !important;color:#fff !important;", "pointer-events:none;opacity:.6;", "}", "a[href*='/tmp/Students_']::after{", "content:' (تم تحميل الملف تلقائياً)';", "font-size:11px;", "}"].join("\n");
    (document.head || document.documentElement).appendChild(style);

    // === Inject a visible "إعدادات SMS" button into the corbit popup
    // modal (#corbit-modal-threeaaaaaa) so the user can configure the
    // SMS gateway without going through DevTools.
    var injectSmsBtnIv = setInterval(function () {
      var modal = document.getElementById("corbit-modal-threeaaaaaa");
      if (!modal) return;
      var slot = modal.querySelector(".col-12.g.text-center");
      if (!slot) return;
      if (slot.querySelector(".corbit-sms-btn")) return; // already injected
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-warning corbit-sms-btn";
      btn.style.cssText = "border-radius:0px;margin:2px";
      btn.innerHTML = "<i class='fas fa-mobile-alt'></i>&nbsp; إعدادات بوابة SMS";
      btn.onclick = function () {
        if (window.corbitSMS && window.corbitSMS.openSettings) {
          window.corbitSMS.openSettings();
        } else {
          alert("وحدة SMS لم تُحمَّل بعد، انتظر ثانية وحاول مجدداً.");
        }
      };
      slot.insertBefore(btn, slot.firstChild);
    }, 500);
    // Stop polling after 60s — the modal will already be there by then.
    setTimeout(function () {
      clearInterval(injectSmsBtnIv);
    }, 60000);

    // Hijack clicks on the legacy smart-whatsapp UI so it can
    // never re-surface a non-corbit gateway:
    //   - .swa (button "رسالة بالواتس الذكي")        → open corbit SMS settings
    //   - .seeeend (button inside that dead popup)   → open corbit SMS settings
    // Note: direct wa.me / api.whatsapp.com links and the Corbit Almadar
    // Web bulk-sender are NOT touched — they are user-controlled WhatsApp
    // channels, not server-mediated SMS gateways.
    document.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t || !t.classList) return;
      // Walk up to the nearest <a> if user clicked an inner span/icon
      var a = t.closest && t.closest("a.swa, a.seeeend, button.seeeend");
      if (!a) {
        if (!(t.classList.contains("swa") || t.classList.contains("seeeend"))) return;
        a = t;
      }
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation && ev.stopImmediatePropagation();
      try {
        if (window.corbitSMS) {
          if (window.corbitSMS.isConfigured()) {
            alert("بوابة SMS سكول بت معدّة بالفعل.\nاستخدم زر 'إرسال جماعي' من الميزة المطلوبة لإرسال الرسائل.");
          } else {
            window.corbitSMS.openSettings();
          }
        } else {
          alert("وحدة SMS لم تُحمَّل بعد، انتظر ثانية وحاول مجدداً.");
        }
      } catch (_) {}
    }, true);
    return true;
  }
  if (!patchJQ()) {
    var iv = setInterval(function () {
      if (patchJQ()) clearInterval(iv);
    }, 50);
    setTimeout(function () {
      clearInterval(iv);
    }, 30000);
  }
})();
// === end LOCAL-MODE ===

var online = true;
if (online) {
  var corbit_api_backend = "https://server.invalid";
  var corbit_api_frontend = "https://app.invalid";
} else {
  var corbit_api_backend = "http://127.0.0.1:3000";
  var corbit_api_frontend = "http://localhost:8080";
}
function corbit_loadScript(v1, v2) {
  // DEV-MODE: redirect /files/js/ paths to local extension files.
  if (typeof window.CORBIT_LOCAL_FILES_BASE === "string") {
    var __m = String(v1).match(/\/files\/js\/(.+?\.js)(\?.*)?$/);
    if (__m) {
      v1 = window.CORBIT_LOCAL_FILES_BASE + __m[1];
    }
  }
  var v3 = document.getElementsByTagName("head")[0];
  var v4 = document.createElement("script");
  v4.type = "text/javascript";
  v4.src = v1;
  v4.onreadystatechange = v2;
  v4.onload = v2;
  v3.appendChild(v4);
  setTimeout(() => {
    v4.remove();
  }, 2000);
}
;
// يقرأ وسائطَ استدعاءٍ مكتوبةً قيماً ثابتة فقط: نصوص ('..' أو "..")،
// وأرقام، وtrue/false/null. وأيُّ شيءٍ سواها يُرجع null.
function corbit_parseLiteralArgs(s) {
  var out = [], i = 0, n = s.length;
  function ws() {
    while (i < n && /\s/.test(s[i])) i++;
  }
  ws();
  if (i === n) return out;
  while (i < n) {
    ws();
    var c = s[i];
    if (c === "'" || c === "\"") {
      var v = "";
      i++;
      while (i < n && s[i] !== c) {
        if (s[i] === "\\" && i + 1 < n) i++;
        v += s[i];
        i++;
      }
      if (i >= n) return null;
      i++;
      out.push(v);
    } else {
      var m = /^(-?\d+(?:\.\d+)?|true|false|null)/.exec(s.slice(i));
      if (!m) return null;
      out.push(m[1] === "true" ? true : m[1] === "false" ? false : m[1] === "null" ? null : Number(m[1]));
      i += m[1].length;
    }
    ws();
    if (i === n) break;
    if (s[i] !== ",") return null;
    i++;
  }
  return out;
}
// يشغّل رابطاً من روابط نور ("javascript:__doPostBack(...)" وأمثاله) كما
// يشغّله المتصفح، بلا eval. الصيغ المعروفة في ASP.NET تُستدعى مباشرةً
// بدوالّ الصفحة نفسها، وما خرج عنها يُنقر نقرةً حقيقية، فلا تتعطّل
// الأداة إن غيّرت نور شكل رابط.
// والدالة تُنادى في نافذة العنصر نفسه، فرابطٌ داخل iframe يعمل في iframe.
function corbit_runNoorLink(el) {
  if (!el) return false;
  var win = el.ownerDocument && el.ownerDocument.defaultView || window;
  var code = String(el.getAttribute("href") || "").replace(/^\s*javascript:\s*/i, "").replace(/;\s*$/, "").trim();
  // "javascript:;" لا يحمل شيئاً، وكذلك كان eval يتركه.
  if (!code) return false;
  var m = /^WebForm_DoPostBackWithOptions\(\s*new\s+WebForm_PostBackOptions\(([\s\S]*)\)\s*\)$/.exec(code);
  if (m && typeof win.WebForm_DoPostBackWithOptions === "function" && typeof win.WebForm_PostBackOptions === "function") {
    var opts = corbit_parseLiteralArgs(m[1]);
    if (opts) {
      win.WebForm_DoPostBackWithOptions(new win.WebForm_PostBackOptions(...opts));
      return true;
    }
  }
  m = /^([A-Za-z_$][\w$]*)\(([\s\S]*)\)$/.exec(code);
  if (m && typeof win[m[1]] === "function") {
    var args = corbit_parseLiteralArgs(m[2]);
    if (args) {
      win[m[1]].apply(win, args);
      return true;
    }
  }
  console.warn("[maaref] رابط نور بصيغة غير متوقّعة، يُنقر بدلاً من استدعائه:", code);
  el.click();
  return true;
}
function callClickEvent(v5) {
  var v6 = document.createEvent("HTMLEvents");
  v6.initEvent("click", true, true);
  v5.dispatchEvent(v6);
}
function callClickEvent2(v7) {
  var v8 = document.createEvent("MouseEvents");
  v8.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  v7.dispatchEvent(v8);
}
function clickme(v9) {
  callClickEvent(v9[0]);
  callClickEvent2(v9[0]);
}
function corbit_set(v10, v11) {
  return new Promise(v12 => {
    $("body").append("<textarea class='save-me-to-local-storage' name='" + v10 + "'>" + v11 + "</textarea>");
    var v13 = setInterval(function () {
      if (!$(".save-me-to-local-storage[name='" + v10 + "']").length) {
        clearInterval(v13);
        v12();
      }
    });
  });
}
// رابط التقرير المحلي (reports/view.html) بدل صفحات الخادم القديم.
// الاستخدام: window.open(corbit_report_url("teachers-week") + "&school_id=" + school_id)
function corbit_report_url(name) {
  return window.CORBIT_EXT_BASE + "reports/view.html?r=" + encodeURIComponent(name);
}
function corbit_get(v14) {
  return new Promise(v15 => {
    $("body").append("<textarea class='get-local-storage' name='" + v14 + "'></textarea>");
    var v16 = setInterval(function () {
      if ($(".get-local-storage-value[name='" + v14 + "']").length) {
        clearInterval(v16);
        v15($(".get-local-storage-value[name='" + v14 + "']").val());
      }
    });
  });
}
if (window.location.hostname.includes("noor.moe.gov.sa")) {
  corbit_loadScript(corbit_api_frontend + "/files/js/noor/add-ghiab.js?_id=" + Math.random().toString(), function () {});
  if (localStorage.getItem("importn")) {
    if (window.location.href.includes("ReportsMenuPriv")) {
      if ($(".TitSer.collapsed:contains('تقارير الطلاب')").length) {
        clickme($(".TitSer.collapsed:contains('تقارير الطلاب')"));
      }
      setTimeout(function () {
        clickme($("a:contains('كشف الطلاب')"));
      }, 100);
    }
    if (window.location.href.includes("Elementary/StudentInfoReport.aspx")) {
      if ($("#ctl00_PlaceHolderMain_rvStudentInfoReport_fixedTable").text().trim() == "") {
        $("#ctl00_PlaceHolderMain_ibtnView").click();
      } else {
        var xxx = setInterval(function () {
          if ($(".ffccc").length) {
            clearInterval(xxx);
            $(".ffccc").fadeIn();
            $(".ffccc").click();
          }
        });
      }
    }
  }
  if (window.location.href.includes("HomePage")) {
    corbit_loadScript(corbit_api_frontend + "/files/js/noor/index.js?_id=" + Math.random().toString(), function () {});
  }
}
if (window.location.hostname.includes("madrasati.sa")) {
  if (window.location.href.includes("Actions")) {
    $("body").append("\n    <iframe src='https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/EducationalReports?SchoolId=" + $("#hSchoolId").val() + "' id='cssm' style='display:dnone'></iframe>\n    ");
    $("#cssm").on("load", function () {
      localStorage.setItem("semesterId", $(this).contents().find("#SemesterId").find("option:selected").attr("value"));
    });
    localStorage.setItem("school_id", $("#hSchoolId").val());
    localStorage.setItem("semesterId2", $("html").html().split("?SemesterId=")[1].split("\"")[0].split("&")[0]);
    localStorage.setItem("school_name", $("html").find("body > div.bg-banner > div > div.py-3.d-flex.flex-column.flex-lg-row.align-items-start.align-items-lg-center.justify-content-around.text-white.row-banner-info > div:nth-child(2) > div.mx-2.text-dark > span")?.text()?.trim());
    localStorage.setItem("admin_name", $("html").find("body > div.bg-banner > div > div.py-3.d-flex.flex-column.flex-lg-row.align-items-start.align-items-lg-center.justify-content-around.text-white.row-banner-info > div:nth-child(1) > div > span")?.text()?.trim());
  } else if ($("#hSchoolId").length) {
    localStorage.setItem("school_id", $("#hSchoolId").val());
  }
  if (localStorage.getItem("school_id")?.includes("#")) {
    if (localStorage.getItem("school_id").split("#")[0]) {
      localStorage.setItem("school_id", localStorage.getItem("school_id").split("#")[0]);
    }
  }
  var school_id = localStorage.getItem("school_id");
  var selectedRole = "";
  if (window.location.href.includes("selectedRole")) {
    selectedRole = "?selectedRole=" + window.location.href.split("selectedRole=")[1];
  }
  var semesterId = localStorage.getItem("semesterId");
  var semesterId2 = localStorage.getItem("semesterId2");
  setInterval(() => {
    semesterId = localStorage.getItem("semesterId");
    semesterId2 = localStorage.getItem("semesterId2");
  }, 1000);
  $($("#mobileOffcanvas > div.offcanvas-body > ul.nav.nav-sidebar").is(":visible") ? "#mobileOffcanvas > div.offcanvas-body > ul.nav.nav-sidebar" : "body > div.fixed-top > div > div > div.main-nav.navbar.navbar-sm.p-0.mx-auto > div > div > ul").prepend("\n    <style>\n    .list-group-item-action{\n        border: 2px solid #999;\n        margin-top: 3px;\n    }\n        .nloading h1, .nloadingx h1{\n        background: #fff !important;\n        color: red !important;\n        z-index: 9999 !important}\n    .item{\n        padding: 20px;\n        border: 2px solid green;\n        border-radius: 20px;\n        cursor: pointer;\n        height: 100%\n    }\n    .item:hover{\n        border: 2px solid red;\n        background: #eee\n    }\n    .view-div{\n        display: none\n    }\n    .item-list{\n        text-align: right !important;\n        padding-right: 20px;\n        width: 100%;\n        display: block;\n        color: #000;\n        background: #CAF4FF;\n        border: solid 1px 5AB2FF;\n        margin-top: 4px\n    }\n    .item-list:hover{\n        background: #A0DEFF;\n        cursor: pointer;\n        color: #333\n    }\n    .item-list img{\n        height: 64px;\n        border-radius: 50%\n    }\n    .item h5{\n       position: relative;\n       top: 15px;\n    }\n    .nloading{\n        display: none\n    }\n    .single-select-item{\n        text-align: right !important;\n        padding-right: 20px;\n    }\n    .single-select-item img{\n        height: 32px;\n        width: 32px;\n        border-radius: 50%\n    }\n    .single-select-item:hover{\n        background: #ddd;\n        cursor: pointer;\n    }\n    .dnone{\n        display: none\n    }\n    .modal-content{\n        padding: 20px !important\n    }\n    .nZ2 a span{\n        border: solid 2px;\n        padding: 10px;\n        background: #A0D683;\n    }\n    </style>\n    <li class=\"nav-item nZ2\" data-asw-orgfontsize=\"14\" style=\"font-size: 14px;\"><a href=\"javascript:;\" id=\"HomeMenu\" class=\"navbar-nav-link\" data-asw-orgfontsize=\"12\" style=\"font-size: 12px;\">\n    <span data-asw-orgfontsize=\"12\" style=\"font-size: 12px;\">\n    <i class='fa fa-star'></i>&nbsp;\n    سكول بت\n    </span></a></li>\n    ");
  $("#animated").prepend("\n        <div class=\"col-lg-3 col-xl-2 col-6 d-flex align-items-strech nZ2\">\n        <a href=\"javascript:;\" class=\"media bg-danger wow animate__ animate__fadeInUp w-100 animated\" data-wow-duration=\"1s\" style=\"visibility: visible; animation-duration: 1s; animation-name: fadeInUp; font-size: 14px;\" data-asw-orgfontsize=\"14\">\n            \n            <div class=\"media-body\">\n                <h5 style=\"font-size: 14px;\" data-asw-orgfontsize=\"14\">\n                <i class='fas fa-star'></i>\n                سكول بت</h5>\n            </div>\n        </a>\n    </div>\n");
  function viewMenu() {
    if ($("div:contains('التحضير الشامل')").length) {
      alert("<h2>\n                برجاء ايقاف اداة \"تحضيري الشامل\" مؤقتاً لأنها تتعارض مع اداتنا \"سكول بت\".\n                <br>\n                <a href='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' target='_blank'><i class='fa fa-image'></i> &nbsp; اضغط هنا لشرح طريقة الايقاف</a>\n                </h2>");
      return;
    }
    window.location.href.split("#")[0];
    if ($(".refresh-page-ooo").length) {
      window.location = window.location.href + "#openmenu";
      location.reload();
    }
    $("body").append("<input type='hidden' class='refresh-page-ooo'>");
    if ($("#corbit-modal-threeaaaaaa").length == 0) {
      $("body").append("\n            <style>\n            .item:hover{\n            cursor: pointer;\n            background: #eee\n            }\n            .item-list{\n            margin-top: 5px\n            }\n            </style>\n            <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-threeaaaaaa').modal('show')\" data-target=\"#corbit-modal-threeaaaaaa\"></button>\n            <!-- Modal -->\n            <div class=\"modal fade\" id=\"corbit-modal-threeaaaaaa\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\" style='padding: 20px; position: relative'>\n                        <div class='nloading' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                            <h1 style='\n                            margin: 0;\n                            position: absolute;\n                            top: 50%;\n                            left: 50%;\n                            color: 'red';\n                            -ms-transform: translate(-50%, -50%);\n                            transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                        </div>\n                        <div class=\"row\" style='padding: 20px;'>\n                            <div class=\"div-1 view-div g\">\n\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/move\">\n                                    <i class='fas fa-user-plus'></i>\n                                    &nbsp;\n                                    تسكين الطلاب من نور لمدرستي بنفس فصولهم\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%'  service=\"madrasati/teachers-lessons\">\n                                    <i class='fa fa-table'></i>\n                                    &nbsp;\n                                    تقرير تحضير الدروس للمعلمين\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/teachers-full\">\n                                    <i class='fa fa-pie-chart'></i>\n                                    &nbsp;\n                                    التقرير التراكمي للمعلمين\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/teachers-week\">\n                                    <i class='fa fa-bar-chart'></i>\n                                    &nbsp;\n                                    تقرير المتابعة الاسبوعي للمعلمين\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/teachers-stats\">\n                                    <i class='fa fa-bar-chart'></i>\n                                    &nbsp;\n                                    تقرير الإحصائيات الاسبوعي للمعلمين\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/weeklyplan\">\n                                    <i class='fa fa-fire'></i>\n                                    &nbsp;\n                                    الخطة الاسبوعية (تلقائياً)\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/designer\">\n                                    <i class='fa fa-pencil-square'></i>\n                                    &nbsp;\n                                    مصمم البيان <span class='badge btn-sm bg-danger text-white'><i class='fa fa-star'></i> جديد</span>\n                                </button><br>\n                            </div>\n                            <br>\n                            <div class=\"div-2 view-div g\">\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/students-ghiab-manual\">\n                                    <i class='fas fa-check-square'></i>\n                                    &nbsp;\n                                    رصد غياب اليوم يدوياً\n                                    \n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/full-lessons\">\n                                    <i class='fas fa-check-circle'></i>\n                                    &nbsp;\n                                    تقرير الحصص المجمع\n                                </button><br><button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/students-lessons\">\n                                    <i class='fas fa-check-square'></i>\n                                    &nbsp;\n                                    تقرير غياب الحصص <span class=' bg-danger text-white' style='padding: 0xpx !important'><i class='fas fa-star'></i> جديد</span>\n                                    &nbsp;<small class='text-muted'>(وإرسال رسالة لأولياء الأمور)</small>\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/homeworks\">\n                                    <i class='fas fa-book'></i>\n                                    &nbsp;\n                                    الواجبات والاختبارات والأنشطة للطلاب\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/students_access\">\n                                    <i class='fas fa-clock'></i>\n                                    &nbsp;\n                                    تقرير دخول الطلاب اليومي لمدرستي <span class=' bg-danger text-white' style='padding: 0xpx !important'><i class='fas fa-star'></i> جديد</span>\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/not-active\">\n                                    <i class='fas fa-user-times'></i>\n                                    &nbsp;\n                                    تقرير الطلاب الغير مفعلين للمنصة <span class=' bg-danger text-white' style='padding: 0xpx !important'><i class='fas fa-star'></i> جديد</span>\n                                </button><br> \n                                \n                                \n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/import-students-from-madrasati\">\n                                    <i class='fas fa-star'></i>\n                                    &nbsp;\n                                    تحديث بيانات الطلاب من مدرستي &nbsp;<small class='text-muted'>(لتتعرف عليهم الاداة للبيان وغيرها)</small>\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/import-students-from-noor\">\n                                    <i class='fas fa-star'></i>\n                                    &nbsp;\n                                    تحديث بيانات الطلاب من نور &nbsp;<small class='text-muted'>(لتتعرف عليهم الاداة للبيان وغيرها)</small>\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/move\">\n                                    <i class='fas fa-user-plus'></i>\n                                    &nbsp;\n                                    تسكين الطلاب من نور لمدرستي بنفس فصولهم\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/add-students-and-password\">\n                                    <i class='fas fa-user-plus'></i>\n                                    &nbsp;\n                                    اضافة الطلاب من نور لمدرستي\n                                </button><br>\n                                \n                                <div class='alert alert-info text-center g'>\n                                    جاري اضافة باقي الخدمات... ستكون متاحة باقي الخدمات خلال ايام ان شاء الله.\n                                </div>\n                            </div>\n                            <div class=\"div-3 view-div g\">\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/teachers-lessons\">\n                                    <i class='fa fa-table'></i>\n                                    &nbsp;\n                                    تقرير تحضير الدروس للمعلمين\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/teachers-full\">\n                                    <i class='fa fa-pie-chart'></i>\n                                    &nbsp;\n                                    التقرير التراكمي للمعلمين\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/weeklyplan\">\n                                    <i class='fa fa-fire'></i>\n                                    &nbsp;\n                                    الخطة الاسبوعية (تلقائياً)\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/teachers-week\">\n                                    <i class='fa fa-bar-chart'></i>\n                                    &nbsp;\n                                    تقرير المتابعة الاسبوعي للمعلمين\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/teachers-stats\">\n                                    <i class='fa fa-bar-chart'></i>\n                                    &nbsp;\n                                    تقرير الإحصائيات الاسبوعي للمعلمين\n                                </button><br>\n                                \n                                <br><br>\n                                <div class='alert alert-info text-center g'>\n                                    جاري اضافة باقي الخدمات... ستكون متاحة باقي الخدمات خلال ايام ان شاء الله.\n                                </div>\n                            </div>\n                            <div class=\"div-4 view-div g\">\n                            \n                                <button class='btn btn-lg btn-block btn-warning item-list btn-block' style='width: 100%' service=\"madrasati/reports\">\n                                    <i class='fa fa-copy'></i>\n                                    &nbsp;\n                                     طباعة\n                                    السجلات المدرسة\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/al3orf\">\n                                    <i class='fa fa-table'></i>\n                                    &nbsp;\n                                    اضافة الجدول من برنامج العرف\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-primary item-list btn-block' style='width: 100%' service=\"madrasati/asc\">\n                                    <i class='fa fa-table'></i>\n                                    &nbsp;\n                                    اضافة الجدول من نظام التايم تيبل\n                                </button><br> <button class='btn btn-lg btn-block btn-warning item-list btn-block' style='width: 100%' service=\"madrasati/table_from_noor\">\n                                    <i class='fa fa-table'></i>\n                                    &nbsp;\n                                    اضافة الجدول من نظام نور\n                                </button><br>\n                                <button class='btn btn-lg btn-block btn-secondary item-list btn-block' style='width: 100%' service=\"madrasati/designer\">\n                                    <i class='fa fa-pencil-square'></i>\n                                    &nbsp;\n                                    مصمم البيان <span class='badge btn-sm bg-danger text-white'><i class='fa fa-star'></i> جديد</span>\n                                </button><br>\n                                <div class='alert alert-info text-center g'>\n                                    جاري اضافة باقي الخدمات... ستكون متاحة باقي الخدمات خلال ايام ان شاء الله.\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"row\">\n                            <div class=\"col-6 col-lg-4\" style='padding: 10px' view-div='1'>\n                                <div class='card card-body item text-center'>\n                                <h1>\n                                \n                                    <i class='fas fa-fire text-danger'></i>\n                                    </h1>\n                                    <h5 class='text-success'>\n                                        الأكثر استخداماً\n                                    </h5>\n                                </div>\n                            </div>\n                            <div class=\"col-6 col-lg-4\" style='padding: 10px' view-div='2'>\n                                <div class='card card-body item text-center'><h1>\n                                \n                                    <i class='fas fa-users text-danger'></i>\n                                    </h1>\n                                    <h5 class='text-success'>\n                                        خدمات الطلاب\n                                    </h5>\n                                </div>\n                            </div>\n                            <div class=\"col-6 col-lg-4\" style='padding: 10px' view-div='3'>\n                                <div class='card card-body item text-center'><h1>\n                                \n                                    <i class='fas fa-user text-danger'></i>\n                                    </h1>\n                                    <h5 class='text-success'>\n                                        خدمات المعلمين\n                                    </h5>\n                                </div>\n                            </div>\n                            <div class=\"col-6 col-lg-4\" style='padding: 10px' view-div='4'>\n                                <div class='card card-body item text-center'><h1>\n                                \n                                    <i class='fas fa-copy text-danger'></i>\n                                    </h1>\n                                    <h5 class='text-success'>\n                                        خدمات المدرسة\n                                    </h5>\n                                </div>\n                            </div>\n                            \n                            <div class='col-12 g text-center'>\n                                <br><br>\n                                <button s class='btn btn-secondary' class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\" onclick=\"$('#corbit-modal-threeaaaaaa').modal('hide')\" style='border-radius:0px' ><i class='fa fa-times'></i>&nbsp; إغلاق النافذة</button>\n                                \n                                <a href='https://wa.me/966920006900' target='_blank' rel='noopener' class='btn btn-info' style='border-radius:0px'><i class='fab fa-whatsapp'></i> &nbsp;الدعم الفني 920006900 (واتساب)</a>\n                                <br><br>\n                                <a href='#' target='_blank' class='btn btn-info' style='border-radius:0px'><i class='fab fa-telegram'></i> &nbsp;إنضم الى قناتنا على التليجرام</a>\n                                \n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ");
      $(".invite").click(function () {
        alert("\n        <textarea class='form-control form-control-lg mmsg' rows='16' style='border: solid 2px darkred;'>أداة «سكول بت» لمنصتي نور ومدرستي، من تطوير كوربت - المدار، لتسهيل مهامكم اليومية\n☑️ التعريف بها:\nإضافةٌ آمنة لمتصفح Google Chrome تجمع تسهيلاتٍ وخدماتٍ عديدة للمنصتين\n\n*من مميزاتها:*\n\n✅ تسكين الطلاب من نور إلى مدرستي في فصولهم نفسها، واستخراج غير المضافين\n✅ رفع الجدول من برنامج العُرف إلى مدرستي في ثوانٍ وبدقة عالية\n✅ تقارير التحضير اليومي للدروس، مع إرسال رسالة للمعلم الذي لم يُحضِّر\n✅ أكثر من ٤٠ سجلاً وكشفاً جاهزاً للطباعة، متوافقة مع نظام نور\n✅ إرسال البريد الإلكتروني وكلمة المرور للطلاب\n✅ تقارير أسبوعية وشهرية\n✅ بطاقة تقييم لكل معلم بحسب أدائه في المنصة\n✅ إرسال الواجبات والاختبارات برسالة لولي الأمر\n✅ وخدماتٌ أخرى كثيرة...\n\n🔗 الموقع الرسمي: https://corbit.sa/</textarea><br><br>\n<div class='row'>\n    <div class='col-lg-6'>\n        <button class='btn btn-block btn-primary copymsg'>\n            <i class='fa fa-copy'></i>\n            نسخ الرسالة\n        </button>\n    </div>\n    <div class='col-lg-6'>\n        <button class='btn btn-block whatsmsg' style='background: #008170; color: white'>\n            <i class='fa fa-whatsapp'></i>\n            ارسال واتساب\n        </button>\n    </div>\n</div>\n    ");
        $(".copymsg").click(function () {
          navigator.clipboard.writeText($(".mmsg").val()).then(() => {
            $(".copymsg").html("<i class='fa fa-check'></i> تم النسخ");
          }, () => {
            $(".copymsg").html("حدث خطأ");
          });
        });
        $(".whatsmsg").click(function () {
          window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent($(".mmsg").val()));
        });
      });
      if (!school_id) {
        $(".modal-content").html("\n                <h3 class='alert alert-warning text-center'>\n                انت الآن في الصفحة الرئيسية٫<br>\n                قم باختيار والدخول للمدرسة اولاً\n                </h3>\n            ");
      } else {
        $(".nloading").fadeOut(0);
        $("[service]").click(function () {
          corbit_loadScript(corbit_api_frontend + "/files/js/" + $(this).attr("service") + ".js?_id=" + Math.random().toString(), function () {
            $(".nloading").fadeOut();
            $("[aria-label=\"Close\"]:visible").click();
          });
        });
        $("body").append("<input type='hidden' value='1' id='n_n'>");
      }
    }
    $(".view-div").fadeOut(0);
    $("[data-target=\"#corbit-modal-threeaaaaaa\"]").click();
    $("[view-div]").click(function () {
      $(".view-div:visible").fadeOut(0);
      var v18 = $(this);
      setTimeout(() => {
        $(".div-" + v18.attr("view-div")).toggle("slow");
        setTimeout(() => {
          $(".div-" + v18.attr("view-div")).fadeIn(0);
        }, 100);
      }, 50);
    });
  }
  $(".nZ2").click(function () {
    if (window.location.href.includes("/Actions")) {
      viewMenu();
    } else {
      window.location = "/SchoolManagment/Actions/Index/" + school_id + "#openmenu";
    }
  });
  var buttons = "";
  $(".wbs-v5").remove();
  if (window.location.href.includes("SchoolManagment/Teachers")) {
    if ($(".page-header").length && !$(".ccccc9324c").length) {
      $(".page-header").append("\n                <div class='col-12 ccccc9324c'>\n                    <div class=' fadeInRight'>\n                        <div class='-content text-center card card-body' style='border-radius: 10px; padding: 10px'>\n               \n                                <small style='padding: 3px'>سكول بت</small> <div class='col-12'>\n                <a class='btn btn-block btn-success' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/teachers-lessons\">\n                        <i class='fa fa-table'></i>&nbsp;\n                        تقرير تحضير الدروس للمعلمين\n                    </a>\n                    &nbsp;\n\n                    <a class='btn btn-block btn-secondary' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/teachers-full\">\n                        \n                    <i class='fa fa-pie-chart'></i>\n                    &nbsp;\n                        التقرير التراكمي للمعلمين\n                    </a>\n                    &nbsp;\n\n                    \n                    &nbsp;\n\n                    <a class='btn btn-block btn-warning' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/weeklyplan\">\n                        <i class='fa fa-fire'></i>&nbsp;\n                        الخطة الاسبوعية (تلقائياً)\n                    </a>\n                    &nbsp;\n\n                    <a class='btn btn-block btn-primary' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/teachers-week\">\n                        <i class='fa fa-bar-chart'></i>&nbsp;\n                        تقرير المتابعة الاسبوعي للمعلمين\n                    </a>\n                    \n                    &nbsp;\n\n                    <a class='btn btn-block btn-success' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/teachers-stats\">\n                        <i class='fa fa-bar-chart'></i>&nbsp;\n                        تقرير الإحصائيات الاسبوعي للمعلمين\n                    </a>\n                    \n                    </div>\n                        \n                        </div>\n                    </div>\n                </div>\n                ");
    }
  }
  if (window.location.href.includes("Students/ManageStudents")) {
    if ($(".page-header").length && !$(".ccccc9324c").length) {
      $(".page-header").append("\n                <div class='col-12 ccccc9324c'>\n                    <div class=' fadeInRight'>\n                        <div class='-content text-center card card-body' style='border-radius: 10px; padding: 10px'>\n               \n                            <small style='padding: 3px'>سكول بت</small> <div class='col-12'>\n\n                                \n                                &nbsp;\n                                <a class='btn btn-block btn-primary' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/students-ghiab-manual\">\n                                <i class='fas fa-check-square'></i>\n                                &nbsp;\n                                رصد غياب اليوم يدوياً\n                                </a>\n                                &nbsp;\n                                <a class='btn btn-block btn-primary' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/full-lessons\">\n                                <i class='fas fa-check-circle'></i>\n                                &nbsp;\n                                تقرير الحصص المجمع <span class=' bg-danger' style='padding: 0xpx !important'><i class='fas fa-star'></i> جديد</span>\n                                </a>\n                                &nbsp;\n                                <a class='btn btn-block btn-warning' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/not-active\">\n                                <i class='fas fa-user-times'></i>\n                                &nbsp;\n                                تقرير الطلاب الغير مفعلين للمنصة <span class=' bg-danger' style='padding: 0xpx !important'><i class='fas fa-star'></i> جديد</span>\n                                </a>\n                                &nbsp;\n                                <a class='btn btn-block btn-secondary' style='border-radius: 10px 10px 0px 0px' href=\"/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/homeworks\">\n                                <i class='fas fa-book'></i>\n                                &nbsp;\n                                تقرير الواجبات والاختبارات\n                                </a>\n                            </div>\n                        \n                        </div>\n                    </div>\n                </div>\n                ");
    }
  }
  $("[service2]").click(function () {
    var v19 = $(this).attr("service2");
    if (window.location.href.includes("/Actions")) {
      viewMenu();
    } else {}
  });
  if (window.location.hash.includes("openmenu")) {
    $("#page-wrapper > div:nth-child(14) > div > div > div").html("<div class='col-12 text-center'><img class='llllll' width='300' src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg'></div> ");
    setTimeout(function () {
      $(".llllll").remove();
      viewMenu();
      if (window.location.hash.includes("openmenu-")) {
        var v20 = setInterval(function () {
          if ($("#n_n").length) {
            clearInterval(v20);
            if ($("#n_n").val() == "1") {
              $(".nloading").fadeIn();
              setTimeout(function () {
                $(".nloading").fadeOut();
                $("[service='" + window.location.hash.split("openmenu-")[1] + "']").first().click();
              }, 1000);
            }
            setTimeout(function () {
              window.location.hash = "";
            }, 4000);
          }
        }, 10);
      } else {
        setTimeout(function () {
          window.location.hash = "";
        }, 500);
      }
    }, 1000);
  }
}
if (window.location.href.includes("TimeStructure/TimeTable")) {
  corbit_loadScript(corbit_api_frontend + "/files/js/madrasati/add-table.js?_id=" + Math.random().toString(), function () {});
}
if (window.location.hostname.includes("madrasati")) {
  corbit_get("move").then(function (v21) {
    corbit_set("school_id", school_id).then(function () {
      corbit_set("school_name", localStorage.getItem("school_name")).then(function () {
        if (v21 && v21 != "" && v21 != "undefined") {
          corbit_loadScript(corbit_api_frontend + "/files/js/madrasati/move-add.js?_id=" + Math.random().toString(), function () {});
        }
      });
    });
  });
}
if (window.location.hostname.includes("noor")) {
  setTimeout(function () {
    corbit_get("addlate").then(function (v22) {
      if (v22 && v22 != "null" && v22 != "undefined" && !window.location.href.includes("Login") && !window.location.href.includes("login")) {
        corbit_loadScript(corbit_api_frontend + "/files/js/noor/add-late.js?_id=" + Math.random().toString(), function () {});
      }
    });
  }, 1000);
}
if (window.location.hostname.includes("invalid") || window.location.hostname.includes("localhost")) {
  corbit_get("school_id").then(function (v23) {
    if (!v23 || v23 == "undefined") {
      v23 = "null";
    }
    $("body").append("<input type='hidden' id='school_id' value=\"" + v23 + "\">");
  });
}
if (window.location.href.includes("SchoolManagment/Students/StudentInfo")) {
  $("#tab1 > form > div > div.col-lg-8 > div.row.align-items-end").append("<div class=\"col-lg-8\">\n    <br><br>\n<a href='https://web.whatsapp.com/send?phone=" + $("#Mobile").val() + "&text&type=phone_number&app_absent=0' target='_blank' style='position: relative; right: 10px;' class='btn btn-success' type='button'>\n    <i class='fab fa-whatsapp'></i>\n    &nbsp;\n    ارسال رسالة واتسآب\n</a>\n</div>\n");
}
setInterval(() => {
  $(".bootbox-cancel").html("الغاء");
  $(".bootbox-accept").html("موافق");
  $(".bootbox-close").html("اغلاق");
}, 100);
if (window.location.pathname.includes("SchoolStructure/Classrooms/")) {
  $("body > div.content > div > div > div.card-body > div.list-group > form > div").append("\n<button class='btn btn-danger deleteall' type='button'>\n    حذف كل الطلاب المعروضين\n</button>\n");
  $(".deleteall").click(function () {
    confirm("متأكد من حذف كل الطلاب المعروضين في هذه الصفحة؟");
    $(".bootbox-accept").click(function () {
      $(".deleteall").html("جاري الحذف...");
      var v24 = [];
      $(".list-group .list-group-item").each(function () {
        if ($(this).find("a").attr("onclick")) {
          v24.push($(this).find("a").attr("onclick").split("showpopupWithURL('")[1].split("')")[0]);
        }
      });
      function v25() {
        if (v24.length) {
          var v26 = window.open(v24[0]);
          v26.addEventListener("load", function () {
            v26.close();
            v24.shift();
            v25();
          }, false);
        } else {
          location.reload();
        }
      }
      v25();
    });
  });
}
if ($("[id='publicModal']").length) {
  $("[data-dismiss=\"modal\"]").click();
}
if (window.location.hostname.includes("noor")) {
  if ($(".Instructions").text().trim().includes("لقد قمت بتسجيل الدخول بالفعل إلى النظام")) {
    window.location = "https://noor.moe.gov.sa/noor/usersmanagement/resetpasswordforallusers.aspx";
    $("body").append("\n        <!-- Button trigger modal -->\n        <button type=\"button\" style='display: none;' class=\"btn btn-primary btn-lg modelIdbtnc\" data-toggle=\"modal\" data-target=\"#modelIdc\">\n        Launch\n        </button>\n        <!-- Modal -->\n        <div class=\"modal fade\" id=\"modelIdc\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n            <div class=\"modal-dialog\" role=\"document\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <h5 class=\"modal-title\">سكول بت</h5>\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                                <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                    </div>\n                    <div class=\"modal-body\">\n                        <h4>جاري حل مشكلة تسجيل الدخول...</h4>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ");
    $(".modelIdbtnc").click();
  }
  if (window.location.href.includes("eduwavek12portal/ReportPages/DataToStudentsGuidance.aspx")) {
    if ($("#ctl00_PlaceHolderMain_lblResult").text() != "") {
      $("#ctl00_PlaceHolderMain_lblResult").append("\n            <br><br>\n            <img src='" + corbit_api_frontend + "/files/students-excel-from-noor.gif' style='border-radius: 10px; border: solid 2px red'>\n            <br><br><br>\n            <h5 class='text-success dccd'><span>يمكنك الان تصدير ملف الارشاد من صفحة <u>كشف الطلاب</u></span></h5>\n            ");
      setInterval(function () {
        if ($(".dccd span").is(":visible")) {
          $(".dccd span").fadeOut("slow");
        } else {
          $(".dccd span").fadeIn("slow");
        }
      }, 1000);
    }
  }
  var cc = setInterval(function () {
    if ($(".ff").length == 0) {
      $("table").each(function () {
        if ($(this).attr("id")?.includes("_fixedTable")) {
          if ($(this).text().trim() != "" && $(this).is(":visible")) {
            var v30 = $(this).attr("id")?.replace("_fixedTable", "");
            clearInterval(cc);
            function v31() {
              $(".form-actions").append("\n                            <td style=\"font-family: 'Droid Arabic Kufi' !important; padding: 10px; border: dashed 1px darkred\" class='asdasdasdasdcascas'>\n                                <img src='" + window.CORBIT_EXT_BASE + "assets/img/icon48.png' style='width: 20px; height: 20px;'>\n                                سكول بت\n                                <div style='padding: 5px; border-top: dashed 1px #333; margin-top: 3px'>\n                                    <button class='btn btn-success ff' style='border-radius: 0px;' type='button'>\n                                    <i class='fas fa-file-excel text-success' style='font-size:20px'></i>\n                                        اكسل Excel\n                                    </button>\n                                    <button class='btn btn-primary ff2' style='border-radius: 0px;' type='button'>\n                                    <i class='fas fa-file-word text-primary' style='font-size:20px'></i>\n                                        وورد Word\n                                    </button>\n                                    <button class='btn btn-danger ff3' style='border-radius: 0px;' type='button'>\n                                    <i class='fas fa-file-pdf text-danger' style='font-size:20px'></i>\n                                        PDF\n                                    </button>\n                                </div>\n                            </td>\n                            ");
              if (window.location.href.includes("EduWavek12Portal/ReportPages/Elementary/StudentInfoReport.aspx")) {
                $(".form-actions").append("\n                            <td class='asdasdasdasd asdasdasdasdcascas'>\n                            &nbsp;&nbsp;\n                            <div class=\"HoverButton ffcc btn btn-danger\" style=\"font-family: 'Droid Arabic Kufi' !important;\">\n                            تصدير ملف الارشاد الطلابي<br>\n                            <small><i>بواسطة اداة سكول بت</i></small>\n                            </div>\n                            </td>\n                            <td class='asdasdasdasd asdasdasdasdcascas'>\n                            &nbsp;&nbsp;\n                            <div class=\"HoverButton ffccc btn btn-success sdsdsdds\" style=\"font-family: 'Droid Arabic Kufi' !important; display:nosne;\">\n                            استيراد الطلاب لاداة سكول بت<br>\n                            <small><i>لتعمل داخل نظام نور</i></small>\n                            </div>\n                            </td>\n                            ");
                $(".sdsdsdds").click(function () {
                  $("body").append("<span class='savestudetnsss'></span>");
                });
                var v32 = [];
                var v33 = "";
                function v34() {
                  $(".asdasdasdasd").remove();
                  $(".ffcsaaaa").remove();
                  $(".form-actions").append("\n                                <td class='asdasdasdasd'>\n                                &nbsp;&nbsp;\n                                <a download='students.xlsx' target='_blank' href='" + corbit_api_backend + "/tmp/Students_" + v33 + "' class=\"HoverButton ffcc btn btn-success ffcsaaaa\" style=\"font-family: 'Droid Arabic Kufi' !important;\">\n                                تحميل الملف الآن\n                                <br>اضغط هنا لتحميل ملف الارشاد\n                                </a>\n                                </td>\n                                ");
                  $(".ffcsaaaa").fadeOut(0);
                  $(".ffcsaaaa").fadeIn("slow");
                  $(".ffcsaaaa").click();
                }
                $(".ffcc, .ffccc").click(function () {
                  if ($("#ctl00_PlaceHolderMain_rvStudentInfoReport_ctl09_ctl00_CurrentPage").val() == $("#ctl00_PlaceHolderMain_rvStudentInfoReport_ctl09_ctl00_TotalPages").text()) {
                    v34();
                    return false;
                  }
                  if ($(this).hasClass("disabled")) {
                    return false;
                  }
                  var v35 = $(".ffcc").html();
                  var v36 = $(".ffccc").html();
                  if ($(".savestudetnsss").length) {
                    $(".ffccc").html("<img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' width='50'> جاري التحميل...");
                    $(".ffccc").addClass("disabled");
                    $(".ffccc").attr("disabled", "disabled");
                  } else {
                    $(".ffcc:nth-child(1)").html("<img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' width='50'> جاري التحميل...");
                    $(".ffcc:nth-child(1)").addClass("disabled");
                    $(".ffcc:nth-child(1)").attr("disabled", "disabled");
                  }
                  function v37() {
                    $("table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(3) > table > tbody > tr").each(function () {
                      if ($(this).find("td:nth-child(1)").text() != "رقم جوال الطالب" && $(this).find("td:nth-child(1)").text() != "") {
                        v32.push({
                          classname: $("table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(3) > table > tbody > tr > td > table > tbody > tr:nth-child(6) > td:nth-child(2) > div > div > div > div").text(),
                          class_number: $("table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(3) > table > tbody > tr > td > table > tbody > tr:nth-child(6) > td:nth-child(2) > div > div > div > div").text(),
                          classroom: $(this).find("td:nth-child(7)").text(),
                          name: $(this).find("td:nth-child(14)").text(),
                          phone: $(this).find("td:nth-child(1)").text(),
                          number: $(this).find("td:nth-child(9)").text()
                        });
                      }
                    });
                    $("table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(3) > table > tbody > tr").each(function () {
                      if ($(this).find("td:nth-child(1)").text() != "رقم جوال الطالب" && $(this).find("td:nth-child(1)").text() != "") {
                        v32.push({
                          classname: $("table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(3) > table > tbody > tr > td > table > tbody > tr:nth-child(6) > td:nth-child(2) > div > div > div > div").text(),
                          class_number: $("table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(3) > table > tbody > tr > td > table > tbody > tr:nth-child(6) > td:nth-child(2) > div > div > div > div").text(),
                          classroom: $(this).find("td:nth-child(7)").text(),
                          name: $(this).find("td:nth-child(14)").text(),
                          phone: $(this).find("td:nth-child(1)").text(),
                          number: $(this).find("td:nth-child(9)").text()
                        });
                      }
                    });
                    if ($("#ctl00_PlaceHolderMain_rvStudentInfoReport_ctl09_ctl00_CurrentPage").val() != $("#ctl00_PlaceHolderMain_rvStudentInfoReport_ctl09_ctl00_TotalPages").text()) {
                      $("#ctl00_PlaceHolderMain_rvStudentInfoReport_ctl09_ctl00_CurrentPage").val(new Number($("#ctl00_PlaceHolderMain_rvStudentInfoReport_ctl09_ctl00_CurrentPage").val()) + 1);
                      $("#ctl00_PlaceHolderMain_rvStudentInfoReport_ctl09_ctl00_Next *").click();
                      var v38 = setInterval(function () {
                        if (!$("#ctl00_PlaceHolderMain_rvStudentInfoReport_ctl09_ctl00_CurrentPage").is(":disabled")) {
                          clearInterval(v38);
                          v37();
                        }
                      });
                    } else if ($(".savestudetnsss").length) {
                      $(".savestudetnsss").remove();
                      $(".ffccc").html(v36);
                      $(".ffccc").removeClass("disabled");
                      $(".ffccc").removeAttr("disabled");
                      localStorage.setItem("studentsn", JSON.stringify(v32));
                      corbit_set("students_from_noor", JSON.stringify(v32)).then(function () {
                        if (localStorage.getItem("importn")) {
                          clickme($("#ctl00_oHeader_lbtnHomePage"));
                          localStorage.removeItem("importn");
                        }
                        alert("تم استيراد بيانات الطلاب للاداة بنجاح");
                      });
                    } else {
                      $.post(corbit_api_backend + "/api/excel/students", {
                        arr: JSON.stringify(v32),
                        school_id: school_id,
                        school_name: " "
                      }).then(function (v39) {
                        $(".ffcc").html(v35);
                        $(".ffcc").removeClass("disabled");
                        $(".ffcc").removeAttr("disabled");
                        v33 = v39.response;
                        v34();
                      }).fail(function () {
                        alert("حدث خطأ");
                      });
                    }
                  }
                  v37();
                });
              }
              if (window.location.href.includes("EduWavek12Portal/ReportPages/AbsenceOnStudentLevel.aspx")) {
                corbit_loadScript(corbit_api_frontend + "/files/js/noor/alerts.js?_id=" + Math.random().toString(), function () {});
              }
              $(".ff").click(function () {
                $("body").append("<span id='cc' onclick=\"$find('" + v30 + "').exportReport('EXCELOPENXML');\"></span>");
                $("#cc").click();
                $("#cc").remove();
              });
              $(".ff2").click(function () {
                $("body").append("<span id='cc' onclick=\"$find('" + v30 + "').exportReport('WORDOPENXML');\"></span>");
                $("#cc").click();
                $("#cc").remove();
              });
              $(".ff3").click(function () {
                $("body").append("<span id='cc' onclick=\"$find('" + v30 + "').exportReport('PDF');\"></span>");
                $("#cc").click();
                $("#cc").remove();
              });
            }
            v31();
            setInterval(() => {
              if (!$(".asdasdasdasdcascas").is(":visible")) {
                v31();
              }
            }, 1000);
          }
        }
      });
    }
  });
}
if (window.location.href.includes("noor.moe.gov.sa")) {
  $("#ctl00_oHeader_tblQuickMenu > ul").prepend("\n    <li id=\"ctl00_oHeader_liHomeasd\" class=\"homeasdasd corbitrrr\"><a href=\"javascript:;\" id=\"ctl00_oHeader_lbtnHomePage2\"><span id=\"ctl00_oHeader_lblHomePag22e\" class=\"StandardFont\" style='margin-top: -10px'>\n    <img src='" + window.CORBIT_EXT_BASE + "assets/img/icon48.png' style='width: 30px; height: 30px'>\n    <br>\n    سكول بت\n    </span></a></li>\n    ");
  $(".corbitrrr").click(function () {
    $(".rrmeee").remove();
    $("body").append("\n        <!-- Button trigger modal -->\n        <button type=\"button\" style='display: none;' class=\"btn btn-primary btn-lg modelIdcbtn rrmeee\" data-toggle=\"modal\" data-target=\"#modelIdc\">\n        Launch\n        </button>\n        <!-- Modal -->\n        <div class=\"modal fade rrmeee\" id=\"modelIdc\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n            <div class=\"modal-dialog StandardFont\" role=\"document\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <h5 class=\"modal-title\">\n                        &nbsp;&nbsp;\n                        سكول بت \n                        &nbsp;&nbsp;\n                        <button type=\"button\" class=\"close btn-sm\" data-dismiss=\"modal\" aria-label=\"Close\">\n                            <span aria-hidden=\"true\">&times; اغلاق</span>\n                        </button></h5>\n                    </div>\n                    <div class=\"modal-body\">\n                        <p>\n                        بعض\n                            الخدمات المتاحة لنظام نور:\n                        </p>\n                        <h5>\n                            <ul>\n                            <li style='padding:10px'>\n                                <h5 class='text-success'>\n                                    <i class='fa fa-check'></i>\n                                    طباعة وتصدير التقارير\n                                </h5>\n                                عند استعراض اي تقرير ستجد ظهور ازرار للطباعة والتصدير.\n                            </li>\n                            <li style='padding:10px'>\n                                <h5 class='text-success'>\n                                    <i class='fa fa-check'></i>\n                                    طباعة وارسال انذارات الغياب\n                                </h5>\n                                من صفحة التقارير -> تقارير الطلاب -> تقرير الغياب على مستوى الطالب. وقم باختيار الخيارات واضغط عرض.\n                            </li>\n                            <li style='padding:10px'>\n                                <h5 class='text-success'>\n                                    <i class='fa fa-check'></i>\n                                    طباعة وارسال شهادات الشكر للملتزمين بالحضور\n                                </h5>\n                                من صفحة التقارير -> تقارير الطلاب -> تقرير الغياب على مستوى الطالب. وقم باختيار الخيارات واضغط عرض.\n                            </li>\n                            <li style='padding:10px'>\n                                <h5 class='text-success'>\n                                    <i class='fa fa-check'></i>\n                                    حل مشكلة لقد قمت بتسجيل الدخول بالفعل عند تسجيل الدخول.\n                                </h5>\n                            </li>\n                            <li style='padding:10px'>\n                                <h5 class='text-success'>\n                                    <i class='fa fa-check'></i>\n                                    اضافة الغياب والتأخر.\n                                </h5>\n                            </li>\n                            <li style='padding:10px'>\n                                <h5 class='text-success'>\n                                    <i class='fa fa-check'></i>\n                                    ارسال الغياب والتأخر من داخل نظام نور\n                                </h5>\n                                من الصفحة الرئيسية في نظام نور ستجد زر الارسال في يسار الصفحة.\n                            </li>\n                            <li style='padding:10px'>\n                                <h5 class='text-success'>\n                                    <i class='fa fa-check'></i>\n                                   رصد السلوك الإيجابي\n                                </h5>\n                            </li>\n                            <li style='padding:10px'>\n                                <h5 class='text-success'>\n                                    <i class='fa fa-check'></i>\n                                    والكثير من الخدمات الاخرى.\n                                </h5>\n                            </li>\n                            </ul>\n                        </h5>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ");
    $(".modelIdcbtn").click();
  });
}
setTimeout(() => {
  if (online && window.location.href.includes("SchoolManagment/Actions/Index") || window.location.href.includes("SchoolStructure/Classrooms/AllocateStudentInClassRoom") || window.location.href.includes("SchoolStructure/Classrooms/Students")) {
    corbit_get("move_students_now").then(function (v49) {
      if (v49 == "yes") {
        if (window.location.href.includes("SchoolManagment/Actions/Index")) {
          corbit_loadScript(corbit_api_frontend + "/files/js/madrasati/add-students-move.js?_id=" + Math.random().toString(), function () {});
        }
      }
    });
  }
}, 123);
var results_urls = ["GeCourseMarksEntryReport", "StudentNotification", "GetSTDSemNotification", "MarksByEntrancePeriod", "FirstSemseterMarksReport", "StudentCaseStudy", "EducationNotification", "GeCourseMarksEntryReport", "LevelMarksReport", "DegreesOfSeparationOfTheFemaleStudent", "SemesterNotification", "StudentCertificate"];
var load_results = false;
results_urls.forEach(function (v50) {
  if (window.location.pathname.includes(v50)) {
    load_results = v50;
  }
});
if (load_results) {
  corbit_loadScript(corbit_api_frontend + "/files/js/noor/results.js?_id=" + Math.random().toString(), function () {});
}
if (window.location.href.includes("EduWaveSMS/ManageAttendance.aspx")) {
  corbit_loadScript(corbit_api_frontend + "/files/js/noor/add_bis.js?_id=" + Math.random().toString(), function () {});
}
if (window.location.href.includes("/UsersManagement/ManagementUsers.aspx")) {
  corbit_loadScript(corbit_api_frontend + "/files/js/noor/export-parents.js?_id=" + Math.random().toString(), function () {});
}