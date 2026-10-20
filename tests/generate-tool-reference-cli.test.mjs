// generate-tool-reference-cli.test.mjs: uretecin CLI girisi her yol
// ondegiminden calismalidir (C: -> B: junction / subst gibi).
// TDD: once junction yoluyla sessiz no-op'u kirmizi gosterir.
// Kos: node --test tests/generate-tool-reference-cli.test.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert";

const kok = realpathSync(join(fileURLToPath(new URL(".", import.meta.url)), ".."));
const betik = join(kok, "scripts", "generate-tool-reference.mjs");

const calistir = (yol) =>
  spawnSync(process.execPath, [yol, "--check"], { cwd: kok, encoding: "utf8", timeout: 60_000 });

describe("generate-tool-reference CLI girisi", () => {
  it("gercek yolla calisir ve cikti uretir", () => {
    const r = calistir(betik);
    assert.equal(r.status, 0, `exit=0 olmali: ${r.stderr}`);
    assert.match(r.stdout + r.stderr, /TOOLS\.md (guncel|uretildi)/, "cikti olmali");
  });

  it("junction yoluyla da calisir (sessiz no-op degil)", (t) => {
    if (process.platform !== "win32") return t.skip("yalnizca win32");
    const taban = join(tmpdir(), `rea-cli-guard-${process.pid}`);
    const link = join(taban, "link");
    mkdirSync(taban, { recursive: true });
    const mk = spawnSync("cmd", ["/c", "mklink", "/J", link, kok], { encoding: "utf8" });
    try {
      assert.equal(mk.status, 0, `junction kurulmali: ${mk.stderr}`);
      const betikLink = join(link, "scripts", "generate-tool-reference.mjs");
      assert.ok(existsSync(betikLink), "junction betigi gosteriyor olmali");
      const r = spawnSync(process.execPath, [betikLink, "--check"], { cwd: kok, encoding: "utf8", timeout: 60_000 });
      assert.equal(r.status, 0, `exit=0 olmali: ${r.stderr}`);
      assert.match(r.stdout + r.stderr, /TOOLS\.md (guncel|uretildi)/, `junction yolu sessiz kalmamali: stdout='${r.stdout}' stderr='${r.stderr}'`);
    } finally {
      rmSync(taban, { recursive: true, force: true });
    }
  });
});
