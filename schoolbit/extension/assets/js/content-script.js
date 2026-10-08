// Content script لإضافة «سكول بت» — يعمل على نور ومدرستي فقط.
//
// 1. يحقن b.js في عالم الصفحة، وهو يحمّل بقية ملفات الإضافة من داخل الحزمة.
// 2. جسر التخزين النصّي (textarea) لمهام نور متعددة الصفحات.
// 3. جسر postMessage بين عالم الصفحة والـ service worker.

const nullthrows = (v) => {
    if (v == null) throw new Error("it's a null");
    return v;
};
function injectCode(src) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = function () { this.remove(); };
    nullthrows(document.head || document.documentElement).appendChild(script);
}
injectCode(chrome.runtime.getURL('/assets/js/b.js'));

// === جسر التخزين النصّي ================================================
// تكتب ميزات نور حقلاً مخفياً باسم المفتاح، فيحفظه هذا الملف في
// chrome.storage.local أو يقرؤه ويعيده في حقلٍ مخفيٍّ آخر.
setInterval(() => {
    const $save = $('.save-me-to-local-storage');
    if ($save.length) {
        const obj = {};
        obj[$save.attr('name')] = $save.val();
        chrome.storage.local.set(obj, function () {
            $save.remove();
        });
    }
    const $get = $('.get-local-storage');
    if ($get.length) {
        const name = $get.attr('name');
        chrome.storage.local.get([name], function (e) {
            // تُبنى العناصر بالـ DOM لا بنصّ HTML، فلا تُفسَّر القيمة المخزّنة كوسوم.
            $('<textarea>', { 'class': 'get-local-storage-value', name: name })
                .css('display', 'none')
                .val(e[name] == null ? 'undefined' : String(e[name]))
                .appendTo('body');
            $get.remove();
        });
    }
}, 100);

// === جسر الصفحة ← الـ service worker ===================================
// لا يقبل إلا رسائل الصفحة نفسها (لا الإطارات ولا النوافذ الأخرى)، والـ
// service worker يتحقق بدوره من النطاق ومفتاح التخزين المسموح.
const BRIDGED_TYPES = [
    'corbit.sms.fetch',
    'corbit.schoolbit.fetch',
    'corbit.storage.get',
    'corbit.storage.set'
];

window.addEventListener('message', function (e) {
    if (e.source !== window || e.origin !== window.location.origin) return;
    if (!e.data || typeof e.data.type !== 'string') return;
    const type = e.data.type;
    const rid  = e.data.requestId;

    if (type === 'maaref.openSettings') {
        chrome.runtime.sendMessage({ type: 'corbit.openSettings' });
        return;
    }
    if (!BRIDGED_TYPES.includes(type)) return;

    chrome.runtime.sendMessage({
        type:  type,
        url:   e.data.url,
        opts:  e.data.opts,
        key:   e.data.key,
        value: e.data.value
    }, function (reply) {
        window.postMessage({
            type: type + '.response',
            requestId: rid,
            result: reply && reply.result,
            error:  reply && reply.error
        }, window.location.origin);
    });
});
