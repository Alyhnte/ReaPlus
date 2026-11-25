// wave25-headers.test.mjs: CLR ve ELF32 MIPS basliklari dosyadan okunur.
// Cagiran: node --test. API: rea_aot_profile details.clr, rea_mips_psp_profile details.elf.
// Sema: clr ve elf opsiyonel; iskelet literal true kalir.
// Istek: "herşey gerektiği gibi çalışmalı göstermelik çalışıyormuş gibi yapmamalı"
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rea_aot_profile } from "../dist/rea-domains/wasm-evm/NativeAotBridge.js";
import { rea_mips_psp_profile } from "../dist/rea-domains/wasm-evm/DosMipsBridge.js";

function peClr(major, minor, flags, entry) {
  const buf = Buffer.alloc(0x300, 0);
  buf[0] = 0x4d;
  buf[1] = 0x5a;
  buf.writeUInt32LE(0x80, 0x3c);
  buf.writeUInt32LE(0x4550, 0x80);
  buf.writeUInt16LE(1, 0x86);
  buf.writeUInt16LE(224, 0x94);
  const opt = 0x98;
  buf.writeUInt16LE(0x10b, opt);
  buf.writeUInt32LE(16, opt + 92);
  const com = opt + 96 + 14 * 8;
  buf.writeUInt32LE(0x200, com);
  buf.writeUInt32LE(72, com + 4);
  const sec = opt + 224;
  buf.writeUInt32LE(0x100, sec + 8);
  buf.writeUInt32LE(0x200, sec + 12);
  buf.writeUInt32LE(0x100, sec + 16);
  buf.writeUInt32LE(0x200, sec + 20);
  buf.writeUInt32LE(72, 0x200);
  buf.writeUInt16LE(major, 0x204);
  buf.writeUInt16LE(minor, 0x206);
  buf.writeUInt32LE(flags, 0x210);
  buf.writeUInt32LE(entry, 0x214);
  return buf;
}

function elfMips(flags, endian) {
  const buf = Buffer.alloc(64, 0);
  buf[0] = 0x7f;
  buf[1] = 0x45;
  buf[2] = 0x4c;
  buf[3] = 0x46;
  buf[4] = 1;
  buf[5] = endian === "be" ? 2 : 1;
  const yaz16 = endian === "be" ? buf.writeUInt16BE.bind(buf) : buf.writeUInt16LE.bind(buf);
  const yaz32 = endian === "be" ? buf.writeUInt32BE.bind(buf) : buf.writeUInt32LE.bind(buf);
  yaz16(8, 18);
  yaz32(0x1000, 24);
  yaz32(flags, 36);
  return buf;
}

describe("rea_aot_profile CLR basligi", () => {
  it("major, minor, flags ve entry dosyadaki COR20 alanlaridir", () => {
    for (const ornek of [
      { major: 2, minor: 5, flags: 1, entry: 0x06000001 },
      { major: 4, minor: 0, flags: 8, entry: 0x0600002a },
    ]) {
      const r = rea_aot_profile(peClr(ornek.major, ornek.minor, ornek.flags, ornek.entry), "");
      assert.equal(r.ok, true);
      assert.equal(r.details.clr.major, ornek.major);
      assert.equal(r.details.clr.minor, ornek.minor);
      assert.equal(r.details.clr.flags, ornek.flags);
      assert.equal(r.details.clr.entryPoint, ornek.entry);
      assert.equal(r.details.iskelet, true);
      assert.equal(r.details.aot.ok, false);
    }
  });

  it("CLR dizini yoksa clr alani yoktur ve sayi uydurulmaz", () => {
    const mz = Buffer.alloc(128, 0);
    mz[0] = 0x4d;
    mz[1] = 0x5a;
    const r = rea_aot_profile(mz, "NativeAOT");
    assert.equal(r.ok, true);
    assert.equal(r.details.clr, undefined);
    assert.equal(r.details.iskelet, true);
  });
});

describe("rea_mips_psp_profile ELF basligi", () => {
  it("e_flags ve e_entry dosyanin endian degerinden okunur", () => {
    const le = rea_mips_psp_profile(elfMips(0x20, "le"));
    assert.equal(le.ok, true);
    assert.equal(le.details.elf.machine, 8);
    assert.equal(le.details.elf.entry, 0x1000);
    assert.equal(le.details.elf.flags, 0x20);
    assert.equal(le.details.elf.endian, "le");
    assert.equal(le.details.iskelet, true);
    assert.equal(le.details.mips.ok, false);

    const be = rea_mips_psp_profile(elfMips(0x11, "be"));
    assert.equal(be.details.elf.flags, 0x11);
    assert.equal(be.details.elf.endian, "be");
    assert.equal(be.details.elf.entry, 0x1000);
  });

  it("ELF olmayan DOS baytinda elf alani yoktur", () => {
    const dos = Buffer.alloc(64, 0);
    dos[0] = 0xcd;
    dos[1] = 0x21;
    dos[4] = 0x0c;
    const r = rea_mips_psp_profile(dos);
    assert.equal(r.ok, true);
    assert.equal(r.details.elf, undefined);
    assert.equal(r.details.iskelet, true);
  });
});
