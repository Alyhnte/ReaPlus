// site-uret.mjs: Dalga K/2 — aranabilir tek statik site üretimi (i18n).
// Kaynaklar: docs/i18n/{lang}/{README,TOOLS,EXAMPLES,ROADMAP,CHANGELOG,PROMPTS}.md
// -> docs/site/*.html (TR) + docs/site/{en,de,fr,es}/*.html.
// Sayılar TR TOOLS.md özetinden alınır (gerçek koşu; uydurma sayı YOK).
// Chrome metinleri docs/i18n/{lang}/index-chrome.md'den okunur (18 key + EK_CHROME).
// Bağımlılık yok (yalnız node:fs/path/url), ağ/süreç/timer yok.
// Bilinmeyen göreli .md linkleri GitHub blob URL'ine yazılır (kırık link yok);
// sayfa-içi #çapalar github-slugger ile üretilen id'lere çözülür.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(kok, "docs", "site");
const BLOB = "https://github.com/Alyhnte/ReaPlus/blob/main/";

const DILLER = ["tr", "en", "de", "fr", "es"];
const VARSAYILAN_DIL = "tr";

// Dil başına ek chrome (theme/skip/a18n — chrome dosyası 18 key sınırını korur).
const EK_CHROME = {
  tr: { "theme.light": "Açık tema", "theme.dark": "Koyu tema", "skip": "İçeriğe atla", "a11y.siteNav": "Site", "a11y.summary": "Yüzey özeti", "brand.tagline": "tersine mühendislik çalışma yüzeyi", "footer.gen": "ReaPlus Docs — statik site. Üretim: <code>node scripts/site-uret.mjs</code> · Sayılar docs/i18n/tr/TOOLS.md özetinden alınır (gerçek koşu).", "prompt.ready": "hazır prompt", "meta.desc": "ReaPlus teknik dokümantasyon sitesi: kurulum, araç referansı, örnekler, yol haritası.", "dil.aria": "Dil" },
  en: { "theme.light": "Light theme", "theme.dark": "Dark theme", "skip": "Skip to content", "a11y.siteNav": "Site", "a11y.summary": "Surface summary", "brand.tagline": "reverse engineering work surface", "footer.gen": "ReaPlus Docs — static site. Generate: <code>node scripts/site-uret.mjs</code> · Numbers from the docs/i18n/tr/TOOLS.md summary (real run).", "prompt.ready": "ready prompt", "meta.desc": "ReaPlus technical documentation: install, tool reference, examples, roadmap.", "dil.aria": "Language" },
  de: { "theme.light": "Helles Design", "theme.dark": "Dunkles Design", "skip": "Zum Inhalt springen", "a11y.siteNav": "Site", "a11y.summary": "Oberflächenzusammenfassung", "brand.tagline": "Reverse-Engineering-Arbeitsfläche", "footer.gen": "ReaPlus Docs — statische Site. Erzeugung: <code>node scripts/site-uret.mjs</code> · Zahlen aus der docs/i18n/tr/TOOLS.md-Zusammenfassung (echter Lauf).", "prompt.ready": "fertige Prompt", "meta.desc": "ReaPlus technische Dokumentation: Installation, Werkzeugreferenz, Beispiele, Fahrplan.", "dil.aria": "Sprache" },
  fr: { "theme.light": "Thème clair", "theme.dark": "Thème sombre", "skip": "Aller au contenu", "a11y.siteNav": "Site", "a11y.summary": "Résumé de surface", "brand.tagline": "surface de travail de rétro-ingénierie", "footer.gen": "ReaPlus Docs — site statique. Production : <code>node scripts/site-uret.mjs</code> · Nombres du résumé docs/i18n/tr/TOOLS.md (exécution réelle).", "prompt.ready": "prompt prêt", "meta.desc": "Documentation technique ReaPlus : installation, référence des outils, exemples, feuille de route.", "dil.aria": "Langue" },
  es: { "theme.light": "Tema claro", "theme.dark": "Tema oscuro", "skip": "Saltar al contenido", "a11y.siteNav": "Sitio", "a11y.summary": "Resumen de superficie", "brand.tagline": "superficie de trabajo de ingeniería inversa", "footer.gen": "ReaPlus Docs — sitio estático. Generación: <code>node scripts/site-uret.mjs</code> · Números del resumen docs/i18n/tr/TOOLS.md (ejecución real).", "prompt.ready": "prompt listo", "meta.desc": "Documentación técnica de ReaPlus: instalación, referencia de herramientas, ejemplos, hoja de ruta.", "dil.aria": "Idioma" },
};

