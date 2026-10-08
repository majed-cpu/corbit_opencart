corbit_get("move_students").then(function (v1) {
  corbit_get("m_students_" + school_id).then(function (v2) {
    var v3 = {};
    var v4 = JSON.parse(v1);
    var v5 = "";
    var v6 = "<option value='not-selected'>عدم الاضافة</option>";
    var v7 = [];
    v4.students.forEach(function (v12) {
      if (!v7.includes(v12.class_name + " - " + v12.row_name)) {
        v7.push(v12.class_name + " - " + v12.row_name);
        v12.classname = v12.class_name?.toString();
        v12.classname = v12.classname.replace("0725", "الأول المتوسط");
        v12.classname = v12.classname.replace("0825", "الثاني المتوسط");
        v12.classname = v12.classname.replace("0925", "الثالث المتوسط");
        v12.classname = v12.classname.replace("0125", "الأول ابتدائي");
        v12.classname = v12.classname.replace("0225", "الثاني ابتدائي");
        v12.classname = v12.classname.replace("0325", "الثالث ابتدائي");
        v12.classname = v12.classname.replace("0430", "الرابع ابتدائي");
        v12.classname = v12.classname.replace("0530", "الخامس ابتدائي");
        v12.classname = v12.classname.replace("0630", "السادس ابتدائي");
        v12.classname = v12.classname.replace("1314", "أول ثانوي");
        v12.classname = v12.classname.replace("1416", "ثاني ثانوي");
        v12.classname = v12.classname.replace("1516", "ثالث ثانوي");
        v6 = v6 + ("\n            <option value=\"" + (v12.class_name + " - " + v12.row_name) + "\">" + (v12.classname + " - " + v12.row_name) + "</option>\n            ");
      }
    });
    var v8 = {};
    var v9 = JSON.parse(JSON.stringify(v4.classes));
    function v10() {
      if (v9.length) {
        $.get("https://schools.madrasati.sa/SchoolStructure/Classrooms/AllocateStudentInClassRoom/" + v9[0].number).then(function (v13) {
          v8[v9[0].number] = $(v13).find("#AllocateForm [name=\"ClassRoomId\"]").val();
          v9.shift();
          v10();
        });
      } else {
        $(".sadasd5545654").removeClass("dnone");
        $(".sadasd55456542").remove();
      }
    }
    v10();
    v4.classes.forEach(function (v14) {
      v5 = v5 + ("\n        <tr>\n            <td>\n                " + v14.title.split("-")[v14.title.split("-").length - 2] + " - " + v14.title.split("-")[v14.title.split("-").length - 1] + "\n            </td>\n            <td>\n                <select id='" + v14.number + "'>\n                " + v6 + "\n                </select>\n            </td>\n            <td class='m_" + v14.number + "'></td>\n        </tr>\n        ");
    });
    alert("\n        <div class='xxas34__rwer'>\n            <div id='_result'></div>\n            <div class='col-12 table-responsive'>\n            <center><h4>أداة سكول بت</h4>\n                <span class='text-danger sadasd55456542'>جاري الاستعلام.. برجاء الانتظار لحظات...</span></center>\n                <table class='table table-hover table-sm table-bordered asxac334'>\n                    <thead>\n                        <th>الفصل في مدرستي</th>\n                        <th>الفصل في نور</th>\n                        <th>الحالة</th>\n                    </thead>\n                    <tbody>\n                        " + v5 + "\n                    </tbody>\n                </table>\n            </div>\n            <br>\n            <style>.dnone{display:none}</style>\n            <div class='col-12 text-center'>\n                <button class='btn btn-primary sadasd5545654 dnone'>\n                    تسكين الطلاب الآن\n                </button>\n            </div>\n            <br>\n            <button class='btn btn-sm btn-danger enddd'>\n                <i class='fa fa-times'></i>\n                انهاء العملية\n            </button>\n        </div>\n    ");
    if (!v2 || v2 == "undefined" || v2 == "") {
      $(".xxas34__rwer").html("<center><strong class='text-danger relffd'><i class='fa fa-times'></i> لم يتم استيراد بيانات الطلاب, برجاء تحديث البيانات من الزر بالأسفل<br><br>وبعدها قم بإعادة التسكين مرة اخرى.</strong><br><br><a href='/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/import-students-from-madrasati' onclick='setTimeout(function(){ location.reload()}, 2000)' class='btn btn-primary'>لاستيراد / تحديث بيانات الطلاب من مدرستي اضغط هنا</a></center>");
    } else {
      JSON.parse(v2).forEach(function (v15) {
        v3[v15.number] = v15.id;
      });
    }
    function v11() {
      corbit_set("move_students", "[]").then(function () {
        corbit_set("move_students_now", "[]").then(function () {
          location.reload();
        });
      });
    }
    $(".enddd").click(function (v16) {
      v11();
    });
    $(".bootbox-accept").remove();
    $(".sadasd5545654").click(function () {
      if (online) {
        $(".sadasd5545654").fadeOut();
      }
      var v17 = [];
      $(".asxac334 select").each(function () {
        if ($(this).val() != "not-selected") {
          v17.push({
            id: $(this).attr("id"),
            noor: $(this).val()
          });
        }
      });
      function v18() {
        if (!v17.length) {
          alert("تم العملية بنجاح");
          v11();
          return false;
        }
        var v19 = v17[0];
        var v20 = v4.students.filter(function (v23) {
          if (v19.noor == v23.class_name + " - " + v23.row_name) {
            return v23;
          } else {
            return false;
          }
        });
        v17.shift();
        var v21 = 0;
        async function v22() {
          if (v20.length) {
            await fetch("https://schools.madrasati.sa/SchoolStructure/Classrooms/AllocateSelectedStudentInClassRoom/" + v19.id, {
              headers: {
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryUGgMt7WEzMidIvcj",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "upgrade-insecure-requests": "1",
                "Referrer-Policy": "strict-origin-when-cross-origin"
              },
              body: "------WebKitFormBoundaryUGgMt7WEzMidIvcj\r\nContent-Disposition: form-data; name=\"ClassRoomId\"\r\n\r\n" + v8[v19.id] + "\r\n------WebKitFormBoundaryUGgMt7WEzMidIvcj\r\nContent-Disposition: form-data; name=\"availableSeats\"\r\n\r\n16\r\n------WebKitFormBoundaryUGgMt7WEzMidIvcj\r\nContent-Disposition: form-data; name=\"UnAllocatedStudentList[0].IsSelected\"\r\n\r\ntrue\r\n------WebKitFormBoundaryUGgMt7WEzMidIvcj\r\nContent-Disposition: form-data; name=\"UnAllocatedStudentList[0].Id\"\r\n\r\n" + v20[0].number + "\r\n------WebKitFormBoundaryUGgMt7WEzMidIvcj\r\nContent-Disposition: form-data; name=\"StudentIdsToAllocate\"\r\n\r\n" + v3[v20[0].number] + "\r\n------WebKitFormBoundaryUGgMt7WEzMidIvcj\r\nContent-Disposition: form-data; name=\"UnAllocatedStudentList[0].IsSelected\"\r\n\r\nfalse\r\n------WebKitFormBoundaryUGgMt7WEzMidIvcj--\r\n",
              method: "POST"
            }, {
              signal: AbortSignal.timeout(5000)
            });
            v21 = v21 + 1;
            v20.shift();
            $(".m_" + v19.id).html("تم " + v21 + ", متبقي " + v20.length);
            $(".m_" + v19.id).css("background", "lightgreen");
            v22();
          } else {
            v18();
          }
        }
        v22();
      }
      v18();
    });
  });
});