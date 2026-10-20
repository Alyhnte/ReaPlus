# ReaPlus-Werkzeugreferenz

> Diese Datei wird automatisch erzeugt; nicht manuell bearbeiten. Quelle: die
> echte MCP-Oberfläche des kompilierten Servers (`dist/server.js`). Zur Neuerzeugung:
> `npm run build && node scripts/generate-tool-reference.mjs`

## Zusammenfassung

- Server: `rea-plus` 0.13.0
- Werkzeuge gesamt: 191
- Ressourcen gesamt: 2
- Prompts gesamt: 3
- Werkzeuge mit outputSchema: 187
- Werkzeuge mit annotations: 191

## Werkzeuge

### `close_target`

Gibt das binäre Ziel (samt zugehörigem radare2-Prozess) frei, das von einer Sitzung gehalten wird.

- Eingabefelder:
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: closed, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_attach`

Verbindet sich per PID oder – in einer Frida-Sitzung – mit einem lauschenden Frida-Gadget (Gadget host:port) oder einem laufenden Mobilpaket über USB (usb + package). Das Ziel läuft nach debug_close weiter.

- Eingabefelder:
  - `auto_analyze` (boolean, optional) — Run x64dbg auto-analysis after attaching (slower).
  - `break_on_entry` (boolean, optional) — Pause the debuggee right after attaching.
  - `gadget` (string, optional) — Frida Gadget listen address host:port. For targets that cannot be attached by pid.
  - `package` (string, optional) — Process or mobile package name. Defaults to Gadget. Required with usb.
  - `pid` (integer, optional) — Live process id. Required unless gadget or usb is set.
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
  - `usb` (boolean, optional) — Use the USB Frida device (phone or tablet) instead of a host:port Gadget.
- outputSchema: vorhanden (Felder: architecture, attached, engine, entry_point, mode, module_base, module_entry, path, pid, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_breakpoint`

Setzt, entfernt oder listet Breakpoints auf. Adressen dürfen hex, Zahlen oder x64dbg-Ausdrücke sein.

- Eingabefelder:
  - `action` (enum, optional)
  - `address` (string | number, optional) — Required for set/remove; ignored for list.
  - `condition` (string, optional) — Break condition expression (set only).
  - `log_text` (string, optional) — Log text on hit (set only).
  - `name` (string, optional) — Breakpoint name (set only).
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
  - `type` (enum, optional)
- outputSchema: vorhanden
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_callstack`

Liest den Callstack des aktuellen Threads (Adresse, Modul, Funktion pro Frame).

- Eingabefelder:
  - `max_frames` (integer, optional) — Max frames returned (default 50).
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: frames, session_id, threadId)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `debug_close`

Beendet den versteckten x64dbg-Prozess einer Sitzung. Gestartete Ziele werden gestoppt; verbundene Ziele werden getrennt und laufen weiter.

- Eingabefelder:
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: closed, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_code`

Live-Code: Disassembliert an einer Adresse (Standard: der angehaltene Instruction Pointer), assembliert eine Instruktion oder führt bis zu einer Adresse aus. Erfordert confirm:true.

- Eingabefelder:
  - `action` (enum, erforderlich)
  - `address` (string | number, optional) — Address as hex ("0x140001000"), decimal, or an engine expression ("cip").
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `count` (integer, optional) — Instruction count for disassemble (default 12).
  - `instruction` (string, optional) — Single instruction for assemble.
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_continue`

Setzt den Debuggee bis zum nächsten Breakpoint, Einzelschritt oder Exit fort. Der Stopp meldet ein Ereignis (debug.breakpoint_hit / debug.exited / debug.paused), abrufbar via events_pull.

- Eingabefelder:
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: address, reason, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_memory`

Live-Prozessspeicher: lesen, suchen oder dumpen. Erfordert confirm:true. Ohne diese gibt der Aufruf confirmation_required zurück und berührt den Debuggee nicht.

- Eingabefelder:
  - `action` (enum, erforderlich)
  - `address` (string | number, optional) — Read/dump address.
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `length` (integer, optional) — Search length in bytes (default 4096, or the main module).
  - `max_results` (integer, optional)
  - `pattern` (string, optional) — Search pattern. Hex bytes, or ascii when search_type is ascii.
  - `search_type` (enum, optional)
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
  - `size` (integer, optional) — Byte count for read (default 64) or dump (default 256).
  - `start_address` (string | number, optional) — Address as hex ("0x140001000"), decimal, or an engine expression ("cip").
- outputSchema: vorhanden
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `debug_open`

