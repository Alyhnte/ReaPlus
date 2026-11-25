# rea-plus full plan (every recommendation included)

Status: the work packages below landed in the tree. The current release is v0.13.0 (191 tools, 187 `outputSchema`, 191 annotations, 2 resources, 7 prompts). Open items are in `docs/ROADMAP.md` and `docs/ROADMAP-NEXT.md`. v0.14.0 is not tagged.

## WP4a static (done)

- `hopper/HopperProvider.ts` `REA_HOPPER_PATH` (gate-only; no headless API)
- `ghidra/GhidraProvider.ts` `REA_GHIDRA_DIR` + Java 17
- `ida/IdaProvider.ts`, `jeb/JebProvider.ts` `REA_JEB_MCP_URL`

## WP4b mobile + managed (done)

- `android/JadxBridge.ts` `rea_jadx_*` + JDK
- `android/ApktoolBridge.ts` `rea_apktool_*` (version observation is advisory, shipped in v0.13.0)
- `android/AdbBridge.ts` `rea_adb_*` (devices and packages; file transfer is still open; split-APK is still open)
- `dotnet/ManagedInspector.ts` `rea_dotnet_*` (without executing the assembly)

## WP4c web + special (done)

- `javascript/JsAnalyzer.ts` `rea_js_*` + `compare_source_to_bundle` (cross-bundle relations shipped in v0.13.0; the package `exports` field and `.mts`/`.cts` walk are still open)
- `firmware-browser/FirmwareBridge.ts` `rea_firmware_*` (Linux)
- `firmware-browser/BrowserBridge.ts` `rea_browser_*` + HAR
- `wasm-evm/WasmEvmBridge.ts` `rea_wasm_*` `rea_evm_*`
- `wasm-evm/GoPwnBridge.ts` `rea_go_*` `rea_pwn_*`

## WP5 medium (done)

- `facade/evidenceBundle.ts` `ev_*` + `tools_sha256`
- `facade/obligationLedger.ts` finding, then code, then test
- `facade/compactSchema.ts` 13 KB profile
- `firmware-browser/ProcessCapture.ts` `rea_process_*`
- `native-windows/addon.ts` + README prebuild roadmap (skeleton `ok: true` until wave 17)

## WP6 long (done as skeletons)

- `wasm-evm/DosMipsBridge.ts`, `NativeAotBridge.ts`, `CrashTimeline.ts`
- `javascript/BinaryDiff.ts`, `ReconHarness.ts` (3205-case target)
- `docs/AIRGAP.md`, `src/skill-pack/SKILL.md`

## Rules

- conduit 30 stays frozen, every Rea name is `rea_`-prefixed, collision assert holds
- transport is stdio plus stateless HTTP, and `confirm: true` is required on the live path
- a missing tool returns `capability_unsupported` plus where to get it. No stub