// Sayfa tanımı: çıktı + kaynak anahtarı + chrome key önekleri.
const SAYFALAR = [
  { html: "readme.html", md: "README.md", key: "readme" },
  { html: "tools.html", md: "docs/TOOLS.md", key: "tools" },
  { html: "examples.html", md: "docs/EXAMPLES.md", key: "examples" },
  { html: "roadmap.html", md: "docs/ROADMAP.md", key: "roadmap" },
  { html: "changelog.html", md: "CHANGELOG.md", key: "changelog" },
  { html: "prompts.html", md: "docs/PROMPTS.md", key: "prompts" },
];

const MD_ESLESME = new Map([
  ["README.md", "readme.html"],
  ["CHANGELOG.md", "changelog.html"],
  ["TOOLS.md", "tools.html"],
  ["EXAMPLES.md", "examples.html"],
  ["ROADMAP.md", "roadmap.html"],
  ["PROMPTS.md", "prompts.html"],
]);

function oku(yol) {
  try {
    return readFileSync(join(kok, yol), "utf8");
  } catch {
    throw new Error(`kaynak yok: ${yol}`);
  }
}

function tabanAd(yol) {
  const s = yol.split("#")[0].split("?")[0];
  return s.split("/").pop();
}

function slug(metin) {
  return metin
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/ /g, "-");
}

