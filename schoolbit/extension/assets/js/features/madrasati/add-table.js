setTimeout(() => {
  corbit_get("addTable").then(function (v1) {
    if (v1 && v1 != "" && v1 != "undefined") {
      $("#mainView > div.card-header.fw-bold.border-bottom-0.align-items-center.flex-column.flex-sm-row.pb-0 > h5").html("\n        <h4 class='text-danger'>جاري المعالجة...</h4>\n        ");
      var v2 = JSON.parse(v1);
      $(".table-responsive tr").each(function (v3) {
        if (v3 > 0) {
          $(this).find("td").each(function (v4) {
            v4 = v4;
            if (true) {
              var v5 = $(this);
              var v6 = v2.days;
              var v7 = v2.days == 35 ? 7 : 6;
              v2.lessons.forEach(v8 => {
                if (v8.subject && v8.teacher && window.location.href.includes(v2.classes[v8.classroom]) && v2.classes[v8.classroom]) {
                  if (v8.index == v6 - v7 * (5 - v3) - (v7 - v4) && v4 <= v7) {
                    var v9 = false;
                    v5.find("select option").each(function () {
                      if (v2.subjects[v8.subject.trim()] == $(this).text().trim()) {
                        v9 = true;
                        v5.find("select").val($(this).attr("value"));
                        v5.find("select").attr("onclick", v5.find("select").attr("onchange"));
                        v5.find("select").click();
                      }
                    });
                    if (!v9) {
                      v5.find("select option").each(function () {
                        if ($(this).text().trim() == "المهارات الرقمية" || $(this).text().trim() == "الحاسب وتقنية المعلومات") {
                          var v10 = $(this).text().trim();
                          if (v10 == "الحاسب وتقنية المعلومات") {
                            v10 = v10.replace("الحاسب وتقنية المعلومات", "المهارات الرقمية");
                          } else {
                            v10 = v10.replace("المهارات الرقمية", "الحاسب وتقنية المعلومات");
                          }
                          if (v2.subjects[v8.subject.trim()] == v10) {
                            v5.find("select").val($(this).attr("value"));
                            v5.find("select").attr("onclick", v5.find("select").attr("onchange"));
                            v5.find("select").click();
                          }
                        }
                      });
                    }
                  }
                }
              });
            }
          });
        }
      });
      setTimeout(() => {
        if (document.referrer.includes("TimeTable/Index")) {
          window.close();
        } else if ($("button:contains('اختيار معلم'):visible").length) {
          alert("<h3>قم بإختيار معلمين النشاط للحصص المطلوب وبعدها اضغط زر 'حفظ' في اسفل الصفحة.</h3>");
        } else {
          $("#mainView > div.col-md-12.text-right > div > button.btn.btn-primary.px-4").click();
        }
      }, 1000);
      if ($(".editBulkAlert2").length == 0) {
        $("body").append("\n                <div class='editBulkAlert2' style='position: fixed; bottom: 5px; left: 5px; border: 2px solid red; padding: 20px; background: white'>\n                    <button class='btn btn-danger btn-lg stopeditaaa'>\n                    <i class='fa fa-times'></i>\n                    ايقاف اضافة الجدول الآن\n                    </button>\n                </div>\n                ");
        $(".stopeditaaa").click(function () {
          corbit_set("addTable", "").then(function () {
            location.reload();
          });
        });
      }
    }
    corbit_get("addTable2").then(function (v11) {
      corbit_get("classesnames").then(function (v12) {
        corbit_get("subjectsnames").then(function (v13) {
          if (v11 && v11 != "" && v11 != "undefined") {
            $("#mainView > div.card-header.fw-bold.border-bottom-0.align-items-center.flex-column.flex-sm-row.pb-0 > h5").html("\n        <h4 class='text-danger'>جاري المعالجة...</h4>\n        ");
            v11 = JSON.parse(v11);
            v12 = JSON.parse(v12);
            v13 = JSON.parse(v13);
            if (v12) {
              var v14 = v11;
              $(".table-responsive tbody tr").each(function (v15) {
                if (v15 >= 0) {
                  var v16 = $(this);
                  $(this).find("td").each(function (v17) {
                    v17 = v17;
                    var v18 = $(this);
                    v14.forEach(function (v19) {
                      if (window.location.href.includes(v12[v19.classroom.trim()])) {
                        if (v19.day == v16.find("td:nth-child(1)").text()?.trim() && $(".table-responsive thead th:nth-child(" + (v17 + 1) + ")").text().includes(v19.lesson_number.split(" ")[1].trim())) {
                          v18.find("select option").each(function () {
                            if (v13[v19.subject] == $(this).text().trim() && v18.text().trim().includes("اختر")) {
                              v18.find("select").val($(this).attr("value"));
                              v18.find("select").attr("onclick", v18.find("select").attr("onchange"));
                              v18.find("select").click();
                            }
                          });
                        }
                      }
                    });
                  });
                }
              });
              setTimeout(() => {
                if (document.referrer.includes("TimeTable/Index")) {
                  if (online || true) {
                    window.close();
                  }
                } else if (online || true) {
                  if ($("button:contains('اختيار معلم'):visible").length) {
                    alert("<h3>قم بإختيار معلمين النشاط للحصص المطلوب وبعدها اضغط زر 'حفظ' في اسفل الصفحة.</h3>");
                  } else {
                    $("#mainView > div.col-md-12.text-right > div > button.btn.btn-primary.px-4").click();
                  }
                }
              }, 1000);
              if ($(".editBulkAlert3").length == 0) {
                $("body").append("\n                        <div class='editBulkAlert3' style='position: fixed; bottom: 5px; left: 5px; border: 2px solid red; padding: 20px; background: white; z-index: 99999 !important'>\n                            <button class='btn btn-danger btn-lg stopeditaaa'>\n                            <i class='fa fa-times'></i>\n                            ايقاف اضافة الجدول الآن\n                            </button>\n                        </div>\n                        ");
                $(".stopeditaaa").click(function () {
                  corbit_set("addTable2", "").then(function () {
                    location.reload();
                  });
                });
              }
            }
          }
          setTimeout(function () {
            corbit_get("addTable3").then(function (v20) {
              if (v20 && v20 != "" && v20 != "undefined") {
                $("#mainView > div.card-header.fw-bold.border-bottom-0.align-items-center.flex-column.flex-sm-row.pb-0 > h5").html("\n           \n            <h4 class='text-danger'>جاري المعالجة...</h4>\n            ");
                var v21 = JSON.parse(v20);
                $(".table-responsive tr").each(function (v22) {
                  var v23 = $(this);
                  if (v22 > 0) {
                    var v24 = $(this);
                    $(this).find("td").each(function (v25) {
                      v25 = v25 + 1;
                      var v26 = $(this);
                      v21.forEach(function (v27) {
                        if (window.location.href.includes("/" + v27.classroom) && v23.find("td").first().text().trim().includes(v27.day.substring(3, 9)) && v27.lesson == v26.index()) {
                          v26.find("select option").each(function () {
                            if (v27.subject == $(this).text().trim() && v26.text().trim().includes("اختر")) {
                              v26.find("select").val($(this).attr("value"));
                              v26.find("select").attr("onclick", v26.find("select").attr("onchange"));
                              v26.find("select").click();
                            }
                          });
                        }
                      });
                    });
                  }
                });
                setTimeout(() => {
                  if (online) {
                    if (document.referrer.includes("TimeTable/Index")) {
                      window.close();
                    } else if ($("button:contains('اختيار معلم'):visible").length) {
                      alert("<h3>قم بإختيار معلمين النشاط للحصص المطلوب وبعدها اضغط زر 'حفظ' في اسفل الصفحة.</h3>");
                    } else {
                      $("#mainView > div.col-md-12.text-right > div > button.btn.btn-primary.px-4").click();
                    }
                  }
                }, 1000);
                if ($(".editBulkAlert3").length == 0) {
                  $("body").append("\n                            <div class='editBulkAlert3' style='position: fixed; bottom: 5px; left: 5px; border: 2px solid red; padding: 20px; background: white; z-index: 99999 !important'>\n                                <button class='btn btn-danger btn-lg stopeditaaa'>\n                                <i class='fa fa-times'></i>\n                                ايقاف اضافة الجدول الآن\n                                </button>\n                            </div>\n                            ");
                  $(".stopeditaaa").click(function () {
                    corbit_set("addTable3", "").then(function () {
                      location.reload();
                    });
                  });
                }
              }
            });
          }, 2000);
        });
      });
    });
  });
  $("#mainView > div.col-md-12.text-right > div").append("\n    <button type=\"button\" class=\"btn text-danger deletetable\"><i class='fa fa-trash'></i>&nbsp; تفريغ الجدول</button>\n<button type=\"button\" class=\"btn text-success printtable\"><i class='fa fa-print'></i>&nbsp; طباعة الجدول</button>\n");
  $(".deletetable").click(function () {
    confirm("متأكد من تفريغ الجدول؟");
    $(".bootbox-accept").click(function () {
      $(".table-responsive tr").each(function (v28) {
        $(this).find("td").each(function () {
          $(this).find("select").each(function () {
            $(this).removeAttr("onchange");
            $(this).val("");
          });
        });
      });
      $("#mainView > div.col-md-12.text-right > div > button.btn.btn-primary.px-4.btn.btn-primary.px-4").first().click();
    });
  });
  if (window.location.href.includes("deletethistable")) {
    $(".table-responsive tr").each(function (v29) {
      $(this).find("td").each(function () {
        $(this).find("select").each(function () {
          $(this).removeAttr("onchange");
          $(this).val("");
        });
      });
    });
    $("#mainView > div.col-md-12.text-right > div > button.btn.btn-primary.px-4.btn.btn-primary.px-4").first().click();
  }
  $(".printtable").click(function () {
    $(".table-responsive select").each(function () {
      $(this).parent().prepend("\n        <strong>" + $(this).find("option:selected").text() + "</strong><br>\n        ");
      $(this).remove();
    });
    $("div.table-responsive a").remove();
    $("div.table-responsive").prepend("<Center><br><h3>جدول " + $("#mainView > div.card-header.fw-bold.border-bottom-0.align-items-center.flex-column.flex-sm-row.pb-0 > small").text() + "</h3><br></Center>");
    var v30 = $("div.table-responsive").html();
    var v31 = window.open("");
    v31.document.write(v30 + "<style>\n        body{\n            direction: rtl;\n            text-align: right;\n        }\n        thead{\n            background: #eee;\n        }\n        table, td, th {\n        border: 1px solid;\n        text-align: center\n        }\n        tr:nth-child(even) {\n            background-color: #f2f2f2;\n        }\n        table {\n        width: 100%;\n        border-collapse: collapse;\n        }\n        .btn-danger{\n            background: #FD8A8A;\n        }\n        .btn-success{\n            background: #97DECE;\n        }\n        .btn-info{\n            background: #82AAE3;\n        }\n        .btn{\n            width: 100% !important;\n            padding-left: 2px;\n            padding-right: 2px;\n        }\n        </style>");
    v31.document.close();
    v31.print();
    v31.close();
  });
}, 500);