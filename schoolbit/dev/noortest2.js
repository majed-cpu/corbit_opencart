const { chromium } = require('/opt/node-tools/node_modules/playwright');
const W='/tmp/claude-0/-home-user-corbit-opencart/9818c0dc-5bae-5d5a-9e50-90c0658dfb5f/scratchpad';
const KEY='TESTKEYTESTKEYTESTKEYTESTKEYTESTKEYTESTKEYTESTKE';
const G='ctl00_PlaceHolderMain_gvHierarchyMessageSettings';
(async () => {
  const ctx = await chromium.launchPersistentContext(W+'/profile-noor2',{headless:true,channel:'chromium',args:['--disable-extensions-except='+W+'/tbuild','--load-extension='+W+'/tbuild']});
  let [sw]=ctx.serviceWorkers(); if(!sw) sw=await ctx.waitForEvent('serviceworker',{timeout:15000});
  const p=await ctx.newPage(); p.setDefaultTimeout(8000);
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const R={};
  const URL='http://localhost:8132/Noor/SystemSettings/HierarchyMessageSettings.aspx';
  await p.goto(URL,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(900);
  const log=()=>p.evaluate(()=>window.__log.slice());
  R.A_rename_label=await p.$eval('#'+G+'_ctl02_lblNetworkTypeDescription',e=>e.textContent);
  R.A_rename_provider_opt=await p.$eval('#ctl00_PlaceHolderMain_ddlProvider option[value="2"]',e=>e.textContent);
  // B) الرصيد بلا مفتاح بعد
  await p.evaluate(G=>document.getElementById(G+'_ctl02_lbtnDisplayBalance').click(),G); await p.waitForTimeout(1200);
  R.B_nokey_popup=await p.evaluate(()=>({text:document.getElementById('ctl00_PlaceHolderMain_lblBalance').textContent,cls:document.getElementById('ctl00_PlaceHolderMain_lblBalance').className,shown:getComputedStyle(document.getElementById('divBalance')).display}));
  await p.evaluate(()=>document.getElementById('ctl00_PlaceHolderMain_ibtnClose').click()); await p.waitForTimeout(300);
  R.B_close_hidden=await p.evaluate(()=>getComputedStyle(document.getElementById('divBalance')).display);
  R.B_log=await log();
  // C) وضع التعديل
  await p.evaluate(G=>document.getElementById(G+'_ctl02_lbtnEdit').click(),G); await p.waitForTimeout(1200);
  R.C_edit=await p.evaluate(G=>({
    select2Text:document.getElementById('select2-'+G+'_ctl02_ddlNetworkType-container').textContent,
    netOpt:document.querySelector('#'+G+'_ctl02_ddlNetworkType option:checked').textContent,
    netValue:document.getElementById(G+'_ctl02_ddlNetworkType').value,
    opResultDisplay:getComputedStyle(document.getElementById('ctl00_PlaceHolderMain_lblOperationResult')).display,
    picker:!!document.querySelector('.corbit-sender-picker'), pickerFirst:(document.querySelector('.corbit-sender-picker')||{options:[{}]}).options[0].textContent,
    pickerSize:(()=>{const s=document.querySelector('.corbit-sender-picker');if(!s)return null;const r=s.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)+' '+getComputedStyle(s).fontFamily;})(),
    senderHidden:getComputedStyle(document.getElementById(G+'_ctl02_tbSenderName')).display, senderDisabled:document.getElementById(G+'_ctl02_tbSenderName').disabled,
    link:(document.querySelector('a.corbit-link')||{}).textContent, linkInOptionsCell:!!(document.querySelector('a.corbit-link')&&document.querySelector('a.corbit-link').closest('td').querySelector("a[id$='lbtnUpdate']")),
    rowH:Math.round(document.querySelector('#'+G+' tr:nth-child(2)').getBoundingClientRect().height)
  }),G);
  // D) نافذة الربط: مفاتيح مرفوضة
  async function tryKey(k){ await p.evaluate(()=>document.querySelector('a.corbit-link').click()); await p.waitForTimeout(200);
    await p.fill('#corbitLinkPopup [data-act=key]',k,{force:true}).catch(async()=>{await p.evaluate(k=>{document.querySelector('#corbitLinkPopup [data-act=key]').value=k},k)});
    await p.evaluate(()=>document.querySelector('#corbitLinkPopup [data-act=verify]').click()); await p.waitForTimeout(1500);
    return p.evaluate(()=>document.querySelector('#corbitLinkPopup [data-act=msg]').textContent); }
  R.D_too_long=await p.evaluate(()=>{});
  // maxlength=50 في الحقل يمنع الإدخال الأطول؛ نتجاوزه برمجياً لاختبار الرسالة
  await p.evaluate(()=>document.querySelector('a.corbit-link').click()); await p.waitForTimeout(200);
  await p.evaluate(()=>{const i=document.querySelector('#corbitLinkPopup [data-act=key]');i.removeAttribute('maxlength');i.value='A1'.repeat(30);document.querySelector('#corbitLinkPopup [data-act=verify]').click();});
  await p.waitForTimeout(300);
  R.D_too_long=await p.evaluate(()=>document.querySelector('#corbitLinkPopup [data-act=msg]').textContent);
  R.D_hex_only=await tryKey('0123456789abcdef0123456789abcdef0123456789ab');
  R.D_wrong=await tryKey('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ');
  R.D_ok=await tryKey(KEY);
  await p.waitForTimeout(1000);
  R.E_after_link=await p.evaluate((a)=>{const [G,KEY]=a;return {
    user:document.getElementById(G+'_ctl02_tbUserName').value,
    pwIsKey:document.getElementById(G+'_ctl02_tbUserPassword').value===KEY,
    cpwIsKey:document.getElementById(G+'_ctl02_tbConfirmPassword').value===KEY,
    netValue:document.getElementById(G+'_ctl02_ddlNetworkType').value,
    picker:[...document.querySelector('.corbit-sender-picker').options].map(o=>o.textContent).join('|'),
    senderValue:document.getElementById(G+'_ctl02_tbSenderName').value,
    keyFieldCleared:document.querySelector('#corbitLinkPopup [data-act=key]').value==='',
    log:window.__log.slice() }},[G,KEY]);
  await p.screenshot({path:W+'/design/noor2-link.png'});
  await p.evaluate(()=>document.querySelector('#corbitLinkPopup [data-act=close]').click());
  // F) حفظ: ماذا يرسل ASP.NET؟
  await p.evaluate(G=>document.getElementById(G+'_ctl02_lbtnUpdate').click(),G); await p.waitForTimeout(300);
  R.F_posted=await p.evaluate(()=>{const o=Object.assign({},window.__posted||{}); if(o.tbUserPassword) o.tbUserPassword='(len '+o.tbUserPassword.length+')'; if(o.tbConfirmPassword) o.tbConfirmPassword='(len '+o.tbConfirmPassword.length+')'; return o;});
  // G) العودة لوضع العرض ثم الرصيد بالمفتاح المخزّن
  await p.goto(URL,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(900);
  await p.evaluate(G=>document.getElementById(G+'_ctl02_lbtnDisplayBalance').click(),G); await p.waitForTimeout(1500);
  R.G_balance=await p.evaluate(()=>({text:document.getElementById('ctl00_PlaceHolderMain_lblBalance').textContent,shown:getComputedStyle(document.getElementById('divBalance')).display,log:window.__log.slice()}));
  await p.screenshot({path:W+'/design/noor2-balance.png'});
  R.errors=errs.length?errs.slice(0,5):'none';
  console.log(JSON.stringify(R,null,1)); console.log('DONE'); setTimeout(()=>process.exit(0),100);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
