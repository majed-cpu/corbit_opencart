function endGhiab() {
  $("body").append("<textarea class='save-me-to-local-storage' name='ghiab-students'></textarea>");
}
$("body").append("<textarea class='get-local-storage' name='ghiab-students'></textarea>");
var i_t_1 = 0;
var i1 = setInterval(() => {
  if (i_t_1 >= 500) {
    clearInterval(i1);
  }
  i_t_1++;
  if ($(".get-local-storage-value[name='ghiab-students']").length) {
    clearInterval(i1);
    var v1 = $(".get-local-storage-value[name='ghiab-students']").val();
    if (v1 && v1 != "undefined" && v1 != "") {
      v1 = JSON.parse(v1);
    } else {
      v1 = [];
    }
    if (v1.length) {
      if ($("#divEnterAttendance").length) {
        $("#btnCancel").click();
      }
      var v2;
      if ($("#ctl00_ulUserMenu a:contains('الإختبارات')").length && $("#ctl00_ulUserMenu a:contains('المهارات')").length) {
        v2 = "eb";
      }
      if ($("#ctl00_ulUserMenu a:contains('السلوك والمواظبة')").length) {
        v2 = "mt";
      }
      if ($("#ctl00_ulUserMenu a:contains('الإختبارات')").length && $("#ctl00_ulUserMenu a:contains('المهارات')").length == 0) {
        v2 = "mq";
      }
      if (v2 == "undefined" || v2 == undefined && !window.location.href.includes("Login") && !window.location.href.includes("login")) {
        $("body").append("\n                    <!-- Button trigger modal -->\n                    <button type=\"button\" style='display: none;' class=\"btn btn-primary btn-lg modelIdbtn\" data-toggle=\"modal\" data-target=\"#modelId\">\n                    Launch\n                    </button>\n                    <!-- Modal -->\n                    <div class=\"modal fade\" id=\"modelId\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n                        <div class=\"modal-dialog\" role=\"document\">\n                            <div class=\"modal-content\">\n                                <div class=\"modal-header\">\n                                    <h5 class=\"modal-title\">تغيير الحساب</h5>\n                                        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                                            <span aria-hidden=\"true\">&times;</span>\n                                        </button>\n                                </div>\n                                <div class=\"modal-body\">\n                                    <strong style='color: red;'>عفواً، هذا الحساب ليس لديه صلاحيات إضافة الغياب.<br> يرجى إختيار الحساب من الحسابات التالية:</strong>\n                                    <br><br>\n                                    <div class='as1asd22cxas'></div>\n                                    <br><br>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    ");
        $(".modelIdbtn").click();
        $(".as1asd22cxas").html($("#ctl00_oHeader_ulUserExtraProfiles").html());
      }
      $("body").append("<textarea class='get-local-storage' name='stage'></textarea>");
      var v3 = setInterval(() => {
        if ($(".get-local-storage-value[name='stage']").length) {
          clearInterval(v3);
          v2 = $(".get-local-storage-value[name='stage']").val();
          $("body").append("<textarea class='get-local-storage' name='ghiab-type'></textarea>");
          var v4 = setInterval(() => {
            if ($(".get-local-storage-value[name='ghiab-type']").length) {
              clearInterval(v4);
              var v5 = $(".get-local-storage-value[name='ghiab-type']").val();
              if (window.location.pathname == "/Noor/EduWaveSMS/ManageAttend" || window.location.pathname == "/Noor/EduWaveSMS/ManageAttendance.aspx" || window.location.pathname == "/Noor/EduWaveCH/ManageAttendance.aspx") {
                if (v2 == "mq") {
                  if (v5 == "day") {
                    if ($("#ctl00_PlaceHolderMain_ddlMowadaba").length && $("#ctl00_PlaceHolderMain_ddlMowadaba").val() == "-99") {
                      $("#ctl00_PlaceHolderMain_ddlMowadaba option").removeAttr("selected");
                      $("#ctl00_PlaceHolderMain_ddlMowadaba option[value='2']").attr("selected", "selected");
                      $("#ctl00_PlaceHolderMain_ddlMowadaba").attr("onclick", $("#ctl00_PlaceHolderMain_ddlMowadaba").attr("onchange"));
                      $("#ctl00_PlaceHolderMain_ddlMowadaba").removeAttr("onchange");
                      $("#ctl00_PlaceHolderMain_ddlMowadaba").click();
                      setTimeout(() => {
                        $("#ctl00_PlaceHolderMain_ddlViolation option").removeAttr("selected");
                        $("#ctl00_PlaceHolderMain_ddlViolation option[value='1']").attr("selected", "selected");
                        $("#ctl00_PlaceHolderMain_ddlViolation").attr("onclick", $("#ctl00_PlaceHolderMain_ddlViolation").attr("onchange"));
                        $("#ctl00_PlaceHolderMain_ddlViolation").removeAttr("onchange");
                        $("#ctl00_PlaceHolderMain_ddlViolation").click();
                        setTimeout(() => {
                          $("#ctl00_PlaceHolderMain_ibtnSearch").click();
                        }, 3000);
                      }, 3000);
                    } else {
                      function v7(v8, v9, v10, v11) {
                        var v12 = {
                          view: window,
                          bubbles: true,
                          cancelable: true,
                          clientX: v10,
                          clientY: v11,
                          button: 0
                        };
                        v8.dispatchEvent(new MouseEvent(v9, v12));
                      }
                      if ($("th:contains('نوع المخالفة')").length) {
                        function v13() {
                          $.each(v1, function (v14, v15) {
                            var v16 = $("a:contains('" + v15.name?.trim() + "')").parent().parent();
                            var v17 = v16;
                            $("input[type='checkbox']", v16).click();
                            setTimeout(() => {
                              $("select option", v17).removeAttr("selected");
                              $("select", v17).fadeIn();
                              $("select", v17).removeClass("select2-hidden-accessible");
                              $(".select2-selection", v17).fadeOut();
                              $(".ValidationClass", v17).fadeOut(0);
                              $("select option[value='" + v15.status + "']", v16).attr("selected", "selected");
                            }, 100);
                          });
                          setTimeout(() => {
                            if ($("a[href*='Page$" + (new Number($(".MyPagerStyle .StandardFont").text()) + 1) + "']").length) {
                              var v18 = $("a[href*='Page$" + (new Number($(".MyPagerStyle .StandardFont").text()) + 1) + "']")[0];
                              var v19 = v18;
                              var v20 = v19.getBoundingClientRect();
                              var v21 = v20.left + (v20.right - v20.left) / 2;
                              var v22 = v20.top + (v20.bottom - v20.top) / 2;
                              v7(v19, "mousedown", v21, v22);
                              v7(v19, "mouseup", v21, v22);
                              v7(v19, "click", v21, v22);
                              setTimeout(() => {
                                v13();
                              }, 5000);
                            } else {
                              alert("تمت العملية بنجاح!.");
                              endGhiab();
                              throw new Error("--");
                            }
                          }, 2000);
                        }
                        v13();
                      }
                    }
                  }
                } else if (v2 == "mas") {
                  if (v5 == "day") {
                    if ($("#ctl00_PlaceHolderMain_gvClassStudentsAttendance").length == 0 || $("#ctl00_PlaceHolderMain_lblOperationResult:contains('تمت عملية الحفظ بنجاح.')").is(":visible")) {
                      if (!$("#ctl00_PlaceHolderMain_lblOperationResult:contains('تمت عملية الحفظ بنجاح.')").is(":visible")) {
                        $("#ctl00_PlaceHolderMain_ddlMowadaba option").removeAttr("selected");
                        $("#ctl00_PlaceHolderMain_ddlMowadaba option[value='2']").attr("selected", "selected");
                        $("#ctl00_PlaceHolderMain_ddlMowadaba").attr("onclick", $("#ctl00_PlaceHolderMain_ddlMowadaba").attr("onchange"));
                        $("#ctl00_PlaceHolderMain_ddlMowadaba").removeAttr("onchange");
                        $("#ctl00_PlaceHolderMain_ddlMowadaba").click();
                      }
                      var v6 = setInterval(() => {
                        if (!$("#refresh2").is(":visible")) {
                          clearInterval(v6);
                          if (!$("#ctl00_PlaceHolderMain_lblOperationResult:contains('تمت عملية الحفظ بنجاح.')").is(":visible")) {
                            $("#ctl00_PlaceHolderMain_ddlViolation option").removeAttr("selected");
                            $("#ctl00_PlaceHolderMain_ddlViolation option[value='1']").attr("selected", "selected");
                            $("#ctl00_PlaceHolderMain_ddlViolation").attr("onclick", $("#ctl00_PlaceHolderMain_ddlViolation").attr("onchange"));
                            $("#ctl00_PlaceHolderMain_ddlViolation").removeAttr("onchange");
                            $("#ctl00_PlaceHolderMain_ddlViolation").click();
                          }
                          var v23 = setInterval(() => {
                            if (!$("#refresh2").is(":visible")) {
                              clearInterval(v23);
                              if (!$("#ctl00_PlaceHolderMain_lblOperationResult:contains('تمت عملية الحفظ بنجاح.')").is(":visible")) {
                                $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option").first().remove();
                              } else {
                                $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option[selected]").prevAll().remove();
                                $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option[selected]").remove();
                                if ($("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option").length == 0) {
                                  alert("تمت العملية بنجاح!");
                                  endGhiab();
                                  throw new Error("--");
                                }
                              }
                              $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option").first().attr("selected", "selected");
                              $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").attr("onclick", $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").attr("onchange"));
                              $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").removeAttr("onchange");
                              $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").click();
                              var v24 = setInterval(() => {
                                if (!$("#refresh2").is(":visible")) {
                                  clearInterval(v24);
                                  $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty option").first().attr("selected", "selected");
                                  $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty").attr("onclick", $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty").attr("onchange"));
                                  $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty").removeAttr("onchange");
                                  $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty").click();
                                  if ($("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option").length == 0) {
                                    alert("تمت العملية بنجاح!");
                                    endGhiab();
                                    throw new Error("--");
                                  }
                                  var v25 = setInterval(() => {
                                    if (!$("#refresh2").is(":visible")) {
                                      clearInterval(v25);
                                      $("#ctl00_PlaceHolderMain_ibtnSearch").click();
                                    }
                                  }, 100);
                                }
                              }, 100);
                            }
                          }, 100);
                        }
                      }, 100);
                    } else {
                      $.each(v1, function (v26, v27) {
                        var v28 = $("a:contains('" + v27.name?.trim() + "')").parent().parent();
                        var v29 = v28;
                        $("input[type='checkbox']", v28).click();
                        $("select option", v29).removeAttr("selected");
                        $("select", v29).fadeIn();
                        $("select", v29).removeClass("select2-hidden-accessible");
                        $(".select2-selection", v29).fadeOut();
                        $(".ValidationClass", v29).fadeOut(0);
                        $("select option[value='" + v27.status + "']", v28).attr("selected", "selected");
                      });
                      setTimeout(() => {
                        $("#ctl00_PlaceHolderMain_ibtnSave").click();
                      }, 2000);
                    }
                  }
                } else if (v5 == "day") {
                  if ($("#ctl00_PlaceHolderMain_gvClassStudentsAttendance").length == 0 || $("#ctl00_PlaceHolderMain_lblOperationResult:contains('تمت عملية الحفظ بنجاح.')").is(":visible")) {
                    if (!$("#ctl00_PlaceHolderMain_lblOperationResult:contains('تمت عملية الحفظ بنجاح.')").is(":visible")) {
                      $("#ctl00_PlaceHolderMain_ddlMowadaba option").removeAttr("selected");
                      $("#ctl00_PlaceHolderMain_ddlMowadaba option[value='2']").attr("selected", "selected");
                      $("#ctl00_PlaceHolderMain_ddlMowadaba").attr("onclick", $("#ctl00_PlaceHolderMain_ddlMowadaba").attr("onchange"));
                      $("#ctl00_PlaceHolderMain_ddlMowadaba").removeAttr("onchange");
                      $("#ctl00_PlaceHolderMain_ddlMowadaba").click();
                    }
                    var v6 = setInterval(() => {
                      if (!$("#refresh2").is(":visible")) {
                        clearInterval(v6);
                        if (!$("#ctl00_PlaceHolderMain_lblOperationResult:contains('تمت عملية الحفظ بنجاح.')").is(":visible")) {
                          $("#ctl00_PlaceHolderMain_ddlViolation option").removeAttr("selected");
                          $("#ctl00_PlaceHolderMain_ddlViolation option[value='1']").attr("selected", "selected");
                          $("#ctl00_PlaceHolderMain_ddlViolation").attr("onclick", $("#ctl00_PlaceHolderMain_ddlViolation").attr("onchange"));
                          $("#ctl00_PlaceHolderMain_ddlViolation").removeAttr("onchange");
                          $("#ctl00_PlaceHolderMain_ddlViolation").click();
                        }
                        var v30 = setInterval(() => {
                          if (!$("#refresh2").is(":visible")) {
                            clearInterval(v30);
                            if (!$("#ctl00_PlaceHolderMain_lblOperationResult:contains('تمت عملية الحفظ بنجاح.')").is(":visible")) {
                              $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option").first().remove();
                            } else {
                              $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option[selected]").prevAll().remove();
                              $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option[selected]").remove();
                            }
                            if ($("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass option").length == 0) {
                              alert("تمت العملية بنجاح!");
                              endGhiab();
                              throw new Error("--");
                            }
                            $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").attr("onclick", $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").attr("onchange"));
                            $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").removeAttr("onchange");
                            $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlClass").click();
                            var v31 = setInterval(() => {
                              if (!$("#refresh2").is(":visible")) {
                                clearInterval(v31);
                                $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty option").first().attr("selected", "selected");
                                $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty").attr("onclick", $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty").attr("onchange"));
                                $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty").removeAttr("onchange");
                                $("#ctl00_PlaceHolderMain_oDistributionSearch_ddlSpecialty").click();
                                var v32 = setInterval(() => {
                                  if (!$("#refresh2").is(":visible")) {
                                    clearInterval(v32);
                                    var v33 = setInterval(() => {
                                      if (!$("#refresh2").is(":visible")) {
                                        clearInterval(v33);
                                        $("#ctl00_PlaceHolderMain_ibtnSearch").click();
                                      }
                                    }, 100);
                                  }
                                }, 100);
                              }
                            }, 100);
                          }
                        }, 100);
                      }
                    }, 100);
                  } else {
                    $.each(v1, function (v34, v35) {
                      var v36 = $("a:contains('" + v35.name?.trim() + "')").parent().parent();
                      var v37 = v36;
                      $("input[type='checkbox']", v36).click();
                      $("select option", v37).removeAttr("selected");
                      $("select", v37).fadeIn();
                      $("select", v37).removeClass("select2-hidden-accessible");
                      $(".select2-selection", v37).fadeOut();
                      $(".ValidationClass", v37).fadeOut(0);
                      $("select option[value='" + v35.status + "']", v36).attr("selected", "selected");
                    });
                    setTimeout(() => {
                      $("#ctl00_PlaceHolderMain_ibtnSave").click();
                    }, 2000);
                  }
                }
              }
            }
          }, 10);
        }
      }, 10);
    }
  }
}, 100);