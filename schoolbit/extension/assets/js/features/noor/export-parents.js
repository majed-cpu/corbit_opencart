if ($("#ctl00_PlaceHolderMain_lbtnClickHere").length) {
  $("#ctl00_PlaceHolderMain_lbtnClickHere").parent().append("\n        <button class='btn btn-danger sdf4455452' type='button'>\n            <i class='fa fa-file'></i>\n           تصدير بيانات أولياء الأمور لمنصة مدارس\n            <br>\n            <i><small>سكول بت</small></i>\n        </button>\n    ");
  $(".sdf4455452").click(function () {
    var v1 = [];
    $("#ctl00_PlaceHolderMain_gvManagementUsers tbody tr").each(function () {
      if ($(this).find("td:nth-child(2)").text().trim() != "" && $(this).find("td:nth-child(2)").text().trim().length > 5) {
        v1.push({
          name: $(this).find("td:nth-child(2)").text().trim(),
          number: $(this).find("td:nth-child(1)").first().text().trim().replace(/[^\d]/g, "")
        });
      }
    });
    localStorage.setItem("exportParents", JSON.stringify(v1));
    corbit_runNoorLink($(".MyPagerStyle .StandardFont").parent().next().find("a")[0]);
    $(".sdf4455452").remove();
  });
} else {
  $(".form-actions").first().append("\n        <button class='btn btn-danger sdf445545' type='button'>\n            <i class='fa fa-file'></i>\n           تصدير بيانات أولياء الأمور لمنصة مدارس\n            <br>\n            <i><small>سكول بت</small></i>\n        </button>\n    ");
  $(".sdf445545").click(function () {
    localStorage.setItem("exportParents", JSON.stringify([]));
    $("#ctl00_PlaceHolderMain_ibtnSearch").click();
    $(".sdf445545").remove();
  });
}
if (localStorage.getItem("exportParents")) {
  $(".sdf4455452").remove();
  $("#ctl00_PlaceHolderMain_lbtnClickHere").parent().append("<img src='" + window.CORBIT_EXT_BASE + "assets/img/loading.svg' width='100'> جاري التحميل...");
  var t = JSON.parse(localStorage.getItem("exportParents"));
  $("#ctl00_PlaceHolderMain_gvManagementUsers tbody tr").each(function () {
    if ($(this).find("td:nth-child(2)").text().trim() != "" && $(this).find("td:nth-child(2)").text().trim().length > 5) {
      t.push({
        name: $(this).find("td:nth-child(2)").text().trim(),
        number: $(this).find("td:nth-child(1)").first().text().trim().replace(/[^\d]/g, "")
      });
    }
  });
  localStorage.setItem("exportParents", JSON.stringify(t));
  if ($(".MyPagerStyle .StandardFont").parent().next().find("a").attr("href")) {
    corbit_runNoorLink($(".MyPagerStyle .StandardFont").parent().next().find("a")[0]);
  } else {
    // SheetJS is bundled locally (features/lib/xlsx.full.min.js).
    // Load it via the extension base so we don't reach out to a CDN.
    if (typeof XLSX === "undefined") {
      var _corbitBase = window.CORBIT_LOCAL_FILES_BASE || "";
      var _s = document.createElement("script");
      _s.src = _corbitBase + "lib/xlsx.full.min.js";
      document.head.appendChild(_s);
    }
    setTimeout(() => {
      const v2 = XLSX.utils.book_new();
      const v3 = [["الاسم -ولي الأمر", "رقم الهوية"]];
      var v4 = [];
      t.forEach(function (v7, v8) {
        v4.push([v7.name, v7.number]);
      });
      const v5 = XLSX.utils.json_to_sheet(v4, {
        origin: "A2",
        skipHeader: true
      });
      XLSX.utils.sheet_add_aoa(v5, v3, {
        origin: "A1"
      });
      XLSX.utils.book_append_sheet(v2, v5, "Records");
      const v6 = XLSX.writeFile(v2, "Parents.xlsx");
    }, 1000);
    localStorage.removeItem("exportParents");
    $("#ctl00_PlaceHolderMain_lbtnClickHere").parent().remove();
  }
}