function kacis(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function linkCevir(href) {
  if (/^(https?:|mailto:|data:)/.test(href) || href.startsWith("#")) return href;
  const [yol, ...capaParca] = href.split("#");
  const capa = capaParca.length ? `#${capaParca.join("#")}` : "";
  const ad = tabanAd(yol);
  if (ad.toLowerCase().endsWith(".md") && MD_ESLESME.has(ad)) return MD_ESLESME.get(ad) + capa;
  const temiz = yol.replace(/^\.\//, "").replace(/^\//, "");
  return `${BLOB}${temiz}${capa}`;
}

function satirIci(s) {
  const kodlar = [];
  let c = s.replace(/`([^`]+)`/g, (_, k) => {
    kodlar.push(k);
    return `\u0000${kodlar.length - 1}\u0000`;
  });
  c = kacis(c);
  c = c.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${kacis(linkCevir(src))}" alt="${alt}">`);
  c = c.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, metin, href) => `<a href="${kacis(linkCevir(href))}">${metin}</a>`);
  c = c.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  c = c.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${kacis(kodlar[Number(i)])}</code>`);
  return c;
}

function tabloSatiriMi(s) {
  return /^\s*\|.*\|\s*$/.test(s);
}

function ayiriciMi(s) {
  return /^\s*\|?[\s:|-]+\|?[\s:|-]*\s*$/.test(s) && s.includes("-");
}

function mdCevir(md, idKaydi) {
  const satirlar = md.replace(/\r\n?/g, "\n").split("\n");
  const dis = [];
  let i = 0;
  const gorulen = new Map();
  const tekilId = (ham) => {
    let id = slug(ham) || "bolum";
    const n = gorulen.get(id) ?? 0;
    gorulen.set(id, n + 1);
    if (n > 0) id = `${id}-${n}`;
    idKaydi.push(id);
    return id;
  };
  while (i < satirlar.length) {
    const s = satirlar[i];
    if (s.startsWith("```")) {
      const dil = s.slice(3).trim().replace(/[^a-z0-9+-]/gi, "");
      const ic = [];
      i++;
      while (i < satirlar.length && !satirlar[i].startsWith("```")) { ic.push(satirlar[i]); i++; }
      i++;
      dis.push(`<pre><code${dil ? ` class="language-${kacis(dil)}"` : ""}>${kacis(ic.join("\n"))}</code></pre>`);
      continue;
    }
    const b = s.match(/^(#{1,6})\s+(.*)$/);
    if (b) {
      const duz = b[2].replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
      dis.push(`<h${b[1].length} id="${tekilId(duz)}">${satirIci(b[2])}</h${b[1].length}>`);
      i++;
      continue;
    }
    if (tabloSatiriMi(s) && i + 1 < satirlar.length && ayiriciMi(satirlar[i + 1])) {
      const hucre = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((h) => h.trim());
      const bas = hucre(s);
      i += 2;
      const govde = [];
      while (i < satirlar.length && tabloSatiriMi(satirlar[i])) { govde.push(hucre(satirlar[i])); i++; }
      dis.push(`<table><thead><tr>${bas.map((h) => `<th>${satirIci(h)}</th>`).join("")}</tr></thead><tbody>${
        govde.map((r) => `<tr>${r.map((h) => `<td>${satirIci(h)}</td>`).join("")}</tr>`).join("")
      }</tbody></table>`);
      continue;
    }
    if (/^\s*>/.test(s)) {
      const ic = [];
      while (i < satirlar.length && /^\s*>/.test(satirlar[i])) { ic.push(satirlar[i].replace(/^\s*>\s?/, "")); i++; }
      dis.push(`<blockquote>${satirIci(ic.join("\n"))}</blockquote>`);
      continue;
    }
    if (/^\s*(---+\s*|___+\s*|\*\*\*+\s*)$/.test(s)) { dis.push("<hr>"); i++; continue; }
    const listeMi = (r) => /^\s*([-*+]\s+|\d+[.)]\s+)/.test(r);
    if (listeMi(s)) {
      const sirali = /^\s*\d+[.)]\s+/.test(s);
      const ogeler = [];
      while (i < satirlar.length && (listeMi(satirlar[i]) || /^\s+[^-\s\d]/.test(satirlar[i]))) {
        ogeler.push(satirlar[i].replace(/^\s*([-*+]\s+|\d+[.)]\s+)/, ""));
        i++;
      }
      const et = sirali ? "ol" : "ul";
      dis.push(`<${et}>${ogeler.map((o) => `<li>${satirIci(o)}</li>`).join("")}</${et}>`);
      continue;
    }
    if (/^\s*$/.test(s)) { i++; continue; }
    const par = [s];
    i++;
    while (i < satirlar.length && !/^\s*$/.test(satirlar[i]) && !satirlar[i].startsWith("```") &&
      !/^(#{1,6})\s+/.test(satirlar[i]) && !tabloSatiriMi(satirlar[i]) && !/^\s*>/.test(satirlar[i]) && !listeMi(satirlar[i])) {
      par.push(satirlar[i]);
      i++;
    }
    dis.push(`<p>${satirIci(par.join("\n"))}</p>`);
  }
  return dis.join("\n");
}

// index-chrome.md tablosunu key/value map'e çevir (18 key).
function chromeOku(lang) {
  const md = oku(`docs/i18n/${lang}/index-chrome.md`);
  const map = { ...EK_CHROME[lang] };
  for (const m of md.matchAll(/^\|\s*([a-z][\w.]*)\s*\|\s*(.+?)\s*\|$/gm)) {
    map[m[1]] = m[2];
  }
  return map;
}

// Dil için içerik yolu: her dil kendi docs/i18n/{lang}/ kopyasını okur.
function icerikYolu(lang, relPath) {
  const base = relPath.split("/").pop();
  return `docs/i18n/${lang}/${base}`;
}

