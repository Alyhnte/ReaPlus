// electron-offline.test.mjs: Electron fuse teli + BrowserWindow anahtar sinifi.
// Electron kurulmaz, pencere acilmaz. Kos: npm run build sonrasi
// node --test tests/electron-offline.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rea_electron_fuses } from "../dist/rea-domains/electron/ElectronFuses.js";
import { BROWSER_WINDOW_OPTIONS, rea_electron_window } from "../dist/rea-domains/electron/ElectronWindow.js";

const SENTINEL = "dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX";
const ADLAR = [
  "runAsNode",
  "enableCookieEncryption",
  "enableNodeOptionsEnvironmentVariable",
  "enableNodeCliInspectArguments",
  "enableEmbeddedAsarIntegrityValidation",
  "onlyLoadAppFromAsar",
  "loadBrowserProcessSpecificV8Snapshot",
  "grantFileProtocolExtraPrivileges",
];

function dizin() {
  return mkdtempSync(join(tmpdir(), "rea-electron-"));
}

describe("rea_electron_fuses", () => {
  it("sentinel sonrasi tel baytlarindan belgelenmis sigortalari on/off okur", () => {
    const yol = join(dizin(), "electron.bin");
    const tel = Buffer.from([1, 0x31, 0x30, 0x31, 0x30, 0x30, 0x31, 0x31, 0x30]);
    writeFileSync(yol, Buffer.concat([Buffer.from("onek-"), Buffer.from(SENTINEL), tel, Buffer.from("-kuyruk")]));
    const r = rea_electron_fuses(yol);
    assert.equal(r.ok, true);
    assert.equal(r.arac, "rea_electron_fuses");
    assert.equal(r.surum, 1);
    assert.deepEqual(r.fuses.map((f) => f.ad), ADLAR);
    assert.deepEqual(r.fuses.map((f) => f.durum), ["on", "off", "on", "off", "off", "on", "on", "off"]);
  });

  it("sentinel yoksa capability_unsupported", () => {
    const yol = join(dizin(), "duz.bin");
    writeFileSync(yol, Buffer.from("electron degil, sentinel yok"));
    const r = rea_electron_fuses(yol);
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
  });

  it("dosya yoksa veya tel eksikse capability_unsupported", () => {
    const yok = rea_electron_fuses(join(dizin(), "yok.bin"));
    assert.equal(yok.ok, false);
    assert.equal(yok.code, "capability_unsupported");
    const kisa = join(dizin(), "kisa.bin");
    writeFileSync(kisa, Buffer.concat([Buffer.from(SENTINEL), Buffer.from([1, 0x31, 0x30])]));
    const r = rea_electron_fuses(kisa);
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    const surum = join(dizin(), "surum.bin");
    writeFileSync(surum, Buffer.concat([Buffer.from(SENTINEL), Buffer.from([2, 0x31, 0x31, 0x31, 0x31, 0x31, 0x31, 0x31, 0x31])]));
    assert.equal(rea_electron_fuses(surum).code, "capability_unsupported");
  });
});

describe("rea_electron_window", () => {
  it("belgelenmis BrowserWindow anahtarlarini bilinene, digerlerini bilinmeyene ayirir", () => {
    assert.ok(BROWSER_WINDOW_OPTIONS.includes("width"));
    assert.ok(BROWSER_WINDOW_OPTIONS.includes("height"));
    assert.ok(BROWSER_WINDOW_OPTIONS.includes("show"));
    assert.ok(BROWSER_WINDOW_OPTIONS.includes("frame"));
    assert.ok(BROWSER_WINDOW_OPTIONS.includes("webPreferences"));
    assert.ok(BROWSER_WINDOW_OPTIONS.includes("roundedCorners"));
    const r = rea_electron_window(JSON.stringify({
      width: 800,
      height: 600,
      show: false,
      frame: true,
      webPreferences: { nodeIntegration: false },
      roundedCorners: true,
      notARealOption: 1,
    }));
    assert.equal(r.ok, true);
    assert.equal(r.calisiyor, false);
    assert.equal(r.pid, undefined);
    assert.deepEqual(r.bilinen, ["frame", "height", "roundedCorners", "show", "webPreferences", "width"]);
    assert.deepEqual(r.bilinmeyen, ["notARealOption"]);
  });

  it("JSON yoksa veya nesne degilse capability_unsupported", () => {
    assert.equal(rea_electron_window("").code, "capability_unsupported");
    assert.equal(rea_electron_window("   ").code, "capability_unsupported");
    assert.equal(rea_electron_window("{").code, "capability_unsupported");
    assert.equal(rea_electron_window("[]").code, "capability_unsupported");
    assert.equal(rea_electron_window("null").code, "capability_unsupported");
  });
});
