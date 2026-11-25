# AIRGAP — offline package roadmap (rea-plus WP6)

> Runs fully offline. No network calls, no telemetry.
> Every module returns a `capability_unsupported` gate. It never invents a result in silence.

Current release is v0.13.0 (191 tools, 187 `outputSchema`, 191 annotations, 2 resources, 7 prompts). This note is the offline package shape, not a claim that every later roadmap item has shipped.

## 1. Scope

- `wasm-evm`: DOS/MIPS, NativeAOT, and crash-timeline skeletons.
- `javascript`: version diff and recon-harness skeletons.
- `skill-pack`: investigation-flow references (native / js / apk / web).

## 2. Package contents

| Package | Contents | Network requirement |
|---|---|---|
| `core` | pure TypeScript bridges | none |
| `docs` | AIRGAP + `docs/ONERILER.md` | none |
| `skill` | `SKILL.md` references | none |

## 3. Install (air-gap)

1. Carry the package on USB and check the hash (`sha256sum`).
2. Install dependencies with `npm ci --offline`.
3. If `REA_WABT_BIN` is unset, the wasm decode gate stays closed.
4. Run tests offline: `npm test -- --offline`.

## 4. Capability gates

- If `REA_WABT_BIN` is unset, `rea_wasm_decode` stays closed.
- If the raw bytes are shorter than 64, the DOS/MIPS gates return `capability_unsupported`.
- On a PE input with no signature, the AOT gates return `capability_unsupported`.
- If the crash record is empty, the timeline gate returns `capability_unsupported`.
- If the function list is empty, the diff gate returns `capability_unsupported`.

## 5. Checks

- [ ] `DosMipsBridge` stays in the 40–60 line range.
- [ ] `NativeAotBridge` stays in the 40–60 line range.
- [ ] `CrashTimeline` stays in the 40–60 line range.
- [ ] `BinaryDiff` and `ReconHarness` stay in the 40–60 line range.
- [ ] No file imports the network (`fetch` and `axios` are forbidden).
- [ ] Turkish source comments stay in place. This docs wave does not translate code comments.

## 6. Limits

- Keccak/selector is not a real hash here; the placeholder is FNV.
- VLQ decode and CLR header parsing were left for after WP4d.
- The harness draft does not guarantee that the generated C compiles.
- Still open, and not part of this offline package: Electron fuses, split-APK, adb file transfer, SQLite snapshot, the scoped package `exports` field, a `.mts`/`.cts` walk, visual sessions, and automatic TOOL-COVERAGE.