// TOOLS.md özetinden gerçek sayılar (TR kaynak — tek gerçek koşu).
function ozetSayilari(toolsMd) {
  const al = (re, ad) => {
    const m = toolsMd.match(re);
    if (!m) throw new Error(`TOOLS.md özetinde ${ad} bulunamadı`);
    return Number(m[1]);
  };
  return {
    arac: al(/^- Toplam araç: (\d+)$/m, "araç"),
    sema: al(/^- outputSchema taşıyan araç: (\d+)$/m, "outputSchema"),
    ann: al(/^- annotations taşıyan araç: (\d+)$/m, "annotations"),
    res: al(/^- Toplam resource: (\d+)$/m, "resource"),
    prompt: al(/^- Toplam prompt: (\d+)$/m, "prompt"),
  };
}

// summary.template + sayılar -> tam özet satırı.
function ozetSatiri(chrome, sayilar) {
  return chrome["summary.template"]
    .replace(/\{arac\}/g, String(sayilar.arac))
    .replace(/\{sema\}/g, String(sayilar.sema))
    .replace(/\{ann\}/g, String(sayilar.ann))
    .replace(/\{res\}/g, String(sayilar.res))
    .replace(/\{prompt\}/g, String(sayilar.prompt));
}

// Dil değiştirici: aynı sayfanın diğer dillerine link.
function dilSecici(lang, sayfaHtml, chrome) {
  const baglantilar = DILLER.map((d) => {
    const etiket = d.toUpperCase();
    let href;
    if (lang === VARSAYILAN_DIL) {
      href = d === VARSAYILAN_DIL ? sayfaHtml : `${d}/${sayfaHtml}`;
    } else {
      href = d === VARSAYILAN_DIL ? `../${sayfaHtml}` : `../${d}/${sayfaHtml}`;
    }
    return d === lang
      ? `<strong aria-current="true">${etiket}</strong>`
      : `<a href="${href}" hreflang="${d}">${etiket}</a>`;
  }).join(" · ");
  return `<nav id="dil" class="dil" aria-label="${kacis(chrome["dil.aria"])}">${baglantilar}</nav>`;
}

function navEtkin(aktif, chrome) {
  const tum = [
    { html: "index.html", baslik: chrome["nav.home"] },
    ...SAYFALAR.map((s) => ({ html: s.html, baslik: chrome[`nav.${s.key}`] })),
  ];
  return `<nav class="gezinme" aria-label="${kacis(chrome["a11y.siteNav"])}">${tum.map((s) => (s.html === aktif ? `<strong>${kacis(s.baslik)}</strong>` : `<a href="${s.html}">${kacis(s.baslik)}</a>`)).join(" · ")}</nav>`;
}

