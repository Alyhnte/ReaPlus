// js-cross-bundle.test.mjs: iki bundle arası ilişki kurtarma (source-map kaynakları).
// Koş: npm run build sonrası `node --test tests/js-cross-bundle.test.mjs`.
// Kapsar: paylaşılan/yalnız-A/yalnız-B ayrımı, kaynak yolu normalizasyonu
// (ters bölü -> eğik çizgi, baştaki ./ kırpılır), deterministik alfabetik sıra,
// mapsiz çağrının bit-bit eski sözleşmesi, tek/bozuk map kapısı.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compare_source_to_bundle } from "../dist/rea-domains/javascript/JsAnalyzer.js";

// Küçük source-map üretir (sources dışı alanlar ilişki için anlamsız).
function map(sources) {
  return JSON.stringify({ version: 3, sources, mappings: "AAAA" });
}

describe("compare_source_to_bundle ilişkiler (source-map)", () => {
  // Aynı orijinal kaynak iki bundle'da -> paylaşılan; tek taraflı -> yalnızA/yalnızB.
  // A map'te ters bölü, B map'te "./" öneki normalizasyonla eşleşmeli.
  it("paylaşılan ve tek taraflı kaynakları normalizasyonla ayırır", () => {
    const a = "ortak();\nyalniz-a();\n";
    const b = "ortak();\nyalniz-b();\n";
    const r = compare_source_to_bundle(
      a,
      b,
      map(["src\\ortak.js", "src\\yalniz-a.js"]),
      map(["./src/ortak.js", "src/yalniz-b.js"]),
    );
    assert.equal(r.ok, true);
    assert.equal(r.tool, "rea_js_bundle_diff");
    // Satır farkı sözleşmesi korunur.
    assert.deepEqual(r.details.onlyA, 1);
    assert.deepEqual(r.details.onlyB, 1);
    assert.deepEqual(r.details.iliskiler, {
      paylasilanKaynaklar: ["src/ortak.js"],
      yalnizA: ["src/yalniz-a.js"],
      yalnizB: ["src/yalniz-b.js"],
    });
  });

  // Girdi sırası karışık + tekrar var: çıktı alfabetik ve tekilleşik olmalı.
  it("çıktı sırası deterministik (alfabetik, tekilleşik)", () => {
    const r = compare_source_to_bundle(
      "x\n",
      "y\n",
      map(["z.js", "a.js", "src\\m.js", "a.js"]),
      map(["./src/m.js", "b.js", "a.js"]),
    );
    assert.equal(r.ok, true);
    assert.deepEqual(r.details.iliskiler, {
      paylasilanKaynaklar: ["a.js", "src/m.js"],
      yalnizA: ["z.js"],
      yalnizB: ["b.js"],
    });
  });

  // Map yoksa eski çıktı aynen kalır: iliskiler alanı eklenmez.
  it("mapsiz çağrı eski sözleşmeyi korur", () => {
    const r = compare_source_to_bundle("a();\nb();\n", "a();\nc();\n");
    assert.equal(r.ok, true);
    assert.equal(r.summary, "onlyA=1 onlyB=1");
    assert.deepEqual(r.details, { onlyA: 1, onlyB: 1 });
    assert.equal(Object.hasOwn(r.details, "iliskiler"), false);
  });

  // Map'li çağrıda özet metni değişmez (yalnız details genişler).
  it("mapli çağrıda özet metni değişmez", () => {
    const r = compare_source_to_bundle("a();\n", "b();\n", map(["a.js"]), map(["b.js"]));
    assert.equal(r.ok, true);
    assert.equal(r.summary, "onlyA=1 onlyB=1");
  });

  // Tek map verilirse ilişki kurulamaz: sessizce yok saymak yanıltıcı olur.
  it("tek map kapıdan döner", () => {
    const r = compare_source_to_bundle("a();\n", "b();\n", map(["a.js"]));
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
  });

  // Bozuk map JSON'u parse edilemez: net gerekçe döner.
  it("bozuk map parse hatası verir", () => {
    const r = compare_source_to_bundle("a();\n", "b();\n", "bozuk-json", map(["b.js"]));
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    assert.ok(r.reason.includes("parse"), `gerekçe parse içermeli: ${r.reason}`);
  });
});
