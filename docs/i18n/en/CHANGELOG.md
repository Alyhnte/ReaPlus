# Changelog — rea-plus

All notable changes are kept in this file. Format: Keep a Changelog + SemVer.

## [0.12.0] — 2026-10-18

Release 0.12.0: dalga-11 — 4 task-template prompts (3 → 7) + golden
corpus (5 real gcc binaries) + portable node bundle + CLI guard realpath
fix + docs/site/tool-reference sync (191 tools · 187 outputSchema ·
191 annotations · 2 resources · 7 prompts, 6 languages). 103/103 tests green.

### Added

- 4 task-template prompts: `packer-triage`, `dotnet-malware-triage`,
  `android-triage`, `pe-crash-triage` (7 prompts total; `docs/PROMPTS.md`
  has 10 numbered sections, each with purpose + example call + expected
  output).
- Golden corpus: 5 real gcc binaries (PE32+/DLL/COFF obj) +
  `tests/corpus/HASHES.json` + deterministic rebuild script + 16 new
  sdk-surface tests (fs 14, scan_repo 10/pe5).
- Portable node bundle: `scripts/portable-paketle.mjs` (node-less
  distribution; prod-dependency closure, frida binding carried as a file,
  MANIFEST + smoke) + 7 tests; `publish.yml` release-artifacts step
  uploads the portable zip as a GitHub Release asset (linux bundle; CI
  runs ubuntu).
- `generate-tool-reference.mjs` CLI guard realpath fix: junction vs
  real path no longer a silent no-op (exit 0, no output) +
  `tests/generate-tool-reference-cli.test.mjs`.

### Fixed

- Current summary lines now say 7 prompts across 6 languages
  (TR/EN/DE/FR/ES + root): README, EXAMPLES, PROMPTS, ROADMAP;
  historical v0.10.0/CERRADO lines intentionally untouched (true then).
- TOOLS.md re-matched to the real surface (191/2/7) + site regen
  (5 languages × 7 pages).

## [0.11.0] — 2026-10-18

Release 0.11.0: 5-language i18n site + premium theme + sample sessions +
release provenance. Tool surface unchanged (191 tools + 2 resources +
3 prompts). 101/101 default tests green.

### Added

- 5-language site (TR/EN/DE/FR/ES): `scripts/site-uret.mjs` with i18n
  chrome + language switcher; 5 languages × 7 pages = 35 HTML.
- Premium site theme (scroll-reveal + light/dark toggle).
- Sample sessions (README "🎬 Örnek Oturumlar" + `docs/ornek-oturumlar/`:
  ghidra / ida / r2 — real output evidence, nothing fabricated).
- npm publish provenance (OIDC `--provenance`) + `release-artifacts`
  job: the CycloneDX SBOM becomes an automatic GitHub Release asset.
- CONTRIBUTING split into 6 H2 sections + `bug-raporu` / `ozellik-istegi`
  issue forms (GitHub issue-form schema).
- `site-uret.mjs --check` mode: 35-page asset/size/language validation,
  `exit(1)` on a broken file.

### Internal

- Waves 6–10 built in isolated worktrees with TDD; the full suite is
  green at the gate.

## [0.10.2] — 2026-10-16

Release 0.10.2: P2 distribution/quality waves + Mach-O depth + P3
research notes. Tool surface unchanged (191 tools + 2 resources +
3 prompts). 96/96 default tests green.

### Added

- Pages deploy workflow (`pages.yml`: main push → site-uret → deploy).
- Schema-budget CI step (200KB list / 110KB schema / 600B avg).
- Targeted fuzz harness (`scripts/fuzz-harness.mjs`: classification + report
  + `docs/FUZZ.md`; first run 0 crashes).
- Portable node bundle (`scripts/sea-portable.mjs` + `docs/SEA-DAGITIM.md`;
  no single-exe SEA due to 3 blockers).
