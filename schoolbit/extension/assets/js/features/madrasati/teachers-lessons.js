var teachers = [];
if ($("#corbit-modal-teachers-lessons").length == 0) {
  $("body").append("\n    <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-teachers-lessons').modal('show')\" data-target=\"#corbit-modal-teachers-lessons\"></button>\n    <!-- Modal -->\n    <div class=\"modal fade\" id=\"corbit-modal-teachers-lessons\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog\" role=\"document\">\n            <div class=\"modal-content g\" style='position: relative'>\n                <div class='nloading' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                    <h1 style='\n                    margin: 0;\n                    position: absolute;\n                    top: 50%;\n                    left: 50%;\n                    color: 'red';\n                    -ms-transform: translate(-50%, -50%);\n                    transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                </div>\n                <div class='teachers-lessons-iframe-here'></div>\n                <div class='lessons-teachers-here g'></div>\n                <hr>\n                <div class='col-12 g'>\n                <input type=\"checkbox\" id=\"vehicle1\" name=\"vehicle1\" value=\"Bike\">\n                <label for=\"vehicle1\"> الاستعلام عن العناصر الغير معدة في الدروس</label><br>\n                </div>\n                <div class='col-12 text-center g'>\n                    <br>\n                    <button class='btn btn-lg btn-success doLessonsTeachersReport'>\n                        <i class='fa fa-check-square'></i>\n                        عرض التقرير الآن\n                    </button>\n                </div>\n            </div>\n        </div>\n    </div>\n");
}
$("[data-target=\"#corbit-modal-teachers-lessons\"]").click();
$(".nloading").fadeIn();
$.get("https://schools.madrasati.sa/SchoolManagment/Teachers?SchoolId=" + school_id, function (v1) {
  var v2 = $(v1).find(".col-xl-3.mb-3").first().find("a:contains('الجدول')").attr("href");
  if (!v2) {
    v2 = $(v1).find(".col-xl-3.mb-3").first().find("a:contains('البرنامج اليومي')").attr("href");
  }
  $(".teachers-lessons-iframe-here").html("<iframe id='weekIframe' frameborder='0' style='width: 100%; overflow: hidden; height: 30px !important; min-height: 230px; resize: vertical !important;' scrolling=\"no\" src='" + v2 + "'></iframe>");
  $("#weekIframe").on("load", function () {
    var v3 = setInterval(function () {
      if ($("#weekIframe").contents().find(".navbar").is(":visible")) {
        clearInterval(v3);
        $("#weekIframe").contents().find(".hijriSchedule").prepend("<button class='fas fa-refresh' id='ccxcss' style='    position: absolute; top: 0; border: none'></button>");
        $("#weekIframe").contents().find("#ccxcss").click(function () {
          var v4 = $(v1).find(".col-xl-3.mb-3:nth-child(4)").find("a:contains('الجدول')").attr("href");
          if (!v4) {
            v4 = $(v1).find(".col-xl-3.mb-3:nth-child(4)").find("a:contains('البرنامج اليومي')").attr("href");
          }
          $(".teachers-lessons-iframe-here").html("<iframe id='weekIframe' frameborder='0' style='width: 100%; overflow: hidden; height: 30px !important; min-height: 230px; resize: vertical !important;' scrolling=\"no\" src='" + v4 + "'></iframe>");
          $("#weekIframe").on("load", function () {
            var v5 = setInterval(function () {
              if ($("#weekIframe").contents().find(".navbar").is(":visible")) {
                clearInterval(v5);
                $("#weekIframe").contents().find(".fixed-top").remove();
                $("#weekIframe").contents().find(".page-header").remove();
                $("#weekIframe").contents().find("#summary-alert-div").remove();
                $("#weekIframe").contents().find(".wbs-v5").remove();
                $("#weekIframe").contents().find(".asw-menu-btn").remove();
                if ($("#weekIframe").contents().find(".nav-tabs-solid.rounded-2").length) {
                  $("#weekIframe").contents().find(".nav-tabs-solid").first().remove();
                }
                $("#weekIframe").contents().find(".navbar-footer").remove();
                $("#weekIframe").contents().find(".layout-2.navbar-top").css("padding-top", "0px");
                $("#weekIframe").contents().find("*").css("overflow", "hidden");
              }
            }, 100);
          });
        });
        $("#weekIframe").contents().find(".fixed-top").remove();
        $("#weekIframe").contents().find(".page-header").remove();
        $("#weekIframe").contents().find("#summary-alert-div").remove();
        $("#weekIframe").contents().find(".wbs-v5").remove();
        $("#weekIframe").contents().find(".asw-menu-btn").remove();
        if ($("#weekIframe").contents().find(".nav-tabs-solid.rounded-2").length) {
          $("#weekIframe").contents().find(".nav-tabs-solid").first().remove();
        }
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
}).then(v6 => {
  return v6.json();
}).then(v7 => {
  var v8 = [];
  $(v7.html).find("tbody tr").each(function (v9) {
    if ($(this).find("td:nth-child(2)").text().trim() != "") {
      v8.push({
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
  }).then(v10 => {
    return v10.json();
  }).then(v11 => {
    $(v11.html).find("tbody tr").each(function (v12) {
      if ($(this).find("td:nth-child(2)").text().trim() != "") {
        v8.push({
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
    }).then(v13 => {
      return v13.json();
    }).then(v14 => {
      $(v14.html).find("tbody tr").each(function (v15) {
        if ($(this).find("td:nth-child(2)").text().trim() != "") {
          v8.push({
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
      }).then(v16 => {
        return v16.json();
      }).then(v17 => {
        $(v17.html).find("tbody tr").each(function (v18) {
          if ($(this).find("td:nth-child(2)").text().trim() != "") {
            v8.push({
              name: $(this).find("td:nth-child(2)").text().trim(),
              phone: $(this).find("td:nth-child(4)").text().trim(),
              id: $(this).find("a").first().attr("href").split("TeacherId=")[1].split("&")[0]
            });
          }
        });
        teachers = v8;
        $(".lessons-teachers-here").html("\n                    <div class=\"form-check\">\n                    <label class=\"form-check-label\">\n                    <input type=\"checkbox\" class=\"form-check-input allcc2\">\n                    تحديد الكل\n                    </label>\n                </div>\n                <br>\n                    " + teachers.map(function (v19, v20) {
          return "\n                    <label class=\"container single-select-item\" style='width: 48%; padding: 5px'>\n                        <span class=\"mt-0\">\n                            <input type=\"checkbox\" value=\"" + v19.id + "\" class='input' name=\"" + v19.name + "\" phone=\"" + v19.phone + "\">\n                            <span class=\"checkmark\"></span><i class='fa fa-user'></i> &nbsp; " + v19.name + "</span>\n                    </label>\n                    ";
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
$(".doLessonsTeachersReport").click(function () {
  $(".modal").animate({
    scrollTop: 0
  }, 0);
  var v21 = 0;
  var v22 = [];
  var v23 = {};
  if ($("#corbit-modal-teachers-lessons .lessons-teachers-here .input:checked").length == 0) {
    alert("يجب إختيار معلم واحد على الأقل.");
  } else {
    $(".nloading").fadeIn();
    $("#date").attr("readonly", "readonly");
    var v24 = [];
    function v25() {
      var v26 = $(".lessons-teachers-here .input:checked").first().val();
      var v27 = $(".lessons-teachers-here .input:checked").first().attr("name");
      var v28 = $(".lessons-teachers-here .input:checked").first().attr("phone");
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
        body: "Date=" + encodeURI($("#weekIframe").contents().find("#_hndCurrentDate").val()) + "&index=" + $("#weekIframe").contents().find(".dayIcon .active").parent().attr("dayindex") + "&SchoolId=" + school_id + "&TechearId=" + v26,
        method: "POST",
        mode: "cors",
        credentials: "include"
      }).then(v29 => {
        return v29.text();
      }).then(v30 => {
        v21 = v21 + 1;
        v24.push({
          id: v26,
          name: v27,
          phone: v28,
          data: JSON.parse(v30)
        });
        JSON.parse(v30).TimeTable.forEach(function (v32) {
          if (v32.PresenterUrl == null && !v32.LessonType) {} else {
            v22.push(v32.Data);
          }
        });
        $(".lessons-teachers-here .input:checked").first().remove();
        if ($(".lessons-teachers-here .input:checked").length) {
          v25();
        } else {
          $("body").append("<textarea class='save-me-to-local-storage' name='teachersLessonsHTML'>" + JSON.stringify(v24) + "</textarea>");
          var v31 = setInterval(() => {
            if (!$(".save-me-to-local-storage").length) {
              clearInterval(v31);
              $("body").append("<textarea class='save-me-to-local-storage' name='teachers'>" + JSON.stringify(teachers) + "</textarea>");
              var v33 = setInterval(() => {
                if (!$(".save-me-to-local-storage").length) {
                  clearInterval(v33);
                  function v34() {
                    if (!v22.length) {
                      $("body").append("<textarea class='save-me-to-local-storage' name='datas'>" + JSON.stringify(v23) + "</textarea>");
                      var v35 = setInterval(() => {
                        if (!$(".save-me-to-local-storage").length) {
                          clearInterval(v35);
                          window.open(corbit_report_url("teachers-lessons") + "&school_id=" + school_id + "&dayindex=" + $("#weekIframe").contents().find(".dayIcon .active").parent().attr("dayindex") + "&date=" + encodeURIComponent(($("#weekIframe").contents().find("#datehij").text() || "").trim()));
                          setTimeout(() => {
                            $(".modal-content").html("\n                                                        <center>\n                                                        <div class='alert alert-warning text-center'>\n                                                            <a href='" + corbit_report_url("teachers-lessons") + "&school_id=" + school_id + "&dayindex=" + $("#weekIframe").contents().find(".dayIcon .active").parent().attr("dayindex") + "&date=" + encodeURIComponent(($("#weekIframe").contents().find("#datehij").text() || "").trim()) + "' target='_blank' class='btn btn-success btn-lg'>عرض التقرير الآن</a>\n                                                            <br><br>\n                                                            <button class='btn btn-primary btn-sm' onclick='location.reload()'>تحديث الصفحة الان</button>\n                                                        </div>\n                                                        </center>\n                                                        ");
                            setTimeout(function () {
                              location.reload();
                            }, 20000);
                          }, 2000);
                        }
                      });
                    } else {
                      $.get("https://schools.madrasati.sa/Teacher/Lessons/viewLectureDetails?Data=" + v22[0]).then(function (v36) {
                        if (!v36.includes("يس لديك صلاحية لإتمام العملي")) {
                          v23[v22[0]] = {
                            ethrat: $(v36).find("#ActivitiesDiv .mb-3")?.length,
                            homeworks: $(v36).find("#AssignmentsDiv .mb-3")?.length,
                            exams: $(v36).find("#ExamsDiv .mb-3").length,
                            actives: $(v36).find("#ProjectsDiv .mb-3").length,
                            pre: $(v36).find("#LectureClassPreparationText").val() != "" ? 1 : 0,
                            voc: $(v36).find("#LessonVocabulary").val() != "" ? 1 : 0,
                            goals: $(v36).find("#divLessonPlayerContent > div > div:nth-child(2) > div > div > div")?.text()?.trim() != "" ? 1 : 0,
                            strat: ($(v36).find("input[id^='strategy_']:checked, input[name*='strateg']:checked").length || $(v36).find("[for^='strategy_'].active, [for^='strategy_'].checked, [for^='strategy_'].selected").length) ? 1 : 0,
                            tools: ($(v36).find("input[id^='teachingTools_']:checked, input[name*='teachingTool']:checked").length || $(v36).find("[for^='teachingTools_'].active, [for^='teachingTools_'].checked, [for^='teachingTools_'].selected").length) ? 1 : 0,
                            skills: $(v36).find("#ThinkingSkills").val() != "" ? 1 : 0,
                            close: $(v36).find("#LectureClassCloseText").val() != "" ? 1 : 0,
                            notes: $(v36).find("#TeacherNote").val() != "" ? 1 : 0
                          };
                        }
                        v22.shift();
                        v34();
                      }).fail(function () {
                        setTimeout(function () {
                          v34();
                        }, 1000);
                      });
                    }
                  }
                  if (!$("#vehicle1").is(":checked")) {
                    $("body").append("<textarea class='save-me-to-local-storage' name='datas'>{}</textarea>");
                    window.open(corbit_report_url("teachers-lessons") + "&school_id=" + school_id + "&dayindex=" + $("#weekIframe").contents().find(".dayIcon .active").parent().attr("dayindex") + "&date=" + encodeURIComponent(($("#weekIframe").contents().find("#datehij").text() || "").trim()));
                    setTimeout(() => {
                      $(".modal-content").html("\n                                            <center>\n                                            <div class='alert alert-warning text-center'>\n                                                \n                                                            <a href='" + corbit_report_url("teachers-lessons") + "&school_id=" + school_id + "&dayindex=" + $("#weekIframe").contents().find(".dayIcon .active").parent().attr("dayindex") + "&date=" + encodeURIComponent(($("#weekIframe").contents().find("#datehij").text() || "").trim()) + "' target='_blank' class='btn btn-success btn-lg'>عرض التقرير الآن</a>\n                                                            <br><br>\n                                                <button class='btn btn-primary btn-sm' onclick='location.reload()'>تحديث الصفحة الان</button>\n                                            </div>\n                                            </center>\n                                            ");
                      setTimeout(function () {
                        location.reload();
                      }, 20000);
                    }, 2000);
                  } else {
                    v34();
                  }
                }
              });
            }
          });
        }
      });
    }
    v25();
  }
});