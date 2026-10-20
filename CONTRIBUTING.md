# Contributing Guide

Issues and PRs are welcome — bug reports, feature ideas, and docs. The flow below
expands the short section in the README; CI fails when the rules are broken.

Forms: under `.github/ISSUE_TEMPLATE/`, use `bug-report.yml` (bugs),
`feature-request.yml` (features), and `good-first-issue.yml` (small starter
tasks) — pick the right form instead of opening an empty issue.

## Setup

```bash
git clone https://github.com/Alyhnte/ReaPlus.git
cd ReaPlus
npm ci                 # clean install (same as CI)
npm run build          # tsc + runtime assets -> dist/
```

Requirement: Node.js ≥ 20. Ghidra/rizin/jadx/Frida tooling is optional —
a missing backend returns `capability_unsupported` plus an install hint; never
fake a result for a tool that is not installed. Run
`node dist/cli/index.js doctor` for a map of your machine.

Isolate your work from the main project (see **Wave Rules**): work in a separate
worktree (`git worktree add ../ReaPlus-<topic> -b <topic>`) and run `npm ci`
there; `npm ci` also runs `build` during `prepare`.

## Tests

```bash
npm run typecheck      # tsc --noEmit, required before a PR
npm test               # default lane (excludes live injection/debugger,
                       # packet capture, and browser; run those in a VM/CI job)
npm run test:live      # everything — only in a VM or a dedicated CI job
node --test tests/<area>.test.mjs   # single-file run
```

A single-file run gives the fastest feedback: make that test red first, then
move to the full suite (`npm test`). CI (`.github/workflows/ci.yml`, Ubuntu,
Node 20 + 22) runs the same gates: `npm ci` → `typecheck` → `build` → `test`.

Rules:

- Every file is capped at 90s; do not leave hanging processes or timers (the
  process-tree kill saves you, but write it deliberately).
- When adding examples/output, take the numbers from a real run; follow the
  `docs/EXAMPLES.md` + `tests/docs-examples.test.mjs` pattern.
- `tests/corpus/ornek.js` is a text file: LF/CRLF churn is normal; restore it
  with `git restore -- tests/corpus/ornek.js` after the test run.
- Do not leak personal paths or home directories in tests/docs (use
  `tmpdir()`; do not assert absolute paths).
- New fixture: follow `tests/corpus/README.md` (file + sha256 +
  `HASHES.json` + `verify-corpus`); a file missing from the manifest fails the
  `corpus-manifest` test.

### Corpus rules (`tests/corpus/`)

Canonical source: `tests/corpus/README.md`. Summary:

1. Put the file in this directory.
2. Compute its sha256 digest.
3. Add an entry to `HASHES.json` with `source` + `license` fields (write
   `"unknown"` when unknown; never invent a license).
4. Verify with `node scripts/verify-corpus.mjs` — exit `0` on success; a
   missing/mismatched/unmanifested file is reported by name with exit `1`
   (`HASHES.json` and `README.md` are not fixtures).
5. A file that is not added to the manifest does not pass the tests
   (`tests/corpus-manifest.test.mjs`).

Notes:

- `tests/corpus/ornek.js` is a text file: LF/CRLF churn is normal; restore it
  with `git restore -- tests/corpus/ornek.js` after the test run.
- Do not leave hand-edited or unmanifested files under `tests/corpus/*`.

## Code Style

- **File names use `kebab-case`**: `bug-report.yml`, `docs-examples.test.mjs`,
  `verify-corpus.mjs`. Test file pattern: `<topic>.test.mjs`.
- **Function and variable names use `camelCase`**; do not change class/constant
  spellings (e.g. `REA_PLUS_VERSION`) — the `version-sync` test is binding.
- **TypeScript `strict: true`** (`tsconfig.json`): do not escape tests with type
  holes (`any`, `@ts-ignore`); throw an honest error instead.
- **Comments explain "why" only**: a comment that restates what the code does is
  noise; do not write comments that omit the reason.
- Language consistency: docs, templates, and user-facing messages are English;
  code comments and internal logs follow the language of the surrounding file.

## Wave Rules

Parallel waves work in separate worktrees of the same repo; rules:

- **Worktree isolation**: each wave works in its own worktree (`wave-<n>/<topic>`
  branch); do not touch main or another wave's worktree. Run `npm ci` in your
  worktree and finish the work there.
- **Only your own scope**: change only the files you were assigned. If another
  wave is touching a likely-conflict file (e.g.
  `.github/ISSUE_TEMPLATE/good-first-issue.yml`, `docs/TOOLS.md`,
  `.github/workflows/`), leave it alone.
- **TDD is mandatory**: new behavior and bug fixes are test-first; red → green →
  refactor. Going green by loosening a test is forbidden (see **TDD rule**).
