// elf-layout.test.mjs: elle kurulmuş ELF64 + gadget metni (kişisel ikili yok).
// Koş: npm run build sonrası `node --test tests/elf-layout.test.mjs`
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rea_pwn_elf_layout, rea_pwn_gadgets } from "../dist/rea-domains/wasm-evm/GoPwnBridge.js";

const PT_LOAD = 1;
const PT_DYNAMIC = 2;
const PT_GNU_STACK = 0x6474e551;
const PT_GNU_RELRO = 0x6474e552;
const PF_X = 1;
const PF_W = 2;
const PF_R = 4;
const DT_NULL = 0;
const DT_FLAGS = 30;
const DT_FLAGS_1 = 0x6ffffffb;
const DF_BIND_NOW = 8;
const DF_1_NOW = 1;

const dir = mkdtempSync(join(tmpdir(), "rea-elf-"));
after(() => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* yoksay */ } });

function ph64(type, flags, offset, filesz) {
  const b = Buffer.alloc(56);
  b.writeUInt32LE(type, 0);
  b.writeUInt32LE(flags, 4);
  b.writeBigUInt64LE(BigInt(offset), 8);
  b.writeBigUInt64LE(0n, 16);
  b.writeBigUInt64LE(0n, 24);
  b.writeBigUInt64LE(BigInt(filesz), 32);
  b.writeBigUInt64LE(BigInt(filesz), 40);
  b.writeBigUInt64LE(8n, 48);
  return b;
}

function dyn64(tag, val) {
  const b = Buffer.alloc(16);
  b.writeBigUInt64LE(BigInt(tag >>> 0), 0);
  b.writeBigUInt64LE(BigInt(val), 8);
  return b;
}

// phnum verilirse başlık sayısı phdrs.length'den sapar (absürt sayım deneyi).
function elf64({ type, machine = 62, phdrs, payload = Buffer.alloc(0), phnum, phentsize = 56 }) {
  const ph = Buffer.concat(phdrs);
  const buf = Buffer.concat([Buffer.alloc(64), ph, payload]);
  buf[0] = 0x7f; buf[1] = 0x45; buf[2] = 0x4c; buf[3] = 0x46;
  buf[4] = 2; buf[5] = 1; buf[6] = 1;
  buf.writeUInt16LE(type, 16);
  buf.writeUInt16LE(machine, 18);
  buf.writeUInt32LE(1, 20);
  buf.writeBigUInt64LE(64n, 32);
  buf.writeUInt16LE(64, 52);
  buf.writeUInt16LE(phentsize, 54);
  buf.writeUInt16LE(phnum ?? phdrs.length, 56);
  return buf;
}

function yaz(ad, buf) {
  const yol = join(dir, ad);
  writeFileSync(yol, buf);
  return yol;
}

function dynFull() {
  return Buffer.concat([
    dyn64(DT_FLAGS, DF_BIND_NOW),
    dyn64(DT_FLAGS_1, DF_1_NOW),
    dyn64(DT_NULL, 0),
  ]);
}

