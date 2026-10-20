// apktool-surum-gozlem.test.mjs: Apktool sürüm satırı GÖZLEM yüzeyi (node:test).
// Sürüm kanıt değil gözlemdir: ham satır saklanır, sayısal çekirdek yalnız
// desene uyuyorsa çıkarılır; bozuk/boş satırda alan ÜRETİLMEZ (uydurma yok).
// apktool kurulumu gerekmez: saf fonksiyon + fixture satırları (köprü testi
// kurulu değilse kapı dalını doğrular).
// Koş: npm run build sonrası `node --test tests/apktool-surum-gozlem.test.mjs`.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  apktoolSurumGozlem,
  rea_apktool_info,
  rea_apktool_caps,
} from "../dist/rea-domains/android/ApktoolBridge.js";
import { reaToolMetadata } from "../dist/server/toolMetadata.js";

// (a) Düz sürüm: ham satır aynen, sayısal çekirdek birebir.
test("gözlem: '2.9.3' düz satırda ham + sayısal çekirdek verir", () => {
  assert.deepEqual(apktoolSurumGozlem("2.9.3"), { ham: "2.9.3", sayisal: "2.9.3" });
});

// (b) Ön-sürüm: sayısal çekirdek ayrışır, ham satır bozulmaz.
test("gözlem: '2.10.0-rc1' ön-sürümünde sayısal çekirdek '2.10.0'", () => {
  assert.deepEqual(apktoolSurumGozlem("2.10.0-rc1"), { ham: "2.10.0-rc1", sayisal: "2.10.0" });
});

// (c) İki-parçalı sürüm de geçerlidir (desen dayatması yok).
test("gözlem: iki-parçalı '2.9' satırı da gözlemdir", () => {
  assert.deepEqual(apktoolSurumGozlem("2.9"), { ham: "2.9", sayisal: "2.9" });
});

// (d) Kırpma: CRLF/BOM/baş-son boşluk launcher çıktısından temizlenir.
test("gözlem: kırpma CRLF/BOM/boşluğu temizler", () => {
  assert.deepEqual(apktoolSurumGozlem("  2.12.0\r\n"), { ham: "2.12.0", sayisal: "2.12.0" });
  assert.deepEqual(apktoolSurumGozlem("\uFEFF2.12.0"), { ham: "2.12.0", sayisal: "2.12.0" });
});

// (e) Bozuk/ilgisiz çıktıda alan yok: sessizce undefined (uydurma yok).
test("gözlem: bozuk çıktıda undefined (uydurma yok)", () => {
  const bozuklar = [
    "",
    "   ",
    "apktool: command not found",
    "Usage: apktool [-v|--version]",
    "Press any key to continue . . .",
    "WARNING: apktool 2.9.3 bulunamadi",
    "2.9.3 (lisansli)",
    "2.9.3\n2.10.0",
    "surum=2.9.3",
  ];
  for (const satir of bozuklar) {
    assert.equal(apktoolSurumGozlem(satir), undefined, `beklenmeyen gözlem: ${JSON.stringify(satir)}`);
  }
  assert.equal(apktoolSurumGozlem(undefined), undefined);
  assert.equal(apktoolSurumGozlem(null), undefined);
});

// (f) Şekil sözleşmesi: yalnız ham+sayisal; kanıt/evidence statüsü ASLA yok.
test("gözlem şekli: yalnız ham+sayisal, kanıt statü alanı yok", () => {
  const g = apktoolSurumGozlem("2.9.3");
  assert.deepEqual(Object.keys(g).sort(), ["ham", "sayisal"]);
  for (const yasak of ["kanit", "evidence", "status", "durum"]) {
    assert.ok(!(yasak in g), `gözlemde ${yasak} alanı olmamalı`);
  }
});

// (g) outputSchema additive: surumGozlem opsiyonel alan olarak kabul edilir,
// alan yokken de eski başarı şekli geçerli kalır.
test("outputSchema: surumGozlem opsiyonel; eski şekil bozulmaz", () => {
  const infoMeta = reaToolMetadata("rea_apktool_info");
  assert.ok(infoMeta?.outputSchema, "rea_apktool_info outputSchema almali");
  const infoAlanlar = Object.keys(infoMeta.outputSchema.shape);
  assert.ok(infoAlanlar.includes("surumGozlem"), "info şemasında surumGozlem olmalı");
  const infoDolu = infoMeta.outputSchema.parse({
    ok: true, arac: "rea_apktool_info", surum: "2.12.0",
    surumGozlem: { ham: "2.12.0", sayisal: "2.12.0" },
  });
  assert.equal(infoDolu.surumGozlem.ham, "2.12.0");
  const infoEski = infoMeta.outputSchema.parse({ ok: true, arac: "rea_apktool_info", surum: "2.12.0" });
  assert.equal(infoEski.surumGozlem, undefined);

  const capsMeta = reaToolMetadata("rea_apktool_caps");
  assert.ok(capsMeta?.outputSchema, "rea_apktool_caps outputSchema almali");
  const capsAlanlar = Object.keys(capsMeta.outputSchema.shape);
  assert.ok(capsAlanlar.includes("surumGozlem"), "caps şemasında surumGozlem olmalı");
  const capsDolu = capsMeta.outputSchema.parse({
    ok: true, arac: "rea_apktool_caps", apktool: "2.12.0", aapt2: null, aapt2Tamam: false,
    surumGozlem: { ham: "2.12.0" },
  });
  assert.equal(capsDolu.surumGozlem.ham, "2.12.0");
  const capsEski = capsMeta.outputSchema.parse({
    ok: true, arac: "rea_apktool_caps", apktool: "2.12.0", aapt2: "x", aapt2Tamam: true,
  });
  assert.equal(capsEski.surumGozlem, undefined);
});

// (h) Köprü entegrasyonu: alan ancak saf fonksiyon derse üretilir; apktool
// kurulu değilse kapı sözleşmesi (capability_unsupported) hiç değişmez.
test("köprü: surumGozlem saf fonksiyonla birebir; kurulum yoksa kapı korunur", () => {
  const info = rea_apktool_info();
  if (!info.ok) {
    assert.equal(info.code, "capability_unsupported");
    assert.ok(!("surumGozlem" in info));
  } else {
    assert.deepEqual(info.surumGozlem ?? undefined, apktoolSurumGozlem(info.surum));
    assert.ok(!("kanit" in (info.surumGozlem ?? {})));
  }

  const caps = rea_apktool_caps();
  if (!caps.ok) {
    assert.equal(caps.code, "capability_unsupported");
    assert.ok(!("surumGozlem" in caps));
  } else {
    assert.deepEqual(caps.surumGozlem ?? undefined, apktoolSurumGozlem(caps.apktool));
  }
});
