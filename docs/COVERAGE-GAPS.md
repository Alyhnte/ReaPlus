# COVERAGE-GAPS — what is still missing after v0.14.0

v0.14.0 ships 191 tools, 188 `outputSchema`, 191 annotations, 2 resources, and 7 prompts. The tool count did not grow. `rea_pwn_elf_layout` gained an output schema because it now returns a real object.

## Closed (do not list these as gaps)

- **Frida API tracer.** `rea_frida_api` logs the function name, arguments, and return value. The injected script only attaches hooks and waits. Live Frida VM approval is still an open gate.
- **ELF layout and gadgets.** `rea_pwn_elf_layout` reads the ELF program headers (PIE, NX, RELRO). `rea_pwn_gadgets` keeps instruction sequences that end in `ret`, `retn`, or `retf`.
- **UPX.** `rea_upx_info` and `rea_upx_unpack`.
- **C# decompile path.** `rea_ilspy_decompile` (ilspycmd when it is installed).
- **Network capture.** `rea_net_capture` (local HAR).
- **Syscall and file/registry behavior.** Closed in v0.10.0: ntdll number mapping, CreateFileW/RegSet profiles, and a single-call behavior run.
- **Android dynamic recipe.** `rea_android_dinamik_recete` generates a 5-step recipe and dry-checks it. That is not device-less full dynamic RE.
- **v0.13.0 static gaps that this comparison used to call missing:** ELF `e_machine` including Hexagon, PE machine identity ARMNT (`0x01c4`) and ARM64 (`0xaa64`), type-aware lossless plist values, JS cross-bundle relations (`iliskiler`), apktool version observation (advisory, not evidence), and a raw m68k Ghidra profile.

## Still open

- Electron fuses and BrowserWindow constants.
- split-APK.
- adb file transfer (`adb pull`). Devices and package listing exist; pull does not.
- SQLite snapshot inspection.
- Scoped package `exports` field. CJS require resolution (relative and `node_modules`) shipped earlier; the `exports` field did not.
- A `.mts` / `.cts` walk.
- Visual sessions (asciinema or GIF). Text transcripts exist; the recording does not.
- Automatic TOOL-COVERAGE. `docs/TOOL-COVERAGE.md` is still hand-maintained.
- AFL++. A Node fuzz harness exists (`docs/FUZZ.md`). AFL++ itself is not wired. Wave 19 (not done) is the real integration, returning `capability_unsupported` when the dependency is absent.
- angr / Triton, LLDB, and WinDbg TTD. No engine for them is in the tree. Same wave-19 rule: unsupported when the dependency is absent, working when it is present. That behavior is not implemented yet.
- Frida live VM approval.
- A self-hosted Windows runner. CI is `ubuntu-latest` only.
- Trusted Publisher account setup. `publish.yml` already runs `npm publish --provenance`.
- A single-file SEA exe (three obstacles in `docs/SEA-DAGITIM.md`).
- Unpack recipes past UPX (Themida, VMProtect, ConfuserEx). No memory-dump OEP flow is shipped.

## Why the closed API-tracer gap mattered

Most real RE questions are behavioral: where a sample beacons, where a license check fails, which service a feature calls. `rea_frida_api` is the automatic trace. It still needs a live Frida VM, which is not approved, so CI does not prove it on hardware.
