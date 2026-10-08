// =====================================================================
//  قارئُ جداول نور — يستخرج الصفوف من الجدول المعروض في الصفحة
// =====================================================================
//
//  يكشف `window.schoolBitReader` بـ:
//    - readStudents()  → {rows, headers, mapped, missing}
//    - readTeachers()  → {rows, headers, mapped, missing}
//    - detectSchool()  → {name, noorSchoolId}
//
//  ⚠️ **لماذا قراءةُ الجدول المعروض ولا مسارٌ ثابتٌ لشاشةٍ بعينها؟**
//
//  لأنّ شاشات نور كثيرةٌ وأسماءُ عناصرها (`ctl00_PlaceHolderMain_…`) تتغيّر
//  بين تقريرٍ وتقرير وبين إصدارٍ وإصدار. فمُحدِّدٌ مثبَّتٌ على شاشةٍ واحدة
//  يعمل اليوم ويسقط غداً بلا إنذار — وهو الخطرُ الأوّل في وثيقة الربط.
//
//  أما **رؤوسُ الأعمدة** فهي ما يراه المستخدم، ولا تتغيّر إلا بتغيّر التقرير
//  نفسِه. فالقراءةُ بها تعمل على أيِّ شاشةٍ تعرض الحقولَ المطلوبة، وتُعلن
//  بوضوحٍ ما لم تجده بدل أن تُرسل صفوفاً ناقصة.
//
//  والتطبيعُ (`norm`) منقولٌ في روحه عن `NoorTeacherSheetImporter` في
//  الباكند: نورُ تكتب «الهوية» و«الهويه»، و«الإسم» و«الاسم»، وأرقاماً هنديّة
//  وعربيّة — فتُوحَّد كلُّها قبل المطابقة.

