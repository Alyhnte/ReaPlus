# ReaPlus Tool Reference

> This file is auto-generated; do not edit by hand. Source: the real MCP
> surface of the compiled server (`dist/server.js`). To regenerate:
> `npm run build && node scripts/generate-tool-reference.mjs`

## Summary

- Server: `rea-plus` 0.12.0
- Total tools: 191
- Total resources: 2
- Total prompts: 3
- Tools with outputSchema: 187
- Tools with annotations: 191

## Tools

### `close_target`

Release the binary target (and its radare2 process) held by a session.

- Input fields:
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: closed, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_attach`

Attach by pid, or, on a frida session, connect to a listening Frida Gadget (gadget host:port) or a running mobile package on USB (usb + package). The target keeps running after debug_close.

- Input fields:
  - `auto_analyze` (boolean, optional) — Run x64dbg auto-analysis after attaching (slower).
  - `break_on_entry` (boolean, optional) — Pause the debuggee right after attaching.
  - `gadget` (string, optional) — Frida Gadget listen address host:port. For targets that cannot be attached by pid.
  - `package` (string, optional) — Process or mobile package name. Defaults to Gadget. Required with usb.
  - `pid` (integer, optional) — Live process id. Required unless gadget or usb is set.
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
  - `usb` (boolean, optional) — Use the USB Frida device (phone or tablet) instead of a host:port Gadget.
- outputSchema: present (fields: architecture, attached, engine, entry_point, mode, module_base, module_entry, path, pid, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_breakpoint`

Set, remove, or list breakpoints. Address may be hex, a number, or an x64dbg expression.

- Input fields:
  - `action` (enum, optional)
  - `address` (string | number, optional) — Required for set/remove; ignored for list.
  - `condition` (string, optional) — Break condition expression (set only).
  - `log_text` (string, optional) — Log text on hit (set only).
  - `name` (string, optional) — Breakpoint name (set only).
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
  - `type` (enum, optional)
- outputSchema: present
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_callstack`

Read the current thread's call stack (address, module, function per frame).

- Input fields:
  - `max_frames` (integer, optional) — Max frames returned (default 50).
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: frames, session_id, threadId)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `debug_close`

Tear down the hidden x64dbg process held by a session. Launched targets are stopped; attached targets are detached and left running.

- Input fields:
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: closed, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_code`

Live code: disassemble at an address (default: the stopped instruction pointer), assemble one instruction, or run until an address. Requires confirm:true.

- Input fields:
  - `action` (enum, required)
  - `address` (string | number, optional) — Address as hex ("0x140001000"), decimal, or an engine expression ("cip").
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `count` (integer, optional) — Instruction count for disassemble (default 12).
  - `instruction` (string, optional) — Single instruction for assemble.
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_continue`

Resume the debuggee until the next breakpoint, single-step, or exit. The stop posts an event (debug.breakpoint_hit / debug.exited / debug.paused) retrievable via events_pull.

- Input fields:
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: address, reason, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_memory`

Live process memory: read, search, or dump. Requires confirm:true. Without it the call returns confirmation_required and does not touch the debuggee.

- Input fields:
  - `action` (enum, required)
  - `address` (string | number, optional) — Read/dump address.
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `length` (integer, optional) — Search length in bytes (default 4096, or the main module).
  - `max_results` (integer, optional)
  - `pattern` (string, optional) — Search pattern. Hex bytes, or ascii when search_type is ascii.
  - `search_type` (enum, optional)
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
  - `size` (integer, optional) — Byte count for read (default 64) or dump (default 256).
  - `start_address` (string | number, optional) — Address as hex ("0x140001000"), decimal, or an engine expression ("cip").
- outputSchema: present
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `debug_open`

Open a PE target for live debugging on this session's debug engine. Auto-detects x86/x64 and leaves the debuggee paused. x64dbg breaks on entry; cdb stops at the initial loader breakpoint and reports the PE entry.

- Input fields:
  - `auto_analyze` (boolean, optional) — Run x64dbg auto-analysis after loading (slower).
  - `break_on_entry` (boolean, optional) — Stop at the entry point after loading.
  - `command_line_args` (string, optional) — Command line arguments for the debuggee.
  - `path` (string, required) — Filesystem path of the PE binary to debug.
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: architecture, attached, engine, entry_point, mode, module_base, module_entry, opened, path, pid, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_pause`

Asynchronously break a running debuggee. Idempotent when already paused.

- Input fields:
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: address, reason, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_plugin`

