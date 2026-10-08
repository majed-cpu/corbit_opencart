corbit_get("addlate").then(function (v1) {
  var v2 = JSON.parse(v1);
  if (!v2.length) {
    corbit_set("addlate", "undefined").then(function () {
      localStorage.removeItem("addlate");
      alert("تم بنجاح");
      corbit_runNoorLink($("#ulUserMenu a:contains('شؤون المعلمين')")[0]);
    });
  }
  if (window.location.href.includes("SchoolAdminTeacherAffairsMenu")) {
    $("#search_list > div:nth-child(2)").append("\n        <div class='col-12 text-center g'>\n            <br>\n            <button type='button' class='btn btn-lg btn-danger addlate'>\n                <i class='fa fa-check'></i>\n                اضافة تأخر (" + JSON.parse(v1).length + ") معلم الآن\n            </button>\n        </div>\n        ");
    $(".addlate").click(function () {
      localStorage.setItem("addlate", "yes");
      location.reload();
    });
  }
  if (localStorage.getItem("addlate")) {
    $("body").append("\n        <button class='btn btn-danger  ssstype' style='position: fixed; left: 20px; bottom: 20px; z-index: 9999'>ايقاف اضافة التاخر الان</button>\n        ");
    $(".ssstype").click(function () {
      localStorage.removeItem("addlate");
      location.reload();
    });
    if ($("#ctl00_PlaceHolderMain_divSearchList > div > div:nth-child(3) > a").length) {
      $("#ctl00_PlaceHolderMain_divSearchList > div > div:nth-child(3) > a").click();
    }
    if (window.location.href.includes("UserSearch.aspx") && $(".GridClass tr").length == 0 && $("#ctl00_PlaceHolderMain_tdShowUserInfo").length == 0) {
      $("#ctl00_PlaceHolderMain_ibtnSearch").click();
    }
    if (window.location.href.includes("UserSearch.aspx") && $(".GridClass tr").length > 0 && $("#ctl00_PlaceHolderMain_tdShowUserInfo").length == 0) {
      function v7(v9, v10) {
        v9 = v9.toLowerCase();
        v10 = v10.toLowerCase();
        var v11 = new Array();
        for (var v12 = 0; v12 <= v9.length; v12++) {
          var v13 = v12;
          for (var v14 = 0; v14 <= v10.length; v14++) {
            if (v12 == 0) {
              v11[v14] = v14;
            } else if (v14 > 0) {
              var v15 = v11[v14 - 1];
              if (v9.charAt(v12 - 1) != v10.charAt(v14 - 1)) {
                v15 = Math.min(Math.min(v15, v13), v11[v14]) + 1;
              }
              v11[v14 - 1] = v13;
              v13 = v15;
            }
          }
          if (v12 > 0) {
            v11[v10.length] = v13;
          }
        }
        return v11[v10.length];
      }
      function v8(v16, v17) {
        var v18 = v16;
        var v19 = v17;
        if (v16.length < v17.length) {
          v18 = v17;
          v19 = v16;
        }
        var v20 = v18.length;
        if (v20 == 0) {
          return 1;
        }
        return (v20 - v7(v18, v19)) / parseFloat(v20);
      }
      var v3 = v2[0];
      var v4 = 0.5;
      var v5 = null;
      var v6 = {};
      $(".GridClass tbody tr").each(function () {
        var v21 = $(this);
        if ($(this).find("td:nth-child(2)").text() && $(this).find("td:nth-child(2)")?.text()?.trim() != "") {
          if (v8($(this).find("td:nth-child(2)")?.text()?.trim(), v3.name) > v4) {
            v4 = v8($(this).find("td:nth-child(2)")?.text()?.trim(), v3.name);
            v5 = $(this).find(".StandardFont")[0];
            v6 = v3;
          }
        }
      });
      corbit_runNoorLink(v5);
      localStorage.setItem("teacher", JSON.stringify(v6));
    }
    if ($("#ctl00_PlaceHolderMain_tdShowUserInfo").length > 0) {
      corbit_runNoorLink($("#ctl00_PlaceHolderMain_lbtnTeacherLeaving")[0]);
    }
    if ($("#select2-ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlFilterAbsenceType-container").length) {
      corbit_runNoorLink($("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_lbtnLeaving")[0]);
    }
    if ($("#select2-ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlTypeOfViolation-container").length && !$("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlLateOrLeaveType").length) {
      $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlTypeOfViolation").val("1");
      $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlTypeOfViolation").attr("onclick", $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlTypeOfViolation").attr("onchange"));
      $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlTypeOfViolation").click();
    }
    if ($("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlLateOrLeaveType").length) {
      $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_ddlLateOrLeaveType").val(JSON.parse(localStorage.getItem("teacher")).type);
      $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_clrLateOrLeaveFromDate_ibtnOpenHijriCalendar").click();
      $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_clrLateOrLeaveFromDate_ifrmHijriCalendar").on("load", function () {
        if ($("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_clrLateOrLeaveFromDate_ifrmHijriCalendar").contents().find(".CurrentDay a").attr("href")) {
          // الرابط داخل iframe التقويم، فيعمل في نافذته هو.
          corbit_runNoorLink($("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_clrLateOrLeaveFromDate_ifrmHijriCalendar").contents().find(".CurrentDay a")[0]);
          $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_tbLateOrLeaveHours").val(JSON.parse(localStorage.getItem("teacher")).h ?? 0);
          $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_tbLateOrLeaveMin").val(JSON.parse(localStorage.getItem("teacher")).m ?? 0);
          setTimeout(function () {
            $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_ibtnSaveLateOrLeave").click();
          }, 1000);
        }
      });
    }
    if ($("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_lblResultMsg").length && $("#ctl00_PlaceHolderMain_oTeacherAttendanceUC_gvTeacherAttendanceHead_ctl02_lbtnViewDetails").length) {
      v2.shift();
      corbit_set("addlate", JSON.stringify(v2)).then(function () {
        corbit_runNoorLink($("#ulUserMenu a:contains('شؤون المعلمين')")[0]);
      });
    }
  }
});