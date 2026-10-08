// Options page script for Maaref / Corbit Almadar.
// Talks directly to api.mobile.net.sa (extension page has host_permissions →
// fetch works without the page-world bridge).

const STORAGE_KEY = "corbitSmsSettings";

// MadarSMSAPI — official base + endpoints (from https://api.mobile.net.sa/ Postman docs)
const MADAR_BASE     = "https://app.mobile.net.sa";
const PATH_BALANCE   = "/api/v1/get-balance";
const PATH_SENDERS   = "/api/v1/sendernames";
const PATH_SEND      = "/api/v1/send";
const PATH_SEND_BULK = "/api/v1/send-bulk";

// Hardcoded gateway settings — user only needs to provide the API Key.
const FIXED_BASE_URL     = MADAR_BASE;
const FIXED_PATH         = PATH_SEND;
const FIXED_COUNTRY_CODE = "966";
const DEFAULTS = {
    baseUrl:     FIXED_BASE_URL,
    path:        FIXED_PATH,
    apiKey:      "",
    sender:      "",
    countryCode: FIXED_COUNTRY_CODE
};

// ---- Storage helpers (chrome.storage.local) ---------------------------
function loadSettings() {
    return new Promise(r => {
        chrome.storage.local.get(STORAGE_KEY, data => {
            try {
                const raw = data && data[STORAGE_KEY];
                const s = (typeof raw === "string") ? JSON.parse(raw) : (raw || {});
                r(Object.assign({}, DEFAULTS, s));
            } catch (_) { r(Object.assign({}, DEFAULTS)); }
        });
    });
}
function saveSettings(s) {
    return new Promise(r => {
        const obj = {}; obj[STORAGE_KEY] = JSON.stringify(s);
        chrome.storage.local.set(obj, () => r(true));
    });
}

// ---- DOM helpers ------------------------------------------------------
const $ = id => document.getElementById(id);
function setStatus(msg, kind) {
    const el = $("status");
    el.textContent = msg;
    el.className = "status show " + (kind || "info");
    setTimeout(() => el.classList.remove("show"), 6000);
}
function collect() {
    return {
        baseUrl:     FIXED_BASE_URL,
        path:        FIXED_PATH,
        apiKey:      $("apiKey").value.trim(),
        sender:      $("senderSelect").value || "",
        countryCode: FIXED_COUNTRY_CODE
    };
}
function hydrate(s) {
    $("apiKey").value = s.apiKey;
    // If we have a saved sender that's not yet in the dropdown options,
    // inject it so it shows as selected until the next refresh.
    if (s.sender) {
        const sel = $("senderSelect");
        if (![...sel.options].some(o => o.value === s.sender)) {
            const opt = document.createElement("option");
            opt.value = s.sender;
            opt.textContent = s.sender + "  (محفوظ سابقاً)";
            opt.selected = true;
            sel.appendChild(opt);
        } else {
            sel.value = s.sender;
        }
    }
}

// ---- API calls (MadarSMSAPI — app.mobile.net.sa) ---------------------
function authHeader(s) {
    if (s.apiKey) return { Authorization: "Bearer " + s.apiKey };
    return {};
}
async function apiCall(method, path, jsonBody) {
    const s = collect();
    if (!s.apiKey) {
        throw new Error("أدخل API Key أولاً");
    }
    const base = (s.baseUrl || MADAR_BASE).replace(/\/+$/, "");
    const url = base + path;
    const opts = {
        method: method,
        headers: Object.assign(
            { Accept: "application/json", "Content-Type": "application/json" },
            authHeader(s)
        )
    };
    if (jsonBody !== undefined) opts.body = JSON.stringify(jsonBody);
    let r;
    try {
        r = await fetch(url, opts);
    } catch (e) {
        throw new Error("تعذّر الاتصال بـ app.mobile.net.sa — تحقق من الإنترنت (" + (e.message || e) + ")");
    }
    const text = await r.text();
    let body;
    try { body = JSON.parse(text); } catch (_) { body = text; }
    if (!r.ok) {
        let msg;
        if (r.status === 401)      msg = "مفتاح API غير صالح أو منتهي (401)";
        else if (r.status === 403) msg = "ليس لديك صلاحية لهذه العملية (403)";
        else if (r.status === 404) msg = "المسار غير موجود في البوابة (404 — " + path + ")";
        else if (r.status === 422) msg = "خطأ في البيانات المُرسَلة (422)";
        else if (r.status >= 500)  msg = "خطأ في خادم البوابة (" + r.status + ")";
        else                       msg = "HTTP " + r.status;
        const snippet = (typeof body === "string" ? body : JSON.stringify(body)).slice(0, 160);
        throw new Error(msg + " — " + snippet);
    }
    return body;
}
// Legacy alias (kept for any code that still expects apiGet)
const apiGet = (path) => apiCall("GET", path);