x64dbg Scylla and ScyllaHide. status reports files on disk. dump and hide do not open a window: a missing headless plugin returns engine_unavailable with the plugins path. Requires confirm:true. cdb and frida return capability_unsupported.

- Input fields:
  - `action` (enum, required)
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `debug_registers`

Read debuggee registers (general + flags; segment/debug optionally).

- Input fields:
  - `include_debug` (boolean, optional) — Include debug registers.
  - `include_segment` (boolean, optional) — Include segment registers.
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: debug, flags, general, segment, session_id)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `debug_state`

Report live debug state (running/paused/terminated + pause reason) and the open target, if any.

- Input fields:
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `debug_step`

Single-step the debuggee (into or over calls) and report the new location.

- Input fields:
  - `count` (integer, optional) — Steps to take (default 1).
  - `kind` (enum, optional)
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: address, disassembly, function, kind, module, registers, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_thread`

Live threads: list, select, freeze, thaw, or read one thread's context. The id is the value returned by list (cdb index, x64dbg/frida OS thread id). Requires confirm:true. Frida has no suspend or switch API.

- Input fields:
  - `action` (enum, required)
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
  - `thread_id` (integer, optional)
- outputSchema: present
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_time`

Checkpoint snapshot, the checkpoint timeline, and rewind of one checkpoint. A checkpoint is the active thread's registers, the thread list, and one memory window. Requires confirm:true.

- Input fields:
  - `action` (enum, required)
  - `checkpoint_id` (string, optional)
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `memory_size` (integer, optional) — Bytes captured at the instruction pointer (default 64).
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `disassemble`

Disassemble instructions at an address (linear, `count` ops) or a whole function. Defaults to the entry function.

- Input fields:
  - `address` (string | number, optional) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `count` (integer, optional) — Ops for address mode (default 32).
  - `function` (string, optional) — Function name or address, e.g. "entry0".
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: count, location, ops, session_id, text)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `dump`

Read raw bytes at an address as hexdump text or a JSON byte array.

- Input fields:
  - `address` (string | number, required) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `format` (enum, optional)
  - `length` (integer, optional) — Bytes to read (default 128).
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: address, bytes, format, length, session_id, text)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `events_pull`

Pull events stored for one application session since a sequence number. This does not subscribe to push notifications.

- Input fields:
  - `after` (integer, optional) — Return events with seq greater than this.
  - `limit` (integer, optional)
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: events, retainedFrom, session_id)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `explain`

Short Turkish explanation of an assembly window: what the region does, where it jumps, and which calls notify the user or the system. Pass instructions already disassembled, or a session_id. A live debug session is read only when confirm is true. Call this when the user asks what the assembly means.

- Input fields:
  - `address` (string | number, optional) — Address to disassemble when instructions are omitted.
  - `confirm` (boolean, optional) — Required only when explain itself disassembles a live debug session. Pasted instructions skip this.
  - `count` (integer, optional) — How many instructions to read (default 16).
  - `instructions` (object[], optional) — Already fetched ops. When set, the debugger is not called.
  - `session_id` (string, optional) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: atlamalar, bildirimler, cagrilar, dil, gosterilen, kaynak, komut_sayisi, ozet, satirlar)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `get_cfg`

Control-flow graph of a function as JSON and/or Graphviz DOT. Defaults to the entry function.

- Input fields:
  - `address` (string | number, optional) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `format` (enum, optional)
  - `function` (string, optional) — Function name or address, e.g. "entry0".
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: dot, function, json, location, session_id)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `health`

Report bridge liveness. Does not touch a debugger engine.

- Input fields: none
- outputSchema: present (fields: name, protocol, sessions, status)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `open_target`

Open a binary target for static analysis in a radare2 session. Only mode 'static' is supported; anything else is a capability error. Requires r2 on PATH.

- Input fields:
  - `mode` (string, optional) — Analysis mode. Only "static" is supported.
  - `path` (string, required) — Filesystem path of the binary to analyze.
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: engine, mode, opened, path, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `prerequisites`

Check the programs Conduit uses (radare2, x64dbg, cdb, Python, Frida, Graphviz, ScyllaHide). Missing ones include a download URL and where to put the files. The bridge does not download them. Call this when a tool is missing or before choosing an engine.