- P3 feasibility notes (`docs/ARASTIRMA-*`: LLDB/TTD/angr WAIT, commercial DON'T).
- Contribution funnel (CONTRIBUTING expansion + good-first-issue form).

### Fixed

- `rea_macho_objc` fat-binary slice resolution (`arch` parameter + honesty
  ladder); IL2CPP v31+ keeps limited mode since it can't be verified offline.
- ROADMAP v0.10.1 sync (P1 closures processed).

## [0.10.1] — 2026-10-16

Release 0.10.1: P1 code items closed — dead-facade cleanup +
golden DEX fixture. Tool surface unchanged (191 tools + 2 resources +
3 prompts). 92/92 default tests green.

### Fixed

- Dead facade removed: `probeCache`/`parallelProbe` behavior moved
  into `workerCache` (`ResultCache` TTL + `runProbes`);
  `tests/probe.test.mjs` moved under `worker-cache.test.mjs`.
- Golden DEX fixture: `tests/corpus/mini.dex` (synthetic minimal DEX
  v035, deterministic generation via `scripts/dex-fixture-uret.mjs`) +
  `dex-golden` 7 tests + HASHES entry.
- Added `RepoScan` `.dex → dex/jadx` mapping.

## [0.10.0] — 2026-10-16

Release 0.10.0: 4 new tools (187→191), serialization queue, worker-cache
wiring, distribution readiness (SEA feasibility, manifests, SBOM, sandbox),
lasting quality (schema budget, docs site, prompt library, ObjC/IL2CPP/Go
depth). 187 `outputSchema`, 191 annotations. 91/91 default tests green.

### Added

- `rea_macho_objc/classdump`, `rea_il2cpp_methods`, `rea_go_buildinfo`.
- Full serialization (`REA_SESSION_SERIALIZE=1`, timestamp-evidenced).
- Live worker-cache wiring (reposcan path, counter-evidenced).
- SEA feasibility report + pilot script; winget/scoop/homebrew manifests.
- SBOM (CycloneDX) + `docs/SANDBOX.md` (Hyper-V/VirtualBox).
- Schema budget (measured thresholds), docs site (7 pages), `docs/PROMPTS.md`.

### Fixed

- POSIX jadx discovery (PATH scan + X_OK).
- Hopper POSIX similarity gate.
- cdb-async CI-Linux compatibility; corpus normalized.

### Not yet done

- Live Frida VM approval; self-hosted Windows runner.
- Dead-facade removal (probe-test dependency); P3 research.

## [0.9.0] — 2026-10-15

Release 0.9.0: 15 new tools take the default surface 172→187 (30 conduit + 157 rea),
keeping 183 `outputSchema` + 187 annotations; install ease (`setup`
wizard, `doctor --fix`) and a quality platform (parser fuzz smoke, HTTP e2e
by default, performance budgets, sample sessions + CONTRIBUTING) landed.
86/86 default tests green.

### Added

- 15 new tools (172→187): `rea_go_funclines`, `rea_go_goresym`,
  `rea_il2cpp_metadata`, `rea_il2cpp_dump`, `rea_bindiff_fonksiyonlar`,
  `rea_bindiff_karsilastir`, `rea_flutter_snapshot`, `rea_flutter_blutter`,
  `rea_macho_info`, `rea_macho_loads`, `rea_macho_otool`, `rea_pcap_oku`,
  `rea_scan_repo_paralel`, `rea_android_dinamik_recete`,
  `rea_android_recete_dogrula`.
- The `rea-plus-cli setup` wizard (client detection + config writing) and
  `doctor --fix` (approved install suggestion/execution).
- Parser fuzz smoke (`scripts/fuzz-parsers.mjs` + `parser-fuzz.test.mjs`;
  seeds from the read-only corpus, writes to tmpdir only).
- HTTP e2e moved into the default lane (`tests/e2e.http.mjs`).
- Performance budgets (`perf-budget.test.mjs`: tools/list + startup).
- Sample sessions (`docs/EXAMPLES.md` + `docs-examples.test.mjs`) and
  `CONTRIBUTING.md` (including corpus rules).

### Fixed

- Hopper POSIX similarity gate: a fake file that doesn't look like an
  executable bit/size doesn't count as Hopper, honestly returns
  `capability_unsupported`.
- The cdb async CI-Linux branch and corpus line-ending normalization (fixes
  carried over from 0.8.2) are locked in with regression tests on the
  187-tool surface.

### Not yet done

- Live Frida VM approval; self-hosted Windows runner.
- Single-file Windows exe (Node SEA); winget/scoop/homebrew manifests; SBOM.
- P3 research: LLDB engine, WinDbg TTD, symbolic execution (angr/Triton).

## [0.8.2] — 2026-10-15

Release 0.8.2: remaining schema coverage closed (168 `outputSchema`,
172 annotations, zero unannotated), the PDB downloader registered as the
172nd tool, session TTL and modern Roots MRTR landed, progress generalization
+ async whitelist grew to 3. Default surface 172 tools; opt-in: async +5
(177), queue +1 (173). 72/72 default tests green (including CI).

### Added

- 20 conduit + `rea_pdb_indir` `outputSchema` (168 total); annotations 172/172.
- `rea_pdb_indir` registration (Microsoft symbol server, integrity-checked,
  cached, `all` profile only).
- Session TTL (`REA_SESSION_TTL_MS`, default 30min, 0=off).
- Modern Roots MRTR (`inputRequired`/`inputResponses`); `list_changed` stays legacy.
- Progress stage helpers in 2 more tools; async whitelist at 3.

### Fixed

- cdb-async test CI-Linux compatibility (the `engine_unavailable` branch is accepted).
- Corpus hash line-ending normalization; `ornek.js` HASHES fix.

### Not yet done

- Live Frida VM approval; self-hosted Windows runner; permanent DEX corpus.
- P2 distribution ease; analysis depth; P3 research.

## [0.8.1] — 2026-10-14

Release 0.8.1: engine hardening (session queue, Frida timeouts, cdb async,
x64dbg provisioning), static honesty (browser scenario, FLIRT, Wasm/DWARF,
PE/PDB), behavior and scale (syscall matrix, single-call run, worker cache),
lasting test platform (golden corpus, 147 outputSchemas, progress
generalization). Default surface held at 171 tools; every addition is opt-in
or an honest-error improvement. 70/70 default tests green.

### Added

- Session FIFO queue (`REA_SESSION_QUEUE=1` opt-in, depth 32,
  `session_queue_status` tool; default 171 surface unchanged).
- Frida setup timeouts (attach 15s/script 10s/load 15s, env-overridable,
  `engine_timeout` with unload/detach cleanup on timeout).
- cdb async pause + push events (event loop never blocked, `pauseAsync` opt-in).
- x64dbg provisioning (`reaX64dbgDoctor` + `reaX64dbgSetup`, idempotent, hash-verified).
- Real browser-scenario runs (step-evidenced, dry-run mode,
  `capability_unsupported` without a backend).
- Syscall number matrix + CreateFileW/RegSet profiles.
- Single-call behavior run (`BehaviorRun`: spawn+trace+capture, mandatory
  timeout, crash honesty).
- Worker cache (LRU-100, hash-keyed, `REA_CACHE=0` bypass).
- Golden corpus manifest (`tests/corpus/HASHES.json` + `verify-corpus.mjs`).
- Progress generalization helpers (`createStageProgress`, `onAbort`).
- 27 new `outputSchema` (147 total: 137 rea + 10 conduit).

### Fixed

- jadx `-jar` hang: switched to the `-cp jadx.cli.JadxCLI` form; live APK
  acceptance passed (`com.zb.test`, 7 permissions, 5 classes, 2.2s).
- FLIRT misnomer: description and result carry `string-heuristic` + confidence score.
- WasmInfo multi-byte LEB + DWARF v5/abbrev_offset/multiple FORMs (negative
  sizes and fake empty summaries gone).
- PE `SizeOfOptionalHeader` + PeReader/PdbReader duplicated code merged; PDB
  download (cached, integrity-checked).

### Not yet done

- Live Frida VM approval; permanent DEX corpus (in-repo fixture); self-hosted Windows runner.
- Remaining 24 schema-less tools; progress generalization (sync handlers);
  trusted-publisher OIDC + provenance.

## [0.8.0] — 2026-10-14

Release 0.8.0: bigger MCP surface (resources/prompts, toolsets, typed
outputs), new security boundaries (workspace root, tokenless HTTP, audit),
async job + progress pilots for long jobs. The entries below describe this
release; external gates in "Not yet done" remain open.

### Added

- Tool reference: `docs/TOOLS.md` generated from the compiled server's real
  MCP surface (171 tools + 2 resources + 3 prompts). README and ROADMAP link
  to this reference.
- MCP resources: static, read-only `rea-plus://server-info` and
  `rea-plus://capabilities-safety` (expose no env values, personal paths,
  or file contents).
- MCP prompts: side-effect-free, text-only `packer-triage`,
  `dotnet-malware-triage`, and `android-triage` flows.
- `REA_TOOLSETS` profiles: unset/empty/`all` = 171 tools; `minimal` = 8,
  `static` = 98, `android` = 27, `dotnet` = 20, `web` = 26, `debug` = 50.
  Comma-separated spelling is a union; an unknown/empty profile does not
  silently fall back to `all`, it fails loudly at startup. Resources/prompts
  are not filtered.
- `REA_WORKSPACE_ROOT` working-root boundary: when set, `rea_*` path
  arguments, conduit `open_target`/`debug_open` paths, and user-visible
  derivative writes (`.unpacked`, `.extracted`, HAR output) are confined to
  the root, verified with realpath evidence; when unset, behavior is
  unchanged. Operator temp/cache surfaces are deliberate exceptions: the
  browser artifacts directory, Ghidra tmp project/input directories, the
  Hopper tmp request file, and the apktool framework cache are not forced
  inside the root.
- Tokenless HTTP read-only mode: when `DBG_BRIDGE_TOKEN` is unset, HTTP
  registers only a 44-tool, path-parameter-free read-only allowlist alongside
  the warning (the result is intersected with `REA_TOOLSETS`). Tokened HTTP
  and stdio keep the full (or toolset) surface. New/unlisted tools never
  appear on tokenless HTTP.
- `REA_AUDIT_LOG` (JSONL, on both transports): only `ts`, `transport`,
  `tool`, `durationMs`, `isError` per line. Arguments, tokens, paths, or
  target contents are never written; a write error disables auditing with a
  single warning and never crashes the server.
- HTTP limits: per-IP `REA_HTTP_RATE_LIMIT_PER_MIN` (default 120/min) and an
  active-request cap `REA_HTTP_MAX_CONCURRENT` (default 16); `429` when
  exceeded. A non-positive-integer value does not silently fall back to the
  default, it errors at startup.
- Type-safe outputs (partial base): 147 tools carry `outputSchema`, 169 tools
  have annotations; for results whose text JSON is a plain object,
  `structuredContent` carries the same value. Tools outside the schema set
  return schema-less text JSON; per-tool status is in `docs/TOOLS.md`. Schema
  coverage has not been extended to all 171 tools.
- Async job pilot: when `REA_ASYNC_JOBS=1`, 5 job tools
  (`rea_job_start/status/result/cancel/list`) register; the default surface
  stays at 171 tools, the opt-in surface is 176. The queue runs at most 2
  concurrent jobs, records are in-process, and today the whitelist contains
  only `rea_process_run`, which takes an AbortSignal; cancelling a running
  job kills the process tree.
- Roots pilot: with `REA_ROOTS=1` and on the legacy stdio path, client roots
  are pulled; roots can only narrow the `REA_WORKSPACE_ROOT` boundary. The
  modern protocol's MRTR flow is separate work and is not presented as
  supported.
- Progress/cancel pilot: `rea_process_run` sends the first notification
  without waiting and later ones at most ~20/sec;
  `notifications/cancelled` kills the child process tree. Other sync handlers
  are outside this pilot.
- Release readiness: registry name `io.github.Alyhnte/rea-plus` and the
  package `mcpName` are ready; the publish workflow was added only as a
  manually triggered, dry-run-by-default preparation (a real release requires
  an explicit `PUBLISH` approval).
- jadx bridge honesty (codebase): manifest package/permission/activity and
  class FQCN extraction rest on real parsing; a live jadx run is not evidence
  for this entry.
- Frida agent exception behavior (codebase): an exception that doesn't match
  the installed slot's address is no longer swallowed as a breakpoint — it is
  yielded back to the real flow with `false`.

### Not yet done

- npm release done: `rea-plus@0.8.0` on the registry, consumer install
  (`npm install` + stdio `initialize`/`tools/list` = 171) verified. MCP
  Registry listing done: `io.github.Alyhnte/rea-plus` is live (GHA + OIDC).
  Supported installs are `npx -y rea-plus` and GHCR.
- Live Frida VM approval is not complete; the Frida entry above does not
  count as live acceptance evidence.
- DEX golden APK acceptance test (live jadx + real APK) is not complete; the
  golden corpus gate stays open.

## [0.7.4] — 2026-10-13

Distribution patch: installing got easier for everyone else; a packaging bug
that locked consumers out is fixed. README rewritten from scratch (one-click
installs, architecture diagram, client matrix); the full roadmap is in
`docs/ROADMAP.md`.

### Fixed

- Playwright is now optional and lazily loaded. Previously, while it sat in
  `devDependencies`, product code statically imported it: everyone installing
  the package got `ERR_MODULE_NOT_FOUND` at startup. The server starts without
  Playwright; browser tools return `capability_unsupported`. For browsers:
  `npm i playwright && npx playwright install chromium`.

### Added

- The `prepare` script: git installs (`npx -y github:Alyhnte/ReaPlus`) build
  dist automatically.
- One-click install links (Cursor, VS Code) + client config samples: Claude
  Desktop/Code, Cursor, VS Code, Windsurf, Codex, opencode (`configs/`).
- `Dockerfile` + GHCR workflow: releases push the `ghcr.io/alyhnte/reaplus` image.
- `smithery.yaml` registry metadata; personal paths scrubbed from config samples.
- Visual README (badges, Mermaid architecture, env table, security model) and
  `docs/ROADMAP.md` (9 themes, prioritized full table).

## [0.7.3] — 2026-10-12

CI/portability patch: the default test set is now green outside the author's
machine too (clean Ubuntu CI, Node 20+22). The same generalization was applied
to product code: tool discovery uses only env + PATH, no machine-specific
hardcoded path remains.

### Fixed

- Test fixtures read the tracked in-repo corpus (`tests/corpus`, relative to
  `import.meta.url`) instead of personal Temp paths; `korpus-kur` refreshes
  only via the `REA_KORPUS_ELF`/`REA_KORPUS_PE` env.
- Presence probes account for `spawnSync` not throwing (`r.error`/status): on
  machines without mitmdump, product and tests now see the gate correctly (the
  13s fake proxy wait is gone too).
- Without tools, tests behave principledly: no wabt/upx/ilspy/dnfile/Chromium
  means a `capability_unsupported` assert or an honest skip; the UPX version is
  no longer pinned to 5.2.1.
- Product tool discovery generalized: `REA_UPX_BIN`, `REA_WABT_BIN`,
  `REA_AAPT2_BIN` + PATH; personal WinGet/`C:\tools` paths removed. .NET CIL
  python lookup tries `python`/`python3`/`py` in order (on Linux usually only
  python3 exists).
- Ghidra project dir under `os.tmpdir()` instead of a personal path; Ghidra
  tests assume no default install path (`REA_GHIDRA_DIR` required, live lane).
- CLI tests invoke node via `process.execPath`, not from PATH.
- The test runner prints a longer error tail for CI diagnosis.

### Verification

- Local: 43/43 in full-PATH and tool-less (narrow PATH) environments; runs from
  a different working directory are green too.
- CI: Ubuntu Node 20 + 22 green (the `fix/inceleme-duzeltmeleri` branch and main).

## [0.7.2] — 2026-10-12

Comprehensive review fixes: broken entry/publish paths, error envelope,
injection surfaces, fake `ok` results, and engine hardening. For interim
releases (0.2.0–0.7.1) see the `docs/release-v*.md` files.

### Fixed

- `npm start` now runs the real entry (`dist/server.js`); the previous target
  (`dist/facade/createReaPlusServer.js`) was a transport-less factory — the
  server never started.
- `npm test` runs `scripts/run-tests.mjs` instead of the old script pointing
  outside the repo; CI now really runs the default set (43 files).
- Error envelope: `ok:false` results and thrown errors from rea tools now reach
  MCP with `isError: true`; no more reporting as success.
- Build also copies runtime files (`frida-agent.js`, Ghidra `.py` scripts); the
  Frida engine no longer returns `engine_unavailable` in the published package.
  `prepublishOnly` added.
- Version collapsed to a single truth: `package.json`, `server.json`, `server.ts`
  all read 0.7.2.
- The Cutter `decompile` fallback ran analysis-free `pdf` and returned an empty
  `ok`; now it runs `aaa;pdf`, and empty output means `capability_unsupported`.
- `korpus-kur` preserves the tracked corpus when personal Temp sources are absent
  (won't crash CI); the idempotency test measures on the second run.

### Security

- Address inputs are validated in schemas and bridges (hex/number/symbol); r2/rizin
  command injection (`;`, `!` escaping) is closed.
- The radare2 cmd.exe path rejects meta characters; shutdown kills the process
  tree (no orphaned r2 grandchildren).
- `rea_jeb_sorgu` POSTs to loopback only by default; remote targets require
  `REA_JEB_ALLOW_REMOTE=1`, and link-local/metadata hosts are blocked in all cases.
- When the HTTP token is unset, the server warns loudly at startup (auth disabled).

### Honesty

- `rea_dotnet_metadata` used to call every PE .NET by looking at MZ alone; now
  the real CLR directory (DataDirectory[14]) is checked, no external reader
  required.
- `rea_pwn_elf_layout` returns `capability_unsupported` instead of a fake
  queued `ok`.
- `stdout_sha256_kısa` is now really SHA-256 (it was FNV-1a before); the fake PTY
  channel and pipe/PTY comparison are removed — the channel is honestly `pipe`,
  compare returns from the gate.
- `rea_net_capture` really targets the given localhost URL; the decoy server is
  set up only for `data:` input and is noted in the summary.

### Robustness

- Frida agent RPCs (`callAgent`, `describe`) have timeouts; a failed inject leaves
  no half-session (detach + map cleanup).
- Re-open/re-attach clears the old target's checkpoints; rewind can't write back
  to the wrong process.
- In a concurrent re-open race, the overwritten session's debugger is not orphaned
  (x64dbg/cdb/frida).

### Tests

- New: `tests/fixes-regression.test.mjs` (12 tests) locks these fixes in.
- Default set: 43 files / 321 its green. Live injection/debug and local Ghidra
  tests live under `npm run test:live` (VM/CI), not bulk-run on the main machine.

## [0.1.0] — 2026-10-12

First working package: conduit frozen, rea added on top.

### Added

- `src/conduit-core`: conduit verbatim, read-only. Frozen 30 tool names
  (`health`, `session_open/close/list`, `events_pull`, `static_info`,
  `open/close_target`, `disassemble`, `get_cfg`, `xrefs`, `strings`, `dump`,
  `debug_open/attach/close/state/breakpoint/continue/step/pause/registers/
  callstack/memory/code/thread/plugin/time`, `explain`, `prerequisites`).
  No renaming; the rule is locked by `toolNamespace.ts`.
- `src/facade`: 7 modules — `sessionRouter`, `toolNamespace`, `catalogMerge`,
  `createReaPlusServer`, `compactSchema`, `evidenceBundle`, `obligationLedger`.
  Prefix rule: every rea-origin tool is `rea_*` / `hopper_*` / `ghidra_*` /
  `jeb_*` / `evm_*` / `firmware_*` / `browser_*` / `adb_*`.
- `src/rea-domains`: 19 domain files (9 folders) — hopper, ghidra, ida, jeb,
  javascript (JsAnalyzer/ReconHarness/BinaryDiff), android (Jadx/Adb/Apktool),
  dotnet (ManagedInspector), wasm-evm (WasmEvmBridge/CrashTimeline/GoPwn/
  DosMips/NativeAot), firmware-browser (Firmware/Browser/ProcessCapture).
- `keccak`: offline EVM selector via `js-sha3` — `transfer(address,uint256)`
  → `0xa9059cbb`, `approve(address,uint256)` → `0x095ea7b3`.
  WAT export scanning is offline too; `capability_unsupported` without `wabt`.
- Tool count: 8 rea tools → 33+ total target; in this release the runnable
  server offers 30 conduit + 8 rea = 38 live tools (the 8 → 33 tool roadmap is
  locked). Unified catalog: 8 conduit + 9 rea = 17 entries (`mergedCatalog()`,
  Cutter added).
- Runnable server: `src/server.ts` → `dist/server.js` (bin: `rea-plus`).
  Transports: stdio (default) + `POST /mcp` and `GET /health` (stateless,
  `DBG_BRIDGE_TOKEN` bearer gate same as conduit).
- Configs: stdio + http JSONs under `configs/claude-desktop`, `configs/cursor`,
  `configs/opencode` (with the `<REA_PLUS_DIR>` placeholder explained).
- Tests: `tests/namespace.test.mjs` (prefix + collision lock) and
  `tests/reaplus.smoke.mjs` (keccak selectors + frozen=30 + catalog=17).
  Run: `node tests/namespace.test.mjs`, `node tests/reaplus.smoke.mjs`.
- Package hygiene: `server.json` (io.github.rea-plus), `LICENSE` (MIT 2026),
  `.gitignore`, `.npmrc`, CI workflow.

### Policy

- Missing capability = no stub, `capability_unsupported` + download suggestion.
- Live operations require `confirm:true`. HTTP localhost validation on.
