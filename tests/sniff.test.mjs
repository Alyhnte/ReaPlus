// sniff.test.mjs: sihirli bayt tanıma + dosya kapısı (tamamen offline).
// Koş: node tests/sniff.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sniffBytes, sniffFile } from "../dist/facade/sniff.js";

// Onaltılık imzadan bayt dizisi kurar.
const b = (hex) => Buffer.from(hex, "hex");

// 20 baytlık ELF başlığı kurar: e_machine (offset 18) + EI_CLASS/EI_DATA seçilebilir.
const elfBaslik = (makine, { sinif = 2, veri = 1 } = {}) => {
  const buf = Buffer.alloc(20);
  buf.set([0x7f, 0x45, 0x4c, 0x46, sinif, veri, 1], 0);
  buf.writeUInt16LE(2, 16); // e_type
  if (veri === 2) buf.writeUInt16BE(makine, 18); else buf.writeUInt16LE(makine, 18);
  return buf;
};

// PE başlığı kurar: MZ + e_lfanew (0x3C) + "PE\0\0" imzası + COFF machine (imza+4).
// eLfanew/imza bozularak kapı davranışı da denenebilir.
const peBaslik = (machine, { eLfanew = 0x80, imza = [0x50, 0x45, 0x00, 0x00] } = {}) => {
  const buf = Buffer.alloc(eLfanew + 6 + 8, 0);
  buf.set([0x4d, 0x5a], 0);
  buf.writeUInt32LE(eLfanew, 0x3c);
  buf.set(imza, eLfanew);
  buf.writeUInt16LE(machine, eLfanew + 4);
  return buf;
};

describe("sniffBytes", () => {
  // ELF sihri radare2 önerisiyle dönmeli.
  it("ELF imzasını tanır", () => {
    assert.deepEqual(sniffBytes(b("7f454c4602010100")), { tip: "elf", motor: "radare2" });
  });

  // ZIP/PK sihri APK sayılıp jadx'e yönlenmeli.
  it("APK/ZIP imzasını tanır", () => {
    assert.deepEqual(sniffBytes(b("504b030414000000")), { tip: "apk", motor: "jadx" });
  });

  // "dex\n" sihri jadx önerisiyle dönmeli.
  it("DEX imzasını tanır", () => {
    assert.deepEqual(sniffBytes(b("6465780a30333500")), { tip: "dex", motor: "jadx" });
  });

  // WASM sihri wasm motoruna yönlenmeli.
  it("WASM imzasını tanır", () => {
    assert.deepEqual(sniffBytes(b("0061736d01000000")), { tip: "wasm", motor: "wasm" });
  });

  // MZ başlığı PE sayılıp x64dbg önerilmeli.
  it("PE imzasını tanır", () => {
    assert.deepEqual(sniffBytes(b("4d5a900003000000")), { tip: "pe", motor: "x64dbg" });
  });

  // Üç Mach-O sihri de hopper önerisiyle dönmeli.
  it("Mach-O imzalarını tanır", () => {
    assert.deepEqual(sniffBytes(b("feedfacf00000000")), { tip: "macho", motor: "hopper" });
    assert.deepEqual(sniffBytes(b("cefaedfe00000000")), { tip: "macho", motor: "hopper" });
    assert.deepEqual(sniffBytes(b("cafebabe00000000")), { tip: "macho", motor: "hopper" });
  });

  // Rastgele bayt bilinmiyor + varsayılan motora düşmeli.
  it("bilinmeyeni varsayılan motorla döner", () => {
    assert.deepEqual(sniffBytes(b("deadbeef01020304")), { tip: "bilinmiyor", motor: "radare2" });
  });
});

// ELF e_machine kimliği: yalnız >=20 bayt + tanınan makinede dolar; aksi halde alan yok.
describe("sniffBytes: ELF e_machine (makine)", () => {
  it("64-bit LE ELF e_machine 62 -> x86-64", () => {
    assert.deepEqual(sniffBytes(elfBaslik(62)), { tip: "elf", motor: "radare2", makine: "x86-64" });
  });

  it("Hexagon (Qualcomm DSP) e_machine 164 -> hexagon", () => {
    assert.deepEqual(sniffBytes(elfBaslik(164)), { tip: "elf", motor: "radare2", makine: "hexagon" });
  });

  it("big-endian ELF (EI_DATA=2) e_machine 20 -> ppc", () => {
    assert.deepEqual(sniffBytes(elfBaslik(20, { veri: 2 })), { tip: "elf", motor: "radare2", makine: "ppc" });
  });

  it("32-bit ELF (EI_CLASS=1) e_machine 40 -> arm", () => {
    assert.deepEqual(sniffBytes(elfBaslik(40, { sinif: 1 })), { tip: "elf", motor: "radare2", makine: "arm" });
  });

  it("8 baytlık ELF önekinde makine alanı YOK (derin eşitlik aynen)", () => {
    assert.deepEqual(sniffBytes(b("7f454c4602010100")), { tip: "elf", motor: "radare2" });
  });

  it("tanınmayan e_machine (0xFFFF) makine alanı üretmez", () => {
    assert.deepEqual(sniffBytes(elfBaslik(0xffff)), { tip: "elf", motor: "radare2" });
  });

  it("e_machine 0 (EM_NONE) uydurma ad üretmez", () => {
    assert.deepEqual(sniffBytes(elfBaslik(0)), { tip: "elf", motor: "radare2" });
  });

  it("ELF dışı türlerde makine alanı hiç görünmez", () => {
    assert.deepEqual(sniffBytes(b("504b030414000000")), { tip: "apk", motor: "jadx" });
  });
});

