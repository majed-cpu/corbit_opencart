// =====================================================================
//  منفّذُ رفع الغياب إلى نور
// =====================================================================
//
//  يكشف `window.schoolBitPush.run(onLog)` — يسحب العمليات المعلَّقة من
//  سكول بت، وينفّذها في شاشة «إدخال السلوك والمواظبة»، ويُبلّغ بالنتيجة.
//
//  ⚠️ **هذه الوحدةُ تكتب في نظامٍ حكوميّ.** فُكتبت على قاعدةٍ واحدة: أن
//  تقف عند أوّل شكٍّ بدل أن تُخمّن. وثلاثةُ فروقٍ جوهريّة بينها وبين
//  `noor/add-ghiab.js` القديمة:
//
//    ١) **المطابقةُ بالهويّة لا بالاسم.** القديمةُ تفعل
//       `$("a:contains('" + name + "')")` — فاسمٌ يشبه اسماً يُلحق غيابَ
//       فلانٍ بفلان، والوثيقةُ تمنع الاسمَ مفتاحاً نصّاً. وهنا يُبحث عن
//       رقم الهويّة في صفّ الجدول؛ فإن لم يُوجد عمودُ هويّةٍ أصلاً، جاز
//       الاسمُ **بشرط أن يكون فريداً في الصفحة** — وإلا أُخفقت العملية
//       بسببٍ معلن. الغيابُ الذي لا يُرفع أهونُ من غيابٍ يُرفع على بريء.
//
//    ٢) **لكلِّ عمليةٍ نتيجةٌ تُبلَّغ.** القديمةُ تنتهي بـ`alert()` ثم
//       `throw`، فلا يعلم أحدٌ ما جرى بعد إغلاق الصفحة.
//
//    ٣) **مهلةٌ لكلِّ انتظار.** القديمةُ تدور بـ`setInterval` بلا حدٍّ
//       أقصى، فصفحةٌ لم تُحدَّث تُبقيها تدور إلى الأبد.
//
//  ولا تُلمس `add-ghiab.js`: تبقى للاستعمال اليدويّ كما هي.

