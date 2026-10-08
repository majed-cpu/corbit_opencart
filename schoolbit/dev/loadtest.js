const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const ext='/tmp/claude-0/-home-user-corbit-opencart/9818c0dc-5bae-5d5a-9e50-90c0658dfb5f/scratchpad/build';
  const ctx = await chromium.launchPersistentContext('/tmp/claude-0/-home-user-corbit-opencart/9818c0dc-5bae-5d5a-9e50-90c0658dfb5f/scratchpad/profile', { headless: true, channel:'chromium',
    args:['--disable-extensions-except='+ext,'--load-extension='+ext] });
  let [sw] = ctx.serviceWorkers(); if(!sw) sw = await ctx.waitForEvent('serviceworker',{timeout:15000});
  const id = sw.url().split('/')[2]; console.log('SW ok:', sw.url());
  const errs=[];
  for (const [path,out,w,h] of [['layouts/popup.html','popup.png',380,900],['options/settings.html','settings.png',820,1400]]) {
    const p = await ctx.newPage(); p.on('console',m=>{ if(m.type()==='error') errs.push(path+': '+m.text())}); p.on('pageerror',e=>errs.push(path+': '+e.message));
    await p.setViewportSize({width:w,height:h});
    await p.goto('chrome-extension://'+id+'/'+path); await p.waitForTimeout(1500);
    await p.screenshot({path:'/tmp/claude-0/-home-user-corbit-opencart/9818c0dc-5bae-5d5a-9e50-90c0658dfb5f/scratchpad/design/'+out, fullPage:true});
  }
  // bridge allowlist test from SW context
  const r = await sw.evaluate(async()=>{ return typeof ALLOWED_ORIGINS==='object' && isAllowedUrl('corbit.sms.fetch','https://evil.com/x')===false && isAllowedUrl('corbit.sms.fetch','https://app.mobile.net.sa/api/v1/get-balance')===true });
  console.log('allowlist ok:', r);
  console.log('errors:', errs.length? errs.join('\n'):'none');
  await ctx.close();
})().catch(e=>{console.error(e);process.exit(1)});