(function () {
  if (window.schoolBitReader) return;

  /* ── تطبيعُ النصّ العربي ──────────────────────────────────────── */

  function norm(s) {
    return String(s == null ? "" : s)
      .replace(/[ـ]/g, "")                 // تطويل
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[ً-ْ]/g, "")          // تشكيل
      .replace(/[٠-٩]/g, function (d) { // أرقام هنديّة → عربيّة
        return String(d.charCodeAt(0) - 0x0660);
      })
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function digits(s) {
    return String(s == null ? "" : s)
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
      .replace(/\D/g, "");
  }

  /* ── خرائطُ الرؤوس ────────────────────────────────────────────── */

  var STUDENT_HEADERS = {
    name:         ["اسم الطالب", "اسم الطالبه", "الاسم", "اسم الطالب رباعي"],
    // ⚠️ «رقم الطالب» في تقارير نور هو رقمُ الهويّة لا رقمٌ تسلسلي — وهي
    // المطابقةُ نفسُها التي يعتمدها مستورِدُ الإكسل في الباكند.
    national_id:  ["رقم الهويه", "الهويه", "رقم الطالب", "رقم السجل المدني", "الهويه/الاقامه", "رقم الهويه/الاقامه"],
    grade_code:   ["رقم الصف", "كود الصف"],
    class_number: ["الفصل", "رقم الفصل"],
    guardian_phone: ["الجوال", "جوال ولي الامر", "رقم الجوال", "جوال المتابع"],
  };

  var TEACHER_HEADERS = {
    name:        ["الاسم", "اسم المعلم", "اسم الموظف"],
    national_id: ["رقم الهويه", "الهويه", "رقم السجل المدني"],
    phone:       ["الجوال", "رقم الجوال"],
    email:       ["البريد الالكتروني", "البريد"],
    phone1:      ["هاتف 1", "هاتف1"],
    phone2:      ["هاتف 2", "هاتف2"],
    specialty:   ["التخصص"],
    job_title:   ["المسمي", "المسمي الوظيفي", "الوظيفه"],
  };

  /* ── إيجادُ جدول البيانات ─────────────────────────────────────── */

  /**
   * أكبرُ جدولٍ في الصفحة له صفُّ رؤوسٍ وصفوفُ بيانات.
   *
   * صفحاتُ نور مبنيّةٌ على جداولَ متداخلةٍ للتخطيط لا للبيانات، فالاختيارُ
   * بالأكثرِ صفوفاً — جدولُ التخطيط له صفٌّ أو صفّان، وجدولُ التقرير عشرات.
   */
  function findDataTable() {
    var best = null, bestScore = 0;

    Array.prototype.forEach.call(document.querySelectorAll("table"), function (tbl) {
      var rows = tbl.rows ? tbl.rows.length : 0;
      var cols = rows ? (tbl.rows[0].cells ? tbl.rows[0].cells.length : 0) : 0;
      if (rows < 2 || cols < 2) return;

      // جدولٌ يحوي جدولاً آخر جدولُ تخطيطٍ لا بيانات
      if (tbl.querySelector("table")) return;

      var score = rows * cols;
      if (score > bestScore) { bestScore = score; best = tbl; }
    });

    return best;
  }

  /** صفُّ الرؤوس: أوّلُ صفٍّ فيه `th`، وإلا فالصفُّ الأول. */
  function headerRowIndex(tbl) {
    for (var i = 0; i < Math.min(tbl.rows.length, 10); i++) {
      if (tbl.rows[i].querySelector("th")) return i;
    }
    return 0;
  }

  function cellText(cell) {
    return String(cell.innerText || cell.textContent || "").replace(/\s+/g, " ").trim();
  }

  /* ── الاستخراج ────────────────────────────────────────────────── */

  function extract(headerMap) {
    var tbl = findDataTable();
    if (!tbl) {
      return { rows: [], headers: [], mapped: {}, missing: Object.keys(headerMap), error: "لم يُعثر على جدول بيانات في هذه الصفحة." };
    }

    var hIdx    = headerRowIndex(tbl);
    var headers = Array.prototype.map.call(tbl.rows[hIdx].cells, cellText);
    var normed  = headers.map(norm);

    // رأسٌ → فهرسُ عمود
    var mapped = {};
    Object.keys(headerMap).forEach(function (field) {
      for (var i = 0; i < normed.length; i++) {
        if (normed[i] === "") continue;
        for (var j = 0; j < headerMap[field].length; j++) {
          if (normed[i] === norm(headerMap[field][j])) { mapped[field] = i; return; }
        }
      }
    });

    var rows = [];
    for (var r = hIdx + 1; r < tbl.rows.length; r++) {
      var cells = tbl.rows[r].cells;
      if (!cells || cells.length < 2) continue;

      var row = { _rowIndex: r };
      var any = false;

      Object.keys(mapped).forEach(function (field) {
        var idx = mapped[field];
        if (idx == null || !cells[idx]) return;
        var v = cellText(cells[idx]);
        if (v !== "") { row[field] = v; any = true; }
      });

      if (!any) continue;

      /* صفُّ الترقيم والمجاميع يلتبس بصفِّ بيانات — يُطرح بأنّ لا اسمَ له. */
      if (!row.name) continue;

      // معرّفُ نور الثابت إن ظهر في رابط الصف — أدقُّ من الهويّة إن وُجد
      row.noor_id = noorIdFromRow(tbl.rows[r]);

      rows.push(row);
    }

    var missing = Object.keys(headerMap).filter(function (f) { return mapped[f] == null; });

    return { rows: rows, headers: headers, mapped: mapped, missing: missing, table: tbl };
  }

  /**
   * معرّفُ الطالب الثابت من روابط الصف — إن أتاحته الشاشة.
   *
   * ⚠️ **غيرُ مؤكَّدٍ ميدانياً بعد.** لم تُتَح جلسةُ نور حقيقية وقتَ كتابة
   * هذا، فالأنماطُ أدناه استنتاجٌ من بنية ASP.NET المعتادة في نور. والغيابُ
   * ليس عطلاً: الباكند يقبل الهويّةَ مفتاحاً بديلاً (`nid:`)، ويظلّ
   * الاستيرادُ صحيحاً ومنعُ التكرار قائماً. فإن ظهر المعرّفُ صار أدقّ، وإن
   * غاب مضى العمل.
   */
  function noorIdFromRow(tr) {
    var patterns = [/StudentID=(\d+)/i, /StudId=(\d+)/i, /UserID=(\d+)/i, /[?&]id=(\d{5,})/i];

    var links = tr.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      for (var p = 0; p < patterns.length; p++) {
        var m = href.match(patterns[p]);
        if (m) return m[1];
      }
    }

    // بعضُ الشاشات تضع المعرّف في قيمة صندوق الاختيار
    var cb = tr.querySelector("input[type=checkbox][value]");
    if (cb && /^\d{5,}$/.test(cb.value)) return cb.value;

    return null;
  }

  /* ── ملفُّ «البيانات الخاصة بالإرشاد الطلابي» ────────────────── */

  /**
   * قراءةُ ملفِّ `StudentGuidance.xlsx` الذي يُصدّره نور.
   *
   * **وهذا هو المسارُ المفضَّل، وقراءةُ الجدول أدناه احتياطٌ له.** فالملفُّ
   * بنيتُه ثابتةٌ يضمنها نور نفسُه، ولا تتعلّق بمُحدِّدٍ ولا برأسِ عمودٍ قد
   * يتبدّل. وفيه **رقمُ الصف** (مثل 0330) — وهو ما تخلو منه أكثرُ الشاشات،
   * وبه تُشتقّ المرحلة في سكول بت.
   *
   * موضعُه في نور: التقارير ← التقارير الإحصائية ← «البيانات الخاصة
   * بالإرشاد الطلابي» ← تصدير.
   * (`ReportPages/DataToStudentsGuidance.aspx`)
   *
   * وبنيةُ الورقة `Sheet2` كما يُصدّرها نور:
   *   العمود A فارغ · صفُّ عنوانٍ «Student Info Table» · صفُّ رؤوس · ثمّ البيانات
   *   B الجوال · C الفصل · D رقم الصف · E اسم الطالب · F رقم الطالب (الهويّة)
   *
   * ⚠️ و«رقم الطالب» هو **رقمُ الهويّة** لا رقماً تسلسلياً — وهي المطابقةُ
   * نفسُها التي يعتمدها مستورِدُ الإكسل في الباكند منذ البداية.
   *
   * والتخطّي هنا يطابق الباكند حرفاً بحرف: تُحذف الصفوفُ الفارغة، ثمّ
   * يُتخطّى صفّان (العنوان والرؤوس)، ثمّ تُقرأ الأعمدة بمواضعها.
   */
  function readGuidanceWorkbook(workbook) {
    var sheet = workbook.Sheets["Sheet2"];
    if (!sheet) {
      return { rows: [], error: "لا توجد ورقة Sheet2 في الملف — تأكّد أنه ملفّ «البيانات الخاصة بالإرشاد الطلابي» من نور." };
    }

    var grid = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });

    // الصفوفُ الفارغة تُطرح أوّلاً — كما يفعل الباكند تماماً
    var rows = grid.filter(function (r) {
      return r && r.some(function (c) { return String(c).trim() !== ""; });
    });

    if (rows.length < 3) {
      return { rows: [], error: "الملف لا يحتوي صفوف طلاب في ورقة Sheet2." };
    }

    rows = rows.slice(2); // العنوان وصفُّ الرؤوس

    var out = [];
    rows.forEach(function (r) {
      var name       = String(r[4] == null ? "" : r[4]).trim();
      var nationalId = digits(r[5]);
      var gradeCode  = String(r[3] == null ? "" : r[3]).trim();

      if (!name || !nationalId || !gradeCode) return;

      var row = {
        name: name,
        national_id: nationalId,
        grade_code: gradeCode,
        class_number: String(r[2] == null ? "" : r[2]).trim()
      };

      /* الجوّالُ في هذا الملف جوّالُ **وليّ الأمر** لا الطالب — ولذلك
         يذهب إلى `guardian` لا إلى الطالب. وهي التفرقةُ نفسُها التي
         يفرضها الباكند. */
      var phone = digits(r[1]);
      if (phone) row.guardian = { phone: phone };

      out.push(row);
    });

    return { rows: out };
  }

  /**
   * قراءةُ إكسل تقرير «بيانات معلمي المدرسة» من نور.
   *
   * وبنيتُه تختلف عن ملفّ الإرشاد اختلافاً جوهرياً: هذا تقريرٌ مطبوعٌ
   * بترويسةِ وزارةٍ واسمِ إدارةٍ ومدرسةٍ قبل الجدول، فصفُّ الرؤوس لا يقع في
   * موضعٍ ثابت. فيُمسح أوّلُ أربعين صفّاً بحثاً عنه — وهو المنطقُ نفسُه
   * الذي يعتمده `NoorTeacherSheetImporter` في الباكند، ولنفس السبب.
   *
   * والقراءةُ بالرؤوس لا بالمواضع: التقريرُ تتبدّل أعمدتُه بحسب ما يُطلب.
   */
  function readTeacherWorkbook(workbook) {
    var sheetName = workbook.SheetNames[0];
    var sheet     = workbook.Sheets[sheetName];
    if (!sheet) return { rows: [], error: "الملف فارغ." };

    var grid = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });

    var FIELDS = {
      national_id: ["رقم الهويه", "الهويه", "رقم السجل المدني"],
      name:        ["الاسم", "اسم المعلم"],
      email:       ["البريد الالكتروني", "البريد"],
      phone:       ["الجوال"],
      phone1:      ["هاتف 1", "هاتف1"],
      phone2:      ["هاتف 2", "هاتف2"],
      specialty:   ["التخصص"],
      job_title:   ["المسمي", "المسمي الوظيفي", "الوظيفه"]
    };

    // صفُّ الرؤوس: أوّلُ صفٍّ يحمل «رقم الهوية» و«الاسم» معاً
    var headerRow = -1, mapped = {};
    var scanTo = Math.min(grid.length, 40);

    for (var r = 0; r < scanTo; r++) {
      var found = {};
      for (var c = 0; c < grid[r].length; c++) {
        var cell = norm(String(grid[r][c]).replace(/\n/g, " "));
        if (cell === "") continue;
        Object.keys(FIELDS).forEach(function (field) {
          if (found[field] != null) return;
          for (var i = 0; i < FIELDS[field].length; i++) {
            if (cell === norm(FIELDS[field][i])) { found[field] = c; return; }
          }
        });
      }
      if (found.national_id != null && found.name != null) {
        headerRow = r; mapped = found; break;
      }
    }

    if (headerRow === -1) {
      return { rows: [], error: "لم يُعثر على صفّ الرؤوس — تأكّد أنه ملفّ «بيانات معلمي المدرسة» من نور." };
    }

    var out = [];
    for (var d = headerRow + 1; d < grid.length; d++) {
      var row = grid[d];
      if (!row) continue;

      var name       = String(row[mapped.name] == null ? "" : row[mapped.name]).trim();
      var nationalId = digits(row[mapped.national_id]);
      if (!name || !nationalId) continue;

      var rec = { name: name, national_id: nationalId };
      ["email", "specialty", "job_title"].forEach(function (f) {
        if (mapped[f] == null) return;
        var v = String(row[mapped[f]] == null ? "" : row[mapped[f]]).trim();
        if (v) rec[f] = v;
      });
      ["phone", "phone1", "phone2"].forEach(function (f) {
        if (mapped[f] == null) return;
        var v = digits(row[mapped[f]]);
        if (v) rec[f] = v;
      });

      out.push(rec);
    }

    return { rows: out };
  }

  /** يُحمِّل SheetJS المضمَّنة عند الحاجة — لا من شبكةٍ خارجية. */
  function ensureXlsx() {
    if (typeof XLSX !== "undefined") return Promise.resolve();

    return new Promise(function (resolve, reject) {
      var base = window.CORBIT_LOCAL_FILES_BASE || "";
      var s = document.createElement("script");
      s.src = base + "lib/xlsx.full.min.js";
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("تعذّر تحميل قارئ الإكسل.")); };
      document.head.appendChild(s);
    });
  }

  /* ── المدرسة ──────────────────────────────────────────────────── */

  /**
   * اسمُ المدرسة والرقمُ الإحصائيُّ من ترويسة نور.
   *
   * والاسمُ هو المهمّ هنا: يُعرض على المستخدم ليؤكّد أنه يعمل على مدرسته —
   * فمن ركّب الإضافة على حساب مدرسةٍ ثم فتح نور بحساب أخرى يستورد طلابَ
   * هذه إلى تلك، ولا شيءَ في البيانات يكشف الخلط بعد وقوعه.
   */
  function detectSchool() {
    var name = null, id = null, role = null;

    /*
     | ⚠️ ترويسةُ نور أوّلاً، وقبل أيِّ حقلٍ معنون.
     |
     | في أوّل تجربةٍ حيّة التقط الحقلُ المعنونُ «المدرسة» زرَّ قائمةٍ اسمُه
     | «الاستمارات» وعرضه اسمَ المدرسة — والمستخدمُ يقارن هذا الاسمَ بما في
     | سكول بت ليأمن الخلطَ بين مدرستين، فاسمٌ خاطئ هنا أسوأ من لا شيء.
     |
     | أما الترويسةُ فنصُّها ثابتُ الشكل في كلّ شاشات المدير:
     |   «مدير مدرسة - ابتدائية الأقصى - الإدارة العامة للتعليم بمنطقة عسير»
     | الدورُ، فالمدرسة، فإدارةُ التعليم — بفاصلٍ واحد. فتُقرأ بنمطٍ صريح.
     */
    var headerText = "";
    var headerEl = document.querySelector("[id*='oHeader'], #ctl00_lblUserInfo, .header, header");
    if (headerEl) headerText = String(headerEl.innerText || headerEl.textContent || "");
    if (!/مدير|وكيل|مشرف|معلم|قائد/.test(headerText) && document.body) {
      headerText = String(document.body.innerText || "").slice(0, 3000);
    }

    var m0 = headerText.match(/(مدير(?:ة)?\s*مدرسة|وكيل(?:ة)?\s*(?:مدرسة)?|قائد(?:ة)?\s*مدرسة|مشرف[^\-–\r\n]*)\s*[\-–]\s*([^\-–\r\n]{3,80}?)\s*[\-–]/);
    if (m0) {
      role = m0[1].trim();
      name = m0[2].trim();
    }

    /*
     | ثلاثةُ مواضعَ مرتَّبةٌ بالأوثق:
     |
     |   ١) حقلٌ صريحٌ عنوانُه «المدرسة» — يظهر في شاشة رصد الغياب
     |      (`ManageAttendance.aspx`) وغيرِها. وهو أدقُّها لأنه اسمُ
     |      المدرسة وحدَه بلا زيادة.
     |   ٢) ترويسةُ نور، ونصُّها:
     |      «مدير مدرسة - ابتدائية الأقصى - الإدارة العامة للتعليم بمنطقة عسير»
     |      فالمدرسةُ هي الجزء الأوسط. ويلزم قصُّها لأنّ الترويسة تحمل
     |      الدورَ والإدارةَ معها.
     |   ٣) مُحدِّداتٌ باسمٍ يحوي SchoolName — احتياطٌ لشاشاتٍ لم نرَها.
     */

    if (!name) {
      var labelled = labelledValue("المدرسه");
      // يُقبل فقط ما يشبه اسمَ مدرسة — لا زرَّ قائمةٍ صادفَ المجاورة
      if (labelled && /مدرس|ابتدائ|متوسط|ثانوي|روض|تحفيظ|معهد/.test(norm(labelled))) name = labelled;
    }

    if (!name) {
      var header = document.querySelector("[id*='oHeader'], .userInfo, #ctl00_lblUserInfo");
      var txt = header ? String(header.innerText || header.textContent || "") : "";
      // «دورٌ - مدرسةٌ - إدارةُ تعليم» — نأخذ الأوسط
      var parts = txt.split(/\s+[-–]\s+/).map(function (p) { return p.trim(); });
      if (parts.length >= 2) {
        for (var k = 0; k < parts.length; k++) {
          if (/مدرسه|ابتدائيه|متوسطه|ثانويه|روضه/.test(norm(parts[k])) &&
              !/^مدير|^وكيل|^مشرف/.test(parts[k])) {
            name = parts[k];
            break;
          }
        }
        if (/مدير|وكيل|مشرف|معلم/.test(parts[0])) role = parts[0];
      }
    }

    if (!name) {
      var el = document.querySelector("[id*='SchoolName'], [id*='lblSchool']");
      if (el) {
        var t = String(el.innerText || el.textContent || "").trim();
        if (t) name = t;
      }
    }

    // الرقم الإحصائي — رقمٌ من خمس خاناتٍ فأكثر بجوار كلمةٍ دالّة
    var body = document.body ? (document.body.innerText || "") : "";
    var m = body.match(/الرقم\s*(?:الإحصائي|الاحصائي|الوزاري)\s*[:：]?\s*([0-9٠-٩]{5,})/);
    if (m) id = digits(m[1]);

    return { name: name, noorSchoolId: id, role: role };
  }

  /**
   * قيمةُ حقلٍ عنوانُه كذا في جداول نور.
   *
   * شاشاتُ نور تعرض «المدرسة : ابتدائية الأقصى» في خليّتين متجاورتين، لا
   * في عنصرٍ له معرّفٌ ثابت. فتُلتمس بالعنوان الظاهر — وهو ما لا يتبدّل.
   */
  function labelledValue(normalisedLabel) {
    var cells = document.querySelectorAll("td, th, div, span, label");

    for (var i = 0; i < cells.length; i++) {
      var t = norm(cellText(cells[i]).replace(/[:：*]/g, ""));
      if (t !== normalisedLabel) continue;

      // الخليّةُ التاليةُ في نفس الصف، أو الشقيقةُ المباشرة
      var next = cells[i].nextElementSibling;
      for (var hop = 0; hop < 3 && next; hop++) {
        var v = cellText(next);
        if (v && norm(v) !== normalisedLabel && v.length > 2 && !/^[:：]/.test(v)) return v;
        next = next.nextElementSibling;
      }
    }

    return null;
  }

  /* ── تقريرٌ تشخيصيّ ───────────────────────────────────────────── */

  /**
   * يجمع بنيةَ الصفحة التي لا تُظهرها لقطةُ الشاشة.
   *
   * ⚠️ **علّةُ وجوده**: قيمُ قوائم نور (`<option value>`) مخفيّةٌ في HTML ولا
   * تظهر في صورة، ورمزُ «الغياب بعذر» منها — وهو ما يمنع رفعَ الغياب بعذر
   * اليوم. ومثلُه بنيةُ صفِّ الجدول: هل فيه عمودُ هويّة؟ أفي رابطه معرّفٌ
   * ثابت؟ فصورةٌ لا تُجيب، و«افتح أدوات المطوّر وانسخ العنصر» طلبٌ ثقيل.
   *
   * **والأرقامُ الطويلة تُقنَّع قبل النسخ** (الهويّات والجوّالات)، فالمطلوبُ
   * البنيةُ لا البيانات. راجِع الناتجَ قبل إرساله على كلّ حال.
   */
  function diagnostics() {
    var out = {
      url: location.pathname + location.search.slice(0, 60),
      title: (document.title || "").trim(),
      school: detectSchool(),
      selects: [],
      grid: null,
      labels: []
    };

    // كلُّ القوائم وقيمُها — هنا يقع رمزُ «نوع الغياب»
    Array.prototype.forEach.call(document.querySelectorAll("select"), function (sel) {
      if (!sel.id && !sel.name) return;
      out.selects.push({
        id: sel.id || sel.name,
        selected: sel.value,
        options: Array.prototype.map.call(sel.options, function (o) {
          return { value: o.value, text: mask(cellText(o)) };
        }).slice(0, 40)
      });
    });

    // جدولُ البيانات: رؤوسُه وصفٌّ واحدٌ ببنيته كاملة
    var tbl = findDataTable();
    if (tbl) {
      var hIdx = headerRowIndex(tbl);
      var sample = tbl.rows[hIdx + 1];

      out.grid = {
        id: tbl.id || null,
        rows: tbl.rows.length,
        headers: Array.prototype.map.call(tbl.rows[hIdx].cells, cellText),
        sampleRowHtml: sample ? mask(sample.outerHTML).slice(0, 4000) : null
      };
    }

    // رسائلُ النتيجة — بنصّها، فبها يُعرف نجاحُ الحفظ
    Array.prototype.forEach.call(document.querySelectorAll("[id*='lbl'], [id*='Result'], [id*='Message']"), function (el) {
      var t = cellText(el);
      if (t && t.length < 300) out.labels.push({ id: el.id, text: mask(t) });
    });

    return out;
  }

  /** يقنّع كلَّ متتاليةٍ من خمسة أرقامٍ فأكثر — هويّاتٍ كانت أو جوّالات. */
  function mask(s) {
    return String(s == null ? "" : s).replace(/[0-9٠-٩]{5,}/g, function (m) {
      return "#".repeat(m.length);
    });
  }

  /* ── الواجهة ──────────────────────────────────────────────────── */

  window.schoolBitReader = {
    norm: norm,
    digits: digits,
    detectSchool: detectSchool,
    diagnostics: diagnostics,
    readStudents: function () { return extract(STUDENT_HEADERS); },
    readTeachers: function () { return extract(TEACHER_HEADERS); },

    /**
     * المسارُ المفضَّل: ملفُّ «الإرشاد الطلابي» من نور.
     * @param {File} file ملفٌّ اختاره المستخدم من قرصه
     */
    readGuidanceFile: function (file) {
      return ensureXlsx()
        .then(function () { return file.arrayBuffer(); })
        .then(function (buf) {
          var wb = XLSX.read(new Uint8Array(buf), { type: "array" });
          return readGuidanceWorkbook(wb);
        });
    },

    /**
     * ملفُّ «بيانات معلمي المدرسة» من نور.
     * @param {File} file
     */
    readTeacherFile: function (file) {
      return ensureXlsx()
        .then(function () { return file.arrayBuffer(); })
        .then(function (buf) {
          var wb = XLSX.read(new Uint8Array(buf), { type: "array" });
          return readTeacherWorkbook(wb);
        });
    },

    /** حمولةُ الطلاب كما يقبلها الباكند — بعد ملء الناقص من لوحة التحكم. */
    toStudentPayload: function (rows, defaults) {
      defaults = defaults || {};
      return rows.map(function (r) {
        var out = {
          name:         r.name,
          national_id:  digits(r.national_id),
          grade_code:   String(r.grade_code || defaults.grade_code || "").trim(),
          class_number: String(r.class_number || defaults.class_number || "").trim()
        };
        if (r.noor_id) out.noor_student_id = String(r.noor_id);
        if (r.guardian_phone) out.guardian = { phone: digits(r.guardian_phone) };
        return out;
      }).filter(function (r) { return r.name && (r.national_id || r.noor_student_id); });
    },

    toTeacherPayload: function (rows) {
      return rows.map(function (r) {
        var out = { name: r.name, national_id: digits(r.national_id) };
        if (r.noor_id)   out.noor_teacher_id = String(r.noor_id);
        if (r.phone)     out.phone     = digits(r.phone);
        if (r.phone1)    out.phone1    = digits(r.phone1);
        if (r.phone2)    out.phone2    = digits(r.phone2);
        if (r.email)     out.email     = r.email;
        if (r.specialty) out.specialty = r.specialty;
        if (r.job_title) out.job_title = r.job_title;
        return out;
      }).filter(function (r) { return r.name && r.national_id; });
    }
  };
})();