// ── Robust balance extractor (handles 10+ response shapes) ────────────────
// Walks the response and finds the first numeric "balance"-like field,
// looking into common wrappers (Detail/data/result/response/payload).
function extractBalance(body) {
    function tryFields(obj) {
        if (obj == null) return null;
        if (typeof obj === "number") return obj;
        if (typeof obj === "string") {
            // Strip commas/spaces/letters then parse
            const n = Number(String(obj).replace(/[^\d.-]/g, ""));
            return Number.isFinite(n) ? n : null;
        }
        if (typeof obj !== "object") return null;
        // Case-insensitive scan for balance/credit/points/messages
        for (const k of Object.keys(obj)) {
            if (/^(balance|credit|points|amount|messages?count|smscount|sms_credit)$/i.test(k)) {
                const v = obj[k];
                if (typeof v === "number" && Number.isFinite(v)) return v;
                if (typeof v === "string") {
                    const n = Number(String(v).replace(/[^\d.-]/g, ""));
                    if (Number.isFinite(n)) return n;
                }
            }
        }
        return null;
    }
    let n = tryFields(body);
    if (n !== null) return n;
    // Try common wrappers (Detail, data, result, response, payload, body)
    for (const wrap of ["Detail", "detail", "data", "result", "response", "payload", "body"]) {
        if (body && typeof body === "object" && body[wrap] != null) {
            n = tryFields(body[wrap]);
            if (n !== null) return n;
            // Two-level deep (e.g. Detail.AccountInfo.Balance)
            if (typeof body[wrap] === "object") {
                for (const inner of Object.keys(body[wrap])) {
                    n = tryFields(body[wrap][inner]);
                    if (n !== null) return n;
                }
            }
        }
    }
    return null;
}

// Fetch sender names — Madar API: GET /api/v1/sendernames?per_page=N&page=1
// Response shape (Laravel pagination):
//   { status:"Success", data:{ data:[{ sender_name:"..." }, ...], current_page, total } }
async function fetchSenders() {
    try {
        const body = await apiCall("GET", PATH_SENDERS + "?per_page=100&page=1");
        // Walk Laravel-pagination shapes + flat arrays
        let arr = [];
        if (Array.isArray(body))               arr = body;
        else if (Array.isArray(body.data))     arr = body.data;
        else if (body.data && Array.isArray(body.data.data)) arr = body.data.data;
        else if (Array.isArray(body.senders))  arr = body.senders;
        else if (Array.isArray(body.result))   arr = body.result;
        const names = arr.map(item => {
            if (typeof item === "string") return item;
            return item.sender_name || item.senderName ||
                   item.name || item.Name || item.sender || item.SenderName || "";
        }).filter(Boolean);
        if (!names.length) {
            throw new Error("الرد لم يحتوِ أي اسم مرسل. رد البوابة: " + JSON.stringify(body).slice(0, 180));
        }
        return names;
    } catch (e) {
        throw new Error("فشل جلب أسماء المرسلين. " + (e.message || e));
    }
}
// Fetch balance — Madar API: POST /api/v1/get-balance (no body needed)
// Response: { status:"Success", data:{ balance: 1050 } }
async function fetchBalance() {
    try {
        const body = await apiCall("POST", PATH_BALANCE);
        const n = extractBalance(body);
        if (n !== null) return n;
        throw new Error("الرد لم يحتوِ على رصيد. رد البوابة: " + JSON.stringify(body).slice(0, 200));
    } catch (e) {
        throw new Error("فشل جلب الرصيد. " + (e.message || e));
    }
}

