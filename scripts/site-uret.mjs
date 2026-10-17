// site-uret.mjs: Dalga K/2 — aranabilir tek statik site üretimi.
// Kaynaklar: README.md + docs/{TOOLS,EXAMPLES,ROADMAP}.md + CHANGELOG.md +
// docs/PROMPTS.md  ->  docs/site/*.html (index + 6 içerik sayfası).
// Sayılar TOOLS.md özetinden alınır (gerçek koşu; uydurma sayı YOK).
// Bağımlılık yok (yalnız node:fs/path/url), ağ/süreç/timer yok.
// Bilinmeyen göreli .md linkleri GitHub blob URL'ine yazılır (kırık link yok);
// sayfa-içi #çapalar github-slugger ile üretilen id'lere çözülür.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(kok, "docs", "site");
const BLOB = "https://github.com/Alyhnte/ReaPlus/blob/main/";

// Sayfa tanımı: çıktı + kaynak + başlık + açıklama (index nav'ı için).
const SAYFALAR = [
  { html: "readme.html", md: "README.md", baslik: "README", aciklama: "Kurulum, istemciler, özellikler, güvenlik" },
  { html: "tools.html", md: "docs/TOOLS.md", baslik: "Araç Referansı", aciklama: "Üretilmiş tam katalog (gerçek yüzey)" },
  { html: "examples.html", md: "docs/EXAMPLES.md", baslik: "Örnekler", aciklama: "Gerçek koşudan 5 senaryo" },
  { html: "roadmap.html", md: "docs/ROADMAP.md", baslik: "Yol Haritası", aciklama: "Öncelikli işler ve kapananlar" },
  { html: "changelog.html", md: "CHANGELOG.md", baslik: "Değişiklikler", aciklama: "Sürüm notları (Keep a Changelog)" },
  { html: "prompts.html", md: "docs/PROMPTS.md", baslik: "Prompt Kütüphanesi", aciklama: "10 hazır soru kalıbı" },
];

// Bilinen .md -> site sayfası eşleşmesi (kök ve docs/ önekleriyle).
const MD_ESLESME = new Map([
  ["README.md", "readme.html"],
  ["CHANGELOG.md", "changelog.html"],
  ["TOOLS.md", "tools.html"],
  ["EXAMPLES.md", "examples.html"],
  ["ROADMAP.md", "roadmap.html"],
  ["PROMPTS.md", "prompts.html"],
]);

function tabanAd(yol) {
  const s = yol.split("#")[0].split("?")[0];
  return s.split("/").pop();
}

// GitHub-vari başlık slug'ı ("## 🚀 Install" -> "-install").
// GitHub baş/son boşluğu kırpmaz: silinen emojinin yeri kesme işareti olur.
function slug(metin) {
  return metin
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/ /g, "-");
}