const css = `:root{color-scheme:light;--zemin:#F6F6F3;--yuzey:#FCFCFA;--metin:#1D1F24;--silik:#5A6270;--sinir:#DFDFD6;--vurgu:#2E6B4E;--vurgu-arka:#E4EFE8;--kod-zemin:#EBEBE4;--golge:rgba(23,28,24,.08)}`
  + `[data-theme="light"]{color-scheme:light;--zemin:#F6F6F3;--yuzey:#FCFCFA;--metin:#1D1F24;--silik:#5A6270;--sinir:#DFDFD6;--vurgu:#2E6B4E;--vurgu-arka:#E4EFE8;--kod-zemin:#EBEBE4;--golge:rgba(23,28,24,.08)}`
  + `[data-theme="dark"]{color-scheme:dark;--zemin:#15181D;--yuzey:#1D2229;--metin:#E9E7E1;--silik:#A7B0BC;--sinir:#2F3742;--vurgu:#7BC9A2;--vurgu-arka:#1D3328;--kod-zemin:#232A33;--golge:rgba(8,10,12,.45)}`
  + `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){color-scheme:dark;--zemin:#15181D;--yuzey:#1D2229;--metin:#E9E7E1;--silik:#A7B0BC;--sinir:#2F3742;--vurgu:#7BC9A2;--vurgu-arka:#1D3328;--kod-zemin:#232A33;--golge:rgba(8,10,12,.45)}}`
  + `*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--zemin);color:var(--metin);font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;line-height:1.65}`
  + `h1,h2,h3,.marka-ad{font-family:"Avenir Next","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;letter-spacing:-.01em;line-height:1.25}`
  + `.sarmal{max-width:62rem;margin:0 auto;padding:0 1.25rem 3rem}`
  + `.atla{position:absolute;left:-999px;top:0;background:var(--vurgu);color:var(--zemin);padding:.5rem 1rem;z-index:10}`
  + `.atla:focus{left:0}`
  + `.ust{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem;padding:1rem 0;border-bottom:1px solid var(--sinir)}`
  + `.marka-ad{font-weight:650;font-size:1.05rem}.marka-alt{color:var(--silik);font-size:.84rem;margin-left:.6rem}`
  + `.gezinme{display:flex;flex-wrap:wrap;gap:.15rem .9rem;font-size:.92rem}`
  + `.gezinme a{color:var(--silik);text-decoration:none;border-bottom:1px solid transparent}`
  + `.gezinme a:hover{color:var(--metin);border-bottom-color:var(--vurgu)}`
  + `.dil{display:flex;gap:.35rem;font-size:.8rem;color:var(--silik)}`
  + `.dil a{color:var(--silik);text-decoration:none}.dil a:hover{color:var(--vurgu)}`
  + `.dil strong{color:var(--metin)}`
  + `#tema-toggle{margin-left:auto;font:inherit;font-size:.85rem;color:var(--metin);background:var(--yuzey);border:1px solid var(--sinir);border-radius:999px;padding:.32rem .85rem;cursor:pointer;transition:background-color .2s ease,border-color .2s ease}`
  + `#tema-toggle:hover{border-color:var(--vurgu)}`
  + `.ozet{margin:1.5rem 0 0;background:var(--yuzey);border:1px solid var(--sinir);border-radius:.6rem;padding:1rem 1.25rem}`
  + `.ozet-metin{margin:0 0 .8rem;font-size:.92rem;color:var(--silik)}`
  + `.istatistik{display:grid;grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr));gap:.6rem;margin:0}`
  + `.istatistik div{border-top:2px solid var(--vurgu);padding-top:.45rem}`
  + `.istatistik dt{font-size:.74rem;text-transform:uppercase;letter-spacing:.06em;color:var(--silik)}`
  + `.istatistik dd{margin:.15rem 0 0;font-size:1.35rem;font-weight:650;font-variant-numeric:tabular-nums}`
  + `#icerik{margin-top:1.5rem}#icerik a{color:var(--vurgu);text-decoration:underline;text-underline-offset:.15em}`
  + `#icerik a:hover{text-decoration-thickness:2px}`
  + `pre{background:var(--kod-zemin);border:1px solid var(--sinir);border-radius:.5rem;padding:1rem;overflow:auto;font-size:.86rem}`
  + `code{font-family:ui-monospace,"Cascadia Code","SF Mono",Consolas,Menlo,monospace;font-size:.88em;background:var(--kod-zemin);border-radius:.3rem;padding:.1em .35em}`
  + `pre code{background:none;padding:0;border-radius:0}`
  + `table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{border:1px solid var(--sinir);padding:.45rem .6rem;text-align:left;vertical-align:top}thead th{background:var(--yuzey)}`
  + `blockquote{margin:1rem 0;padding:.6rem 1rem;border-left:3px solid var(--vurgu);background:var(--yuzey);color:var(--silik)}`
  + `hr{border:none;border-top:1px solid var(--sinir);margin:1.75rem 0}img{max-width:100%}`
  + `#arama{font:inherit;color:var(--metin);background:var(--yuzey);border:1px solid var(--sinir);border-radius:.5rem;padding:.5rem .8rem;width:min(22rem,100%)}`
  + `#sonuclar{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.4rem}`
  + `#sonuclar li{background:var(--yuzey);border:1px solid var(--sinir);border-radius:.5rem;padding:.5rem .8rem}`
  + `.altbilgi{margin-top:2.5rem;padding-top:1rem;border-top:1px solid var(--sinir);color:var(--silik);font-size:.85rem}`
  + `.js .reveal{opacity:0;transform:translateY(10px);transition:opacity .45s ease,transform .45s ease}`
  + `.js .reveal.gorunur{opacity:1;transform:none}`
  + `:focus-visible{outline:.16rem solid var(--vurgu);outline-offset:.18rem;border-radius:.25rem}`
  + `::selection{background:var(--vurgu);color:var(--zemin)}`
  + `@media (prefers-reduced-motion: reduce){.js .reveal{opacity:1;transform:none;transition:none}*{animation:none;transition:none}}`
  + `@media (max-width:40rem){.sarmal{padding:0 1rem 2.5rem}#tema-toggle{margin-left:0}.istatistik{grid-template-columns:repeat(2,1fr)}table{font-size:.82rem}th,td{padding:.35rem .45rem}}`
  + `@media (max-width:26rem){.istatistik{grid-template-columns:1fr}}`;

