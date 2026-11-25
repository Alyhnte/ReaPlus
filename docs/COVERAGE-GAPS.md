# COVERAGE-GAPS — what is still missing after v0.17.0

v0.17.0 ships 200 tools, 197 `outputSchema`, 200 annotations, 2 resources, and 7 prompts. Four research probes were added on the `all` profile only.

## Closed (do not list these as gaps)

- **Frida API tracer.** `rea_frida_api` logs the function name, arguments, and return value. The injected script only attaches hooks and waits. Live Frida VM approval is still an open gate.
- **ELF layout and gadgets.** `rea_pwn_elf_layout` reads the ELF program headers (PIE, NX, RELRO). `rea_pwn_gadgets` keeps instruction sequences that end in `ret`, `retn`, or `retf`.
- **JS package entry.** The walk includes `.mts` and `.cts`. `package.json` `exports` is read before `main`.
- **Windows process reads.** `src/native-windows/addon.ts` reads the live process name, token integrity, and a directory snapshot. It is not an MCP tool.
- **Electron offline.** `rea_electron_fuses` reads the fuse sentinel and wire. `rea_electron_window` classifies BrowserWindow option keys. Neither starts Electron.
- **split-APK.** `rea_apk_splits` reads each APK zip in a directory and separates `base.apk` from `split_*.apk`.
- **adb pull.** `rea_adb_pull` runs `adb pull`. A missing `adb` returns `capability_unsupported`.
- **SQLite snapshot.** `rea_sqlite_snapshot` reads the database header and schema table names from the file.
- **Research tools.** `rea_angr_explore` executes REAVM, `rea_afl_fuzz` campaigns a REAFZ target, `rea_lldb_script` steps a REALDB image, and `rea_ttd_info` reads a REATD trace. A bad file returns `capability_unsupported`. They do not launch angr, AFL++, lldb, or WinDbg.
- **UPX.** `rea_upx_info` and `rea_upx_unpack`.
- **C# decompile path.** `rea_ilspy_decompile` (ilspycmd when it is installed).
- **Network capture.** `rea_net_capture` (local HAR).
- **Syscall and file/registry behavior.** Closed in v0.10.0: ntdll number mapping, CreateFileW/RegSet profiles, and a single-call behavior run.
- **Android dynamic recipe.** `rea_android_dinamik_recete` generates a 5-step recipe and dry-checks it. That is not device-less full dynamic RE.
- **v0.13.0 static gaps that this comparison used to call missing:** ELF `e_machine` including Hexagon, PE machine identity ARMNT (`0x01c4`) and ARM64 (`0xaa64`), type-aware lossless plist values, JS cross-bundle relations (`iliskiler`), apktool version observation (advisory, not evidence), and a raw m68k Ghidra profile.

## Still open

- Visual sessions (asciinema or GIF). Text transcripts exist; the recording does not.
- Automatic TOOL-COVERAGE. `docs/TOOL-COVERAGE.md` is still hand-maintained.
- AFL++ itself. `rea_afl_fuzz` campaigns a REAFZ target in process. It does not spawn AFL++.
- Frida live VM approval.
- A self-hosted Windows runner. CI is `ubuntu-latest` only.
- Trusted Publisher account setup. `publish.yml` already runs `npm publish --provenance`.
- A single-file SEA exe (three obstacles in `docs/SEA-DAGITIM.md`).
- Unpack recipes past UPX (Themida, VMProtect, ConfuserEx). No memory-dump OEP flow is shipped.

## Why the closed API-tracer gap mattered

Most real RE questions are behavioral: where a sample beacons, where a license check fails, which service a feature calls. `rea_frida_api` is the automatic trace. It still needs a live Frida VM, which is not approved, so CI does not prove it on hardware.
