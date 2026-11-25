// sqlite-snapshot.test.mjs: gercek SQLite basligi + sema tablo adlari.
// sqlite3 CLI varsa onu kullanir; yoksa test minimal gecerli dosyayi yazar.
// Kos: npm run build sonrasi node --test tests/sqlite-snapshot.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { rea_sqlite_snapshot } from "../dist/rea-domains/sqlite/SqliteSnapshot.js";

function dizin() {
  return mkdtempSync(join(tmpdir(), "rea-sqlite-"));
}

function u16be(b, o, v) { b.writeUInt16BE(v, o); }
function u32be(b, o, v) { b.writeUInt32BE(v, o); }

function metinSeri(s) {
  return { tip: s.length * 2 + 13, govde: Buffer.from(s, "utf8") };
}

function kayit(alanlar) {
  const tipler = Buffer.from(alanlar.map((a) => a.tip));
  const basBoy = 1 + tipler.length;
  const bas = Buffer.alloc(basBoy);
  bas[0] = basBoy;
  tipler.copy(bas, 1);
  return Buffer.concat([bas, ...alanlar.map((a) => a.govde)]);
}

function hucre(rowid, payload) {
  return Buffer.concat([Buffer.from([payload.length, rowid]), payload]);
}

function minimalSqlite() {
  const sayfa = 512;
  const dosya = Buffer.alloc(sayfa * 3);
  dosya.write("SQLite format 3\0", 0, "utf8");
  u16be(dosya, 16, sayfa);
  dosya[18] = 1;
  dosya[19] = 1;
  dosya[21] = 64;
  dosya[22] = 32;
  dosya[23] = 32;
  u32be(dosya, 24, 1);
  u32be(dosya, 28, 3);
  u32be(dosya, 40, 1);
  u32be(dosya, 44, 4);
  u32be(dosya, 56, 1);
  u32be(dosya, 92, 1);
  u32be(dosya, 96, 3045000);
  const tablolar = [
    { ad: "wave18_alpha", sql: "CREATE TABLE wave18_alpha (id INTEGER)", kok: 2, rowid: 1 },
    { ad: "wave18_beta", sql: "CREATE TABLE wave18_beta (ad TEXT)", kok: 3, rowid: 2 },
  ];
  const hucreler = tablolar.map((t) => hucre(t.rowid, kayit([
    metinSeri("table"),
    metinSeri(t.ad),
    metinSeri(t.ad),
    { tip: 1, govde: Buffer.from([t.kok]) },
    metinSeri(t.sql),
  ])));
  let icerik = sayfa;
  const yerler = [];
  for (let i = hucreler.length - 1; i >= 0; i--) {
    icerik -= hucreler[i].length;
    yerler[i] = icerik;
    hucreler[i].copy(dosya, icerik);
  }
  dosya[100] = 0x0d;
  u16be(dosya, 103, hucreler.length);
  u16be(dosya, 105, yerler[0]);
  hucreler.forEach((_, i) => u16be(dosya, 108 + i * 2, yerler[i]));
  for (const kok of [2, 3]) {
    const o = (kok - 1) * sayfa;
    dosya[o] = 0x0d;
    u16be(dosya, o + 5, sayfa);
  }
  return dosya;
}

function cliIle(yol) {
  const r = spawnSync("sqlite3", [yol, "CREATE TABLE wave18_alpha (id INTEGER); CREATE TABLE wave18_beta (ad TEXT);"], { encoding: "utf8" });
  return !r.error && r.status === 0;
}

describe("rea_sqlite_snapshot", () => {
  it("basliktan sayfa boyutunu ve sema tablosundan tablo adlarini cozer", () => {
    const yol = join(dizin(), "mini.sqlite");
    const cli = cliIle(yol);
    if (!cli) writeFileSync(yol, minimalSqlite());
    const r = rea_sqlite_snapshot(yol);
    assert.equal(r.ok, true);
    assert.equal(r.arac, "rea_sqlite_snapshot");
    assert.ok(r.sayfaBoyutu >= 512);
    assert.ok(r.sayfaBoyutu % 2 === 0 || r.sayfaBoyutu === 1);
    assert.deepEqual([...r.tablolar].sort(), ["wave18_alpha", "wave18_beta"]);
  });

  it("sqlite olmayan dosya capability_unsupported verir", () => {
    const yol = join(dizin(), "not.db");
    writeFileSync(yol, Buffer.from("SQLite format 3 ama null ve sayfa yok"));
    const r = rea_sqlite_snapshot(yol);
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    assert.equal(rea_sqlite_snapshot(join(dizin(), "yok.db")).code, "capability_unsupported");
  });
});
