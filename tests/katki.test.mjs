// katki.test.mjs: Dalga-9 — katkı hunisi doğrulaması (CONTRIBUTING bölümleri +
// issue şablonları). YÖNTEM: ham metin/regex + yapısal YAML denetimi; repo'da
// js-yaml yok, yeni bağımlılık eklenmez (gelenek: ci-schema-adim.test.mjs).
// Salt okunur: yalnız fs okuma, ağ/timer/süreç yok.
// Koş: `node tests/katki.test.mjs` (tek dosya) veya `npm test` (tam küme).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));
const oku = (rel) => readFileSync(join(kok, rel), "utf8");

// CONTRIBUTING.md'de bulunması zorunlu H2 bölümleri (numara opsiyonel:
// eski `## 1) Kurulum` biçimi de geçerli sayılır).
const BOLUMLER = [
  ["Kurulum", /^##\s+(?:\d+\)\s+)?Kurulum\s*$/m],
  ["Test", /^##\s+(?:\d+\)\s+)?Test\s*$/m],
  ["Kod Stili", /^##\s+(?:\d+\)\s+)?Kod Stili\s*$/m],
  ["Dalga Kuralları", /^##\s+(?:\d+\)\s+)?Dalga Kuralları\s*$/m],
  ["PR Akışı", /^##\s+(?:\d+\)\s+)?PR Akışı\s*$/m],
  // "Yayın" (npm publish) ve "Yayım" yazımları her ikisi de kabul edilir.
  ["Yayın/Yayım", /^##\s+(?:\d+\)\s+)?Yay[ıi][nm]\s*$/m],
];

// GitHub issue formunun izin verdiği alan tipleri (şema dışı tip YAML'ı
// geçerli kılmaz; GitHub formu reddeder).
const IZINLI_TIPLER = new Set(["markdown", "textarea", "input", "dropdown", "checkboxes"]);

const SABLONLAR = [
  {
    dosya: ".github/ISSUE_TEMPLATE/bug-raporu.yml",
    ustAnahtarlar: ["name", "description", "title", "labels", "body"],
    baslik: /^title:\s*"\[bug\] "/m,
    baslikNotu: 'title: "[bug] " öneki olmalı',
    etiket: /^labels:\s*\[\s*"bug"\s*\]/m,
    etiketNotu: 'labels: ["bug"] olmalı',
    alanlar: ["Yeniden ureme adimlari", "Beklenen sonuc", "Gerceklesen sonuc", "Ortam"],
    zorunluAlanlar: ["Yeniden ureme adimlari", "Beklenen sonuc", "Gerceklesen sonuc", "Ortam"],
  },
  {
    dosya: ".github/ISSUE_TEMPLATE/ozellik-istegi.yml",
    ustAnahtarlar: ["name", "description", "title", "labels", "body"],
    baslik: /^title:\s*"\[feature\] "/m,
    baslikNotu: 'title: "[feature] " öneki olmalı',
    etiket: /^labels:\s*\[\s*"enhancement"\s*\]/m,
    etiketNotu: 'labels: ["enhancement"] olmalı',
    alanlar: ["Problem tanimi", "Onerilen cozum", "Alternatifler"],
    zorunluAlanlar: ["Problem tanimi", "Onerilen cozum"],
  },
];

// Var olması zorunlu, DEĞİŞTİRİLMESİ yasak olan mevcut şablon.
const MEVCUT_SABLON = ".github/ISSUE_TEMPLATE/good-first-issue.yml";

function tirnakDengeli(satir) {
  let adet = 0;
  for (let i = 0; i < satir.length; i++) {
    if (satir[i] === "\\") { i++; continue; }
    if (satir[i] === '"') adet++;
  }
  return adet % 2 === 0;
}

// Yapısal YAML denetimi (yorum satırı + basit anahtar/liste kümeleri).
// js-yaml yok; amaç: sekmeli girinti, dengesiz tırnak, çift sayı dışı girinti,
// tanımsız satır ve tekrarlanan üst düzey anahtar gibi geçersiz YAML'ı yakalamak.
function yamlDenetle(ad, metin, ustAnahtarlar) {
  const satirlar = metin.split(/\r?\n/);
  const ustSeviye = [];
  let oncekiGirinti = -1;
  satirlar.forEach((ham, i) => {
    const no = i + 1;
    if (ham.trim() === "" || /^\s*#/.test(ham)) return;
    assert.ok(!ham.includes("\t"), `${ad}:${no} sekme içermemeli (YAML sekmeli girinti kabul etmez)`);
    const girinti = ham.length - ham.replace(/^ +/, "").length;
    assert.equal(girinti % 2, 0, `${ad}:${no} girinti çift sayı olmalı (2'lik katman): ${ham.trim()}`);
    assert.ok(tirnakDengeli(ham), `${ad}:${no} çift tırnak dengesiz: ${ham.trim()}`);
    const liste = /^ *- \S/.test(ham);
    const anahtar = /^ *([A-Za-z0-9_][A-Za-z0-9_."'-]*):(\s|$)/.test(ham);
    if (!liste && !anahtar) {
      assert.ok(
        oncekiGirinti >= 0 && girinti > oncekiGirinti,
        `${ad}:${no} tanımsız satır (ne liste ne anahtar ne devam): ${ham.trim()}`,
      );
    }
    if (girinti === 0) {
      const m = ham.match(/^([A-Za-z0-9_]+):/);
      if (m) ustSeviye.push(m[1]);
    }
    oncekiGirinti = girinti;
  });
  for (const k of ustAnahtarlar) {
    const kac = ustSeviye.filter((x) => x === k).length;
    assert.equal(kac, 1, `${ad}: üst düzey '${k}' anahtarı tam 1 kez olmalı (bulunan: ${kac})`);
  }
}

// `body:` altındaki blokları (her biri bir form alanı) ayır.
function govdeBlokleri(metin) {
  const i = metin.search(/^body:\s*$/m);
  assert.ok(i >= 0, "body: anahtarı bulunmalı");
  return metin
    .slice(i)
    .split(/\n(?= {2}- type: )/)
    .filter((b) => /^ {2}- type: /m.test(b));
}

describe("CONTRIBUTING.md bölümleri", () => {
  const md = oku("CONTRIBUTING.md");

  for (const [ad, re] of BOLUMLER) {
    it(`## ${ad} bölümü mevcut`, () => {
      assert.match(md, re, `CONTRIBUTING.md içinde '## ${ad}' başlığı olmalı`);
    });
  }

  it("kurulum + test komutları belgelenmiş", () => {
    assert.match(md, /npm ci/, "CONTRIBUTING.md 'npm ci' adımını içermeli");
    assert.match(md, /npm run build/, "CONTRIBUTING.md 'npm run build' adımını içermeli");
    assert.match(md, /npm test/, "CONTRIBUTING.md 'npm test' komutunu içermeli");
    assert.match(md, /npm run typecheck/, "CONTRIBUTING.md 'npm run typecheck' komutunu içermeli");
    assert.match(
      md,
      /node --test tests\//,
      "CONTRIBUTING.md tek dosya testi komutunu içermeli",
    );
  });

  it("dalga kuralları worktree + TDD + commit/push + ornek.js restore içerir", () => {
    assert.match(md, /worktree/i, "CONTRIBUTING.md worktree izolasyonundan bahsetmeli");
    assert.match(md, /TDD/, "CONTRIBUTING.md TDD kuralından bahsetmeli");
    assert.match(
      md,
      /git restore[^\n]*tests\/corpus\/ornek\.js/,
      "CONTRIBUTING.md ornek.js restore kuralını içermeli",
    );
  });
});

describe("issue şablonları — dosya varlığı", () => {
  for (const s of SABLONLAR) {
    it(`${s.dosya} mevcut`, () => {
      assert.ok(existsSync(join(kok, s.dosya)), `${s.dosya} dosyası olmalı`);
    });
  }

  it(`${MEVCUT_SABLON} mevcut (dokunulmadı)`, () => {
    assert.ok(existsSync(join(kok, MEVCUT_SABLON)), `${MEVCUT_SABLON} korunmalı`);
  });
});

describe("issue şablonları — yapısal YAML", () => {
  for (const s of SABLONLAR) {
    it(`${s.dosya} geçerli YAML yapısında`, () => {
      assert.ok(existsSync(join(kok, s.dosya)), `${s.dosya} dosyası olmalı`);
      yamlDenetle(s.dosya, oku(s.dosya), s.ustAnahtarlar);
    });
  }

  it(`${MEVCUT_SABLON} geçerli YAML yapısında (salt okunur kontrol)`, () => {
    assert.ok(existsSync(join(kok, MEVCUT_SABLON)), `${MEVCUT_SABLON} olmalı`);
    yamlDenetle(MEVCUT_SABLON, oku(MEVCUT_SABLON), ["name", "description", "title", "labels", "body"]);
  });
});

describe("issue şablonları — form alanları", () => {
  for (const s of SABLONLAR) {
    it(`${s.dosya} başlık öneki ve etiketi`, () => {
      const metin = oku(s.dosya);
      assert.match(metin, s.baslik, `${s.dosya}: ${s.baslikNotu}`);
      assert.match(metin, s.etiket, `${s.dosya}: ${s.etiketNotu}`);
    });

    it(`${s.dosya} body alan tipleri GitHub şemasında`, () => {
      const metin = oku(s.dosya);
      const tipler = [...metin.matchAll(/^\s{2}- type:\s*(\S+)\s*$/gm)].map((m) => m[1]);
      assert.ok(tipler.length >= s.alanlar.length, `${s.dosya}: body'de yeterli alan yok`);
      for (const t of tipler) {
        assert.ok(IZINLI_TIPLER.has(t), `${s.dosya}: izin verilmeyen alan tipi '${t}'`);
      }
    });

    for (const alan of s.alanlar) {
      it(`${s.dosya} alanında '${alan}' var`, () => {
        const metin = oku(s.dosya);
        assert.match(metin, new RegExp(`label:\\s*"${alan}"`), `${s.dosya}: '${alan}' etiketli alan olmalı`);
      });
    }

    for (const alan of s.zorunluAlanlar) {
      it(`${s.dosya} alanında '${alan}' zorunlu`, () => {
        const blok = govdeBlokleri(oku(s.dosya)).find((b) => b.includes(`label: "${alan}"`));
        assert.ok(blok, `${s.dosya}: '${alan}' bloğu bulunmalı`);
        assert.match(blok, /required:\s*true/, `${s.dosya}: '${alan}' validations.required: true olmalı`);
      });
    }
  }
});
