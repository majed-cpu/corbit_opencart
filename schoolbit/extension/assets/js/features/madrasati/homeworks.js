undefined;
alert("\n<div class='nloadingx' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n    <img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' width='300' style='\n    margin: 0;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -ms-transform: translate(-50%, -50%);\n    transform: translate(-50%, -50%);'>\n</div>\n<style>.dnone{ display:none}</style>\n<div class='step-1'>\n<form>\n<div class=\"form-check\">\n  <input class=\"form-check-input\" type=\"radio\" name=\"type\" id=\"flexRadioDefault1\" value='homeworks'>\n  <label class=\"form-check-label\" for=\"flexRadioDefault1\">\n    تقرير الواجبات (<strong class='text-danger'>غير متاحة حالياً في مدرستي</strong>)\n  </label>\n</div>\n<div class=\"form-check\">\n  <input class=\"form-check-input\" type=\"radio\" name=\"type\" id=\"flexRadioDefault2\" value='exams'>\n  <label class=\"form-check-label\" for=\"flexRadioDefault2\">\n    تقرير الاختبارات\n  </label>\n</div>\n<div class=\"form-check\">\n  <input class=\"form-check-input\" type=\"radio\" name=\"type\" id=\"flexRadioDefault3\" value='activity'>\n  <label class=\"form-check-label\" for=\"flexRadioDefault3\">\n    تقرير الأنشطة\n  </label>\n</div>\n<div class=\"form-check\">\n  <input class=\"form-check-input\" type=\"radio\" name=\"type\" id=\"flexRadioDefault4\" value='full'>\n  <label class=\"form-check-label\" for=\"flexRadioDefault4\">\n    تقرير أداء الطلاب الشامل <span class='bg-danger text-white' style='padding: 2px 5px; border-radius: 3px; font-size: 11px'><i class='fas fa-star'></i> جديد</span>\n  </label>\n</div>\n</form>\n<div class='text-center col-12 g'>\n    <button class='btn btn-primary v__'>عرض التقرير</button>\n</div>\n</div>\n<div class='step-2 dnone'>\n<div class='col-12 table-responsive'>\n    <table class='table table-hover table-bordered tt'>\n        <thead>\n            <th>\n                العنوان\n            </th>\n            <th>\n                الاجراء\n            </th>\n        </thead>\n        <tbody class=\"homeworks-table\">\n\n        </tbody>\n    </table>\n</div>\n</div>\n");
setTimeout(() => {
  $("body > div.bootbox.modal.fade.bootbox-alert.show > div").addClass("modal-lg");
}, 500);
$(".nloadingx").fadeOut();
$("[data-bb-handler=\"ok\"]").fadeOut(0);
var arr = [];
$(".v__").click(function () {
  if ($("[name='type']:checked")?.val()) {
    if ($("[name='type']:checked")?.val() == "full") {
      $(".nloadingx").fadeIn();
      $(".step-1").fadeOut();
      $(".nloadingx").append("<p class='full-report-progress' style='position:absolute;bottom:30%;left:50%;transform:translateX(-50%);font-size:18px;font-weight:bold;color:#333;text-align:center;direction:rtl;background:#fff;padding:10px 20px;border-radius:8px;'>جاري تجميع البيانات...</p>");
      var v1 = {};
      var v2 = {
        homeworks: 0,
        activities: 0,
        exams: 0
      };
      var v3 = {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9,ar;q=0.8,ar-EG;q=0.7",
        "cache-control": "max-age=0"
      };
      async function v5(v9, v10) {
        try {
          var v11 = await fetch("https://schools.madrasati.sa/SchoolManagment/" + v9 + "/Index/" + school_id + "?SemesterId=" + semesterId + "&PageNumber=" + v10, {
            headers: v3,
            credentials: "include"
          });
          var v12 = await v11.text();
          var v13 = [];
          $(v12).find(".card-body .list-group .list-group-item").each(function () {
            var v14 = $(this).find("a:nth-child(2)").attr("href");
            if (v14) {
              v13.push(v14);
            }
          });
          return v13;
        } catch (v15) {
          return [];
        }
      }
      async function v6(v16) {
        var v17 = await fetch(v16, {
          headers: v3,
          credentials: "include"
        });
        var v18 = await v17.text();
        var v19 = [];
        $(v18).find(".card-body .list-group .list-group-item").each(function () {
          var v20 = $(this).find("h6").text().trim();
          var v21;
          if ($(this).find(".decimal").length) {
            v21 = $(this).find(".decimal").first().val();
          } else {
            v21 = $(this).find("li:contains('الدرجة:')").text().split("الدرجة:")[1]?.trim() || "";
          }
          if (v20) {
            v19.push({
              name: v20,
              degree: v21
            });
          }
        });
        return v19;
      }
      async function v7(v22) {
        var v23 = await fetch(v22, {
          headers: v3,
          credentials: "include"
        });
        var v24 = await v23.text();
        var v25 = v24.split("const param = {")[1];
        if (!v25) {
          return [];
        }
        v25 = v25.split("};")[0];
        var v26 = JSON.parse("{\"" + v25.trim().replaceAll("'", "\"").replaceAll(" ", "").replaceAll(":", "\":").replaceAll("\n", "").replaceAll(",", ",\"").replace(",\"StudentIds\":$(\"#studentsFilter\").val(),\"Status\":$(\"#Status\").val(),\"SortBy\":$(\"#SortOrder\").val()", "") + "}");
        return new Promise(function (v27) {
          $.post("/Projects/Projects/GetGradeStudentsList", v26, function (v28) {
            var v29 = [];
            $("<div>" + v28.html + "</div>").find(".card-group-vertical").each(function () {
              var v30 = $(this).find(".form-check .fs-6").text().trim();
              var v31 = $(this).find(".decimal").first().val();
              if (v31 === "" || v31 === undefined) {
                v31 = "";
              }
              if (v30) {
                v29.push({
                  name: v30,
                  degree: v31
                });
              }
            });
            v27(v29);
          }).fail(function () {
            v27([]);
          });
        });
      }
      function v8(v32, v33, v34) {
        if (!v32 || !v32.trim()) {
          return;
        }
        v32 = v32.trim();
        if (!v1[v32]) {
          v1[v32] = {
            homeworks: {
              completed: 0,
              attempted: 0,
              total: 0
            },
            exams: {
              completed: 0,
              attempted: 0,
              total: 0
            },
            activities: {
              completed: 0,
              attempted: 0,
              total: 0
            }
          };
        }
        v1[v32][v33].total++;
        var v35 = parseFloat(v34);
        if (!isNaN(v35) && v35 > 0) {
          v1[v32][v33].completed++;
          v1[v32][v33].attempted++;
        } else if (v34 !== "" && v34 !== undefined && v34 !== null && !String(v34).includes("لم")) {
          v1[v32][v33].attempted++;
        }
      }
      ;
      (async function () {
        try {
          $(".full-report-progress").text("جاري تحميل القوائم...");
          var v36 = await Promise.all([v5("Assignments", 1), v5("Assignments", 2), v5("Exams", 1), v5("Exams", 2), v5("Projects", 1), v5("Projects", 2)]);
          var v37 = [...v36[0], ...v36[1]];
          var v38 = [...v36[2], ...v36[3]];
          var v39 = [...v36[4], ...v36[5]];
          v2.homeworks = v37.length;
          v2.exams = v38.length;
          v2.activities = v39.length;
          for (var v40 = 0; v40 < v37.length; v40++) {
            $(".full-report-progress").text("جاري تحميل الواجبات... (" + (v40 + 1) + "/" + v37.length + ")");
            try {
              var v41 = await v6(v37[v40]);
              v41.forEach(function (v51) {
                v8(v51.name, "homeworks", v51.degree);
              });
            } catch (v52) {}
          }
          for (var v40 = 0; v40 < v38.length; v40++) {
            $(".full-report-progress").text("جاري تحميل الاختبارات... (" + (v40 + 1) + "/" + v38.length + ")");
            try {
              var v41 = await v6(v38[v40]);
              v41.forEach(function (v53) {
                v8(v53.name, "exams", v53.degree);
              });
            } catch (v54) {}
          }
          for (var v40 = 0; v40 < v39.length; v40++) {
            $(".full-report-progress").text("جاري تحميل الأنشطة... (" + (v40 + 1) + "/" + v39.length + ")");
            try {
              var v41 = await v7(v39[v40]);
              v41.forEach(function (v55) {
                v8(v55.name, "activities", v55.degree);
              });
            } catch (v56) {}
          }
          var v42 = [];
          for (var v43 in v1) {
            var v44 = v1[v43];
            var v45 = v44.homeworks;
            var v46 = v44.exams;
            var v47 = v44.activities;
            var v48 = v45.completed + v46.completed + v47.completed;
            var v49 = v45.attempted + v46.attempted + v47.attempted;
            var v50 = v45.total + v46.total + v47.total;
            v42.push({
              name: v43,
              homeworks: {
                completed: v45.completed,
                attempted: v45.attempted,
                total: v45.total,
                notCompleted: v45.total - v45.completed
              },
              exams: {
                completed: v46.completed,
                attempted: v46.attempted,
                total: v46.total,
                notCompleted: v46.total - v46.completed
              },
              activities: {
                completed: v47.completed,
                attempted: v47.attempted,
                total: v47.total,
                notCompleted: v47.total - v47.completed
              },
              total: {
                completed: v48,
                attempted: v49,
                total: v50,
                notCompleted: v50 - v48
              },
              percentage: v50 > 0 ? Math.round(v48 / v50 * 100) : 0
            });
          }
          $(".full-report-progress").text("جاري فتح التقرير...");
          corbit_set("fullReportData", JSON.stringify({
            counts: v2,
            students: v42
          })).then(function () {
            window.open(corbit_report_url("homeworks-full") + "&school_id=" + school_id);
            $(".nloadingx").fadeOut();
          });
        } catch (v57) {
          $(".full-report-progress").text("حدث خطأ: " + v57.message);
          setTimeout(function () {
            $(".nloadingx").fadeOut();
          }, 3000);
        }
      })();
      return;
    }
    $(".nloadingx").fadeIn();
    $(".step-1").fadeOut();
    if ($("[name='type']:checked")?.val() == "exams") {
      var v4 = "Exams";
    } else {
      var v4 = "Assignments";
    }
    if ($("[name='type']:checked")?.val() == "activity") {
      var v4 = "Projects";
    }
    fetch("https://schools.madrasati.sa/SchoolManagment/" + v4 + "/Index/" + school_id + "?SemesterId=" + semesterId + "&PageNumber=1", {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9,ar;q=0.8,ar-EG;q=0.7",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
      },
      referrer: "https://schools.madrasati.sa/SchoolManagmentReports/Statistics/ViewSubjectReports?schoolId=" + school_id,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }).then(v58 => {
      return v58.text();
    }).then(v59 => {
      $(".nloadingx").fadeOut();
      $(".step-2").fadeIn();
      $(v59).find(".card-body .list-group .list-group-item").each(function () {
        $(".homeworks-table").append("\n                    <tr>\n                        <td>\n                            <strong style='font-size: 16px; color: #039d8f;'>\n                            " + $(this).find("h6").text() + "\n                            </strong>\n                        <br>\n                        <p>" + $(this).find(".col-lg-7 > ul > li:nth-child(1) > span:nth-child(2)").text() + "</p>\n                        <small>" + ($(this).find(".col-lg-7 > ul > li:nth-child(2)").html() ? $(this).find(".col-lg-7 > ul > li:nth-child(2)").html() : $(this).find(".col-lg-5 > ul > li:nth-child(1)").html()) + ("</small>\n                        <br>\n                       <!--  الفصل: <strong class='get-classroom' url='" + $(this).find("a:nth-child(2)").attr("href") + "' id='x" + Math.random().toString().split(".")[1] + "'><span class='text-danger'>جاري الاستعلام...</span></strong>\n                         -->\n                         </td>\n                        <td class='text-center'><br>\n                            <button class='btn btn-success viewHomeworkReport' details='") + $(this).find(".col-lg-7 > ul > li:nth-child(1) > span:nth-child(2)").html() + "' title='" + $(this).find("h6").text() + "' name='" + ($(this).find(".col-lg-7 > ul > li:nth-child(2)").html() ? $(this).find(".col-lg-7 > ul > li:nth-child(2)").html() : $(this).find(".col-lg-5 > ul > li:nth-child(1)").html()) + "' url='" + $(this).find("a:nth-child(2)").attr("href") + "'>\n                                <i class='fa fa-check-square'></i>\n                                عرض التقرير\n                                <br> او ارسال تنبيه\n                            </button>\n                        </td>\n                    </tr>\n                    ");
      });
      function v60(v62, v63) {
        var v64 = v63;
        $.get(v62, function (v65) {
          $("#" + v64).html($(v65).find(".card-body .list-group").find(".list-group-item").first().find("li:nth-child(2)").text().split(":")[1].trim());
        });
      }
      var v61 = JSON.parse(localStorage.getItem("viewHomeworkReport") ?? "[]");
      $(".viewHomeworkReport").each(function () {
        if (v61.includes($(this).attr("url"))) {
          $(this).removeClass("btn-success");
          $(this).addClass("btn-outline-success");
        }
      });
      $(".viewHomeworkReport").click(function () {
        var v66 = JSON.parse(localStorage.getItem("viewHomeworkReport") ?? "[]");
        v66.push($(this).attr("url"));
        localStorage.setItem("viewHomeworkReport", JSON.stringify(v66));
        $(".nloadingx").fadeIn();
        $(".homeworks-table").parent().fadeOut("slow");
        g = $(this);
        $.get($(this).attr("url"), function (v67) {
          if (v4 != "Projects") {
            corbit_set("type", $("[name='type']:checked")?.val()).then(function () {
              corbit_set("html", $(".card-body .list-group", v67).html().replaceAll("textarea", "gg")).then(function () {
                corbit_set("name", g.attr("name")).then(function () {
                  corbit_set("title", g.attr("title")).then(function () {
                    corbit_set("details", g.attr("details")).then(function () {
                      window.open(corbit_report_url("homeworks") + "&school_id=" + school_id);
                    });
                  });
                });
              });
            });
          } else {
            $.post("/Projects/Projects/GetGradeStudentsList", JSON.parse("{\"" + v67.split("const param = {")[1].split("};")[0].trim().replaceAll("'", "\"").replaceAll(" ", "").replaceAll(":", "\":").replaceAll("\n", "").replaceAll(",", ",\"").replace(",\"StudentIds\":$(\"#studentsFilter\").val(),\"Status\":$(\"#Status\").val(),\"SortBy\":$(\"#SortOrder\").val()", "") + "}"), function (v68) {
              corbit_set("type", $("[name='type']:checked")?.val()).then(function () {
                corbit_set("html", v68.html.replaceAll("textarea", "gg")).then(function () {
                  setTimeout(() => {
                    corbit_set("name", g.attr("name")).then(function () {
                      corbit_set("title", g.attr("title")).then(function () {
                        corbit_set("details", g.attr("details")).then(function () {
                          console.log(v68.html);
                          window.open(corbit_report_url("homeworks") + "&school_id=" + school_id + "&type=" + $("[name='type']:checked")?.val());
                        });
                      });
                    });
                  }, 500);
                });
              });
            });
          }
          setTimeout(() => {
            location.reload();
          }, 10000);
        });
      });
      fetch("https://schools.madrasati.sa/SchoolManagment/" + v4 + "/Index/" + school_id + "?SemesterId=" + semesterId + "&PageNumber=2", {
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-US,en;q=0.9,ar;q=0.8,ar-EG;q=0.7",
          "cache-control": "max-age=0",
          "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1"
        },
        referrer: "https://schools.madrasati.sa/SchoolManagmentReports/Statistics/ViewSubjectReports?schoolId=" + school_id,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include"
      }).then(v69 => {
        return v69.text();
      }).then(v70 => {
        $(v70).find(".card-body .list-group .list-group-item").each(function () {
          $(".homeworks-table").append("\n                            <tr>\n                                <td>\n                                    <strong style='font-size: 16px; color: #039d8f;'>\n                                    " + $(this).find("h6").text() + "\n                                    </strong>\n                                <br>\n                                <p>" + $(this).find(".col-lg-7 > ul > li:nth-child(1) > span:nth-child(2)").text() + "</p>\n                                <small>" + ($(this).find(".col-lg-7 > ul > li:nth-child(2)").html() ? $(this).find(".col-lg-7 > ul > li:nth-child(2)").html() : $(this).find(".col-lg-5 > ul > li:nth-child(1)").html()) + ("</small>\n                                <!--\n                                <br>\n                                الفصل: <strong class='get-classroom' url='" + $(this).find("a:nth-child(2)").attr("href") + "' id='x" + Math.random().toString().split(".")[1] + "'><span class='text-danger'>جاري الاستعلام...</span></strong>\n                                \n                                -->\n                                </td>\n                                <td class='text-center'><br>\n                                    <button class='btn btn-success viewHomeworkReport2' details='") + $(this).find(".col-lg-7 > ul > li:nth-child(1) > span:nth-child(2)").html() + "' title='" + $(this).find("h6").text() + "' name='" + ($(this).find(".col-lg-7 > ul > li:nth-child(2)").html() ? $(this).find(".col-lg-7 > ul > li:nth-child(2)").html() : $(this).find(".col-lg-5 > ul > li:nth-child(1)").html()) + "' url='" + $(this).find("a:nth-child(2)").attr("href") + "'>\n                                        <i class='fa fa-check-square'></i>\n                                        عرض التقرير\n                                        <br> او ارسال تنبيه\n                                    </button>\n                                </td>\n                            </tr>\n                            ");
        });
        var v71 = JSON.parse(localStorage.getItem("viewHomeworkReport") ?? "[]");
        $(".viewHomeworkReport2").each(function () {
          if (v71.includes($(this).attr("url"))) {
            $(this).removeClass("btn-success");
            $(this).addClass("btn-outline-success");
          }
        });
        $(".viewHomeworkReport2").click(function () {
          var v72 = JSON.parse(localStorage.getItem("viewHomeworkReport") ?? "[]");
          v72.push($(this).attr("url"));
          localStorage.setItem("viewHomeworkReport", JSON.stringify(v72));
          $(".nloadingx").fadeIn();
          $(".homeworks-table").parent().fadeOut("slow");
          g = $(this);
          $.get($(this).attr("url"), function (v73) {
            if (v4 != "Projects") {
              corbit_set("type", $("[name='type']:checked")?.val()).then(function () {
                corbit_set("html", $(".card-body .list-group", v73).html().replaceAll("textarea", "gg")).then(function () {
                  corbit_set("name", g.attr("name")).then(function () {
                    corbit_set("title", g.attr("title")).then(function () {
                      corbit_set("details", g.attr("details")).then(function () {
                        window.open(corbit_report_url("homeworks") + "&school_id=" + school_id);
                      });
                    });
                  });
                });
              });
            } else {
              $.post("/Projects/Projects/GetGradeStudentsList", JSON.parse("{\"" + v73.split("const param = {")[1].split("};")[0].trim().replaceAll("'", "\"").replaceAll(" ", "").replaceAll(":", "\":").replaceAll("\n", "").replaceAll(",", ",\"").replace(",\"StudentIds\":$(\"#studentsFilter\").val(),\"Status\":$(\"#Status\").val(),\"SortBy\":$(\"#SortOrder\").val()", "") + "}"), function (v74) {
                corbit_set("type", $("[name='type']:checked")?.val()).then(function () {
                  corbit_set("html", v74.html.replaceAll("textarea", "gg")).then(function () {
                    setTimeout(() => {
                      corbit_set("name", g.attr("name")).then(function () {
                        corbit_set("title", g.attr("title")).then(function () {
                          corbit_set("details", g.attr("details")).then(function () {
                            console.log(v74.html);
                            window.open(corbit_report_url("homeworks") + "&school_id=" + school_id + "&type=" + $("[name='type']:checked")?.val());
                          });
                        });
                      });
                    }, 500);
                  });
                });
              });
            }
            setTimeout(() => {
              location.reload();
            }, 10000);
          });
        });
      });
    });
  }
});