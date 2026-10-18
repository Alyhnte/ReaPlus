// tests/portable-paket.test.mjs: portable node bundle kapisi (dalga-11/sea-portable).
// Kapsam: scripts/portable-paketle.mjs ciktisi portable/<surum>/ —
//   (a) node.exe gercek kopya (>50MB) + calisiyor, surum sistem node ile esit
//   (b) package.json + dist/server.js + dist/cli/index.js + start.bat yerinde
//   (c) versiyon: paketteki package.json surumu = kok package.json surumu
//   (d) node_modules kurala uyar: prod kokleri tam (frida, zod, js-sha3,
//       @modelcontextprotocol/*) + transitive kapali (bindings), dev budanmis
//       (playwright, typescript, @types); frida binding DOSYA olarak tasinmis
//       (SEA'ya gomulemez — dosya == portable yolu; docs/SEA-DAGITIM.md engel 1)
//   (e) start.bat gercek entry'yi cagirir ("%~dp0node.exe" + "%~dp0dist\server.js")
//   (f) duman: paket node'u analyze-evm selector uretir (0xa9059cbb)
//   (g) zip istege bagli: varsa tarafsiz magic-byte (PK) dogrulamasi; yoksa atla
// Ag YOK, npm ci/install YOK, kullanici dizinine yazma YOK.
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(kok, "package.json"), "utf8"));
const betik = join(kok, "scripts", "portable-paketle.mjs");
const dizin = join(kok, "portable", pkg.version);
const nodeAd = process.platform === "win32" ? "node.exe" : "node";
const nodeExe = join(dizin, nodeAd);
const manifestYolu = join(dizin, "MANIFEST.json");
const startBat = join(dizin, "start.bat");
const nm = join(dizin, "node_modules");

describe("portable node bundle (portable-paketle)", () => {
  before(() => {
    assert.ok(existsSync(betik), "scripts/portable-paketle.mjs olmali");
    assert.ok(
      existsSync(join(kok, "dist", "server.js")),
      "dist/server.js yok: once `npm ci` + `npm run build`",
    );
    if (!existsSync(manifestYolu)) {
      execFileSync(process.execPath, [betik], { encoding: "utf8", timeout: 600_000, cwd: kok });
    }
    assert.ok(existsSync(manifestYolu), `MANIFEST.json olmali: ${manifestYolu}`);
  });

  it("(a) node.exe gercek kopya + calisiyor", () => {
    assert.ok(existsSync(nodeExe), `pakette ${nodeAd} olmali (sistem node'unun kopyasi; indirme yok)`);
    const boyut = statSync(nodeExe).size;
    console.log(`    paketlenmis node: ${boyut} bayt`);
    assert.ok(boyut > 50_000_000, `node kopyasi beklenenden kucuk: ${boyut} bayt`);
    const out = execFileSync(nodeExe, ["--version"], { encoding: "utf8", timeout: 30_000 });
    assert.equal(out.trim(), process.version, "paket node surumu sistem node ile ayni olmali");
  });

  it("(b) package.json + dist + start.bat yerinde", () => {
    assert.ok(existsSync(join(dizin, "package.json")), "package.json pakette olmali");
    assert.ok(existsSync(join(dizin, "dist", "server.js")), "dist/server.js pakette olmali (bin.['rea-plus'] entry)");
    assert.ok(existsSync(join(dizin, "dist", "cli", "index.js")), "dist/cli/index.js pakette olmali");
    assert.ok(existsSync(startBat), "start.bat pakette olmali");
  });

  it("(c) versiyon package.json ile esit", () => {
    const paketPkg = JSON.parse(readFileSync(join(dizin, "package.json"), "utf8"));
    assert.equal(paketPkg.version, pkg.version, "paket surumu kok package.json ile eslesmeli");
    const m = JSON.parse(readFileSync(manifestYolu, "utf8"));
    assert.equal(m.surum, pkg.version, "MANIFEST surumu kok package.json ile eslesmeli");
    assert.equal(m.platform, process.platform, "MANIFEST platformu bu makine olmali");
  });

  it("(d) node_modules kurala uyar: prod tam, dev budani, frida binding dosya", () => {
    // Prod kokleri (package.json.dependencies) kapanmis olmali.
    for (const ad of ["frida", "zod", "js-sha3", "@modelcontextprotocol/node", "@modelcontextprotocol/server"]) {
      assert.ok(
        existsSync(join(nm, ...ad.split("/"), "package.json")),
        `prod bagimlilik pakette olmali: ${ad}`,
      );
    }
    // Kapanis kurali transitive'leri de goturur (frida -> bindings).
    assert.ok(existsSync(join(nm, "bindings", "package.json")), "transitive prod (bindings) olmali");
    // Dev budandi (dinamik/gelistirme bağımliliklari paket disi).
    for (const ad of ["playwright", "typescript", "@types"]) {
      assert.ok(!existsSync(join(nm, ad)), `dev bagimlilik pakette olmamali: ${ad}`);
    }
    // Frida binding: SEA'ya gomulemez; portable'da DOSYA olarak tasinir (durust kayit).
    const fridaBinding = join(nm, "frida", "build", "frida_binding.node");
    assert.ok(existsSync(fridaBinding), "frida_binding.node dosya olarak pakette olmali (gomme yok)");
    const boyut = statSync(fridaBinding).size;
    console.log(`    pakette frida_binding.node: ${boyut} bayt`);
    assert.ok(boyut > 100_000_000, `frida binding beklenenden kucuk: ${boyut} bayt`);
  });

  it("(e) start.bat gercek entry'yi cagirir", () => {
    const icerik = readFileSync(startBat, "utf8");
    assert.ok(icerik.includes(`"%~dp0${nodeAd}"`), `start.bat "${nodeAd}" gostermeli`);
    assert.ok(icerik.includes(`"%~dp0dist\\server.js"`), "start.bat %~dp0dist\\server.js gostermeli");
  });

  it("(f) duman: paketlenmis node analyze-evm calistirir", () => {
    const out = execFileSync(
      nodeExe,
      [join(dizin, "dist", "cli", "index.js"), "analyze-evm", "transfer(address,uint256)", "--json"],
      { encoding: "utf8", timeout: 60_000, cwd: dizin },
    );
    const r = JSON.parse(out);
    assert.equal(r.ok, true, `duman kosusu ok olmali: ${out}`);
    assert.equal(r.selector, "0xa9059cbb", "selector dogru olmali");
  });

  it("(g) zip istege bagli: varsa tarafsiz PK magic dogrulamasi", () => {
    const zip = `${dizin}.zip`;
    if (!existsSync(zip)) {
      console.log("    zip yok (istege bagli; --zip ile uretilir) — atlandi");
      return;
    }
    const fd = readFileSync(zip);
    assert.ok(fd.length > 22, "zip bos olmamali");
    assert.equal(fd[0], 0x50, "zip magic P");
    assert.equal(fd[1], 0x4b, "zip magic K");
    assert.ok(
      (fd[2] === 0x03 && fd[3] === 0x04) || (fd[2] === 0x05 && fd[3] === 0x06),
      "zip magic PK\\x03\\x04 (veya bos arsiv PK\\x05\\x06) olmali",
    );
  });
});
