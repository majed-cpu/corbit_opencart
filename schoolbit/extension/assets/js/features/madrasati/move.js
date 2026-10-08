setTimeout(function () {
  {
    var v2 = [];
    if ($("#corbit-modal-import-students-from-noor").length == 0) {
      $("body").append("\n            <button type=\"button\" class=\"btn btn-primary btn-lg dnone\" data-toggle=\"modal\" data-target=\"#corbit-modal-import-students-from-noor\" onclick=\"$('#corbit-modal-import-students-from-noor').modal('show')\"></button>\n            <!-- Modal -->\n            <div class=\"modal fade\" id=\"corbit-modal-import-students-from-noor\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modelTitleId\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\" style='position: relative'>\n                        <div class='nloadingy' style='background: #eee; opacity: 0.5; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 9999; border-radius: 50px'>\n                            <h1 style='\n                            margin: 0;\n                            position: absolute;\n                            top: 50%;\n                            left: 50%;\n                            color: 'red';\n                            -ms-transform: translate(-50%, -50%);\n                            transform: translate(-50%, -50%);'>جاري التحميل...<br><small>ربما يستغرق دقائق.</small></h1>\n                        </div>\n                        <div id='Doneee'></div>\n                        <div class='import-s imports'>\n                            <form action='https://local.maaref.invalid/noor-to-madrasati?school_id=" + school_id + "' method='post' enctype=\"multipart/form-data\" id='xf'>\n                                <input type='hidden' name='classes' id='classesx'>\n                                <input type='hidden' name='re' id='re'>\n                                <div class=\"form-group\">\n                                <label for=\"\">ملف الارشاد الطلابي من نور</label>\n                                <input type=\"file\"\n                                    class=\"form-control\" id=\"addnumbersinput\" name=\"file\" accept='.xls,.xlsx'>\n                                </div>\n                                <div class='col-12 text-center'>\n                                    <br>\n                                    <button class='btn btn-success aaaccasd disabled' disabled type='button'>\n                                    جاري الاستعلام عن الفصول...</button>\n                                </div>\n                            </form>\n                            <span style='color: red; font-size: 18px'>\n                                <br>\n                                \n                                تعليمات هامة:\n                                <br>\n                                <ul>\n                                    <li>\n                                        يتم استخدامها فقط عند الرغبة بنقل الطلاب من نور لمدرستي، في حالة عدم تسجيلهم مسبقاً.\n                                    </li>\n                                    <li>\n                                        برجاء التأكد من اضافة بيانات الطلاب اولاً من خلال الاداة او اضافتهم يدوياً للمنصة.\n                                    </li>\n                                    <li>\n                                        تحديث بيانات الطلاب للأداة من خلال الأداة.\n                                    </li>\n                                </ul>\n                            </span>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            ");
    }
    $(".aaaccasd").click(function () {
      if ($("#classesx").val() == "") {
        alert("فشل الاستعلام عن الفصول٫ برجاء اعادة تحديث الصفحة واعادة المحاولة");
        setTimeout(function () {
          location.reload();
        }, 5000);
      } else {
        $("#xf").submit();
      }
    });
    $(".nloadingy").fadeOut();
    $("[data-target=\"#corbit-modal-import-students-from-noor\"]").click();
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
    }).then(v3 => {
      return v3.json();
    }).then(v4 => {
      $("<div>" + v4.html + "</div>").find(".list-group .list-group-item").each(function () {
        v2.push({
          title: $(this).find("h6").text().trim(),
          number: $(this).find(".fa-users").parent().attr("href").split("Students/")[1]
        });
      });
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
      }).then(v5 => {
        return v5.json();
      }).then(v6 => {
        $("<div>" + v6.html + "</div>").find(".list-group .list-group-item").each(function () {
          v2.push({
            title: $(this).find("h6").text().trim(),
            number: $(this).find(".fa-users").parent().attr("href").split("Students/")[1]
          });
        });
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
          body: "pageNumber=3&treeId=0&SemesterId=" + localStorage.getItem("semesterId2") + "&schoolId=" + school_id,
          method: "POST",
          mode: "cors",
          credentials: "include"
        }).then(v7 => {
          return v7.json();
        }).then(v8 => {
          $("<div>" + v8.html + "</div>").find(".list-group .list-group-item").each(function () {
            v2.push({
              title: $(this).find("h6").text().trim(),
              number: $(this).find(".fa-users").parent().attr("href").split("Students/")[1]
            });
          });
          if (v2.length == 0) {
            alert("برجاء التاكد من وجود فصول في مدرستي اولاً٫ واعد المحاولة");
          }
          $("#classesx").val(JSON.stringify(v2));
          $("#re").val(window.location);
          $(".aaaccasd").html("اضافة الان");
          $(".aaaccasd").removeClass("disabled");
          $(".aaaccasd").removeAttr("disabled");
        });
      });
    });
  }
}, 0);