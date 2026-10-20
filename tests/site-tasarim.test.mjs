// site-tasarim.test.mjs: Dalga 5a — premium-minimal site tasarımı (chrome) doğrulaması.
// KIRMIZI: mevcut çıplak system-ui şablonunda düşer; YEŞİL: scripts/site-uret.mjs
// şablon+CSS/JS + `node scripts/site-uret.mjs` regen sonrası geçer.
// Koş: `node tests/site-tasarim.test.mjs` (tek dosya) veya `npm test` (tam küme).
// Tamamen offline + salt okunur: yalnız fs okuma, ağ/timer/süreç yok.
// Kapsam: tema değişkenleri, toggle butonu, iki tema bloğu, reduced-motion bloğu,
// kontrast için listelenebilir renk çiftleri, neon/glow YOK, Inter YOK.
// Ek guard'lar: `transition: all` YOK, scroll listener YOK, saf #000/#fff YOK,
// mor gradyan YOK, IntersectionObserver + gerçek sayılı sayım animasyonu VAR.
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));
const ureticiYol = join(kok, "scripts", "site-uret.mjs");
const siteDir = join(kok, "docs", "site");
const toolsMdYol = join(kok, "docs", "TOOLS.md");

let kaynak; // site-uret.mjs metni (şablon+CSS/JS)
let indexHtml;
let ozet; // TOOLS.md gerçek sayıları

function ozetOku(md) {
  const al = (re) => {
    const m = md.match(re);
    assert.ok(m, `${re} TOOLS.md özetinde bulunamadı`);
    return Number(m[1]);
  };
  return {
    arac: al(/^- Total tools: (\d+)$/m),
    sema: al(/^- Tools with outputSchema: (\d+)$/m),
    ann: al(/^- Tools with annotations: (\d+)$/m),
    res: al(/^- Total resources: (\d+)$/m),
    prompt: al(/^- Total prompts: (\d+)$/m),
  };
}

