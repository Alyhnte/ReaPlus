// native-windows.test.mjs: win32 süreç / bütünlük / dizin yürüyüşü (canlı okuma).
// Frida ve debugger yok. Koş: npm run build sonrası
// `node --test tests/native-windows.test.mjs`.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import {
  rea_native_authority_check,
  rea_native_caps,
  rea_native_fs_snapshot,
  rea_native_process_info,
} from "../dist/native-windows/addon.js";

const WIN32 = process.platform === "win32";

// whoami SID -> kısa bütünlük adı (bağımsız doğrulama; sabit elevated yok).
const RID_AD = {
  0: "untrusted",
  4096: "low",
  8192: "medium",
  8448: "medium-plus",
  12288: "high",
  16384: "system",
  20480: "protected",
};

function sha256(metin) {
  return createHash("sha256").update(metin).digest("hex");
}

function whoamiBütünlük() {
  const metin = execFileSync("whoami.exe", ["/groups"], { encoding: "utf8", windowsHide: true, timeout: 15000 });
  const m = metin.match(/S-1-16-(\d+)/);
  assert.ok(m, "whoami Mandatory Label SID döndürmeli");
  const rid = Number(m[1]);
  const ad = RID_AD[rid];
  assert.ok(ad, `bilinen bütünlük RID: ${rid}`);
  const elevated = ad === "high" || ad === "system" || ad === "protected";
  return { ad, rid, elevated };
}

function çocukAç(marker) {
  const çocuk = spawn(process.execPath, ["-e", `/*${marker}*/ setInterval(() => {}, 1e9)`], {
    windowsHide: true,
    stdio: "ignore",
  });
  return new Promise((resolve, reject) => {
    çocuk.once("spawn", () => resolve(çocuk));
    çocuk.once("error", reject);
  });
}

describe("rea_native win32 dışı", { skip: WIN32 }, () => {
  it("süreç, yetki, anlık görüntü ve caps capability_unsupported döner", () => {
    for (const r of [
      rea_native_process_info(process.pid),
      rea_native_authority_check(process.pid),
      rea_native_fs_snapshot(tmpdir(), 1),
      rea_native_caps(),
    ]) {
      assert.equal(r.ok, false);
      assert.equal(r.code, "capability_unsupported");
    }
  });
});

describe("rea_native_process_info", { skip: !WIN32 }, () => {
  it("canlı sürecin adını ve komut satırını okur", async () => {
    const marker = `rea-native-${process.pid}-${Date.now()}`;
    const çocuk = await çocukAç(marker);
    try {
      const önceki = process.env.REA_NATIVE_PREBUILD;
      delete process.env.REA_NATIVE_PREBUILD;
      const r = rea_native_process_info(çocuk.pid);
      if (önceki === undefined) delete process.env.REA_NATIVE_PREBUILD;
      else process.env.REA_NATIVE_PREBUILD = önceki;
      assert.equal(r.ok, true);
      assert.equal(r.tool, "rea_native_process_info");
      assert.equal(r.veri.iskelet, undefined);
      assert.equal(r.veri.ad, basename(process.execPath));
      assert.match(r.veri.komut, new RegExp(marker));
    } finally {
      çocuk.kill();
    }
  });

  it("geçersiz ve olmayan pid capability_unsupported döner", () => {
    for (const pid of [0, -1, 1.5, Number.NaN]) {
      const r = rea_native_process_info(pid);
      assert.equal(r.ok, false, `pid ${pid}`);
      assert.equal(r.code, "capability_unsupported");
    }
    const yok = rea_native_process_info(2147483647);
    assert.equal(yok.ok, false);
    assert.equal(yok.code, "capability_unsupported");
    assert.match(yok.reason, /Win32_Process|ProcessId|yok|not found/i);
  });
});

