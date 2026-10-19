// rea-domains/javascript: require/import grafı + export şekli (regex + gerçek fs)
// AST yok; dosya->bağımlılık listesi ile fonksiyon/sınıf/default özeti çıkarılır.
// Graf dokunulmaz; çözümleme/sınıflama ayrı (additive) alanlarda verilir.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";

export type ReaJsDerinlikSonuç =
  | { ok: true; tool: string; summary: string; details?: unknown }
  | { ok: false; code: "capability_unsupported"; reason: string };

// require() + import-from + export-from yakalar (üç gruptan biri dolar).
const BAĞIMLILIK_RE = /require\(\s*["']([^"']+)["']\s*\)|import\s+(?:[^"'`]*?\s+from\s+)?["'`]([^"'`]+)["'`]|export\s+[^"'`]*?\s+from\s+["'`]([^"'`]+)["'`]/g;
// Bildirim kalıpları: function, ok-fonksiyon sabiti, class, default.
const FONKSİYON_RE = /function\s+([A-Za-z_$][\w$]*)|export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g;
const OKFONK_RE = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[^;{]*?=>/g;
const SINIF_RE = /class\s+([A-Za-z_$][\w$]*)|export\s+(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/g;
const DEFAULT_RE = /(?:export\s+default\b|module\.exports\s*=)/;

// Eşleşen adları toplar, tekrarları tekler (grup1 ?? grup2).
function adları(re: RegExp, kod: string): string[] {
  const out: string[] = [];
  for (const m of kod.matchAll(re)) { const ad = m[1] ?? m[2]; if (ad && !out.includes(ad)) out.push(ad); }
  return out;
}

// Yorum ayıklama: blok + satır yorumları eşleşme dışı bırakılır.
function temizle(kod: string): string {
  return kod.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

// JS uzantıları: yalnız çalıştırılabilir kaynak taranır.
const JS_UZANTI = new Set([".js", ".mjs", ".cjs"]);

// Recursive JS toplama: alt dizinlere iner, okunamayanı atlar.
function jsTopla(cur: string, out: string[]): void {
  for (const ad of readdirSync(cur)) {
    const tam = join(cur, ad);
    try {
      const st = statSync(tam);
      if (st.isDirectory()) jsTopla(tam, out);
      else if (st.isFile() && JS_UZANTI.has(extname(tam).toLowerCase())) out.push(tam);
    } catch { /* kilitli dosya atlanır */ }
  }
}

// Spek sınıfı: relative | builtin | scoped | bare | url (sıra belirleyici).
type JsSpekTur = "relative" | "builtin" | "scoped" | "bare" | "url";

// Yerleşik Node modülleri: node: önekli her şey + bu sabit liste (alt yolsuz ad).
const BUILTINLER: ReadonlySet<string> = new Set([
  "fs", "path", "os", "crypto", "util", "events", "stream", "http", "https",
  "child_process", "worker_threads", "zlib", "assert", "buffer", "url", "net",
  "tls", "dns", "vm", "module", "timers", "readline", "string_decoder",
  "querystring", "perf_hooks", "async_hooks", "v8", "inspector",
  "diagnostics_channel", "dgram", "cluster", "process", "sys",
]);

// Göreli spec çözüm adayları: tam yol -> uzantılar -> dizin index'leri.
const GÖRELİ_UZANTI = [".js", ".mjs", ".cjs", ".json", ".mts", ".cts"];
const İNDEKS_ADLAR = ["index.js", "index.mjs", "index.cjs", "index.json"];

// Dosya mı? (var + normal dosya; kilitliyse yok sayılır.)
function dosyaMı(yol: string): boolean {
  try { return existsSync(yol) && statSync(yol).isFile(); } catch { return false; }
}

// Spec sınıflaması: node: ve sabit liste builtin; şema url; ./ .. relative; @ scoped; kalan bare.
function sınıfla(spec: string): JsSpekTur {
  if (spec.startsWith("node:")) return "builtin";
  if (/^(?:https?:\/\/|data:)/.test(spec)) return "url";
  if (spec === "." || spec === ".." || spec.startsWith("./") || spec.startsWith("../")) return "relative";
  if (spec.startsWith("@")) return "scoped";
  if (BUILTINLER.has(spec)) return "builtin";
  return "bare";
}

// Göreli çözüm: ithal edenin dizininden; tam yol, uzantı adayları, dizin index'leri.
function göreliÇöz(importerTam: string, spec: string): string | null {
  const hedef = join(dirname(importerTam), spec);
  if (dosyaMı(hedef)) return hedef;
  for (const u of GÖRELİ_UZANTI) if (dosyaMı(hedef + u)) return hedef + u;
  for (const ad of İNDEKS_ADLAR) { const p = join(hedef, ad); if (dosyaMı(p)) return p; }
  return null;
}

// Paket çözümü: yukarı doğru node_modules/<spec>/package.json ara; main -> main+.js/.json -> index.js.
function paketÇöz(importerTam: string, spec: string): string | null {
  let dizin = dirname(importerTam);
  for (;;) {
    const kok = join(dizin, "node_modules", spec);
    if (dosyaMı(join(kok, "package.json"))) {
      try {
        const j = JSON.parse(readFileSync(join(kok, "package.json"), "utf8")) as { main?: unknown };
        if (typeof j.main === "string") {
          const m = join(kok, j.main);
          if (dosyaMı(m)) return m;
          if (dosyaMı(m + ".js")) return m + ".js";
          if (dosyaMı(m + ".json")) return m + ".json";
        }
      } catch { /* bozuk package.json: index'e düşülür */ }
      const ix = join(kok, "index.js");
      return dosyaMı(ix) ? ix : null;
    }
    const üst = dirname(dizin);
    if (üst === dizin) return null;
    dizin = üst;
  }
}

// Graf: her JS dosyasının require/import bağımlılıkları (göreli yol->liste).
// Ek alanlar: cozumleme (spec->tur/cozum) + eksik (yalnız çözülemeyen göreli spec'ler).
export function rea_js_require(dizin: string): ReaJsDerinlikSonuç {
  if (!dizin) return { ok: false, code: "capability_unsupported", reason: "boş dizin" };
  if (!existsSync(dizin)) return { ok: false, code: "capability_unsupported", reason: `dizin yok: ${dizin}` };
  try {
    const dosyalar: string[] = [];
    jsTopla(dizin, dosyalar);
    const graf: Record<string, string[]> = {};
    const cozumleme: Record<string, Record<string, { tur: JsSpekTur; cozum?: string }>> = {};
    const eksik: string[] = [];
    for (const tam of dosyalar) {
      const kod = temizle(readFileSync(tam, "utf8"));
      const göreli = relative(dizin, tam).replace(/\\/g, "/");
      const out: string[] = [];
      for (const m of kod.matchAll(BAĞIMLILIK_RE)) { const d = m[1] ?? m[2] ?? m[3]; if (d && !out.includes(d)) out.push(d); }
      graf[göreli] = out;
      const dosyaÇözüm: Record<string, { tur: JsSpekTur; cozum?: string }> = {};
      for (const spec of out) {
        const tur = sınıfla(spec);
        if (tur === "relative") {
          const hedef = göreliÇöz(tam, spec);
          if (hedef) dosyaÇözüm[spec] = { tur, cozum: relative(dizin, hedef).replace(/\\/g, "/") };
          else {
            dosyaÇözüm[spec] = { tur };
            const satır = `${göreli} -> ${spec}`;
            if (!eksik.includes(satır)) eksik.push(satır);
          }
        } else if (tur === "bare" || tur === "scoped") {
          const hedef = paketÇöz(tam, spec);
          dosyaÇözüm[spec] = hedef ? { tur, cozum: relative(dizin, hedef).replace(/\\/g, "/") } : { tur };
        } else {
          dosyaÇözüm[spec] = { tur };
        }
      }
      cozumleme[göreli] = dosyaÇözüm;
    }
    const kenar = Object.values(graf).reduce((t, l) => t + l.length, 0);
    return { ok: true, tool: "rea_js_require", summary: `${dosyalar.length} dosya, ${kenar} kenar`, details: { graf, cozumleme, eksik } };
  } catch (e) { return { ok: false, code: "capability_unsupported", reason: `tarama başarısız: ${(e as Error).message}` }; }
}

// CJS dışa aktarım kalıpları: exports.AD =, module.exports.AD =, defineProperty(exports, "AD", ...).
// Doğrudan exports'ta nokta/kelime öncesi negatif bakış: module.exports.AD'ye çift yakalanmaz.
const CJS_DOĞRUDAN_RE = /(?<![\w$.])exports\.([A-Za-z_$][\w$]*)\s*=/g;
const CJS_MODUL_RE = /module\s*\.\s*exports\s*\.\s*([A-Za-z_$][\w$]*)\s*=/g;
const CJS_TANIM_RE = /Object\s*\.\s*defineProperty\s*\(\s*exports\s*,\s*["']([^"']+)["']/g;

// CJS adları: üç kalıptan tekilleştirilmiş, sıralı liste.
function cjsAdları(kod: string): string[] {
  const out: string[] = [];
  for (const re of [CJS_DOĞRUDAN_RE, CJS_MODUL_RE, CJS_TANIM_RE]) {
    for (const m of kod.matchAll(re)) { const ad = m[1]; if (ad && !out.includes(ad)) out.push(ad); }
  }
  return out.sort();
}

// Şekil: dosyadaki fonksiyon/sınıf adları + default export var mı + CJS adları.
export function rea_js_export_shape(dosya: string): ReaJsDerinlikSonuç {
  if (!dosya) return { ok: false, code: "capability_unsupported", reason: "boş dosya yolu" };
  if (!existsSync(dosya)) return { ok: false, code: "capability_unsupported", reason: `dosya yok: ${dosya}` };
  try {
    const kod = temizle(readFileSync(dosya, "utf8"));
    const fonksiyonlar = adları(FONKSİYON_RE, kod);
    for (const a of adları(OKFONK_RE, kod)) if (!fonksiyonlar.includes(a)) fonksiyonlar.push(a);
    const siniflar = adları(SINIF_RE, kod);
    const defaultVarMi = DEFAULT_RE.test(kod);
    const cjsExportlar = cjsAdları(kod);
    return { ok: true, tool: "rea_js_export_shape", summary: `${fonksiyonlar.length} fonksiyon, ${siniflar.length} sınıf, default=${defaultVarMi ? "var" : "yok"}`, details: { fonksiyonlar, siniflar, defaultVarMi, cjsExportlar } };
  } catch (e) { return { ok: false, code: "capability_unsupported", reason: `okuma başarısız: ${(e as Error).message}` }; }
}
