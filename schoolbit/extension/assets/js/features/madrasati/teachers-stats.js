var teachers = [];
var teachers_ = [];
if ($("#corbit-modal-teachers-week").length == 0) {
  $("body").append("\n    <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" data-target=\"#corbit-modal-teachers-week\" onclick=\"$('#corbit-modal-teachers-week').modal('show')\"></button>\n    <!-- Modal -->\n    <div class=\"modal fade\" id=\"corbit-modal-teachers-week\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog\" role=\"document\">\n            <div class=\"modal-content\" style='position: relative'>\n                <div class='nloading' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                    <img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' width='300' style='\n                    margin: 0;\n                    position: absolute;\n                    top: 50%;\n                    left: 50%;\n                    -ms-transform: translate(-50%, -50%);\n                    transform: translate(-50%, -50%);'>\n                </div>\n                <h3 class='percenta'></h3>\n                        <br>\n                        <div class=\"progress\">\n                            <div class=\"progress-bar progress-bar-striped\" role=\"progressbar\" style=\"width: 0%\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>\n                        </div>\n                <div class='teachers-week-iframe-here'></div>\n                <div class='week-teachers-here'></div>\n                <div class='col-12 text-center g'>\n                    <br>\n                    <button class='btn btn-lg btn-success doWeekTeachersReport'>\n                        <i class='fa fa-check-square'></i>\n                        عرض التقرير الآن\n                    </button>\n                </div>\n            </div>\n        </div>\n    </div>\n");
}
$("[data-target=\"#corbit-modal-teachers-week\"]").click();
$(".nloading").fadeIn();
$.get("https://schools.madrasati.sa/SchoolManagment/Teachers?SchoolId=" + school_id, function (v1) {
  var v2 = $(v1).find(".col-xl-3.mb-3").first().find("a:contains('الجدول')").attr("href");
  if (!v2) {
    v2 = $(v1).find(".col-xl-3.mb-3").first().find("a:contains('البرنامج اليومي')").attr("href");
  }
  $(".teachers-week-iframe-here").html("<iframe id='weekIframe' frameborder='0' style='width: 100%; overflow: hidden; height: 30px !important; min-height: 100px;' scrolling=\"no\" src='" + v2 + "'></iframe>");
  $("#weekIframe").on("load", function () {
    var v3 = setInterval(function () {
      if ($("#weekIframe").contents().find(".navbar").is(":visible")) {
        clearInterval(v3);
        $("#weekIframe").contents().find(".fixed-top").remove();
        $("#weekIframe").contents().find(".page-header").remove();
        $("#weekIframe").contents().find("#summary-alert-div").remove();
        $("#weekIframe").contents().find(".wbs-v5").remove();
        $("#weekIframe").contents().find(".asw-menu-btn").remove();
        $("#weekIframe").contents().find(".nav-tabs-solid").first().remove();
        $("#weekIframe").contents().find(".navbar-footer").remove();
        $("#weekIframe").contents().find(".layout-2.navbar-top").css("padding-top", "0px");
        $("#weekIframe").contents().find("*").css("overflow", "hidden");
      }
    }, 100);
  });
}).fail(function () {
  alert("حدث خطأ في الشبكة");
});
fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
  headers: {
    accept: "*/*",
    "accept-language": "ar,en-US;q=0.9,en;q=0.8",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    priority: "u=1, i",
    requestverificationtoken: $("#csrfid").val(),
    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  referrer: "https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/EducationalReports?SchoolId=" + school_id,
  referrerPolicy: "strict-origin-when-cross-origin",
  body: "semesterId=" + semesterId + "&searchInput=&pageNumber=1&treeId=-1&source=1",
  method: "POST",
  mode: "cors",
  credentials: "include"
}).then(v4 => {
  return v4.json();
}).then(v5 => {
  var v6 = [];
  $(v5.html).find("tbody tr").each(function (v7) {
    if ($(this).find("td:nth-child(2)").text().trim() != "") {
      v6.push({
        name: $(this).find("td:nth-child(2)").text().trim(),
        phone: $(this).find("td:nth-child(4)").text().trim(),
        id: $(this).find("a").first().attr("href").split("TeacherId=")[1].split("&")[0]
      });
    }
  });
  fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
    headers: {
      accept: "*/*",
      "accept-language": "ar,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      priority: "u=1, i",
      requestverificationtoken: $("#csrfid").val(),
      "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest"
    },
    referrer: "https://schools.madrasati.sa/TeacherDetailsReport/EducationalReports?SchoolId=" + school_id,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "semesterId=" + semesterId + "&searchInput=&pageNumber=2&treeId=-1&source=1",
    method: "POST",
    mode: "cors",
    credentials: "include"
  }).then(v8 => {
    return v8.json();
  }).then(v9 => {
    $(v9.html).find("tbody tr").each(function (v10) {
      if ($(this).find("td:nth-child(2)").text().trim() != "") {
        v6.push({
          name: $(this).find("td:nth-child(2)").text().trim(),
          phone: $(this).find("td:nth-child(4)").text().trim(),
          id: $(this).find("a").first().attr("href").split("TeacherId=")[1].split("&")[0]
        });
      }
    });
    fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
      headers: {
        accept: "*/*",
        "accept-language": "ar,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        priority: "u=1, i",
        requestverificationtoken: $("#csrfid").val(),
        "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      referrer: "https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/EducationalReports?SchoolId=" + school_id,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: "semesterId=" + semesterId + "&searchInput=&pageNumber=3&treeId=-1&source=1",
      method: "POST",
      mode: "cors",
      credentials: "include"
    }).then(v11 => {
      return v11.json();
    }).then(v12 => {
      $(v12.html).find("tbody tr").each(function (v13) {
        if ($(this).find("td:nth-child(2)").text().trim() != "") {
          v6.push({
            name: $(this).find("td:nth-child(2)").text().trim(),
            phone: $(this).find("td:nth-child(4)").text().trim(),
            id: $(this).find("a").first().attr("href").split("TeacherId=")[1].split("&")[0]
          });
        }
      });
      fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
        headers: {
          accept: "*/*",
          "accept-language": "ar,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          priority: "u=1, i",
          requestverificationtoken: $("#csrfid").val(),
          "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        referrer: "https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/EducationalReports?SchoolId=" + school_id,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "semesterId=" + semesterId + "&searchInput=&pageNumber=4&treeId=-1&source=1",
        method: "POST",
        mode: "cors",
        credentials: "include"
      }).then(v14 => {
        return v14.json();
      }).then(v15 => {
        $(v15.html).find("tbody tr").each(function (v16) {
          if ($(this).find("td:nth-child(2)").text().trim() != "") {
            v6.push({
              name: $(this).find("td:nth-child(2)").text().trim(),
              phone: $(this).find("td:nth-child(4)").text().trim(),
              id: $(this).find("a").first().attr("href").split("TeacherId=")[1].split("&")[0]
            });
          }
        });
        teachers = v6;
        teachers_ = v6;
        $(".week-teachers-here").html("\n                      <div class=\"form-check\">\n                      <label class=\"form-check-label\">\n                      <input type=\"checkbox\" class=\"form-check-input allcc2\">\n                      تحديد الكل\n                      </label>\n                  </div>\n                  <br>\n                      " + teachers.map(function (v17, v18) {
          return "\n                      <label class=\"container single-select-item\" style='width: 48%; padding: 5px'>\n                          <span class=\"mt-0\">\n                              <input type=\"checkbox\" value=\"" + v17.id + "\" class='input' name=\"" + v17.name + "\" phone=\"" + v17.phone + "\">\n                              <span class=\"checkmark\"></span><i class='fa fa-user'></i> &nbsp; " + v17.name + "</span>\n                      </label>\n                      ";
        }));
        $(".allcc2").click(function () {
          $(".single-select-item").each(function () {
            $(this).find("input").click();
          });
        });
        $(".nloading").fadeOut();
      });
    });
  });
});
$(".doWeekTeachersReport").click(function () {
  var v19 = 0;
  if ($("#corbit-modal-teachers-week .week-teachers-here .input:checked").length == 0) {
    alert("يجب إختيار معلم واحد على الأقل.");
  } else {
    $(".nloading").fadeIn("slow");
    $("#week-teachers-here .input").attr("disabled", "disabled");
    var v20 = {};
    var v21 = [];
    var v22 = $("#weekIframe").contents().find("#_hndCurrentDate").val();
    var v23 = "";
    var v24 = [];
    $("#corbit-modal-teachers-week .input:checked").each(function () {
      v24.push($(this).val());
    });
    var v25 = {};
    v26();
    function v26() {
      if (v24.length == 0) {
        $("body").append("<textarea class='save-me-to-local-storage' name='teachers-week'>" + JSON.stringify(v20) + "</textarea>");
        var v27 = setInterval(() => {
          if (!$(".save-me-to-local-storage").length) {
            clearInterval(v27);
            $("body").append("<textarea class='save-me-to-local-storage' name='teachers'>" + JSON.stringify(teachers_) + "</textarea>");
            var v33 = setInterval(() => {
              if (!$(".save-me-to-local-storage").length) {
                clearInterval(v33);
                window.open(corbit_report_url("teachers-stats") + "&school_id=" + school_id + "&date=" + v23 + "&school_name=" + localStorage.getItem("school_name") + "&admin_name=" + localStorage.getItem("admin_name"));
                setTimeout(() => {
                  $(".modal-content").html("\n                                         <center>\n                                        <div class='alert alert-warning text-center'>\n                                            <a href='" + corbit_report_url("teachers-stats") + "&school_id=" + school_id + "&date=" + v23 + "&school_name=" + localStorage.getItem("school_name") + "&admin_name=" + localStorage.getItem("admin_name") + "' target='_blank' class='btn btn-success btn-lg'>عرض التقرير الآن</a>\n                                            <br><br>\n                                            <button class='btn btn-primary btn-sm' onclick='location.reload()'>تحديث الصفحة الان</button>\n                                        </div>\n                                        </center>\n                                        ");
                  setTimeout(function () {
                    location.reload();
                  }, 20000);
                }, 2000);
              }
            });
          }
        });
        return true;
      }
      var v28 = v24[0];
      v20[v28] = {
        total_lessons: 0,
        days: [],
        lessons: {}
      };
      var v29 = 0;
      var v30 = 0;
      var v31 = 0;
      v25[v28] = setTimeout(() => {
        v30 = 999999;
        v26();
      }, 120000);
      for (var v32 = 0; v32 <= 4; v32++) {
        v29 = v29 + 1;
        fetch("https://schools.madrasati.sa/SchoolManagment/Lessons/GetCal", {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "ar,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            priority: "u=1, i",
            requestverificationtoken: $("#csrfid").val(),
            "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "Date=" + encodeURI($("#weekIframe").contents().find("#_hndCurrentDate").val()) + "&index=" + v32 + "&SchoolId=" + school_id + "&TechearId=" + v28,
          method: "POST",
          mode: "cors",
          credentials: "include"
        }).then(v34 => {
          return v34.json();
        }).then(v35 => {
          v30 = v30 + 1;
          v20[v28].total_lessons = v20[v28].total_lessons + v35.TimeTable.length;
          v35.TimeTable.forEach(function (v36) {
            v20[v28].days.push(v36);
            v29 = v29 + 1;
            function v37(v38, v39) {
              v36.Data = v38;
              v28 = v39;
              $.get("https://schools.madrasati.sa/Teacher/Lessons/viewLectureDetails?Data=" + v36.Data).then(function (v40) {
                v30 = v30 + 1;
                if (v40.includes("يس لديك صلاحية لإتمام العملي") || v36.PresenterUrl == null && !v36.LessonType) {
                  v20[v28].lessons[v36.Data] = {
                    notcreated: true
                  };
                } else {
                  console.log($(v40).find("#divLessonPlayerContent > div > div:nth-child(1) > div > div > div:nth-child(2)")?.text()?.trim());
                  v20[v28].lessons[v36.Data] = {
                    ethrat: $(v40).find("#ActivitiesDiv .mb-3")?.length,
                    homeworks: $(v40).find("#AssignmentsDiv .mb-3")?.length,
                    exams: $(v40).find("#ExamsDiv .mb-3").length,
                    actives: $(v40).find("#ProjectsDiv .mb-3").length,
                    pre: $(v40).find("#LectureClassPreparationText").val() != "" ? 1 : 0,
                    voc: $(v40).find("#LessonVocabulary").val() != "" ? 1 : 0,
                    goals: $(v40).find("#divLessonPlayerContent > div > div:nth-child(2) > div > div > div")?.text()?.trim() != "" ? 1 : 0,
                    strat: ($(v40).find("input[id^='strategy_']:checked, input[name*='strateg']:checked").length || $(v40).find("[for^='strategy_'].active, [for^='strategy_'].checked, [for^='strategy_'].selected").length) ? 1 : 0,
                    tools: ($(v40).find("input[id^='teachingTools_']:checked, input[name*='teachingTool']:checked").length || $(v40).find("[for^='teachingTools_'].active, [for^='teachingTools_'].checked, [for^='teachingTools_'].selected").length) ? 1 : 0,
                    skills: $(v40).find("#ThinkingSkills").val() != "" ? 1 : 0,
                    close: $(v40).find("#LectureClassCloseText").val() != "" ? 1 : 0,
                    notes: $(v40).find("#TeacherNote").val() != "" ? 1 : 0
                  };
                }
                $(".progress-bar-striped").attr("style", "width: " + (v30 / v29 * 100).toFixed(0) + "%");
                $(".progress-bar-striped").attr("aria-valuenow", "" + (v30 / v29 * 100).toFixed(0));
                $(".percenta").html("تم التحميل " + (v30 / v29 * 100).toFixed(0) + "%<br><br><span id='alee' class='text-center text-danger'></span>");
                $("#alee").html("متبقي " + v24.length + " معلم...");
                if (v30 >= v29) {
                  clearTimeout(v25[v28]);
                  v23 = $("#weekIframe").contents().find("#datehij").html();
                  $(".progress-bar-striped").attr("style", "width: 0%");
                  $(".progress-bar-striped").attr("aria-valuenow", "0");
                  v24.shift();
                  $("#ttc" + v28).addClass("bg-success");
                  setTimeout(() => {
                    v26();
                  }, 500);
                }
              }).fail(function () {
                v30 = v30 + 1;
                v20[v28].lessons[v36.Data] = {
                  notcreated: true
                };
                v31 = v31 + 1;
                if (v30 >= v29) {
                  clearTimeout(v25[v28]);
                  v23 = $("#weekIframe").contents().find("#datehij").html();
                  $(".progress-bar-striped").attr("style", "width: 0%");
                  $(".progress-bar-striped").attr("aria-valuenow", "0");
                  v24.shift();
                  $("#ttc" + v28).addClass("bg-success");
                  setTimeout(() => {
                    v26();
                  }, 500);
                }
              });
            }
            v37(v36.Data, v28);
          });
          if (v35.TimeTable.length == 0) {
            if (v30 >= v29) {
              clearTimeout(v25[v28]);
              v23 = $("#weekIframe").contents().find("#datehij").html();
              $(".progress-bar-striped").attr("style", "width: 0%");
              $(".progress-bar-striped").attr("aria-valuenow", "0");
              v24.shift();
              $("#ttc" + v28).addClass("bg-success");
              setTimeout(() => {
                v26();
              }, 500);
            }
          }
        }).catch(v41 => {
          v31 = v31 + 1;
        });
      }
    }
  }
});