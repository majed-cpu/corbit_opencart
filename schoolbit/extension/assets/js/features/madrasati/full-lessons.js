alert("<center>\n<h2>جاري الاستعلام...</h2>\nربما يستغرق دقائق.\n<h1 id='rr'></h1>\n</center>");
$(".bootbox-accept").fadeOut();
var arr = [];
$.get("https://schools.madrasati.sa/SchoolManagmentReports/StudentStatistics/AttendanceReport/" + school_id).then(function (v1) {
  var v2 = $(v1).find("#btn_Search").attr("onclick").split("redirectTo=")[1].split("'")[0];
  var v3 = 1;
  var v4 = 0;
  function v5() {
    fetch("https://schools.madrasati.sa/SchoolManagmentReports/StudentStatistics/GetStudentAttendanceReport?schoolId=" + school_id + "&redirectTo=" + v2, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,ar;q=0.8,ar-EG;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        priority: "u=1, i",
        requestverificationtoken: $("#csrfid").val(),
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      referrerPolicy: "strict-origin-when-cross-origin",
      body: "searchStudent=&page=" + v3 + "&pageNumber=" + v3,
      method: "POST",
      mode: "cors",
      credentials: "include"
    }).then(v6 => {
      return v6.json();
    }).then(v7 => {
      v4 = v7.totalPages;
      $("#rr").html((v3 / v4 * 100).toFixed(0) + "%");
      $(v7.html).find(".border").each(function () {
        arr.push({
          name: $(this).find("div > div:nth-child(1) > div > span:nth-child(2)").text().trim(),
          classroom: $(this).find("div > div:nth-child(1) > div > span:nth-child(5)").text().trim(),
          parent: $(this).find("div > div:nth-child(1) > div > span:nth-child(8)").text().trim(),
          phone: $(this).find("div > div:nth-child(1) > div > span:nth-child(11)").text().trim(),
          attend: $(this).find("div > div:nth-child(2) > span:nth-child(2)").text().trim(),
          ghiab: $(this).find("div > div:nth-child(2) > span:nth-child(5)").text().trim(),
          ghiab_ex: $(this).find("div > div:nth-child(2) > span:nth-child(8)").text().trim(),
          late: $(this).find("div > div:nth-child(2) > span:nth-child(11)").text().trim(),
          late_ex: $(this).find("div > div:nth-child(2) > span:nth-child(14)").text().trim()
        });
      });
      if (v7.totalPages == v3) {
        $(".bootbox-accept").click();
        corbit_set("full_lessons", JSON.stringify(arr)).then(function () {
          alert("<center><h4>تم تجهيز التقرير</h4>\n                        <br><a href='" + corbit_report_url("full-lessons") + "&school_id=" + school_id + "' target='_blank' class='btn btn-success'>عرض التقرير الآن</a>\n                        </center>");
          $(".bootbox-accept").fadeOut();
        });
      } else {
        v3 = v3 + 1;
        v5();
      }
    });
  }
  v5();
});