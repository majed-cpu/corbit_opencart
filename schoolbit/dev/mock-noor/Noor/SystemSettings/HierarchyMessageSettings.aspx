<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>نور</title>
<style>
body{font-family:"Helvetica Neue",Helvetica,Arial;font-size:14px;color:#333}
.StandardFont,.StandardFontPlain{font-size:12px;font-weight:400;color:#555}
.GridClass{font-family:"Droid Arabic Kufi"}
.tableHeaderCell{background:#009E8F;color:#fff}
.tableHeaderCell th{padding:4px;font-size:13.33px;border-color:rgb(30,117,109)}
.GridClass td{padding:4px 3px;font-size:12px;border-color:#CCCCCC}
a.StandardFont{color:#009E8F;text-decoration:none}
.ValidationClass{color:rgb(231,119,19)}
.btnstyle{background:#009E8F;color:#fff;border:none;padding:4px 30px;margin:10px 6px}
.form-ModalPopup{background:#fff;border:2px solid #D1D1D1;box-shadow:0 4px 23px 5px rgba(0,0,0,.2);min-width:360px}
.form-ModalPopup-header{background:rgb(0,157,143);padding:7px 10px 7px 35px;min-height:30px;color:#fff}
.form-ModalPopup-body{padding:5px 10px}
.select2-container{display:inline-block;width:120px;height:23px}
.select2-selection__rendered{display:block;border:1px solid #AAA;height:21px;line-height:21px;padding:0 4px}
</style></head>
<body>
<form id="aspnetForm" method="post" action="/posted">
<div id="ctl00_oHeader_lblName">مدير مدرسة ابتدائية الأقصى</div>
<span id="ctl00_lblPageTitle" class="StandardFont" style="font-weight:700">إعداد حساب الرسائل الخاص بالمدرسة</span>
<div id="ctl00_PlaceHolderMain_UpdatePanel7"></div>
<div id="oUpdatePanelInstruction" style="display:none"><span id="ctl00_PlaceHolderMain_lblProvider">مزود الخدمة</span>
<select id="ctl00_PlaceHolderMain_ddlProvider" class="control-dropdownlist"><option value="103">رسائل همس</option><option value="1">موبايلي</option><option value="2">المدار التقني</option></select></div>
<div id="ctl00_PlaceHolderMain_UpdatePanel8"><span id="ctl00_PlaceHolderMain_lblOperationResult" class="ValidationClass"></span></div>

<div id="divBalance" class="ModalPopupExtender" style="display:none;position:fixed;z-index:100001;left:40%;top:30%">
 <div class="form-ModalPopup">
  <div class="form-ModalPopup-header"><span id="ctl00_PlaceHolderMain_lblBalancePopupHeading" class="StandardFont" style="color:#fff">الرصيد المتوفر</span>
   <button id="btnCancelBalance" type="button" class="btnCloseModalPopup">×</button></div>
  <div class="form-ModalPopup-body"><div class="form-controls"><div class="form-controls-body"><div class="form-operation-message">
   <div id="ctl00_PlaceHolderMain_up"><span id="ctl00_PlaceHolderMain_lblBalance" class="StandardFont"></span></div>
  </div></div></div></div>
  <div class="form-ModalPopup-footer"><div class="form-actions"><ul><li>
   <input type="submit" name="ctl00$PlaceHolderMain$ibtnClose" value="إغلاق" id="ctl00_PlaceHolderMain_ibtnClose" class="btnstyle"></li></ul></div></div>
 </div></div>
</form>
<script>
window.__log = [];
var G='ctl00_PlaceHolderMain_gvHierarchyMessageSettings';
window.__doPostBack=function(t){ __log.push('POSTBACK:'+t); };
document.getElementById('aspnetForm').addEventListener('submit',function(e){ e.preventDefault(); __log.push('SUBMIT:'+(e.submitter&&e.submitter.id)); });
window.showBalancePopup=function(){ __log.push('showBalancePopup'); document.getElementById('divBalance').style.display='block'; };
window.hideBalancePopup=function(){ __log.push('hideBalancePopup'); document.getElementById('divBalance').style.display='none'; };
window.EnableDDLs=function(){ __log.push('EnableDDLs'); };
window.validateSenderName=function(){ return true; };

function renderView(){
  document.getElementById('ctl00_PlaceHolderMain_UpdatePanel7').innerHTML =
  "<table id='"+G+"' class='GridClass' rules='all' border='1' style='border-color:BurlyWood;width:100%;border-collapse:collapse;text-align:center'>"+
  "<tr class='tableHeaderCell'><th>اسم المستخدم</th><th>كلمة السر</th><th>نوع الشبكة</th><th>اسم المرسل</th><th><span id='"+G+"_ctl01_lblOptionsTitle' class='LabelHeaderCell'>خيارات</span></th></tr>"+
  "<tr class='StandardFontPlain' style='height:27px'><td style='width:149px'><span id='"+G+"_ctl02_lblUserName' class='StandardFont'>146564</span></td>"+
  "<td style='width:458px'><span id='"+G+"_ctl02_lblUserPassword'>********************************</span></td>"+
  "<td style='width:116px'><span id='"+G+"_ctl02_lblNetworkTypeDescription'>المدار التقني</span></td>"+
  "<td style='width:124px'><span id='"+G+"_ctl02_lblSenderName'>Alaqsa</span></td>"+
  "<td style='width:244px'><a id='"+G+"_ctl02_lbtnDisplayBalance' class='StandardFont' href=\"javascript:__doPostBack('ctl00$PlaceHolderMain$gvHierarchyMessageSettings$ctl02$lbtnDisplayBalance','')\">عرض الرصيد</a> "+
  "<a id='"+G+"_ctl02_lbtnEdit' class='StandardFont' href='javascript:void(0)'>تعديل</a> "+
  "<a id='"+G+"_ctl02_lbtnRemove' class='StandardFont' href='javascript:void(0)'>حذف</a></td></tr></table>";
  document.getElementById(G+'_ctl02_lbtnEdit').onclick=function(e){ e.preventDefault(); setTimeout(renderEdit,50); };
}
function renderEdit(){
  document.getElementById('ctl00_PlaceHolderMain_UpdatePanel7').innerHTML =
  "<table id='"+G+"' class='GridClass' rules='all' border='1' style='border-color:BurlyWood;width:100%;border-collapse:collapse;text-align:center'>"+
  "<tr class='tableHeaderCell'><th>اسم المستخدم</th><th>كلمة السر</th><th>نوع الشبكة</th><th>اسم المرسل</th><th>خيارات</th></tr>"+
  "<tr class='StandardFontPlain' style='height:94px'>"+
  "<td style='width:291px'><input type='text' name='"+G+"$ctl02$tbUserName' id='"+G+"_ctl02_tbUserName' class='StandardFontPlain' maxlength='50' style='width:150px;height:23px' value='146564' onchange='EnableDDLs()'> <span class='ValidationClass'>*</span></td>"+
  "<td style='width:355px'><span id='"+G+"_ctl02_lblPassword'>كلمة السر</span> <input type='password' name='"+G+"$ctl02$tbUserPassword' id='"+G+"_ctl02_tbUserPassword' maxlength='50' style='width:150px;height:23px' onchange='EnableDDLs()'><br>"+
  "<span id='"+G+"_ctl02_lblConfirmPassword'>تأكيد كلمة السر</span> <input type='password' name='"+G+"$ctl02$tbConfirmPassword' id='"+G+"_ctl02_tbConfirmPassword' maxlength='50' style='width:150px;height:23px' onchange='EnableDDLs()'></td>"+
  "<td style='width:234px'><select name='"+G+"$ctl02$ddlNetworkType' id='"+G+"_ctl02_ddlNetworkType' class='control-dropdownlist' style='display:none' onchange=\"setTimeout('__doPostBack(\\'ctl00$PlaceHolderMain$gvHierarchyMessageSettings$ctl02$ddlNetworkType\\',\\'\\')',0)\">"+
  "<option value='1;https://x/1'>موبايلي</option><option value='2;https://mobile.net.sa/sms/noor/Sender.php' selected>المدار التقني</option></select>"+
  "<span class='select2 select2-container'><span class='select2-selection'><span id='select2-"+G+"_ctl02_ddlNetworkType-container' class='select2-selection__rendered' title='المدار التقني'>المدار التقني</span></span></span></td>"+
  "<td style='width:136px'><input type='text' name='"+G+"$ctl02$tbSenderName' id='"+G+"_ctl02_tbSenderName' class='StandardFontPlain' maxlength='50' style='width:100px;height:23px' value='Alaqsa' disabled></td>"+
  "<td style='width:76px'><a id='"+G+"_ctl02_lbtnUpdate' href='javascript:void(0)' onclick=\"return validateSenderName('x')\">حفظ</a> <a id='"+G+"_ctl02_lbtnCancel' href='javascript:void(0)'>إلغاء</a></td></tr></table>";
  // نور يضع كلمة السر المخزنة في .value (حساب قديم hex32)
  document.getElementById(G+'_ctl02_tbUserPassword').value='0123456789abcdef0123456789abcdef';
  document.getElementById(G+'_ctl02_tbConfirmPassword').value='0123456789abcdef0123456789abcdef';
  document.getElementById('ctl00_PlaceHolderMain_lblOperationResult').textContent='حدث خطأ من مزود الخدمة اثناء استرجاع اسماء المرسلين.';
  document.getElementById(G+'_ctl02_lbtnUpdate').addEventListener('click',function(){
    // محاكاة ما يرسله ASP.NET: FormData تستبعد الحقول المعطّلة تلقائياً
    var fd=new FormData(document.getElementById('aspnetForm')); var o={};
    fd.forEach(function(v,k){ if(k.indexOf('gvHierarchyMessageSettings')!==-1) o[k.split('$').pop()]=v; });
    window.__posted=o; __log.push('SAVE');
  });
}
renderView();
</script>
</body></html>
