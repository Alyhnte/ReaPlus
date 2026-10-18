# ROADMAP — ReaPlus roadmap

> Status: v0.10.1 released (npm + MCP Registry + green CI). This document was
> born from the findings of the first 2026-10-12 review and is synced with
> what actually shipped at the end of every wave. v0.10.1 closed the P1 code
> items (dead facade cleanup + golden DEX fixture); the tool surface is
> unchanged. Numbers come from the compiled server's real surface (the
> [`TOOLS.md`](TOOLS.md) generation output).
>
> **Scales:** Impact = contribution to user/agent value · Effort = S (days) / M (1-2 weeks) / L (month+) · Priority = P0 (outer gate) → P3 (long term).

## Closed on the v0.10.0 baseline (summary)

- MCP surface: 191 tools + 2 resources + 7 prompts; generated full reference [`TOOLS.md`](TOOLS.md).
- `REA_TOOLSETS` profiles: `all` 191 (default), `minimal` 8, `static` 98, `android` 27, `dotnet` 20, `web` 26, `debug` 50; comma-separated union, unknown profile is a startup error. New tools land in `all` only (fail-closed).
- `REA_WORKSPACE_ROOT`: `rea_*` + conduit paths + user-visible derived writes stay inside the root; operator temp/cache surfaces are a deliberate exception. Roots (legacy + modern MRTR) only narrows.
- Tokenless HTTP: 44 read-only-tool allowlist (intersected with toolset) + `REA_AUDIT_LOG` (argument-free JSONL) + rate limit (120/min) + concurrency cap (16) + session TTL (30min).
- Type base: 187 `outputSchema`s, 191 annotations (zero unannotated; 4 tools permanently schema-less).
- Async jobs (5 tools, 177→192 surface) + session FIFO queue + full serialization + worker cache + progress generalization.
- Engine hardening: Frida setup timeouts, cdb async pause+push, x64dbg provisioning, jadx `-cp` fix + live APK acceptance.
- Static honesty: browser scenario, FLIRT, Wasm/DWARF, PE/PDB, Mach-O, IL2CPP/Go/Flutter, binary diff, PCAP/TLS, Android recipe.
- Install: `setup` wizard + `doctor --fix`; manifests (winget/scoop/brew) + SBOM + sandbox recipe; SEA feasibility.
- Quality: golden corpus manifest, fuzz smoke (CI), e2e by default, perf + schema budgets, docs site + prompt library.
- Release: `rea-plus@0.10.0` on npm, `io.github.Alyhnte/rea-plus` on the MCP Registry, tag chain (npm→wait→registry) with a single trigger. **Live Frida VM approval remains an open gate** (not closed below).

## Closed with 0.7.2 + 0.7.3 (summary)

- Fixed broken `npm start`/`npm test`, version mismatch, and runtime assets not copied to dist.
- Fixed the error envelope (`isError`), the address-injection gate, tools returning fake `ok`, Frida timeout/half-session, and cross-session checkpoint writes.
- Default test suite is green outside the author's machine too (portable fixtures, honest tool gates, zero personal paths); CI Ubuntu Node 20+22 green.
- Install: git install via `prepare`, one-click Cursor/VS Code links, Dockerfile + GHCR workflow, client config samples.

## A) Distribution and install

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Publish to npm (`rea-plus`) | CLOSED (v0.8.0, chain v0.9.0+): `rea-plus@0.10.0` on the registry; tag chain (npm→wait→registry, single trigger) | Install is one command: `npx -y rea-plus` | S | — |
| ✅ MCP Registry listing (`mcp-publisher`) | CLOSED (v0.8.0, chain v0.9.0+): `io.github.Alyhnte/rea-plus` live | Discoverability in the official catalog | S | — |
| ✅ Push the GHCR image with the first release | CLOSED (v0.7.4): tags published for `ghcr.io/alyhnte/reaplus` and anonymous pullability verified | Zero-install for Docker users | S | — |
| ✅ `rea-plus-cli setup` wizard | CLOSED (v0.10.0): client detection + confirmed writes + `.bak` + dry-run; tested only under a temp HOME | Biggest friction removed | M | — |
| ✅ `doctor --fix` | CLOSED (v0.10.0): confirmation-gated install suggestion (winget/brew/apt); never runs unconfirmed | One command for a missing tool | M | — |
| ◐ Single-file Windows exe (Node SEA) | FEASIBILITY DONE (v0.10.0): hello-world SEA ran; full app blocked by 3 obstacles (129MB Frida binding, dynamic playwright, signing) — alternative: portable node bundle | Node-less distribution; as a release asset | M | P2 |
| ✅ winget/scoop/homebrew manifest | CLOSED (v0.10.0): three manifests versioned + hashed; no store submission | Discovery via package managers | S | — |
| ◐ Signed release + SBOM | PARTIAL (v0.10.0): SBOM (CycloneDX) generated; no signature + provenance/Trusted Publisher | Supply-chain trust | S | P2 |

