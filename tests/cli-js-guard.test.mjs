// cli-js-guard.test.mjs: analyze-js dizin-vs-dosya kapısı (offline, yürütme yok).
// Koş: npm run build sonrası `node --test tests/cli-js-guard.test.mjs`.
// Kapsar: map yolu dizin, bundle yolu dizin (net Türkçe hata + exit != 0),
// --json kip eşleşmesi, mutlu yol (gerçek bundle + gerçek map) ve kayıp dosya kontrolü.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Kök dizini test dosyasının konumundan türet.
const kok = dirname(dirname(fileURLToPath(import.meta.url)));
// CLI girişi: derlenmiş index.js (tsc emit sonrası var olmalı).
const cli = join(kok, "dist", "cli", "index.js");

// Geçici fixture yolları: test başında doldurulur.
let DIR = "";
let BUNDLE = "";
let MAP = "";
let MAP_DIZIN = "";
let BUNDLE_DIZIN = "";
let YOK = "";

// CLI'yi çalıştır: stdout + stderr + exit kodu (taranan JS asla yürütülmez).
function kos(args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: DIR, encoding: "utf8" });
}

// Fixture'ları kur: gerçek küçük bundle, gerçek map, iki dizin (x.map, paket.js).
before(() => {
  DIR = mkdtempSync(join(tmpdir(), "cli-js-guard-"));
  BUNDLE = join(DIR, "bundle.js");
  MAP = join(DIR, "bundle.js.map");
  MAP_DIZIN = join(DIR, "x.map");
  BUNDLE_DIZIN = join(DIR, "paket.js");
  YOK = join(DIR, "yok.js");
  writeFileSync(BUNDLE, "const a = 1;\nconsole.log(a);\n", "utf8");
  writeFileSync(MAP, JSON.stringify({ version: 3, sources: ["a.js", "b.js"], mappings: "AAAA,BBBB" }), "utf8");
  mkdirSync(MAP_DIZIN);
  mkdirSync(BUNDLE_DIZIN);
});

// Geçici dizini temizle (en iyi efor, hata yutulur).
after(() => {
  try {
    rmSync(DIR, { recursive: true, force: true });
  } catch {
    /* temizlik en iyi efor */
  }
});

describe("analyze-js dosya/dizin kapısı", () => {
  // map yolu dizinse net hata + exit != 0 (genel okuma hatasına düşmemeli).
  it("map yolu dizin: dizin mesajı + exit != 0", () => {
    const r = kos(["analyze-js", BUNDLE, MAP_DIZIN]);
    assert.notEqual(r.status, 0, `exit 0 olmamalı: ${r.stdout}${r.stderr}`);
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    assert.ok(out.includes("dizin"), `dizin mesajı yok: ${out}`);
    assert.ok(out.includes(MAP_DIZIN), `yol mesajı yok: ${out}`);
  });
  // bundle yolu dizinse de aynı kapı çalışmalı.
  it("bundle yolu dizin: dizin mesajı + exit != 0", () => {
    const r = kos(["analyze-js", BUNDLE_DIZIN]);
    assert.notEqual(r.status, 0, `exit 0 olmamalı: ${r.stdout}${r.stderr}`);
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    assert.ok(out.includes("dizin"), `dizin mesajı yok: ${out}`);
    assert.ok(out.includes(BUNDLE_DIZIN), `yol mesajı yok: ${out}`);
  });
  // --json kipinde hata alanı aynı dizin mesajını taşımalı.
  it("json kip: ok:false + error dizin mesajı", () => {
    const r = kos(["analyze-js", BUNDLE, MAP_DIZIN, "--json"]);
    assert.notEqual(r.status, 0);
    const j = JSON.parse(r.stdout);
    assert.equal(j.ok, false);
    assert.ok(String(j.error).includes("dizin"), `json error dizin içermeli: ${j.error}`);
    assert.ok(String(j.error).includes(MAP_DIZIN), `json error yol içermeli: ${j.error}`);
  });
  // Mutlu yol: gerçek bundle + gerçek map hâlâ exit 0 + map özeti basar.
  it("mutlu yol: gerçek bundle + map exit 0", () => {
    const r = kos(["analyze-js", BUNDLE, MAP]);
    assert.equal(r.status, 0, `stdout: ${r.stdout} stderr: ${r.stderr}`);
    assert.ok(r.stdout.includes("özet:"), `özet satırı yok: ${r.stdout}`);
    assert.ok(r.stdout.includes("2 kaynak"), `map özeti yok: ${r.stdout}`);
  });
  // Kayıp dosya davranışı değişmemeli: genel okuma mesajı korunur.
  it("kayıp dosya: genel mesaj korunur, dizin mesajı sızmaz", () => {
    const r = kos(["analyze-js", YOK]);
    assert.notEqual(r.status, 0);
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    assert.ok(out.includes("dosya okunamadı"), `genel mesaj yok: ${out}`);
    assert.ok(!out.includes("dizin"), `dizin mesajı sızmamalı: ${out}`);
  });
});
