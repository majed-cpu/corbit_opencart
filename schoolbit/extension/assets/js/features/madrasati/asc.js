var classes_html = [];
var subjects_html = [];
var teachers_html = [];
setTimeout(function () {
  {
    if ($("#corbit-modal-import-table-from-noor").length == 0) {
      $("body").append("\n            <Style>\n            #custom-names, .nloadingy, .nloadingyss{\n            display: none\n            }\n            .dnone{\n            display:none}</Style>\n                <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-import-table-from-noor').modal('show')\" data-target=\"#corbit-modal-import-table-from-noor\"></button>\n                <!-- Modal -->\n                <div class=\"modal fade\" id=\"corbit-modal-import-table-from-noor\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n                    <div class=\"modal-dialog\" role=\"document\">\n                        <div class=\"modal-content\" style='position: relative; padding: 20px'>\n                            <div class='nloadingy' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                                <img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' width='300' style='\n                                margin: 0;\n                                position: absolute;\n                                top: 50%;\n                                left: 50%;\n                                -ms-transform: translate(-50%, -50%);\n                                transform: translate(-50%, -50%);'>\n                                <br>\n                            </div>\n                            <div id='Doneee'></div>\n                            \n                            \n                            <div id='loadingxx'><h2>جاري الاستعلام...</h2></div>\n                   <div class='import-s'>\n                   <div id='upload-file-container' class='dnone'>\n                   <div class=\"form-group\">\n                   <label for=\"\">ملف الاكسل من برنامج التايم تيبل</label>\n                   <input type=\"file\" accept='.xlsx,.xls'\n                       class=\"form-control\" id=\"ingredient_file\">\n                   </div>\n       <br><br>\n               <strong class='text-danger'>\n                   تأكد من التالي قبل استيراد الجدول\n                   <ul class='text-danger'>\n                       <li>\n                           اسناد الفصول والمواد للمعلمين في مدرستي\n                       </li>\n                   </ul>\n               </strong>\n               <br><a href='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' style='width: 100%; padding: 5px; border: solid 2px darkred;' target='_blank'>\n               <i class='fas fa-image'></i>&nbsp;\n               اضغط هنا لعرض الصورة التوضيحية</a>\n               <br><br><p><strong>* يرجى تصدير ملف الاكسل بنفس الطريقة التي بالصورة٫ وبعدها اختر جميع خيارات التصدير (الاسنادات٫ المواد ٫ الخ...) *</strong></p>\n               </div>\n                </div>\n                <div id='custom-names'>\n                    <div class='card card-body' >\n                        <h4>اسماء المواد</h4>\n                        <table class='table table-bordered table-hover'><thead>\n                        <th>\n                            المادة\n                        </th>\n                        <th>\n                            المادة في مدرستي\n                        </th>\n                        </thead><tbody id='subjects'></tbody></table>\n                    </div>\n                    <div class='card card-body' >\n                        <h4>اسماء الفصول</h4>\n                        <table class='table table-bordered table-hover'><tbody id='classes'></tbody></table>\n                    </div>\n                </div>\n                    <div class='col-12 text-center nloadingyss'>\n                        <button class='btn btn-success btn-lg addCalendarNow'>\n                            إضافة الجدول للفصول الآن\n                        </button>\n                        </div>\n                    </div>\n                </div>\n            ");
    }
    $(".nloadingy").fadeOut();
    setTimeout(() => {
      $("#loadingxx").remove();
      $("#upload-file-container").fadeIn();
    }, 3000);
    $("[data-target=\"#corbit-modal-import-table-from-noor\"]").click();
    document.getElementById("ingredient_file").addEventListener("change", function (v2) {
      $(".nloadingy").fadeIn();
      $(".import-s").html("<h2 class='text-danger'>جاري الرفع...</h2><br>ربما تستغرق دقائق.");
      var v3 = this.files[0];
      var v4 = new XMLHttpRequest();
      try {
        v4.open("POST", online ? "#" : "http://localhost:8000/asc", true);
        v4.onreadystatechange = function () {
          if (v4.readyState === 4) {
            if (v4.status === 200) {
              var v6 = [];
              var v7 = [];
              var v8 = [];
              var v9 = [];
              var v10 = JSON.parse(v4.responseText);
              for (const [v11, v12] of Object.entries(v10)) {
                v6.push(v11);
                v12.forEach(function (v13) {
                  if (!v7.includes(v13.classroom)) {
                    v7.push(v13.classroom);
                  }
                });
              }
              $(".import-s").remove();
              $(".nloadingy").fadeOut();
              $(".bbbb").fadeIn();
              $("#custom-names").toggle("slow");
              $(".nloadingyss").fadeIn("slow");
              v6.forEach(function (v14) {
                $("#subjects").append("\n                              <tr>\n                                  <td>\n                                      " + v14 + "\n                                  </td>\n                                  <td>\n                                      <select class='s'>\n                                      <option value='-'>-- اختر --</option>\n                                      " + subjects_html.map(function (v15) {
                  return "<option value=\"" + v15 + "\" " + (v15.includes(v14) ? "selected" : "") + ">" + v15 + "</option>";
                }) + "\n                                      </select>\n                                  </td>\n                              </tr>\n                              ");
              });
              v7.forEach(function (v16) {
                $("#classes").append("\n                              <tr>\n                                  <td dir='ltr'>\n                                      " + v16 + "\n                                  </td>\n                                  <td>\n                                      <select class='s'>\n                                      <option value='-'>-- اختر --</option>\n                                      " + classes_html.map(function (v17) {
                  return "<option value=\"" + v17.id + "\">" + v17.title + "</option>";
                }) + "\n                                      </select>\n                                  </td>\n                              </tr>\n                              ");
              });
              $(".addCalendarNow").click(function () {
                $("#subjects tr").each(function () {
                  v9.push({
                    subject: $(this).find(".s").val(),
                    _subject: $(this).find("td").first().text().trim()
                  });
                });
                v9.forEach(function (v18) {
                  if (v10[v18._subject]) {
                    if (v10[v18._subject].length) {
                      v10[v18._subject].forEach(function (v19) {
                        var v20 = "";
                        $("#classes tr").each(function () {
                          if ($(this).find("td").first().text().trim() == v19.classroom) {
                            v20 = $(this).find("select").val();
                          }
                        });
                        v8.push({
                          subject: v18.subject,
                          day: v19.day,
                          classroom: v20,
                          lesson: v19.lesson,
                          _e: 1
                        });
                      });
                    }
                  }
                });
                corbit_set("addTable3", JSON.stringify(v8)).then(function () {
                  if ($(".editBulkAlert2").length == 0) {
                    $("body").append("\n                                            <div class='editBulkAlert2' style='position: fixed; bottom: 5px; left: 5px; border: 2px solid red; padding: 20px; background: white; z-index: 9999'>\n                                                <button class='btn btn-danger btn-lg stopeditaaa'>\n                                                <i class='fa fa-times'></i>\n                                                ايقاف اضافة الجدول الآن\n                                                </button>\n                                            </div>\n                                            ");
                    $(".stopeditaaa").click(function () {
                      corbit_set("addTable3", "").then(function () {
                        location.reload();
                      });
                    });
                  }
                  function v21() {
                    if (classes_html.length) {
                      var v22 = window.open("https://schools.madrasati.sa/TimeStructure/TimeTable/Index/" + classes_html[0].id);
                      setTimeout(() => {
                        v22.onunload = function () {
                          v22.close();
                          classes_html[0] = undefined;
                          classes_html = classes_html.filter(function (v23) {
                            if (v23) {
                              return true;
                            } else {
                              return false;
                            }
                          });
                          v21();
                        };
                      }, 2000);
                    } else {
                      corbit_set("addTable3", "").then(function () {
                        alert("تم اضافة الجداول بنجاح");
                        location.reload();
                      });
                    }
                  }
                  v21();
                });
                $(".addCalendarNow").fadeOut();
              });
            } else {
              alert("حدث خطأ " + JSON.stringify(v4));
            }
          }
        };
        v4.onerror = function (v24) {
          alert("حدث خطأ " + JSON.stringify(v24.error));
        };
        var v5 = new FormData();
        v5.append("file", v3);
        v4.send(v5);
      } catch (v25) {
        alert("حدث خطأ " + JSON.stringify(v25));
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
    }).then(v26 => {
      return v26.json();
    }).then(v27 => {
      v27 = v27.html;
      $("<div>" + v27 + "</div>").find(".list-group .list-group-item").each(function () {
        classes_html.push({
          id: $(this).find(".fa-users").parent().attr("href").split("Students/")[1],
          title: $(this).find("h6").text().trim()
        });
      });
      $("<div>" + v27 + "</div>").find(".list-group .list-group-item").each(function () {
        var v28 = $(this).find(".fa-users").parent().attr("href").split("Students/")[1];
        fetch("https://schools.madrasati.sa/TimeStructure/TimeTable/Index/" + v28, {
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
          referrer: "https://schools.madrasati.sa/SchoolStructure/Classrooms/Teachers/" + v28,
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "include"
        }).then(v29 => {
          return v29.text();
        }).then(v30 => {
          $(v30).find(".table-responsive tr:nth-child(2) select").first().find("option").each(function () {
            if ($(this).text().trim() != "اختر" && !subjects_html.includes($(this).text().trim())) {
              subjects_html.push($(this).text().trim());
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
    }).then(v31 => {
      return v31.json();
    }).then(v32 => {
      v32 = v32.html;
      $("<div>" + v32 + "</div>").find(".list-group .list-group-item").each(function () {
        classes_html.push({
          id: $(this).find(".fa-users").parent().attr("href").split("Students/")[1],
          title: $(this).find("h6").text().trim()
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
        body: "pageNumber=3&treeId=0&SemesterId=" + localStorage.getItem("semesterId2") + "&schoolId=" + school_id,
        method: "POST",
        mode: "cors",
        credentials: "include"
      }).then(v33 => {
        return v33.json();
      }).then(v34 => {
        v34 = v34.html;
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
        }).then(v35 => {
          return v35.json();
        }).then(v36 => {
          v36 = v36.html;
          $("<div>" + v36 + "</div>").find(".list-group .list-group-item").each(function () {
            classes_html.push({
              id: $(this).find(".fa-users").parent().attr("href").split("Students/")[1],
              title: $(this).find("h6").text().trim()
            });
          });
        });
      });
    });
    $.get("https://schools.madrasati.sa/SchoolManagment/Teachers?SchoolId=" + school_id, function (v37) {
      $(".teachers-lessons-iframe-here").html("<iframe id='weekIframe' frameborder='0' style='width: 100%; overflow: hidden; height: 155px' scrolling=\"no\" src='" + $(v37).find(".allsubjects-box").first().find("a:contains('الجدول')").attr("href") + "'></iframe>");
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
    }).then(v38 => {
      return v38.json();
    }).then(v39 => {
      var v40 = [];
      $(v39.html).find("tbody tr").each(function (v41) {
        if ($(this).find("td:nth-child(2)").text().trim() != "") {
          teachers_html.push($(this).find("td:nth-child(1)").text().trim());
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
      }).then(v42 => {
        return v42.json();
      }).then(v43 => {
        $(v43.html).find("tbody tr").each(function (v44) {
          if ($(this).find("td:nth-child(2)").text().trim() != "") {
            teachers_html.push($(this).find("td:nth-child(1)").text().trim());
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
        }).then(v45 => {
          return v45.json();
        }).then(v46 => {
          $(v46.html).find("tbody tr").each(function (v47) {
            if ($(this).find("td:nth-child(2)").text().trim() != "") {
              teachers_html.push($(this).find("td:nth-child(1)").text().trim());
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
          }).then(v48 => {
            return v48.json();
          }).then(v49 => {
            $(v49.html).find("tbody tr").each(function (v50) {
              if ($(this).find("td:nth-child(2)").text().trim() != "") {
                teachers_html.push($(this).find("td:nth-child(1)").text().trim());
              }
            });
          });
        });
      });
    });
  }
}, 0);