Öffnet ein PE-Ziel zum Live-Debugging in der Debug-Engine dieser Sitzung. Erkennt x86/x64 automatisch und lässt den Debuggee angehalten. x64dbg hält am Entry an; cdb stoppt am initialen Loader-Breakpoint und meldet den PE-Entry.

- Eingabefelder:
  - `auto_analyze` (boolean, optional) — Run x64dbg auto-analysis after loading (slower).
  - `break_on_entry` (boolean, optional) — Stop at the entry point after loading.
  - `command_line_args` (string, optional) — Command line arguments for the debuggee.
  - `path` (string, erforderlich) — Filesystem path of the PE binary to debug.
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: architecture, attached, engine, entry_point, mode, module_base, module_entry, opened, path, pid, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_pause`

Hält einen laufenden Debuggee asynchron an. Idempotent, wenn bereits angehalten.

- Eingabefelder:
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: address, reason, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_plugin`

x64dbg Scylla und ScyllaHide. status meldet Dateien auf der Platte. dump und hide öffnen kein Fenster: Ein fehlendes Headless-Plugin meldet engine_unavailable samt Plugin-Pfad. Erfordert confirm:true. cdb und frida melden capability_unsupported.

- Eingabefelder:
  - `action` (enum, erforderlich)
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `debug_registers`

Liest Debuggee-Register (Allgemein + Flags; Segment/Debug optional).

- Eingabefelder:
  - `include_debug` (boolean, optional) — Include debug registers.
  - `include_segment` (boolean, optional) — Include segment registers.
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: debug, flags, general, segment, session_id)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `debug_state`

Meldet den Live-Debug-Zustand (laufend/angehalten/beendet + Anhaltegrund) und das geöffnete Ziel, falls vorhanden.

- Eingabefelder:
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `debug_step`

Führt den Debuggee im Einzelschritt aus (into oder over Calls) und meldet die neue Position.

- Eingabefelder:
  - `count` (integer, optional) — Steps to take (default 1).
  - `kind` (enum, optional)
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: address, disassembly, function, kind, module, registers, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_thread`

Live-Threads: auflisten, auswählen, einfrieren, auftauen oder den Kontext eines Threads lesen. Die ID ist der von list zurückgegebene Wert (cdb-Index, x64dbg-/Frida-OS-Thread-ID). Erfordert confirm:true. Frida hat keine Suspend- oder Switch-API.

- Eingabefelder:
  - `action` (enum, erforderlich)
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
  - `thread_id` (integer, optional)
- outputSchema: vorhanden
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_time`

Checkpoint-Snapshot, Checkpoint-Timeline und Rewind eines Checkpoints. Ein Checkpoint besteht aus den Registern des aktiven Threads, der Thread-Liste und einem Speicherfenster. Erfordert confirm:true.

- Eingabefelder:
  - `action` (enum, erforderlich)
  - `checkpoint_id` (string, optional)
  - `confirm` (boolean, optional) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `memory_size` (integer, optional) — Bytes captured at the instruction pointer (default 64).
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `disassemble`

Disassembliert Instruktionen an einer Adresse (linear, `count` Ops) oder eine ganze Funktion. Standard: die Entry-Funktion.

- Eingabefelder:
  - `address` (string | number, optional) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `count` (integer, optional) — Ops for address mode (default 32).
  - `function` (string, optional) — Function name or address, e.g. "entry0".
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: count, location, ops, session_id, text)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `dump`

Liest Rohbytes an einer Adresse als Hexdump-Text oder JSON-Byte-Array.

- Eingabefelder:
  - `address` (string | number, erforderlich) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `format` (enum, optional)
  - `length` (integer, optional) — Bytes to read (default 128).
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: address, bytes, format, length, session_id, text)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `events_pull`

Holt Ereignisse, die seit einer Sequenznummer für eine Anwendungssitzung gespeichert sind. Abonniert keine Push-Benachrichtigungen.

- Eingabefelder:
  - `after` (integer, optional) — Return events with seq greater than this.
  - `limit` (integer, optional)
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: events, retainedFrom, session_id)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `explain`

Kurze deutsche Erklärung eines Assembler-Fensters: was die Region tut, wohin sie springt und welche Aufrufe den Nutzer oder das System benachrichtigen. Übergibt bereits disassemblierte Instruktionen oder eine session_id. Eine Live-Debug-Sitzung wird nur gelesen, wenn confirm wahr ist. Aufrufen, wenn der Nutzer fragt, was das Assembly bedeutet.

