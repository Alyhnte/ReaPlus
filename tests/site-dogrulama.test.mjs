// site-dogrulama.test.mjs: Dalga-10 — site-uret.mjs --check modu doğrulaması.
// Üretim: `node scripts/site-uret.mjs` (docs/site/*.html), doğrulama: `--check`.
// Bu test üretimi SİPARİŞ eder: önce üretir, sonra --check'i hem geçiş hem
// bozuk-dosya (kırmızı) yönünden sınar. Bozuk-dosya testi dosyayı geri alır.
// Koş: `node tests/site-dogrulama.test.mjs` (tek dosya) veya `npm test` (tam küme).
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));
const uretici = join(kok, "scripts", "site-uret.mjs");
const siteDir = join(kok, "docs", "site");

const DILLER = ["tr", "en", "de", "fr", "es"];
const SAYFALAR = [
  "index.html",
  "readme.html",
  "tools.html",
  "examples.html",
  "roadmap.html",
  "changelog.html",
  "prompts.html",
];

// Bozuk-dosya testinin kurbanı ve geri yükleme yedeği.
const KURBAN = join(siteDir, "es", "index.html");
let yedek = null;

function checkKos() {
  return spawnSync(process.execPath, [uretici, "--check"], { cwd: kok, encoding: "utf8" });
}

before(() => {
  assert.ok(existsSync(uretici), "scripts/site-uret.mjs yok");
  // 1) Üretim: site yoksa --check anlamsız; önce üret.
  const uret = spawnSync(process.execPath, [uretici], { cwd: kok, encoding: "utf8" });
  assert.equal(uret.status, 0, `üretim başarısız:\n${uret.stderr || uret.stdout}`);
  assert.ok(existsSync(siteDir), "üretim docs/site/ oluşturmalı");
  // 2) --check modu eklenmiş olmalı (yoksa bu testin kendisi kırmızı kalır).
});

after(() => {
  // Bozuk-dosya testi başarısız kalırsa bile yedeği geri yaz (iz bırakma).
  if (yedek !== null) {
    writeFileSync(KURBAN, yedek);
    yedek = null;
  }
});

describe("--check modu: geçerli site", () => {
  it("üretilmiş 35 sayfanın tamamı --check'ten geçer (exit 0)", () => {
    const r = checkKos();
    assert.equal(
      r.status,
      0,
      `--check exit ${r.status} olmalı (0):\n${r.stderr || r.stdout}`,
    );
    assert.ok(
      (r.stdout + r.stderr).includes("35/35"),
      `çıktı 35/35 sayfa içermeli:\n${r.stdout}`,
    );
    // 5 dil × 7 sayfa gerçekten diskte (uydurma sayı yok).
    for (const lang of DILLER) {
      const dir = lang === "tr" ? siteDir : join(siteDir, lang);
      for (const s of SAYFALAR) {
        assert.ok(existsSync(join(dir, s)), `${lang}/${s} yok (üretim eksik)`);
      }
    }
  });

  it("var olmayan tek sayfa --check'i düşürür (exit 1)", () => {
    assert.ok(existsSync(KURBAN), "es/index.html yok — üretim bozuk");
    yedek = readFileSync(KURBAN, "utf8");
    try {
      rmSync(KURBAN);
      const r = checkKos();
      assert.equal(
        r.status,
        1,
        `eksik dosyada --check exit 1 olmalı (exit ${r.status}):\n${r.stderr || r.stdout}`,
      );
      const cikti = r.stderr + r.stdout;
      assert.ok(
        cikti.includes("es/index.html") || cikti.includes("index.html"),
        `hata çıktısı hangi dosya olduğunu yazmalı:\n${cikti}`,
      );
    } finally {
      writeFileSync(KURBAN, yedek);
      yedek = null;
    }
    assert.equal(checkKos().status, 0, "dosya geri alındıktan sonra --check tekrar geçmeli");
  });
});
