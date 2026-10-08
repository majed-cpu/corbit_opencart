setTimeout(function () {
  {
    if ($("#corbit-modal-import-table-from-noor").length == 0) {
      $("body").append("\n            <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" data-target=\"#corbit-modal-import-table-from-noor\" onclick=\"$('#corbit-modal-import-table-from-noor').modal('show')\"></button>\n            <!-- Modal -->\n            <div class=\"modal fade\" id=\"corbit-modal-import-table-from-noor\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\" style='position: relative'>\n                        <div class='nloadingy' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                            <h1 style='\n                    margin: 0;\n                    position: absolute;\n                    top: 50%;\n                    left: 50%;\n                    color: 'red';\n                    -ms-transform: translate(-50%, -50%);\n                    transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                        </div>\n                        <div id='Doneee'></div>\n                        \n                        <table class='table table-bordered table-hover'><tbody id='classes2'></tbody></table>\n                        <table class='table table-bordered table-hover'><tbody id='subjects2'></tbody></table>\n                        \n                            <div class='import-s imports'>\n                            <div class=\"form-group\">\n                            <h5 for=\"\">ملف \"الجدول الشامل - حسب الفصل\" من نظام نور</h5>\n                            <input type=\"file\" accept='.xls,.xlsx'\n                                class=\"form-control\" id=\"ingredient_file2\">\n                            </div>\n                        <strong class='text-danger'><br>\n                            تأكد من التالي قبل استيراد الجدول:\n                            <ul class='text-danger'>\n                                <li>\n                                    اسناد الفصول والمواد للمعلمين في مدرستي.\n                                </li>\n                            </ul>\n                    </strong>\n                        </div>\n                        <div class='col-12 text-center fff'>\n                            <button class='btn btn-success btn-lg addCalendarNow2'>\n                                استيراد الجدول للفصول الآن\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ");
    }
    $(".nloadingy").fadeOut();
    $("[data-target=\"#corbit-modal-import-table-from-noor\"]").click();
    var v2 = "";
    var v3 = "<select><option value=''>-- اختر الاسم الصحيح --</option>";
    document.getElementById("ingredient_file2").addEventListener("change", function (v4) {
      $(".nloadingy").fadeIn();
      $(".import-s").html("جاري الرفع...");
      var v5 = this.files[0];
      var v6 = new XMLHttpRequest();
      try {
        v6.open("POST", "https://local.maaref.invalid/table", true);
        v6.onreadystatechange = function () {
          if (v6.readyState === 4) {
            if (v6.status === 200) {
              $(".import-s").remove();
              $(".nloadingy").fadeOut();
              lessons = JSON.parse(this.responseText);
              lessons.forEach(function (v8) {
                v8.classroom = v8.classroom;
                if ($("#classes2 td:contains('" + v8.classroom + "')").length == 0) {
                  $("#classes2").append("\n                                <tr>\n                                    <td>\n                                        " + v8.classroom + "\n                                    </td>\n                                    <td class='classes-select-here'>\n                                        \n                                    </td>\n                                </tr>\n                                ");
                }
                if ($("#subjects2 td:contains('" + v8.subject + "')").length == 0) {
                  $("#subjects2").append("\n                                <tr>\n                                    <td>\n                                        " + v8.subject + "\n                                    </td>\n                                    <td class='subjects2-select-here'>\n                                        \n                                    </td>\n                                </tr>\n                                ");
                }
              });
              setInterval(() => {
                $("#classes2 tr").each(function () {
                  $(this).find(".classes-select-here select").each(function () {
                    if ($(this).val() == "") {
                      $(this).addClass("bg-danger");
                    } else {
                      $(this).removeClass("bg-danger");
                    }
                  });
                });
                $("#subjects2 tr").each(function () {
                  $(this).find(".subjects2-select-here select").each(function () {
                    if ($(this).val() == "") {
                      $(this).addClass("bg-danger");
                    } else {
                      $(this).removeClass("bg-danger");
                    }
                  });
                });
              }, 1000);
              $(".subjects2-select-here").html(v3 + "</select>");
              $("#subjects2 tr").each(function () {
                var v9 = $(this).find("td:nth-child(1)").text().trim();
                $(this).find(".subjects2-select-here select option").each(function () {
                  if ($(this).text().includes(v9)) {
                    $(this).prop("selected", true);
                  }
                });
              });
              $(".classes-select-here").html("<select style='max-width: 400px'><option value=''>-- اختر الاسم الصحيح --</option>" + v2 + "</select>");
              $(".modal-footer").fadeIn("slow");
              $(".addCalendarNow2").click(function () {
                var v10 = false;
                $("#classes2 tr").each(function () {
                  if ($(this).find("select").val() == "") {
                    v10 = true;
                  }
                });
                $("#subjects2 tr").each(function () {
                  if ($(this).find("select").val() == "") {
                    v10 = true;
                  }
                });
                if (v10 && !corbit_api_frontend.includes("808")) {
                  alert("برجاء اختيار اسماء الفصول والمواد");
                  return;
                }
                var v11 = {};
                var v12 = {};
                $("#classes2 tr").each(function () {
                  v11[$(this).find("td:nth-child(1)").text().trim()] = $(this).find("select").val();
                });
                $("#subjects2 tr").each(function () {
                  v12[$(this).find("td:nth-child(1)").text().trim()] = $(this).find("select").val();
                });
                $("body").append("<textarea class='save-me-to-local-storage' name='classesnames'>" + JSON.stringify(v11) + "</textarea>");
                $(".nloadingy").fadeIn();
                if (online) {
                  $(".fff").html("<h2>جاري المعالجة...</h2>");
                }
                corbit_set("classesnames", JSON.stringify(v11)).then(function () {
                  corbit_set("subjectsnames", JSON.stringify(v12)).then(function () {
                    corbit_set("addTable2", JSON.stringify(lessons)).then(function () {
                      if (online) {
                        $(".fff").remove();
                      }
                      $(".nloadingy").fadeOut();
                      if ($(".editBulkAlert2").length == 0) {
                        $("body").append("\n                                            <div class='editBulkAlert2' style='position: fixed; bottom: 5px; left: 5px; border: 2px solid red; padding: 20px; background: white; z-index: 9999'>\n                                                <button class='btn btn-danger btn-lg stopeditaaa'>\n                                                <i class='fa fa-times'></i>\n                                                ايقاف اضافة الجدول الآن\n                                                </button>\n                                            </div>\n                                            ");
                        $(".stopeditaaa").click(function () {
                          corbit_set("addTable2", "").then(function () {
                            location.reload();
                          });
                        });
                      }
                      function v13() {
                        if (Object.keys(v11).length) {
                          var v14 = window.open("https://schools.madrasati.sa/TimeStructure/TimeTable/Index/" + Object.values(v11)[0]);
                          setTimeout(() => {
                            v14.onunload = function () {
                              v14.close();
                              delete v11[Object.keys(v11)[0]];
                              v13();
                            };
                          }, 2000);
                        } else {
                          corbit_set("addTable2", "").then(function () {
                            alert("تم اضافة الجداول بنجاح");
                            if (online) {
                              location.reload();
                            }
                          });
                        }
                      }
                      v13();
                    });
                  });
                });
              });
            } else {
              alert("حدث خطأ " + JSON.stringify(v6));
            }
          }
        };
        v6.onerror = function (v15) {
          alert("حدث خطأ " + JSON.stringify(v15.error));
        };
        var v7 = new FormData();
        v7.append("file", v5);
        v6.send(v7);
      } catch (v16) {
        alert("حدث خطأ " + JSON.stringify(v16));
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
    }).then(v17 => {
      return v17.json();
    }).then(v18 => {
      v18 = v18.html;
      $("<div>" + v18 + "</div>").find(".list-group .list-group-item").each(function () {
        v2 = v2 + ("\n                <option value='" + $(this).find(".fa-users").parent().attr("href").split("Students/")[1] + "'>" + $(this).find("h6").text().trim() + "</option>\n                ");
      });
      $("<div>" + v18 + "</div>").find(".list-group .list-group-item").each(function () {
        var v19 = $(this).find(".fa-users").parent().attr("href").split("Students/")[1];
        fetch("https://schools.madrasati.sa/TimeStructure/TimeTable/Index/" + v19, {
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
          referrer: "https://schools.madrasati.sa/SchoolStructure/Classrooms/Teachers/" + v19,
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "include"
        }).then(v20 => {
          return v20.text();
        }).then(v21 => {
          $(v21).find(".table-responsive tr:nth-child(2) select").first().find("option").each(function () {
            if ($(this).text().trim() != "اختر" && !v3.includes($(this).text().trim())) {
              v3 = v3 + ("<option value = '" + $(this).text().trim() + "'>" + $(this).text().trim() + "</option> ");
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
    }).then(v22 => {
      return v22.json();
    }).then(v23 => {
      v23 = v23.html;
      $("<div>" + v23 + "</div>").find(".list-group .list-group-item").each(function () {
        v2 = v2 + ("\n                <option value='" + $(this).find(".fa-users").parent().attr("href").split("Students/")[1] + "'>" + $(this).find("h6").text().trim() + "</option>\n                ");
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
      }).then(v24 => {
        return v24.json();
      }).then(v25 => {
        v25 = v25.html;
        $("<div>" + v25 + "</div>").find(".list-group .list-group-item").each(function () {
          v2 = v2 + ("\n                <option value='" + $(this).find(".fa-users").parent().attr("href").split("Students/")[1] + "'>" + $(this).find("h6").text().trim() + "</option>\n                ");
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
        }).then(v26 => {
          return v26.json();
        }).then(v27 => {
          v27 = v27.html;
          $("<div>" + v27 + "</div>").find(".list-group .list-group-item").each(function () {
            v2 = v2 + ("\n                <option value='" + $(this).find(".fa-users").parent().attr("href").split("Students/")[1] + "'>" + $(this).find("h6").text().trim() + "</option>\n                ");
          });
          $("body").append("\n            <textarea class='save-me-to-local-storage' name='classes'>" + v2 + "</textarea>\n            ");
        });
      });
    });
  }
}, 0);