- Eingabefelder:
  - `address` (string | number, optional) — Address to disassemble when instructions are omitted.
  - `confirm` (boolean, optional) — Required only when explain itself disassembles a live debug session. Pasted instructions skip this.
  - `count` (integer, optional) — How many instructions to read (default 16).
  - `instructions` (object[], optional) — Already fetched ops. When set, the debugger is not called.
  - `session_id` (string, optional) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: atlamalar, bildirimler, cagrilar, dil, gosterilen, kaynak, komut_sayisi, ozet, satirlar)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `get_cfg`

Kontrollflussgraph einer Funktion als JSON und/oder Graphviz DOT. Standard: die Entry-Funktion.

- Eingabefelder:
  - `address` (string | number, optional) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `format` (enum, optional)
  - `function` (string, optional) — Function name or address, e.g. "entry0".
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: dot, function, json, location, session_id)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `health`

Meldet die Bridge-Lebendigkeit. Berührt keine Debugger-Engine.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: name, protocol, sessions, status)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `open_target`

Öffnet ein Binärziel zur statischen Analyse in einer radare2-Sitzung. Nur Modus 'static' wird unterstützt; alles andere ist ein Capability-Fehler. Erfordert r2 im PATH.

- Eingabefelder:
  - `mode` (string, optional) — Analysis mode. Only "static" is supported.
  - `path` (string, erforderlich) — Filesystem path of the binary to analyze.
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: engine, mode, opened, path, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `prerequisites`

Prüft die Programme, die Conduit nutzt (radare2, x64dbg, cdb, Python, Frida, Graphviz, ScyllaHide). Fehlende Einträge enthalten eine Download-URL und den Ablageort. Die Bridge lädt sie nicht herunter. Aufrufen, wenn ein Werkzeug fehlt oder vor der Engine-Wahl.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: araclar, ozet)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=true, readOnlyHint=true)

### `rea_adb_devices`

Liste verbundener Geräte.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: arac, cihazlar, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_adb_install`

APK-Installation auf dem Gerät.

- Eingabefelder:
  - `apk_path` (string, erforderlich)
  - `seri` (string, optional)
- outputSchema: vorhanden (Felder: apk, arac, ok, sonuc)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_adb_logcat`

Geräte-logcat-Dump.

- Eingabefelder:
  - `seri` (string, optional)
- outputSchema: vorhanden (Felder: arac, ok, satirlar, toplam_satir)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_adb_packages`

Liste installierter Pakete.

- Eingabefelder:
  - `filtre` (string, optional)
  - `seri` (string, optional)
- outputSchema: vorhanden (Felder: arac, ok, paketler)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_adb_screencap`

Geräte-Screenshot.

- Eingabefelder:
  - `out` (string, erforderlich)
  - `seri` (string, optional)
- outputSchema: vorhanden (Felder: arac, bayt, ok, yol)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_android_dinamik_recete`

Erzeugung einer dynamischen Android-Analyse-Rezeptur.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, ok, recete)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_android_recete_dogrula`

Trocken-Validierung einer Rezeptur.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: adim_sayisi, arac, ok)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_detect`

NativeAOT-Signal.

- Eingabefelder:
  - `b64dosya` (string, erforderlich)
  - `metin` (string, optional)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_objc`

ObjC-Dispatch-Spuren.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_profile`

AOT-Profil.

- Eingabefelder:
  - `b64dosya` (string, erforderlich)
  - `metin` (string, optional)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_swift`

Swift-Dispatch-Spuren.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apktool_build`

APK-Rebuild aus dem Decode-Verzeichnis.

- Eingabefelder:
  - `dir` (string, erforderlich)
  - `out` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, ciktiApk, ok, proje)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_caps`

apktool-Verfügbarkeitsprüfung.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: aapt2, aapt2Tamam, apktool, arac, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_apktool_decode`

APK-Decode (Ressourcen).

- Eingabefelder:
  - `apk_path` (string, erforderlich)
  - `out` (string, erforderlich)
- outputSchema: vorhanden (Felder: apk, arac, ciktiDir, ok)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_framework`

Framework-APK-Installation.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: apk, arac, ok)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_info`

apktool-+aapt2-Versionen.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: arac, ok, surum)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_apple_bundle`

Bundle-Anatomie.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apple_macho`

Mach-O-Magie + dyld-Liste.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apple_plist`

Info.plist-Schlüssellesen.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_behavior_full`

Verhaltensbericht in einem Aufruf.

- Eingabefelder:
  - `api` (string, erforderlich)
  - `net` (string, optional)
- outputSchema: vorhanden (Felder: bulgular, cizelge, ok, ozet, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_behavior_timeline`

