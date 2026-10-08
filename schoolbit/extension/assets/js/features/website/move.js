var students = [];
$(".tablea tr").each(function () {
  students.push({
    name: $(this).find("td:nth-child(5)").text().trim(),
    class_name: $(this).find("td:nth-child(4)").text().trim(),
    row_name: $(this).find("td:nth-child(3)").text().trim(),
    student_phone: $(this).find("td:nth-child(2)").text().trim(),
    parent_name: "",
    parent_phone: $(this).find("td:nth-child(2)").text().trim(),
    number: $(this).find("td:nth-child(6)").text().trim()
  });
});
corbit_set("move_students_now", "yes").then(function () {
  var v1 = [];
  $("body > div > div > div > div > div > div:nth-child(3) .list-group-item").each(function () {
    if ($(this).find(".title").length) {
      v1.push({
        title: $(this).find(".title").text()?.trim(),
        number: $(this).find(".number").val()?.trim()
      });
    }
  });
  corbit_set("move_students", JSON.stringify({
    students: students,
    classes: v1
  })).then(function () {
    history.back();
  });
});
$("select").change(function () {
  $("select").attr("disabled", "disabled");
  $("select").addClass("disabled");
  var v2 = $(this);
  $.each(students, function (v3, v4) {
    if (v4.class_name == v2.parent().find(".number").val() && v4.row_name == v2.parent().find(".classroom").val()) {
      $("[n='" + v2.val() + "']").append("\n            <tr>\n                <td>\n                    <input type='hidden' class='student' value='" + v4.number + "'>\n                    <input type='hidden' class='classid' value='" + v2.val() + "'>\n                    <input type='hidden' class='name' value='" + v4.name + "'>\n                    " + v4.name + "\n                </td>\n            </tr>\n            ");
    }
  });
});
$(".aa").click(function () {
  $(this).find(".card-body").toggle("slow");
});
$(".done").click(function () {
  var v5 = [];
  $("[n] tr").each(function () {
    v5.push({
      number: $(this).find(".student").val(),
      id: $(this).find(".classid").val(),
      name: $(this).find(".name").val()
    });
  });
  corbit_set("move", JSON.stringify(v5)).then(function () {
    window.location = $("#re").val();
  });
});