// sRGB -> göreli parlaklık (WCAG 2.x).
function parlaklik(hex) {
  const n = hex.replace("#", "");
  const tam = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(tam.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function kontrast(a, b) {
  const [yuksek, dusuk] = [parlaklik(a), parlaklik(b)].sort((x, y) => y - x);
  return (yuksek + 0.05) / (dusuk + 0.05);
}

// Şablon içinden tema bloğundaki --degisken hex'ini çeker.
function temaRengi(kaynakMetin, tema, degisken) {
  const blok = new RegExp(
    `\\[data-theme="${tema}"\\][^{]*\\{([^}]*)\\}`,
    "s",
  );
  const m = kaynakMetin.match(blok);
  assert.ok(m, `[data-theme="${tema}"] bloğu bulunamadı`);
  const renk = new RegExp(`${degisken}\\s*:\\s*(#[0-9a-fA-F]{3,6})`);
  const r = m[1].match(renk);
  assert.ok(r, `${degisken} [data-theme="${tema}"] içinde bulunamadı`);
  return r[1];
}

before(() => {
  assert.ok(existsSync(ureticiYol), "scripts/site-uret.mjs yok");
  kaynak = readFileSync(ureticiYol, "utf8");
  ozet = ozetOku(readFileSync(toolsMdYol, "utf8"));
  const indexYol = join(siteDir, "index.html");
  assert.ok(existsSync(indexYol), "docs/site/index.html yok: önce `node scripts/site-uret.mjs`");
  indexHtml = readFileSync(indexYol, "utf8");
});

describe("(a) tema değişkenleri + iki tema bloğu", () => {
  it("CSS değişkenleri tanımlı (zemin/metin/yüzey/vurgu)", () => {
    for (const d of ["--zemin", "--metin", "--yuzey", "--vurgu"]) {
      assert.ok(kaynak.includes(d), `şablon ${d} değişkenini tanımlamalı`);
    }
    assert.ok(indexHtml.includes("--zemin"), "üretilmiş HTML tema değişkenlerini taşımalı");
  });

  it("aydınlık + karanlık tema bloğu var, varsayılan prefers-color-scheme", () => {
    assert.ok(kaynak.includes('[data-theme="dark"]'), "karanlık tema bloğu olmalı");
    assert.ok(kaynak.includes('[data-theme="light"]'), "aydınlık tema bloğu olmalı");
    assert.ok(kaynak.includes("prefers-color-scheme"), "varsayılan prefers-color-scheme olmalı");
    assert.ok(indexHtml.includes('[data-theme="dark"]') || indexHtml.includes("data-theme"), "çıktı tema bloğunu taşımalı");
  });

  it("manuel toggle: buton + localStorage", () => {
    assert.ok(kaynak.includes('id="tema-toggle"') || kaynak.includes("id='tema-toggle'"), "tema toggle butonu olmalı");
    assert.ok(kaynak.includes("localStorage"), "toggle localStorage ile kalıcı olmalı");
    assert.ok(indexHtml.includes("tema-toggle"), "çıktıda toggle butonu olmalı");
  });
});

describe("(b) hareket kısıtları + imza öğe", () => {
  it("reduced-motion bloğu var, scroll-reveal IntersectionObserver ile", () => {
    assert.ok(kaynak.includes("prefers-reduced-motion"), "reduced-motion bloğu olmalı");
    assert.ok(kaynak.includes("IntersectionObserver"), "scroll-reveal IntersectionObserver ile olmalı");
    assert.ok(indexHtml.includes("IntersectionObserver"), "çıktı IntersectionObserver içermeli");
  });

  it("pencere-scroll listener YOK, `transition: all` YOK", () => {
    assert.ok(!/addEventListener\(\s*["']scroll["']/.test(kaynak), "scroll listener yasak (IntersectionObserver kullan)");
    assert.ok(!/\.onscroll/.test(kaynak), "onscroll yasak");
    assert.ok(!/transition\s*:\s*all\b/.test(kaynak), "`transition: all` yasak (özel geçişler kullan)");
  });

  it("gerçek sayıların sayım animasyonu (TOOLS.md, uydurma YOK)", () => {
    assert.ok(kaynak.includes("data-sayi"), "sayım animasyonu data-sayi ile olmalı");
    for (const n of [ozet.arac, ozet.sema, ozet.ann, ozet.res, ozet.prompt]) {
      assert.ok(
        indexHtml.includes(`data-sayi="${n}"`),
        `çıktı gerçek sayıyı taşımalı: data-sayi="${n}"`,
      );
    }
  });
});

describe("(c) kontrast AA + yasak desenler", () => {
  it("renk çiftleri listelenebilir, body kontrastı iki modda ≥ 4.5", () => {
    const ciftler = [
      { mod: "light", metin: temaRengi(kaynak, "light", "--metin"), zemin: temaRengi(kaynak, "light", "--zemin") },
      { mod: "dark", metin: temaRengi(kaynak, "dark", "--metin"), zemin: temaRengi(kaynak, "dark", "--zemin") },
    ];
    for (const c of ciftler) {
      const oran = kontrast(c.metin, c.zemin);
      assert.ok(
        oran >= 4.5,
        `${c.mod} mod body kontrastı AA olmalı (metin ${c.metin} / zemin ${c.zemin} = ${oran.toFixed(2)}:1)`,
      );
    }
  });

  it("neon/glow deseni YOK", () => {
    assert.ok(!/neon|glow/i.test(kaynak), "neon/glow sözcüğü yasak");
    assert.ok(!/text-shadow/i.test(kaynak), "text-shadow (parlama) yasak");
  });

  it("Inter referansı YOK (yazı tipi sistemi yığını)", () => {
    assert.ok(!/font[^;{}]*\binter\b/i.test(kaynak), "font yığınında Inter yasak");
    assert.ok(!/["']Inter["']/.test(kaynak), "'Inter' yazı tipi adı yasak");
    assert.ok(!/fonts\.googleapis|fonts\.gstatic/i.test(kaynak), "ağdan font indirme yasak");
  });

  it("saf #000/#fff YOK, mor gradyan YOK", () => {
    assert.ok(!/#000000|#ffffff|#000\b|#fff\b/i.test(kaynak), "saf siyah/beyaz yasak (off-black/off-white kullan)");
    assert.ok(!/#000000|#ffffff|#000\b|#fff\b/i.test(indexHtml), "çıktıda saf siyah/beyaz yasak");
    assert.ok(!/linear-gradient/i.test(kaynak), "gradyan (AI-mor) yasak — düz zeminler");
  });
});
