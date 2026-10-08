if ($("#corbit-modal-ghiab-students-manual").length == 0) {
  $("body").append("\n        <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-ghiab-students-manual').modal('show')\" data-target=\"#corbit-modal-ghiab-students-manual\"></button>\n        <!-- Modal -->\n        <div class=\"modal fade\" id=\"corbit-modal-ghiab-students-manual\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n            <div class=\"modal-dialog\" role=\"document\">\n                <div class=\"modal-content\" style='position: relative'>\n                    <div class='nloadingy' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                       <h1 style='\n                    margin: 0;\n                    position: absolute;\n                    top: 50%;\n                    left: 50%;\n                    color: 'red';\n                    -ms-transform: translate(-50%, -50%);\n                    transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                    </div>\n                    <div class='select-students-type-here row'>جاري التحميل...</div>\n                </div>\n            </div>\n        </div>\n    ");
}
$(".nloadingy").fadeOut();
$("[data-target=\"#corbit-modal-ghiab-students-manual\"]").click();
$("body").append("<textarea class='get-local-storage' name='m_students_" + school_id + "'></textarea>");
var i1 = setInterval(function () {
  if ($(".get-local-storage-value[name='m_students_" + school_id + "']").length) {
    clearInterval(i1);
    $("body").append("<textarea class='get-local-storage' name='n_students_" + school_id + "'></textarea>");
    var v1 = setInterval(function () {
      if ($(".get-local-storage-value[name='n_students_" + school_id + "']").length) {
        clearInterval(v1);
        $(".select-students-type-here").html("\n                    <div class='col-12 text-center g'>\n                        <h4>\n                            اختر الطلاب المراد التعامل معهم:\n                        </h4>\n                    </div>\n                    <div class=\"col-12 g\" style='padding: 10px' students-type='m'>\n                        <div class='card card-body item text-center'>\n                            <h3 class='text-success'>\n                                الطلاب من مدرستي (<span class='madrasati_status'></span>)\n                            </h3>\n                        </div>\n                    </div>\n                    <br><br>\n                    <a href='/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/import-students-from-madrasati' onclick='setTimeout(function(){ location.reload()}, 2000)' class='btn btn-primary'>لاستيراد / تحديث بيانات الطلاب من مدرستي اضغط هنا</a>\n                    ");
        if ($("[name='m_students_" + school_id + "']").val() == "undefined") {
          $(".madrasati_status").html("<strong class='text-danger'><i class='fa fa-times'></i> لم يتم استيراد بيانات الطلاب</strong>");
        } else {
          var v2 = $("[name='m_students_" + school_id + "']").val();
          $(".madrasati_status").html("<strong class='text-success'><i class='fa fa-check'></i> تم استيراد بيانات " + JSON.parse(v2).length + " طالب</strong>");
        }
        if ($("[name='n_students_" + school_id + "']").val() == "undefined") {
          $(".noor_status").html("<strong class='text-danger'><i class='fa fa-times'></i> لم يتم استيراد بيانات الطلاب</strong>");
        } else {
          var v2 = $("[name='n_students_" + school_id + "']").val();
          $(".noor_status").html("<strong class='text-success'><i class='fa fa-check'></i> تم استيراد بيانات " + JSON.parse(v2).length + " طالب</strong>");
        }
        $("[students-type]").click(function () {
          if ($("#corbit-modal-ghiab-students-manual").length == 0) {
            $("body").append("\n                                <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-ghiab-students-manual').modal('show')\" data-target=\"#corbit-modal-ghiab-students-manual\"></button>\n                                <!-- Modal -->\n                                <div class=\"modal fade\" id=\"corbit-modal-ghiab-students-manual\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n                                    <div class=\"modal-dialog\" role=\"document\">\n                                        <div class=\"modal-content\" style='position: relative'>\n                                            <div class='nloadingy' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                                                <h1 style='\n                                            margin: 0;\n                                            position: absolute;\n                                            top: 50%;\n                                            left: 50%;\n                                            color: 'red';\n                                            -ms-transform: translate(-50%, -50%);\n                                            transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                                            </div>\n                                            <div class='select-students-type-here row'>جاري التحميل...</div>\n                                        </div>\n                                    </div>\n                                </div>\n                            ");
          }
          $(".nloadingy").fadeIn();
          $("[data-target=\"#corbit-modal-ghiab-students-manual\"]").click();
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
          }).then(v3 => {
            return v3.json();
          }).then(v4 => {
            var v5 = [];
            $(v4.html).find("tbody tr").each(function (v6) {
              if ($(this).find("td:nth-child(2)").text().trim() != "") {
                v5.push({
                  name: $(this).find("td:nth-child(2)").text().trim(),
                  phone: $(this).find("td:nth-child(4)").text().trim(),
                  id: $(this).find("a").first().attr("href").split("Index/")[1].split("?")[0]
                });
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
            }).then(v7 => {
              return v7.json();
            }).then(v8 => {
              $(v8.html).find("tbody tr").each(function (v9) {
                if ($(this).find("td:nth-child(2)").text().trim() != "") {
                  v5.push({
                    name: $(this).find("td:nth-child(2)").text().trim(),
                    phone: $(this).find("td:nth-child(4)").text().trim(),
                    id: $(this).find("a").first().attr("href").split("Index/")[1].split("?")[0]
                  });
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
              }).then(v10 => {
                return v10.json();
              }).then(v11 => {
                $(v11.html).find("tbody tr").each(function (v12) {
                  if ($(this).find("td:nth-child(2)").text().trim() != "") {
                    v5.push({
                      name: $(this).find("td:nth-child(2)").text().trim(),
                      phone: $(this).find("td:nth-child(4)").text().trim(),
                      id: $(this).find("a").first().attr("href").split("Index/")[1].split("?")[0]
                    });
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
                }).then(v13 => {
                  return v13.json();
                }).then(v14 => {
                  $(v14.html).find("tbody tr").each(function (v15) {
                    if ($(this).find("td:nth-child(2)").text().trim() != "") {
                      v5.push({
                        name: $(this).find("td:nth-child(2)").text().trim(),
                        phone: $(this).find("td:nth-child(4)").text().trim(),
                        id: $(this).find("a").first().attr("href").split("Index/")[1].split("?")[0]
                      });
                    }
                  });
                  teachers = v5;
                  corbit_set("teachers", JSON.stringify(teachers)).then(function () {
                    window.open(corbit_report_url("desinger") + "&school_id=" + school_id);
                    setTimeout(function () {
                      if (online) {
                        location.reload();
                      }
                    }, 1000);
                  });
                  $(".nloadingy").fadeOut();
                });
              });
            });
          });
        });
      }
    }, 100);
  }
}, 100);