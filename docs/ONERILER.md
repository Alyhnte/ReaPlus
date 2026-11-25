# rea-plus — reverse-engineering MCP recommendations

This is an early backlog, not the v0.13.0 gap list. v0.13.0 ships 191 tools, 187 `outputSchema`, 191 annotations, 2 resources, and 7 prompts. Closed in that release: ELF `e_machine` including Hexagon, PE ARMNT/ARM64, type-aware lossless plist values, JS cross-bundle relations, apktool version observation (advisory), and a raw m68k Ghidra profile. The tool count did not change.

Still open: Electron fuses, split-APK, adb file transfer, SQLite snapshot, the scoped package `exports` field, a `.mts`/`.cts` walk, visual sessions (asciinema), automatic TOOL-COVERAGE, Frida live VM approval, a self-hosted Windows runner (CI is `ubuntu-latest` only), Trusted Publisher account setup (`npm publish --provenance` already runs; the account setup does not), a SEA single-file exe, LLDB, WinDbg TTD, angr, and AFL++. v0.14.0 is not tagged.

## Could be added soon (high value, low risk) — historical list

- Ghidra headless plus a Hopper bridge (pseudocode was already demonstrated for Ghidra; Hopper stays gate-only because there is no headless API)
- JADX + Apktool + adb as a trio (APK manifest / class / decompile in one package). adb file transfer and split-APK are still open
- .NET static (metadata + CIL, without running the assembly)
- WABT WAT decode plus an EVM selector table (offline, fast)
- HAR plus mitmproxy capture import (web evidence)
- Binwalk / Unblob firmware extraction plus a native handoff
- Go binary module / version read (no install required)
- pwntools ELF layout plus mitigation candidates (real pwntools/ROP is still unused; see `docs/TOOL-COVERAGE.md`)
- source-map plus bundle diff (`compare_source_to_bundle`). Cross-bundle relations shipped in v0.13.0. The `exports` field and `.mts`/`.cts` walk did not
- process capture (PTY, run comparison)

## Medium term (needs architecture)

- IDA MCP plus a JEB MCP provider selector (like `REA_JEB_MCP_URL`). Both are gate-only today
- V8 inspector runtime observation (live Electron observation). Electron fuses are still open
- Playwright scenario plus network plus storage in one session
- reconstruction obligation ledger (finding, then code, then test)
- evidence bundle plus digest (`tools_sha256` stays stable)
- compact input schema (fits models under 13 KB)
- Windows native addon (process / authority / filesystem) prebuild. Without `REA_NATIVE_PREBUILD=1` the TS surface returns `ok: true` with `iskelet: true`. Stopping that fake `ok` is wave 17 and is not done

## Long term (the differentiator)

- 16-bit DOS plus MIPS/PSP profiles (TH04-style cases). Wave 17 (not done) makes the aot/mips profiles expose `iskelet: true`
- NativeAOT PE plus Swift/ObjC dispatch metadata
- recorded crash to a register/signal timeline
- differential binary diff (function matching across versions)
- decompiler pseudocode to a C reconstruction test harness (DX-Ball: 3205 cases)
- offline air-gap package (tools embedded, no download)
- skill pack: investigation flow with `reverse-engineer-anything` references
