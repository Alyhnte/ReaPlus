# SEA feasibility (wave J/1) — can we ship without a system Node?

## Decision: yes at hello-world level (proven) — 3 obstacles remain for all of rea-plus

A hello-world SEA was built and executed with Node 24 win-x64. The path to one exe for all of rea-plus is open, but the Frida native binding, Playwright's dynamic load, and a size past ~230 MB are practical obstacles. Do not promise "rea-plus.exe" until those obstacles are cleared. The single-file exe stays open.

## Evidence (2026-10-16, Node v24.19.0 win-x64, in a temp directory)

| # | Experiment | Result | Value |
|---|------------|--------|-------|
| 1 | `node --experimental-sea-config` blob generation | PASS | blob 63 bytes |
| 2 | Inject into a copy of node.exe with postject | PASS | `sea-hello.exe` 92,952,064 bytes |
| 3 | Run the produced exe | PASS | output `SEA-HELLO-OK` (exit 0) |
| 4 | The current sentinel fuse is present in the binary | VERIFIED | `NODE_SEA_FUSE_...5df1996b2` @89987191 |
| 5 | The old sentinel (`...ac052938`) is absent in this build | VERIFIED | not found (a wrong fuse means an injection error) |
| 6 | `--build-sea` (exe in one step) | ABSENT | requires v25.5+; v24 needs postject |

Trap: injecting with the sentinel from older documentation raises `Could not find the sentinel`. The correct fuse is in the current Node docs.

## Obstacles for rea-plus

1. **Frida native binding (the largest obstacle).** `node_modules/frida/build/frida_binding.node` is 135,663,104 bytes (~129.4 MiB). A `.node` file cannot be embedded in the SEA blob. The Node docs method is: embed it as an asset, write it to a temp directory on first run, then `process.dlopen`. Result: the "single file" drops a file beside itself on first run. An unsigned exe writing a `.node` into tmp invites AV/EDR false positives. Size: 93 MB (node) + 129 MiB (frida) + dist ≈ 230 MB+.
2. **Playwright's dynamic load.** `BrowserDepth.ts:8` and `BrowserBridge.ts:12` call `await import("playwright")`. Playwright is in `devDependencies` and also downloads external browser binaries. It cannot be embedded in a SEA. It has to be excluded or stay optional. (Builtin dynamic imports such as `node:fs/promises` are fine.)
3. **Size + toolchain.** The base exe is ~93 MB. CI would need a postject step (not in the repo; `npx postject` wants the network). Distribution wants code signing (an unsigned exe hits Windows SmartScreen).

What makes it easier: `dist/` is only ~2 MB (328 files). `frida.ts`, `FridaPlus.ts`, and `ApiTracer.ts` use a static `import "frida"` (bundleable). MCP stdio works inside a SEA.

## Path toward rea-plus.exe (not done)

1. Bundle `dist/` plus pure-JS dependencies with esbuild or similar (the dynamic `import("playwright")` stays out).
2. `frida_binding.node` → `assets`, write to tmp, `process.dlopen` (the docs method). Document the first-run behavior.
3. Leave Playwright-requiring domains out of the SEA (optional profile) or document them as an external dependency.
4. Add a postject step to CI (or Node ≥25.5 `--build-sea`) and sign the exe.
5. Cheaper alternative, and the one this repo actually ships: a **portable node bundle** — official `node.exe` + `dist/` + `node_modules` in a zip. Not a single file, but no signing/AV problem, and Frida runs as it does today. See `docs/SEA-DAGITIM.md`.

## Files

- `scripts/sea-build.mjs`: hello-world SEA pilot — generate, inject, run, and check inside a temp directory.
- `tests/sea-fizibilite.test.mjs`: 5 asserts — node ≥20, blob generation (<10 KB), current sentinel present, old sentinel absent, frida binding >100 MB. No network, no large binary checked in.
- This report: `docs/SEA-FIZIBILITE.md`.

## Test result (recorded when the pilot landed)

- New test: 5/5 PASS (`node --test tests/sea-fizibilite.test.mjs`, ~0.15 s).
- Full lane (`npm test`): **87/87 PASS, 0 FAIL** after `npm run build` produced `dist/`. Without that build the baseline was 5/86.
