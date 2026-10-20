// tests/corpus.test.mjs: golden korpus bütünlük kapısı (tamamen offline).
// Koş: node --test tests/corpus.test.mjs (önce: node scripts/korpus-kur.mjs)
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rea_pe_info, rea_pe_imports, rea_pe_sections } from "../dist/rea-domains/winpe/PeReader.js";

// Kök dizini test dosyasının konumundan türet.
const kok = dirname(dirname(fileURLToPath(import.meta.url)));
// Korpus dizini ile kanonik 5 dosya yolu.
const corpusDir = join(kok, "tests", "corpus");
const kurBetik = join(kok, "scripts", "korpus-kur.mjs");
const ELF_YOL = join(corpusDir, "mini_branch.elf");
const PE_YOL = join(corpusDir, "mini_pe_x64.exe");
const APK_YOL = join(corpusDir, "sahte.apk");
const WASM_YOL = join(corpusDir, "ornek.wasm");
const JS_YOL = join(corpusDir, "ornek.js");
const TUMU = [ELF_YOL, PE_YOL, APK_YOL, WASM_YOL, JS_YOL];

// Gerçek derlenmiş korpus (yerel gcc; kaynaklar tests/corpus/src/, üretim
// scripts/corpus-gercek-derle.mjs). PE32+ (x64) exe'ler + DLL + COFF obj.
const GERCEK_PE_ADLARI = ["real_tiny.exe", "real_tiny_console.exe", "real_tiny_o2.exe"];
const GERCEK_DLL_AD = "real_dll.dll";
const GERCEK_OBJ_AD = "real_tiny.obj";
const GERCEK_MZ_ADLARI = [...GERCEK_PE_ADLARI, GERCEK_DLL_AD];
const GERCEK_TUM_ADLARI = [...GERCEK_MZ_ADLARI, GERCEK_OBJ_AD];
const GERCEK_TINY = join(corpusDir, "real_tiny.exe");
const GERCEK_OBJ = join(corpusDir, GERCEK_OBJ_AD);

// Dosyanın sha256 özeti (idempotency karşılaştırması için).
function sha256(yol) {
  return createHash("sha256").update(readFileSync(yol)).digest("hex");
}

describe("korpus varlık + boyut", () => {
  // ELF ikilisi kurulumdan sonra var ve boş olmamalı.
  it("mini_branch.elf var, boyut > 0", () => {
    assert.equal(existsSync(ELF_YOL), true);
    assert.ok(statSync(ELF_YOL).size > 0);
  });

  // PE ikilisi kurulumdan sonra var ve boş olmamalı.
  it("mini_pe_x64.exe var, boyut > 0", () => {
    assert.equal(existsSync(PE_YOL), true);
    assert.ok(statSync(PE_YOL).size > 0);
  });

  // APK kurulumdan sonra var ve boş olmamalı.
  it("sahte.apk var, boyut > 0", () => {
    assert.equal(existsSync(APK_YOL), true);
    assert.ok(statSync(APK_YOL).size > 0);
  });

  // Wasm kurulumdan sonra var ve boş olmamalı.
  it("ornek.wasm var, boyut > 0", () => {
    assert.equal(existsSync(WASM_YOL), true);
    assert.ok(statSync(WASM_YOL).size > 0);
  });

  // JS kurulumdan sonra var ve boş olmamalı.
  it("ornek.js var, boyut > 0", () => {
    assert.equal(existsSync(JS_YOL), true);
    assert.ok(statSync(JS_YOL).size > 0);
  });
});

describe("korpus sihir + içerik", () => {
  // ELF sihri ilk 4 baytta 7f454c46 olmalı.
  it("elf sihri 7f454c46", () => {
    const bayt = readFileSync(ELF_YOL).subarray(0, 4);
    assert.equal(Buffer.from(bayt).toString("hex"), "7f454c46");
  });

  // PE sihri MZ (4d5a) ile başlamalı.
  it("pe MZ ile başlar", () => {
    const bayt = readFileSync(PE_YOL).subarray(0, 2);
    assert.equal(Buffer.from(bayt).toString("ascii"), "MZ");
  });

  // APK gerçek zip: PK (504b) ile başlamalı.
  it("apk PK ile başlar", () => {
    const bayt = readFileSync(APK_YOL).subarray(0, 2);
    assert.equal(Buffer.from(bayt).toString("ascii"), "PK");
  });

  // APK girdisi AndroidManifest.xml içermeli.
  it("apk AndroidManifest.xml girdisi taşır", () => {
    const ham = readFileSync(APK_YOL);
    assert.ok(ham.includes(Buffer.from("AndroidManifest.xml", "utf8")));
  });

  // Wasm sihri 0061736d + sürüm 01000000 olmalı.
  it("wasm sihir + sürüm", () => {
    const bayt = readFileSync(WASM_YOL).subarray(0, 8);
    assert.equal(Buffer.from(bayt).toString("hex"), "0061736d01000000");
  });

  // JS bundle require içermeli.
  it("js require içerir", () => {
    const metin = readFileSync(JS_YOL, "utf8");
    assert.ok(metin.includes("require"));
  });
});