## B) MCP protocol and agent experience

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Toolset profiles (`REA_TOOLSETS=static,debug`) | CLOSED: `all` 191, `minimal` 8, `static` 98, `android` 27, `dotnet` 20, `web` 26, `debug` 50; comma-separated union, unknown profile is a startup error, resources/prompts unfiltered | Smaller tool-list context, better hits | S | — |
| ✅ Resources | CLOSED: 2 static read-only resources (`rea-plus://server-info`, `rea-plus://capabilities-safety`); no arbitrary file/env exposure, no subscribe | Server identity + safety rules readable via URI | M | — |
| ✅ Prompts | CLOSED: 3 side-effect-free prompts (`packer-triage`, `dotnet-malware-triage`, `android-triage`); a prompt runs no tool, returns only sequenced flow text | Ready triage flows in one pick | S | — |
| ✅ `outputSchema` + `structuredContent` | CLOSED (v0.10.0): 187 tools with `outputSchema` (4 permanently schema-less); on plain-object results `structuredContent` equals the text JSON — per-tool status in [`TOOLS.md`](TOOLS.md) | Type-safe consumption | M | — |
| ✅ Progress reporting + cancel | CLOSED (v0.10.0): stage helpers + 3 staged tools; sync handlers out of scope (documented) | Agent sees progress, can cancel | M | — |
| ✅ Tool annotations | CLOSED (v0.10.0): 191 annotations (zero unannotated) | Client approval UX | S | — |
| ✅ Async job model (start → poll) | CLOSED (v0.10.0): 5 job tools (192 surface); 3-item whitelist; cancel kills the process tree | Long jobs polled without blocking | M | — |
| ✅ Roots support | CLOSED (v0.10.0): legacy + modern MRTR; workspace never widens on any path | Workspace narrows automatically | S | — |
| ✅ Session queue + serialization | CLOSED (v0.10.0): FIFO-32 + `REA_SESSION_SERIALIZE` (timestamp-evidenced), timeout+cancel preserved | Races end | M | — |

## C) Security

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Workspace root restriction (`REA_WORKSPACE_ROOT`) | CLOSED: `rea_*` + conduit paths + derived writes inside the root via realpath; operator temp/cache excepted | Prompt-injection surface closed | M | — |
| ✅ Read-only mode on tokenless HTTP | CLOSED: 44-tool allowlist without a token; intersected with toolset | Open port rendered harmless | S | — |
| ✅ Audit log (JSONL) | CLOSED: per line `ts`/`transport`/`tool`/`durationMs`/`isError`; no secrets written | Incident review | S | — |
| ✅ Rate limit + concurrency + session TTL | CLOSED: 120/min + 16 concurrent + 30min TTL; invalid value is a startup error | Resilience + hygiene | S | — |
| ✅ Sandbox recipe (VM profile doc) | CLOSED (v0.10.0): `docs/SANDBOX.md` (Hyper-V + VirtualBox, snapshot + restore) | Ready isolated environment | S | — |

## D) Debugger engines

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Session queue + serialization | CLOSED (v0.10.0): FIFO-32 + full serial mode; timeout+cancel preserved | Races end | M | — |
| ◐ Real exception reporting in the Frida agent | CODE + LOCK DONE, LIVE GATE OPEN: off-slot `false`, setup timeouts; no live Frida VM approval | Real crashes become visible | S | **P0** (live VM) |
| ✅ Frida attach/createScript/load timeouts | CLOSED (v0.10.0): 15/10/15s + env override + cleanup-bearing `engine_timeout` | Hangs end | S | — |
| ✅ cdb: async pause + real push events | CLOSED (v0.10.0): event loop never blocked, push to subscribers | Multi-session comfort | M | — |
| ✅ x64dbg plugin auto-provisioning | CLOSED (v0.10.0): doctor + setup, idempotent + hash-verified | Setup friction gone | M | — |
| LLDB engine (Linux/macOS) | Live debugging is Windows-only | Wider platform coverage | L | P3 |
| Reading WinDbg TTD traces | Missing | Time-travel analysis | L | P3 |

