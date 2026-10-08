var arr_x = [];
var mystudents = [];
var classnames = "";
var classrooms = "";
if (localStorage.getItem("studentsn")) {
  try {
    mystudents = JSON.parse(localStorage.getItem("studentsn"));
    mystudents.forEach(function (v1) {
      if (!classnames.includes("<option value='" + v1.classname + "'>" + v1.classname + "</option>")) {
        classnames = classnames + ("<option value='" + v1.classname + "'>" + v1.classname + "</option>");
      }
      if (!classrooms.includes("<option value='" + v1.classroom + "'>" + v1.classroom + "</option>")) {
        classrooms = classrooms + ("<option value='" + v1.classroom + "'>" + v1.classroom + "</option>");
      }
    });
  } catch (v2) {
    console.log(12434534, v2);
  }
}
$("\n<div style='width: 100%;'>\n    <div class='card ' style='border-radius: 10px; padding: 10px; background: #fff; box-shadow: 0px 4px 20px -6px rgba(0,0,0,0.75);'>\n        <div class='card-header text-center css-selector' style=\"padding: 10px;font-family: 'Droid Arabic Kufi'; border: none\">\n        <img src=\"" + window.CORBIT_EXT_BASE + "assets/img/icon48.png\" width=\"36\">\n        سكول بت \n        </div>\n        <div class='card-body nn_bo' style=\"padding: 10px; border-top: 1px solid #333;font-family: 'Droid Arabic Kufi';\">\n            \n            <button class=\"pushable front corbit_two btn-block btn-lgd btn-primary\" type='button' style=\"font-family: 'Droid Arabic Kufi';\">\n                <span class=\"\">\n                    <i class='fa fa-edit'></i>\n                    رصد الغياب في نور\n                </span>\n            </button>\n            <button class=\"pushable front corbit_three btn-block btn-lgd btn-danger\" type='button' style=\"font-family: 'Droid Arabic Kufi';\">\n                <span class=\"\">\n                    <i class='fa fa-check-square'></i>\n                    رصد السلوك الإيجابي\n                    &nbsp;\n                    <span class='btn btn-sm btn-success' style='padding: 3px'><i class='fa fa-star'></i> جديد</span>\n                </span>\n            </button>\n            <button class=\"pushable front corbit_fourx btn-block btn-lgd btn-info\" type='button' style=\"font-family: 'Droid Arabic Kufi'; background:#5A7ACD !important\">\n                <span class=\"\">\n                    <i class='fa fa-file'></i>\n                    تصدير بيانات أولياء الأمور لمنصة مدارس\n                    &nbsp;\n                    <span class='btn btn-sm btn-success' style='padding: 3px'><i class='fa fa-star'></i> جديد</span>\n                </span>\n            </button>\n            <button class='btn btn-default btn-block importn2 btn-sm' type='button'>\n            <i class='fa fa-refresh'></i>\n                استيراد بيانات الطلاب للأداة (الحالي " + mystudents.length + ")\n                <br><small>يتطلب صلاحية التقارير لعرض كشف الطلاب</small>\n            </button>\n        </div>\n    </div>\n</div>\n<br>\n<style>\n.css-selector {\n    background: linear-gradient(143deg, #ff6700, #f0a100, #01dd00);\n    background-size: 600% 600%;\n\n    -webkit-animation: AnimationName 4s ease infinite;\n    -moz-animation: AnimationName 4s ease infinite;\n    animation: AnimationName 4s ease infinite;\n}\n\n@-webkit-keyframes AnimationName {\n    0%{background-position:11% 0%}\n    50%{background-position:90% 100%}\n    100%{background-position:11% 0%}\n}\n@-moz-keyframes AnimationName {\n    0%{background-position:11% 0%}\n    50%{background-position:90% 100%}\n    100%{background-position:11% 0%}\n}\n@keyframes AnimationName {\n    0%{background-position:11% 0%}\n    50%{background-position:90% 100%}\n    100%{background-position:11% 0%}\n}\n.pushable {\n    border-radius: 5px;\n    border: none;\n    padding: 0;\n    cursor: pointer;\n  }\n  .front {\n    display: block;\n    border-radius: 5px;\n    color: white;\n    padding: 10px;\n    transform: translateY(-6px);\n  }\n\n  .pushable:active .front {\n    transform: translateY(-2px);\n  }\n  .ffccc:visited, .ffccc{\n    color: white !important\n  }\n</style>\n").insertBefore("#ctl00_PlaceHolderMain_fsLoginStatus");
localStorage.removeItem("importn");
$(".corbit_fourx").click(function () {
  alert("قم بالدخول الى شؤون الطلاب -> اولياء الأمور -> وستجد زر التصدير");
});
$(".corbit_three").click(function () {
  if (!$(".modelIdcbtnz2x").length) {
    $("body").append("\n    <!-- Button trigger modal -->\n    <button type=\"button\" style='display: none;' class=\"btn btn-primary btn-lg modelIdcbtnz2x rrmeee\" data-toggle=\"modal\" data-target=\"#modelIdcz2x\">\n    Launch\n    </button>\n    <!-- Modal -->\n    <div class=\"modal fade \" id=\"modelIdcz2x\" tabindex=\"-1\" role=\"dialog\" size='lg' aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog StandardFont\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <h5 class=\"modal-title\">\n                    &nbsp;&nbsp;\n                    سكول بت \n                    &nbsp;&nbsp;\n                    <button type=\"button\" class=\"close btn-sm\" data-dismiss=\"modal\" aria-label=\"Close\">\n                        <span aria-hidden=\"true\">&times; اغلاق</span>\n                    </button></h5>\n                </div>\n                <div class=\"modal-body\">\n                    <img style='width: 100%; border: 2px solid green;' src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\">\n                    <br>\n                    <div class='alert alert-success'>\n                        <h4>قم بفتح صفحة ادخال السلوك والمواظبة<br><br>\n                        وستجد زر رصد السلوك الإيجابي</h4>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    ");
  }
  $(".modelIdcbtnz2x").click();
});
$(".importn2").click(function () {
  localStorage.setItem("importn", "yes");
  clickme($("#tab-1 a:contains('التقارير')"));
});
Object.entries(localStorage).forEach(function (v3, v4) {
  if (v3[0].includes("tmp_")) {
    if ("tmp_" + new Date().toISOString().split("T")[0] != v3[0]) {
      localStorage.removeItem(v3[0]);
    }
  }
});
var vf = "";
$(".corbit_two").click(function () {
  if (mystudents.length == 0) {
    alert("برجاء الضغط على زر استيراد بيانات الطلاب للأداة.");
  }
  setInterval(() => {
    $(".st").each(function () {
      if ($(this).find("select").val() == "1") {
        $(this).css("background", "#D9E9CF");
      }
      if ($(this).find("select").val() == "2") {
        $(this).css("background", "#FBF9D1");
      }
      if ($(this).find("select").val() == "141," || $(this).find("select").val() == "800667,") {
        $(this).css("background", "#BBDCE5");
      }
      if ($(this).find("select").val() == "48," || $(this).find("select").val() == "1201153,") {
        $(this).css("background", "#E7D3D3");
      }
    });
  }, 100);
  $(".rrmeeez2").remove();
  $(".rrmeee").remove();
  $("body").append("\n    <!-- Button trigger modal -->\n    <button type=\"button\" style='display: none;' class=\"btn btn-primary btn-lg modelIdcbtnz2 rrmeee\" data-toggle=\"modal\" data-target=\"#modelIdcz2\">\n    Launch\n    </button>\n    <!-- Modal -->\n    <div class=\"modal fade rrmeeez2\" id=\"modelIdcz2\" tabindex=\"-1\" role=\"dialog\" size='lg' aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog StandardFont\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <h5 class=\"modal-title\">\n                    &nbsp;&nbsp;\n                    سكول بت \n                    &nbsp;&nbsp;\n                    <button type=\"button\" class=\"close btn-sm\" data-dismiss=\"modal\" aria-label=\"Close\">\n                        <span aria-hidden=\"true\">&times; اغلاق</span>\n                    </button></h5>\n                </div>\n                <div class=\"modal-body\">\n                    <div class='col-12 text-center'>\n                        <a href='javascript:;' class='btn btn-success nt_ghiab text-white' style='border: 2px solid #333; background: #3E5F44; border-radius: 0px'>\n                            <span style='color: white'><i class='fa fa-user-times'></i>\n                            رصد الغياب</span>\n                        </a>\n                        <a href='javascript:;' class='dnone btn btn-success nt_late text-white' style='border: 2px solid #333; background: #FE7743; border-radius: 0px'>\n                            <span style='color: white'><i class='fa fa-clock-o'></i>\n                            رصد التأخر</span>\n                        </a>\n                        \n                        <br><br>\n                    </div>\n                    <style>.dnone{display:none}</style>\n                    <div class='col-6 nt_ghiab_toggle dnone' style='padding: 15px; margin: 0px auto'>\n                        <div style='padding: 15px; border: solid 2px green; border-radius: 5px'>\n                            <div class=\"form-group\">\n                            <h5 for=\"\">نوع حساب نور (المرحلة)</h5>\n                            <select class=\"form-control form-control-lg\" style=\"border: solid 2px red; padding: 2px\" id=\"stage\">\n                                <option value=\"mt\">متوسط</option>\n                                <option value=\"eb\">ابتدائي</option>\n                                <option value=\"mas\">مسارات</option>\n                            </select>\n                        </div>\n                        <div class='col-12 text-center'>\n                            <button class='btn btn-primary done_nt_ghiab' type='button'>رصد الآن</button>\n                        </div>\n                    </div>\n                    </div>\n                    <div class='col-12 v59465'>\n                        <div class='row'>\n                            <div class='col-12 col-lg-6'>\n                                <div class=\"form-group\">\n                                    <label for=\"\">تحديد صف معين</label>\n                                    <select class=\"form-control custom_classname\" style='padding: 2px'>\n                                        <option value='all'>الكل</option>\n                                        " + classnames + "\n                                    </select>\n                                </div>\n                            </div>\n                            <div class='col-12 col-lg-6'>\n                                <div class=\"form-group\">\n                                    <label for=\"\">تحديد فصل معين</label>\n                                    <select class=\"form-control custom_classroom\" style='padding: 2px'>\n                                        <option value='all'>الكل</option>\n                                        " + classrooms + "\n                                    </select>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class='col-12 table-responsive'>\n                        <table class='table table-hover table-bordered table-sm'>\n                            <thead>\n                                <th>\n                                    م\n                                </th>\n                                <th>\n                                    الاسم\n                                </th>\n                                <th>\n                                    الصف\n                                </th>\n                                <th>\n                                    الفصل\n                                </th>\n                                <th>الحالة</th>\n                            </thead>\n                            <tbody id='vf'>\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    ");
  $(".nt_ghiab").click(function () {
    $(".nt_ghiab_toggle").toggle("slow");
  });
  $(".done_nt_ghiab").click(function () {
    $("body").append("\n        <textarea class='save-me-to-local-storage' name='stage'>" + $("#stage").val() + "</textarea>\n        ");
    var v6 = setInterval(() => {
      if (!$(".save-me-to-local-storage[name='stage']").length) {
        clearInterval(v6);
        $("body").append("\n            <textarea class='save-me-to-local-storage' name='ghiab-type'>day</textarea>\n            ");
        var v7 = setInterval(() => {
          if (!$(".save-me-to-local-storage[name='ghiab-type']").length) {
            clearInterval(v7);
            var v8 = [];
            mystudents.forEach(function (v10) {
              if ($("select[number='" + v10.number + "']").length) {
                var v11 = $("select[number='" + v10.number + "']").val();
                if (v11 != "1" && v11 != "2") {
                  v10.status = v11;
                  v10.ghiab = v11;
                  v8.push(v10);
                }
              }
            });
            $("body").append("\n                <textarea class='save-me-to-local-storage' name='ghiab-students'>" + JSON.stringify(v8) + "</textarea>\n                ");
            var v9 = setInterval(() => {
              if (!$(".save-me-to-local-storage[name='ghiab-students']").length) {
                clearInterval(v9);
                alert("قم بالذهاب لصفحة السلوك والمواظبة الآن.");
              }
            }, 100);
          }
        }, 100);
      }
    }, 100);
  });
  function v5() {
    vf = "";
    var v20 = {};
    if (localStorage.getItem("tmp_" + new Date().toISOString().split("T")[0])) {
      v20 = JSON.parse(localStorage.getItem("tmp_" + new Date().toISOString().split("T")[0]));
    }
    mystudents.forEach(function (v21, v22) {
      var v23 = true;
      if (v21.classname == $(".custom_classname").val() || $(".custom_classname").val() == "all") {} else {
        v23 = false;
      }
      if (v21.classroom == $(".custom_classroom").val() || $(".custom_classroom").val() == "all") {} else {
        v23 = false;
      }
      if (v23) {
        vf = vf + ("\n                <tr class='st'>\n                    <td>" + (v22 + 1) + "</td>\n                    <td>" + v21.name + "<input type='hidden' class='phone' value='" + v21.phone + "'></td>\n                    <td>" + v21.classname + "</td>\n                    <td>" + v21.classroom + "</td>\n                    <td>\n                        <select class='form-control vvcx cc" + v21.number + "' number=\"" + v21.number + "\" style='padding: 2px'>\n                            <option value=\"1\">حاضر</option>\n                            <option value=\"141,\" data-select2-id=\"109\" >الغياب بعذر </option>\n                            <option value=\"48,\" data-select2-id=\"110\">الغياب بدون عذر مقبول </option>\n                            <option value=\"800667,\" data-select2-id=\"111\">الغياب بعذر مقبول عبر منصة مدرستي</option>\n                            <option value=\"1201153,\" data-select2-id=\"112\">الغياب بدون عذر مقبول عبر منصة مدرستي</option>\n                        </select>\n                    </td>\n                </tr>\n                ");
      }
    });
    $("#vf").html(vf);
    $(".vvcx").each(function () {
      if (v20[$(this).attr("number")]) {
        $(this).val(v20[$(this).attr("number")]);
      } else {
        $(this).val("1");
      }
    });
    $(".vvcx").change(function () {
      v20[$(this).attr("number")] = $(this).val();
      localStorage.setItem("tmp_" + new Date().toISOString().split("T")[0], JSON.stringify(v20));
    });
  }
  v5();
  $(".custom_classname").change(function () {
    v5();
  });
  $(".custom_classroom").change(function () {
    v5();
  });
  $(".modelIdcbtnz2").click();
});