(function () {
  if (window.schoolBitPush) return;

  var ATTENDANCE_PATHS = [
    "/Noor/EduWaveSMS/ManageAttendance.aspx",
    "/Noor/EduWaveSMS/ManageAttend",
    "/Noor/EduWaveCH/ManageAttendance.aspx"
  ];

  /** أطولُ ما يُنتظر تحديثُ الصفحة بعد إجراء. */
  var WAIT_MS = 25000;

  function onAttendancePage() {
    var p = window.location.pathname;
    return ATTENDANCE_PATHS.some(function (x) { return p.toLowerCase() === x.toLowerCase(); });
  }

  /* ── انتظارُ نور ─────────────────────────────────────────────── */

  /**
   * ينتظر انتهاءَ تحديث ASP.NET الجزئيّ.
   *
   * ونور تُظهر `#refresh2` أثناء التحديث — وهي العلامةُ التي تعتمدها
   * وحداتُ الإضافة القائمة. والمهلةُ صريحةٌ: صفحةٌ عالقةٌ تُخفق العمليةَ
   * برسالةٍ مفهومة بدل أن تُعلّق المتصفّح.
   */
  function settle() {
    return new Promise(function (resolve, reject) {
      var started = Date.now();

      var timer = setInterval(function () {
        var busy = document.querySelector("#refresh2");
        var visible = busy && busy.offsetParent !== null;

        if (!visible) { clearInterval(timer); setTimeout(resolve, 250); return; }

        if (Date.now() - started > WAIT_MS) {
          clearInterval(timer);
          reject(new Error("لم تستجب صفحةُ نور خلال " + Math.round(WAIT_MS / 1000) + " ثانية."));
        }
      }, 150);
    });
  }

  /**
   * اختيارُ قيمةٍ في قائمةٍ تُطلق postback.
   *
   * ونور تربط التحديثَ بـ`onchange`، وضبطُ `value` من السكربت لا يُطلقه.
   * فيُطلق الحدثُ صراحةً — وهذا أنظفُ من حيلة الوحدات القديمة (نقلُ
   * `onchange` إلى `onclick` ثم النقر)، ويؤدّي المعنى نفسَه.
   */
  function selectValue(select, value) {
    if (!select) return false;

    var found = Array.prototype.some.call(select.options, function (o) {
      return String(o.value) === String(value);
    });
    if (!found) return false;
    if (String(select.value) === String(value)) return true;

    select.value = String(value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  /** اختيارٌ بنصِّ الخيار — للقوائم التي قيمُها معرّفاتٌ داخلية. */
  function selectByText(select, text) {
    if (!select) return false;
    var target = norm(text);

    for (var i = 0; i < select.options.length; i++) {
      if (norm(select.options[i].text) === target) {
        return selectValue(select, select.options[i].value);
      }
    }
    return false;
  }

  function norm(s) {
    return String(s == null ? "" : s)
      .replace(/[ـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
      .replace(/\s+/g, " ").trim();
  }

  function digits(s) {
    return String(s == null ? "" : s)
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
      .replace(/\D/g, "");
  }

  function $(sel) { return document.querySelector(sel); }

  /* ── إيجادُ صفِّ الطالب ──────────────────────────────────────── */

  /**
   * صفُّ الطالب في جدول الحضور — بالهويّة أوّلاً.
   *
   * @returns {{row: Element}|{error: string}}
   */
  function findStudentRow(nationalId, name) {
    var grid = $("#ctl00_PlaceHolderMain_gvClassStudentsAttendance") ||
               document.querySelector("table[id*='gvClassStudents']");

    if (!grid) return { error: "لم يظهر جدول طلاب الفصل في نور." };

    var rows = grid.querySelectorAll("tr");
    var id   = digits(nationalId);

    // ١) الهويّة — وهي قاطعة
    if (id) {
      for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].cells;
        if (!cells || cells.length < 2) continue;

        for (var c = 0; c < cells.length; c++) {
          if (digits(cells[c].innerText || cells[c].textContent) === id) {
            return { row: rows[i] };
          }
        }
      }
    }

    /*
     | ٢) الاسمُ — وبشرطِ التفرّد.
     |
     | شاشاتُ نور قد لا تعرض عمودَ الهويّة أصلاً. فيُقبل الاسمُ حينئذٍ، لكن
     | **لا يُقبل اسمٌ يتكرّر**: مدرسةٌ فيها «محمد عبدالله» مرّتين تجعل
     | الاختيارَ قرعةً، وثمنُ الخطأ غيابٌ في سجلٍّ حكوميّ على طالبٍ حاضر.
     | فالعمليةُ تُخفق بسببٍ معلن، ويُصلحها إنسان.
     */
    var target = norm(name);
    if (!target) return { error: "تعذّرت مطابقة الطالب: لا هوية ولا اسم في العملية." };

    var matches = [];
    for (var r = 0; r < rows.length; r++) {
      var text = norm(rows[r].innerText || rows[r].textContent);
      if (text.indexOf(target) !== -1) matches.push(rows[r]);
    }

    if (matches.length === 1) return { row: matches[0] };
    if (matches.length === 0) return { error: "الطالب غير موجود في هذا الفصل في نور." };

    return { error: "الاسم «" + name + "» متكرّر في الفصل ولا يوجد عمود هوية — لم يُرفع الغياب تجنّباً للخطأ." };
  }

  /* ── تنفيذُ عمليةٍ واحدة ─────────────────────────────────────── */

  /**
   * مجموعةُ عملياتٍ تشترك في (التاريخ · الصف · الفصل) تُنفَّذ في مرورٍ واحد.
   *
   * لأنّ نور تُرصد الغيابَ فصلاً فصلاً: تُختار المعايير، فيُبحث، فتُعلَّم
   * الصفوف، فيُحفظ. فتنفيذُ كلِّ عمليةٍ على حدة يعني إعادةَ الدورة كلِّها
   * لكلِّ طالب — عشرات الطلبات على نور بلا داعٍ، وفرصةٌ أكبر لانقطاع الجلسة
   * في منتصف العمل.
   */
  function runGroup(group, log) {
    var first = group.operations[0];
    var s     = first.student || {};

    log("الفصل " + (s.class_name || s.class_number || "?") + " — " + group.operations.length + " عملية");

    return Promise.resolve()
      .then(function () {
        // نوعُ الحسم: المواظبة
        var mowadaba = $("#ctl00_PlaceHolderMain_ddlMowadaba");
        if (mowadaba && String(mowadaba.value) !== "2") {
          selectValue(mowadaba, "2");
          return settle();
        }
      })
      .then(function () {
        /*
         | نوعُ الغياب. والقيمةُ `1` هي ما تستعمله الوحدةُ القديمة للغياب
         | بلا عذر، وهي مجرَّبة. أما «بعذر» فرمزُه **غيرُ مثبَّتٍ ميدانياً**،
         | فلا يُخمَّن: تُخفق العمليةُ بسببٍ صريح ويُحسم الرمزُ من نور أوّلَ
         | تجربةٍ حقيقيّة. وإثباتُ عذرٍ برمزٍ مخمَّنٍ في سجلٍّ حكوميّ أسوأ من
         | ألّا يُرفع.
         */
        if (first.absence_type === "excused") {
          throw new Error("رمز «الغياب بعذر» في نور غير محسوم بعد — ارفعه يدوياً أو اعتمده «بدون عذر».");
        }

        var violation = $("#ctl00_PlaceHolderMain_ddlViolation");
        if (violation && String(violation.value) !== "1") {
          selectValue(violation, "1");
          return settle();
        }
      })
      .then(function () {
        // الصفُّ والفصل — بنصّهما كما يعرضهما نور
        var classSel = $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass");
        if (classSel && s.class_name && !selectByText(classSel, s.class_name)) {
          log("تعذّر اختيار الصف «" + s.class_name + "» — سيُبحث بما هو مختار.");
        }
        return settle();
      })
      .then(function () {
        var search = $("#ctl00_PlaceHolderMain_ibtnSearch");
        if (!search) throw new Error("لم يُعثر على زرّ البحث في شاشة نور.");
        search.click();
        return settle();
      })
      .then(function () {
        // تعليمُ الصفوف — وما تعذّر يُعزل بسببه ولا يُوقف الباقي
        var marked = [];

        group.operations.forEach(function (op) {
          var st    = op.student || {};
          var found = findStudentRow(st.national_id, st.name);

          if (found.error) { op._error = found.error; return; }

          var box = found.row.querySelector("input[type=checkbox]");
          if (!box) { op._error = "لا يوجد خيار تعليم في صفّ الطالب."; return; }

          if (!box.checked) box.click();
          marked.push(op);
        });

        if (!marked.length) throw new Error("لم يُعلَّم أيُّ طالب — راجع الأسباب لكلِّ عملية.");

        log("عُلِّم " + marked.length + " من " + group.operations.length);

        var save = $("#ctl00_PlaceHolderMain_ibtnSave");
        if (!save) throw new Error("لم يُعثر على زرّ الحفظ في شاشة نور.");

        save.click();
        return settle().then(function () { return marked; });
      })
      .then(function (marked) {
        var box = $("#ctl00_PlaceHolderMain_lblOperationResult");
        var msg = box ? String(box.innerText || box.textContent).trim() : "";
        var ok  = /تمت عملية الحفظ بنجاح/.test(msg);

        marked.forEach(function (op) {
          op._success = ok;
          op._result  = msg || (ok ? "تمت عملية الحفظ بنجاح." : "لم تُعِد نور رسالة تأكيد.");
        });

        return group.operations;
      });
  }

  /* ── الدورةُ كاملة ───────────────────────────────────────────── */

  function run(log) {
    log = log || function () {};

    if (!onAttendancePage()) {
      return Promise.reject(new Error(
        "افتح في نور: شؤون الطلاب ← إدخال السلوك والمواظبة، ثم أعد المحاولة."
      ));
    }

    return window.schoolBit.pendingOperations().then(function (data) {
      var ops = (data && data.operations) || [];

      if (!ops.length) {
        log("لا عمليات معلَّقة.");
        return { total: 0, success: 0, failed: 0 };
      }

      log("سُحبت " + ops.length + " عملية.");

      // التجميعُ بالتاريخ والفصل — راجِع `runGroup` لعلّته
      var groups = {};
      ops.forEach(function (op) {
        var s   = op.student || {};
        var key = op.attendance_date + "|" + (s.grade_code || "") + "|" + (s.class_number || "");
        (groups[key] = groups[key] || { operations: [] }).operations.push(op);
      });

      var keys  = Object.keys(groups);
      var index = 0;

      function nextGroup() {
        if (index >= keys.length) return Promise.resolve();

        var group = groups[keys[index++]];

        return runGroup(group, log)
          .catch(function (e) {
            // سقوطُ المجموعة يُنسب إلى كلِّ عملياتها بسببه
            group.operations.forEach(function (op) {
              if (op._success === undefined) { op._success = false; op._error = e.message; }
            });
          })
          .then(nextGroup);
      }

      return nextGroup().then(function () {
        return reportAll(ops, log);
      });
    });
  }

  /**
   * إبلاغُ سكول بت بكلِّ نتيجة — بالتتابع.
   *
   * وتُبلَّغ **كلُّ** عملية، ناجحةً كانت أو فاشلة. فعمليةٌ بلا إبلاغٍ تبقى
   * محجوزةً حتى تنقضي مهلتُها ثم تعود إلى الطابور، فتُنفَّذ ثانيةً بلا سبب.
   */
  function reportAll(ops, log) {
    var i = 0, success = 0, failed = 0;

    function next() {
      if (i >= ops.length) {
        log("انتهى: نجح " + success + " · أخفق " + failed);
        return { total: ops.length, success: success, failed: failed };
      }

      var op = ops[i++];
      var ok = !!op._success;
      ok ? success++ : failed++;

      return window.schoolBit
        .reportOperation(op.operation_id, ok, op._result || op._error || null)
        .catch(function () { /* الإبلاغُ الفاشل لا يوقف بقيّةَ الإبلاغات */ })
        .then(next);
    }

    return Promise.resolve().then(next);
  }

  window.schoolBitPush = { run: run, onAttendancePage: onAttendancePage };
})();
