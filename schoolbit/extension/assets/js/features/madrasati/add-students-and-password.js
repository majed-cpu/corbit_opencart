if ($("#corbit-modal-import-table-from-noor").length == 0) {
  $("body").append("\n<Style>\n#custom-names, .nloadingy, .nloadingyss, .dnone{\n  display: none\n}</Style>\n    <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" onclick=\"$('#corbit-modal-import-table-from-noor').modal('show')\" data-target=\"#corbit-modal-import-table-from-noor\"></button>\n    <!-- Modal -->\n    <div class=\"modal fade\" id=\"corbit-modal-import-table-from-noor\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n        <div class=\"modal-dialog\" role=\"document\">\n            <div class=\"modal-content\" style='position: relative'>\n            <iframe id='iframa' class='dnone' src='https://schools.madrasati.sa/SchoolManagment/Students/AddStudent?SchoolId=" + school_id + "' style='width: 100%; height: 300px'></iframe>\n            <div id='Doneee'></div>\n          <div class='import-s imports' style='padding: 20px'>\n              <div class=\"form-group\">\n                <label for=\"\">ملف الارشاد الطلابي من نور</label>\n                <input type=\"file\"\n                  class=\"form-control\" id=\"addnumbersinput\" accept='.xls,.xlsx'>\n              </div>\n              </div><br>\n          </div>\n        </div>\n    </div>\n");
}
$(".nloadingy").fadeOut();
$("[data-target=\"#corbit-modal-import-table-from-noor\"]").click();
document.getElementById("addnumbersinput").addEventListener("change", function (v1) {
  $(".nloadingy").fadeIn();
  $(".import-s").html("جاري الرفع...");
  var v2 = this.files[0];
  var v3 = new XMLHttpRequest();
  try {
    v3.open("POST", "https://local.maaref.invalid/excel", true);
    v3.onreadystatechange = function () {
      if (v3.readyState === 4) {
        if (v3.status === 200) {
          var v5 = [];
          var v6 = 0;
          var v7 = JSON.parse(this.responseText);
          v7.forEach(function (v9) {
            if (Number.isInteger(Number(v9[1])) && v9[1]) {
              v5.push(v9);
            }
          });
          $(".import-s").fadeOut("slow");
          $("#iframa").fadeIn();
          function v8() {
            if (!v5[0]) {
              alert("تم الانتهاء من الاضافة");
              location.reload();
            } else {
              $("#iframa").contents().find(".navbar").remove();
              $("#iframa").contents().find("#page-wrapper > div:nth-child(11) > div").remove();
              $("#iframa").contents().find("#page-wrapper > div:nth-child(11) > div").remove();
              $("#iframa").contents().find(".navbar").remove();
              $("#iframa").contents().find(".page-header").remove();
              $("#iframa").contents().find("#NationalId").val(v5[0][5]);
              $("#iframa").contents().find("[novalidate=\"novalidate\"]").submit();
              $("#iframa").unbind("load");
              v6 = v6 + 1;
              $("#Doneee").html("<h2>تم معالجة " + v6 + " من " + (v5.length + v6) + "</h2>");
              var v10 = setTimeout(() => {
                $("#iframa").unbind("load");
                $("#iframa").attr("src", function (v11, v12) {
                  return v12;
                });
                setTimeout(() => {
                  v8();
                }, 5000);
              }, 20000);
              $("#iframa").on("load", function () {
                clearTimeout(v10);
                setTimeout(() => {
                  v5.shift();
                  v8();
                }, 1000);
              });
            }
          }
          v8();
        } else {
          alert("حدث خطأ " + JSON.stringify(v3));
        }
      }
    };
    v3.onerror = function (v13) {
      alert("حدث خطأ " + JSON.stringify(v13.error));
    };
    var v4 = new FormData();
    v4.append("file", v2);
    v3.send(v4);
  } catch (v14) {
    alert("حدث خطأ " + JSON.stringify(v14));
  }
});