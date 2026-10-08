var studentsx = [];
function lllx() {
  var v1 = 1;
  var v2 = [];
  var v3 = 0;
  alert("<center>\n<h2>جاري الاستعلام...</h2>\nربما يستغرق دقائق.\n<h1 id='rr'></h1>\n</center>");
  $(".bootbox-accept").fadeOut();
  function v4(v8, v9) {
    if (v8.length === 0) {
      return v9.length;
    }
    if (v9.length === 0) {
      return v8.length;
    }
    var v10 = [];
    var v11;
    for (v11 = 0; v11 <= v9.length; v11++) {
      v10[v11] = [v11];
    }
    var v12;
    for (v12 = 0; v12 <= v8.length; v12++) {
      v10[0][v12] = v12;
    }
    for (v11 = 1; v11 <= v9.length; v11++) {
      for (v12 = 1; v12 <= v8.length; v12++) {
        if (v9.charAt(v11 - 1) == v8.charAt(v12 - 1)) {
          v10[v11][v12] = v10[v11 - 1][v12 - 1];
        } else {
          v10[v11][v12] = Math.min(v10[v11 - 1][v12 - 1] + 1, Math.min(v10[v11][v12 - 1] + 1, v10[v11 - 1][v12] + 1));
        }
      }
    }
    return 100 - v10[v9.length][v8.length] * 100 / Math.max(v8.length, v9.length);
  }
  ;
  var v5 = [];
  var v6 = "";
  function v7() {
    fetch("https://schools.madrasati.sa/SchoolManagmentReports/StudentStatistics/GetStudentReport?SchoolId=" + school_id, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,ar;q=0.8,ar-EG;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        priority: "u=1, i",
        requestverificationtoken: $("#csrfid").val(),
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      referrerPolicy: "strict-origin-when-cross-origin",
      body: "searchInput=&pageNumber=" + v1 + "&SelectedStageId=&NationalId=&semesterId=" + localStorage.getItem("semesterId"),
      method: "POST",
      mode: "cors",
      credentials: "include"
    }).then(v13 => {
      return v13.json();
    }).then(v14 => {
      total = v14.totalPages;
      $("#rr").html((v1 / total * 100).toFixed(0) + "%");
      $(v14.html).find(".col-xl-4").each(function () {
        v3 = v3 + 1;
        var v15 = true;
        $(this).find(".progress-bar").each(function () {
          if ($(this).text().trim() != "0.00 %") {
            v15 = false;
          }
        });
        if (v15) {
          var v16 = {};
          var v17 = 0;
          var v18 = false;
          var v19 = $(this).find("h4").text().trim();
          studentsx.forEach(function (v20) {
            if (!v18) {
              if (v19 == v20.uname) {
                v16 = v20;
                v18 = true;
              } else if (v4($(this).find("h4").text().trim(), v20.name) >= v17 && v20.name.split(" ")[0] == v19.split(" ")[0] && v20.name.split(" ")[v20.name.split(" ").length - 1] == v19.split(" ")[v19.split(" ").length - 1]) {
                v17 = v4($(this).find("h4").text().trim(), v20.name);
                v16 = v20;
              }
            }
          });
          if (v5.includes(v16.name) && v16.name) {
            v6 = v6 + "-" + v16.name + "<br>";
          }
          v5.push(v16.name);
          if (v16.name) {
            v2.push({
              name: $(this).find("h4").text().trim(),
              u_name: v16.uname,
              dd: v18,
              classroom: v16.classroom,
              phone: v16.student_phone
            });
          }
        }
      });
      if (v14.totalPages == v1) {
        $(".bootbox-accept").click();
        corbit_set("not_active", JSON.stringify(v2)).then(function () {
          alert("<center><h4>تم تجهيز التقرير<br>\n                        <strong class='text-danger'>" + v2.length + " غير مفعل من اصل " + studentsx.length + " طالب</strong></h4>\n                        <div id='rre'></div>\n                        <br><a href='" + corbit_report_url("not-active") + "&school_id=" + school_id + "' target='_blank' class='btn btn-success'>عرض التقرير الآن</a>\n                        </center>");
          $(".bootbox-accept").fadeOut();
          if (v6 && v6 != "") {
            $("#rre").html("<hr><h1 class='text-danger'>هناك تشابه اسماء، برجاء اعادة تحديث بيانات الطلاب من مدرستي للأداة</h1><small>" + v6 + "</small>\n                                 <a href='/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/import-students-from-madrasati' onclick='setTimeout(function(){ location.reload()}, 2000)' class='btn btn-primary'>لتحديث بيانات الطلاب من مدرستي اضغط هنا</a>\n                                <hr>");
          }
        });
      } else {
        v1 = v1 + 1;
        v7();
      }
    });
  }
  v7();
}
if ($("#corbit-modal-ghiab-students-manual").length == 0) {
  $("body").append("\n    <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-ghiab-students-manual').modal('show')\" data-target=\"#corbit-modal-ghiab-students-manual\"></button>\n    <!-- Modal -->\n    <div class=\"modal fade\" id=\"corbit-modal-ghiab-students-manual\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class='select-students-type-here row'>جاري التحميل...</div>\n        </div>\n    </div>\n");
}
$("[data-target=\"#corbit-modal-ghiab-students-manual\"]").click();
$("body").append("<textarea class='get-local-storage' name='m_students_" + school_id + "'></textarea>");
var i1 = setInterval(function () {
  if ($(".get-local-storage-value[name='m_students_" + school_id + "']").length) {
    clearInterval(i1);
    $(".select-students-type-here").html("\n        <div class='col-12 text-center g'>\n            <h4>\n                اختر الطلاب المراد التعامل معهم:\n            </h4>\n        </div>\n        <div class=\"col-12 g\" style='padding: 10px' students-type='m'>\n            <div class='card card-body item text-center'>\n                <h3 class='text-success'>\n                    الطلاب من مدرستي (<span class='madrasati_status'></span>)\n                </h3>\n            </div>\n        </div>\n        <br><br>\n        <a href='/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/import-students-from-madrasati' onclick='setTimeout(function(){ location.reload()}, 2000)' class='btn btn-primary'>لاستيراد / تحديث بيانات الطلاب من مدرستي اضغط هنا</a>\n        ");
    if ($("[name='m_students_" + school_id + "']").val() == "undefined") {
      $(".madrasati_status").html("<strong class='text-danger'><i class='fa fa-times'></i> لم يتم استيراد بيانات الطلاب</strong>");
    } else {
      var v21 = $("[name='m_students_" + school_id + "']").val();
      $(".madrasati_status").html("<strong class='text-success'><i class='fa fa-check'></i> تم استيراد بيانات " + JSON.parse(v21).length + " طالب</strong>");
      studentsx = JSON.parse($("[name='m_students_" + school_id + "']").val());
    }
    $("[students-type]").click(function () {
      if (studentsx.length) {
        $("#corbit-modal-ghiab-students-manual").modal("hide");
        lllx();
      }
    });
  }
});