- **commit / push only by the main agent**: a wave agent leaves the changed files
  in place and reports the test result; it does not commit or push.
- **`tests/corpus/ornek.js` gets dirty**: the test run converts the file to LF
  (churn is normal); clean it with
  `git restore -- tests/corpus/ornek.js` before finishing.

### TDD rule

New behavior and bug fixes are written test-first: a failing test (red), then
the smallest implementation (green), then cleanup (refactor). Going green by
loosening a test is forbidden.

```bash
node --test tests/<area>.test.mjs   # single-file run, e.g. tests/corpus-manifest.test.mjs
npm run typecheck                     # tsc --noEmit, required before a PR
npm test                              # default lane (node scripts/run-tests.mjs)
```

- Take new example/output numbers from a real run; follow the
  `docs/EXAMPLES.md` + `tests/docs-examples.test.mjs` pattern.
- Every file is capped at 90s; do not leave hanging processes or timers.
- Do not leak personal paths or home directories in tests/docs (use `tmpdir()`;
  do not assert absolute paths).

## PR Flow

1. **Create a branch**: `wave-<n>/<topic>` (fixes `fix/...`, docs `docs/...`).
2. **Work in a worktree**: in your isolated tree (Wave Rules); do not touch the
   main project.
3. **TDD**: red test first, then the smallest green implementation.
4. **Green tests**: `npm run typecheck` + `npm test` must pass locally; include
   the output (`npm test` summary) in the PR description as test evidence.
5. **PR**: small and single-topic; description + test evidence are required.
6. **Review → merge**: address comments and merge after CI is green.

Additional rules:

- CI (`.github/workflows/ci.yml`, Ubuntu, Node 20 + 22) runs the same gates:
  `npm ci` → `typecheck` → `build` → `test`.
- Do not touch or break these:
  - The 30 conduit core tool names are frozen
    (`src/facade/toolNamespace.ts`); renaming is forbidden.
  - `docs/TOOLS.md` is not edited by hand — generate it with
    `node scripts/generate-tool-reference.mjs`; the `tool-reference` test
    catches drift.
  - New tools fail honestly (`capability_unsupported`, never a fake `ok`);
    live-mutation calls require `confirm:true`.
- If you are looking for a `good-first-issue`: small consistency work such as
  README/ROADMAP number sync or the corpus provenance table is an ideal first PR.

### `good-first-issue` label + first PR

The label means a small, single-topic task that maintainers consider suitable
for newcomers. Use the `good-first-issue` label filter on the Issues tab to find
them.

Suitable task criteria:

- PR-sized and single-topic.
- Does not require live injection/debugger, packet capture, a browser, or
  network downloads; does not add a new tool name (the 30 conduit core tool
  names are frozen — `src/facade/toolNamespace.ts`).
- If it adds a corpus fixture, it follows the corpus rules.
- Classic examples: README/ROADMAP number sync, completing the corpus provenance
  table, docs copy consistency.

Proposal form: `.github/ISSUE_TEMPLATE/good-first-issue.yml` — fill in the task
description, acceptance criteria, area, related file, and "newcomer suitability"
boxes; maintainers apply the label based on the form.

First PR steps:

1. `npm run typecheck` + `npm test` must be green locally.
2. Small, single-topic PR + description + test evidence (`npm test` output).
3. Do not touch: `docs/TOOLS.md` (generated by
   `node scripts/generate-tool-reference.mjs`), conduit tool names, or existing
   CI workflows (`.github/workflows/`).

## Release

Release authority belongs to the maintainers; contributors are limited to PRs.

- **Trigger**: push a `v*` tag — `.github/workflows/publish.yml` (the only
  trigger; the manual publish workflow is retired).
- **Order**: gates (`npm ci` → `typecheck` → `build` → `test` → publish check) →
  `npm publish --access public` (`NPM_TOKEN`) → poll until the version appears on
  npm (10 min cap) → MCP Registry publish (`server.json` validate + GitHub OIDC).
- **Dry run**: `node scripts/publish-kontrol.mjs` (`npm pack --dry-run`; does not
  publish, validates package contents). `prepublishOnly` already runs
  `npm run build`.
- **SBOM**: `node scripts/sbom-uret.mjs` → `sbom.json` (CycloneDX).
  `tests/dagitim-manifest.test.mjs` automatically verifies version + component
  consistency; regenerate the SBOM when you bump the version or the full suite
  fails.
- **Version sync**: `package.json` `version` is the single authority;
  `package-lock.json`, `server.json`, and `REA_PLUS_VERSION` under `src/**` must
  match it (`tests/version-sync.test.mjs`). Update `CHANGELOG.md` +
  `docs/release-v*.md` together with the release notes.
