// contributing.test.mjs: Wave-9 — contribution funnel verification (CONTRIBUTING
// sections + issue templates). METHOD: raw text/regex + structural YAML checks;
// the repo has no js-yaml and no new dependency is added (tradition:
// ci-schema-adim.test.mjs). Read-only: only fs reads, no network/timer/process.
// Run: `node tests/contributing.test.mjs` (single file) or `npm test` (full suite).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));
const oku = (rel) => readFileSync(join(kok, rel), "utf8");

// Required H2 sections in CONTRIBUTING.md (number optional: the old
// `## 1) Setup` form is also accepted).
const BOLUMLER = [
  ["Setup", /^##\s+(?:\d+\)\s+)?Setup\s*$/m],
  ["Tests", /^##\s+(?:\d+\)\s+)?Tests\s*$/m],
  ["Code Style", /^##\s+(?:\d+\)\s+)?Code Style\s*$/m],
  ["Wave Rules", /^##\s+(?:\d+\)\s+)?Wave Rules\s*$/m],
  ["PR Flow", /^##\s+(?:\d+\)\s+)?PR Flow\s*$/m],
  ["Release", /^##\s+(?:\d+\)\s+)?Release\s*$/m],
];

// Field types allowed by a GitHub issue form (an out-of-schema type does not
// make the YAML valid; GitHub rejects the form).
const IZINLI_TIPLER = new Set(["markdown", "textarea", "input", "dropdown", "checkboxes"]);

const SABLONLAR = [
  {
    dosya: ".github/ISSUE_TEMPLATE/bug-report.yml",
    ustAnahtarlar: ["name", "description", "title", "labels", "body"],
    baslik: /^title:\s*"\[bug\] "/m,
    baslikNotu: 'title: "[bug] " prefix is required',
    etiket: /^labels:\s*\[\s*"bug"\s*\]/m,
    etiketNotu: 'labels: ["bug"] is required',
    alanlar: ["Steps to reproduce", "Expected behavior", "Actual behavior", "Environment"],
    zorunluAlanlar: ["Steps to reproduce", "Expected behavior", "Actual behavior", "Environment"],
  },
  {
    dosya: ".github/ISSUE_TEMPLATE/feature-request.yml",
    ustAnahtarlar: ["name", "description", "title", "labels", "body"],
    baslik: /^title:\s*"\[feature\] "/m,
    baslikNotu: 'title: "[feature] " prefix is required',
    etiket: /^labels:\s*\[\s*"enhancement"\s*\]/m,
    etiketNotu: 'labels: ["enhancement"] is required',
    alanlar: ["Problem statement", "Proposed solution", "Alternatives"],
    zorunluAlanlar: ["Problem statement", "Proposed solution"],
  },
];

// Existing template that must exist and stay structurally valid.
const MEVCUT_SABLON = ".github/ISSUE_TEMPLATE/good-first-issue.yml";

function tirnakDengeli(satir) {
  let adet = 0;
  for (let i = 0; i < satir.length; i++) {
    if (satir[i] === "\\") { i++; continue; }
    if (satir[i] === '"') adet++;
  }
  return adet % 2 === 0;
}

// Structural YAML check (comments + simple key/list sets).
// No js-yaml; the goal is to catch invalid YAML such as tab indentation,
// unbalanced quotes, odd indentation, undefined lines, and duplicate top-level keys.
function yamlDenetle(ad, metin, ustAnahtarlar) {
  const satirlar = metin.split(/\r?\n/);
  const ustSeviye = [];
  let oncekiGirinti = -1;
  satirlar.forEach((ham, i) => {
    const no = i + 1;
    if (ham.trim() === "" || /^\s*#/.test(ham)) return;
    assert.ok(!ham.includes("\t"), `${ad}:${no} must not contain tabs (YAML does not accept tab indentation)`);
    const girinti = ham.length - ham.replace(/^ +/, "").length;
    assert.equal(girinti % 2, 0, `${ad}:${no} indentation must be even (2-space layers): ${ham.trim()}`);
    assert.ok(tirnakDengeli(ham), `${ad}:${no} unbalanced double quotes: ${ham.trim()}`);
    const liste = /^ *- \S/.test(ham);
    const anahtar = /^ *([A-Za-z0-9_][A-Za-z0-9_."'-]*):(\s|$)/.test(ham);
    if (!liste && !anahtar) {
      assert.ok(
        oncekiGirinti >= 0 && girinti > oncekiGirinti,
        `${ad}:${no} undefined line (neither list, key, nor continuation): ${ham.trim()}`,
      );
    }
    if (girinti === 0) {
      const m = ham.match(/^([A-Za-z0-9_]+):/);
      if (m) ustSeviye.push(m[1]);
    }
    oncekiGirinti = girinti;
  });
  for (const k of ustAnahtarlar) {
    const kac = ustSeviye.filter((x) => x === k).length;
    assert.equal(kac, 1, `${ad}: top-level '${k}' key must appear exactly once (found: ${kac})`);
  }
}

// Split the blocks under `body:` (each block is one form field).
function govdeBlokleri(metin) {
  const i = metin.search(/^body:\s*$/m);
  assert.ok(i >= 0, "body: key must exist");
  return metin
    .slice(i)
    .split(/\n(?= {2}- type: )/)
    .filter((b) => /^ {2}- type: /m.test(b));
}

describe("CONTRIBUTING.md sections", () => {
  const md = oku("CONTRIBUTING.md");

  for (const [ad, re] of BOLUMLER) {
    it(`## ${ad} section exists`, () => {
      assert.match(md, re, `CONTRIBUTING.md must contain a '## ${ad}' heading`);
    });
  }

  it("documents setup + test commands", () => {
    assert.match(md, /npm ci/, "CONTRIBUTING.md must contain the 'npm ci' step");
    assert.match(md, /npm run build/, "CONTRIBUTING.md must contain 'npm run build'");
    assert.match(md, /npm test/, "CONTRIBUTING.md must contain the 'npm test' command");
    assert.match(md, /npm run typecheck/, "CONTRIBUTING.md must contain 'npm run typecheck'");
    assert.match(
      md,
      /node --test tests\//,
      "CONTRIBUTING.md must contain the single-file test command",
    );
  });

  it("wave rules cover worktree + TDD + commit/push + ornek.js restore", () => {
    assert.match(md, /worktree/i, "CONTRIBUTING.md must mention worktree isolation");
    assert.match(md, /TDD/, "CONTRIBUTING.md must mention the TDD rule");
    assert.match(
      md,
      /git restore[^\n]*tests\/corpus\/ornek\.js/,
      "CONTRIBUTING.md must contain the ornek.js restore rule",
    );
  });
});

describe("issue templates — file presence", () => {
  for (const s of SABLONLAR) {
    it(`${s.dosya} exists`, () => {
      assert.ok(existsSync(join(kok, s.dosya)), `${s.dosya} must exist`);
    });
  }

  it(`${MEVCUT_SABLON} exists (unchanged)`, () => {
    assert.ok(existsSync(join(kok, MEVCUT_SABLON)), `${MEVCUT_SABLON} must be preserved`);
  });
});

describe("issue templates — structural YAML", () => {
  for (const s of SABLONLAR) {
    it(`${s.dosya} has a valid YAML structure`, () => {
      assert.ok(existsSync(join(kok, s.dosya)), `${s.dosya} must exist`);
      yamlDenetle(s.dosya, oku(s.dosya), s.ustAnahtarlar);
    });
  }

  it(`${MEVCUT_SABLON} has a valid YAML structure (read-only check)`, () => {
    assert.ok(existsSync(join(kok, MEVCUT_SABLON)), `${MEVCUT_SABLON} must exist`);
    yamlDenetle(MEVCUT_SABLON, oku(MEVCUT_SABLON), ["name", "description", "title", "labels", "body"]);
  });
});

describe("issue templates — form fields", () => {
  for (const s of SABLONLAR) {
    it(`${s.dosya} title prefix and label`, () => {
      const metin = oku(s.dosya);
      assert.match(metin, s.baslik, `${s.dosya}: ${s.baslikNotu}`);
      assert.match(metin, s.etiket, `${s.dosya}: ${s.etiketNotu}`);
    });

    it(`${s.dosya} body field types are in the GitHub schema`, () => {
      const metin = oku(s.dosya);
      const tipler = [...metin.matchAll(/^\s{2}- type:\s*(\S+)\s*$/gm)].map((m) => m[1]);
      assert.ok(tipler.length >= s.alanlar.length, `${s.dosya}: not enough fields in body`);
      for (const t of tipler) {
        assert.ok(IZINLI_TIPLER.has(t), `${s.dosya}: disallowed field type '${t}'`);
      }
    });

    for (const alan of s.alanlar) {
      it(`${s.dosya} has the '${alan}' field`, () => {
        const metin = oku(s.dosya);
        assert.match(metin, new RegExp(`label:\\s*"${alan}"`), `${s.dosya}: a field labeled '${alan}' is required`);
      });
    }

    for (const alan of s.zorunluAlanlar) {
      it(`${s.dosya} field '${alan}' is required`, () => {
        const blok = govdeBlokleri(oku(s.dosya)).find((b) => b.includes(`label: "${alan}"`));
        assert.ok(blok, `${s.dosya}: block '${alan}' must exist`);
        assert.match(blok, /required:\s*true/, `${s.dosya}: '${alan}' must have validations.required: true`);
      });
    }
  }
});
