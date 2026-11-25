// wave19-research.test.mjs: dort arac kendi dosya formatini yurutur.
// Beklenen sayi testin yazdigi baytlardan hesaplanir. Dis ikili yok.
// Kos: npm run build sonrasi node --test tests/wave19-research.test.mjs
import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rea_angr_explore, rea_afl_fuzz, rea_lldb_script, rea_ttd_info } from "../dist/rea-domains/research/ResearchProbes.js";
import { reaToolMetadata } from "../dist/server/toolMetadata.js";
import { TOOLSETS } from "../dist/server/toolsets.js";
import { applyWorkspaceRoot } from "../dist/server/workspaceRoot.js";

const ENV = ["REA_WORKSPACE_ROOT"];
const onceki = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));

function dizin() {
  return mkdtempSync(join(tmpdir(), "rea-w19-"));
}

function yaz(kok, ad, buf) {
  const yol = join(kok, ad);
  writeFileSync(yol, buf);
  return yol;
}

afterEach(() => {
  for (const k of ENV) {
    if (onceki[k] === undefined) delete process.env[k];
    else process.env[k] = onceki[k];
  }
});

function reavm(kod) {
  return Buffer.concat([Buffer.from("REAVM\0"), Buffer.from(kod)]);
}

function reafz(indeks, deger, mod, tohum) {
  return Buffer.concat([
    Buffer.from("REAFZ\0"),
    Buffer.from([indeks, deger, mod, tohum.length]),
    Buffer.from(tohum),
  ]);
}

function realdb(uzun) {
  const bas = Buffer.alloc(9);
  Buffer.from("REALDB\0").copy(bas, 0);
  bas.writeUInt16LE(uzun, 7);
  return Buffer.concat([bas, Buffer.alloc(uzun)]);
}

function reatd(adlar) {
  const parcalar = [Buffer.from("REATD\0"), Buffer.alloc(2)];
  parcalar[1].writeUInt16LE(adlar.length, 0);
  for (const ad of adlar) {
    const bayt = Buffer.from(ad, "utf8");
    parcalar.push(Buffer.from([bayt.length]), bayt);
  }
  return Buffer.concat(parcalar);
}

describe("dalga 19 yuzey", () => {
  it("dort arac outputSchema ve readOnlyHint tasir; ozel profillerde yoktur", () => {
    for (const ad of ["rea_angr_explore", "rea_afl_fuzz", "rea_lldb_script", "rea_ttd_info"]) {
      const meta = reaToolMetadata(ad);
      assert.ok(meta?.outputSchema, `${ad} outputSchema yok`);
      assert.equal(meta.annotations?.readOnlyHint, true, `${ad} readOnlyHint true olmali`);
      assert.equal(meta.annotations?.destructiveHint, false);
      for (const liste of Object.values(TOOLSETS)) {
        assert.equal(liste.includes(ad), false, `${ad} ozel profilde`);
      }
    }
  });
});

describe("rea_angr_explore", () => {
  it("sembolik JZ iki yolu da sayar; somut esitlik tek yol birakir", () => {
    const kok = dizin();
    const dallanan = yaz(kok, "dal.reavm", reavm([0x10, 0x01, 0x41, 0x03, 0x04, 0x07, 0x05, 0x05]));
    const once = readFileSync(dallanan);
    const dal = rea_angr_explore(dallanan);
    assert.equal(dal.ok, true);
    assert.equal(dal.paths, 2);
    assert.equal(dal.constraints, 2);
    assert.deepEqual(readFileSync(dallanan), once);

    const esit = yaz(kok, "esit.reavm", reavm([0x01, 0x01, 0x01, 0x01, 0x03, 0x04, 0x08, 0x05, 0x05]));
    const tek = rea_angr_explore(esit);
    assert.equal(tek.paths, 1);
    assert.equal(tek.constraints, 0);

    const farkli = yaz(kok, "fark.reavm", reavm([0x01, 0x01, 0x01, 0x02, 0x03, 0x04, 0x08, 0x05, 0x05]));
    const atlanan = rea_angr_explore(farkli);
    assert.equal(atlanan.paths, 1);
    assert.equal(atlanan.constraints, 0);
  });

  it("iki sembolik karsilastirma uc biten yol uretir", () => {
    const kod = [
      0x10, 0x01, 0x00, 0x03, 0x04, 0x07,
      0x05,
      0x10, 0x01, 0x00, 0x03, 0x04, 0x0e,
      0x05, 0x05,
    ];
    const r = rea_angr_explore(yaz(dizin(), "iki.reavm", reavm(kod)));
    assert.equal(r.paths, 3);
    assert.equal(r.constraints, 5);
  });

  it("REAVM olmayan dosya ve eksik yol capability_unsupported; yol sayisi yoktur", () => {
    const kok = dizin();
    const degil = rea_angr_explore(yaz(kok, "not.bin", Buffer.from("not-a-vm")));
    assert.equal(degil.ok, false);
    assert.equal(degil.code, "capability_unsupported");
    assert.equal(degil.paths, undefined);
    const yok = rea_angr_explore(join(kok, "yok.reavm"));
    assert.equal(yok.code, "capability_unsupported");
    assert.equal(yok.paths, undefined);
  });

  it("yol calisma kokune uyar", () => {
    const kok = dizin();
    const dis = dizin();
    process.env.REA_WORKSPACE_ROOT = kok;
    const ic = applyWorkspaceRoot("rea_angr_explore", { path: join(kok, "ic.reavm") }, process.env, kok);
    assert.equal(ic.path, join(kok, "ic.reavm"));
    assert.throws(() => applyWorkspaceRoot("rea_angr_explore", { path: join(dis, "dis.reavm") }, process.env, kok));
  });
});

