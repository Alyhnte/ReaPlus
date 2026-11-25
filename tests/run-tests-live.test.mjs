// run-tests-live.test.mjs: varsayılan koşu kümesi kaynak kilidi.
// sniff offline'dır ve LIVE'da durmamalı; frida-api canlı kaldığı için LIVE'da kalır.
// Koş: node --test tests/run-tests-live.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(join(root, "scripts", "run-tests.mjs"), "utf8");

describe("run-tests LIVE kümesi", () => {
  it("sniff varsayılan kümede, frida-api ve diğer canlı dosyalar LIVE'da", () => {
    const m = src.match(/const LIVE = new Set\(\[([\s\S]*?)\]\);/);
    assert.ok(m, "LIVE set bulunamadı");
    const live = m[1];
    assert.equal(live.includes("sniff.test.mjs"), false, "sniff.test.mjs LIVE'da olmamalı");
    assert.equal(live.includes("frida-api.test.mjs"), true);
    assert.equal(live.includes("fridaplus.test.mjs"), true);
    assert.equal(live.includes("browser2.test.mjs"), true);
    assert.equal(live.includes("ghidra-full.test.mjs"), true);
    assert.equal(live.includes("ghidra-prof2.test.mjs"), true);
  });
});
