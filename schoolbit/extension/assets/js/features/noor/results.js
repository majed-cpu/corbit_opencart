$("#ctl00_PlaceHolderMain_ibtnBack").parent().parent().append("\n    <li>\n    <button type='button' class='btn btn-sm btn-primary btn-lg' style='border-radius: 0px;' onclick='doResults()'>\n        <i class='fa fa-pie-chart' style='display: none'></i>\n        <i class='fas fa-chart-pie text-info' style='font-size:20px'></i>\n        تحليل الشهادات <br><small>بواسطة <img src='" + window.CORBIT_EXT_BASE + "assets/img/icon48.png' width='16'> سكول بت</small>\n    </button>\n    </li>\n    ");
var students_arr = [];
function sendDataxx(v1, v2) {
  // كانت هذه الميزة ترفع ملف النتائج إلى خادم كوربت القديم ليعالجه؛ الخادم أُزيل
  // ولا يمكن تنفيذ المعالجة محلياً، فنُعلم المستخدم بدل رسالة "حدث خطأ".
  alert("<div class='alert alert-warning text-center'><h4>ميزة معالجة النتائج غير متاحة حالياً</h4>كانت تعتمد على معالجة في خادم كوربت القديم. استخدم أزرار التصدير (Excel / PDF) في أعلى التقرير.<br><br>الدعم الفني: 920006900</div>");
  $("#LoadingAdd").hide();
  $("#msgWait").hide();
  return;
  var v3 = new FormData();
  v3.append("school_id", school_id);
  v3.append("file", v2);
  return $.ajax({
    type: "POST",
    url: corbit_api_backend + "/api/fast/upload-tmp-files",
    data: v3,
    processData: false,
    contentType: false,
    beforeSend: function () {
      $("#LoadingAdd").show();
      $("#msgWait").show();
      $(".footerAddData").css({
        "pointer-events": "none",
        opacity: "0.4"
      });
      $("#msgbox").html("");
    },
    success: function (v4) {
      if (v4.status != 100) {
        $(".close-loadingt").fadeIn("slow");
        $(".tahdirmodalbody").html("\n                        <div class='alert alert-danger text-center'>\n                            <h4>" + (v4.response ?? "حدث خطأ") + "</h4>\n                        </div>\n                    ");
      } else {
        var v5 = v4.response;
        $.ajax({
          url: corbit_api_backend + "/api/fast/fast-process-status",
          method: "POST",
          data: {
            process_id: v4.process_id,
            school_id: school_id
          },
          xhrFields: {
            onprogress: function (v6) {
              var v7 = v6.currentTarget.responseText;
              try {
                if (v7.split("\n")[v7.split("\n").length - 1]?.includes("{")) {
                  $("#fast").html(JSON.parse(v7.split("\n")[v7.split("\n").length - 1]).response + "<br><br><div id='ai_percent'></div>");
                  $("#ai_percent").html(" <div class=\"progress\" v-if=\"loading\" style=\"height: 20px; max-width: 300px; margin: 0px auto; border-radius: 5px !important\">\n                                            <div class=\"progress-bar progress-bar-striped progress-bar-animated\" role=\"progressbar\" style=\"width: " + JSON.parse(v7.split("\n")[v7.split("\n").length - 1]).percent + "%; border-radius: 5px !important\" :aria-valuenow=\"" + JSON.parse(v7.split("\n")[v7.split("\n").length - 1]).percent + "\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>\n                                        </div>");
                }
              } catch (v8) {}
            }
          },
          success: function (v9) {},
          error: function (v10, v11, v12) {
            console.error("Error:", v12);
          }
        });
        $.post(corbit_api_backend + "/api/fast/process", {
          school_id: school_id,
          file: v5?.split("tmp/")[1],
          process_id: v4.process_id,
          two: false,
          id: true,
          title: "من نظام نور " + new Date().toISOString().split("T")[0],
          nonumber: students_arr.length ? true : false,
          students_arr: JSON.stringify(students_arr.map(function (v13) {
            if (v13.page != 0 && v13.page != "0") {
              return v13;
            } else {
              return false;
            }
          }).filter(function (v14) {
            if (v14) {
              return true;
            } else {
              return false;
            }
          }))
        }).then(function (v15) {
          if (v15.status != 100) {
            $(".close-loadingt").fadeIn("slow");
            $(".tahdirmodalbody").html("\n                                <div class='alert alert-danger text-center'>\n                                    <h4>" + (v15.response ?? "حدث خطأ") + "</h4>\n                                </div>\n                            ");
          } else {
            $(".close-loadingt").fadeIn("slow");
            $(".tahdirmodalbody").html("\n                                <div class='alert alert-success text-center'>\n                                    <h4>\n                                    تم تحليل الشهادات بنجاح!\n                                    </h4>\n                                    <br>\n                                    <a class='btn btn-lg btn-success' target='_blank' href='" + corbit_api_frontend + "/reports/fast?process_id=" + v15.response + "&school_id=" + school_id + "'>\n                                        <i class='fa fa-external-link'></i>\n                                        اضغط هنا لعرض نتيجة التحليل\n                                    </a>\n                                </div>\n                            ");
          }
        }).fail(function () {
          $(".close-loadingt").fadeIn("slow");
          $(".tahdirmodalbody").html("\n                            <div class='alert alert-danger text-center'>\n                                <h4>حدث خطأ</h4>\n                            </div>\n                        ");
          alert("حدث خطأ", 200);
        });
      }
    },
    error: function (v16) {
      alert("حدث خطأ");
      $("#LoadingAdd").hide();
      $("#msgWait").hide();
      $(".footerAddData").css({
        "pointer-events": "auto",
        opacity: "1.0"
      });
      $(".close-loadingt").click();
    },
    timeout: 600000
  });
}
function xx() {
  $("body").append("\n        <!-- Button trigger modal -->\n        <button type=\"button\" style='display: none;' class=\"btn btn-primary btn-lg modelIdcxbtnloadtahdir loadtahdir\" data-toggle=\"modal\" data-target=\"#modelIdcxbtnloadtahdirx\">\n        Launch\n        </button>\n        <!-- Modal -->\n        <div class=\"modal fade\" id=\"modelIdcxbtnloadtahdirx\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\" data-backdrop=\"static\" data-keyboard=\"false\">\n            <div class=\"modal-dialog StandardFont\" role=\"document\" data-backdrop=\"static\" data-keyboard=\"false\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <h5 class=\"modal-title\">\n                        &nbsp;&nbsp;\n                        سكول بت\n                        <button type=\"button\" class=\"close close-loadingt btn-sm btn-danger\" data-dismiss=\"modal\" aria-label=\"Close\" style='display:none; color: darkred !important'>\n                            <span aria-hidden=\"true text-danger\" style='color: darkred !important'>&times; اغلاق النافذة</span>\n                        </button></h5>\n                    </div>\n                    <div class=\"modal-body tahdirmodalbody\">\n                        <div class='col-12 text-center'>\n                        <h2 id='fast'>\n                            <img src='data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIBACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOw==' style='width: 200px;'>\n                            <br>\n                            جاري التحميل...\n                        </h2>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ");
  $(".modelIdcxbtnloadtahdir").click();
  var v17 = $("#ctl00_PlaceHolderMain_ddlSemester option:selected").text();
  var v18 = $("#ctl00_PlaceHolderMain_ddlClass option:selected").text();
  var v19 = $("#ctl00_PlaceHolderMain_ddlSection option:selected").text();
  var v20 = $("#ctl00_PlaceHolderMain_ddlPeriodEnter option:selected").text();
  var v21 = $("#ctl00_lblPageTitle").text();
  var v22 = $("#VisibleReportContentctl00_PlaceHolderMain_rv" + load_results + "_ctl13").find("div")[0];
  var v23 = "";
  if ($(v22).attr("id").indexOf("_oReportDiv") >= 0) {
    v23 = "https://noor.moe.gov.sa/Noor/Reserved.ReportViewerWebControl.axd?Culture=11265&CultureOverrides=True&UICulture=11265&UICultureOverrides=True&ReportStack=1&ControlID=" + $(v22).attr("id").substring(1, 33) + "&Mode=true&OpType=Export&FileName=" + load_results + "&ContentDisposition=OnlyHtmlInline&Format=PDF";
  } else {
    alert("خطأ 1");
    return false;
  }
  if (v23 != "") {
    $("#msgbox").html("");
    $("#LoadingAdd").show();
    $("#msgWait").show();
    $(".footerAddData").css({
      "pointer-events": "none",
      opacity: "0.4"
    });
    $("#msgbox").html("");
    $(".mainmsg").remove();
    Promise.all([fetch(v23).then(function (v24) {
      return v24.blob();
    })]).then(function (v25) {
      resp1 = v25[0];
      v25 = {};
      v25.semester = v17;
      v25.clss = v18;
      v25.section = v19;
      v25.certname = v20;
      v25.pagename = v21;
      v25.certtype = 1;
      sendDataxx(v25, resp1).then(function (v26) {});
    }).catch(function (v27) {
      $("#LoadingAdd").hide();
      $("#msgWait").hide();
      $(".footerAddData").css({
        "pointer-events": "auto",
        opacity: "1.0"
      });
    });
  } else {
    alert("حدث خطأ 2");
    return false;
  }
}
function doResults() {
  if ($("#cv").length) {
    location.reload();
    return;
  } else {
    $("body").append("<input id='cv' type='hidden'>");
  }
  if (!school_id) {
    school_id = "noor_" + $("body").html().split("var sIdentificationID = data.d;                            if ('")[1].split("'")[0];
  }
  if ($("#ctl00_PlaceHolderMain_rv" + load_results + "_fixedTable").length) {
    xx();
  } else {
    alert("قم بعرض الشهادات في الصفحة اولاً٫ اضغط زر عرض.");
  }
}