function sayfaSar(lang, chrome, baslik, govde, aktif, ozetSatir, sayilar) {
  const parcalar = chrome["summary.template"].split("·").map((p) => p.trim());
  const ist = parcalar.map((p) => {
    const m = p.match(/\{(\w+)\}\s*(\S+)/);
    if (!m) return null;
    const anahtar = m[1];
    const etiket = m[2].replace(/[.,;:]+$/, "");
    const deger = { arac: sayilar.arac, sema: sayilar.sema, ann: sayilar.ann, res: sayilar.res, prompt: sayilar.prompt }[anahtar] ?? "0";
    return [etiket, String(deger)];
  }).filter(Boolean);

  const baslikJs = `<script>try{var t=localStorage.getItem("reaplus-tema");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){}</script>`;
  const temaLight = kacis(chrome["theme.light"]);
  const temaDark = kacis(chrome["theme.dark"]);
  const sonJs = `<script>\n`
    + `document.documentElement.classList.add("js");\n`
    + `(function(){var k="reaplus-tema";var d=document.getElementById("tema-toggle");\n`
    + `function uygula(t){document.documentElement.dataset.theme=t;try{localStorage.setItem(k,t);}catch(e){}if(d){d.setAttribute("aria-pressed",String(t==="dark"));d.textContent=t==="dark"?${JSON.stringify(temaLight)}:${JSON.stringify(temaDark)};}}\n`
    + `if(d){d.addEventListener("click",function(){uygula(document.documentElement.dataset.theme==="dark"?"light":"dark");});\n`
    + `if(document.documentElement.dataset.theme){d.setAttribute("aria-pressed",String(document.documentElement.dataset.theme==="dark"));d.textContent=document.documentElement.dataset.theme==="dark"?${JSON.stringify(temaLight)}:${JSON.stringify(temaDark)};}}\n`
    + `var azalt=window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n`
    + `var beliren=document.querySelectorAll(".reveal");\n`
    + `if(azalt||!("IntersectionObserver" in window)){beliren.forEach(function(el){el.classList.add("gorunur");});}\n`
    + `else{var gozcu=new IntersectionObserver(function(girdiler){girdiler.forEach(function(g){if(g.isIntersecting){g.target.classList.add("gorunur");gozcu.unobserve(g.target);}});},{threshold:.12,rootMargin:"0px 0px -8% 0px"});beliren.forEach(function(el){gozcu.observe(el);});}\n`
    + `var sayilar=document.querySelectorAll(".sayi");\n`
    + `function bitir(el){el.textContent=el.getAttribute("data-sayi");}\n`
    + `if(azalt||!("IntersectionObserver" in window)){sayilar.forEach(bitir);}\n`
    + `else{var sayac=new IntersectionObserver(function(girdiler){girdiler.forEach(function(g){if(!g.isIntersecting)return;var el=g.target;sayac.unobserve(el);var hedef=Number(el.getAttribute("data-sayi"));if(!isFinite(hedef))return;var baslangic=null;var sure=850;function kare(t){if(baslangic===null)baslangic=t;var oran=Math.min(1,(t-baslangic)/sure);var yumru=1-Math.pow(1-oran,3);el.textContent=String(Math.round(hedef*yumru));if(oran<1){requestAnimationFrame(kare);}else{bitir(el);}}requestAnimationFrame(kare);});},{threshold:.4});sayilar.forEach(function(el){sayac.observe(el);});}\n`
    + `})();\n</script>`;
  const titleSuffix = chrome["title.suffix"];
  return `<!DOCTYPE html>\n<html lang="${lang}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="${kacis(chrome["meta.desc"])}">\n<title>${kacis(baslik)}${titleSuffix ? " " + kacis(titleSuffix) : ""}</title>\n${baslikJs}\n<style>${css}</style>\n</head>\n<body>\n<div class="sarmal">\n<a class="atla" href="#icerik">${kacis(chrome["skip"])}</a>\n<header class="ust">\n<div class="marka"><span class="marka-ad">ReaPlus Docs</span><span class="marka-alt">${kacis(chrome["brand.tagline"])}</span></div>\n${navEtkin(aktif, chrome)}\n${dilSecici(lang, aktif, chrome)}\n<button id="tema-toggle" type="button" aria-pressed="false">${kacis(chrome["theme.dark"])}</button>\n</header>\n<section class="ozet reveal" aria-label="${kacis(chrome["a11y.summary"])}">\n<p class="ozet-metin">${kacis(ozetSatir)}</p>\n<dl class="istatistik">${ist.map(([etiket, deger]) => `<div><dt>${kacis(etiket)}</dt><dd><span class="sayi" data-sayi="${deger}">${deger}</span></dd></div>`).join("")}</dl>\n</section>\n<main id="icerik"><div class="reveal">\n<h1>${kacis(baslik)}</h1>\n${govde}\n</div></main>\n<footer class="altbilgi"><p>${chrome["footer.gen"]}</p></footer>\n</div>\n${sonJs}\n</body>\n</html>\n`;
}

