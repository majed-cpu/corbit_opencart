// =====================================================================
//  Corbit local Excel parser — every Excel file is parsed in the browser
// =====================================================================
//
// Loads SheetJS lazily on first use. Exposes:
//   window.corbitExcelParser.parseFile(File) → Promise<rows>
//
// Returns rows in row-major form: [[c0, c1, c2, ...], [...], ...] —
// the shape every Excel-reading feature expects.
//
// Used by the LOCAL-MODE XHR interceptor to answer any request to the
// local sentinel local.maaref.invalid/excel or /table — nothing leaves
// the browser.

(function () {
  if (window.corbitExcelParser) return;
  var xlsxLoaded = false;
  var loadingPromise = null;
  function loadSheetJS() {
    if (xlsxLoaded || typeof XLSX !== "undefined") {
      xlsxLoaded = true;
      return Promise.resolve();
    }
    if (loadingPromise) return loadingPromise;
    loadingPromise = new Promise(function (resolve, reject) {
      var base = window.CORBIT_LOCAL_FILES_BASE || "";
      var s = document.createElement("script");
      s.src = base + "lib/xlsx.full.min.js";
      s.onload = function () {
        xlsxLoaded = true;
        resolve();
      };
      s.onerror = function () {
        reject(new Error("[corbit-excel] failed to load xlsx.full.min.js from " + s.src));
      };
      (document.head || document.documentElement).appendChild(s);
    });
    return loadingPromise;
  }
  function parseFile(file) {
    return loadSheetJS().then(function () {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (ev) {
          try {
            var data = new Uint8Array(ev.target.result);
            var wb = XLSX.read(data, {
              type: "array",
              cellDates: false,
              cellNF: false
            });
            var sheetName = wb.SheetNames[0];
            var sheet = wb.Sheets[sheetName];
            // header:1 ⇒ 2-D array of cell values, no key conversion.
            var rows = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              defval: "",
              raw: false // preserve Arabic / formatted strings
            });
            resolve(rows);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = function () {
          reject(reader.error);
        };
        reader.readAsArrayBuffer(file);
      });
    });
  }
  window.corbitExcelParser = {
    parseFile: parseFile
  };
  console.log("[corbit-excel] parser stub loaded (SheetJS will load on first use)");
})();