## E) Static domains (depth and honesty)

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Real jadx manifest/class fields | CLOSED (v0.10.0): `-cp` fix + real-APK parity + POSIX discovery scan | Trustworthy Android output | S | — |
| ✅ Browser scenario | CLOSED (v0.10.0): steps really run + evidenced + dry-run | Works as named | M | — |
| ✅ FLIRT honesty | CLOSED (v0.10.0): `string-heuristic` + confidence score | Trust | S | — |
| ✅ Wasm/DWARF | CLOSED (v0.10.0): multi-byte LEB + v5/abbrev_offset | Real summary | S/M | — |
| ✅ PE + PDB | CLOSED (v0.10.0): real headers + download + cache | Correct names + symbols | S/M | — |
| ✅ Mach-O/iOS | CLOSED (v0.10.0): pure TS + fat + ObjC listing | Apple targets | M | — |
| ✅ IL2CPP/Go/Flutter | CLOSED (v0.10.0): counts + mapping + snapshot; honest branch when tool is missing | RE depth | L | — |
| ✅ Binary diff | CLOSED (v0.10.0): added/removed/changed + streaming | Patch analysis | M | — |
| ◐ Real Hopper bridge | RESEARCH DONE: NO headless API (from official sources) → honest as request-preparation; POSIX similarity gate added | Real data where licensed | L | P3 |

## F) Behavior and dynamic analysis

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Syscall matrix + CreateFileW/RegSet | CLOSED (v0.10.0): ntdll number mapping + access profiles | Deep report | S | — |
| ✅ Single-call behavior run | CLOSED (v0.10.0): spawn+trace+capture, mandatory timeout, crash honesty | Profile in one call | M | — |
| ✅ PCAP + TLS keylog | CLOSED (v0.10.0): stream reassembly + keylog decryption; undecryptable stays `sifreli` | C2 traffic readable | M | — |
| ✅ Android dynamic recipe | CLOSED (v0.10.0): 5-step generation + dry validation; missing tools flagged | Mobile starting point | M | — |
| Symbolic execution (angr/Triton, WSL) | Missing | The only real path in the VMProtect class | L | P3 |
| Fuzzing harness (AFL++ WSL) | Missing | Crash hunting in target parsers | L | P3 |

## G) Scale and performance

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Live worker-cache wiring | CLOSED (v0.10.0): reposcan path counter-evidenced | Fast repeats | M | — |
| ✅ Dead facade cleanup (`probeCache`/`parallelProbe`) | CLOSED (v0.10.1): behavior moved to `workerCache` (`ResultCache` TTL + `runProbes`); `probe.test.mjs` moved under `worker-cache.test.mjs` | Dead code gone | S | — |
| ✅ Parallel scan (pool of 4) | CLOSED (v0.10.0): ordered merge + cancel + error isolation | CI integration | M | — |
| ✅ Schema budget | CLOSED (v0.10.0): measured thresholds (200KB/110KB/600B) | Bloat ends | S | — |
| Schema-budget CI enforcement | Test exists, no CI step | Budget breaks in CI | S | P2 |
| ✅ Streaming reads | CLOSED (v0.10.0): 64KB buffer + stop on cancel | OOM ends | M | — |

## H) Tests and quality

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Golden corpus manifest | CLOSED (v0.10.1): `tests/corpus/mini.dex` (synthetic minimal DEX v035, `scripts/dex-fixture-uret.mjs`) + `dex-golden` 7 tests + HASHES entry | Regressions caught early | M | — |
| Self-hosted Windows runner | Frida/debug tests don't run in CI | Riskiest surface verified continuously | M | P0 |
| ✅ Parser fuzz CI smoke | CLOSED (v0.10.0): deterministic mutation, crash/hang=0 | Silent bug classes caught | M | — |
| ✅ HTTP e2e in the default suite | CLOSED (v0.10.0): removed from LIVE, no flakes | Transport regressions visible | S | — |
| ✅ Performance budgets | CLOSED (v0.10.0): measured thresholds, median method | Accumulation ends | S | — |

## I) Documentation and community

| Proposal | Current state / gap | Impact | Effort | Priority |
|---|---|---|---|---|
| ✅ Automatic tool reference | CLOSED (v0.10.0): [`TOOLS.md`](TOOLS.md) from the real surface (191 tools + 2 resources + 3 prompts) | Current catalog | S | — |
| Example sessions (asciinema/GIF) in README | No visual proof | Convince in the first 10 seconds (star conversion) | S | P1 |
| ◐ Docs site | GENERATED (v0.10.0): 7 static pages + 0 broken links | Searchable docs | M | P2 |
| Pages deploy (site ready, not published) | `docs/site/` generated but not wired to GitHub Pages | Docs at a single URL | S | P2 |
| ✅ Prompt library | CLOSED (v0.10.0): `docs/PROMPTS.md` (10 prompts with sample calls) | First value within minutes | S | — |
| good-first-issue + CONTRIBUTING expansion | Single paragraph | Contribution funnel opens | S | P3 |

---

**Suggested order (open items):** live Frida VM → runner → trusted publisher → example sessions → Pages deploy → P3 research.
Closed in v0.10.1: dead facade cleanup + golden DEX corpus (marked ✅ above); closed in v0.10.0: all of waves I/J/K.