describe("rea_native_authority_check", { skip: !WIN32 }, () => {
  it("geçerli sürecin bütünlüğünü whoami ile aynı okur", () => {
    const beklenen = whoamiBütünlük();
    const önceki = process.env.REA_NATIVE_PREBUILD;
    delete process.env.REA_NATIVE_PREBUILD;
    const r = rea_native_authority_check(process.pid);
    if (önceki === undefined) delete process.env.REA_NATIVE_PREBUILD;
    else process.env.REA_NATIVE_PREBUILD = önceki;
    assert.equal(r.ok, true);
    assert.equal(r.veri.iskelet, undefined);
    assert.equal(r.veri.rid, beklenen.rid);
    assert.equal(r.veri.bütünlük, beklenen.ad);
    assert.equal(r.veri.elevated, beklenen.elevated);
    assert.equal(typeof r.veri.elevated, "boolean");
  });

  it("görülemeyen süreç başarı nesnesi değil, gerçek hatayı döner", () => {
    const r = rea_native_authority_check(4);
    if (r.ok) {
      assert.equal(r.veri.bütünlük, "system");
      assert.equal(r.veri.elevated, true);
    } else {
      assert.equal(r.code, "capability_unsupported");
      assert.match(r.reason, /Win32|OpenProcess|Access|denied|0x5|\b5\b/i);
      assert.equal(r.veri, undefined);
    }
  });
});

describe("rea_native_fs_snapshot", { skip: !WIN32 }, () => {
  it("derinliğe kadar göreli yolları ve sha256 üretir", () => {
    const dir = mkdtempSync(join(tmpdir(), "rea-native-fs-"));
    try {
      writeFileSync(join(dir, "b.txt"), "beta");
      mkdirSync(join(dir, "alt"));
      writeFileSync(join(dir, "alt", "a.txt"), "alfa");
      mkdirSync(join(dir, "alt", "derin"));
      writeFileSync(join(dir, "alt", "derin", "c.txt"), "gama");
      const kök = rea_native_fs_snapshot(dir, 0);
      assert.equal(kök.ok, true);
      assert.deepEqual(kök.veri.dosyalar.map((d) => d.yol), ["b.txt"]);
      assert.equal(kök.veri.dosyalar[0].sha256, sha256("beta"));
      const bir = rea_native_fs_snapshot(dir, 1);
      assert.deepEqual(bir.veri.dosyalar.map((d) => d.yol), ["alt/a.txt", "b.txt"]);
      const iki = rea_native_fs_snapshot(dir, 2);
      assert.deepEqual(iki.veri.dosyalar.map((d) => d.yol), ["alt/a.txt", "alt/derin/c.txt", "b.txt"]);
      assert.equal(iki.veri.dosyalar[1].sha256, sha256("gama"));
      assert.equal(iki.veri.kirpildi, false);
      assert.doesNotMatch(iki.summary, /kuyruğa/i);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("200 dosyada keser", () => {
    const dir = mkdtempSync(join(tmpdir(), "rea-native-cap-"));
    try {
      for (let i = 0; i < 201; i++) writeFileSync(join(dir, `f${String(i).padStart(3, "0")}.txt`), `n${i}`);
      const r = rea_native_fs_snapshot(dir, 0);
      assert.equal(r.ok, true);
      assert.equal(r.veri.dosyalar.length, 200);
      assert.equal(r.veri.kirpildi, true);
      const beklenen = Array.from({ length: 201 }, (_, i) => `f${String(i).padStart(3, "0")}.txt`).sort().slice(0, 200);
      assert.deepEqual(r.veri.dosyalar.map((d) => d.yol), beklenen);
      assert.equal(r.veri.dosyalar[0].sha256, sha256("n0"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("boş dizin ve aralık dışı derinlik capability_unsupported döner", () => {
    const boş = rea_native_fs_snapshot("", 2);
    assert.equal(boş.ok, false);
    assert.equal(boş.code, "capability_unsupported");
    for (const d of [-1, 6]) {
      const r = rea_native_fs_snapshot(tmpdir(), d);
      assert.equal(r.ok, false, `derinlik ${d}`);
      assert.equal(r.code, "capability_unsupported");
    }
  });
});

describe("rea_native_caps", { skip: !WIN32 }, () => {
  it("prebuild bayrağı değil, çalışan komutları raporlar", () => {
    const önceki = process.env.REA_NATIVE_PREBUILD;
    delete process.env.REA_NATIVE_PREBUILD;
    const r = rea_native_caps();
    if (önceki === undefined) delete process.env.REA_NATIVE_PREBUILD;
    else process.env.REA_NATIVE_PREBUILD = önceki;
    assert.equal(r.ok, true);
    assert.equal(r.veri.win32, true);
    assert.equal(r.veri.prebuild, undefined);
    assert.equal(r.veri.iskelet, undefined);
    assert.equal(r.veri.komutlar.process, true);
    assert.equal(r.veri.komutlar.authority, true);
    assert.equal(r.veri.komutlar.fs, true);
  });
});
