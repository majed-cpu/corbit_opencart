var teachers = [];
var teachers_ = [];
var subjects_names = {};
var ccx = true;
if ($("#corbit-modal-teachers-weeklyplan").length == 0) {
  $("body").append("\n    <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" data-target=\"#corbit-modal-teachers-weeklyplan\" onclick=\"$('#corbit-modal-teachers-weeklyplan').modal('show')\"></button>\n    <!-- Modal -->\n    <div class=\"modal fade\" id=\"corbit-modal-teachers-weeklyplan\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog\" role=\"document\">\n            <div class=\"modal-content\" style='position: relative'>\n                <div class='nloading' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                    <h1 style='\n                    margin: 0;\n                    position: absolute;\n                    top: 50%;\n                    left: 50%;\n                    color: 'red';\n                    -ms-transform: translate(-50%, -50%);\n                    transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                </div>\n                <h3 class='percenta'></h3>\n                        <br>\n                        <div class=\"progress\">\n                            <div class=\"progress-bar progress-bar-striped\" role=\"progressbar\" style=\"width: 0%\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>\n                        </div>\n                <div class='teachers-weeklyplan-iframe-here'></div>\n                <div class='week-teachers-here'></div>\n                <div class='col-12 text-center g'>\n                    <br>\n                    <button class='btn btn-lg btn-success doWeekTeachersReport'>\n                        <i class='fa fa-check-square'></i>\n                        عرض التقرير الآن\n                    </button>\n                </div>\n            </div>\n        </div>\n    </div>\n");
}
$("[data-target=\"#corbit-modal-teachers-weeklyplan\"]").click();
$(".nloading").fadeIn();
$.get("https://schools.madrasati.sa/SchoolManagment/Teachers?SchoolId=" + school_id, function (v1) {
  var v2 = $(v1).find("a:contains('الجدول')").first().attr("href");
  if (!v2) {
    v2 = $(v1).find("body > div.content > div > div > div.card-body > div.row.row-cols-1.row-cols-sm-2.row-cols-md-3.row-cols-lg-4.row-cols-xl-5.mb-sm-3 .card").first().find("a:contains('البرنامج اليومي')").attr("href");
  }
  $(".teachers-weeklyplan-iframe-here").html("<iframe id='weekIframe' frameborder='0' style='width: 100%; overflow: hidden; height: 30px; min-height: 100px;resize: vertical !important;' scrolling=\"no\" src='" + v2 + "'></iframe>");
  $("#weekIframe").on("load", function () {
    $("#weekIframe").contents().find(".fixed-top").remove();
    $("#weekIframe").contents().find(".page-header").remove();
    $("#weekIframe").contents().find("#summary-alert-div").remove();
    $("#weekIframe").contents().find(".wbs-v5").remove();
    $("#weekIframe").contents().find(".asw-menu-btn").remove();
    $("#weekIframe").contents().find(".nav-tabs-solid").first().remove();
    $("#weekIframe").contents().find(".navbar-footer").remove();
    $("#weekIframe").contents().find(".layout-2.navbar-top").css("padding-top", "0px");
    $("#weekIframe").contents().find("*").css("overflow", "hidden");
  });
}).fail(function () {
  alert("حدث خطأ في الشبكة");
  location.reload();
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
}).then(v3 => {
  return v3.json();
}).then(v4 => {
  var v5 = [];
  $(v4.html).find("tbody tr").each(function (v6) {
    if ($(this).find("td:nth-child(2)").text().trim() != "") {
      v5.push({
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
  }).then(v7 => {
    return v7.json();
  }).then(v8 => {
    $(v8.html).find("tbody tr").each(function (v9) {
      if ($(this).find("td:nth-child(2)").text().trim() != "") {
        v5.push({
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
    }).then(v10 => {
      return v10.json();
    }).then(v11 => {
      $(v11.html).find("tbody tr").each(function (v12) {
        if ($(this).find("td:nth-child(2)").text().trim() != "") {
          v5.push({
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
      }).then(v13 => {
        return v13.json();
      }).then(v14 => {
        $(v14.html).find("tbody tr").each(function (v15) {
          if ($(this).find("td:nth-child(2)").text().trim() != "") {
            v5.push({
              name: $(this).find("td:nth-child(2)").text().trim(),
              phone: $(this).find("td:nth-child(4)").text().trim(),
              id: $(this).find("a").first().attr("href").split("TeacherId=")[1].split("&")[0]
            });
          }
        });
        teachers = v5;
        teachers_ = v5;
        $(".week-teachers-here").html("\n                      <div class=\"form-check\">\n                      <label class=\"form-check-label\">\n                      <input type=\"checkbox\" class=\"form-check-input allcc2\">\n                      تحديد الكل\n                      </label>\n                  </div>\n                  <br>\n                      " + teachers.map(function (v16, v17) {
          return "\n                      <label class=\"container single-select-item\" style='width: 48%; padding: 5px'>\n                          <span class=\"mt-0\">\n                              <input type=\"checkbox\" value=\"" + v16.id + "\" class='input' name=\"" + v16.name + "\" phone=\"" + v16.phone + "\">\n                              <span class=\"checkmark\"></span><i class='fa fa-user'></i> &nbsp; " + v16.name + "</span>\n                      </label>\n                      ";
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
  $(".modal").animate({
    scrollTop: 0
  }, 0);
  var v18 = 0;
  if ($("#corbit-modal-teachers-weeklyplan .week-teachers-here .input:checked").length == 0) {
    alert("يجب إختيار معلم واحد على الأقل.");
  } else {
    $(".nloading").fadeIn("slow");
    $("#week-teachers-here .input").attr("disabled", "disabled");
    var v19 = {};
    var v20 = [];
    var v21 = $("#weekIframe").contents().find("#_hndCurrentDate").val();
    var v22 = "";
    var v23 = [];
    $("#corbit-modal-teachers-weeklyplan .input:checked").each(function () {
      v23.push($(this).val());
    });
    var v24 = {};
    var v25 = [];
    async function v26(v28) {
      if (v28[0]) {
        var v29 = v28[0].id;
        var v30 = await fetch("https://schools.madrasati.sa/SchoolManagment/Teachers/GetTeacherCourses?schoolId=" + school_id + "&teacherId=" + v29 + "&page=1", {
          headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9,ar;q=0.8,ar-EG;q=0.7",
            priority: "u=1, i",
            requestverificationtoken: $("#csrfid").val(),
            "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          body: null,
          method: "POST"
        });
        v30 = await v30.json();
        $(v30.html).find(".form-check").each(function () {
          if ($(this).find("input").is(":checked")) {
            subjects_names[$(this).find("input").attr("onclick").split(",'")[2].split("'")[0]] = $(this).parent().parent().find("h5").text().split("-")[$(this).parent().parent().find("h5").text().split("-").length - 1].trim();
          }
        });
        v28.shift();
        if (v28.length) {
          v26(v28);
        } else {
          v27();
        }
      }
    }
    v26(JSON.parse(JSON.stringify(teachers_)));
    function v27() {
      if (v23.length == 0) {
        $("body").append("<textarea class='save-me-to-local-storage' name='teachers-weeklyplan'>" + JSON.stringify(v19) + "</textarea>");
        var v31 = setInterval(() => {
          if (!$(".save-me-to-local-storage").length) {
            clearInterval(v31);
            $("body").append("<textarea class='save-me-to-local-storage' name='teachers'>" + JSON.stringify(teachers_) + "</textarea>");
            var v37 = setInterval(() => {
              if (!$(".save-me-to-local-storage").length) {
                clearInterval(v37);
                var v38 = {};
                $("#alee").html("جاري الاستعلام عن الحصص...");
                async function v39() {
                  if (v25.length == 0) {
                    setTimeout(function () {
                      $("body").append("<textarea class='save-me-to-local-storage' name='teachers-weeklyplan-subjects'>" + JSON.stringify(subjects_names) + "</textarea>");
                      var v43 = setInterval(() => {
                        if (!$(".save-me-to-local-storage").length) {
                          clearInterval(v43);
                          setTimeout(function () {
                            $("body").append("<textarea class='save-me-to-local-storage' name='teachers-weeklyplan-goals'>" + JSON.stringify(v38) + "</textarea>");
                            var v44 = setInterval(() => {
                              if (!$(".save-me-to-local-storage").length) {
                                clearInterval(v44);
                                if (ccx) {
                                  window.open(corbit_report_url("teachers-weeklyplan") + "&school_id=" + school_id + "&date=" + v22 + "&school_name=" + localStorage.getItem("school_name") + "&admin_name=" + localStorage.getItem("admin_name"));
                                  ccx = false;
                                }
                                setTimeout(() => {
                                  $(".modal-content").html("\n                                                        <center>\n                                                        <div class='alert alert-warning text-center'>\n                                                            <a class='btn btn-success btn-lg' target='_blank' href='" + corbit_report_url("teachers-weeklyplan") + "&school_id=" + school_id + "&date=" + v22 + "&school_name=" + localStorage.getItem("school_name") + "&admin_name=" + localStorage.getItem("admin_name") + "'>عرض التقرير الان</a>\n                                                        <br><br>\n                                                            <button class='btn btn-primary' onclick='location.reload()'>تحديث الصفحة الان</button>\n                                                        </div>\n                                                        </center>\n                                                        ");
                                  setTimeout(function () {
                                    if (online) {
                                      location.reload();
                                    }
                                  }, 20000);
                                }, 2000);
                              }
                            });
                          }, 500);
                        }
                      });
                    }, 500);
                  } else {
                    var v40 = v25[0];
                    var v41 = await fetch("https://schools.madrasati.sa/Teacher/LectureTools/GetLessonPlayerForComponent", {
                      headers: {
                        accept: "text/html, */*; q=0.01",
                        "accept-language": "ar,en-US;q=0.9,en;q=0.8",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                        priority: "u=1, i",
                        requestverificationtoken: $("#csrfid").val(),
                        "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"macOS\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest"
                      },
                      referrerPolicy: "strict-origin-when-cross-origin",
                      body: v40.request,
                      method: "POST",
                      mode: "cors",
                      credentials: "include"
                    });
                    v41 = await v41.text();
                    var v42 = "";
                    v40.goals.forEach(function (v45) {
                      v42 = v42 + v41?.split("for=\"goal_" + v45 + "\">")[1]?.split("</")[0] + "<br>";
                    });
                    v38[v40.id] = {
                      goals: encodeURIComponent(v42),
                      url: $("<div>" + v41 + "</div>").find("#hdnHtmppathVal").val(),
                      videos: v41?.split("\"LinkOrPath\":\"https://www.youtube.com/embed/").filter(function (v46) {
                        if (v46.split("\"")[0].includes("<")) {
                          return false;
                        } else {
                          return v46;
                        }
                      }).map(function (v47) {
                        return v47.split("\"")[0];
                      })
                    };
                    v25.shift();
                    v39();
                  }
                }
                v39();
              }
            });
          }
        });
        return true;
      }
      var v32 = v23[0];
      v19[v32] = {
        total_lessons: 0,
        days: [],
        lessons: {}
      };
      var v33 = 0;
      var v34 = 0;
      var v35 = 0;
      v24[v32] = setTimeout(() => {
        v34 = 999999;
        v27();
      }, 120000);
      for (var v36 = 0; v36 <= 4; v36++) {
        v33 = v33 + 1;
        fetch("https://schools.madrasati.sa/SchoolManagment/Lessons/GetCal", {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9,ar;q=0.8,ar-EG;q=0.7",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            priority: "u=1, i",
            requestverificationtoken: $("#csrfid").val(),
            "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          body: "Date=" + encodeURI($("#weekIframe").contents().find("#_hndCurrentDate").val()) + "&index=" + v36 + "&SchoolId=" + school_id + "&TechearId=" + v32,
          method: "POST"
        }).then(v48 => {
          return v48.json();
        }).then(v49 => {
          v34 = v34 + 1;
          v19[v32].total_lessons = v19[v32].total_lessons + v49.TimeTable.length;
          v49.TimeTable.forEach(function (v50) {
            v19[v32].days.push(v50);
            v33 = v33 + 1;
            function v51(v52, v53) {
              v50.Data = v52;
              v32 = v53;
              $.get("https://schools.madrasati.sa/Teacher/Lessons/viewLectureDetails?Data=" + v50.Data).then(function (v54) {
                v34 = v34 + 1;
                if (v54.includes("يس لديك صلاحية لإتمام العملي") || v50.PresenterUrl == null && !v50.LessonType || v50.PresenterUrl == "" && !v50.LessonType) {
                  v19[v32].lessons[v50.Data] = {
                    notcreated: true
                  };
                } else {
                  if (v54.split(",\"goalsIds\":[")[1]) {
                    var v55 = v54.split(",\"goalsIds\":[")[1].split("]")[0].split(",").map(function (v57) {
                      return "&LessonGoalsAndActivity%5B0%5D%5BgoalsIds%5D%5B%5D=1318&LessonGoalsAndActivity%5B0%5D%5BgoalsIds%5D%5B%5D=" + v57;
                    }).join("");
                  } else {
                    var v55 = "";
                  }
                  if (v54.split("\"activityIds\":[")[1]) {
                    var v56 = v54.split("\"activityIds\":[")[1].split("]")[0].split(",").map(function (v58) {
                      return "&LessonGoalsAndActivity%5B0%5D%5BactivityIds%5D%5B%5D=" + v58;
                    }).join("");
                  } else {
                    var v56 = "";
                  }
                  v25.push({
                    request: "LectureClassId=" + $(v54).text().split("lessonIds = [{\"Id\":")[1].split(",")[0] + "&CopyMode=False&lessonId=" + $(v54).text().split("lessonIds = [{\"Id\":")[1].split(",")[0] + "&LessonGoalsAndActivity%5B0%5D%5BlesssonId%5D=" + $(v54).text().split("lessonIds = [{\"Id\":")[1].split(",")[0] + "&LessonGoalsAndActivity%5B0%5D%5BgoalsIds%5D%5B%5D=" + v55 + v56,
                    goals: $(v54).text().split(",\"goalsIds\":[")[1] ? v54.split(",\"goalsIds\":[")[1].split("]")[0].split(",").map(function (v59) {
                      return "" + v59;
                    }) : [],
                    id: $(v54).text().split("lessonIds = [{\"Id\":")[1].split(",")[0]
                  });
                  v19[v32].lessons[v50.Data] = {
                    ethrat: $(v54).find(".titlesection2:contains('إثراءات')").parent().parent().find(".bgframcard").length,
                    homeworks_html: $(v54).find("h6:contains('واجبات')")?.parent().next().find(".card").first().text()?.split("الإجابات")[0],
                    homeworks: $(v54).find("h6:contains('واجبات')")?.parent().next().find(".card").length,
                    exams: $(v54).find(".titlesection2:contains('اختبارات')").parent().parent().find(".bgframcard").length,
                    id: $(v54).text().split("lessonIds = [{\"Id\":")[1].split(",")[0]
                  };
                }
                $(".progress-bar-striped").attr("style", "width: " + (v34 / v33 * 100).toFixed(0) + "%");
                $(".progress-bar-striped").attr("aria-valuenow", "" + (v34 / v33 * 100).toFixed(0));
                $(".percenta").html("تم التحميل " + (v34 / v33 * 100).toFixed(0) + "%<br><br><span id='alee' class='text-center text-danger'></span>");
                $("#alee").html("متبقي " + v23.length + " معلم...");
                if (v34 >= v33) {
                  clearTimeout(v24[v32]);
                  v22 = $("#weekIframe").contents().find("#datehij").html();
                  $(".progress-bar-striped").attr("style", "width: 0%");
                  $(".progress-bar-striped").attr("aria-valuenow", "0");
                  v23.shift();
                  $("#ttc" + v32).addClass("bg-success");
                  setTimeout(() => {
                    v27();
                  }, 500);
                }
              }).fail(function () {
                v19[v32].lessons[v50.Data] = {
                  notcreated: true
                };
                v34 = v34 + 1;
                v35 = v35 + 1;
                if (v34 >= v33) {
                  clearTimeout(v24[v32]);
                  v22 = $("#weekIframe").contents().find("#datehij").html();
                  $(".progress-bar-striped").attr("style", "width: 0%");
                  $(".progress-bar-striped").attr("aria-valuenow", "0");
                  v23.shift();
                  $("#ttc" + v32).addClass("bg-success");
                  setTimeout(() => {
                    v27();
                  }, 500);
                }
              });
            }
            v51(v50.Data, v32);
          });
          if (v49.TimeTable.length == 0) {
            if (v34 >= v33) {
              clearTimeout(v24[v32]);
              v22 = $("#weekIframe").contents().find("#datehij").html();
              $(".progress-bar-striped").attr("style", "width: 0%");
              $(".progress-bar-striped").attr("aria-valuenow", "0");
              v23.shift();
              $("#ttc" + v32).addClass("bg-success");
              setTimeout(() => {
                v27();
              }, 500);
            }
          }
        }).catch(v60 => {
          v35 = v35 + 1;
        });
      }
    }
  }
});