- Input fields: none
- outputSchema: present (fields: araclar, ozet)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=true, readOnlyHint=true)

### `rea_adb_devices`

List of connected devices.

- Input fields: none
- outputSchema: present (fields: arac, cihazlar, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_adb_install`

APK cihaza kurulum.

- Input fields:
  - `apk_path` (string, required)
  - `seri` (string, optional)
- outputSchema: present (fields: apk, arac, ok, sonuc)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_adb_logcat`

Device logcat dump.

- Input fields:
  - `seri` (string, optional)
- outputSchema: present (fields: arac, ok, satirlar, toplam_satir)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_adb_packages`

List of installed packages.

- Input fields:
  - `filtre` (string, optional)
  - `seri` (string, optional)
- outputSchema: present (fields: arac, ok, paketler)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_adb_screencap`

Device screenshot.

- Input fields:
  - `out` (string, required)
  - `seri` (string, optional)
- outputSchema: present (fields: arac, bayt, ok, yol)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_android_dinamik_recete`

Android dynamic-analysis recipe generation.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, ok, recete)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_android_recete_dogrula`

Dry-run validation of a recipe.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: adim_sayisi, arac, ok)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_detect`

NativeAOT sinyali.

- Input fields:
  - `b64dosya` (string, required)
  - `metin` (string, optional)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_objc`

ObjC dispatch izleri.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_profile`

AOT profili.

- Input fields:
  - `b64dosya` (string, required)
  - `metin` (string, optional)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_swift`

Swift dispatch izleri.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apktool_build`

Decode dizinden APK rebuild.

- Input fields:
  - `dir` (string, required)
  - `out` (string, required)
- outputSchema: present (fields: arac, ciktiApk, ok, proje)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_caps`

apktool capability probe.

- Input fields: none
- outputSchema: present (fields: aapt2, aapt2Tamam, apktool, arac, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_apktool_decode`

APK decode (resource).

- Input fields:
  - `apk_path` (string, required)
  - `out` (string, required)
- outputSchema: present (fields: apk, arac, ciktiDir, ok)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_framework`

Framework APK kurulumu.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: apk, arac, ok)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_info`

apktool+aapt2 versions.

- Input fields: none
- outputSchema: present (fields: arac, ok, surum)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_apple_bundle`

Bundle anatomisi.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apple_macho`

Mach-O sihir + dyld listesi.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apple_plist`

Info.plist anahtar okuma.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_behavior_full`

Behavior report in a single call.

- Input fields:
  - `api` (string, required)
  - `net` (string, optional)
- outputSchema: present (fields: bulgular, cizelge, ok, ozet, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_behavior_timeline`

Event timeline + summary.

- Input fields:
  - `olaylar` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_best_motor`

Best engine for a target type (scored).

- Input fields:
  - `adaylar` (string[], required)
  - `tip` (string, required)
- outputSchema: none
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_bindiff_fonksiyonlar`

Binary fonksiyon listesi (ad/adres + hash).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, bicim, dosya, fonksiyonlar, istatistik, ok, sayi, sembollu)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_bindiff_karsilastir`

Function-level diff between two versions.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: arac, aynen, cikarilan, degisen, eklenen, eski, istatistik, ok, ozet, yeni)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_browser_caps`

Browser capability probe.

- Input fields: none
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_browser_click`

Click + post-click state.

- Input fields:
  - `selector` (string, required)
  - `url` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_browser_har_import`

HAR import.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_browser_nav`

Open a page + title.

- Input fields:
  - `url` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_browser_scenario`

Scenario recording.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_browser_shot`

Full-page screenshot.

- Input fields:
  - `out` (string, required)
  - `url` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_config_suggest`

MCP config snippet for the engines found.

- Input fields:
  - `bulunan` (string[], required)
- outputSchema: present (fields: snippet)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_console_yakala`

Console messages.

- Input fields:
  - `url` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_coverage`

Coverage ratio.

- Input fields:
  - `incelenen` (integer, required)
  - `toplam` (integer, required)
- outputSchema: present (fields: arac, kalan, ok, oran)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_append`

Append a crash event.

- Input fields:
  - `olay` (string, required)
  - `olaylar` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_hint`

Crash ipucu.

- Input fields:
  - `olaylar` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_kayit_parse`

Crash notu parse.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: arac, ok, registerlar, sinyal, threadSayisi, threadler)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_ozet`