// PE COFF machine kimliği: yalnız ARMNT/ARM64'ta dolar (upstream #3965 deltası);
// legacy ARM/Thumb/ARM64EC ve x86 ailelerinde alan hiç eklenmez.
describe("sniffBytes: PE COFF machine (makine)", () => {
  it("ARMNT machine 0x01c4 -> armnt", () => {
    assert.deepEqual(sniffBytes(peBaslik(0x01c4)), { tip: "pe", motor: "x64dbg", makine: "armnt" });
  });

  it("ARM64 machine 0xaa64 -> arm64", () => {
    assert.deepEqual(sniffBytes(peBaslik(0xaa64)), { tip: "pe", motor: "x64dbg", makine: "arm64" });
  });

  it("legacy ARM (0x01c0) makine alanı üretmez", () => {
    assert.deepEqual(sniffBytes(peBaslik(0x01c0)), { tip: "pe", motor: "x64dbg" });
  });

  it("Thumb (0x01c2) makine alanı üretmez", () => {
    assert.deepEqual(sniffBytes(peBaslik(0x01c2)), { tip: "pe", motor: "x64dbg" });
  });

  it("ARM64EC (0xa641) makine alanı üretmez", () => {
    assert.deepEqual(sniffBytes(peBaslik(0xa641)), { tip: "pe", motor: "x64dbg" });
  });

  it("x86-64 (0x8664) mevcut kayıt gibi kalır: makine alanı YOK", () => {
    assert.deepEqual(sniffBytes(peBaslik(0x8664)), { tip: "pe", motor: "x64dbg" });
  });

  it("bozuk PE imzasında makine alanı üretmez", () => {
    assert.deepEqual(sniffBytes(peBaslik(0x01c4, { imza: [0x50, 0x58, 0x00, 0x00] })), { tip: "pe", motor: "x64dbg" });
  });

  it("e_lfanew tampon dışındaysa makine alanı üretmez", () => {
    const disari = Buffer.alloc(0x40, 0);
    disari.set([0x4d, 0x5a], 0);
    disari.writeUInt32LE(0x1000, 0x3c); // tampon 64 bayt; imza erişilemez
    assert.deepEqual(sniffBytes(disari), { tip: "pe", motor: "x64dbg" });
    const cokKucuk = Buffer.alloc(0x40, 0);
    cokKucuk.set([0x4d, 0x5a], 0);
    cokKucuk.writeUInt32LE(0x10, 0x3c); // e < 0x40: DOS başlığı içine taşar
    assert.deepEqual(sniffBytes(cokKucuk), { tip: "pe", motor: "x64dbg" });
  });

  it("machine baytları tampon dışındaysa (kesik başlık) makine alanı üretmez", () => {
    const kesik = Buffer.alloc(0x80 + 5, 0);
    kesik.set([0x4d, 0x5a], 0);
    kesik.writeUInt32LE(0x80, 0x3c);
    kesik.set([0x50, 0x45, 0x00, 0x00], 0x80); // machine için yer yok
    assert.deepEqual(sniffBytes(kesik), { tip: "pe", motor: "x64dbg" });
  });

  it("8 baytlık MZ önekinde makine alanı YOK (derin eşitlik aynen)", () => {
    assert.deepEqual(sniffBytes(b("4d5a900003000000")), { tip: "pe", motor: "x64dbg" });
  });
});

describe("sniffFile", () => {
  // Olmayan dosya kapı kodu değil, bilinmiyor sonucudur.
  it("olmayan dosyada bilinmiyor döner", () => {
    assert.deepEqual(sniffFile("yok/boyle/bir/dosya.bin"), { tip: "bilinmiyor", motor: "radare2" });
  });

  // Gerçek dosyanın ilk baytlarından tür çıkarılmalı.
  it("gerçek dosyadan ilk baytları okur", () => {
    const dir = mkdtempSync(join(tmpdir(), "sniff-"));
    try {
      const yol = join(dir, "ornek.elf");
      writeFileSync(yol, b("7f454c4602010100"));
      assert.deepEqual(sniffFile(yol), { tip: "elf", motor: "radare2" });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // >=20 baytlık ELF dosyasında makine kimliği dosya yolundan da raporlanır.
  it("gerçek ELF dosyasından makineyi raporlar", () => {
    const dir = mkdtempSync(join(tmpdir(), "sniff-"));
    try {
      const yol = join(dir, "makine.elf");
      writeFileSync(yol, elfBaslik(62));
      assert.deepEqual(sniffFile(yol), { tip: "elf", motor: "radare2", makine: "x86-64" });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
