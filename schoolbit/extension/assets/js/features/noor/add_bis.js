undefined;
$("#ctl00_divInstructionsMain").html("\n    &nbsp;\n    <div id=\"ctl00_divSectionHeaderTitle\" class=\"sectionHeaderTitle\">\n    &nbsp;\n        <span id=\"ctl00_lblPageTitle\" class=\"StandardFont text-center\">\n            <button class='btn btn-sm btn-danger addbisbtn' type='button'>\n                <i class='fa fa-check-square text-white'></i>\n                رصد السلوك الإيجابي\n            </button>\n            <br>\n            <div class='col-12 text-center' style='margin-top: 2px'><small class='text-muted'>بواسطة سكول بت</small></div>\n        </span>\n    </div>\n");
$(".addbisbtn").click(function () {
  if (!$(".modelIdcbtnz2x").length) {
    $("body").append("\n        <!-- Button trigger modal -->\n        <button type=\"button\" style='display: none;' class=\"btn btn-primary btn-lg modelIdcbtnz2x rrmeee\" data-toggle=\"modal\" data-target=\"#modelIdcz2x\">\n        Launch\n        </button>\n        <!-- Modal -->\n        <div class=\"modal fade \" id=\"modelIdcz2x\" tabindex=\"-1\" role=\"dialog\" size='lg' aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n            <div class=\"modal-dialog StandardFont\" role=\"document\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <h5 class=\"modal-title\">\n                        &nbsp;&nbsp;\n                        سكول بت \n                        &nbsp;&nbsp;\n                        <button type=\"button\" class=\"close btn-sm\" data-dismiss=\"modal\" aria-label=\"Close\">\n                            <span aria-hidden=\"true\">&times; اغلاق</span>\n                        </button></h5>\n                    </div>\n                    <div class=\"card-body bisbody\" style='padding: 10px'>\n                        <div class='x_classes'>\n                            <h5><i class='fa fa-users'></i> إختر الصف المراد الرصد له</h5>\n                        </div>\n                    </div>\n                    <div class='card-body' style='padding: 10px; padding-top: 0px'>\n                    <h5>نوع الايجابية</h5>\n                        <div class='options' style='overflow-y: scroll; max-height: 300px; padding: 5px; border: 2px solid #999'>\n                            \n                        </div>\n                    </div>\n                    <div class='card-body'>\n                        <p style=\"margin-top: 10px; color: #0275d8; font-size: 12px; text-align: center;\">\n                            <i class=\"fa fa-info-circle\"></i> في حال اختيار اكثر من سلوك سيتم توزيع السلوكيات المختارة عشوائياً بين الطلاب\n                        </p>\n                        <p style=\"margin-top: -10px; color: #d9534f; font-size: 12px; text-align: center;\">\n                            <i class=\"fa fa-info-circle\"></i> لا يتم رصد درجات السلوك للإنتساب\n                        </p>\n                        <hr>\n                        <div class='col-12 text-center'>\n                            <br>\n                            <button class='btn btn-primary btn-lg addnowx'>\n                                <i class='fa fa-check-square'></i>\n                                رصد السلوك الآن\n                            </button>\n                            <br>\n                        <p style=\"margin-top: 10px; color: #0275d8; font-size: 12px; text-align: center;\">\n                            <i class=\"fa fa-info-circle\"></i> تأكد من اختيار التاريخ أولاً قبل بدء الرصد\n                        </p><br>\n                            <br>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ");
    const v1 = [{
      id: "1601233",
      title: "اخرى ( بناءً على توصية لجنة التوجيه الطلابي) (سلوك متميز)"
    }, {
      id: "1601234",
      title: "أخرى ( بناءً على توصية لجنة التوجيه الطلابي)  (سلوك متميز)"
    }, {
      id: "1601235",
      title: "اخرى (بناءً على توصية لجنة التوجيه الطلابي) (سلوك متميز)"
    }, {
      id: "1601236",
      title: "اخرى( بناءً على توصية لجنة التوجيه الطلابي).  (سلوك متميز)"
    }, {
      id: "1601237",
      title: "اخرى(بناءً على توصية لجنة التوجيه الطلابي). (سلوك متميز)"
    }, {
      id: "1601241",
      title: "المشاركة في الإذاعة. (سلوك متميز)"
    }, {
      id: "1601244",
      title: "المشاركة في أنشطة مهارات الاتصال ( العمل الجماعي ، التعلم بالأقران،..). (سلوك متميز)"
    }, {
      id: "1601245",
      title: "المشاركة في أنشطة مهارات القيادة والمسؤولية (التخطيط، التحفيز،..). (سلوك متميز)"
    }, {
      id: "1601246",
      title: "المشاركة في أنشطة مهارة إدارة الوقت. (سلوك متميز)"
    }, {
      id: "1601247",
      title: "المشاركة في حملة توعوية.  (سلوك متميز)"
    }, {
      id: "1601249",
      title: "تقديم فعالية حوارية. (سلوك متميز)"
    }, {
      id: "1601250",
      title: "تقديم مقترح لصالح المجتمع المدرسي. (سلوك متميز)"
    }, {
      id: "1601252",
      title: "كتابة رسالة شكر(مثلا رسالة للوطن، للقيادة الرشيدة. للأسرة، للمعلم...إلخ). (سلوك متميز)"
    }, {
      id: "189",
      title: "انضباط الطالب وعدم غيابه بدون عذر خلال الفصل الدراسي. (فرص تعويض)"
    }, {
      id: "1601202",
      title: "المشاركة في أنشطة مهارة إدارة الوقت. (فرص تعويض)"
    }, {
      id: "1601205",
      title: "تقديم مقترح لصالح المجتمع المدرسي. (فرص تعويض)"
    }, {
      id: "1601211",
      title: "اخرى(بناءً على توصية لجنة التوجيه الطلابي). (فرص تعويض)"
    }, {
      id: "1601198",
      title: "الالتحاق ببرنامج أو دورة . (فرص تعويض)"
    }, {
      id: "1601201",
      title: "المشاركة في أنشطة المهارات الرقمية( إعداد العروض، تصميم المحتوى الإلكتروني ). (فرص تعويض)"
    }, {
      id: "1601209",
      title: "اخرى(بناءً على توصية لجنة التوجيه الطلابي) (فرص تعويض)"
    }, {
      id: "1601212",
      title: "اخرى(بناءً على توصية لجنة التوجيه الطلابي ). (فرص تعويض)"
    }, {
      id: "1601194",
      title: "المشاركة في الخدمة المجتمعية خارج المدرسة. (فرص تعويض)"
    }, {
      id: "1601238",
      title: "اخرى(بناءً على توصية لجنة التوجيه الطلابي ). (سلوك متميز)"
    }, {
      id: "1601240",
      title: "التعاون مع الزملاء والمعلمين وإدارة المدرسة.  (سلوك متميز)"
    }, {
      id: "1601242",
      title: "المشاركة في الخدمة المجتمعية خارج المدرسة.  (سلوك متميز)"
    }, {
      id: "1601243",
      title: "المشاركة في أنشطة المهارات الرقمية( إعداد العروض، تصميم المحتوى الإلكتروني ). (سلوك متميز)"
    }, {
      id: "1601207",
      title: "اخرى ( بناءً على توصية لجنة التوجيه الطلابي) (فرص تعويض)"
    }, {
      id: "1601208",
      title: "اخرى (بناءً على توصية لجنة التوجيه الطلابي) (فرص تعويض)"
    }, {
      id: "1601200",
      title: "المشاركة في أنشطة مهارات القيادة والمسؤولية (التخطيط، التحفيز،..). (فرص تعويض)"
    }, {
      id: "1601203",
      title: "كتابة رسالة شكر(مثلا رسالة للوطن، للقيادة الرشيدة. للأسرة، للمعلم...إلخ). (فرص تعويض)"
    }, {
      id: "1601210",
      title: "اخرى( بناءً على توصية لجنة التوجيه الطلابي). (فرص تعويض)"
    }, {
      id: "1601251",
      title: "عرض تجارب شخصية ناجحة.  (سلوك متميز)"
    }, {
      id: "1201017",
      title: "الالتحاق ببرنامج أو دورة . (فرص تعويض)"
    }, {
      id: "1601195",
      title: "تقديم فعالية حوارية.  (فرص تعويض)"
    }, {
      id: "1601196",
      title: "المشاركة في حملة توعوية.  (فرص تعويض)"
    }, {
      id: "1601197",
      title: "عرض تجارب شخصية ناجحة. (فرص تعويض)"
    }, {
      id: "1601199",
      title: "المشاركة في أنشطة مهارات الاتصال ( العمل الجماعي ، التعلم بالأقران،..). (فرص تعويض)"
    }, {
      id: "1601204",
      title: "المشاركة في  الإذاعة. (فرص تعويض)"
    }, {
      id: "1601239",
      title: "الالتحاق ببرنامج أو دورة .  (سلوك متميز)"
    }, {
      id: "1601248",
      title: "انضباط الطالب وعدم غيابه بدون عذر خلال الفصل الدراسي. (سلوك متميز)"
    }];
    v1.forEach(function (v2) {
      $(".options").append("\n                <div class=\"form-check\">\n                <label class=\"form-check-label\">\n                    <input type=\"checkbox\" class=\"form-check-input\" value=\"" + v2.id + "\">\n                    " + v2.title + "\n                </label>\n                </div>\n            ");
    });
    $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option").each(function () {
      if (!$(this).text().includes("--")) {
        $(".x_classes").append("\n                    <div class=\"form-check\">\n                    <label class=\"form-check-label\">\n                        <input type=\"radio\" class=\"form-check-input\" name=\"knjnnjj\" value=\"" + $(this).attr("value") + "\">\n                        " + $(this).text() + "\n                    </label>\n                    </div>\n                ");
      }
    });
  }
  $(".modelIdcbtnz2x").click();
  $(".addnowx").click(function () {
    var v3 = [];
    $(".x_classes input:checked").each(function () {
      v3.push($(this).val());
    });
    if (v3.length == 0) {
      return alert("برجاء اختيار الصفوف");
    }
    var v4 = [];
    $(".options input:checked").each(function () {
      v4.push($(this).val());
    });
    if (v4.length == 0) {
      return alert("برجاء نوع السلوك");
    }
    $(".addnowx").attr("disabled", "disabled");
    $(".addnowx").addClass("disabled");
    $(".addnowx").html("\n            <img src=\"" + window.CORBIT_EXT_BASE + "assets/img/loading.svg\" style='width: 30px'>\n            جاري الرصد...    \n        ");
    setTimeout(function () {
      $("#modelIdcz2x .close").click();
      $("#ctl00_PlaceHolderMain_ddlMowadaba option").removeAttr("selected");
      $("#ctl00_PlaceHolderMain_ddlMowadaba option[value='1']").attr("selected", "selected");
      $("#ctl00_PlaceHolderMain_ddlMowadaba").attr("onclick", $("#ctl00_PlaceHolderMain_ddlMowadaba").attr("onchange"));
      $("#ctl00_PlaceHolderMain_ddlMowadaba").removeAttr("onchange");
      $("#ctl00_PlaceHolderMain_ddlMowadaba").click();
      var v5 = setInterval(() => {
        if ($("#ctl00_PlaceHolderMain_ddlDeductType").length) {
          clearInterval(v5);
          $("#ctl00_PlaceHolderMain_ddlDeductType option").removeAttr("selected");
          $("#ctl00_PlaceHolderMain_ddlDeductType option[value='2']").attr("selected", "selected");
          $("#ctl00_PlaceHolderMain_ddlDeductType").attr("onclick", $("#ctl00_PlaceHolderMain_ddlDeductType").attr("onchange"));
          $("#ctl00_PlaceHolderMain_ddlDeductType").removeAttr("onchange");
          $("#ctl00_PlaceHolderMain_ddlDeductType").click();
          $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option").removeAttr("selected");
          $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option[value='" + v3[0] + "']").attr("selected", "selected");
          $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").attr("onclick", $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").attr("onchange"));
          $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").removeAttr("onchange");
          $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").click();
          var v6 = setInterval(() => {
            if (!$("#LoadBackGround").is(":visible")) {
              clearInterval(v6);
              localStorage.setItem("addBis", JSON.stringify({
                classes: v3,
                options: v4
              }));
              $("#ctl00_PlaceHolderMain_ibtnSearch").click();
            }
          });
        }
      }, 10);
    }, 1000);
  });
});
$("select").change(function () {
  $(".addbisbtn").addClass("disabled");
  $(".addbisbtn").click(function () {
    window.location.hash = "addbtn";
    location.reload();
  });
});
if (window.location.href.includes("addbtn")) {
  $(".addbisbtn").click();
}
if (localStorage.getItem("addBis")) {
  var t = JSON.parse(localStorage.getItem("addBis"));
  if (t.classes) {
    if (t.classes.length) {
      setTimeout(function () {
        if ($("#ctl00_PlaceHolderMain_UpdatePanel6").length) {
          $("#ctl00_PlaceHolderMain_gvClassStudentsAttendance_ctl01_cbHeader").click();
          setTimeout(function () {
            $("#ctl00_PlaceHolderMain_UpdatePanel6 select").each(function () {
              var v7 = $(this).parent();
              v7.find("select option").removeAttr("selected");
              v7.find("select").fadeIn();
              v7.find("select").removeClass("select2-hidden-accessible");
              v7.find(".select2-selection").fadeOut();
              v7.find(".ValidationClass").fadeOut(0);
              var v8 = Math.floor(Math.random() * t.options.length);
              var v9 = t.options[v8];
              v7.find("select option[value='" + v9 + ",']").attr("selected", "selected");
              localStorage.removeItem("addBis");
              setTimeout(function () {
                localStorage.setItem("done_message_bis", "yes");
                $("#ctl00_PlaceHolderMain_ibtnSave").click();
              }, 500);
            });
          }, 500);
        }
      }, 500);
    }
  }
}
if (localStorage.getItem("done_message_bis")) {
  localStorage.removeItem("done_message_bis");
  alert("تم الرصد بنجاح");
}