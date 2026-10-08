// =====================================================================
//  لوحةُ «إرسال إلى سكول بت» — تظهر في صفحات نور
// =====================================================================
//
//  زرٌّ عائمٌ يفتح لوحةً فيها:
//    - الإعدادات (رابط سكول بت + مفتاح الربط) وزرُّ «فحص الاتصال»
//    - قراءةُ الجدول المعروض ومعاينتُه قبل الإرسال
//    - إرسالُ الطلاب أو المعلّمين
//
//  ⚠️ **الاسمُ يُعرض قبل كلِّ إرسال.** لوحةُ الفحص تُظهر اسمَ المدرسة كما
//  يعرفها **سكول بت**، لا كما تعرفها نور — فإن ركّب الموظّف الإضافةَ بمفتاح
//  مدرسةٍ ثم فتح نور بحساب أخرى، رأى الاسمين مختلفَين قبل أن يُرسل. ولا شيءَ
//  في البيانات نفسِها يكشف هذا الخلط بعد وقوعه.

(function () {
  if (window.__schoolBitPanel) return;
  window.__schoolBitPanel = true;

  /*
   | أقصى z-index — مساوٍ لقفل بوّابة التفعيل القديمة لا أدنى منه.
   |
   | القفلُ (`#maaref-lock-overlay`) يُرسم بـ 2147483647 ويغطّي الصفحة
   | كلَّها، فكان زرُّ «سكول بت» يُحقن ولا يُرى. والمستخدمُ يحتاج الزرَّ
   | **قبل** أن يلصق المفتاحَ الذي يفتح القفل — فلا بدّ أن يعلو الزرُّ
   | القفلَ لا أن ينتظر زوالَه. وعند تساوي z-index يعلو المتأخّرُ في
   | الشجرة، ولذلك يُعاد إلحاقُ الزرّ بآخر body لثوانٍ بعد التركيب.
   */
  var Z = 2147483647;

  function el(tag, css, html) {
    var e = document.createElement(tag);
    if (css) e.setAttribute("style", css);
    if (html != null) e.innerHTML = html;
    return e;
  }

  var BTN_CSS =
    "position:fixed;inset-inline-end:18px;bottom:18px;z-index:" + Z + ";" +
    "background:linear-gradient(135deg,#1F6FEB,#0D47A1);color:#fff;border:none;" +
    "border-radius:999px;padding:12px 20px;font:700 14px Tahoma,sans-serif;" +
    "cursor:pointer;box-shadow:0 6px 20px rgba(13,71,161,.35);direction:rtl";

  var PANEL_CSS =
    "position:fixed;inset-inline-end:18px;bottom:74px;z-index:" + Z + ";" +
    "width:420px;max-width:calc(100vw - 36px);max-height:78vh;overflow:auto;" +
    "background:#fff;color:#222;border-radius:16px;direction:rtl;text-align:right;" +
    "box-shadow:0 18px 50px rgba(0,0,0,.28);font:13px/1.8 Tahoma,sans-serif;padding:18px";

  var INPUT_CSS =
    "width:100%;padding:9px 11px;border:1.5px solid #E3E6EC;border-radius:9px;" +
    "font:13px Tahoma,sans-serif;box-sizing:border-box;direction:ltr;text-align:left";

  function btn(label, bg) {
    return "border:none;border-radius:9px;padding:9px 15px;cursor:pointer;" +
           "font:700 13px Tahoma,sans-serif;color:#fff;background:" + bg;
  }

  var panel, statusBox, previewBox, linkBox, pushBox, deactChk;

  /**
   * ربطُ المدرسة بمعرّفها في نور.
   *
   * ⚠️ ولولا هذا الزرّ لَبقي جدولُ الربط بلا صفِّ مدرسة مهما استُورد —
   * وهو بندٌ صريحٌ في وثيقة الربط: «مفتاح ربطٍ ثابت لكلِّ مدرسة». وكان
   * المسارُ مبنيّاً في الخادم ومكشوفاً في الجسر ولا يستدعيه أحد.
   *
   * ويُعرض للتأكيد ولا يُنفَّذ ضمناً: ربطُ المدرسة قرارٌ يُتّخذ مرّةً،
   * وخطؤه يخلط مدرسةً بمدرسة.
   */
  function renderSchoolLink(noorSchool, status) {
    linkBox.innerHTML = "";

    if (status.school.linked) { linkBox.style.display = "none"; return; }

    linkBox.style.display = "block";
    linkBox.appendChild(el("div", "font-size:12px;color:#6B7280;margin-bottom:6px",
      "اربط حساب سكول بت بمعرّف هذه المدرسة في نور — مرّةً واحدة."));

    var row = el("div", "display:flex;gap:8px;flex-wrap:wrap");
    var idIn = el("input", INPUT_CSS + ";flex:1 1 160px");
    idIn.placeholder = "الرقم الإحصائي للمدرسة";
    idIn.value = noorSchool.noorSchoolId || "";
    row.appendChild(idIn);

    var b = el("button", btn("", "#0D47A1"), "اربط المدرسة");
    row.appendChild(b);
    linkBox.appendChild(row);

    b.onclick = function () {
      var id = idIn.value.trim();
      if (!id) { say("err", "اكتب الرقم الإحصائي للمدرسة كما يظهر في نور."); return; }

      b.disabled = true;
      window.schoolBit.linkSchool(id, noorSchool.name)
        .then(function () {
          say("ok", "رُبطت المدرسة بمعرّف نور <b>" + esc(id) + "</b>.");
          linkBox.style.display = "none";
        })
        .catch(function (e) { say("err", errText(e)); })
        .then(function () { b.disabled = false; });
    };
  }

  /* ── بناءُ اللوحة ─────────────────────────────────────────────── */

  function build() {
    panel = el("div", PANEL_CSS);

    panel.appendChild(el("div",
      "font:800 16px Tahoma,sans-serif;margin-bottom:4px;color:#0D47A1",
      "الربط مع سكول بت"));

    panel.appendChild(el("div",
      "color:#6B7280;font-size:12px;margin-bottom:14px",
      "تُقرأ البيانات من هذه الصفحة وتُرسل إلى سكول بت. لا تُرسل بيانات دخولك إلى نور."));

    /* الإعدادات */
    var s1 = el("div", "border:1.5px solid #E3E6EC;border-radius:12px;padding:12px;margin-bottom:12px");
    s1.appendChild(el("div", "font-weight:700;margin-bottom:8px", "الإعدادات"));

    s1.appendChild(el("label", "font-size:12px;color:#6B7280", "رابط سكول بت"));
    var urlIn = el("input", INPUT_CSS + ";margin:4px 0 10px");
    urlIn.type = "text";
    urlIn.placeholder = "https://fingerprint-cp.mobile.net.sa/api/smos";
    s1.appendChild(urlIn);

    s1.appendChild(el("label", "font-size:12px;color:#6B7280", "مفتاح الربط"));
    var keyIn = el("input", INPUT_CSS + ";margin:4px 0 10px");
    keyIn.type = "password";
    keyIn.placeholder = "الصقه من شاشة «ربط نور» في سكول بت";
    s1.appendChild(keyIn);

    var row1 = el("div", "display:flex;gap:8px;flex-wrap:wrap");
    var saveB  = el("button", btn("", "#0D47A1"), "حفظ");
    var testB  = el("button", btn("", "#0B7A55"), "فحص الاتصال");
    row1.appendChild(saveB); row1.appendChild(testB);
    s1.appendChild(row1);
    panel.appendChild(s1);

    /* الحالة */
    statusBox = el("div", "border-radius:10px;padding:10px 12px;margin-bottom:12px;display:none");
    panel.appendChild(statusBox);

    /* ربطُ المدرسة — يظهر بعد فحص الاتصال */
    linkBox = el("div", "margin-bottom:12px;display:none");
    panel.appendChild(linkBox);

    /* الاستيراد */
    /*
     | مساران، والأوّلُ هو المعتمد.
     |
     | ملفّاتُ نور المُصدَّرة بنيتُها ثابتةٌ يضمنها نور نفسُه، وفيها ما لا
     | تعرضه الشاشات — وأهمُّه **رقمُ الصف** (0330) الذي تُشتقّ به المرحلة.
     | أما قراءةُ الجدول المعروض فاحتياطٌ لشاشةٍ لا تصدير فيها، وهي أهشُّ:
     | تتبع رؤوسَ الأعمدة، فتقريرٌ بأعمدةٍ مختلفة يُخرج نتيجةً ناقصة.
     */
    var s2 = el("div", "border:1.5px solid #E3E6EC;border-radius:12px;padding:12px");
    s2.appendChild(el("div", "font-weight:700;margin-bottom:4px", "الاستيراد من ملفّ نور — المسار المعتمد"));
    s2.appendChild(el("div", "color:#6B7280;font-size:12px;margin-bottom:8px",
      "للطلاب: التقارير ← التقارير الإحصائية ← «البيانات الخاصة بالإرشاد الطلابي» ← تصدير." +
      "<br>للمعلّمين: تقارير شؤون المعلمين ← «بيانات معلمي المدرسة» ← اكسل." +
      "<br>ثم اختر الملفّ المنزَّل هنا."));

    var fileRow = el("div", "display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px");
    var fileIn  = el("input", "font-size:12px;flex:1 1 190px");
    fileIn.type   = "file";
    fileIn.accept = ".xlsx,.xls";
    var kindSel = el("select", "padding:7px 9px;border:1.5px solid #E3E6EC;border-radius:8px;font:13px Tahoma,sans-serif",
      "<option value='students'>طلاب</option><option value='teachers'>معلّمون</option>");
    fileRow.appendChild(kindSel);
    fileRow.appendChild(fileIn);
    s2.appendChild(fileRow);

    /* تبديلُ النوع بعد اختيار الملفّ يُعيد قراءتَه بالقارئ الصحيح.
       رُصد حيّاً: اختار ملفَّ المعلّمين والقائمةُ على «طلاب» فرُدّ بخطأ
       Sheet2، ثمّ بدّل القائمةَ ولم يحدث شيء — كروم لا يُطلق `change` عند
       اختيار الملفّ نفسِه ثانيةً. */
    kindSel.onchange = function () { if (fileIn.files && fileIn.files[0]) readChosenFile(); };
    fileIn.onchange  = readChosenFile;

    function readChosenFile() {
      var f = fileIn.files && fileIn.files[0];
      if (!f) return;
      var kind = kindSel.value;

      say("wait", "جارٍ قراءة الملفّ…");

      var p = kind === "students"
        ? window.schoolBitReader.readGuidanceFile(f)
        : window.schoolBitReader.readTeacherFile(f);

      p.then(function (res) {
        if (res.error || !res.rows.length) {
          say("err", esc(res.error || "لم يُقرأ أيُّ صفّ من الملفّ."));
          return;
        }
        say("ok", "قُرئ " + res.rows.length + " صفّاً من الملفّ.");
        showPreview(kind, res, true);
      }).catch(function (e) { say("err", errText(e)); });
    }

    s2.appendChild(el("div", "height:1px;background:#E3E6EC;margin:4px 0 10px"));
    s2.appendChild(el("div", "color:#6B7280;font-size:12px;margin-bottom:8px",
      "أو اقرأ الجدول المعروض في هذه الصفحة (احتياطٌ لشاشةٍ لا تصدير فيها):"));

    var row2 = el("div", "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px");
    var readS = el("button", btn("", "#1F6FEB"), "اقرأ الطلاب");
    var readT = el("button", btn("", "#1F6FEB"), "اقرأ المعلّمين");
    row2.appendChild(readS); row2.appendChild(readT);
    s2.appendChild(row2);

    /*
     | تعطيلُ من غاب عن الملفّ — بطلبٍ صريح، ومطفأٌ افتراضياً.
     |
     | الوثيقة تطلبه («طالبٌ لم يعد يظهر في نطاق نور → غير نشط»)، لكنّه
     | خطِرٌ إن وقع بلا قصد: من رفع ملفَّ فصلٍ واحد ثمّ عُطّل به سائرُ
     | المدرسة يظنّ الأداةَ أتلفت بياناته. فالعَلَمُ يُرفع عمداً، ونصُّه
     | يقول ما يقع بالضبط.
     */
    var deactWrap = el("label", "display:flex;gap:7px;align-items:flex-start;font-size:12px;color:#6B7280;margin:4px 0 10px;cursor:pointer");
    deactChk = el("input", "margin-top:3px");
    deactChk.type = "checkbox";
    deactWrap.appendChild(deactChk);
    deactWrap.appendChild(el("span", "",
      "تعطيل من لم يرد في هذا الملفّ <b>من الفصول التي شملها فقط</b> — لمن نُقل من المدرسة. لا يُحذف أحد، وتاريخُه يبقى."));
    s2.appendChild(deactWrap);

    previewBox = el("div", "");
    s2.appendChild(previewBox);
    panel.appendChild(s2);

    /* ── رفعُ الغياب إلى نور ─────────────────────────────────── */
    var s3 = el("div", "border:1.5px solid #E3E6EC;border-radius:12px;padding:12px;margin-top:12px");
    s3.appendChild(el("div", "font-weight:700;margin-bottom:4px", "رفع الغياب إلى نور"));
    s3.appendChild(el("div", "color:#6B7280;font-size:12px;margin-bottom:10px",
      "اعتمِد الغياب أوّلاً من شاشة «ربط نور» في سكول بت، ثم افتح في نور: " +
      "<b>شؤون الطلاب ← إدخال السلوك والمواظبة</b>، واضغط الزرّ أدناه."));

    var pushRow = el("div", "display:flex;gap:8px;flex-wrap:wrap");
    var pushB = el("button", btn("", "#B4801A"), "نفّذ العمليات المعلَّقة");
    pushRow.appendChild(pushB);

    /* زرُّ التشخيص — يجمع ما لا تُظهره لقطةُ الشاشة. راجِع
       `schoolBitReader.diagnostics` لعلّته. */
    var diagB = el("button", btn("", "#5B6675"), "انسخ تقريراً تشخيصياً");
    pushRow.appendChild(diagB);
    s3.appendChild(pushRow);

    diagB.onclick = function () {
      var report = JSON.stringify(window.schoolBitReader.diagnostics(), null, 2);
      navigator.clipboard.writeText(report)
        .then(function () { say("ok", "نُسخ التقرير التشخيصي — الصقه في محادثة كلود.<br><span style='font-size:12px'>الأرقام الطويلة مُقنَّعة، وراجِعه قبل الإرسال.</span>"); })
        .catch(function () {
          pushBox.innerHTML = "";
          var ta = el("textarea", "width:100%;height:120px;font:11px monospace;direction:ltr");
          ta.value = report;
          pushBox.appendChild(ta);
          ta.select();
          say("warn", "تعذّر النسخ التلقائي — انسخ النصّ من الصندوق أدناه.");
        });
    };

    pushBox = el("div", "font-size:12px;color:#6B7280;margin-top:8px;max-height:150px;overflow:auto");
    s3.appendChild(pushBox);
    panel.appendChild(s3);

    pushB.onclick = function () {
      pushBox.innerHTML = "";
      pushB.disabled = true;
      say("wait", "جارٍ تنفيذ الرفع…");

      window.schoolBitPush.run(function (line) {
        pushBox.appendChild(el("div", "", esc(line)));
        pushBox.scrollTop = pushBox.scrollHeight;
      })
      .then(function (r) {
        if (!r.total) { say("ok", "لا عمليات معلَّقة."); return; }
        say(r.failed ? "warn" : "ok",
          "<b>انتهى الرفع</b><br>نجح: " + r.success + " · أخفق: " + r.failed +
          "<br><span style='font-size:12px'>وتفصيلُ كلِّ عملية في سجلّ سكول بت.</span>");
      })
      .catch(function (e) { say("err", errText(e)); })
      .then(function () { pushB.disabled = false; });
    };

    document.body.appendChild(panel);

    /* ── الأحداث ── */

    window.schoolBit.getSettings().then(function (s) {
      urlIn.value = s.baseUrl || "";
      keyIn.value = s.token || "";
    });

    saveB.onclick = function () {
      window.schoolBit.saveSettings({
        baseUrl: urlIn.value.trim(),
        token:   keyIn.value.trim()
      }).then(function () { say("ok", "حُفظت الإعدادات."); });
    };

    testB.onclick = function () {
      say("wait", "جارٍ الفحص…");
      window.schoolBit.saveSettings({ baseUrl: urlIn.value.trim(), token: keyIn.value.trim() })
        .then(function () { return window.schoolBit.status(); })
        .then(function (d) {
          var noorSchool = window.schoolBitReader.detectSchool();
          var lines =
            "<b>متّصل بسكول بت</b><br>" +
            "المدرسة في سكول بت: <b>" + esc(d.school.name || "—") + "</b><br>" +
            "طلاب مربوطون: " + d.counts.students + " · معلّمون: " + d.counts.teachers;

          if (noorSchool.name) {
            lines += "<br>المدرسة المفتوحة في نور: <b>" + esc(noorSchool.name) + "</b>";
            lines += "<br><span style='color:#B4801A'>تأكّد أنهما المدرسة نفسها قبل الإرسال.</span>";
          }
          if (noorSchool.noorSchoolId) {
            lines += "<br>الرقم الإحصائي: " + esc(noorSchool.noorSchoolId);
          }
          if (!d.school.linked) {
            lines += "<br><span style='color:#B4801A'>المدرسة غير مربوطة بمعرّف نور بعد — اضغط «اربط المدرسة».</span>";
          }
          say("ok", lines);
          renderSchoolLink(noorSchool, d);
        })
        .catch(function (e) { say("err", errText(e)); });
    };

    readS.onclick = function () { doRead("students"); };
    readT.onclick = function () { doRead("teachers"); };
  }

  /* ── القراءة والمعاينة ───────────────────────────────────────── */

  function doRead(kind) {
    var res = kind === "students"
      ? window.schoolBitReader.readStudents()
      : window.schoolBitReader.readTeachers();

    showPreview(kind, res, false);
  }

  /**
   * @param {boolean} fromFile صفوفُ الملفّ جاهزةٌ بشكل الحمولة، وصفوفُ
   *        الجدول تحتاج تحويلاً وملءَ ما نقص. فالتمييزُ هنا لا في القارئ.
   */
  function showPreview(kind, res, fromFile) {
    previewBox.innerHTML = "";

    if (res.error || !res.rows.length) {
      previewBox.appendChild(el("div", "color:#C62828;font-size:12px",
        esc(res.error || "لم يُقرأ أيُّ صفّ من هذه الصفحة. افتح تقريراً يعرض جدولاً فيه الأسماء وأرقام الهويّات.")));
      if (res.headers && res.headers.length) {
        previewBox.appendChild(el("div", "color:#6B7280;font-size:11px;margin-top:6px",
          "الأعمدة المقروءة: " + esc(res.headers.filter(Boolean).join(" · "))));
      }
      return;
    }

    previewBox.appendChild(el("div", "font-weight:700;margin:6px 0",
      "قُرئ " + res.rows.length + " صفّاً"));

    /* الناقصُ يُقال صراحةً — وصفٌّ يُرسل بحقلٍ ناقصٍ يُردّ من الخادم أو
       يُتخطّى، فالإعلامُ هنا أرخص من اكتشافه هناك.
       وملفُّ نور لا نقصَ فيه: بنيتُه مضمونةٌ فلا يُسأل عنها. */
    if (!fromFile && res.missing && res.missing.length) {
      previewBox.appendChild(el("div", "color:#B4801A;font-size:12px;margin-bottom:6px",
        "أعمدة لم تُوجد: " + esc(res.missing.join("، "))));
    }

    // معاينةُ أوّل ثلاثة صفوف — تكفي ليرى المستخدم أنّ القراءة صحيحة
    var sample = res.rows.slice(0, 3).map(function (r) {
      return esc([r.name, r.national_id, r.grade_code, r.class_number].filter(Boolean).join(" · "));
    }).join("<br>");
    previewBox.appendChild(el("div",
      "background:#F6F8FB;border-radius:8px;padding:8px;font-size:12px;margin-bottom:10px", sample));

    var defaults = {};

    if (kind === "students" && !fromFile) {
      /* تقاريرُ نور كثيرةٌ لا تعرض «رقم الصف» — وهو مطلوبٌ في الباكند
         لاشتقاق المرحلة. فيُطلب مرّةً واحدةً للدفعة كلِّها، لأن التقرير
         عادةً مُصفّى على فصلٍ واحد. */
      if (res.missing.indexOf("grade_code") !== -1) {
        previewBox.appendChild(el("label", "font-size:12px;color:#6B7280", "رقم الصف في نور (مثل 0730)"));
        var gIn = el("input", INPUT_CSS + ";margin:4px 0 8px");
        gIn.placeholder = "0730";
        previewBox.appendChild(gIn);
        defaults.gradeInput = gIn;
      }
      if (res.missing.indexOf("class_number") !== -1) {
        previewBox.appendChild(el("label", "font-size:12px;color:#6B7280", "رقم الفصل"));
        var cIn = el("input", INPUT_CSS + ";margin:4px 0 8px");
        cIn.placeholder = "1";
        previewBox.appendChild(cIn);
        defaults.classInput = cIn;
      }
    }

    var sendB = el("button", btn("", "#0B7A55") + ";margin-top:6px", "أرسل إلى سكول بت");
    previewBox.appendChild(sendB);

    sendB.onclick = function () {
      var payload;

      if (fromFile) {
        // صفوفُ الملفّ مبنيّةٌ بشكل الحمولة أصلاً — لا تحويلَ ولا ملء
        payload = res.rows;
      } else if (kind === "students") {
        payload = window.schoolBitReader.toStudentPayload(res.rows, {
          grade_code:   defaults.gradeInput ? defaults.gradeInput.value.trim() : "",
          class_number: defaults.classInput ? defaults.classInput.value.trim() : ""
        });
      } else {
        payload = window.schoolBitReader.toTeacherPayload(res.rows);
      }

      if (!payload.length) {
        say("err", "لا صفَّ صالحاً للإرسال — تحقّق من وجود الاسم ورقم الهويّة.");
        return;
      }

      sendB.disabled = true;
      sendInChunks(kind, payload, sendB);
    };
  }

  /**
   * الإرسالُ على دفعات.
   *
   * الخادمُ يقبل خمسمئة صفٍّ في الطلب الواحد، وملفُّ مدرسةٍ متوسّطة يتجاوزها.
   * فلو أُرسل كاملاً لَرُدّ الملفُّ كلُّه برسالة تحقّقٍ واحدة، ولَما وصل
   * طالبٌ واحد. والقطعُ هنا أربعمئةٌ لا خمسمئة — هامشٌ يقي من حدٍّ يُشدَّد
   * لاحقاً في الخادم دون أن يتعطّل ما في أيدي المدارس.
   *
   * والدفعاتُ تمضي **بالتتابع لا بالتوازي**: الخادمُ يخنق ستّين طلباً في
   * الدقيقة، ودفعُ عشرٍ معاً يستهلك الحصّة ويردّ الباقي ٤٢٩.
   */
  function sendInChunks(kind, payload, sendB) {
    var CHUNK = 400;
    var total = { created: 0, updated: 0, restored: 0, skipped_count: 0, skipped: [] };
    var chunks = [];

    for (var i = 0; i < payload.length; i += CHUNK) {
      chunks.push(payload.slice(i, i + CHUNK));
    }

    var index = 0;

    function step() {
      if (index >= chunks.length) {
        var txt = "<b>تمّ الإرسال</b><br>" +
          "أُضيف: " + total.created +
          " · حُدِّث: " + total.updated +
          (total.restored ? " · أُعيد: " + total.restored : "") +
          " · تُخطّي: " + total.skipped_count;

        if (total.skipped.length) {
          txt += "<br><span style='color:#B4801A;font-size:12px'>" +
            total.skipped.slice(0, 5).map(function (s) {
              return "صف " + s.row + ": " + esc(s.reason);
            }).join("<br>") + "</span>";
        }

        say(total.skipped_count ? "warn" : "ok", txt);
        sendB.disabled = false;
        return;
      }

      say("wait", "جارٍ الإرسال… دفعة " + (index + 1) + " من " + chunks.length +
                  " (" + payload.length + " صفّاً)");

      var call = kind === "students"
        ? window.schoolBit.importStudents(chunks[index], {
            deactivateMissing: !!(deactChk && deactChk.checked)
          })
        : window.schoolBit.importTeachers(chunks[index]);

      call.then(function (d) {
        var c = d.summary || {};
        total.created       += (c.created || 0);
        total.updated       += (c.updated || 0);
        total.restored      += (c.restored || 0);
        total.skipped_count += (c.skipped_count || 0);
        if (c.skipped) total.skipped = total.skipped.concat(c.skipped);
        index++;
        step();
      }).catch(function (e) {
        /* دفعةٌ سقطت: يُقال ما نجح قبلها ولا يُدَّعى تمامٌ لم يقع. */
        say("err", errText(e) +
          "<br><span style='font-size:12px'>وصل قبل الانقطاع: أُضيف " +
          total.created + " · حُدِّث " + total.updated + "</span>");
        sendB.disabled = false;
      });
    }

    step();
  }

  /* ── أدوات ───────────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /** رسالةُ الخادم كما وصلت، مع علاجٍ لِما يُعرف علاجُه. */
  function errText(e) {
    var msg = esc(e && e.message ? e.message : String(e));
    if (e && e.status === 402) msg += "<br><span style='font-size:12px'>جدّد اشتراك المدرسة في سكول بت.</span>";
    if (e && e.status === 403) msg += "<br><span style='font-size:12px'>أنشئ مفتاحاً جديداً من شاشة «ربط نور».</span>";
    return msg;
  }

  function say(kind, html) {
    var tone = {
      ok:   ["#0B7A5514", "#0B7A55"],
      err:  ["#C6282814", "#C62828"],
      warn: ["#B4801A14", "#B4801A"],
      wait: ["#77839B14", "#77839B"]
    }[kind] || ["#77839B14", "#77839B"];

    statusBox.style.display    = "block";
    statusBox.style.background = tone[0];
    statusBox.style.color      = tone[1];
    statusBox.innerHTML        = html;

    /* الرسالةُ في أعلى اللوحة والزرُّ في أسفلها — فمن ضغط «أرسل» وهو
       مُمرِّرٌ إلى الأسفل لم يرَ نتيجةً ولم يعرف أوقع شيءٌ أم لا. رُصد في
       أوّل تجربةٍ حيّة: «وين أشوف النتيجة؟». فتُجلب الرسالةُ إلى النظر. */
    try { statusBox.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (_) {}
  }

  /* ── التركيب ─────────────────────────────────────────────────── */

  function mount() {
    if (!window.schoolBit || !window.schoolBitReader) { setTimeout(mount, 300); return; }
    if (document.getElementById("corbit-schoolbit-btn")) return;

    var b = el("button", BTN_CSS, "سكول بت");
    b.id = "corbit-schoolbit-btn";
    b.onclick = function () {
      if (!panel) { build(); return; }
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    };
    document.body.appendChild(b);

    /* يبقى الزرُّ آخرَ عنصرٍ في body لعشر ثوانٍ — فيعلو قفلَ التفعيل إن
       حُقن بعده (راجِع تعليق Z). وبعدها يستقرّ الترتيب ولا حاجة للمراقبة. */
    var ticks = 0;
    var keepOnTop = setInterval(function () {
      if (++ticks > 20) { clearInterval(keepOnTop); return; }
      if (document.body.lastElementChild !== b) document.body.appendChild(b);
      if (panel && document.body.lastElementChild !== panel) document.body.appendChild(panel);
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
