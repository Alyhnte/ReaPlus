// apk-splits.test.mjs: split APK dizini, zip merkezi dizin + manifest.
// apktool calismaz. Kos: npm run build sonrasi node --test tests/apk-splits.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { crc32, deflateRawSync } from "node:zlib";
import { rea_apk_splits } from "../dist/rea-domains/android/ApkSplits.js";

function dizin() {
  return mkdtempSync(join(tmpdir(), "rea-apk-"));
}

function u16(b, o, v) { b.writeUInt16LE(v, o); }
function u32(b, o, v) { b.writeUInt32LE(v, o); }

function utf16Parca(s) {
  const govde = Buffer.from(s, "utf16le");
  const out = Buffer.alloc(2 + govde.length + 2);
  out.writeUInt16LE(s.length, 0);
  govde.copy(out, 2);
  out.writeUInt16LE(0, 2 + govde.length);
  return out;
}

function stringHavuzu(dizgeler) {
  const govdeler = dizgeler.map(utf16Parca);
  const header = 28;
  const ofsetler = [];
  let rel = 0;
  for (const g of govdeler) { ofsetler.push(rel); rel += g.length; }
  const stringsStart = header + dizgeler.length * 4;
  const buf = Buffer.alloc(stringsStart + rel);
  u16(buf, 0, 0x0001);
  u16(buf, 2, header);
  u32(buf, 4, buf.length);
  u32(buf, 8, dizgeler.length);
  u32(buf, 20, stringsStart);
  ofsetler.forEach((of, i) => u32(buf, header + i * 4, of));
  let p = stringsStart;
  for (const g of govdeler) { g.copy(buf, p); p += g.length; }
  return buf;
}

function axmlSplit(splitAdi) {
  const havuz = stringHavuzu(["manifest", "split", splitAdi]);
  const dugum = Buffer.alloc(16 + 20 + 20);
  u16(dugum, 0, 0x0102);
  u16(dugum, 2, 0x10);
  u32(dugum, 4, dugum.length);
  u32(dugum, 8, 1);
  u32(dugum, 12, 0xffffffff);
  u32(dugum, 16, 0xffffffff);
  u32(dugum, 20, 0);
  u16(dugum, 24, 20);
  u16(dugum, 26, 20);
  u16(dugum, 28, 1);
  const a = 36;
  u32(dugum, a, 0xffffffff);
  u32(dugum, a + 4, 1);
  u32(dugum, a + 8, 2);
  u16(dugum, a + 12, 8);
  dugum[a + 15] = 0x03;
  u32(dugum, a + 16, 2);
  const bas = Buffer.alloc(8);
  u16(bas, 0, 0x0003);
  u16(bas, 2, 8);
  u32(bas, 4, 8 + havuz.length + dugum.length);
  return Buffer.concat([bas, havuz, dugum]);
}

function zipYaz(girdiler) {
  const yereller = [];
  const merkezler = [];
  let ofset = 0;
  for (const g of girdiler) {
    const ad = Buffer.from(g.ad);
    const ham = g.data;
    const sik = g.yontem === 8 ? deflateRawSync(ham) : ham;
    const yer = Buffer.alloc(30 + ad.length + sik.length);
    u32(yer, 0, 0x04034b50);
    u16(yer, 4, 20);
    u16(yer, 8, g.yontem);
    u32(yer, 14, crc32(ham) >>> 0);
    u32(yer, 18, sik.length);
    u32(yer, 22, ham.length);
    u16(yer, 26, ad.length);
    ad.copy(yer, 30);
    sik.copy(yer, 30 + ad.length);
    const mer = Buffer.alloc(46 + ad.length);
    u32(mer, 0, 0x02014b50);
    u16(mer, 4, 20);
    u16(mer, 6, 20);
    u16(mer, 10, g.yontem);
    u32(mer, 16, crc32(ham) >>> 0);
    u32(mer, 20, sik.length);
    u32(mer, 24, ham.length);
    u16(mer, 28, ad.length);
    u32(mer, 42, ofset);
    ad.copy(mer, 46);
    yereller.push(yer);
    merkezler.push(mer);
    ofset += yer.length;
  }
  const cd = Buffer.concat(merkezler);
  const eocd = Buffer.alloc(22);
  u32(eocd, 0, 0x06054b50);
  u16(eocd, 8, girdiler.length);
  u16(eocd, 10, girdiler.length);
  u32(eocd, 12, cd.length);
  u32(eocd, 16, ofset);
  return Buffer.concat([...yereller, cd, eocd]);
}

describe("rea_apk_splits", () => {
  it("base ve split_ dosyalarinin rolunu, giris sayisini ve manifest split adini okur", () => {
    const kok = dizin();
    const manifest = axmlSplit("config.xxhdpi");
    writeFileSync(join(kok, "base.apk"), zipYaz([
      { ad: "AndroidManifest.xml", data: Buffer.from("<?xml version=\"1.0\"?><manifest package=\"com.ornek\"/>"), yontem: 0 },
      { ad: "classes.dex", data: Buffer.from("dex"), yontem: 0 },
    ]));
    writeFileSync(join(kok, "split_config.xxhdpi.apk"), zipYaz([
      { ad: "AndroidManifest.xml", data: manifest, yontem: 8 },
      { ad: "resources.arsc", data: Buffer.from("arsc"), yontem: 0 },
    ]));
    writeFileSync(join(kok, "not-an.apk.txt"), Buffer.from("yok say"));
    const r = rea_apk_splits(kok);
    assert.equal(r.ok, true);
    assert.equal(r.apkler.length, 2);
    const base = r.apkler.find((a) => a.dosya === "base.apk");
    const split = r.apkler.find((a) => a.dosya === "split_config.xxhdpi.apk");
    assert.equal(base.rol, "base");
    assert.equal(base.girisSayisi, 2);
    assert.equal(base.manifestSplit, null);
    assert.equal(split.rol, "split");
    assert.equal(split.ad, "config.xxhdpi");
    assert.equal(split.girisSayisi, 2);
    assert.equal(split.manifestSplit, "config.xxhdpi");
  });

  it("apk yoksa, dizin yoksa veya zip degilse capability_unsupported", () => {
    const bos = dizin();
    writeFileSync(join(bos, "readme.txt"), "apk yok");
    assert.equal(rea_apk_splits(bos).code, "capability_unsupported");
    assert.equal(rea_apk_splits(join(bos, "yok-dizin")).code, "capability_unsupported");
    const kotu = dizin();
    writeFileSync(join(kotu, "base.apk"), Buffer.from("bu zip degil"));
    assert.equal(rea_apk_splits(kotu).code, "capability_unsupported");
  });
});