Ereignis-Timeline + Zusammenfassung.

- Eingabefelder:
  - `olaylar` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_best_motor`

Beste Engine (Score) für einen Zieltyp.

- Eingabefelder:
  - `adaylar` (string[], erforderlich)
  - `tip` (string, erforderlich)
- outputSchema: keine
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_bindiff_fonksiyonlar`

Binär-Funktionsliste (Name/Adresse + Hash).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, bicim, dosya, fonksiyonlar, istatistik, ok, sayi, sembollu)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_bindiff_karsilastir`

Funktionsdifferenz zwischen zwei Versionen.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, aynen, cikarilan, degisen, eklenen, eski, istatistik, ok, ozet, yeni)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_browser_caps`

Browser-Verfügbarkeitsprüfung.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_browser_click`

Klick + Folgezustand.

- Eingabefelder:
  - `selector` (string, erforderlich)
  - `url` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_browser_har_import`

HAR-Import.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_browser_nav`

Seitenöffnung + Titel.

- Eingabefelder:
  - `url` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_browser_scenario`

Szenario-Aufzeichnung.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_browser_shot`

Vollseiten-Screenshot.

- Eingabefelder:
  - `out` (string, erforderlich)
  - `url` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_config_suggest`

MCP-Config-Snippet für gefundene Werkzeuge.

- Eingabefelder:
  - `bulunan` (string[], erforderlich)
- outputSchema: vorhanden (Felder: snippet)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_console_yakala`

Konsolennachrichten.

- Eingabefelder:
  - `url` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_coverage`

Abdeckungsquote.

- Eingabefelder:
  - `incelenen` (integer, erforderlich)
  - `toplam` (integer, erforderlich)
- outputSchema: vorhanden (Felder: arac, kalan, ok, oran)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_append`

Hinzufügen eines Crash-Ereignisses.

- Eingabefelder:
  - `olay` (string, erforderlich)
  - `olaylar` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_hint`

Crash-Hinweis.

- Eingabefelder:
  - `olaylar` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_kayit_parse`

Crash-Notiz-Parsing.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, ok, registerlar, sinyal, threadSayisi, threadler)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_ozet`

Crash-Zusammenfassung.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, ilkFrame, ok, registerSayisi, sinyal, threadSayisi)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_timeline`

Crash-Timeline.

- Eingabefelder:
  - `olaylar` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_cutter_caps`

Cutter-/rizin-Verfügbarkeitsprüfung.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: arac, ok, pdc, surum)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_decompile`

Cutter-Pseudocode.

- Eingabefelder:
  - `addr` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: addr, arac, hedef, kaynak, kod, not, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_disasm`

Cutter-/rizin-Disassembly.

- Eingabefelder:
  - `addr` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: addr, arac, hedef, ok, ops)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_funcs`

Cutter-/rizin-Funktionsliste.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, fonksiyonlar, hedef, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_strings`

Cutter-/rizin-Stringliste.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, hedef, ok, strings)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_xrefs`

Cutter-/rizin-Xref-Liste.

- Eingabefelder:
  - `addr` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: addr, arac, hedef, ok, xrefs)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_diff_match`

Funktions-Mapping (JSON-Arrays).

- Eingabefelder:
  - `a` (string, erforderlich)
  - `b` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_diff_summary`

Zusammenfassung hinzugefügt/entfernt.

- Eingabefelder:
  - `a` (string, erforderlich)
  - `b` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_com`

COM-Erkennung.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_int21`

INT21-Aufrufscan.

- Eingabefelder:
  - `b64` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_mz`

MZ-Header-Prüfung.

- Eingabefelder:
  - `b64` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_psp`

PSP-Struct-Parsing.

- Eingabefelder:
  - `b64` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dosya_izi`

Datei-Schreib-/Lesezugriffe aus API-Ereignissen.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dotnet_cil`

CIL-Methodendump (dnfile).

- Eingabefelder:
  - `filtre` (string, optional)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, assembly, dosya, filtre, method_sayisi, methods, not, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_dotnet_metadata`

Lesen von Assembly-Metadaten.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, clr, dosya, not, ok, okuyucu)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_dwarf_ozet`

ELF-DWARF-Zusammenfassung.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, dosya, fonksiyonAdlari, ok, subprogramSayisi, unitSayisi)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evidence_bundle`

Zusammenstellen eines Evidenzpakets.

