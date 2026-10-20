// example-sessions.test.mjs: Dalga-7 — docs/example-sessions/ (3 session files) +
// README "Example Sessions" section quality gate.
// Gate: file presence + minimum length (empty/fabricated docs must not pass) +
// real tool names (Ghidra analyzeHeadless, IDA idat, r2) + README heading and
// 3 relative links. Read-only: no operations other than fs reads.
// Run: `node tests/example-sessions.test.mjs` (single file) or `npm test` (full suite).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));
const DIZIN = join(kok, "docs", "example-sessions");
const README = join(kok, "README.md");

// Session files + the real tool name required in each (no fabricated tools).
const OTURUMLAR = [
  { ad: "ghidra-analysis.md", zorunlu: ["analyzeHeadless", "rea_ghidra_", "REA_GHIDRA_DIR"] },
  { ad: "ida-comparison.md", zorunlu: ["idat", "rea_ida_", "REA_IDA_PATH"] },
  { ad: "r2-triage.md", zorunlu: ["r2 -A", "rea_r2_", "radare2"] },
];
const ASGARI_KARAKTER = 500;

// README section heading (emoji + English) and links (repo-relative paths).
const BASLIK = "## 🎬 Example Sessions";
const LINKLER = OTURUMLAR.map((o) => `docs/example-sessions/${o.ad}`);

describe("docs/example-sessions: 3 session files", () => {
  it("directory and 3 files exist", () => {
    assert.ok(existsSync(DIZIN), `docs/example-sessions/ is missing (create the directory first)`);
    for (const o of OTURUMLAR) {
      assert.ok(existsSync(join(DIZIN, o.ad)), `${o.ad} is missing`);
    }
  });

  // Empty/cheap documents must not pass the gate: each file must meet the minimum length.
  it("each file is at least 500 characters", () => {
    for (const o of OTURUMLAR) {
      const md = readFileSync(join(DIZIN, o.ad), "utf8");
      assert.ok(
        md.length >= ASGARI_KARAKTER,
        `${o.ad} is too short (${md.length} < ${ASGARI_KARAKTER} characters)`,
      );
    }
  });

  // A session must contain its real tool commands (Ghidra/IDA/r2 names cannot be invented).
  it("each file contains its own real tool names", () => {
    for (const o of OTURUMLAR) {
      const md = readFileSync(join(DIZIN, o.ad), "utf8");
      for (const terim of o.zorunlu) {
        assert.ok(md.includes(terim), `${o.ad} must contain the real tool: ${terim}`);
      }
    }
  });
});

describe("README: Example Sessions section", () => {
  const readme = readFileSync(README, "utf8");

  it("has the ## 🎬 Example Sessions heading", () => {
    assert.ok(readme.includes(BASLIK), `README does not contain "${BASLIK}"`);
  });

  it("mentions all 3 session links", () => {
    for (const link of LINKLER) {
      assert.ok(readme.includes(link), `README is missing the link: ${link}`);
    }
  });

  // Broken-link gate: every linked file must actually exist on disk.
  it("all 3 README links resolve to real files", () => {
    for (const link of LINKLER) {
      assert.ok(existsSync(join(kok, link)), `README link is broken: ${link}`);
    }
  });
});