describe("rea_pwn_elf_layout", () => {
  it("ET_DYN + NX stack + RELRO/BIND_NOW gerçek alanları döner", () => {
    const payload = dynFull();
    const dynOff = 64 + 56 * 4;
    const buf = elf64({
      type: 3,
      phdrs: [
        ph64(PT_LOAD, PF_R | PF_X, 0, 64),
        ph64(PT_GNU_STACK, PF_R | PF_W, 0, 0),
        ph64(PT_GNU_RELRO, PF_R, 0, 0),
        ph64(PT_DYNAMIC, PF_R | PF_W, dynOff, payload.length),
      ],
      payload,
    });
    const r = rea_pwn_elf_layout(yaz("dyn-full.elf", buf));
    assert.equal(r.ok, true);
    assert.equal(r.tool, "rea_pwn_elf_layout");
    assert.equal(r.details.class, 64);
    assert.equal(r.details.endian, "little");
    assert.equal(r.details.e_type, "ET_DYN");
    assert.equal(r.details.e_machine, 62);
    assert.equal(r.details.machine, "x86-64");
    assert.equal(r.details.pie, true);
    assert.equal(r.details.nx, true);
    assert.equal(r.details.relro, "full");
    assert.equal(r.details.loads, 1);
  });

  it("ET_EXEC + yürütülebilir GNU_STACK + RELRO yok", () => {
    const buf = elf64({
      type: 2,
      phdrs: [
        ph64(PT_LOAD, PF_R | PF_X, 0, 64),
        ph64(PT_LOAD, PF_R | PF_W, 0, 0),
        ph64(PT_GNU_STACK, PF_R | PF_W | PF_X, 0, 0),
      ],
    });
    const r = rea_pwn_elf_layout(yaz("exec-nxoff.elf", buf));
    assert.equal(r.ok, true);
    assert.equal(r.details.e_type, "ET_EXEC");
    assert.equal(r.details.pie, false);
    assert.equal(r.details.nx, false);
    assert.equal(r.details.relro, "none");
    assert.equal(r.details.loads, 2);
  });

  it("kesik başlık capability_unsupported", () => {
    const r = rea_pwn_elf_layout(yaz("trunc.elf", Buffer.from([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 0])));
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    assert.match(r.reason, /truncat/i);
  });

  it("ELF olmayan dosya capability_unsupported", () => {
    const r = rea_pwn_elf_layout(yaz("nope.bin", Buffer.from("not-elf")));
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    assert.match(r.reason, /ELF/);
  });

  it("absürt program header sayısı capability_unsupported", () => {
    const buf = elf64({ type: 2, phdrs: [ph64(PT_LOAD, PF_R, 0, 0)], phnum: 0xffff });
    const r = rea_pwn_elf_layout(yaz("absurd.elf", buf));
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    assert.match(r.reason, /program header/i);
  });

  it("GNU_STACK yoksa nx null, GNU_RELRO yoksa relro none", () => {
    const buf = elf64({ type: 3, phdrs: [ph64(PT_LOAD, PF_R | PF_X, 0, 64)] });
    const r = rea_pwn_elf_layout(yaz("nostack.elf", buf));
    assert.equal(r.ok, true);
    assert.equal(r.details.nx, null);
    assert.equal(r.details.relro, "none");
    assert.equal(r.details.pie, true);
  });

  it("GNU_RELRO var, BIND_NOW yok: partial", () => {
    const payload = dyn64(DT_NULL, 0);
    const dynOff = 64 + 56 * 3;
    const buf = elf64({
      type: 3,
      phdrs: [
        ph64(PT_LOAD, PF_R, 0, 64),
        ph64(PT_GNU_RELRO, PF_R, 0, 0),
        ph64(PT_DYNAMIC, PF_R | PF_W, dynOff, payload.length),
      ],
      payload,
    });
    const r = rea_pwn_elf_layout(yaz("partial.elf", buf));
    assert.equal(r.ok, true);
    assert.equal(r.details.relro, "partial");
  });

  it("DYNAMIC okunamazsa relro unknown, tam sanılmaz", () => {
    const buf = elf64({
      type: 3,
      phdrs: [
        ph64(PT_LOAD, PF_R, 0, 64),
        ph64(PT_GNU_RELRO, PF_R, 0, 0),
        ph64(PT_DYNAMIC, PF_R | PF_W, 99999, 32),
      ],
    });
    const r = rea_pwn_elf_layout(yaz("dyn-bad.elf", buf));
    assert.equal(r.ok, true);
    assert.equal(r.details.relro, "unknown");
  });

  it("tanınmayan e_machine adı eklemez, e_type unknown kalır", () => {
    const buf = elf64({ type: 0, machine: 0x999, phdrs: [ph64(PT_LOAD, PF_R, 0, 0)] });
    const r = rea_pwn_elf_layout(yaz("unk.elf", buf));
    assert.equal(r.ok, true);
    assert.equal(r.details.e_type, "unknown");
    assert.equal(r.details.e_machine, 0x999);
    assert.equal(r.details.machine, undefined);
    assert.equal(r.details.pie, false);
  });

  it("big-endian ELF64 ppc raporlanır", () => {
    const ph = Buffer.alloc(56);
    ph.writeUInt32BE(PT_LOAD, 0);
    ph.writeUInt32BE(PF_R, 4);
    ph.writeBigUInt64BE(0n, 8);
    ph.writeBigUInt64BE(0n, 32);
    ph.writeBigUInt64BE(0n, 40);
    const stack = Buffer.alloc(56);
    stack.writeUInt32BE(PT_GNU_STACK, 0);
    stack.writeUInt32BE(PF_R | PF_W | PF_X, 4);
    const buf = Buffer.concat([Buffer.alloc(64), ph, stack]);
    buf[0] = 0x7f; buf[1] = 0x45; buf[2] = 0x4c; buf[3] = 0x46;
    buf[4] = 2; buf[5] = 2; buf[6] = 1;
    buf.writeUInt16BE(2, 16);
    buf.writeUInt16BE(20, 18);
    buf.writeUInt32BE(1, 20);
    buf.writeBigUInt64BE(64n, 32);
    buf.writeUInt16BE(64, 52);
    buf.writeUInt16BE(56, 54);
    buf.writeUInt16BE(2, 56);
    const r = rea_pwn_elf_layout(yaz("be-ppc.elf", buf));
    assert.equal(r.ok, true);
    assert.equal(r.details.endian, "big");
    assert.equal(r.details.e_type, "ET_EXEC");
    assert.equal(r.details.e_machine, 20);
    assert.equal(r.details.machine, "ppc");
    assert.equal(r.details.pie, false);
    assert.equal(r.details.nx, false);
    assert.equal(r.details.loads, 1);
  });

  it("dosya yok ve program başlığı sığmıyorsa capability_unsupported", () => {
    const missing = rea_pwn_elf_layout(join(dir, "yok.elf"));
    assert.equal(missing.ok, false);
    assert.equal(missing.code, "capability_unsupported");
    const short = elf64({ type: 2, phdrs: [ph64(PT_LOAD, PF_R, 0, 0), ph64(PT_LOAD, PF_R, 0, 0)] });
    const r = rea_pwn_elf_layout(yaz("phdr-trunc.elf", short.subarray(0, 64 + 20)));
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    assert.match(r.reason, /truncat/i);
  });
});