- Eingabefelder:
  - `ogeler` (string, erforderlich)
  - `sakli` (string, erforderlich)
- outputSchema: vorhanden (Felder: digest, items, retained, tools_sha256)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evidence_verify`

Validierung eines Evidenzpakets.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: ok)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_disasm`

EVM-Bytecode-Disassembly (offline).

- Eingabefelder:
  - `hex` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, detay, ok, ozet)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_selector`

EVM-4-Byte-Selektor (keccak, offline).

- Eingabefelder:
  - `sig` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_selectors`

EVM-Selektorkandidaten.

- Eingabefelder:
  - `hex` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_stats`

EVM-Opcode-Statistik.

- Eingabefelder:
  - `hex` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_fallback`

Fallback-Kette, falls das primäre fehlt.

- Eingabefelder:
  - `birincil` (string, erforderlich)
  - `mevcut` (string[], erforderlich)
- outputSchema: keine
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_firmware_caps`

Firmware-Verfügbarkeitsprüfung.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_firmware_extract`

Firmware-Extraktion.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: ok, summary, tool)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_firmware_handoff`

Firmware-Handoff-Notiz.

- Eingabefelder:
  - `neden` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: handoff, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_blutter`

Dart-Analyse mit Blutter (ehrlicher Fehler, falls nicht vorhanden).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: izler, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_payload`

Flutter-Payload-Spuren.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: izler, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_scan`

Flutter-/Dart-Spurenscan.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: buildId, dartMi, motor, ok, summary, tool, tur)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_snapshot`

Flutter-AOT-Snapshot-Info (Dart-Magic + Version).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: dartMi, dartSurumu, izolasyon, magic, ok, summary, tool, tur)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_frida_api`

API-Tracer (Name+Args+Retval).

- Eingabefelder:
  - `desen` (string, optional)
  - `pid` (integer, erforderlich)
- outputSchema: vorhanden (Felder: arac, cagrilar, ok, pid, sayi)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_frida_cond`

Bedingter Breakpoint.

- Eingabefelder:
  - `adres` (string, erforderlich)
  - `kosul` (string, erforderlich)
  - `pid` (integer, erforderlich)
- outputSchema: vorhanden (Felder: adres, arac, hitSayisi, ok, pid, tuttu)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_pause`

Anhalten des Zielprozesses (NtSuspend).

- Eingabefelder:
  - `pid` (integer, erforderlich)
- outputSchema: vorhanden (Felder: arac, durum, ok, pid)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_resume`

Fortsetzen eines angehaltenen Prozesses.

- Eingabefelder:
  - `pid` (integer, erforderlich)
- outputSchema: vorhanden (Felder: arac, durum, ok, pid)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_stalker`

Stalker-Call-Tracing.

- Eingabefelder:
  - `pid` (integer, erforderlich)
  - `sure_ms` (integer, optional)
- outputSchema: vorhanden (Felder: arac, cagrilar, ok, pid, sayi)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_frida_step`

Next-Instruction-Emulation.

- Eingabefelder:
  - `adres` (string, optional)
  - `pid` (integer, erforderlich)
- outputSchema: vorhanden (Felder: adres, arac, ok, pid, sonraki, vurdu)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_fs_diff`

Snapshot-Diff.

- Eingabefelder:
  - `once` (string, erforderlich)
  - `sonra` (string, erforderlich)
- outputSchema: vorhanden (Felder: kayıt, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_fs_snapshot`

Verzeichnis-Snapshot.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: kayıt, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ghidra_analyze`

Ghidra-Headless-Import+Analyse.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, hedef, log, ok)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_decompile`

Ghidra-Pseudocode.

- Eingabefelder:
  - `addr` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: addr, arac, hedef, kod, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_disasm`

Ghidra-Disassembly.

- Eingabefelder:
  - `addr` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: addr, arac, hedef, kod, ok, sayi, talimatlar)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_funcs`

Ghidra-Funktionsliste.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, fonksiyonlar, hedef, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_strings`

Ghidra-Stringliste.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, hedef, ok, strings)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_trace`

Snapshot-zu-Ghidra-Trace-Import.

- Eingabefelder:
  - `kayit` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, hedef, ok, sonuc)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_vt`

Zwei-Binär-Funktionsdiff (Versionstracking).

- Eingabefelder:
  - `eski` (string, erforderlich)
  - `yeni` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, degisen, eklenen, eski, ok, ozet, silinen, yeni)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_xrefs`

Ghidra-Xref-Liste.

- Eingabefelder:
  - `addr` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: addr, arac, hedef, ok, xrefs)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_go_buildinfo`

