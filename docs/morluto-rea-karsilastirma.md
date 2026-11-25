# morluto/rea compared with ReaPlus

Date of the original pass: 2026-10-19. That pass compared ReaPlus `v0.12.0` (`9fd2057`) with upstream `rea-agents-6.7.0` (the latest release then). Sources: a live `gh` API read (releases, merged PRs, commits) plus ReaPlus grep evidence (2026-10-18/19).

Status revised for v0.13.0 (191 tools, 187 `outputSchema`, 191 annotations, 2 resources, 7 prompts). The tool count did not change. v0.14.0 is not tagged. Rows that shipped are marked closed below. Rows that did not ship stay open.

## 1. Upstream releases (6.1.0 through 6.7.0) against ReaPlus

| rea release | Highlights | ReaPlus status |
|---|---|---|
| **6.7.0** (18 Oct) | Duplicate-member semantics: setup edits the last JSON/JSONC member (the one the client reads). Contains 6.6.0 (a tag that was not published to npm) | The setup/client-config surface does not exist in ReaPlus, so this is unrelated |
| **6.6.0** (18 Oct) | **571 commits / 236 merged PRs**: Kuna SA provider; retained JS facts (paging plus row Evidence); multi-locale APK table; Ghidra Windows ARM PE (ARMNT/ARM64) plus raw m68k; JADX deadline env; Electron window options; about 40 fix categories (partial-fact retention, JS resolution, Apple plist, ADB, MCP contracts, SQLite/WASM/packet) | CLOSED in v0.13.0: PE ARMNT/ARM64, raw m68k, plist fidelity, apktool advisory. Still open: Electron fuses and BrowserWindow constants, SQLite snapshot, scoped package `exports`, `.mts`/`.cts` walk. Kuna stays optional and unwired. Breaking changes were upstream-internal; ReaPlus keeps its own Evidence schema |
| **6.5.0** (14 Oct) | JS cross-bundle relationship recovery; retained Evidence summary/paging; SQLite snapshot, packet/signal, WASM, Rust dep metadata, Electron fuses offline inspect | JS: `rea_js_sourcemap` plus `rea_js_bundle_diff` are present. **Cross-bundle recovery CLOSED in v0.13.0** (`iliskiler`). SQLite snapshot is still absent. Electron fuses are still only a session-router type, not an offline fuse read. Those two stay open |
| **6.4.0** (11 Oct) | Android: device inspection, **split-APK**, log, **screenshot**, **file transfer**, lifecycle, plus Apktool manifest/localized strings; JEB unit browse; large analysis summaries | `AdbBridge` install/logcat/screencap plus `ApktoolBridge` are present. **split-APK is still absent. adb file transfer is still only the Frida recipe, not `adb pull`.** Screenshot stays on the firmware-browser side. Those stay open |
| **6.3.0** (9 Oct) | BREAKING: capture accounting plus web-diff accessibility/storage dimensions; typed JSON shape paths | That capture/web-diff surface is **absent** here (domain split), so this is unrelated / low risk |
| **6.2.0** (9 Oct) | BREAKING: canonical Evidence (`normalized_result`), migration-6.2.md; `always-bump-minor` | The Evidence facade has its own schema and does not adopt the upstream wrapper. That split is deliberate |
| **6.1.0** (9 Oct) | BREAKING: Hopper regex to ECMAScript Unicode plus a 5s cancel worker; `set_current_document` removed; Grok Build/Bot setup | `rea_hopper_tara(regexMi)` is present. `set_current_document` is **already absent** here (no collision). Unicode/worker deadline coverage differs. Watch it |

## 2. Recent merged PRs and the ReaPlus counterpart

### The 6.1–6.5 window (17 PRs, 17–18 Oct)

| rea PR | Topic | In ReaPlus |
|---|---|---|
| #4944 | strict JSON for Claude Code config | **absent** (0 hits). No setup surface. Unrelated |
| #4937 | signed 64-bit TOML int, lossless | No TOML parse. Unrelated |
| #4930/#4824/#4796 | CI capacity/cache/plist test infrastructure | Upstream-specific CI. Unrelated |
| #4839 | plist negative-zero reals | **CLOSED in v0.13.0**: type-aware lossless plist values. The old "simple XML key/string only" gap is closed |
| #4838 | CommonJS bare **scoped** package dir resolution | **PARTIAL.** CJS require resolution (relative and `node_modules`) shipped. The scoped package `exports` field and a `.mts`/`.cts` walk stay open |
| #4819 | **EM_HEXAGON (164) ELF** | **CLOSED in v0.13.0.** ELF `e_machine` includes Hexagon (`makine` on the sniff result) |
| #4823 | spaced output flag values (upstream CLI) | ReaPlus CLI has its own parser. Low risk (not re-verified) |
| #4804/#4771 | Apktool locale-table sharing plus Evidence subject | `ApktoolBridge` exists. Shared-locale decode coverage was not re-verified. Watch it. Version observation (advisory) **CLOSED in v0.13.0** |
| #4791 | Android class page filter perf | The ADB surface here is different. Unrelated |
| #4814/#4803/#4792 | test/docs/launcher alias | note |

### The 6.6.0–6.7.0 window (9 new merges, 18 Oct)