// --- --check modu (Dalga-10): üretim YAZMAZ, mevcut docs/site/ çıktılarını doğrular.
// 5 dil × 7 sayfa = 35 HTML: varlık, ≥1000 karakter, <html lang> doğru dil kodu,
// index.html'de dil seçici (id="dil"). Hata → console.error + exit 1; geçer → exit 0.
function siteDogrula() {
  const sayfaAdlari = ["index.html", ...SAYFALAR.map((s) => s.html)];
  const hatalar = [];
  let toplam = 0;
  let gecen = 0;
  for (const lang of DILLER) {
    const hedefDir = lang === VARSAYILAN_DIL ? siteDir : join(siteDir, lang);
    for (const ad of sayfaAdlari) {
      toplam++;
      const dosya = join(hedefDir, ad);
      const gorsel = lang === VARSAYILAN_DIL ? `docs/site/${ad}` : `docs/site/${lang}/${ad}`;
      if (!existsSync(dosya)) { hatalar.push(`${gorsel}: dosya yok`); continue; }
      const html = readFileSync(dosya, "utf8");
      if (html.length < 1000) { hatalar.push(`${gorsel}: çok kısa (${html.length} karakter < 1000)`); continue; }
      const langEslesme = html.match(/<html\s+lang="([^"]*)"/);
      if (!langEslesme) { hatalar.push(`${gorsel}: <html lang="..."> yok`); continue; }
      if (langEslesme[1] !== lang) { hatalar.push(`${gorsel}: lang="${langEslesme[1]}", beklenen "${lang}"`); continue; }
      if (ad === "index.html" && !html.includes('id="dil"')) { hatalar.push(`${gorsel}: dil seçici (id="dil") yok`); continue; }
      gecen++;
    }
  }
  if (hatalar.length) {
    for (const h of hatalar) console.error(`site doğrulama hatası: ${h}`);
    console.error(`site doğrulama BAŞARISIZ: ${gecen}/${toplam} sayfa geçti, ${hatalar.length} hata`);
    process.exit(1);
  }
  console.log(`✓ Site doğrulama geçti: ${gecen}/${toplam} sayfa`);
  process.exit(0);
}

