setTimeout(function () {
  {
    if ($("#corbit-modal-import-table-from-noor").length == 0) {
      $("body").append("\n            <style>\n            #custom-names, .nloadingy, .nloadingyss{\n            display: none\n            }\n            .dnone{\n            display:none}\n            </style>\n                <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-import-table-from-noor').modal('show')\"  data-target=\"#corbit-modal-import-table-from-noor\"></button>\n                <!-- Modal -->\n                <div class=\"modal fade\" id=\"corbit-modal-import-table-from-noor\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n                    <div class=\"modal-dialog\" role=\"document\">\n                        <div class=\"modal-content\" style='position: relative'>\n                            <div class='nloadingy' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                                <img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' width='300' style='\n                                margin: 0;\n                                position: absolute;\n                                top: 50%;\n                                left: 50%;\n                                -ms-transform: translate(-50%, -50%);\n                                transform: translate(-50%, -50%);'>\n                            </div>\n                            <div id='Doneee'></div>\n                            \n                            <div id='loadingxx'><h2>جاري الاستعلام...</h2></div>\n                    <div id='upload-file-container' class='dnone'>\n                    <div class=\"form-group\">\n                    <label for=\"\">الملف من برنامج العرف</label>\n                    <input type=\"file\" accept='.mdb'\n                        class=\"form-control\" id=\"ingredient_file\">\n                    </div>\n                    <br><br>\n                <strong class='text-danger'>\n                    تأكد من التالي قبل استيراد الجدول\n                    <ul class='text-danger'>\n                        <li>\n                            اسناد الفصول والمواد للمعلمين في مدرستي\n                        </li>\n                        <li>\n                            يجب تفريغ الجدول قبل عمل جلب لقاعدة جداول العرف \n                        </li>\n                        <li>\n                            يجب وضع خيار حصة النشاط غير محدد واختيار المعلم يدوي\n                        </li>\n                    </ul>\n                </strong>\n                </div>\n                <div id='custom-names'>\n                    <div class='card card-body' >\n                        <h4>اسماء المواد</h4>\n                        <table class='table table-bordered table-hover'><tbody id='subjects'></tbody></table>\n                    </div>\n                    <div class='card card-body' >\n                        <h4>اسماء المعلمين</h4>\n                        <table class='table table-bordered table-hover'><tbody id='teachers'></tbody></table>\n                    </div>\n                    <div class='card card-body' >\n                        <h4>اسماء الفصول</h4>\n                        <table class='table table-bordered table-hover'><tbody id='classes'></tbody></table>\n                        \n                    </div>\n                </div>\n                    <div class='col-12 text-center nloadingyss'>\n                        <button class='btn btn-success btn-lg addCalendarNow'>\n                            إضافة الجدول للفصول الآن\n                        </button>\n                        </div>\n                    </div>\n                </div>\n            ");
    }
    setTimeout(() => {
      $("#loadingxx").remove();
      $("#upload-file-container").fadeIn();
    }, 3000);
    $(".nloadingy").fadeOut();
    $("[data-target=\"#corbit-modal-import-table-from-noor\"]").click();
    var v2 = "";
    var v3 = "";
    var v4 = "<select><option value=''>-- اختر الاسم الصحيح --</option>";
    document.getElementById("ingredient_file").addEventListener("change", function (v5) {
      $(".nloadingy").fadeIn();
      $(".import-s").html("جاري الرفع...");
      var v6 = this.files[0];
      var v7 = new XMLHttpRequest();
      try {
        v7.open("POST", "about:blank", true);
        v7.onreadystatechange = function () {
          if (v7.readyState === 4) {
            if (v7.status === 200) {
              $(".import-s").remove();
              $(".nloadingy").fadeOut();
              $(".bbbb").fadeIn();
              var v9 = JSON.parse(v7.responseText);
              var v10 = [];
              var v11 = [];
              var v12 = [];
              v9.response.lessons.forEach(function (v13) {
                if (v13.teacher && !v10.includes(v13.teacher)) {
                  v10.push(v13.teacher);
                  $("#teachers").append("\n                                    <tr>\n                                        <td>\n                                            " + v13.teacher + "\n                                        </td>\n                                        <td class='teachers-select-here'>\n                                            \n                                        </td>\n                                    </tr>\n                                    ");
                }
                if (v13.classroom && !v12.includes(v13.classroom)) {
                  v12.push(v13.classroom);
                  $("#classes").append("\n                                    <tr>\n                                        <td>\n                                            " + v13.classroom + "\n                                        </td>\n                                        <td class='classes-select-here'>\n                                            \n                                        </td>\n                                    </tr>\n                                    ");
                }
                if (v13.subject && !v11.includes(v13.subject)) {
                  v11.push(v13.subject);
                  $("#subjects").append("\n                                    <tr>\n                                        <td>\n                                            " + v13.subject + "\n                                        </td>\n                                        <td class='subjects-select-here'>\n                                            \n                                        </td>\n                                    </tr>\n                                    ");
                }
              });
              $(".teachers-select-here").html("<select><option value=''>-- اختر الاسم الصحيح --</option>" + v3 + "</select>");
              $("#teachers tr").each(function () {
                var v14 = $(this).find("td:nth-child(1)").text().trim().split(" ");
                $(this).find(".teachers-select-here select option").each(function () {
                  var v15 = $(this).text().trim().split(" ");
                  if (v14[0] == v15[0] && v14[v14.length - 1] == v15[v15.length - 1]) {
                    $(this).prop("selected", true);
                  }
                });
              });
              setInterval(() => {
                $("#teachers tr").each(function () {
                  $(this).find(".teachers-select-here select").each(function () {
                    if ($(this).val() == "") {
                      $(this).addClass("bg-danger");
                    } else {
                      $(this).removeClass("bg-danger");
                    }
                  });
                });
                $("#classes tr").each(function () {
                  $(this).find(".classes-select-here select").each(function () {
                    if ($(this).val() == "") {
                      $(this).addClass("bg-danger");
                    } else {
                      $(this).removeClass("bg-danger");
                    }
                  });
                });
                $("#subjects tr").each(function () {
                  $(this).find(".subjects-select-here select").each(function () {
                    if ($(this).val() == "") {
                      $(this).addClass("bg-danger");
                    } else {
                      $(this).removeClass("bg-danger");
                    }
                  });
                });
              }, 1000);
              $(".classes-select-here").html("<Select style='max-width: 300px'><option value=\"\">-- اختر --</option>" + v2 + "</Select>");
              $(".subjects-select-here").html(v4 + "</select>");
              $("#subjects tr").each(function () {
                var v16 = $(this).find("td:nth-child(1)").text().trim();
                $(this).find(".subjects-select-here select option").each(function () {
                  if ($(this).text().includes(v16)) {
                    $(this).prop("selected", true);
                  }
                });
              });
              $("#custom-names").toggle("slow");
              $(".nloadingyss").fadeIn("slow");
              $(".addCalendarNow").click(function () {
                if (online) {
                  $(".addCalendarNow").fadeOut();
                }
                var v17 = {
                  subjects: {},
                  teachers: {},
                  classes: {},
                  lessons: v9.response.lessons,
                  days: v9.response.days
                };
                $("#subjects tr").each(function () {
                  v17.subjects[$(this).find("td:nth-child(1)").text().trim()] = $(this).find("select").val().trim();
                });
                $("#teachers tr").each(function () {
                  v17.teachers[$(this).find("td:nth-child(1)").text().trim()] = $(this).find("select").val().trim();
                });
                $("#classes tr").each(function () {
                  v17.classes[$(this).find("td:nth-child(1)").text().trim()] = $(this).find("select").val().trim();
                });
                corbit_set("addTable", JSON.stringify(v17)).then(function () {
                  if ($(".editBulkAlert2").length == 0) {
                    $("body").append("\n                                            <div class='editBulkAlert2' style='position: fixed; bottom: 5px; left: 5px; border: 2px solid red; padding: 20px; background: white; z-index: 9999'>\n                                                <button class='btn btn-danger btn-lg stopeditaaa'>\n                                                <i class='fa fa-times'></i>\n                                                ايقاف اضافة الجدول الآن\n                                                </button>\n                                            </div>\n                                            ");
                    $(".stopeditaaa").click(function () {
                      corbit_set("addTable", "").then(function () {
                        location.reload();
                      });
                    });
                  }
                  function v18() {
                    if (Object.keys(v17.classes).length) {
                      var v19 = window.open("https://schools.madrasati.sa/TimeStructure/TimeTable/Index/" + Object.values(v17.classes)[0]);
                      setTimeout(() => {
                        v19.onunload = function () {
                          v19.close();
                          delete v17.classes[Object.keys(v17.classes)[0]];
                          v18();
                        };
                      }, 2000);
                    } else {
                      corbit_set("addTable", "").then(function () {
                        alert("تم اضافة الجداول بنجاح");
                        location.reload();
                      });
                    }
                  }
                  v18();
                });
              });
            } else {
              alert("حدث خطأ " + JSON.stringify(v7));
            }
          }
        };
        v7.onerror = function (v20) {
          alert("حدث خطأ " + JSON.stringify(v20.error));
        };
        var v8 = new FormData();
        v8.append("file", v6);
        v7.send(v8);
      } catch (v21) {
        alert("حدث خطأ " + JSON.stringify(v21));
      }
    });
    fetch("https://schools.madrasati.sa/SchoolStructure/Classrooms/GetClassrooms?SchoolId=" + school_id + "&amp;SemesterId=" + localStorage.getItem("semesterId2"), {
      headers: {
        accept: "*/*",
        "accept-language": "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        priority: "u=1, i",
        requestverificationtoken: $("#csrfid").val(),
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      body: "pageNumber=1&treeId=0&SemesterId=" + localStorage.getItem("semesterId2") + "&schoolId=" + school_id,
      method: "POST",
      mode: "cors",
      credentials: "include"
    }).then(v22 => {
      return v22.json();
    }).then(v23 => {
      v23 = v23.html;
      $("<div>" + v23 + "</div>").find(".list-group .list-group-item").each(function () {
        v2 = v2 + ("\n                    <option value='" + $(this).find(".fa-users").parent().attr("href").split("Students/")[1] + "'>" + $(this).find("h6").text().trim() + "</option>\n                    ");
      });
      $("<div>" + v23 + "</div>").find(".list-group .list-group-item").each(function () {
        var v24 = $(this).find(".fa-users").parent().attr("href").split("Students/")[1];
        fetch("https://schools.madrasati.sa/TimeStructure/TimeTable/Index/" + v24, {
          headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9,ar;q=0.8,ar-EG;q=0.7",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
          },
          referrer: "https://schools.madrasati.sa/SchoolStructure/Classrooms/Teachers/" + v24,
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "include"
        }).then(v25 => {
          return v25.text();
        }).then(v26 => {
          $(v26).find(".table-responsive tr:nth-child(2) select").first().find("option").each(function () {
            if ($(this).text().trim() != "اختر" && !v4.includes($(this).text().trim())) {
              v4 = v4 + ("<option value = '" + $(this).text().trim() + "'>" + $(this).text().trim() + "</option> ");
            }
          });
        });
      });
    });
    fetch("https://schools.madrasati.sa/SchoolStructure/Classrooms/GetClassrooms?SchoolId=" + school_id + "&amp;SemesterId=" + localStorage.getItem("semesterId2"), {
      headers: {
        accept: "*/*",
        "accept-language": "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        priority: "u=1, i",
        requestverificationtoken: $("#csrfid").val(),
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      body: "pageNumber=2&treeId=0&SemesterId=" + localStorage.getItem("semesterId2") + "&schoolId=" + school_id,
      method: "POST",
      mode: "cors",
      credentials: "include"
    }).then(v27 => {
      return v27.json();
    }).then(v28 => {
      v28 = v28.html;
      $("<div>" + v28 + "</div>").find(".list-group .list-group-item").each(function () {
        v2 = v2 + ("\n                    <option value='" + $(this).find(".fa-users").parent().attr("href").split("Students/")[1] + "'>" + $(this).find("h6").text().trim() + "</option>\n                    ");
      });
      fetch("https://schools.madrasati.sa/SchoolStructure/Classrooms/GetClassrooms?SchoolId=" + school_id + "&amp;SemesterId=" + localStorage.getItem("semesterId2"), {
        headers: {
          accept: "*/*",
          "accept-language": "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          priority: "u=1, i",
          requestverificationtoken: $("#csrfid").val(),
          "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        body: "pageNumber=3&treeId=0&SemesterId=" + localStorage.getItem("semesterId2") + "&schoolId=" + school_id,
        method: "POST",
        mode: "cors",
        credentials: "include"
      }).then(v29 => {
        return v29.json();
      }).then(v30 => {
        v30 = v30.html;
        $("<div>" + v30 + "</div>").find(".list-group .list-group-item").each(function () {
          v2 = v2 + ("\n                    <option value='" + $(this).find(".fa-users").parent().attr("href").split("Students/")[1] + "'>" + $(this).find("h6").text().trim() + "</option>\n                    ");
        });
        fetch("https://schools.madrasati.sa/SchoolStructure/Classrooms/GetClassrooms?SchoolId=" + school_id + "&amp;SemesterId=" + localStorage.getItem("semesterId2"), {
          headers: {
            accept: "*/*",
            "accept-language": "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            priority: "u=1, i",
            requestverificationtoken: $("#csrfid").val(),
            "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
          },
          body: "pageNumber=4&treeId=0&SemesterId=" + localStorage.getItem("semesterId2") + "&schoolId=" + school_id,
          method: "POST",
          mode: "cors",
          credentials: "include"
        }).then(v31 => {
          return v31.json();
        }).then(v32 => {
          v32 = v32.html;
          $("<div>" + v32 + "</div>").find(".list-group .list-group-item").each(function () {
            v2 = v2 + ("\n                    <option value='" + $(this).find(".fa-users").parent().attr("href").split("Students/")[1] + "'>" + $(this).find("h6").text().trim() + "</option>\n                    ");
          });
          $("body").append("\n                <textarea class='save-me-to-local-storage' name='classes'>" + v2 + "</textarea>\n                ");
        });
      });
    });
    $.get("https://schools.madrasati.sa/SchoolManagment/Teachers?SchoolId=" + school_id, function (v33) {
      $(".teachers-lessons-iframe-here").html("<iframe id='weekIframe' frameborder='0' style='width: 100%; overflow: hidden; height: 155px' scrolling=\"no\" src='" + $(v33).find(".allsubjects-box").first().find("a:contains('الجدول')").attr("href") + "'></iframe>");
      $("#weekIframe").on("load", function () {
        $("#weekIframe").contents().find("#page-wrapper > div:nth-child(15) > div > div > div.row > div.col-xs-12").fadeOut(0);
        $("#weekIframe").contents().find("#page-wrapper > div:nth-child(15) > div > div > div.row").css("text-align: center");
        $("#weekIframe").contents().find("#page-wrapper > div:nth-child(15) > div > div > div.row").addClass("text-center");
        $("#weekIframe").contents().find("#page-wrapper > div:nth-child(15) > div > div > div.row").prepend("\n                    <div class='col-4 col-lg-4 back' style='display: inline-block'><button class='btn btn-success' onclick=\"getdata(-1000)\">\n                    <i class='fa fa-arrow-right'></i>\n                    الاسبوع السابق</button></div>\n                    <div class='col-4 col-lg-4 week2' style='display: inline-block'></div>\n                    <div class='col-4 col-lg-4 next' style='display: inline-block'><button class='btn btn-success' onclick=\"getdata(-2000)\">الاسبوع التالي\n                    <i class='fa fa-arrow-left'></i>\n                    </button></div>\n                    ");
        setInterval(() => {
          $("#weekIframe").contents().find(".week2").html($("#weekIframe").contents().find("#datehij").text());
        }, 100);
        $(this).contents().find("#page-wrapper > div.row.border-bottom, #page-wrapper > div:nth-child(13)").remove();
        $(this).contents().find("#page-wrapper > div:nth-child(13)").remove();
        $(this).contents().find("#page-wrapper > div:nth-child(13) > div > div > div.text-left").remove();
        $(this).contents().find(".spin-icon").remove();
      });
    }).fail(function () {
      alert("حدث خطأ في الشبكة");
      location.reload();
    });
    fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
      headers: {
        accept: "*/*",
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
      body: "semesterId=" + semesterId + "&searchInput=&pageNumber=1&treeId=-1&source=1",
      method: "POST"
    }).then(v34 => {
      return v34.json();
    }).then(v35 => {
      var v36 = [];
      $(v35.html).find("tbody tr").each(function (v37) {
        if ($(this).find("td:nth-child(2)").text().trim() != "") {
          v3 = v3 + ("<option value='" + $(this).find("td:nth-child(2)").text().trim() + "'>" + $(this).find("td:nth-child(2)").text().trim() + "</option>");
        }
      });
      fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
        headers: {
          accept: "*/*",
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
        body: "semesterId=" + semesterId + "&searchInput=&pageNumber=2&treeId=-1&source=1",
        method: "POST"
      }).then(v38 => {
        return v38.json();
      }).then(v39 => {
        $(v39.html).find("tbody tr").each(function (v40) {
          if ($(this).find("td:nth-child(2)").text().trim() != "") {
            v3 = v3 + ("<option value='" + $(this).find("td:nth-child(2)").text().trim() + "'>" + $(this).find("td:nth-child(2)").text().trim() + "</option>");
          }
        });
        fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
          headers: {
            accept: "*/*",
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
          body: "semesterId=" + semesterId + "&searchInput=&pageNumber=3&treeId=-1&source=1",
          method: "POST"
        }).then(v41 => {
          return v41.json();
        }).then(v42 => {
          $(v42.html).find("tbody tr").each(function (v43) {
            if ($(this).find("td:nth-child(2)").text().trim() != "") {
              v3 = v3 + ("<option value='" + $(this).find("td:nth-child(2)").text().trim() + "'>" + $(this).find("td:nth-child(2)").text().trim() + "</option>");
            }
          });
          fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
            headers: {
              accept: "*/*",
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
            body: "semesterId=" + semesterId + "&searchInput=&pageNumber=4&treeId=-1&source=1",
            method: "POST"
          }).then(v44 => {
            return v44.json();
          }).then(v45 => {
            $(v45.html).find("tbody tr").each(function (v46) {
              if ($(this).find("td:nth-child(2)").text().trim() != "") {
                v3 = v3 + ("<option value='" + $(this).find("td:nth-child(2)").text().trim() + "'>" + $(this).find("td:nth-child(2)").text().trim() + "</option>");
              }
            });
            fetch("https://schools.madrasati.sa/SchoolManagmentReports/TeacherDetailsReport/GetTeacherReport?SchoolId=" + school_id, {
              headers: {
                accept: "*/*",
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
              body: "semesterId=" + semesterId + "&searchInput=&pageNumber=5&treeId=-1&source=1",
              method: "POST"
            }).then(v47 => {
              return v47.json();
            }).then(v48 => {
              $(v48.html).find("tbody tr").each(function (v49) {
                if ($(this).find("td:nth-child(2)").text().trim() != "") {
                  v3 = v3 + ("<option value='" + $(this).find("td:nth-child(2)").text().trim() + "'>" + $(this).find("td:nth-child(2)").text().trim() + "</option>");
                }
              });
            });
          });
        });
      });
    });
  }
}, 0);