Go-Build-ID + Modulabhängigkeiten.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_funclines`

Go-Funktions- + Datei:Zeile-Mapping.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_goresym`

GoReSym-Analyse (ehrlicher Fehler, falls nicht vorhanden).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_module`

Go-Modulinfo.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_version`

Go-Versionsspur.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hap_liste`

HAP-Dateiliste.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, dosya, dosyalar, ok, sayi)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hap_manifest`

HAP-Manifest (Bundle/Version).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, bundleName, dosya, kaynak, ok, version)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hopper_istek`

Hopper-Requestdatei-Erzeugung.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: adresler, arac, hedef, hopper, istekDosyasi, ok)
- annotations: vorhanden (destructiveHint=true, readOnlyHint=false)

### `rea_hopper_tara`

String-/Regex-Suche in Dateien.

- Eingabefelder:
  - `desen` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, desen, eslesmeler, hedef, ok, regex, sayi)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ida_flirt`

String-basierte Compiler-/Bibliotheksschätzung (keine echte FLIRT-Signatur; falls IDA installiert ist, rea_ida_idb-Ausgabe zur Verifikation in IDA mit angewandter Signatur nutzen).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, eslesmeler, guven, hedef, idaMevcut, kutuphane, method, not, ok, sayi, surumler)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ida_idb`

IDB-Batch-Erzeugung (idat).

- Eingabefelder:
  - `out` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, hedef, idat, idb, ok)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_il2cpp_dump`

Dump mit Il2CppDumper (ehrlicher Fehler, falls nicht vorhanden).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, cikti, dosya, dosyaSayisi, log, ok, ozet)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_il2cpp_metadata`

IL2CPP-global-metadata-Klassen-/Methodenzählung.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, assemblySayisi, dosya, goruntuSayisi, metodSayisi, not, ok, ozet, sinifSayisi, surum)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_il2cpp_methods`

IL2CPP-Methodensignaturen (ehrliches Flag, falls eingeschränkt).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, dosya, imzaSayisi, imzalar, metodSayisi, not, ok, sinirli, surum)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ilspy_decompile`

.NET-C#-Dekompilierung.

- Eingabefelder:
  - `out` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, ciktiDir, cs_sayisi, dosya, not, ok)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_investigate`

Automatischer Untersuchungsplan (Sniff+Score+Fallback).

- Eingabefelder:
  - `path` (string, erforderlich)
  - `soru` (string, optional)
- outputSchema: vorhanden (Felder: arac, motor, ok, plan, skor, tip, yedekler)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_classes`

APK-Klassenliste.

- Eingabefelder:
  - `apk_path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, ok, siniflar, toplam_sinif)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_jadx_decompile`

APK-Einzelklassen-Dekompilierung.

- Eingabefelder:
  - `apk_path` (string, erforderlich)
  - `out` (string, erforderlich)
  - `sinif` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, bayt, ciktiDir, dosya, ok, sinif)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_jadx_full`

APK-Volldekompilierung.

- Eingabefelder:
  - `apk_path` (string, erforderlich)
  - `out` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, ciktiDir, java_dosya_sayisi, ok)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_jadx_manifest`

APK-Manifest-Zusammenfassung.

- Eingabefelder:
  - `apk_path` (string, erforderlich)
- outputSchema: vorhanden (Felder: aktiviteler, apk, arac, izinler, ok, paket)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_jadx_methods`

Methodenliste in Dekompilierungsausgabe.

- Eingabefelder:
  - `dir` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, methodlar, ok)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_read`

Dekompilierungsklassen-Lesen (400 Zeilen).

- Eingabefelder:
  - `dir` (string, erforderlich)
  - `sinif` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, dosya, ok, satirlar, toplam_satir)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_xrefs`

Begriffssuche in Dekompilierungsausgabe.

- Eingabefelder:
  - `dir` (string, erforderlich)
  - `terim` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, kayitlar, ok)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jeb_sorgu`

JEB-MCP-Abfrage.

- Eingabefelder:
  - `govde` (string, optional)
  - `url` (string, erforderlich)
  - `yontem` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, durum, govde, ok, url, yontem)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_js_bundle`

Bundle-Zusammenfassung.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_export_shape`

Export-Form.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_require`

Require-/Import-Graph.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_sourcemap`

Source-Map-Auflösung.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_classdump`

class-dump-Ausgabe (ehrlicher Fehler, falls nicht vorhanden).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_info`

Mach-O-Header (Architektur + Dateityp).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_loads`