| rea PR | Topic | In ReaPlus |
|---|---|---|
| #5126 | fix(setup): empty APPDATA treated as unset (VS Code/Trae/Devin) | setup domain. Unrelated |
| #4954 | feat(analysis-view): environment manifest from a web capture | No web capture in ReaPlus. Unrelated |
| #5041 | fix(hopper): repair the Linux embedding runtime | Commercially licensed gate. Watch it |
| #5017 | perf(hopper): reuse decoded records | Watch it |
| #5021/#5018 | fix(tests): Android prerequisite / fixture ownership | Upstream test infrastructure. Unrelated |
| #5002 | docs(jeb): Linux CE workflows | Commercial license. Watch it |
| #4990 | perf(apktool): avoid a duplicate primary string | `ApktoolBridge` string dedupe still to be checked. Watch it |
| #4983 | chore(release/6.7.0) | — |
| #4957 | fix(setup): duplicate JSON member (the one the client reads) | setup domain. Unrelated |

### Commits after 6.7.0 (18–19 Oct, about 15 commits)

Partial-fact retention discipline (fs snapshot, uninstall, native routes, reference comparison), symlink-race protection, cancellation provenance, MCP procedure aliases, scoped unknowns. ReaPlus `evidenceBundle` follows the same idea. Small adaptation candidates are watched and were not re-verified.

## 3. Bug candidates (grep-backed, then revised)

| # | Candidate | Evidence | Effect |
|---|---|---|---|
| B1 | ELF **Hexagon** unrecognized | **CLOSED v0.13.0.** `e_machine` maps to `makine`, little- and big-endian, at least 20 bytes, Hexagon included | Qualcomm firmware recognition gap is closed |
| B2 | plist does not read real numeric/CFNumber values | **CLOSED v0.13.0.** Type-aware lossless values | Numeric keys in an iOS bundle are no longer dropped silently |
| B3 | CommonJS bare scoped package is not resolved | **PARTIAL.** Require walk shipped. The `exports` field and `.mts`/`.cts` walk are still open | `@scope/pkg` through `exports`, and `.mts`/`.cts`, can still be missed |
| B4 | Silent version staleness | **CLOSED.** Version-sync carriers locked with 9 checks in v0.13.0 | A regression would show up in `tests/version-sync.test.mjs` |
| B5 | A **directory** named `*.map` can be treated as a source map | **CLOSED in wave 13.** `analyze-js` has a directory-versus-file gate | Misclassification of that shape is closed |

## 4. Port / add candidates, with v0.13.0 status

1. **JS cross-bundle recovery** (6.5.0) — **CLOSED v0.13.0.**
2. **Wider JS resolution** (6.6.0): scoped package, `main`, JSON require, `.mts`/`.cts`, `Object.defineProperty` exports. Require resolution shipped. **Still open: the `exports` field and the `.mts`/`.cts` walk.** Do not treat the rest of this bullet as fully closed; `main`, JSON require, and `defineProperty` exports were not re-audited for this note.
3. **Android package** (6.4.0/6.6.0): **apktool advisory CLOSED.** **split-APK and adb file transfer stay open.** Multi-locale decode and method-body bytecode recovery were not re-audited.
4. **Apple plist numeric fidelity** (6.6.0) — **CLOSED v0.13.0.** Exact int, negative zero, non-finite, and OpenStep are the fidelity that shipped as type-aware lossless values.
5. **Hexagon ELF `e_machine`** (#4819) — **CLOSED v0.13.0.**
6. **Wider Ghidra admission**: Windows ARM PE (ARMNT/ARM64) plus a raw m68k profile (6.6.0) — **CLOSED v0.13.0.**
7. **SQLite snapshot inspect** (6.5.0) — **OPEN.** No surface yet.
8. **Electron**: offline fuse read (6.5.0) plus `BrowserWindow` constant resolution (6.6.0) — **OPEN.**
9. **Kuna provider bridge** (6.6.0, caller-installed) — **OPEN** (optional).
10. **Apktool version advisory** (6.6.0) — **CLOSED v0.13.0.** The version is reported as an observation, not as evidence.

## 5. ReaPlus updates through v0.13.0

v0.12.0: `63e775f` golden corpus (5 real gcc binaries plus 16 tests). `d5ef760` four task-template prompts (7 total). `a0ea39b` plus `582b9b2` plus `6d67eaf` portable bundle and the release-asset chain. `0c16da6` docs sync to 191/2/7 (6 languages) plus a CLI guard realpath fix. `9fd2057` release.

v0.13.0 closed the static rows named above and locked version carriers (9 checks). The surface stayed 191 tools / 187 schemas / 191 annotations / 2 resources / 7 prompts. `ci.yml` runs `tests/schema-budget.test.mjs`. `pages.yml` deploys. `publish.yml` uses `npm publish --provenance`. Trusted Publisher account setup is still an external gap. Frida live VM approval is still open. CI is `ubuntu-latest` only.

## 6. Release-note cleanup (2026-10-19)

- `v0.11.0` body: the leading CP437-mojibake BOM (`´╗┐`) and 2 broken em dashes (the sequence that rendered as `ÔÇö`) were removed.
- `v0.12.0` body: the leading U+FEFF (BOM) was removed.
- Check: both bodies start at code point `#` (35), suspicious=0. Source: node plus `gh release edit --notes-file` (independent of the PowerShell UTF-16/BOM trap).

## 7. Still open on purpose

Electron fuses, split-APK, adb file transfer, SQLite snapshot, the scoped package `exports` field, a `.mts`/`.cts` walk, visual sessions, automatic TOOL-COVERAGE, Frida live VM approval, a self-hosted Windows runner, Trusted Publisher account setup, a SEA single-file exe, asciinema, LLDB, WinDbg TTD, angr, and AFL++. de/fr/es/tr translations of new English wait until after wave 19.