Crash summary.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: arac, ilkFrame, ok, registerSayisi, sinyal, threadSayisi)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_timeline`

Crash timeline.

- Input fields:
  - `olaylar` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_cutter_caps`

Cutter/rizin capability probe.

- Input fields: none
- outputSchema: present (fields: arac, ok, pdc, surum)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_decompile`

Cutter pseudo-decompilation.

- Input fields:
  - `addr` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: addr, arac, hedef, kaynak, kod, not, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_disasm`

Cutter/rizin disassembly.

- Input fields:
  - `addr` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: addr, arac, hedef, ok, ops)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_funcs`

Cutter/rizin fonksiyon listesi.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, fonksiyonlar, hedef, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_strings`

Cutter/rizin string listesi.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, hedef, ok, strings)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_xrefs`

Cutter/rizin xref listesi.

- Input fields:
  - `addr` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: addr, arac, hedef, ok, xrefs)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_diff_match`

Function matching (JSON arrays).

- Input fields:
  - `a` (string, required)
  - `b` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_diff_summary`

Added/removed summary.

- Input fields:
  - `a` (string, required)
  - `b` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_com`

COM tespiti.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_int21`

INT21 call scan.

- Input fields:
  - `b64` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_mz`

MZ header check.

- Input fields:
  - `b64` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_psp`

PSP struct parse.

- Input fields:
  - `b64` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dosya_izi`

File write/read from API events.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dotnet_cil`

CIL method dump (dnfile).

- Input fields:
  - `filtre` (string, optional)
  - `path` (string, required)
- outputSchema: present (fields: arac, assembly, dosya, filtre, method_sayisi, methods, not, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_dotnet_metadata`

Assembly metadata okuma.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, clr, dosya, not, ok, okuyucu)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_dwarf_ozet`

ELF DWARF summary.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, dosya, fonksiyonAdlari, ok, subprogramSayisi, unitSayisi)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evidence_bundle`

Assemble an evidence bundle.

- Input fields:
  - `ogeler` (string, required)
  - `sakli` (string, required)
- outputSchema: present (fields: digest, items, retained, tools_sha256)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evidence_verify`

Verify an evidence bundle.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: ok)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_disasm`

EVM bytecode disassembly (offline).

- Input fields:
  - `hex` (string, required)
- outputSchema: present (fields: arac, detay, ok, ozet)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_selector`

EVM 4-byte selector (keccak, offline).

- Input fields:
  - `sig` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_selectors`

EVM selector candidates.

- Input fields:
  - `hex` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_stats`

EVM opcode statistics.

- Input fields:
  - `hex` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_fallback`

Birincil yoksa yedek zincir.

- Input fields:
  - `birincil` (string, required)
  - `mevcut` (string[], required)
- outputSchema: none
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_firmware_caps`

Firmware capability probe.

- Input fields: none
- outputSchema: present (fields: ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_firmware_extract`

Firmware extraction.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: ok, summary, tool)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_firmware_handoff`

Firmware handoff notu.

- Input fields:
  - `neden` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: handoff, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_blutter`

Dart analysis via Blutter (honest error if missing).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: izler, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_payload`

Flutter payload izleri.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: izler, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_scan`

Flutter/Dart izi tarama.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: buildId, dartMi, motor, ok, summary, tool, tur)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_snapshot`

Flutter AOT snapshot info (Dart magic + version).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: dartMi, dartSurumu, izolasyon, magic, ok, summary, tool, tur)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_frida_api`

API tracer (isim+args+retval).

- Input fields:
  - `desen` (string, optional)
  - `pid` (integer, required)
- outputSchema: present (fields: arac, cagrilar, ok, pid, sayi)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_frida_cond`

Conditional breakpoint.

- Input fields:
  - `adres` (string, required)
  - `kosul` (string, required)
  - `pid` (integer, required)
- outputSchema: present (fields: adres, arac, hitSayisi, ok, pid, tuttu)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_pause`

Suspend the target process (NtSuspend).

- Input fields:
  - `pid` (integer, required)
- outputSchema: present (fields: arac, durum, ok, pid)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_resume`

Resume a suspended process.

- Input fields:
  - `pid` (integer, required)
- outputSchema: present (fields: arac, durum, ok, pid)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_stalker`

Stalker call tracing.

- Input fields:
  - `pid` (integer, required)
  - `sure_ms` (integer, optional)
