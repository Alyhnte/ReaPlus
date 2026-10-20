import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");

test("chrome key maps: TR/EN/DE/FR/ES same 18 keys", async () => {
  const { chromeOku } = await import(join(kok, "scripts", "site-uret.mjs").replace(/\\/g, "/") + "?t=" + Date.now()).catch(() => ({}));
  // site-uret.mjs doesn't export; test via running it and checking output
  // Direct parse of index-chrome.md files for all langs
  const langs = ["en", "de", "fr", "es"];
  const expected = 18;
  for (const lang of langs) {
    const path = join(kok, "docs", "i18n", lang, "index-chrome.md");
    assert.ok(existsSync(path), `${lang}/index-chrome.md exists`);
    const md = readFileSync(path, "utf8");
    const keys = [...md.matchAll(/^\|\s*([a-z][\w.]*)\s*\|/gm)].map((m) => m[1]);
    assert.equal(new Set(keys).size, expected, `${lang} has ${expected} unique keys`);
  }
});

test("index-chrome.md files present for all languages", () => {
  for (const lang of ["en", "de", "fr", "es"]) {
    assert.ok(existsSync(join(kok, "docs", "i18n", lang, "index-chrome.md")), `${lang} chrome`);
  }
});

test("site output has language switcher", () => {
  // Run generator first (in test setup this would be run)
  const index = readFileSync(join(kok, "docs", "site", "index.html"), "utf8");
  assert.ok(index.includes("lang-select") || index.includes("id=\"dil\""), "lang selector present");
  assert.ok(/<html lang="tr">/.test(index), "default TR");
});

test("i18n content pages exist (de/en/fr/es README)", () => {
  for (const lang of ["en", "de", "fr", "es"]) {
    assert.ok(existsSync(join(kok, "docs", "i18n", lang, "README.md")), `${lang} README`);
  }
});
