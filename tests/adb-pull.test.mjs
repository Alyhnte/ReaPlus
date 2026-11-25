// adb-pull.test.mjs: sahte adb (PATH veya REA_ADB_BIN). Gercek cihaz yok.
// Kos: npm run build sonrasi node --test tests/adb-pull.test.mjs
import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rea_adb_pull } from "../dist/rea-domains/android/AdbPull.js";
import { applyWorkspaceRoot } from "../dist/server/workspaceRoot.js";

const onceki = { PATH: process.env.PATH, REA_ADB_BIN: process.env.REA_ADB_BIN, REA_WORKSPACE_ROOT: process.env.REA_WORKSPACE_ROOT };

function dizin() {
  return mkdtempSync(join(tmpdir(), "rea-adb-"));
}

function sahteAdb(kok, cikis, govde) {
  const yol = join(kok, "adb.cmd");
  writeFileSync(yol, `@echo off\r\n${govde}\r\nexit /b ${cikis}\r\n`);
  return yol;
}

afterEach(() => {
  if (onceki.PATH === undefined) delete process.env.PATH;
  else process.env.PATH = onceki.PATH;
  if (onceki.REA_ADB_BIN === undefined) delete process.env.REA_ADB_BIN;
  else process.env.REA_ADB_BIN = onceki.REA_ADB_BIN;
  if (onceki.REA_WORKSPACE_ROOT === undefined) delete process.env.REA_WORKSPACE_ROOT;
  else process.env.REA_WORKSPACE_ROOT = onceki.REA_WORKSPACE_ROOT;
});

describe("rea_adb_pull", () => {
  it("REA_ADB_BIN sahte adb dosyayi yazar ve 0 ile cikarsa cekilen dosyayi bildirir", () => {
    const kok = dizin();
    const yerel = join(kok, "gelen.bin");
    const adb = sahteAdb(kok, 0, `if /I "%~1"=="pull" echo wave18-pulled>"%~3"`);
    process.env.REA_ADB_BIN = adb;
    const r = rea_adb_pull("/sdcard/ornek.bin", yerel);
    assert.equal(r.ok, true);
    assert.equal(r.arac, "rea_adb_pull");
    assert.equal(r.cikis, 0);
    assert.equal(r.uzak, "/sdcard/ornek.bin");
    assert.ok(r.bayt > 0);
    assert.match(readFileSync(yerel, "utf8"), /wave18-pulled/);
  });

  it("PATH uzerindeki sahte adb de calisir", () => {
    const kok = dizin();
    const yerel = join(kok, "yol.bin");
    sahteAdb(kok, 0, `if /I "%~1"=="pull" echo path-pulled>"%~3"`);
    delete process.env.REA_ADB_BIN;
    process.env.PATH = kok;
    const r = rea_adb_pull("/data/local/tmp/a", yerel);
    assert.equal(r.ok, true);
    assert.match(readFileSync(yerel, "utf8"), /path-pulled/);
  });

  it("adb yoksa capability_unsupported; sifir disi cikis basari sayilmaz", () => {
    const kok = dizin();
    process.env.REA_ADB_BIN = join(kok, "adb-yok.exe");
    const yok = rea_adb_pull("/sdcard/a", join(kok, "out.bin"));
    assert.equal(yok.ok, false);
    assert.equal(yok.code, "capability_unsupported");
    assert.equal(existsSync(join(kok, "out.bin")), false);
    const adb = sahteAdb(kok, 3, `echo fail 1>&2`);
    process.env.REA_ADB_BIN = adb;
    const hedef = join(kok, "yazilmadi.bin");
    const r = rea_adb_pull("/sdcard/a", hedef);
    assert.equal(r.ok, false);
    assert.notEqual(r.code, undefined);
    assert.equal(r.cikis, 3);
    assert.equal(existsSync(hedef), false);
  });

  it("cikti yolu calisma kokune uyar, uzak cihaz yolu oldugu gibi kalir", () => {
    const kok = dizin();
    const dis = dizin();
    process.env.REA_WORKSPACE_ROOT = kok;
    const ic = applyWorkspaceRoot("rea_adb_pull", { remote: "/sdcard/a", out: join(kok, "ic.bin") }, process.env, kok);
    assert.equal(ic.remote, "/sdcard/a");
    assert.equal(ic.out, join(kok, "ic.bin"));
    assert.throws(() => applyWorkspaceRoot("rea_adb_pull", { remote: "/sdcard/a", out: join(dis, "dis.bin") }, process.env, kok));
  });
});
