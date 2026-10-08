$(".form-actions").append("\n<td style=\"font-family: 'Droid Arabic Kufi' !important; padding: 10px; border: dashed 1px darkred;\">\n    <div class='col-12 text-center sdfsdfsdfsdf'>\n        <button class='btn btn-danger alerts' style='width: 100%; border-radius: 0px' type='button'>\n        <i class='fas fa-exclamation-circle text-danger' style='font-size:20px'></i>\n        طباعة وارسال انذارات الغياب\n        </button>\n    </div>\n</td>\n");
setTimeout(() => {
  corbit_get("school_id").then(function (v1) {
    corbit_get("school_name").then(function (v2) {
      $(".alerts").click(function () {
        $(".sdfsdfsdfsdf").html("\n            <img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' style='width: 100px'>\n            ");
        var v3 = [];
        var v4 = {};
        function v5() {
          var v8 = $("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_fixedTable .r15:contains('اسم الطالب')").parent().parent().parent().parent().find("td").first().text().trim();
          if (!v4[v8]) {
            v4[v8] = true;
            var v9 = [];
            $("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_fixedTable").find(".r15:contains('غياب بدون عذر')").parent().parent().parent().parent().parent().find("tr").each(function (v10) {
              if ($(this).find("td:nth-child(2)").text().trim().includes("/") && $(this).find("td:nth-child(3)").text().trim() != "" && !$(this).find("td:nth-child(1)").text().trim().includes("بعذر")) {
                v9.push({
                  date: $(this).find("td:nth-child(2)").text().trim(),
                  day: $(this).find("td:nth-child(3)").text().trim()
                });
              }
            });
            v3.push({
              name: v8,
              count: $("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_fixedTable").find(".r15:contains('غياب بدون عذر')").length,
              days: v9
            });
          }
        }
        function v6() {
          v5();
          if ($("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_ctl09_ctl00_CurrentPage").val() == $("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_ctl09_ctl00_TotalPages").text().trim()) {
            corbit_set("alerts", JSON.stringify(v3)).then(function () {
              window.open(corbit_report_url("students-alerts") + "&school_id=" + v1 + "&school_name=" + encodeURIComponent(v2 || ""));
              $(".sdfsdfsdfsdf").html("<br><a href='" + corbit_report_url("students-alerts") + "&school_id=" + v1 + "&school_name=" + encodeURIComponent(v2 || "") + "' target='_blank' class='btn btn-success text-white' style='color: white'><i class='fa fa-external-link'></i> عرض التقرير الان</a>");
            });
          } else {
            $("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_ctl09_ctl00_Next_ctl00_ctl00").click();
            var v11 = setInterval(function () {
              if (!$("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_ctl09_ctl00_CurrentPage").is(":disabled")) {
                clearInterval(v11);
                v6();
              }
            });
          }
        }
        $("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_ctl09_ctl00_First_ctl00_ctl00").click();
        var v7 = setInterval(function () {
          if (!$("#ctl00_PlaceHolderMain_rvStudentLevelAbsence_ctl09_ctl00_CurrentPage").is(":disabled")) {
            clearInterval(v7);
            v6();
          }
        });
      });
    });
  });
}, 1100);