- outputSchema: present (fields: arac, cagrilar, ok, pid, sayi)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_frida_step`

Next-instruction emulation.

- Input fields:
  - `adres` (string, optional)
  - `pid` (integer, required)
- outputSchema: present (fields: adres, arac, ok, pid, sonraki, vurdu)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_fs_diff`

Snapshot diff.

- Input fields:
  - `once` (string, required)
  - `sonra` (string, required)
- outputSchema: present (fields: kayıt, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_fs_snapshot`

Dizin snapshot.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: kayıt, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ghidra_analyze`

Ghidra headless import+analiz.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, hedef, log, ok)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_decompile`

Ghidra pseudo-code.

- Input fields:
  - `addr` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: addr, arac, hedef, kod, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_disasm`

Ghidra disassembly.

- Input fields:
  - `addr` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: addr, arac, hedef, kod, ok, sayi, talimatlar)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_funcs`

Ghidra fonksiyon listesi.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, fonksiyonlar, hedef, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_strings`

Ghidra string listesi.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, hedef, ok, strings)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_trace`

Snapshot -> Ghidra Trace import.

- Input fields:
  - `kayit` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: arac, hedef, ok, sonuc)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_vt`

Function diff of two binaries (version tracking).

- Input fields:
  - `eski` (string, required)
  - `yeni` (string, required)
- outputSchema: present (fields: arac, degisen, eklenen, eski, ok, ozet, silinen, yeni)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_xrefs`

Ghidra xref listesi.

- Input fields:
  - `addr` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: addr, arac, hedef, ok, xrefs)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_go_buildinfo`

Go build-id + module dependencies.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_funclines`

Go function + file:line map.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_goresym`

GoReSym analysis (honest error if missing).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_module`

Go module info.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_version`

Go version fingerprint.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hap_liste`

HAP dosya listesi.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, dosya, dosyalar, ok, sayi)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hap_manifest`

HAP manifest (bundle/version).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, bundleName, dosya, kaynak, ok, version)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hopper_istek`

Hopper request-file generation.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: adresler, arac, hedef, hopper, istekDosyasi, ok)
- annotations: present (destructiveHint=true, readOnlyHint=false)

### `rea_hopper_tara`

Dosyada string/regex tarama.

- Input fields:
  - `desen` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: arac, desen, eslesmeler, hedef, ok, regex, sayi)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ida_flirt`

String-based compiler/library guess (not a real FLIRT signature; if IDA is installed, validate with rea_ida_idb output applied as a signature in IDA).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, eslesmeler, guven, hedef, idaMevcut, kutuphane, method, not, ok, sayi, surumler)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ida_idb`

IDB batch generation (idat).

- Input fields:
  - `out` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: arac, hedef, idat, idb, ok)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_il2cpp_dump`

Dump via Il2CppDumper (honest error if missing).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, cikti, dosya, dosyaSayisi, log, ok, ozet)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_il2cpp_metadata`

IL2CPP global-metadata class/method counts.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, assemblySayisi, dosya, goruntuSayisi, metodSayisi, not, ok, ozet, sinifSayisi, surum)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_il2cpp_methods`

IL2CPP method signatures (honest flag when truncated).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, dosya, imzaSayisi, imzalar, metodSayisi, not, ok, sinirli, surum)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ilspy_decompile`

.NET C# decompile.

- Input fields:
  - `out` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: arac, ciktiDir, cs_sayisi, dosya, not, ok)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_investigate`

Automatic investigation plan (sniff + score + fallbacks).

- Input fields:
  - `path` (string, required)
  - `soru` (string, optional)
- outputSchema: present (fields: arac, motor, ok, plan, skor, tip, yedekler)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_classes`

APK class list.

- Input fields:
  - `apk_path` (string, required)
- outputSchema: present (fields: arac, ok, siniflar, toplam_sinif)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_jadx_decompile`

Decompile a single APK class.

- Input fields:
  - `apk_path` (string, required)
  - `out` (string, required)
  - `sinif` (string, required)
- outputSchema: present (fields: arac, bayt, ciktiDir, dosya, ok, sinif)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_jadx_full`

APK tam decompile.

- Input fields:
  - `apk_path` (string, required)
  - `out` (string, required)
- outputSchema: present (fields: arac, ciktiDir, java_dosya_sayisi, ok)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_jadx_manifest`

APK manifest summary.

- Input fields:
  - `apk_path` (string, required)
