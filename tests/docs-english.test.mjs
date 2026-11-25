// docs-english.test.mjs: Wave 15 — GitHub-facing markdown must be English prose.
// Turkish-specific letters outside fenced blocks and inline code fail the gate.
// docs/i18n/** and docs/site/** are not on this allowlist and are not scanned.
// Run: node --test tests/docs-english.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));

// Fixed allowlist. Paths are repo-relative. i18n and site trees are excluded.
const ALLOWLIST = [
  "README.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "docs/ROADMAP.md",
  "docs/TOOLS.md",
  "docs/PROMPTS.md",
  "docs/EXAMPLES.md",
  "docs/SANDBOX.md",
  "docs/SEA-DAGITIM.md",
  "docs/SEA-FIZIBILITE.md",
  "docs/AIRGAP.md",
  "docs/FUZZ.md",
  "docs/WSL.md",
  "docs/VERIFY.md",
  "docs/MCP-CONTRACTS.md",
  "docs/ONERILER.md",
  "docs/IMPROVEMENTS-DETAILED.md",
  "docs/PLAN-HEPSI.md",
  "docs/COVERAGE-GAPS.md",
  "docs/ARASTIRMA-TTD.md",
  "docs/ARASTIRMA-LLDB.md",
  "docs/ARASTIRMA-TICARI-ENTEGRASYONLAR.md",
  "docs/ARASTIRMA-ANGR-TRITON.md",
  "docs/morluto-rea-karsilastirma.md",
  "docs/ROADMAP-NEXT.md",
  "docs/GHIDRA.md",
  "docs/DETECTION.md",
  "docs/TOOL-COVERAGE.md",
  "src/skill-pack/SKILL.md",
  "src/skill-pack/references/android-applications.md",
  "src/skill-pack/references/evidence-workflows.md",
  "src/skill-pack/references/javascript-applications.md",
  "src/skill-pack/references/native-and-artifacts.md",
  "src/skill-pack/references/runtime-observation.md",
  "src/native-windows/README.md",
  "tests/corpus/README.md",
  "docs/example-sessions/ghidra-analysis.md",
  "docs/example-sessions/ida-comparison.md",
  "docs/example-sessions/r2-triage.md",
];

const TURKISH = /[ğĞıİöÖüÜşŞçÇ]/u;

function proseLines(md) {
  const lines = md.split(/\n/);
  const out = [];
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = line.match(/^(`{3,}|~{3,})/);
    if (open) {
      const mark = open[1][0];
      const width = open[1].length;
      if (!fence) fence = { mark, width };
      else if (fence.mark === mark && open[1].length >= fence.width) fence = null;
      continue;
    }
    if (fence) continue;
    out.push({ n: i + 1, text: line.replace(/`[^`\n]*`/g, "") });
  }
  return out;
}

describe("GitHub-facing markdown is English prose", () => {
  it("allowlist files exist and contain no Turkish letters outside code", () => {
    const hits = [];
    for (const rel of ALLOWLIST) {
      assert.ok(!rel.replace(/\\/g, "/").includes("docs/i18n/"), `${rel} must not scan i18n`);
      assert.ok(!rel.replace(/\\/g, "/").includes("docs/site/"), `${rel} must not scan site`);
      const abs = join(kok, rel);
      assert.ok(existsSync(abs), `missing allowlist file: ${rel}`);
      const md = readFileSync(abs, "utf8");
      for (const { n, text } of proseLines(md)) {
        const m = text.match(TURKISH);
        if (m) hits.push(`${rel}:${n}: ${JSON.stringify(m[0])} in ${text.trim().slice(0, 160)}`);
      }
    }
    assert.deepEqual(hits, [], `Turkish letters outside code:\n${hits.join("\n")}`);
  });
});