function kacis(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Göreli linki site-içi hedefe çevir; çevrilemeyen göreli -> GitHub blob.
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
  // Kod aralıklılarını yer tutucuyla koru, sonra link/resim, sonra geri koy.
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

// Minimal markdown -> HTML (başlık, kod bloğu, tablo, alıntı, liste, paragraf).
// Tüm başlık id'lerini `idKaydi`'na yazar (çapa doğrulaması için).
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
    // Kod bloğu.
    if (s.startsWith("```")) {
      const dil = s.slice(3).trim().replace(/[^a-z0-9+-]/gi, "");
      const ic = [];
      i++;
      while (i < satirlar.length && !satirlar[i].startsWith("```")) { ic.push(satirlar[i]); i++; }
      i++;
      dis.push(`<pre><code${dil ? ` class="language-${kacis(dil)}"` : ""}>${kacis(ic.join("\n"))}</code></pre>`);
      continue;
    }
    // Başlık.
    const b = s.match(/^(#{1,6})\s+(.*)$/);
    if (b) {
      const duz = b[2].replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
      dis.push(`<h${b[1].length} id="${tekilId(duz)}">${satirIci(b[2])}</h${b[1].length}>`);
      i++;
      continue;
    }
    // Tablo.
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
    // Alıntı.
    if (/^\s*>/.test(s)) {
      const ic = [];
      while (i < satirlar.length && /^\s*>/.test(satirlar[i])) { ic.push(satirlar[i].replace(/^\s*>\s?/, "")); i++; }
      dis.push(`<blockquote>${satirIci(ic.join("\n"))}</blockquote>`);
      continue;
    }
    // Yatay çizgi.
    if (/^\s*(---+\s*|___+\s*|\*\*\*+\s*)$/.test(s)) { dis.push("<hr>"); i++; continue; }
    // Liste.
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
    // Boş satır.
    if (/^\s*$/.test(s)) { i++; continue; }
    // Paragraf (bitişik satırlar birleşir).
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

function navEtkin(aktif) {
  const tum = [{ html: "index.html", baslik: "Ana Sayfa" }, ...SAYFALAR.map((s) => ({ html: s.html, baslik: s.baslik }))];
  return `<nav class="gezinme" aria-label="Site">${tum.map((s) => (s.html === aktif ? `<strong>${kacis(s.baslik)}</strong>` : `<a href="${s.html}">${kacis(s.baslik)}</a>`)).join(" · ")}</nav>`;
}

// Premium-minimal chrome (devtool dokümantasyon dili):
// - Palet: tek vurgu çam yeşili (aydınlık #2E6B4E / karanlık #7BC9A2, aynı renk ailesi,
//   doygunluk <%40) + nötr zeminler; saf siyah/beyaz yok, gradyan yok, parlama yok.
// - Yazı: sistem yığınları (sans başlık + sans gövde + mono kod); paketlenmiş/ağ fontu yok.
// - İmza (tek): kaydırmayla belirme (IntersectionObserver, transform+opacity) +
//   TOOLS.md gerçek sayılarının sayım animasyonu. Hero yok, abartılı efekt yok.
// - Tema: CSS değişkenleri + manuel toggle (localStorage) + prefers-color-scheme
//   varsayılanı; tek tema kilidi (bölüm inversiyonu yok); iki modda body AA.
// - Kısıtlar: reduced-motion altında her şey statik; mobil tek sütun; görünür odak;
//   geçişler tekil yazılır (toplu kısayol yok); kaydırma dinleyicisi yok (yalnız IntersectionObserver).
function sayfaSar(baslik, govde, aktif, ozetSatir) {
  const sayiAl = (etiket) => {
    const m = ozetSatir.match(new RegExp(`(\\d+)\\s+${etiket}`));
    return m ? m[1] : "0";
  };
  const istatistik = [
    ["araç", sayiAl("araç")],
    ["outputSchema", sayiAl("outputSchema")],
    ["annotations", sayiAl("annotations")],
    ["resource", sayiAl("resource")],
    ["prompt", sayiAl("prompt")],
  ];
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
  const baslikJs = `<script>try{var t=localStorage.getItem("reaplus-tema");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){}</script>`;
  const sonJs = `<script>\n`
    + `document.documentElement.classList.add("js");\n`
    + `(function(){var k="reaplus-tema";var d=document.getElementById("tema-toggle");\n`
    + `function uygula(t){document.documentElement.dataset.theme=t;try{localStorage.setItem(k,t);}catch(e){}if(d){d.setAttribute("aria-pressed",String(t==="dark"));d.textContent=t==="dark"?"Açık tema":"Koyu tema";}}\n`
    + `if(d){d.addEventListener("click",function(){uygula(document.documentElement.dataset.theme==="dark"?"light":"dark");});\n`
    + `if(document.documentElement.dataset.theme){d.setAttribute("aria-pressed",String(document.documentElement.dataset.theme==="dark"));d.textContent=document.documentElement.dataset.theme==="dark"?"Açık tema":"Koyu tema";}}\n`
    + `var azalt=window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n`
    + `var beliren=document.querySelectorAll(".reveal");\n`
    + `if(azalt||!("IntersectionObserver" in window)){beliren.forEach(function(el){el.classList.add("gorunur");});}\n`
    + `else{var gozcu=new IntersectionObserver(function(girdiler){girdiler.forEach(function(g){if(g.isIntersecting){g.target.classList.add("gorunur");gozcu.unobserve(g.target);}});},{threshold:.12,rootMargin:"0px 0px -8% 0px"});beliren.forEach(function(el){gozcu.observe(el);});}\n`
    + `var sayilar=document.querySelectorAll(".sayi");\n`
    + `function bitir(el){el.textContent=el.getAttribute("data-sayi");}\n`
    + `if(azalt||!("IntersectionObserver" in window)){sayilar.forEach(bitir);}\n`
    + `else{var sayac=new IntersectionObserver(function(girdiler){girdiler.forEach(function(g){if(!g.isIntersecting)return;var el=g.target;sayac.unobserve(el);var hedef=Number(el.getAttribute("data-sayi"));if(!isFinite(hedef))return;var baslangic=null;var sure=850;function kare(t){if(baslangic===null)baslangic=t;var oran=Math.min(1,(t-baslangic)/sure);var yumru=1-Math.pow(1-oran,3);el.textContent=String(Math.round(hedef*yumru));if(oran<1){requestAnimationFrame(kare);}else{bitir(el);}}requestAnimationFrame(kare);});},{threshold:.4});sayilar.forEach(function(el){sayac.observe(el);});}\n`
    + `})();\n</script>`;
  return `<!DOCTYPE html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="ReaPlus teknik dokümantasyon sitesi: kurulum, araç referansı, örnekler, yol haritası.">\n<title>${kacis(baslik)} — ReaPlus Docs</title>\n${baslikJs}\n<style>${css}</style>\n</head>\n<body>\n<div class="sarmal">\n<a class="atla" href="#icerik">İçeriğe atla</a>\n<header class="ust">\n<div class="marka"><span class="marka-ad">ReaPlus Docs</span><span class="marka-alt">tersine mühendislik çalışma yüzeyi</span></div>\n${navEtkin(aktif)}\n<button id="tema-toggle" type="button" aria-pressed="false">Koyu tema</button>\n</header>\n<section class="ozet reveal" aria-label="Yüzey özeti">\n<p class="ozet-metin">Yüzey özeti (gerçek koşu, TOOLS.md): ${ozetSatir}</p>\n<dl class="istatistik">${istatistik.map(([etiket, deger]) => `<div><dt>${etiket}</dt><dd><span class="sayi" data-sayi="${deger}">${deger}</span></dd></div>`).join("")}</dl>\n</section>\n<main id="icerik"><div class="reveal">\n<h1>${kacis(baslik)}</h1>\n${govde}\n</div></main>\n<footer class="altbilgi"><p>ReaPlus Docs — statik site. Üretim: <code>node scripts/site-uret.mjs</code> · Sayılar docs/TOOLS.md özetinden alınır (gerçek koşu).</p></footer>\n</div>\n${sonJs}\n</body>\n</html>\n`;
}

// TOOLS.md özetinden gerçek sayılar (docs-examples testiyle aynı regexler).
function ozetOku(toolsMd) {
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

function oku(yol) {
  try {
    return readFileSync(join(kok, yol), "utf8");
  } catch {
    throw new Error(`kaynak yok: ${yol}`);
  }
}

const toolsMd = oku("docs/TOOLS.md");
const ozet = ozetOku(toolsMd);
const ozetSatir = `${ozet.arac} araç · ${ozet.sema} outputSchema · ${ozet.ann} annotations · ${ozet.res} resource · ${ozet.prompt} prompt`;

mkdirSync(siteDir, { recursive: true });

// PROMPTS başlıklarını arama dizini için topla.
const promptsMd = oku("docs/PROMPTS.md");
const promptBasliklari = [...promptsMd.matchAll(/^## \d+\) (.+)$/gm)].map((m) => m[1]);

for (const s of SAYFALAR) {
  const md = s.md === "docs/TOOLS.md" ? toolsMd : oku(s.md);
  const idler = [];
  const govde = mdCevir(md, idler);
  writeFileSync(join(siteDir, s.html), sayfaSar(s.baslik, govde, s.html, ozetSatir));
}

// index.html: nav + özet + istemci-içi arama (sunucusuz, timersız).
const dizin = [
  ...SAYFALAR.map((s) => ({ sayfa: s.html, baslik: s.baslik, aciklama: s.aciklama })),
  ...promptBasliklari.map((b) => ({ sayfa: "prompts.html", baslik: b, aciklama: "hazır prompt" })),
];
const indexGovde = `<p>README + Araç Referansı + Örnekler + Yol Haritası + Değişiklikler + Prompt Kütüphanesi — tek statik site. Üretim: <code>node scripts/site-uret.mjs</code>.</p>
<label>Site içinde ara: <input type="search" id="arama" placeholder="örn. pcap, reçete, fuzz"></label>
<ul id="sonuclar">${dizin.map((d) => `<li data-baslik="${kacis(d.baslik.toLowerCase())} ${kacis(d.aciklama.toLowerCase())}"><a href="${d.sayfa}">${kacis(d.baslik)}</a> — ${kacis(d.aciklama)}</li>`).join("")}</ul>
<script>
const kutu = document.getElementById("arama");
const ogeler = [...document.querySelectorAll("#sonuclar li")];
kutu.addEventListener("input", () => {
  const q = kutu.value.toLocaleLowerCase("tr");
  for (const li of ogeler) li.hidden = q !== "" && !li.dataset.baslik.includes(q);
});
</script>`;
writeFileSync(join(siteDir, "index.html"), sayfaSar("Ana Sayfa", indexGovde, "index.html", ozetSatir));

console.log(`site üretildi: docs/site/ (${SAYFALAR.length + 1} sayfa) — ${ozetSatir}`);