- outputSchema: present (fields: aktiviteler, apk, arac, izinler, ok, paket)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_jadx_methods`

Method list from decompile output.

- Input fields:
  - `dir` (string, required)
- outputSchema: present (fields: arac, methodlar, ok)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_read`

Read a decompiled class (400 lines).

- Input fields:
  - `dir` (string, required)
  - `sinif` (string, required)
- outputSchema: present (fields: arac, dosya, ok, satirlar, toplam_satir)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_xrefs`

Term search across decompile output.

- Input fields:
  - `dir` (string, required)
  - `terim` (string, required)
- outputSchema: present (fields: arac, kayitlar, ok)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jeb_sorgu`

JEB MCP sorgusu.

- Input fields:
  - `govde` (string, optional)
  - `url` (string, required)
  - `yontem` (string, required)
- outputSchema: present (fields: arac, durum, govde, ok, url, yontem)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_js_bundle`

Bundle summary.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_export_shape`

Export shape.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_require`

Require/import graph.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_sourcemap`

Source-map resolution.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_classdump`

class-dump output (honest error if missing).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_info`

Mach-O header (architecture + file type).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_loads`

Mach-O load commands (segment/dylib).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_objc`

ObjC class/category list (read-only).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_otool`

otool output (honest error if missing).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_compare`

Managed member diff.

- Input fields:
  - `a` (string, required)
  - `b` (string, required)
- outputSchema: present (fields: arac, detay, ok, ozet)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_import`

Reconstruction import.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, detay, ok, ozet)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_verify`

Native dependency verification.

- Input fields:
  - `beklenen` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: arac, detay, ok, ozet)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_mips_funcs`

MIPS function pre-scan.

- Input fields:
  - `b64` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_mips_psp_profile`

MIPS/PSP profili.

- Input fields:
  - `b64` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_missing_reason`

Missing tool + install command.

- Input fields:
  - `eksik` (string, required)
  - `platform` (string, optional)
- outputSchema: present (fields: alternatif, eksik, kur, neden)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_net_capture`

Local network capture (HAR).

- Input fields:
  - `url` (string, required)
- outputSchema: present (fields: kayıt, ok, summary, tool)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_obligation_advance`

Halka ilerletme.

- Input fields:
  - `bulgu` (string, required)
  - `defter` (string, required)
  - `kod` (string, required)
- outputSchema: present (fields: links)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_close`

Seal the ledger.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: kapatıldı, links)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_ledger`

Defter kurma.

- Input fields:
  - `bulgular` (string[], required)
  - `evidence_digest` (string, required)
  - `tools_sha256` (string, required)
- outputSchema: present (fields: evidence_digest, kapatıldı, ledger_id, links, tools_sha256)
- annotations: present (destructiveHint=false, idempotentHint=false, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_verify`

Chain verification.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: eksik, ok)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pcap_oku`

PCAP stream reassembly + TLS keylog decrypt.

- Input fields:
  - `keylog` (string, optional)
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pdb_indir`

Download a PDB from the Microsoft symbol server using the CodeView RSDS record in the PE debug directory + integrity + cache.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, cache, dosya, guid, ok, pdb, url, yas, yol)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_pdb_yolu`

PE debug dizininden PDB yolu.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, dosya, guid, ok, pdb, yas)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_imports`

PE import listesi.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, dlls, dosya, fonksiyonlar, not, ok, sayi)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_info`

PE header info.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, bit, dosya, entry, entry_hex, machine, machine_hex, ok, section_sayisi)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_sections`

PE section tablosu.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, bolumler, dosya, ok, sayi)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_caps`

Process capability probe.

- Input fields: none
- outputSchema: present (fields: kayıt, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_compare`

Pipe/PTY comparison.

- Input fields:
  - `cmd` (string, required)
- outputSchema: none
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_run`

Process-run recording.

- Input fields:
  - `cmd` (string, required)
- outputSchema: present (fields: kayıt, ok, summary, tool)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_pwn_elf_layout`

ELF layout + mitigation.

- Input fields:
  - `path` (string, required)
- outputSchema: none
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pwn_gadgets`

Gadget ipucu.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_r2_callgraph`

r2 function call graph.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, fonksiyonlar, hedef, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_r2_debug`

r2 toplu debug (bp+regs).

- Input fields:
  - `addr` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: arac, bpAddr, cikti, hedef, not, ok)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_r2_esil`

