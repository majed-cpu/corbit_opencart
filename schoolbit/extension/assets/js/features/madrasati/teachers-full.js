var teachers = [];
if ($("#corbit-modal-teachers-lessons").length == 0) {
  $("body").append("\n    <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-teachers-lessons').modal('show')\"  data-target=\"#corbit-modal-teachers-lessons\"></button>\n    <!-- Modal -->\n    <div class=\"modal fade\" id=\"corbit-modal-teachers-lessons\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog\" role=\"document\">\n            <div class=\"modal-content\" style='position: relative'>\n                <div class='nloading' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                    <h1 style='\n                    margin: 0;\n                    position: absolute;\n                    top: 50%;\n                    left: 50%;\n                    color: 'red';\n                    -ms-transform: translate(-50%, -50%);\n                    transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                </div>\n                <div class='lessons-teachers-here'></div>\n                <div class='col-12 text-center g'>\n                    <br>\n                    <button class='btn btn-lg btn-success doLessonsTeachersReport'>\n                        <i class='fa fa-check-square'></i>\n                        عرض التقرير الآن\n                    </button>\n                </div>\n            </div>\n        </div>\n    </div>\n");
}
$("[data-target=\"#corbit-modal-teachers-lessons\"]").click();
$(".nloading").fadeIn();
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
}).then(v1 => {
  return v1.json();
}).then(v2 => {
  var v3 = [];
  $(v2.html).find("tbody tr").each(function (v4) {
    if ($(this).find("td:nth-child(2)").text().trim() != "") {
      v3.push({
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
  }).then(v5 => {
    return v5.json();
  }).then(v6 => {
    $(v6.html).find("tbody tr").each(function (v7) {
      if ($(this).find("td:nth-child(2)").text().trim() != "") {
        v3.push({
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
    }).then(v8 => {
      return v8.json();
    }).then(v9 => {
      $(v9.html).find("tbody tr").each(function (v10) {
        if ($(this).find("td:nth-child(2)").text().trim() != "") {
          v3.push({
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
      }).then(v11 => {
        return v11.json();
      }).then(v12 => {
        $(v12.html).find("tbody tr").each(function (v13) {
          if ($(this).find("td:nth-child(2)").text().trim() != "") {
            v3.push({
              name: $(this).find("td:nth-child(2)").text().trim(),
              phone: $(this).find("td:nth-child(4)").text().trim(),
              id: $(this).find("a").first().attr("href").split("TeacherId=")[1].split("&")[0]
            });
          }
        });
        teachers = v3;
        $(".lessons-teachers-here").html("\n                      <div class=\"form-check\">\n                      <label class=\"form-check-label\">\n                      <input type=\"checkbox\" class=\"form-check-input allcc2\">\n                      تحديد الكل\n                      </label>\n                  </div>\n                  <br>\n                      " + teachers.map(function (v14, v15) {
          return "\n                      <label class=\"container single-select-item\" style='width: 48%; padding: 5px'>\n                          <span class=\"mt-0\">\n                              <input type=\"checkbox\" value=\"" + v14.id + "\" class='input' name=\"" + v14.name + "\" phone=\"" + v14.phone + "\">\n                              <span class=\"checkmark\"></span><i class='fa fa-user'></i> &nbsp; " + v14.name + "</span>\n                      </label>\n                      ";
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
  var v16 = 0;
  var v17 = [];
  if ($(".lessons-teachers-here .input:checked").length == 0) {
    alert("يجب إختيار معلم واحد على الأقل.");
  } else {
    $(".nloading").fadeIn("slow");
    $(".lessons-teachers-here .input:checked").each(function () {
      var v19 = $(this).val();
      fetch("https://schools.madrasati.sa/TeachersReports/Subjects/GetTeacherSubjectStatistics?teacherId=" + v19, {
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
        body: "teacherId=" + v19 + "&schoolId=" + school_id + "&semesterId=" + semesterId + "&page=1&source=",
        method: "POST"
      }).then(v20 => {
        return v20.text();
      }).then(v21 => {
        v16 = v16 + 1;
        $(this).parent().parent().append("<span class='btn-success btn-sm fa fa-check'></span>");
        $(this).parent().fadeOut(0);
        $(this).parent().parent().parent().parent().css("background", "#C2FFD9");
        v17.push("<div class='caaaa'><id>" + v19 + "</id>" + JSON.parse(v21).html + "</div>");
      }).catch(() => {
        // فشل جلب هذا المعلم: نعدّه منتهياً حتى لا يتوقف التقرير، ونعلّمه بالأحمر.
        v16 = v16 + 1;
        $(this).parent().parent().append("<span class='btn-danger btn-sm fa fa-times'></span>");
      });
    });
    var v18 = setInterval(() => {
      if (v16 == $(".lessons-teachers-here .input:checked").length) {
        clearInterval(v18);
        setTimeout(() => {
          $(".modal-content").html("\n                    <center>\n                    <div class='alert alert-warning text-center'>\n                      \n                        <a href='" + corbit_report_url("teachers-full") + "&school_id=" + school_id + "' target='_blank' class='btn btn-success btn-lg'>عرض التقرير الآن</a>\n                        <br><br>\n                        <button class='btn btn-primary btn-sm' onclick='location.reload()'>تحديث الصفحة الان</button>\n                </div>\n                    </center>\n                    ");
          setTimeout(function () {
            location.reload();
          }, 20000);
        }, 5000);
        setTimeout(function () {
          var v22 = "";
          v17.forEach(function (v23) {
            v22 = v22 + v23;
          });
          $(".nloading").fadeOut(0);
          corbit_set("teachersReportsHTML", v22).then(function () {
            corbit_set("teachers", JSON.stringify(teachers)).then(function () {
              window.open(corbit_report_url("teachers-full") + "&school_id=" + school_id);
            });
          });
        }, 5000);
      }
    }, 50);
  }
});