# MCP contracts — rea-plus

Current surface at v0.13.0: 191 tools, 187 `outputSchema`, 191 annotations, 2 resources, 7 prompts. The lists below are the original frozen conduit set and the original Rea 30 registration. The full catalog is [`TOOLS.md`](TOOLS.md). Field names in sample envelopes stay as the code emits them.

## Frozen 30 (conduit, not renamed)

`health`, `session_open`, `session_close`, `session_list`, `events_pull`,
`static_info`, `open_target`, `close_target`, `disassemble`, `get_cfg`,
`xrefs`, `strings`, `dump`, `debug_open`, `debug_attach`, `debug_close`,
`debug_state`, `debug_breakpoint`, `debug_continue`, `debug_step`,
`debug_pause`, `debug_registers`, `debug_callstack`, `debug_memory`,
`debug_code`, `debug_thread`, `debug_plugin`, `debug_time`,
`explain`, `prerequisites`.

Source: `src/facade/toolNamespace.ts` (`FROZEN_CONDUIT_TOOLS`).

## Rea 30 (the original MCP registration, every name prefixed)

`rea_dotnet_metadata`, `rea_dotnet_cil`, `rea_js_sourcemap`,
`rea_js_bundle`, `rea_js_diff`, `rea_js_recon`, `rea_diff_match`,
`rea_diff_summary`, `rea_recon_harness`, `rea_crash_timeline`,
`rea_dos_mz`, `rea_mips_funcs`, `rea_aot_detect`,
`rea_firmware_extract`, `rea_browser_har_import`, `rea_browser_scenario`,
`rea_process_run`, `rea_process_compare`, `rea_process_caps`,
`rea_wasm_decode`, `rea_wasm_exports`, `rea_evm_selector`,
`rea_jadx_manifest`, `rea_jadx_classes`, `rea_adb_devices`,
`rea_adb_packages`, `rea_evidence_bundle`, `rea_obligation_ledger`,
`rea_obligation_advance`, `rea_obligation_verify`.

Source: `src/server/registerReaTools.ts` (one loop, 30 registrations at the time this list was frozen). Later tools were added in the same registrar. The count today is 191.

## Prefix rule

- Every Rea-origin MCP name is `rea_*` (or `hopper` / `ghidra` / `jeb` / `evm` / `firmware` / `browser` / `adb_*`).
- `qualifyReaTool(name)`: a frozen name gets a `rea_` prefix, and it does not double-prefix.
- `assertNoCollision(names)`: a double registration and a bare frozen name are forbidden.
- Example: `health -> rea_health`. `rea_evm_selector` stays as it is.

## capability_unsupported

- A missing binding or tool is not a stub. One envelope comes back:
- `{"ok":false,"code":"capability_unsupported","tool":"<tool>","reason":"..."}` (`isError: true`).
- Static gate: a session on the wrong engine returns the same code plus `required: {engine: "radare2"}`.
- A catalog download suggestion is added beside it (`suggestDownload(id)`).

## confirm:true

- Live debug writes (`debug_breakpoint` / `continue` / `step`, and the live branch of `explain`) do not run without approval.
- Without `confirm: true`: `confirmation_required`, plus a message to repeat the same call.
- Reads (`disassemble`, `strings`, `rea_evm_selector`) do not ask for confirm.

## Catalog 16 + transport

- `mergedCatalog()`: 8 conduit (`radare2` / `graphviz` / `x64dbg` / `python64` / `python32` / `cdb` / `frida` / `scyllahide`) + 8 rea (`hopper` / `ghidra` / `ida` / `jeb` / `jadx` / `apktool` / `wabt` / `binwalk`) = 16.
- Transport: stdio is the default. HTTP is stateless `POST /mcp` plus `GET /health`.
- Port: rea-plus 3848 (alternative 3849). It does not collide with conduit 3847.
- If a token (`DBG_BRIDGE_TOKEN`) is set, HTTP requires Bearer. stdio is unaffected.

## Prompts

Seven side-effect-free prompts: `packer-triage`, `dotnet-malware-triage`, `android-triage`, `pe-crash-triage`, `elf-linux-triage`, `binary-diff`, `evidence-report`. A prompt runs no tool.
