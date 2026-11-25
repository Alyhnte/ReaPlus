# rea-plus skill pack — investigation-flow skeleton

> Offline first contact: call the local bridges first. If that is not enough, report the gate.
> Do not write an invented finding at any step. Return `capability_unsupported` and stop.

v0.13.0 surface: 191 tools, 187 `outputSchema`, 191 annotations, 2 resources, 7 prompts. This pack is a flow, not a new tool.

## 0. Shared gate

- If the input is empty or corrupt, the related `rea_*` gate returns `capability_unsupported`.
- Do not skip a closed gate. Carry it up to the caller as-is.
- Attach `tool`, `summary`, and the raw evidence to every finding.

## 1. Native flow

1. Check MZ / `e_lfanew` with `rea_dos_mz` (16-bit DOS suspicion).
2. Count INT 21h with `rea_dos_int21`.
3. Scan the NativeAOT signal with `rea_aot_detect`.
4. Summarize the dispatch table with `rea_aot_objc` / `rea_aot_swift`.
5. Reference: `src/rea-domains/wasm-evm/DosMipsBridge.ts`.

Wave 17 (not done) makes the aot/mips profiles expose `iskelet: true`. Until then, treat a skeleton success as a skeleton, not as a Win32 or CPU read.

## 2. JS flow

1. Summarize the bundle with `rea_js_bundle`.
2. Count sources and mappings with `rea_js_sourcemap`.
3. Match functions across versions with `rea_diff_match`.
4. Report added and removed counts with `rea_diff_summary`.
5. Reference: `src/rea-domains/javascript/BinaryDiff.ts`.

Cross-bundle relations shipped in v0.13.0 (`iliskiler`). The scoped package `exports` field and a `.mts`/`.cts` walk are still open.

## 3. APK flow

1. Take the `cargo apk` output as raw bytes (dex versus elf).
2. Run the `rea_mips_psp_profile` skeleton for the native side.
3. If a bundle is present, branch into the JS flow.
4. If a crash record is present, lay it out with `rea_crash_timeline`.
5. Reference: `src/rea-domains/android/*` plus the wasm-evm bridges.

split-APK and adb file transfer are still open. Apktool version observation is advisory and did ship.

## 4. Web flow

1. Collect the bundle and source-map pair. If there is no map, use `rea_js_bundle`.
2. Pull candidates from a suspicious chunk with `rea_recon_funcs`.
3. Produce a C draft for the 3205-case set with `rea_recon_harness`.
4. Stamp the case tag with `rea_recon_tag`.
5. Reference: `src/rea-domains/javascript/ReconHarness.ts`.

Electron fuses are still open. Do not invent a fuse read.

## 5. Close

- If every gate is closed: write "evidence is insufficient" and close the file.
- File the findings on the checklist in `docs/AIRGAP.md`.
- If you see a new signal, add a reference line to the skill pack. Do not bloat the code.
