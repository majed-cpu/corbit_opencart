// Service worker لإضافة «سكول بت».
//
// يمرّر طلبات عالم الصفحة (نور/مدرستي) إلى واجهات Chrome:
//   1. corbit.sms.fetch        → بوابة الرسائل (app.mobile.net.sa) — تجاوزاً لـ CORS
//   2. corbit.schoolbit.fetch  → واجهة نظام سكول بت (fingerprint-cp.mobile.net.sa)
//   3. corbit.storage.get/set  → chrome.storage.local لمفتاحي الإعدادات فقط
//   4. corbit.openSettings     → فتح صفحة الإعدادات
//
// لا يُنادى أي نطاقٍ خارج ALLOWED_ORIGINS، ولا يُقرأ أو يُكتب أي مفتاح تخزينٍ
// خارج ALLOWED_STORAGE_KEYS.

const CORBIT_ORIGINS = ['https://api.corbit.sa', 'https://sms.corbit.sa'];
const ALLOWED_ORIGINS = {
    'corbit.sms.fetch':       CORBIT_ORIGINS.concat(['https://app.mobile.net.sa']),
    'corbit.schoolbit.fetch': CORBIT_ORIGINS.concat(['https://fingerprint-cp.mobile.net.sa'])
};

const ALLOWED_STORAGE_KEYS = [
    'corbitSmsSettings',
    'corbitSchoolBitSettings',
    'corbitNoorKeys'
];

function isAllowedUrl(type, url) {
    try {
        const u = new URL(url);
        return u.protocol === 'https:' && (ALLOWED_ORIGINS[type] || []).includes(u.origin);
    } catch (_) {
        return false;
    }
}

function isFromThisExtension(sender) {
    return sender && sender.id === chrome.runtime.id;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !isFromThisExtension(sender)) return;

    if (msg.type === 'corbit.sms.fetch' || msg.type === 'corbit.schoolbit.fetch') {
        if (!isAllowedUrl(msg.type, msg.url)) {
            sendResponse({ error: 'blocked: URL not allowed' });
            return;
        }
        (async () => {
            try {
                const r    = await fetch(msg.url, msg.opts || {});
                const text = await r.text();
                let body;
                try { body = JSON.parse(text); } catch (_) { body = text; }
                // يُعاد رمز الحالة ليفرّق المستدعي بين مفتاحٍ باطل (٤٠٣) واشتراكٍ منتهٍ (٤٠٢).
                sendResponse({ result: { ok: r.ok, status: r.status, headers: {}, body: body } });
            } catch (e) {
                sendResponse({ error: String(e && e.message || e) });
            }
        })();
        return true;
    }

    if (msg.type === 'corbit.storage.get' || msg.type === 'corbit.storage.set') {
        if (!ALLOWED_STORAGE_KEYS.includes(msg.key)) {
            sendResponse({ error: 'blocked: storage key not allowed' });
            return;
        }
        if (msg.type === 'corbit.storage.get') {
            chrome.storage.local.get(msg.key, data => {
                sendResponse({ result: data ? data[msg.key] : undefined });
            });
        } else {
            chrome.storage.local.set({ [msg.key]: msg.value }, () => {
                sendResponse({ result: true });
            });
        }
        return true;
    }

    if (msg.type === 'corbit.openSettings') {
        chrome.runtime.openOptionsPage();
        sendResponse({ result: true });
        return;
    }
});