r2 ESIL emulation regs.

- Input fields:
  - `addr` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: addr, adim, arac, hedef, ok, regs)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_readiness`

Reconstruction readiness score.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: arac, eksik, ok, seviye, skor)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_funcs`

Pseudo-code fonksiyon listesi.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_harness`

C harness iskeleti.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_tag`

Vaka etiketi.

- Input fields: none
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_registry_izi`

Registry writes from API events.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_scan_repo`

Repo scan (type + plan).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_scan_repo_paralel`

Parallel repo scan (pool of 4, cancellable).

- Input fields:
  - `eszamanlilik` (integer, optional)
  - `path` (string, required)
- outputSchema: present (fields: details, iptalEdildi, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_sniff`

File type + engine suggestion (magic-byte).

- Input fields:
  - `b64dosya` (string, required)
- outputSchema: present (fields: motor, tip)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_storage_dump`

Cookies + localStorage.

- Input fields:
  - `url` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_typedef_oner`

Argument-name suggestion + spread.

- Input fields:
  - `text` (string, required)
- outputSchema: present (fields: arac, ok, oneriler, sayi)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_unpack_hunt`

Guided flow for an unknown packer.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: adimlar, arac, karar, ok)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_unpack_try`

Automatic unpack routing.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: sonuc, yontem)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_upx_info`

Whether the file is UPX-packed.

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, cikti, dosya, not, ok, sikisik)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_upx_unpack`

UPX unpack.

- Input fields:
  - `out` (string, required)
  - `path` (string, required)
- outputSchema: present (fields: arac, cikti, dosya, log, ok)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_wasm_decode`

WASM/WAT decode (wabt).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `rea_wasm_exports`

WAT export listesi (offline).

- Input fields:
  - `wat` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_imports`

WASM import listesi.

- Input fields:
  - `b64` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_sections`

WASM section tablosu.

- Input fields:
  - `b64` (string, required)
- outputSchema: present (fields: details, ok, summary, tool)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_validate`

WASM validation (wasm-validate).

- Input fields:
  - `path` (string, required)
- outputSchema: present (fields: arac, detay, ok, ozet)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `session_close`

Drop an application session and its event buffer.

- Input fields:
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: closed, session_id)
- annotations: present (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `session_list`

List application sessions held in this process.

- Input fields: none
- outputSchema: present (fields: sessions)
- annotations: present (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `session_open`

Open an application session for an engine. Returns session_id for later tool arguments.

- Input fields:
  - `engine` (enum, required)
- outputSchema: present (fields: createdAt, engine, session_id)
- annotations: present (destructiveHint=false, idempotentHint=false, openWorldHint=false, readOnlyHint=false)

### `static_info`

Report radare2 static-engine capabilities, r2 availability, and the open target (if any).

- Input fields:
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: capabilities, engine, r2, session_id, target)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `strings`

Strings found in the binary (address, section, length, text).

- Input fields:
  - `limit` (integer, optional) — Max strings returned (default 200).
  - `min_length` (integer, optional) — Keep strings with length >= this (default 0).
  - `offset` (integer, optional) — Skip this many matches (default 0).
  - `section` (string, optional) — Only strings from this section, e.g. ".rodata".
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: offset, session_id, strings, total)
- annotations: present (openWorldHint=true, readOnlyHint=false)

### `xrefs`

Cross-references to and/or from an address (code and data).

- Input fields:
  - `address` (string | number, required) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `direction` (enum, optional)
  - `session_id` (string, required) — Application session id. Not an MCP protocol session.
- outputSchema: present (fields: address, from, session_id, to)
- annotations: present (openWorldHint=true, readOnlyHint=false)

## Resources

- `rea-plus://capabilities-safety` — name: `capabilities-safety` — mimeType: `application/json` — Static capability and security-rules summary (read-only).
- `rea-plus://server-info` — name: `server-info` — mimeType: `application/json` — Static server identity and surface summary (read-only).

## Prompts

- `android-triage` — arguments: `focus` (optional), `path` (required) — jadx-based static triage flow for an APK (side-effect-free prompt).
- `dotnet-malware-triage` — arguments: `focus` (optional), `path` (required) — Static malware-triage flow for a .NET sample (side-effect-free prompt).
- `packer-triage` — arguments: `focus` (optional), `path` (required) — Ordered, static-first rea flow for packer/protection detection (side-effect-free prompt).