describe("rea_afl_fuzz", () => {
  it("cokme bayti dosyadan okunur; calistirma sayisi o bayta kadardir", () => {
    const kok = dizin();
    for (const deger of [0x41, 0x02]) {
      const yol = yaz(kok, `t-${deger}.reafz`, reafz(0, deger, 0, [0x00]));
      const r = rea_afl_fuzz(yol);
      assert.equal(r.ok, true);
      assert.equal(r.crashes, 1);
      assert.equal(r.execs_done, deger + 1);
    }
  });

  it("iki bayt birden tutmasi gereken hedef, sifir tohumda cokmez", () => {
    const kok = dizin();
    const yok = rea_afl_fuzz(yaz(kok, "yok.reafz", reafz(0, 0x41, 1, [0x00, 0x00])));
    assert.equal(yok.ok, true);
    assert.equal(yok.crashes, 0);
    assert.equal(yok.execs_done, 512);

    const var_ = rea_afl_fuzz(yaz(kok, "var.reafz", reafz(0, 0x41, 1, [0x00, 0x42])));
    assert.equal(var_.crashes, 1);
    assert.equal(var_.execs_done, 0x41 + 1);
  });

  it("REAFZ olmayan veya kesik tohum capability_unsupported; sayi uydurulmaz", () => {
    const kok = dizin();
    const degil = rea_afl_fuzz(yaz(kok, "x.bin", Buffer.from("nope")));
    assert.equal(degil.ok, false);
    assert.equal(degil.code, "capability_unsupported");
    assert.equal(degil.execs_done, undefined);
    const kesik = rea_afl_fuzz(yaz(kok, "k.reafz", Buffer.concat([Buffer.from("REAFZ\0"), Buffer.from([0, 1, 0, 4, 0])])));
    assert.equal(kesik.code, "capability_unsupported");
    assert.equal(kesik.crashes, undefined);
  });
});

describe("rea_lldb_script", () => {
  it("kesme noktasi imajdaki adreste durur; disaridaki adres imaj sonuna kadar gider", () => {
    const kok = dizin();
    const imaj = yaz(kok, "m.realdb", realdb(4));
    const betik = yaz(kok, "dur.lldb", "breakpoint set --address 0x2\nrun\n");
    const dur = rea_lldb_script(imaj, betik);
    assert.equal(dur.ok, true);
    assert.equal(dur.stop_reason, "breakpoint 1.1");
    assert.equal(dur.pc, 2);

    const kisa = yaz(kok, "kisa.realdb", realdb(1));
    const dis = rea_lldb_script(kisa, yaz(kok, "dis.lldb", "breakpoint set --address 0x8\nrun\n"));
    assert.equal(dis.stop_reason, "exited");
    assert.equal(dis.pc, 1);
  });

  it("betik veya imaj eksikse capability_unsupported; durma nedeni yoktur", () => {
    const kok = dizin();
    const imaj = yaz(kok, "m.realdb", realdb(4));
    const bos = rea_lldb_script(imaj, yaz(kok, "bos.lldb", "run\n"));
    assert.equal(bos.ok, false);
    assert.equal(bos.code, "capability_unsupported");
    assert.equal(bos.stop_reason, undefined);
    const yok = rea_lldb_script(yaz(kok, "degil.bin", Buffer.from("xx")), yaz(kok, "ok.lldb", "breakpoint set --address 0x0\nrun\n"));
    assert.equal(yok.code, "capability_unsupported");
    assert.equal(yok.pc, undefined);
  });

  it("imaj ve betik calisma kokune uyar", () => {
    const kok = dizin();
    const dis = dizin();
    process.env.REA_WORKSPACE_ROOT = kok;
    const ic = applyWorkspaceRoot(
      "rea_lldb_script",
      { path: join(kok, "m.realdb"), script: join(kok, "b.lldb") },
      process.env,
      kok,
    );
    assert.equal(ic.script, join(kok, "b.lldb"));
    assert.throws(() => applyWorkspaceRoot("rea_lldb_script", { path: join(kok, "m.realdb"), script: join(dis, "b.lldb") }, process.env, kok));
  });
});

describe("rea_ttd_info", () => {
  it("modul adlarini dosyadan okur; sayi ad listesinin uzunlugudur", () => {
    const kok = dizin();
    const adlar = ["ntdll.dll", "kernel32.dll"];
    const yol = yaz(kok, "t.reatd", reatd(adlar));
    const r = rea_ttd_info(yol);
    assert.equal(r.ok, true);
    assert.equal(r.module_count, adlar.length);
    assert.deepEqual(r.modules, adlar);

    const bos = rea_ttd_info(yaz(kok, "bos.reatd", reatd([])));
    assert.equal(bos.module_count, 0);
    assert.deepEqual(bos.modules, []);
  });

  it("kesik iz capability_unsupported; modul sayisi uydurulmaz", () => {
    const kok = dizin();
    const kesik = Buffer.concat([Buffer.from("REATD\0"), Buffer.from([0x01, 0x00])]);
    const r = rea_ttd_info(yaz(kok, "k.reatd", kesik));
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    assert.equal(r.module_count, undefined);
    assert.equal(r.modules, undefined);
    const degil = rea_ttd_info(yaz(kok, "x.bin", Buffer.from("trace")));
    assert.equal(degil.code, "capability_unsupported");
  });
});