Mach-O-Load-Kommandos (Segment/Dylib).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_objc`

ObjC-Klassen-/Kategorieliste (reines Lesen).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_otool`

otool-Ausgabe (ehrlicher Fehler, falls nicht vorhanden).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_compare`

Managed-Member-Diff.

- Eingabefelder:
  - `a` (string, erforderlich)
  - `b` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, detay, ok, ozet)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_import`

Rekonstruktionsdatensatz.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, detay, ok, ozet)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_verify`

Native-Abhängigkeitsvalidierung.

- Eingabefelder:
  - `beklenen` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, detay, ok, ozet)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_mips_funcs`

MIPS-Funktions-Prescan.

- Eingabefelder:
  - `b64` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_mips_psp_profile`

MIPS-/PSP-Profil.

- Eingabefelder:
  - `b64` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_missing_reason`

Fehlendes Werkzeug + Installationsbefehl.

- Eingabefelder:
  - `eksik` (string, erforderlich)
  - `platform` (string, optional)
- outputSchema: vorhanden (Felder: alternatif, eksik, kur, neden)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_net_capture`

Lokale Netzwerkaufzeichnung (HAR).

- Eingabefelder:
  - `url` (string, erforderlich)
- outputSchema: vorhanden (Felder: kayıt, ok, summary, tool)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_obligation_advance`

Ring-Weiterschaltung.

- Eingabefelder:
  - `bulgu` (string, erforderlich)
  - `defter` (string, erforderlich)
  - `kod` (string, erforderlich)
- outputSchema: vorhanden (Felder: links)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_close`

Ledger-Versiegelung.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: kapatıldı, links)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_ledger`

Ledger-Einrichtung.

- Eingabefelder:
  - `bulgular` (string[], erforderlich)
  - `evidence_digest` (string, erforderlich)
  - `tools_sha256` (string, erforderlich)
- outputSchema: vorhanden (Felder: evidence_digest, kapatıldı, ledger_id, links, tools_sha256)
- annotations: vorhanden (destructiveHint=false, idempotentHint=false, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_verify`

Kettenvalidierung.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: eksik, ok)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pcap_oku`

PCAP-Stream-Reassemblierung + Keylog-TLS-Entschlüsselung.

- Eingabefelder:
  - `keylog` (string, optional)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pdb_indir`

PDB-Download vom Microsoft-Symbolserver aus dem CodeView-RSDS-Datensatz des PE-Debug-Verzeichnisses + Integrität + Cache.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, cache, dosya, guid, ok, pdb, url, yas, yol)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_pdb_yolu`

PDB-Pfad aus dem PE-Debug-Verzeichnis.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, dosya, guid, ok, pdb, yas)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_imports`

PE-Importliste.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, dlls, dosya, fonksiyonlar, not, ok, sayi)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_info`

PE-Header-Info.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, bit, dosya, entry, entry_hex, machine, machine_hex, ok, section_sayisi)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_sections`

PE-Section-Tabelle.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, bolumler, dosya, ok, sayi)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_caps`

Prozess-Verfügbarkeitsprüfung.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: kayıt, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_compare`

Pipe-/PTY-Vergleich.

- Eingabefelder:
  - `cmd` (string, erforderlich)
- outputSchema: keine
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_run`

Prozesslauf-Aufzeichnung.

- Eingabefelder:
  - `cmd` (string, erforderlich)
- outputSchema: vorhanden (Felder: kayıt, ok, summary, tool)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_pwn_elf_layout`

ELF-Layout + Mitigations.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: keine
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pwn_gadgets`

Gadget-Hinweis.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_r2_callgraph`

r2-Funktions-Callgraph.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, fonksiyonlar, hedef, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_r2_debug`

r2-Batch-Debugging (bp+regs).

- Eingabefelder:
  - `addr` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, bpAddr, cikti, hedef, not, ok)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_r2_esil`

r2-ESIL-Emulations-Regs.

- Eingabefelder:
  - `addr` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: addr, adim, arac, hedef, ok, regs)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_readiness`

Rekonstruktionsvorbereitungs-Score.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, eksik, ok, seviye, skor)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_funcs`

Pseudocode-Funktionsliste.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_harness`

C-Harness-Skelett.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_tag`

Fall-Label.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_registry_izi`

Registry-Schreibzugriffe aus API-Ereignissen.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_scan_repo`

Repo-Scan (Typ+Plan).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_scan_repo_paralel`

Paralleler Repo-Scan (4er-Pool, abbrechbar).

