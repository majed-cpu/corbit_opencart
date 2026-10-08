var import_page_number = 1;
var students = [];
var arr__ = [];
function getStudents_p() {
  $.get("https://schools.madrasati.sa/SchoolManagment/Students/ManageStudents/" + school_id + "?PageNumber=" + import_page_number + "&years=-1&semesters=-1&classrooms=-1").then(function (v1) {
    if ($(v1).find(".col-xl-3").length == 0) {
      getSingleStudentDataImport();
    } else {
      $(v1).find(".col-xl-3").each(function () {
        if ($(this).find(".btn-outline-secondary").length && $(this)?.find("a.btn-outline-secondary")?.first()?.attr("href")?.split("selectedUser=")[1]) {
          ids_names[$(this).find("a.btn-outline-secondary").first().attr("href")?.split("selectedUser=")[1]] = $(this).find("h5").text().trim();
          arr__.push("https://schools.madrasati.sa/SchoolManagment/Students/StudentInfo/" + school_id + "?UserId=" + $(this).find("a.btn-outline-secondary").first().attr("href")?.split("selectedUser=")[1]);
        } else if ($(this).find(".btn-outline-secondary").length && $(this)?.find("a.btn-outline-secondary")?.first()?.attr("href")?.split("UserId=")[1]) {
          ids_names[$(this).find("a.btn-outline-secondary").first().attr("href")?.split("UserId=")[1]] = $(this).find("h5").text().trim();
          arr__.push("https://schools.madrasati.sa/SchoolManagment/Students/StudentInfo/" + school_id + "?UserId=" + $(this).find("a.btn-outline-secondary").first().attr("href")?.split("UserId=")[1]);
        }
      });
      import_page_number++;
      getStudents_p();
    }
  }).fail(function () {
    setTimeout(function () {
      getStudents_p();
    }, 1000);
  });
}
getStudents_p();
var dones = [];
var ids_names = {};
function getSingleStudentDataImport() {
  if (arr__.length == 0) {
    $("body").append("\n        <textarea class='save-me-to-local-storage' name='m_students_" + school_id + "'>" + JSON.stringify(students) + "</textarea>\n        ");
    setTimeout(function () {
      $(".nloadingx").fadeOut();
      $("#addd_ccd").html("تم استيراد " + students.length + " طالب بنجاح!");
      if ($(".relffd").length) {
        location.reload();
      }
    });
  } else {
    $("#addd_ccd").html("متبقي " + arr__.length + " طالب...");
    var v2 = arr__[0];
    $.get(v2).then(function (v3) {
      if ($(v3).find("#FullNameId").length) {
        if (!dones.includes($(v3).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim())) {
          dones.push($(v3).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim());
          students.push({
            school_id: school_id,
            uname: ids_names[v2.split("UserId=")[1]],
            id: v2?.split("Id=")[1],
            name: $(v3).find("#FullNameId")?.text()?.trim(),
            student_phone: $(v3).find("#Mobile").val(),
            parent_name: "",
            username: $(v3).find("[for=\"MicrosoftUserName\"]")?.text()?.trim(),
            email: $(v3).find("[for=\"MicrosoftUserName\"]")?.text(),
            phone: $(v3).find("#Mobile").val(),
            parent_phone: $(v3).find("#Mobile").val(),
            class_name: $(v3).find("#tab1 > form > div > div.col-lg-8 > div.row.align-items-end > div.col-lg-6 > span")?.text()?.trim(),
            row_name: $(v3).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6")?.text()?.trim()?.replace($(v3).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim(), "")?.trim(),
            classroom: $(v3).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6")?.text()?.trim()?.replace($(v3).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim(), "")?.trim(),
            number: $(v3).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim()
          });
        }
        arr__.shift();
        getSingleStudentDataImport();
      } else {
        $.get(v2).then(function (v4) {
          if (!dones.includes($(v4).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim())) {
            dones.push($(v4).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim());
            students.push({
              school_id: school_id,
              uname: ids_names[v2.split("UserId=")[1]],
              id: v2?.split("Id=")[1],
              name: $(v4).find("#FullNameId")?.text()?.trim(),
              student_phone: $(v4).find("#Mobile").val(),
              parent_name: "",
              username: $(v4).find("[for=\"MicrosoftUserName\"]")?.text()?.trim(),
              email: $(v4).find("[for=\"MicrosoftUserName\"]")?.text(),
              phone: $(v4).find("#Mobile").val(),
              parent_phone: $(v4).find("#Mobile").val(),
              classroom: $(v4).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6")?.text()?.trim()?.replace($(v4).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim(), "")?.trim(),
              class_name: $(v4).find("#tab1 > form > div > div.col-lg-8 > div.row.align-items-end > div.col-lg-6 > span")?.text()?.trim(),
              row_name: $(v4).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6")?.text()?.trim()?.replace($(v4).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim(), "")?.trim(),
              number: $(v4).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim()
            });
          }
          arr__.shift();
          getSingleStudentDataImport();
        }).fail(function () {
          $.get(v2).then(function (v5) {
            students.push({
              import_from: "madrasati",
              school_id: school_id,
              id: v2?.split("Id=")[1],
              uname: ids_names[v2.split("UserId=")[1]],
              name: $(v5).find("#FullNameId")?.text()?.trim(),
              student_phone: $(v5).find("#Mobile").val(),
              parent_name: "",
              username: $(v5).find("[for=\"MicrosoftUserName\"]")?.text()?.trim(),
              email: $(v5).find("[for=\"MicrosoftUserName\"]")?.text(),
              phone: $(v5).find("#Mobile").val(),
              parent_phone: $(v5).find("#Mobile").val(),
              classroom: $(v5).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6")?.text()?.trim()?.replace($(v5).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim(), "")?.trim(),
              class_name: $(v5).find("#tab1 > form > div > div.col-lg-8 > div.row.align-items-end > div.col-lg-6 > span")?.text()?.trim(),
              row_name: $(v5).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6")?.text()?.trim()?.replace($(v5).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim(), "")?.trim(),
              number: $(v5).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim()
            });
            arr__.shift();
            getSingleStudentDataImport();
          }).fail(function () {});
        });
      }
    }).fail(function () {
      $.get(v2).then(function (v6) {
        students.push({
          school_id: school_id,
          id: v2?.split("Id=")[1],
          name: $(v6).find("#FullNameId")?.text().trim(),
          student_phone: $(v6).find("#Mobile").val(),
          parent_name: "",
          uname: ids_names[v2.split("UserId=")[1]],
          username: $(v6).find("[for=\"MicrosoftUserName\"]")?.text()?.trim(),
          email: $(v6).find("[for=\"MicrosoftUserName\"]")?.text(),
          phone: $(v6).find("#Mobile").val(),
          classroom: $(v6).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6")?.text()?.trim()?.replace($(v6).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim(), "")?.trim(),
          parent_phone: $(v6).find("#Mobile").val(),
          class_name: $(v6).find("#tab1 > form > div > div.col-lg-8 > div.row.align-items-end > div.col-lg-6 > span")?.text()?.trim(),
          row_name: $(v6).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6")?.text()?.trim()?.replace($(v6).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim(), "")?.trim(),
          number: $(v6).find("#tab1 > form > div > div.col-lg-6.col-xl-3 > div > div.card-body > div > div > h6 > small")?.text()?.trim()
        });
        arr__.shift();
        getSingleStudentDataImport();
      }).fail(function () {});
    });
  }
}
if ($("#corbit-modal-import-students-from-madrasati").length == 0) {
  $("body").append("\n    <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\"  onclick=\"$('#corbit-modal-import-students-from-madrasati').modal('show')\" data-target=\"#corbit-modal-import-students-from-madrasati\"></button>\n    <!-- Modal -->\n    <div class=\"modal fade\" id=\"corbit-modal-import-students-from-madrasati\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog\" role=\"document\">\n            <div class=\"modal-content\" style='position: relative'>\n                <div class='nloadingx' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                    <h1 style='\n                    margin: 0;\n                    position: absolute;\n                    top: 50%;\n                    left: 50%;\n                    color: 'red';\n                    -ms-transform: translate(-50%, -50%);\n                    transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                </div>\n                <h1 id='addd_ccd'>جاري الاستعلام</h1>\n            </div>\n        </div>\n    </div>\n");
}
$("[data-target=\"#corbit-modal-import-students-from-madrasati\"]").click();
$(".nloadingx").fadeIn();