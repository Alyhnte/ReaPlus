# SEA / portable distribution (wave 4e) — Windows distribution without a system Node

## Decision: a portable Node bundle (not a single-file SEA)

Feasibility (`docs/SEA-FIZIBILITE.md`): a hello-world SEA was produced and it ran, but **3 obstacles to packing all of rea-plus into one exe are still open**. This wave ships what is realistic and records what is not. There is no fake `ok: true`.

## Status of the 3 obstacles (unchanged — all OPEN)

| # | Obstacle | Status | Measurement / reason |
|---|----------|--------|----------------------|
| 1 | The Frida native binding cannot be embedded | OPEN | `frida_binding.node` is **135,663,104 bytes** (~129.4 MiB). A `.node` file cannot be embedded in the SEA blob. The embed-then-write-then-`dlopen` path (an unsigned exe writing a `.node` into tmp) is an AV/EDR invitation |
| 2 | Playwright loads dynamically | OPEN | `await import("playwright")` plus external browser binaries cannot be embedded. The portable bundle leaves that package **outside**, so browser domains return `capability_unsupported` |
| 3 | Toolchain + signing | OPEN | `postject` is not present in this environment and a network download is forbidden. There is no code signing (an unsigned exe hits SmartScreen) |

Result: `MANIFEST.json` records `sea.tekDosya = { ok: false, neden: ... }`. Clause (f) of `tests/sea-paket.test.mjs` locks that honesty in.

## What is produced: the portable bundle

`node scripts/sea-portable.mjs` (after `npm run build`):

- Output: `dist-release/rea-plus-portable-<platform>-<arch>/` (and a `.zip` of the same name)
- Contents: a **copy** of the system `node.exe` (no download) + `dist/` + production `node_modules` + `package.json` / `server.json` / `configs/` + `rea-plus*.cmd` + `KULLANIM.txt` + `MANIFEST.json`
- Pruned (devDependencies): `playwright`, `typescript`, `@types` (plus `.bin` and `.package-lock.json`)

### Measured sizes (v0.10.1, win32-x64, Node v24.19.0)

| Piece | Size |
|-------|------|
| `node.exe` (copy) | 92,825,416 bytes (~88.5 MiB) |
| `frida_binding.node` (as a file) | 135,663,104 bytes (~129.4 MiB) |
| `dist/` (322 files) | ~1.95 MiB |
| Directory total (2852 files) | 266,264,159 bytes (~253.9 MiB) |
| `.zip` | 95,105,704 bytes (~90.7 MiB) |

## Steps (user / release)

1. `npm run build && node scripts/sea-portable.mjs`
2. Upload `dist-release/rea-plus-portable-win32-x64.zip` to the release
3. User: unzip, then `rea-plus-cli.cmd doctor` (environment report)
4. Smoke proof, using the bundled node: `analyze-evm transfer(address,uint256) --json` → `0xa9059cbb` (exit 0)

## Limits (not promised)

- There is NO single-file `rea-plus.exe` (the 3 obstacles above). That item stays open.
- It is not portable to another OS or architecture (`frida_binding.node` is platform-specific; each platform builds on its own machine).
- NO signature: SmartScreen may prompt on first launch.
- NO Playwright: browser domains return `capability_unsupported` plus an install hint.
- Tests: `node --test tests/sea-paket.test.mjs` (6 asserts) and the full `npm test` lane.
