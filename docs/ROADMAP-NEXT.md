# ROADMAP-NEXT — work after v0.17.0

Status: `main` is `4b6c359`. Surface is 200 tools, 197 output schemas, 200 annotations, 2 resources, 7 prompts. CI on that commit is green (Ubuntu, Node 20 and 22). Pages deployed. The `v0.17.0` tag's publish job failed in tests, so npm does not have this tree yet. de/fr/es/tr changelog and new tool entries through v0.17.0 are translated (`4b6c359`). `publish.yml` runs only on a `v*` tag and already requests npm provenance. Trusted Publisher and the Frida live VM are still external gates.

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

- angr/Triton symbolic execution (the VMProtect-class path; WSL plus conda). REAVM execution is in process. angr and Triton are **OPEN.**
- AFL++ on WSL. `rea_afl_fuzz` campaigns a REAFZ target in process. AFL++ itself is **OPEN.**
- A live IDA/Hopper bridge (license plus headless-API research). Hopper has no headless API. **OPEN** as gate-only.
- Live lldb and WinDbg TTD. REALDB stepping and REATD reading are in process. The external debuggers are **OPEN.**
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

## Closed waves 15–19

de/fr/es/tr translations through v0.17.0 landed on `4b6c359`. They are not a future wave.

### Wave 15 — closed in v0.13.1

English GitHub docs, the stale roadmap table, and English pages. Other languages were not translated.

### Wave 16 — closed in v0.14.0

`rea_pwn_elf_layout` reads ELF program headers (PIE, NX, RELRO). `rea_pwn_gadgets` keeps sequences that end in `ret`, `retn`, or `retf`. The Frida API script only attaches hooks and waits. `sniff.test.mjs` runs in the default test lane.

### Wave 17 — closed in v0.15.0

`addon.ts` reads the live Win32 process, token integrity, and a directory snapshot. It does not return a skeleton `ok`. `rea_aot_profile` and `rea_mips_psp_profile` set `details.iskelet: true`. The JS walk includes `.mts`/`.cts` and reads package `exports` before `main`.

### Wave 18 — closed in v0.16.0

`rea_electron_fuses`, `rea_electron_window`, `rea_apk_splits`, `rea_adb_pull`, and `rea_sqlite_snapshot` are on the `all` profile only. The surface is 196 tools and 193 output schemas.

### Wave 19 — closed in v0.17.0 as stdout probes; replaced in the working tree

v0.17.0 parsed `--version`. The working tree now executes REAVM, REAFZ, REALDB, and REATD. That replacement is not tagged.

Still external: a tag after this tree is committed and CI is green, the npm tarball hash, a Frida VM off this machine, a Windows runner, and Trusted Publisher.

## Next waves

Replanned under the working-code rule. A job that only looks finished does not count. No new tool unless it performs its whole task. Tests use a fixture whose expected numbers come from the bytes. `iskelet` stays `true` until every field in that success was parsed. Live Frida is not run on this machine. Hashes stay `bilinmiyor` until a real npm tarball is hashed. de/fr/es/tr stay on the previous translation until this queue is empty.

### Wave 20 — in-repo engines

Landed in the working tree, not tagged. See the wave 24 section below. Exit was `tests/wave19-research.test.mjs`.

### Wave 21 — headers and honest counts (this run)

No new tool.

1. English README and the English site say 200 tools, 170 `rea_*` tools, 197 schemas, 200 annotations. Async opt-in is 205. The old 191/161/192 sentences are gone.
2. `rea_aot_profile` reads a COR20 header through the PE section table. `major`, `minor`, `flags`, and `entryPoint` come from that header. A PE without a COM directory does not grow a `clr` object.
3. `rea_mips_psp_profile` reads an ELF32 MIPS header, including big-endian `e_flags` and `e_entry`. A non-ELF buffer does not grow an `elf` object.
4. `docs/TOOL-COVERAGE.md` lists `rea_adb_pull`, `rea_adb_install`, `rea_adb_screencap`, `rea_apktool_build`, and `rea_apktool_framework`, which the previous rows omitted.

`iskelet` stays `true` on both profiles. ObjC, Swift, and the JAL scan are still scans, not a load or a function list.

Exit: `node --test tests/wave25-headers.test.mjs` is green. A constant header fails the second fixture.

### Wave 22 — external, not run here

1. Frida live evidence only on a VM. Ubuntu stays without an injection test.
2. A self-hosted Windows runner for `npm test` and `tests/native-windows.test.mjs`. No Frida on that job until the VM rule is explicit.
3. Tag and npm publish only after this working tree is committed and that commit's CI is green. Hash the real tarball. Leave `bilinmiyor` if the download fails.
4. Trusted Publisher is an npm account setting.

Exit: a recorded VM result, a green Windows job, and a measured hash. None of these can be faked from this workstation.

### Wave 23 — still open, and only if the artifact is real

1. English README counts are done in wave 21. de/fr/es/tr counts wait until this queue is empty.
2. Do not generate TOOL-COVERAGE from `tools/list`. A name list is not coverage. The adb and apktool rows were corrected from the source. Other rows stay until each one is re-read.
3. A visual session only when a recorder is installed. No drawn GIF.
4. `rea_native_*` becomes an MCP tool only after the Windows job is green. A dump reader is not added until it parses a documented header and rejects a file without that header.

`iskelet` stays `true` until ObjC, Swift, and the JAL scan are parses rather than scans.

### Wave 24 — in-repo engines (landed in the working tree, not tagged)

The four tools no longer parse `--version`. Each reads a documented file and returns a result computed from that file. `tests/wave19-research.test.mjs` builds the file and asserts the count those bytes imply. External angr, AFL++, lldb, and WinDbg are still not scheduled.

1. `rea_angr_explore` symbolically executes REAVM and forks on a symbolic JZ.
2. `rea_afl_fuzz` mutates a REAFZ seed one byte at a time and returns the executions and crashes it observed.
3. `rea_lldb_script` steps a REALDB image to the breakpoint named in the script.
4. `rea_ttd_info` reads module names from a REATD trace. A truncated file returns `capability_unsupported` and no count.

Exit: `node --test tests/wave19-research.test.mjs` is green, and a constant reply fails at least one fixture.

### Not scheduled

- Single-file SEA. The Frida binding, dynamic Playwright, and signing still block it. The portable Node bundle remains the ship path.
- Triton, and unpack recipes for commercial protectors. Not started without a file format and a fixture that is not a protected sample on this machine.
- Store submission for winget, scoop, or Homebrew. Wave 20 measures hashes first.