// --- main ---
if (process.argv.includes("--check")) siteDogrula();
const toolsMdTR = oku("docs/i18n/tr/TOOLS.md");
const sayilar = ozetSayilari(toolsMdTR);

mkdirSync(siteDir, { recursive: true });

for (const lang of DILLER) {
  const chrome = chromeOku(lang);
  const ozetSatir = ozetSatiri(chrome, sayilar);
  const hedefDir = lang === VARSAYILAN_DIL ? siteDir : join(siteDir, lang);
  mkdirSync(hedefDir, { recursive: true });

  const promptsPath = icerikYolu(lang, "docs/PROMPTS.md");
  const promptsMd = oku(promptsPath);
  const promptBasliklari = [...promptsMd.matchAll(/^## \d+\) (.+)$/gm)].map((m) => m[1]);

  for (const s of SAYFALAR) {
    const mdPath = icerikYolu(lang, s.md);
    const md = oku(mdPath);
    const idler = [];
    const govde = mdCevir(md, idler);
    const baslik = chrome[`nav.${s.key}`];
    writeFileSync(join(hedefDir, s.html), sayfaSar(lang, chrome, baslik, govde, s.html, ozetSatir, sayilar));
  }

  const dizin = [
    ...SAYFALAR.map((s) => ({ sayfa: s.html, baslik: chrome[`nav.${s.key}`], aciklama: chrome[`desc.${s.key}`] })),
    ...promptBasliklari.map((b) => ({ sayfa: "prompts.html", baslik: b, aciklama: chrome["prompt.ready"] })),
  ];
  const indexGovde = `<p>${chrome["index.intro"]}</p>
<label>${chrome["search.label"]} <input type="search" id="arama" placeholder="${kacis(chrome["search.placeholder"])}"></label>
<ul id="sonuclar">${dizin.map((d) => `<li data-baslik="${kacis(d.baslik.toLowerCase())} ${kacis(d.aciklama.toLowerCase())}"><a href="${d.sayfa}">${kacis(d.baslik)}</a> — ${kacis(d.aciklama)}</li>`).join("")}</ul>
<script>
const kutu = document.getElementById("arama");
const ogeler = [...document.querySelectorAll("#sonuclar li")];
kutu.addEventListener("input", () => {
  const q = kutu.value.toLocaleLowerCase();
  for (const li of ogeler) li.hidden = q !== "" && !li.dataset.baslik.includes(q);
});
</script>`;
  writeFileSync(join(hedefDir, "index.html"), sayfaSar(lang, chrome, chrome["nav.home"], indexGovde, "index.html", ozetSatir, sayilar));
  console.log(`  ${lang}: ${SAYFALAR.length + 1} sayfa -> ${lang === VARSAYILAN_DIL ? "docs/site/" : `docs/site/${lang}/`}`);
}

console.log(`site üretildi: ${DILLER.length} dil × ${SAYFALAR.length + 1} sayfa — ${sayilar.arac} araç · ${sayilar.sema} outputSchema · ${sayilar.ann} annotations · ${sayilar.res} resource · ${sayilar.prompt} prompt`);
