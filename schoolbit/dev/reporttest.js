// اختبار عارض التقارير: يحمّل الإضافة في Chromium، يزرع عيّنة البيانات في
// chrome.storage.local، يفتح reports/view.html?r=<name>&<params> ويلتقط صورة.
// الاستخدام: node reporttest.js <name> [<name2> ...]   (يقرأ reports/fixtures/<name>.json)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const W = '/tmp/claude-0/-home-user-corbit-opencart/9818c0dc-5bae-5d5a-9e50-90c0658dfb5f/scratchpad';
const EXT = W + '/build';
const OUTDIR = W + '/design/reports';
fs.mkdirSync(OUTDIR, { recursive: true });

(async () => {
  const names = process.argv.slice(2);
  const ctx = await chromium.launchPersistentContext(W + '/profile-reports-' + process.pid, { headless: true, channel: 'chromium',
    args: ['--disable-extensions-except=' + EXT, '--load-extension=' + EXT] });
  let [sw] = ctx.serviceWorkers(); if (!sw) sw = await ctx.waitForEvent('serviceworker', { timeout: 15000 });
  const id = sw.url().split('/')[2];
  let failures = 0;
  for (const name of names) {
    const fx = JSON.parse(fs.readFileSync(path.join(EXT, 'reports/fixtures', name + '.json'), 'utf8'));
    const errs = [];
    const p = await ctx.newPage();
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(e.message));
    await p.setViewportSize({ width: 1000, height: 1400 });
    await p.goto('chrome-extension://' + id + '/reports/view.html');
    await p.evaluate(s => new Promise(r => chrome.storage.local.set(s, r)), fx.storage || {});
    const q = Object.entries(fx.params || {}).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
    await p.goto('chrome-extension://' + id + '/reports/view.html?r=' + name + (q ? '&' + q : ''));
    await p.waitForTimeout(1200);
    const text = await p.evaluate(() => document.getElementById('report').innerText.slice(0, 200).replace(/\s+/g, ' '));
    const tables = await p.evaluate(() => document.querySelectorAll('#report table').length);
    const hasError = await p.evaluate(() => !!document.querySelector('#report .notice.error'));
    await p.screenshot({ path: path.join(OUTDIR, name + '.png'), fullPage: true });
    const ok = !hasError && errs.length === 0;
    if (!ok) failures++;
    console.log((ok ? 'OK   ' : 'FAIL ') + name + ' | tables=' + tables + ' | ' + text + (errs.length ? '\n     errors: ' + errs.join(' || ') : ''));
    await p.close();
  }
  await ctx.close();
  fs.rmSync(W + '/profile-reports-' + process.pid, { recursive: true, force: true });
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
