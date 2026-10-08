var finaldata = [];
if ($("#corbit-modal-ghiab-students-manual").length == 0) {
  $("body").append("\n        <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-ghiab-students-manual').modal('show')\" data-target=\"#corbit-modal-ghiab-students-manual\"></button>\n        <!-- Modal -->\n        <div class=\"modal fade\" id=\"corbit-modal-ghiab-students-manual\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n            <div class=\"modal-dialog\" role=\"document\">\n                <div class=\"modal-content\" style='position: relative'>\n                    <div class='nloadingy' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                        <h1 style='\n                        margin: 0;\n                        position: absolute;\n                        top: 50%;\n                        left: 50%;\n                        color: 'red';\n                        -ms-transform: translate(-50%, -50%);\n                        transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                    </div>\n                    <div class='select-students-type-here row'>جاري التحميل...</div>\n                </div>\n            </div>\n        </div>\n    ");
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
        $(".select-students-type-here").html("\n                    <div class='col-12 text-center g'>\n                        <h4>\n                            اختر الطلاب المراد التعامل معهم:\n                        </h4>\n                    </div>\n                    <div class=\"col-12 g\" style='padding: 10px' students-type='m'>\n                        <div class='card card-body item text-center'>\n                            <h3 class='text-success'>\n                                الطلاب من مدرستي (<span class='madrasati_status'></span>)\n                            </h3>\n                        </div>\n                    </div>\n                    <br>\n                    <div class='col-12'>\n                    <a href='/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/import-students-from-madrasati' onclick='setTimeout(function(){ location.reload()}, 2000)' class='btn btn-primary'>لاستيراد / تحديث بيانات الطلاب من مدرستي اضغط هنا</a>\n                    <br><br>\n                    <a href='/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/import-students-from-noor'  onclick='setTimeout(function(){ location.reload()}, 2000)' class='btn btn-info'>لاستيراد / تحديث بيانات الطلاب من نور اضغط هنا</a>\n                    </div>\n                    ");
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
          var v3 = [];
          var v4 = [];
          $("#corbit-modal-ghiab-students-manual > div > div").html("<center>\n                            <h4>جاري الاستعلام...</h4>\n                            <h5 id='sstatus'></h5>\n                            </center>");
          var v5 = [];
          var v6 = 0;
          var v7 = 0;
          var v8 = "";
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
          }).then(v9 => {
            return v9.json();
          }).then(v10 => {
            v10 = v10.html;
            $("<div>" + v10 + "</div>").find(".list-group .list-group-item").each(function () {
              var v11 = $(this);
              v5.push({
                classtitle: $(this).find("h6").text().trim(),
                classroomid: v11.find("a").first().attr("href").split("Students/")[1],
                roomid: "",
                ghiab: v11.find("a:contains(\"متابعة الغياب\")").attr("href")
              });
              v6++;
            });
            v7 = v7 + 1;
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
            }).then(v12 => {
              return v12.json();
            }).then(v13 => {
              v13 = v13.html;
              $("<div>" + v13 + "</div>").find(".list-group .list-group-item").each(function () {
                var v16 = $(this);
                v5.push({
                  classtitle: $(this).find("h6").text().trim(),
                  classroomid: v16.find("a").first().attr("href").split("Students/")[1],
                  roomid: "",
                  ghiab: v16.find("a:contains(\"متابعة الغياب\")").attr("href")
                });
                v6++;
              });
              var v14 = v5.length;
              function v15() {
                if (v5.length) {
                  $("#sstatus").html(100 - (v5.length / v14 * 100).toFixed() + "%");
                  var v17 = v5[0];
                  $.get(v17.ghiab).then(function (v20) {
                    fetch("https://schools.madrasati.sa/SchoolSchedule/Schedule/GetClassRoomSchedule?SchoolId=" + school_id + "&classRoomId=" + $(v20).find("#ClassRooms").val() + "&week=" + $(v20).find("#ScheduleWeek").val() + "&ScheduleDate=" + $(v20).find("#StartDateSchedule").val(), {
                      headers: {
                        accept: "*/*",
                        "accept-language": "ar-EG,ar;q=0.9,en-EG;q=0.8,en;q=0.7,en-US;q=0.6",
                        priority: "u=1, i",
                        requestverificationtoken: $("#csrfid").val(),
                        "sec-ch-ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"macOS\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest"
                      },
                      body: null,
                      method: "POST",
                      mode: "cors",
                      credentials: "include"
                    }).then(v21 => {
                      return v21.json();
                    }).then(v22 => {
                      v22 = v22.html;
                      const v23 = new Date();
                      const v24 = v23.getDay();
                      if (!$(v22).find("tbody").find("tr[id=\"" + v24 + "\"]").length) {
                        v5.shift();
                        v15();
                        return;
                      }
                      var v25 = [];
                      $(v22).find("a").each(function () {
                        let v27 = $(this).parent().parent().attr("id");
                        let v28 = $(this).attr("href");
                        v25.push({
                          index: v27,
                          href: v28
                        });
                      });
                      function v26() {
                        if (v25.length) {
                          $.get(v25[0].href).then(function (v29) {
                            fetch("https://schools.madrasati.sa/SchoolSchedule/AttendStudents/GetAttendStudentsForView?schoolId=" + school_id + "&amp;IdSchedule=" + v29.split("&amp;IdSchedule=")[1].split("\"")[0] + "&classRoomId=" + v29.split("var ClassRoomId = \"")[1].split("\"")[0] + "&subjectId=" + v29.split("var SubjectId = \"")[1].split("\"")[0] + "&lectureId=" + v25[0].index + "&studentAttendDateTicks=" + v29.split("var DateAttendTicks = \"")[1].split("\"")[0], {
                              headers: {
                                accept: "*/*",
                                "accept-language": "ar-EG,ar;q=0.9,en-EG;q=0.8,en;q=0.7,en-US;q=0.6",
                                priority: "u=1, i",
                                requestverificationtoken: $("#csrfid").val(),
                                "sec-ch-ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"macOS\"",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "x-requested-with": "XMLHttpRequest"
                              },
                              body: null,
                              method: "POST",
                              mode: "cors",
                              credentials: "include"
                            }).then(v30 => {
                              return v30.json();
                            }).then(v31 => {
                              v31 = v31.html;
                              v31 = "<div>" + v31 + "</div>";
                              $(v31).find("tbody tr").each(function (v32) {
                                finaldata.push({
                                  name: $(this).find("td:nth-child(2)").text().trim(),
                                  number: $(v31).find("#List_" + v32 + "__StudentId").val(),
                                  lesson: v25[0].index,
                                  status: $(this).find("td:nth-child(3)").text().trim(),
                                  classroom: v17.classtitle
                                });
                              });
                              v25.shift();
                              v26();
                            });
                          });
                        } else {
                          v5.shift();
                          v15();
                        }
                      }
                      v26();
                    });
                  });
                } else {
                  var v18 = {};
                  var v19 = [];
                  finaldata.forEach(function (v33) {
                    v33.lesson = v33.lesson.toString().replace("1", "الاولى").replace("2", "الثانية").replace("3", "الثالثة").replace("4", "الرابعة").replace("5", "الخامسة").replace("6", "السادسة").replace("7", "السابعة").replace("8", "الثامنة");
                    if (!v18[v33.number]) {
                      v18[v33.number] = {
                        name: v33.name,
                        classroom: v33.classroom,
                        number: v33.number,
                        lessons: []
                      };
                    }
                    let v34 = false;
                    v18[v33.number].lessons.forEach(function (v35) {
                      if (v35.lesson == v33.lesson) {
                        v34 = true;
                      }
                    });
                    if (!v34) {
                      v18[v33.number].lessons.push({
                        lesson: v33.lesson,
                        status: v33.status
                      });
                    }
                  });
                  for (const [v36, v37] of Object.entries(v18)) {
                    v37.lessons = v37.lessons.sort((v38, v39) => v38.lesson - v39.lesson);
                    v19.push(v37);
                  }
                  corbit_set("students-lessons", JSON.stringify(v19)).then(function () {
                    $("#corbit-modal-ghiab-students-manual > div > div").html("\n                                                    <h4>تم تجهيز التقرير بنجاح!</h4><br>\n                                                    <a href='" + corbit_report_url("students-lessons") + "&school_id=" + school_id + "' target='_blank' class='btn btn-lg btn-success'>\n                                                        <i class='fa fa-external-link'></i>\n                                                        عرض التقرير الآن\n                                                    </a>\n                                                ");
                  });
                }
              }
              v15();
            });
          });
        });
      }
    }, 100);
  }
}, 100);