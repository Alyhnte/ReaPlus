// ornek-oturumlar.test.mjs: Dalga-7 — docs/ornek-oturumlar/ (3 oturum dosyası) +
// README "Örnek Oturumlar" bölümü kalite kapısı.
// Kapı: dosya varlığı + asgari uzunluk (boş/uydurma doküman geçmesin) + gerçek
// araç adları (Ghidra analyzeHeadless, IDA idat, r2) + README'de başlık ve
// 3 göreli link. Salt okunur: fs okuma dışında işlem yok.
// Koş: `node tests/ornek-oturumlar.test.mjs` (tek dosya) veya `npm test` (tam küme).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));
const DIZIN = join(kok, "docs", "ornek-oturumlar");
const README = join(kok, "README.md");

// Oturum dosyaları + her birinde zorunlu gerçek araç adı (uydurma araç yasak).
const OTURUMLAR = [
  { ad: "ghidra-analiz.md", zorunlu: ["analyzeHeadless", "rea_ghidra_", "REA_GHIDRA_DIR"] },
  { ad: "ida-karsilastirma.md", zorunlu: ["idat", "rea_ida_", "REA_IDA_PATH"] },
  { ad: "r2-triage.md", zorunlu: ["r2 -A", "rea_r2_", "radare2"] },
];
const ASGARI_KARAKTER = 500;

// README bölüm başlığı (emoji + Türkçe) ve linkler (docs-içi göreli yol).
const BASLIK = "## 🎬 Örnek Oturumlar";
const LINKLER = OTURUMLAR.map((o) => `docs/ornek-oturumlar/${o.ad}`);

describe("docs/ornek-oturumlar: 3 oturum dosyası", () => {
  it("dizin ve 3 dosya mevcut", () => {
    assert.ok(existsSync(DIZIN), `docs/ornek-oturumlar/ yok (önce dizin oluşturulmalı)`);
    for (const o of OTURUMLAR) {
      assert.ok(existsSync(join(DIZIN, o.ad)), `${o.ad} yok`);
    }
  });

  // Boş/ucuz doküman kapıyı geçemez: her dosya asgari uzunlukta olmalı.
  it("her dosya asgari 500 karakter", () => {
    for (const o of OTURUMLAR) {
      const md = readFileSync(join(DIZIN, o.ad), "utf8");
      assert.ok(
        md.length >= ASGARI_KARAKTER,
        `${o.ad} çok kısa (${md.length} < ${ASGARI_KARAKTER} karakter)`,
      );
    }
  });

  // Oturum gerçek araç komutları içermeli (Ghidra/IDA/r2 adları uydurma olamaz).
  it("her dosya kendi gerçek araç adlarını içerir", () => {
    for (const o of OTURUMLAR) {
      const md = readFileSync(join(DIZIN, o.ad), "utf8");
      for (const terim of o.zorunlu) {
        assert.ok(md.includes(terim), `${o.ad} gerçek aracı içermeli: ${terim}`);
      }
    }
  });
});

describe("README: Örnek Oturumlar bölümü", () => {
  const readme = readFileSync(README, "utf8");

  it("## 🎬 Örnek Oturumlar başlığı var", () => {
    assert.ok(readme.includes(BASLIK), `README'de "${BASLIK}" başlığı yok`);
  });

  it("3 oturum linki README'de geçiyor", () => {
    for (const link of LINKLER) {
      assert.ok(readme.includes(link), `README'de link yok: ${link}`);
    }
  });

  // Kırık link kapısı: link verilen her dosya gerçekten diskte durmalı.
  it("README'deki 3 link gerçek dosyalara açılıyor", () => {
    for (const link of LINKLER) {
      assert.ok(existsSync(join(kok, link)), `README linki kırık: ${link}`);
    }
  });
});
