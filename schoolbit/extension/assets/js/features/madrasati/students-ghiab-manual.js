if ($("#corbit-modal-ghiab-students-manual").length == 0) {
  $("body").append("\n    <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-ghiab-students-manual').modal('show')\" data-target=\"#corbit-modal-ghiab-students-manual\"></button>\n    <!-- Modal -->\n    <div class=\"modal fade\" id=\"corbit-modal-ghiab-students-manual\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog\" role=\"document\">\n            <div class=\"modal-content\" style='position: relative'>\n                <div class='nloadingy' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                    <h1 style='\n                    margin: 0;\n                    position: absolute;\n                    top: 50%;\n                    left: 50%;\n                    color: 'red';\n                    -ms-transform: translate(-50%, -50%);\n                    transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                </div>\n                <div class='select-students-type-here row'>جاري التحميل...</div>\n            </div>\n        </div>\n    </div>\n");
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
        $(".select-students-type-here").html("\n                <div class='col-12 text-center g'>\n                    <h4>\n                        اختر الطلاب المراد التعامل معهم:\n                    </h4>\n                </div>\n                <div class=\"col-12 g\" style='padding: 10px' students-type='m'>\n                    <div class='card card-body item text-center'>\n                        <h3 class='text-success'>\n                            الطلاب من مدرستي (<span class='madrasati_status'></span>)\n                        </h3>\n                    </div>\n                </div>\n                <div class=\"col-12 g\" style='padding: 10px' students-type='n'>\n                    <div class='card card-body item text-center'>\n                        <h3 class='text-success'>\n                            الطلاب من نور (<span class='noor_status'></span>)\n                        </h3>\n                    </div>\n                </div>\n                <br><br>\n                <a href='/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/import-students-from-madrasati' onclick='setTimeout(function(){ location.reload()}, 2000)' class='btn btn-primary'>لاستيراد / تحديث بيانات الطلاب من مدرستي اضغط هنا</a>\n                <br><br>\n                <a href='/SchoolManagment/Actions/Index/" + school_id + "#openmenu-madrasati/import-students-from-noor'  onclick='setTimeout(function(){ location.reload()}, 2000)' class='btn btn-info'>لاستيراد / تحديث بيانات الطلاب من نور اضغط هنا</a>\n                ");
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
          window.open(corbit_report_url("students-ghiab-manual") + "&type=" + $(this).attr("students-type") + "&school_id=" + school_id);
        });
      }
    }, 100);
  }
}, 100);