// ---- Wire UI ----------------------------------------------------------
async function init() {
    const s = await loadSettings();
    hydrate(s);

    $("toggleKey").addEventListener("click", () => {
        const inp = $("apiKey");
        if (inp.type === "password") { inp.type = "text"; $("toggleKey").textContent = "🙈 إخفاء"; }
        else                          { inp.type = "password"; $("toggleKey").textContent = "👁 إظهار"; }
    });

    $("save").addEventListener("click", async () => {
        const ns = collect();
        await saveSettings(ns);
        setStatus("✅ تم الحفظ في chrome.storage", "ok");
    });
    $("reset").addEventListener("click", () => {
        if (!confirm("استعادة الإعدادات الافتراضية وحذف بياناتك المخزّنة؟")) return;
        hydrate(DEFAULTS);
        chrome.storage.local.remove(STORAGE_KEY, () => setStatus("تمت الاستعادة", "info"));
    });

    $("refreshSenders").addEventListener("click", async () => {
        const btn = $("refreshSenders");
        btn.disabled = true; btn.textContent = "⏳ جارٍ الجلب...";
        try {
            const senders = await fetchSenders();
            const sel = $("senderSelect");
            const current = collect().sender;
            sel.innerHTML = '<option value="">— اختر —</option>' +
                senders.map(n => `<option value="${escapeAttr(n)}"${n === current ? " selected" : ""}>${escapeText(n)}</option>`).join("");
            setStatus("✅ تم جلب " + senders.length + " اسم مرسل", "ok");
        } catch (e) {
            setStatus("❌ " + e.message, "err");
        } finally {
            btn.disabled = false; btn.textContent = "🔄 تحديث القائمة";
        }
    });

    $("refreshBalance").addEventListener("click", async () => {
        const btn = $("refreshBalance");
        btn.disabled = true; btn.textContent = "⏳ جارٍ الجلب...";
        try {
            const bal = await fetchBalance();
            $("balanceNum").textContent  = (typeof bal === "number") ? bal.toLocaleString("ar-SA") : String(bal);
            $("balanceTime").textContent = new Date().toLocaleString("ar-SA");
            $("balanceDisplay").style.display = "flex";
            setStatus("✅ تم جلب الرصيد", "ok");
        } catch (e) {
            $("balanceDisplay").style.display = "none";
            setStatus("❌ " + e.message, "err");
        } finally {
            btn.disabled = false; btn.textContent = "🔄 جلب الرصيد";
        }
    });

    $("testConnection").addEventListener("click", async () => {
        const btn = $("testConnection");
        btn.disabled = true; btn.textContent = "⏳ جارٍ الاختبار...";
        try {
            const senders = await fetchSenders().catch(() => null);
            const balance = await fetchBalance().catch(() => null);
            if (senders || balance !== null) {
                setStatus("✅ الاتصال يعمل" +
                          (senders ? " (" + senders.length + " مرسل)" : "") +
                          (balance !== null ? " — رصيد: " + balance : ""), "ok");
            } else {
                setStatus("❌ تعذّر الاتصال — تحقق من البيانات", "err");
            }
        } catch (e) {
            setStatus("❌ " + e.message, "err");
        } finally {
            btn.disabled = false; btn.textContent = "📡 اختبار الاتصال";
        }
    });
}

function escapeAttr(s) { return String(s).replace(/"/g, "&quot;").replace(/&/g, "&amp;"); }
function escapeText(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

init();
