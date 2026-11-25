# ROADMAP-NEXT — deep work after v0.11.0

Status: ReaPlus carries the public rea capabilities that were ported (191 tools, 2 resources, 7 prompts). Commercially licensed tools stay gated (Hopper/IDA/JEB). Linux-only tools are documented (binwalk). Closed in v0.11.0: a 5-language site plus `--check`, text example sessions, npm OIDC provenance plus an SBOM release asset, Pages deploy, CONTRIBUTING, and issue forms. Closed in v0.12.0: the golden corpus (5 real gcc binaries plus 16 tests), 4 task-template prompts (7 prompts total), a portable node bundle (plus a release asset), and a docs/site sync.

v0.13.0 is the current release. v0.14.0 is not tagged in this worktree. CI is `ubuntu-latest` only. `ci.yml` runs `tests/schema-budget.test.mjs`. `pages.yml` deploys. `publish.yml` runs `npm publish --provenance`. Trusted Publisher account setup is still an external gap. Frida live VM approval is still open.

## Items from the previous revision — closed with evidence (count of 2026-10-18)

- ~~NEXT-1 `rea_investigate` orchestration~~ → **CLOSED**: `src/facade/investigate.ts` (60 lines) plus the `sniff` / `confidence` / `evidenceBundle` / `readiness` / `missingReasons` facades. Registration at `src/server/registerReaTools.ts`. Schema in `toolMetadata.ts`. `tests/investigate.test.mjs`, `evidence.test.mjs`, `sniff.test.mjs`, `confidence.test.mjs`, and `readiness.test.mjs` are green. Prompts already call `rea_investigate(path)`. (It entered in the v0.5.0 full port; the file had gone stale.)
- ~~NEXT-2 `rea_typedef` type spread~~ → **CLOSED**: the `rea_typedef_oner` tool is registered under `src/rea-domains/typedef/TypeSpread.ts`. `tests/typedef.test.mjs` is green.
- ~~NEXT-3 syscall plus file/registry trace~~ → **CLOSED** (v0.10.0, ROADMAP section F: ntdll number mapping plus CreateFileW/RegSet profiles plus a single-call behavior run).
- ~~NEXT-4 `rea_scan_repo` repository scan~~ → **CLOSED**: `rea_scan_repo` plus `rea_scan_repo_paralel` (pool of 4, cancel) in `src/rea-domains/reposcan/RepoScan.ts`. `tests/reposcan.test.mjs` and `parallel-scan.test.mjs` are green.
- ~~NEXT-6 Android dynamic~~ → **CLOSED** (v0.10.0: a 5-step generated recipe plus a dry check).

## 1. Correctness: golden corpus → CLOSED (v0.12.0)

5 real gcc binaries (`tests/corpus/real_tiny*.exe`, `real_dll.dll`, `real_tiny.obj`) plus `HASHES.json` plus a deterministic compile script plus 16 new sdk-surface tests (fs 14, scan_repo 10/pe 5). The corpus regression is live. Further files can be added later if someone asks.

## 2. Full MCP service: task templates → CLOSED (v0.12.0)

Four task-template prompts landed (`packer-triage`, `dotnet-malware-triage`, `android-triage`, `pe-crash-triage`). The total is **7 prompts** (`elf-linux-triage`, `binary-diff`, and `evidence-report` are the other three). `docs/PROMPTS.md` has 10 numbered sections (goal, sample call, expected output). The evidence envelope is up (`src/facade/evidenceBundle.ts` plus `tests/evidence.test.mjs`).

## 3. Long term (heavy — a research/L effort, not a code wave yet)

- angr/Triton symbolic execution (the only real path for the VMProtect class; WSL plus conda). **OPEN.**
- Fuzzing harness (AFL++ on WSL). A Node fuzz harness exists. AFL++ itself is **OPEN.**
- A live IDA/Hopper bridge (license plus headless-API research). Hopper has no headless API. **OPEN** as gate-only.
- An LLDB engine (Linux/macOS) and WinDbg TTD reading (ROADMAP section D, P3). **OPEN.**
- asciinema/GIF example sessions (ROADMAP section I, P1). The render tool is not installed. README has text transcripts. Visual recording waits on a tool install. **OPEN.**

## Open external gates (P0 — not a code wave; user or infrastructure setup)

- Frida live VM exception approval. **OPEN.**
- A self-hosted Windows runner (Frida/debug tests do not run in CI). CI is `ubuntu-latest` only. **OPEN.**
- npm Trusted Publisher (OIDC). Provenance exists (`npm publish --provenance`). The Trusted Publisher account setup does not. **OPEN.**

## Priority order

Research/L (angr, fuzzing, IDA, LLDB) after the external gates (Frida VM, self-hosted runner, Trusted Publisher). Schema-budget CI and Pages deploy are already closed. They are not in this queue.

---

## Wave plan (groups of four; each job is an isolated worktree plus TDD; a full test run at the end of a wave, then the next four)

### Wave 11 — 3 jobs → CLOSED (v0.12.0, all three)

