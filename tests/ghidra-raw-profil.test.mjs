// ghidra-raw-profil.test.mjs: ham-binary dil profilleri (saf veri; headless GEREKMEZ).
// Koş: node tests/ghidra-raw-profil.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RAW_DIL_PROFILLERI,
  rawDilProfili,
  rawGirisGecerliMi,
} from "../dist/rea-domains/ghidra/GhidraRawProfil.js";

describe("Ghidra raw dil profilleri (upstream 6.6.0 paritesi)", () => {
  it("m68k: 68000:BE:32:default (big-endian, 32-bit, çift hizalı giriş)", () => {
    assert.deepEqual(rawDilProfili("m68k"), {
      ad: "m68k",
      dil: "68000:BE:32:default",
      baytSirasi: "be",
      adresBitGenisligi: 32,
      girisHizasi: 2,
    });
  });

  it("tanınmayan aile uydurma profil üretmez", () => {
    assert.equal(rawDilProfili("riscv"), undefined);
    assert.equal(rawDilProfili(""), undefined);
  });

  it("m68k girişi çift hizalı olmalı (upstream: even-aligned)", () => {
    assert.equal(rawGirisGecerliMi("m68k", 0x1000), true);
    assert.equal(rawGirisGecerliMi("m68k", 0x1001), false);
  });

  it("tanınmayan ailede giriş kapısı kapalı", () => {
    assert.equal(rawGirisGecerliMi("riscv", 0x1000), false);
  });

  it("tablo yalnız upstream deltasını taşır (m68k)", () => {
    assert.deepEqual(RAW_DIL_PROFILLERI.map((p) => p.ad), ["m68k"]);
  });
});
