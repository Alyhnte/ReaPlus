# VERIFY — rea-plus v0.1.0 check (historical)

This file records the verification commands used at v0.1.0. The current release is v0.13.0: 191 tools, 187 `outputSchema`, 191 annotations, 2 resources, 7 prompts. Do not read the counts below as the current suite size.

## 1) Build

```powershell
npm run typecheck   # tsc --noEmit, must not error
npm run build       # tsc -> dist/
```

## 2) Tests (tests/, 49 files, 398 it — v0.1.0 count)

```powershell
node --test tests/auth.test.mjs
node --test tests/compact.test.mjs
node --test tests/concurrency.test.mjs
node --test tests/evidence.test.mjs
node --test tests/evm.test.mjs
node tests/namespace.test.mjs
node --test tests/obligation.test.mjs
node --test tests/process.test.mjs
node tests/reaplus.smoke.mjs
node --test tests/wasm.test.mjs
node --test tests/sniff.test.mjs
node --test tests/confidence.test.mjs
node --test tests/fallback.test.mjs
node --test tests/missing.test.mjs
node --test tests/probe.test.mjs
node --test tests/configSuggest.test.mjs
node --test tests/telemetry.test.mjs
node --test tests/cutter.test.mjs
node --test tests/jadx-full.test.mjs
node --test tests/ghidra-full.test.mjs
node --test tests/ghidra-prof2.test.mjs
node --test tests/apk-adb2.test.mjs
node --test tests/wasm-evm2.test.mjs
node --test tests/dotnet-cil.test.mjs
node --test tests/r2plus.test.mjs
node --test tests/fridaplus.test.mjs
node --test tests/browser2.test.mjs
node tests/cli.test.mjs
node tests/e2e.http.mjs
node --test tests/behavior.test.mjs
node --test tests/behavior-full.test.mjs
node --test tests/typedef.test.mjs
node --test tests/reposcan.test.mjs
node --test tests/corpus.test.mjs
node --test tests/publish.test.mjs
node --test tests/investigate.test.mjs
node --test tests/apple.test.mjs
node --test tests/cli2.test.mjs
node --test tests/depth.test.mjs
node --test tests/flutter.test.mjs
node --test tests/frida-api.test.mjs
node --test tests/go-wasm-evm-dos.test.mjs
node --test tests/harmony.test.mjs
node --test tests/managed-workflow.test.mjs
node --test tests/provider-crash.test.mjs
node --test tests/readiness.test.mjs
node --test tests/unpack.test.mjs
node --test tests/unpack-hunt.test.mjs
node --test tests/winpe.test.mjs
```

One command at that time: `node --test tests/` (49 files). `namespace`, `smoke`, `cli`, and `e2e` are assert-style scripts (they are not counted as `it`). 45 files held 398 `it` calls.

`sniff.test.mjs` is still on the default-lane LIVE exclusion list. Moving it off that list is wave 16 and is not done.

## 3) Expected green output (v0.1.0)

- `namespace`: `OK: health->rea_health disassemble->rea_disassemble`
- `smoke`: `OK: transfer=0xa9059cbb approve=0x095ea7b3` plus `OK: frozen=30 katalog=24`
- `evm`: the `transfer(address,uint256) -> 0xa9059cbb` case passes.
- `node --test`: `pass 398, fail 0` (the assert-style files also exit 0).

## 4) Golden line-ending note

Golden comparisons normalize `CRLF -> LF` (`radare2.ts` / `cdb.ts`: `replace(/\r\n/g, "\n")`). Files are counted as LF.
