corbit_get("move").then(function (v1) {
  var v2 = {
    arr: JSON.parse(v1)
  };
  if (v2.arr != undefined) {
    if (!v2.arr.length) {
      corbit_set("move", "").then(function () {
        window.location = "";
      });
    }
    $("body").append("\n            <button type=\"button\" class=\"btn btn-primary btn-lg adad\" data-toggle=\"modal\" data-target=\"#myModal\" style='display: none;'></button>\n            <!-- Modal -->\n            <div class=\"modal fade\" id=\"myModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" data-backdrop=\"static\" data-keyboard=\"false\">\n            <div class=\"modal-dialog\" role=\"document\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-body\">\n                        <div class='col-12 text-center'>\n                            <button class='btn btn-danger closea'>\n                                <i class='fa fa-times'></i>\n                                ايقاف العملية الآن\n                            </button>\n                            <hr>\n                            <strong class='text-danger'>* قد تكون العملية بطيئة اذا كانت مواصفات الكمبيوتر الخاص بكم ضعيفة لانها عملية معقدة وتحتاج مواصفات كمبيوتر جيدة  *</strong>\n                            <br>\n                            <i>سوف يتم اعادة تحميل الصفحة اكثر من مرة٫ لا تغادر الصفحة حتى تظهر لك رسالة بنجاح العملية.</i>\n                            <br>\n                            <img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' style='margin: 0px auto; width: 150px;'>\n                            <h3>تم إضافة <num>0</num> طالب من أصل " + v2.arr.length + " طالب</h3>\n                        </div>\n                        <hr>\n                        <table class='table table-hover table-bordered'>\n                            <tbody class='dd'>\n                            \n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </div>\n            </div>\n            ");
    $(".closea").click(function () {
      confirm("متأكد؟");
      $("[data-bb-handler=\"confirm\"]").click(function () {
        alert("تم الايقاف بنجاح!");
        corbit_set("move", "").then(function () {
          window.location = "";
        });
      });
    });
    $(".adad").click();
    var v3 = [];
    var v4 = 0;
    function v5() {
      if (!v2.arr?.length) {
        if (new Number($("num").html()) == 0) {
          alert("تم الإستراد بنجاح!");
          corbit_set("move", "").then(function () {
            window.location = "";
          });
        } else {
          location.reload();
        }
      } else {
        var v6 = v2.arr[0];
        v2.arr.shift();
        if (true) {
          v4 = 2;
          $("body").append("\n                    <iframe id='iframe" + v6.number + "' name='iframe" + v6.number + "' width='600' height='800' class='fff_fff'></iframe>\n                    <form id=\"form" + v6.number + "\" target='iframe" + v6.number + "' class='fff_fff' action=\"https://schools.madrasati.sa/SchoolStructure/Classrooms/AllocateStudentInClassRoom/" + v6.id + "\" method=\"post\">\n                        <input name='SearchInput' value='" + v6.number + "'>\n                        <input type=\"hidden\" id=\"PageNumber\" value=\"1\" name=\"PageNumber\" class=\"form-control \">\n                        <input type=\"hidden\" id=\"ClassRoomId\" value=\"" + v6.id + "\" name=\"ClassRoomId\" class=\"form-control \">\n                    </form>\n                ");
          $("#form" + v6.number).submit();
          $("#iframe" + v6.number).on("load", function () {
            if ($(this).contents().find(".Maintdtitle").length == 1) {
              var v7 = $(this);
              var v8 = setInterval(() => {
                if (v7.contents().find("[name='UnAllocatedStudentList[0].IsSelected'][value='true']").length) {
                  clearInterval(v8);
                  v7.contents().find("[name='UnAllocatedStudentList[0].IsSelected'][value='true']").click();
                  v7.contents().find("#AllocateForm > button").click();
                  $("#iframe" + v6.number).on("load", function () {
                    setTimeout(() => {
                      $("#iframe" + v6.number).remove();
                      $("#form" + v6.number).remove();
                    }, 500);
                  });
                  v6.status = "success";
                  $(".dd").append("\n                            <tr class='bg-" + v6.status + "'>\n                                <td>" + v6.name + " &nbsp;&nbsp;</td>\n                            </tr>\n                            ");
                  $("num").html(new Number($("num").html()) + 1);
                  v3.push(v6);
                  setTimeout(function () {
                    v5();
                  }, 2000);
                }
              }, 100);
            } else {
              v6.status = "danger";
              $(".dd").append("\n                        <tr class='bg-light-" + v6.status + "'>\n                            <td>" + v6.name + "&nbsp;&nbsp;</td>\n                        </tr>\n                        ");
              v3.push(v6);
              v5();
            }
          });
        }
      }
    }
    v5();
    setTimeout(() => {
      window.location = "";
    }, 600000);
  }
});