describe("korpus-kur idempotent", () => {
  // İkinci koşu aynı baytları üretmeli: 5 dosyanın hash'i değişmemeli.
  it("ikinci koşu aynı hashleri verir", () => {
    execFileSync(process.execPath, [kurBetik], { cwd: kok, stdio: "pipe" }); // önce kur: idempotentlik ikinci koşuda ölçülür
    const once = TUMU.map(sha256);
    execFileSync(process.execPath, [kurBetik], { cwd: kok, stdio: "pipe" });
    const sonra = TUMU.map(sha256);
    assert.deepEqual(sonra, once);
  });
});

describe("gerçek derlenmiş binary korpusu", () => {
  // Her gerçek derlenmiş artifact diskte ve boş olmamalı.
  for (const ad of GERCEK_TUM_ADLARI) {
    it(`${ad} var, boyut > 0`, () => {
      const yol = join(corpusDir, ad);
      assert.equal(existsSync(yol), true, `EKSIK tests/corpus/${ad} (önce: node scripts/corpus-gercek-derle.mjs)`);
      assert.ok(statSync(yol).size > 0);
    });
  }

  // PE/ DLL artifacts MZ imzasıyla başlamalı (COFF obj başlamaz, onu ayrı test kapsar).
  for (const ad of GERCEK_MZ_ADLARI) {
    it(`${ad} MZ ile başlar`, () => {
      const bayt = readFileSync(join(corpusDir, ad)).subarray(0, 2);
      assert.equal(Buffer.from(bayt).toString("ascii"), "MZ");
    });
  }

  // COFF obj doğrudan COFF header ile başlar (machine 0x8664), MZ YOK.
  it(`${GERCEK_OBJ_AD} COFF header ile başlar (MZ yok)`, () => {
    const bayt = readFileSync(GERCEK_OBJ).subarray(0, 2);
    assert.equal(Buffer.from(bayt).toString("hex"), "6486"); // 0x8664 LE
  });

  // Manifest kapısı: her gerçek binary HASHES.json'da kayıtlı ve sha256 ham
  // baytla tutar (uydurma hash bu kapıda yakalanır).
  it("HASHES.json gerçek binary girdileri diskle tutar", () => {
    const manifest = JSON.parse(readFileSync(join(corpusDir, "HASHES.json"), "utf8"));
    for (const ad of GERCEK_TUM_ADLARI) {
      const girdi = manifest.dosyalar[ad];
      assert.ok(girdi, `EKSIK HASHES.json girdisi: ${ad}`);
      assert.equal(girdi.sha256, sha256(join(corpusDir, ad)), `${ad}: HASHES.json sha256 uyuşmuyor`);
    }
  });
});

describe("gerçek binary PE provider (winpe)", () => {
  // gcc x64 çıktısı: machine 0x8664 + PE32+ magic => bit 64.
  it("rea_pe_info real_tiny.exe: ok, machine 0x8664, bit 64", () => {
    const r = rea_pe_info(GERCEK_TINY);
    assert.equal(r.ok, true);
    assert.equal(r.machine, 0x8664);
    assert.equal(r.bit, "64");
  });

  // Üç PE + DLL provider tarafında çözülebilmeli (bölüm tablosu sağlam).
  it("rea_pe_info her gerçek MZ dosyasında ok", () => {
    for (const ad of GERCEK_MZ_ADLARI) {
      const r = rea_pe_info(join(corpusDir, ad));
      assert.equal(r.ok, true, `${ad}: ${r.neden ?? ""}`);
      assert.ok(r.section_sayisi >= 1, `${ad}: bölüm yok`);
    }
  });

  // MinGW her Windows binary'sine kernel32 bağlar; thunk'lar çözülmeli.
  it("rea_pe_imports real_tiny.exe kernel32.dll taşır", () => {
    const r = rea_pe_imports(GERCEK_TINY);
    assert.equal(r.ok, true);
    assert.ok(r.dlls.length > 0, "import listesi boş olmamalı");
    assert.ok(r.dlls.some((d) => d.toLowerCase().includes("kernel32")), `kernel32 yok: ${r.dlls.join(",")}`);
  });

  // Bölüm tablosu gerçek isimlerle okunur (en az bir bölüm).
  it("rea_pe_sections real_tiny.exe bölümleri listeler", () => {
    const r = rea_pe_sections(GERCEK_TINY);
    assert.equal(r.ok, true);
    assert.ok(r.bolumler.length >= 1);
    for (const b of r.bolumler) assert.ok(b.ad.length > 0 && b.vsize > 0, JSON.stringify(b));
  });

  // COFF obj PE değil: provider dürüstçe unsupported döner (throw YOK).
  it("rea_pe_info COFF obj: capability_unsupported", () => {
    const r = rea_pe_info(GERCEK_OBJ);
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
  });
});