describe("rea_pwn_gadgets", () => {
  it("gadget: satırlarından yalnız ret ile biten dizi bir gadgettir", () => {
    const r = rea_pwn_gadgets("gadget: pop rdi\ngadget: ret\n");
    assert.equal(r.ok, true);
    assert.equal(r.tool, "rea_pwn_gadgets");
    assert.equal(r.details.n, 1);
    assert.deepEqual(r.details.gadgets, [{ text: "gadget: pop rdi; gadget: ret" }]);
  });

  it("noktalı virgül bir gadgettir, ret'siz mov desteklenmez", () => {
    const bir = rea_pwn_gadgets("pop rdi; ret");
    assert.equal(bir.ok, true);
    assert.equal(bir.details.n, 1);
    assert.deepEqual(bir.details.gadgets, [{ text: "pop rdi; ret" }]);
    const yok = rea_pwn_gadgets("mov eax, ebx");
    assert.equal(yok.ok, false);
    assert.equal(yok.code, "capability_unsupported");
    assert.match(yok.reason, /no ret-terminated gadget/);
  });

  it("yalnız gadget: satırı ve return kelimesi gadget değildir", () => {
    for (const text of ["gadget:", "return", "gadget:\nmov eax, ebx"]) {
      const r = rea_pwn_gadgets(text);
      assert.equal(r.ok, false, text);
      assert.equal(r.code, "capability_unsupported");
    }
  });

  it("adres soyulur, retn/retf sayılır, pencere 5, 32'de kesilir", () => {
    const adres = rea_pwn_gadgets("0x401000: pop rdi\n401001: ret");
    assert.deepEqual(adres.details.gadgets, [{ text: "pop rdi; ret" }]);
    const retn = rea_pwn_gadgets("RETN 8");
    assert.equal(retn.details.n, 1);
    assert.deepEqual(retn.details.gadgets, [{ text: "RETN 8" }]);
    const retf = rea_pwn_gadgets("pop ax; retf");
    assert.deepEqual(retf.details.gadgets, [{ text: "pop ax; retf" }]);
    const uzun = rea_pwn_gadgets("a\nb\nc\nd\ne\nf\nret");
    assert.deepEqual(uzun.details.gadgets, [{ text: "c; d; e; f; ret" }]);
    const cok = Array.from({ length: 40 }, (_, i) => `pop r${i}\nret`).join("\n");
    const kes = rea_pwn_gadgets(cok);
    assert.equal(kes.ok, true);
    assert.equal(kes.details.n, 40);
    assert.equal(kes.details.gadgets.length, 32);
    assert.equal(kes.details.gadgets[0].text, "pop r0; ret");
    assert.equal(kes.details.gadgets[31].text, "pop r31; ret");
  });
});
