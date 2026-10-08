// b.js — يُحقن في عالم صفحة نور/مدرستي ويحمّل ملفات «سكول بت» من داخل الحزمة.
// الإضافة مجانية بالكامل: لا تفعيل ولا تجربة ولا شرط رصيد.
(function () {
    var thisScript = document.currentScript;
    if (!thisScript) {
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].src && scripts[i].src.indexOf('/assets/js/b.js') !== -1) {
                thisScript = scripts[i]; break;
            }
        }
    }
    var EXT_BASE = new URL(thisScript.src).origin + '/';
    window.CORBIT_EXT_BASE = EXT_BASE;
    window.CORBIT_LOCAL_FILES_BASE = EXT_BASE + 'assets/js/features/';

    function loadScript(u, callback) {
        var h = document.getElementsByTagName('head')[0] || document.documentElement;
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = u;
        s.onload = callback || null;
        s.onerror = callback || null;
        h.appendChild(s);
    }

    var rand = Math.random().toString().split('.')[1];
    var host = window.location.hostname;
    var isMadrasatiOrNoor = host.endsWith('madrasati.sa') || host.endsWith('moe.gov.sa');
    if (isMadrasatiOrNoor) {
        // جسر سكول بت (يحتاج مفتاح الربط فقط، ويُحمَّل دائماً).
        loadScript(EXT_BASE + 'assets/js/features/schoolbit/bridge.js?_id=' + rand);
        loadScript(EXT_BASE + 'assets/js/features/schoolbit/reader.js?_id=' + rand);
        loadScript(EXT_BASE + 'assets/js/features/schoolbit/push.js?_id=' + rand);
        loadScript(EXT_BASE + 'assets/js/features/schoolbit/panel.js?_id=' + rand);
        // الأداة نفسها: القائمة والميزات، ووحدة الرسائل، وقارئ Excel المحلي.
        loadScript(EXT_BASE + 'assets/js/main.js?_id=' + rand +
            '&url=' + encodeURI(window.location.href));
        loadScript(EXT_BASE + 'assets/js/features/sms/mobile-net-sa.js?_id=' + rand);
        loadScript(EXT_BASE + 'assets/js/features/excel/local-parser.js?_id=' + rand);
        // مزوّد Corbit في صفحة إعداد حساب الرسائل في نور.
        if (host.endsWith('moe.gov.sa')) {
            loadScript(EXT_BASE + 'assets/js/features/noor/corbit-provider.js?_id=' + rand);
        }
    }
})();