- Eingabefelder:
  - `eszamanlilik` (integer, optional)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, iptalEdildi, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_sniff`

Dateityp- + Engine-Empfehlung (Magic-Byte).

- Eingabefelder:
  - `b64dosya` (string, erforderlich)
- outputSchema: vorhanden (Felder: motor, tip)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_storage_dump`

Cookies + localStorage.

- Eingabefelder:
  - `url` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_typedef_oner`

Argumentnamenvorschlag + Propagation.

- Eingabefelder:
  - `text` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, ok, oneriler, sayi)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_unpack_hunt`

Geführter Ablauf für unbekannte Packer.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: adimlar, arac, karar, ok)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_unpack_try`

Automatische Unpack-Weiterleitung.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: sonuc, yontem)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_upx_info`

UPX-gepackt-Info.

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, cikti, dosya, not, ok, sikisik)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_upx_unpack`

UPX-Entpacken.

- Eingabefelder:
  - `out` (string, erforderlich)
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, cikti, dosya, log, ok)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_wasm_decode`

WASM-/WAT-Auflösung (wabt).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `rea_wasm_exports`

WAT-Exportliste (offline).

- Eingabefelder:
  - `wat` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_imports`

WASM-Importliste.

- Eingabefelder:
  - `b64` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_sections`

WASM-Section-Tabelle.

- Eingabefelder:
  - `b64` (string, erforderlich)
- outputSchema: vorhanden (Felder: details, ok, summary, tool)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_validate`

WASM-Validierung (wasm-validate).

- Eingabefelder:
  - `path` (string, erforderlich)
- outputSchema: vorhanden (Felder: arac, detay, ok, ozet)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `session_close`

Verwirft eine Anwendungssitzung samt Ereignispuffer.

- Eingabefelder:
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: closed, session_id)
- annotations: vorhanden (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `session_list`

Listet Anwendungssitzungen in diesem Prozess auf.

- Eingabefelder: keine
- outputSchema: vorhanden (Felder: sessions)
- annotations: vorhanden (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `session_open`

Öffnet eine Anwendungssitzung für eine Engine. Gibt session_id für spätere Werkzeugargumente zurück.

- Eingabefelder:
  - `engine` (enum, erforderlich)
- outputSchema: vorhanden (Felder: createdAt, engine, session_id)
- annotations: vorhanden (destructiveHint=false, idempotentHint=false, openWorldHint=false, readOnlyHint=false)

### `static_info`

Meldet radare2-Static-Engine-Fähigkeiten, r2-Verfügbarkeit und das geöffnete Ziel, falls vorhanden.

- Eingabefelder:
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: capabilities, engine, r2, session_id, target)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `strings`

Strings in der Binärdatei (Adresse, Section, Länge, Text).

- Eingabefelder:
  - `limit` (integer, optional) — Max strings returned (default 200).
  - `min_length` (integer, optional) — Keep strings with length >= this (default 0).
  - `offset` (integer, optional) — Skip this many matches (default 0).
  - `section` (string, optional) — Only strings from this section, e.g. ".rodata".
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: offset, session_id, strings, total)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

### `xrefs`

Querverweise zu und von einer Adresse (Code und Daten).

- Eingabefelder:
  - `address` (string | number, erforderlich) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `direction` (enum, optional)
  - `session_id` (string, erforderlich) — Application session id. Not an MCP protocol session.
- outputSchema: vorhanden (Felder: address, from, session_id, to)
- annotations: vorhanden (openWorldHint=true, readOnlyHint=false)

## Resources

- `rea-plus://capabilities-safety` — Name: `capabilities-safety` — mimeType: `application/json` — Statische Zusammenfassung der Fähigkeiten und Sicherheitsregeln (schreibgeschützt).
- `rea-plus://server-info` — Name: `server-info` — mimeType: `application/json` — Statische Server-Identität und Oberflächenzusammenfassung (schreibgeschützt).

## Prompts

- `android-triage` — Argumente: `focus` (optional), `path` (erforderlich) — Statischer jadx-basierter Triage-Ablauf für APKs (nebeneffektfreier Prompt).
- `dotnet-malware-triage` — Argumente: `focus` (optional), `path` (erforderlich) — Statischer Malware-Triage-Ablauf für .NET-Samples (nebeneffektfreier Prompt).
- `packer-triage` — Argumente: `focus` (optional), `path` (erforderlich) — Sequenzieller, statik-priorisierter rea-Ablauf zur Packer-/Schutzerkennung (nebeneffektfreier Prompt).