1. Golden corpus — `tests/corpus/` plus `HASHES.json` plus 16 tests (`63e775f`).
2. Prompt task templates — 4 templates, 7 prompts total (`d5ef760`).
3. Portable bundle — `scripts/portable-paketle.mjs` plus 7 tests plus a publish.yml release asset (`a0ea39b`, merge `582b9b2`).

### Wave 12 — release plus doc sync → CLOSED (v0.12.0, `9fd2057`)

4. Closed: README plus ROADMAP sync, CHANGELOG (5 languages), the v0.12.0 bump, manifests (winget/scoop/brew), SBOM, site regen, then tag `v0.12.0`, then watch CI/publish. Evidence: CI publish/ci/pages 3/3 SUCCESS; npm `rea-plus@0.12.0`; release assets `0.12.0.zip` plus `sbom.cdx.json`. The v0.11.0 and v0.12.0 release notes were repaired (BOM/mojibake cleanup, 2026-10-19).

### Last job of that period → CLOSED (2026-10-19; the v0.12.0 period)

5. Closed: the `github.com/morluto/rea` comparison (6.1.0 through 6.7.0, 26 merged PRs, the last commit wave). The full table is `docs/morluto-rea-karsilastirma.md`. v0.13.0 later closed several of those rows; the comparison file says which ones.

### Wave 13 — behavioral B-list → CLOSED (2026-10-19; the v0.12.0 period)

6. B3 JS resolution — `rea_js_require` spec classification plus relative/`node_modules` resolution (a safe walk), and `rea_js_export_shape` for the CJS export shape (`6c7d403`). The scoped package `exports` field and `.mts`/`.cts` were **not** part of this close.
7. B2 plist fidelity — type-aware lossless value reading plus `details.anahtarTipleri` (`6a21424`).
8. B5 map guard — `analyze-js` directory-versus-file gate, with a clear error (`9805553`).
9. B1 sniff machine identity — ELF `e_machine` to `makine` (LE/BE, at least 20 bytes, Hexagon included) (`dd3acf1`).

Evidence: 4/4 branch merges (`fa9fcbd` through `38f7dcf`). Full suite **104/104 PASS**. Surface held at 191 tools / 187 schemas (no new tool). Schema budget 176598 B list / 92353 B schema (limits 204800/112640). B4+ (wider version-sync) and the remaining candidates went to wave 14.

### Wave 14 — version carriers plus B4 → CLOSED (v0.13.0)

10. B4 wider version-sync — README/i18n/site/CHANGELOG/dist manifest carriers locked with 9 checks. Stale 0.8.2/0.9.0/0.10.1 values were pulled forward (`a2f0c5d`).
11. PE machine identity — `rea_sniff` ARMNT (`0x01c4`) / ARM64 (`0xaa64`). x86/x64 and legacy ARM/Thumb/ARM64EC are deliberately out of scope (`79e44c9`).
12. Ghidra admission — a raw m68k language profile (`GhidraRawProfil`), a pure module outside the tool surface. Parity with upstream 6.6.0 (`79e44c9`).
13. apktool version observation — `surumGozlem {ham, sayisal?}` (advisory; not evidence). A broken line does not emit the field (`aca9fba`).
14. JS cross-bundle — `iliskiler {paylasilanKaynaklar, yalnizA, yalnizB}`, deterministic order. No new tool (`0de3ef7`).

Evidence: 4/4 branch merges (`081d6b3` through `55226c0`). Full suite **107/107 PASS**. Surface held at 191 tools / 187 schemas (no new tool). v0.13.0 release.

---

## Remaining plan

de/fr/es/tr translations of the new English happen once after wave 19, not on each wave.

### Wave 15 — closed in v0.13.1

English GitHub docs, the stale roadmap table, and English pages. Other languages were not translated.

### Wave 16 — closed in v0.14.0

`rea_pwn_elf_layout` reads ELF program headers (PIE, NX, RELRO). `rea_pwn_gadgets` keeps sequences that end in `ret`, `retn`, or `retf`. The Frida API script only attaches hooks and waits. `sniff.test.mjs` runs in the default test lane.

### Wave 17 — closed in v0.15.0

`addon.ts` reads the live Win32 process, token integrity, and a directory snapshot. It does not return a skeleton `ok`. `rea_aot_profile` and `rea_mips_psp_profile` set `details.iskelet: true`. The JS walk includes `.mts`/`.cts` and reads package `exports` before `main`.

### Wave 18 — not done

Electron fuses plus BrowserWindow constants, split-APK, adb pull with fake adb output, and a SQLite snapshot. New tools land only in the `all` profile.

### Wave 19 — not done

Real angr/Triton, AFL++, LLDB, and WinDbg TTD integrations. They return `capability_unsupported` when the dependency is absent, and they work when the dependency is present.

Still open across these waves, and not closed by wave 15: Frida live VM approval, the self-hosted Windows runner, the SEA single-file exe, Trusted Publisher account setup, asciinema, LLDB, WinDbg TTD, angr, AFL++, Electron fuses, split-APK, adb file transfer, SQLite snapshot, visual sessions, and automatic TOOL-COVERAGE.
