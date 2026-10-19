# Référence des outils ReaPlus

> Ce fichier est généré automatiquement ; ne le modifiez pas à la main. Source : la
> surface MCP réelle du serveur compilé (`dist/server.js`). Pour le régénérer :
> `npm run build && node scripts/generate-tool-reference.mjs`

## Résumé

- Serveur : `rea-plus` 0.12.0
- Total outils : 191
- Total resources : 2
- Total prompts : 3
- Outils avec outputSchema : 187
- Outils avec annotations : 191

## Outils

### `close_target`

Libère la cible binaire (et son processus radare2) détenue par une session.

- Champs d'entrée :
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : closed, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_attach`

Attachement par pid ou, sur une session frida, connexion à un Gadget Frida à l'écoute (gadget hôte:port) ou à un paquet mobile en cours d'exécution sur USB (usb + package). La cible continue de tourner après debug_close.

- Champs d'entrée :
  - `auto_analyze` (boolean, optionnel) — Run x64dbg auto-analysis after attaching (slower).
  - `break_on_entry` (boolean, optionnel) — Pause the debuggee right after attaching.
  - `gadget` (string, optionnel) — Frida Gadget listen address host:port. For targets that cannot be attached by pid.
  - `package` (string, optionnel) — Process or mobile package name. Defaults to Gadget. Required with usb.
  - `pid` (integer, optionnel) — Live process id. Required unless gadget or usb is set.
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
  - `usb` (boolean, optionnel) — Use the USB Frida device (phone or tablet) instead of a host:port Gadget.
- outputSchema : présent (champs : architecture, attached, engine, entry_point, mode, module_base, module_entry, path, pid, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_breakpoint`

Définit, supprime ou liste les breakpoints. L'adresse peut être hexadécimale, un nombre ou une expression x64dbg.

- Champs d'entrée :
  - `action` (enum, optionnel)
  - `address` (string | number, optionnel) — Required for set/remove; ignored for list.
  - `condition` (string, optionnel) — Break condition expression (set only).
  - `log_text` (string, optionnel) — Log text on hit (set only).
  - `name` (string, optionnel) — Breakpoint name (set only).
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
  - `type` (enum, optionnel)
- outputSchema : présent
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_callstack`

Lit la pile d'appels du thread courant (adresse, module, fonction par cadre).

- Champs d'entrée :
  - `max_frames` (integer, optionnel) — Max frames returned (default 50).
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : frames, session_id, threadId)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `debug_close`

Démonte le processus x64dbg caché détenu par une session. Les cibles lancées sont arrêtées ; les cibles attachées sont détachées et laissées en cours d'exécution.

- Champs d'entrée :
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : closed, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_code`

Code live : désassemble à une adresse (par défaut le pointeur d'instruction arrêté), assemble une instruction, ou s'exécute jusqu'à une adresse. Exige confirm:true.

- Champs d'entrée :
  - `action` (enum, requis)
  - `address` (string | number, optionnel) — Address as hex ("0x140001000"), decimal, or an engine expression ("cip").
  - `confirm` (boolean, optionnel) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `count` (integer, optionnel) — Instruction count for disassemble (default 12).
  - `instruction` (string, optionnel) — Single instruction for assemble.
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_continue`

Reprend le débogué jusqu'au prochain breakpoint, pas-à-pas unique, ou sortie. L'arrêt publie un événement (debug.breakpoint_hit / debug.exited / debug.paused) récupérable via events_pull.

- Champs d'entrée :
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : address, reason, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_memory`

Mémoire du processus live : lecture, recherche ou dump. Exige confirm:true. Sans lui, l'appel renvoie confirmation_required et ne touche pas au débogué.

- Champs d'entrée :
  - `action` (enum, requis)
  - `address` (string | number, optionnel) — Read/dump address.
  - `confirm` (boolean, optionnel) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `length` (integer, optionnel) — Search length in bytes (default 4096, or the main module).
  - `max_results` (integer, optionnel)
  - `pattern` (string, optionnel) — Search pattern. Hex bytes, or ascii when search_type is ascii.
  - `search_type` (enum, optionnel)
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
  - `size` (integer, optionnel) — Byte count for read (default 64) or dump (default 256).
  - `start_address` (string | number, optionnel) — Address as hex ("0x140001000"), decimal, or an engine expression ("cip").
- outputSchema : présent
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `debug_open`

Ouvre une cible PE pour le débogage live sur le moteur de debug de cette session. Auto-détecte x86/x64 et laisse le débogué en pause. x64dbg s'arrête à l'entrée ; cdb s'arrête au breakpoint initial du chargeur et rapporte l'entrée PE.

- Champs d'entrée :
  - `auto_analyze` (boolean, optionnel) — Run x64dbg auto-analysis after loading (slower).
  - `break_on_entry` (boolean, optionnel) — Stop at the entry point after loading.
  - `command_line_args` (string, optionnel) — Command line arguments for the debuggee.
  - `path` (string, requis) — Filesystem path of the PE binary to debug.
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : architecture, attached, engine, entry_point, mode, module_base, module_entry, opened, path, pid, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_pause`

Interrompt de façon asynchrone un débogué en cours d'exécution. Idempotent quand déjà en pause.

- Champs d'entrée :
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : address, reason, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_plugin`

x64dbg Scylla et ScyllaHide. status rapporte les fichiers sur disque. dump et hide n'ouvrent pas de fenêtre : un plugin headless manquant renvoie engine_unavailable avec le chemin des plugins. Exige confirm:true. cdb et frida renvoient capability_unsupported.

- Champs d'entrée :
  - `action` (enum, requis)
  - `confirm` (boolean, optionnel) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `debug_registers`

Lit les registres du débogué (généraux + flags ; segment/debug en option).

- Champs d'entrée :
  - `include_debug` (boolean, optionnel) — Include debug registers.
  - `include_segment` (boolean, optionnel) — Include segment registers.
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : debug, flags, general, segment, session_id)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `debug_state`

Rapporte l'état de debug live (en cours/en pause/terminé + raison de pause) et la cible ouverte, le cas échéant.

- Champs d'entrée :
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `debug_step`

Exécute le débogué au pas-à-pas (dans ou par-dessus les appels) et rapporte le nouvel emplacement.

- Champs d'entrée :
  - `count` (integer, optionnel) — Steps to take (default 1).
  - `kind` (enum, optionnel)
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : address, disassembly, function, kind, module, registers, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_thread`

Threads live : liste, sélection, gel, dégel, ou lecture du contexte d'un thread. L'id est la valeur renvoyée par list (index cdb, id de thread OS x64dbg/frida). Exige confirm:true. Frida n'a pas d'API de suspension ni de commutation.

- Champs d'entrée :
  - `action` (enum, requis)
  - `confirm` (boolean, optionnel) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
  - `thread_id` (integer, optionnel)
- outputSchema : présent
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_time`

Instantané de checkpoint, chronologie des checkpoints, et retour en arrière d'un checkpoint. Un checkpoint comprend les registres du thread actif, la liste des threads et une fenêtre mémoire. Exige confirm:true.

- Champs d'entrée :
  - `action` (enum, requis)
  - `checkpoint_id` (string, optionnel)
  - `confirm` (boolean, optionnel) — Must be true or the tool returns confirmation_required and does not touch the debuggee.
  - `memory_size` (integer, optionnel) — Bytes captured at the instruction pointer (default 64).
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `disassemble`

Désassemble les instructions à une adresse (linéaire, `count` ops) ou une fonction entière. Par défaut la fonction d'entrée.

- Champs d'entrée :
  - `address` (string | number, optionnel) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `count` (integer, optionnel) — Ops for address mode (default 32).
  - `function` (string, optionnel) — Function name or address, e.g. "entry0".
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : count, location, ops, session_id, text)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `dump`

Lit des octets bruts à une adresse comme texte hexdump ou tableau d'octets JSON.

- Champs d'entrée :
  - `address` (string | number, requis) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `format` (enum, optionnel)
  - `length` (integer, optionnel) — Bytes to read (default 128).
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : address, bytes, format, length, session_id, text)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `events_pull`

Tire les événements stockés pour une session applicative depuis un numéro de séquence. Ne souscrit pas aux notifications push.

- Champs d'entrée :
  - `after` (integer, optionnel) — Return events with seq greater than this.
  - `limit` (integer, optionnel)
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : events, retainedFrom, session_id)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `explain`

Courte explication en français d'une fenêtre d'assemblage : ce que fait la région, où elle saute, et quels appels notifient l'utilisateur ou le système. Passez des instructions déjà désassemblées, ou un session_id. Une session de debug live n'est lue que quand confirm vaut true. Appelez ceci quand l'utilisateur demande ce que signifie l'assemblage.

- Champs d'entrée :
  - `address` (string | number, optionnel) — Address to disassemble when instructions are omitted.
  - `confirm` (boolean, optionnel) — Required only when explain itself disassembles a live debug session. Pasted instructions skip this.
  - `count` (integer, optionnel) — How many instructions to read (default 16).
  - `instructions` (object[], optionnel) — Already fetched ops. When set, the debugger is not called.
  - `session_id` (string, optionnel) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : atlamalar, bildirimler, cagrilar, dil, gosterilen, kaynak, komut_sayisi, ozet, satirlar)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `get_cfg`

Graphe de flot de contrôle d'une fonction en JSON et/ou DOT Graphviz. Par défaut la fonction d'entrée.

- Champs d'entrée :
  - `address` (string | number, optionnel) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `format` (enum, optionnel)
  - `function` (string, optionnel) — Function name or address, e.g. "entry0".
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : dot, function, json, location, session_id)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `health`

Rapporte la vivacité du pont. Ne touche à aucun moteur de débogage.

- Champs d'entrée : aucun
- outputSchema : présent (champs : name, protocol, sessions, status)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `open_target`

Ouvre une cible binaire pour l'analyse statique dans une session radare2. Seul le mode 'static' est pris en charge ; tout autre est une erreur de capacité. Exige r2 sur le PATH.

- Champs d'entrée :
  - `mode` (string, optionnel) — Analysis mode. Only "static" is supported.
  - `path` (string, requis) — Filesystem path of the binary to analyze.
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : engine, mode, opened, path, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `prerequisites`

Vérifie les programmes qu'utilise Conduit (radare2, x64dbg, cdb, Python, Frida, Graphviz, ScyllaHide). Les manquants incluent une URL de téléchargement et où déposer les fichiers. Le pont ne les télécharge pas. Appelez ceci quand un outil manque ou avant de choisir un moteur.

- Champs d'entrée : aucun
- outputSchema : présent (champs : araclar, ozet)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=true, readOnlyHint=true)

### `rea_adb_devices`

Liste des appareils connectés.

- Champs d'entrée : aucun
- outputSchema : présent (champs : arac, cihazlar, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_adb_install`

Installation d'un APK sur l'appareil.

- Champs d'entrée :
  - `apk_path` (string, requis)
  - `seri` (string, optionnel)
- outputSchema : présent (champs : apk, arac, ok, sonuc)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_adb_logcat`

Dump logcat de l'appareil.

- Champs d'entrée :
  - `seri` (string, optionnel)
- outputSchema : présent (champs : arac, ok, satirlar, toplam_satir)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_adb_packages`

Liste des paquets installés.

- Champs d'entrée :
  - `filtre` (string, optionnel)
  - `seri` (string, optionnel)
- outputSchema : présent (champs : arac, ok, paketler)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_adb_screencap`

Capture d'écran de l'appareil.

- Champs d'entrée :
  - `out` (string, requis)
  - `seri` (string, optionnel)
- outputSchema : présent (champs : arac, bayt, ok, yol)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_android_dinamik_recete`

Production d'une recette d'analyse dynamique Android.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, ok, recete)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_android_recete_dogrula`

Validation à sec d'une recette.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : adim_sayisi, arac, ok)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_detect`

Signal NativeAOT.

- Champs d'entrée :
  - `b64dosya` (string, requis)
  - `metin` (string, optionnel)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_objc`

Traces de dispatch ObjC.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_profile`

Profil AOT.

- Champs d'entrée :
  - `b64dosya` (string, requis)
  - `metin` (string, optionnel)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_swift`

Traces de dispatch Swift.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apktool_build`

Reconstruction d'un APK depuis un répertoire décodé.

- Champs d'entrée :
  - `dir` (string, requis)
  - `out` (string, requis)
- outputSchema : présent (champs : arac, ciktiApk, ok, proje)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_caps`

Sondage des capacités apktool.

- Champs d'entrée : aucun
- outputSchema : présent (champs : aapt2, aapt2Tamam, apktool, arac, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_apktool_decode`

Décodage d'APK (resources).

- Champs d'entrée :
  - `apk_path` (string, requis)
  - `out` (string, requis)
- outputSchema : présent (champs : apk, arac, ciktiDir, ok)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_framework`

Installation d'un APK framework.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : apk, arac, ok)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_info`

Versions apktool+aapt2.

- Champs d'entrée : aucun
- outputSchema : présent (champs : arac, ok, surum)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_apple_bundle`

Anatomie d'un bundle.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apple_macho`

Magie Mach-O + liste dyld.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apple_plist`

Lecture de clés Info.plist.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_behavior_full`

Rapport comportemental en un seul appel.

- Champs d'entrée :
  - `api` (string, requis)
  - `net` (string, optionnel)
- outputSchema : présent (champs : bulgular, cizelge, ok, ozet, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_behavior_timeline`

Chronologie d'événements + résumé.

- Champs d'entrée :
  - `olaylar` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_best_motor`

Meilleur moteur (score) pour un type de cible.

- Champs d'entrée :
  - `adaylar` (string[], requis)
  - `tip` (string, requis)
- outputSchema : absent
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_bindiff_fonksiyonlar`

Liste de fonctions d'un binaire (nom/adresse + hash).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, bicim, dosya, fonksiyonlar, istatistik, ok, sayi, sembollu)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_bindiff_karsilastir`

Diff de fonctions entre deux versions.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : arac, aynen, cikarilan, degisen, eklenen, eski, istatistik, ok, ozet, yeni)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_browser_caps`

Sondage des capacités navigateur.

- Champs d'entrée : aucun
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_browser_click`

Clic + état après clic.

- Champs d'entrée :
  - `selector` (string, requis)
  - `url` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_browser_har_import`

Import HAR.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_browser_nav`

Ouverture de page + titre.

- Champs d'entrée :
  - `url` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_browser_scenario`

Enregistrement de scénario.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_browser_shot`

Capture d'écran pleine page.

- Champs d'entrée :
  - `out` (string, requis)
  - `url` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_config_suggest`

Snippet de config MCP pour les outils trouvés.

- Champs d'entrée :
  - `bulunan` (string[], requis)
- outputSchema : présent (champs : snippet)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_console_yakala`

Messages de console.

- Champs d'entrée :
  - `url` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_coverage`

Taux de couverture.

- Champs d'entrée :
  - `incelenen` (integer, requis)
  - `toplam` (integer, requis)
- outputSchema : présent (champs : arac, kalan, ok, oran)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_append`

Ajout d'un événement de plantage.

- Champs d'entrée :
  - `olay` (string, requis)
  - `olaylar` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_hint`

Indice de plantage.

- Champs d'entrée :
  - `olaylar` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_kayit_parse`

Analyse d'une note de plantage.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : arac, ok, registerlar, sinyal, threadSayisi, threadler)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_ozet`

Résumé de plantage.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : arac, ilkFrame, ok, registerSayisi, sinyal, threadSayisi)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_timeline`

Chronologie de plantage.

- Champs d'entrée :
  - `olaylar` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_cutter_caps`

Sondage des capacités Cutter/rizin.

- Champs d'entrée : aucun
- outputSchema : présent (champs : arac, ok, pdc, surum)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_decompile`

Pseudo-décompilation Cutter.

- Champs d'entrée :
  - `addr` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : addr, arac, hedef, kaynak, kod, not, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_disasm`

Désassemblage Cutter/rizin.

- Champs d'entrée :
  - `addr` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : addr, arac, hedef, ok, ops)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_funcs`

Liste de fonctions Cutter/rizin.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, fonksiyonlar, hedef, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_strings`

Liste de chaînes Cutter/rizin.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, hedef, ok, strings)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_xrefs`

Liste de xrefs Cutter/rizin.

- Champs d'entrée :
  - `addr` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : addr, arac, hedef, ok, xrefs)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_diff_match`

Mise en correspondance de fonctions (tableaux JSON).

- Champs d'entrée :
  - `a` (string, requis)
  - `b` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_diff_summary`

Résumé ajoutés/supprimés.

- Champs d'entrée :
  - `a` (string, requis)
  - `b` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_com`

Détection COM.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_int21`

Balayage d'appels INT21.

- Champs d'entrée :
  - `b64` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_mz`

Vérification d'en-tête MZ.

- Champs d'entrée :
  - `b64` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_psp`

Analyse de struct PSP.

- Champs d'entrée :
  - `b64` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dosya_izi`

Écritures/lectures de fichiers depuis des événements API.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dotnet_cil`

Dump de méthodes CIL (dnfile).

- Champs d'entrée :
  - `filtre` (string, optionnel)
  - `path` (string, requis)
- outputSchema : présent (champs : arac, assembly, dosya, filtre, method_sayisi, methods, not, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_dotnet_metadata`

Lecture de métadonnées d'assembly.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, clr, dosya, not, ok, okuyucu)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_dwarf_ozet`

Résumé DWARF d'ELF.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, dosya, fonksiyonAdlari, ok, subprogramSayisi, unitSayisi)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evidence_bundle`

Assemblage d'un paquet de preuves.

- Champs d'entrée :
  - `ogeler` (string, requis)
  - `sakli` (string, requis)
- outputSchema : présent (champs : digest, items, retained, tools_sha256)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evidence_verify`

Vérification d'un paquet de preuves.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : ok)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_disasm`

Désassemblage de bytecode EVM (hors ligne).

- Champs d'entrée :
  - `hex` (string, requis)
- outputSchema : présent (champs : arac, detay, ok, ozet)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_selector`

Sélecteur EVM 4 octets (keccak, hors ligne).

- Champs d'entrée :
  - `sig` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_selectors`

Candidats sélecteurs EVM.

- Champs d'entrée :
  - `hex` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_stats`

Statistique d'opcodes EVM.

- Champs d'entrée :
  - `hex` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_fallback`

Chaîne de repli quand le primaire manque.

- Champs d'entrée :
  - `birincil` (string, requis)
  - `mevcut` (string[], requis)
- outputSchema : absent
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_firmware_caps`

Sondage des capacités firmware.

- Champs d'entrée : aucun
- outputSchema : présent (champs : ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_firmware_extract`

Extraction de firmware.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : ok, summary, tool)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_firmware_handoff`

Note de handoff firmware.

- Champs d'entrée :
  - `neden` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : handoff, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_blutter`

Analyse Dart avec Blutter (erreur honnête si absent).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : izler, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_payload`

Traces de payload Flutter.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : izler, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_scan`

Balayage de traces Flutter/Dart.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : buildId, dartMi, motor, ok, summary, tool, tur)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_snapshot`

Infos de snapshot AOT Flutter (magie Dart + version).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : dartMi, dartSurumu, izolasyon, magic, ok, summary, tool, tur)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_frida_api`

Traceur d'API (nom+args+retval).

- Champs d'entrée :
  - `desen` (string, optionnel)
  - `pid` (integer, requis)
- outputSchema : présent (champs : arac, cagrilar, ok, pid, sayi)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_frida_cond`

Breakpoint conditionnel.

- Champs d'entrée :
  - `adres` (string, requis)
  - `kosul` (string, requis)
  - `pid` (integer, requis)
- outputSchema : présent (champs : adres, arac, hitSayisi, ok, pid, tuttu)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_pause`

Mise en pause du processus cible (NtSuspend).

- Champs d'entrée :
  - `pid` (integer, requis)
- outputSchema : présent (champs : arac, durum, ok, pid)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_resume`

Reprise d'un processus en pause.

- Champs d'entrée :
  - `pid` (integer, requis)
- outputSchema : présent (champs : arac, durum, ok, pid)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_stalker`

Suivi d'appels Stalker.

- Champs d'entrée :
  - `pid` (integer, requis)
  - `sure_ms` (integer, optionnel)
- outputSchema : présent (champs : arac, cagrilar, ok, pid, sayi)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_frida_step`

Émulation de l'instruction suivante.

- Champs d'entrée :
  - `adres` (string, optionnel)
  - `pid` (integer, requis)
- outputSchema : présent (champs : adres, arac, ok, pid, sonraki, vurdu)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_fs_diff`

Diff d'instantanés.

- Champs d'entrée :
  - `once` (string, requis)
  - `sonra` (string, requis)
- outputSchema : présent (champs : kayıt, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_fs_snapshot`

Instantané de répertoire.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : kayıt, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ghidra_analyze`

Import+analyse Ghidra headless.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, hedef, log, ok)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_decompile`

Pseudo-code Ghidra.

- Champs d'entrée :
  - `addr` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : addr, arac, hedef, kod, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_disasm`

Désassemblage Ghidra.

- Champs d'entrée :
  - `addr` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : addr, arac, hedef, kod, ok, sayi, talimatlar)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_funcs`

Liste de fonctions Ghidra.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, fonksiyonlar, hedef, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_strings`

Liste de chaînes Ghidra.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, hedef, ok, strings)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_trace`

Import d'instantané vers Ghidra Trace.

- Champs d'entrée :
  - `kayit` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : arac, hedef, ok, sonuc)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_vt`

Diff de fonctions entre deux binaires (version tracking).

- Champs d'entrée :
  - `eski` (string, requis)
  - `yeni` (string, requis)
- outputSchema : présent (champs : arac, degisen, eklenen, eski, ok, ozet, silinen, yeni)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_xrefs`

Liste de xrefs Ghidra.

- Champs d'entrée :
  - `addr` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : addr, arac, hedef, ok, xrefs)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_go_buildinfo`

Build-id Go + dépendances de modules.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_funclines`

Fonctions Go + mise en correspondance fichier:ligne.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_goresym`

Analyse GoReSym (erreur honnête si absent).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_module`

Infos de module Go.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_version`

Trace de version Go.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hap_liste`

Liste de fichiers HAP.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, dosya, dosyalar, ok, sayi)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hap_manifest`

Manifeste HAP (bundle/version).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, bundleName, dosya, kaynak, ok, version)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hopper_istek`

Production d'un fichier de requête Hopper.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : adresler, arac, hedef, hopper, istekDosyasi, ok)
- annotations : présentes (destructiveHint=true, readOnlyHint=false)

### `rea_hopper_tara`

Balayage string/regex dans un fichier.

- Champs d'entrée :
  - `desen` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : arac, desen, eslesmeler, hedef, ok, regex, sayi)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ida_flirt`

Estimation compilateur/bibliothèque basée sur les chaînes (pas une vraie signature FLIRT ; si IDA est installé, utilisez la sortie rea_ida_idb en appliquant la signature dans IDA pour vérifier).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, eslesmeler, guven, hedef, idaMevcut, kutuphane, method, not, ok, sayi, surumler)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ida_idb`

Production batch d'IDB (idat).

- Champs d'entrée :
  - `out` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : arac, hedef, idat, idb, ok)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_il2cpp_dump`

Dump avec Il2CppDumper (erreur honnête si absent).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, cikti, dosya, dosyaSayisi, log, ok, ozet)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_il2cpp_metadata`

Comptage classes/méthodes des métadonnées globales IL2CPP.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, assemblySayisi, dosya, goruntuSayisi, metodSayisi, not, ok, ozet, sinifSayisi, surum)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_il2cpp_methods`

Signatures de méthodes IL2CPP (marqueur honnête si limité).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, dosya, imzaSayisi, imzalar, metodSayisi, not, ok, sinirli, surum)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ilspy_decompile`

Décompilation .NET C#.

- Champs d'entrée :
  - `out` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : arac, ciktiDir, cs_sayisi, dosya, not, ok)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_investigate`

Plan d'investigation automatique (reniflage+score+repli).

- Champs d'entrée :
  - `path` (string, requis)
  - `soru` (string, optionnel)
- outputSchema : présent (champs : arac, motor, ok, plan, skor, tip, yedekler)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_classes`

Liste de classes d'APK.

- Champs d'entrée :
  - `apk_path` (string, requis)
- outputSchema : présent (champs : arac, ok, siniflar, toplam_sinif)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_jadx_decompile`

Décompilation d'une seule classe d'APK.

- Champs d'entrée :
  - `apk_path` (string, requis)
  - `out` (string, requis)
  - `sinif` (string, requis)
- outputSchema : présent (champs : arac, bayt, ciktiDir, dosya, ok, sinif)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_jadx_full`

Décompilation complète d'APK.

- Champs d'entrée :
  - `apk_path` (string, requis)
  - `out` (string, requis)
- outputSchema : présent (champs : arac, ciktiDir, java_dosya_sayisi, ok)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_jadx_manifest`

Résumé de manifeste APK.

- Champs d'entrée :
  - `apk_path` (string, requis)
- outputSchema : présent (champs : aktiviteler, apk, arac, izinler, ok, paket)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_jadx_methods`

Liste de méthodes dans une sortie décompilée.

- Champs d'entrée :
  - `dir` (string, requis)
- outputSchema : présent (champs : arac, methodlar, ok)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_read`

Lecture de classe décompilée (400 lignes).

- Champs d'entrée :
  - `dir` (string, requis)
  - `sinif` (string, requis)
- outputSchema : présent (champs : arac, dosya, ok, satirlar, toplam_satir)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_xrefs`

Recherche de terme dans une sortie décompilée.

- Champs d'entrée :
  - `dir` (string, requis)
  - `terim` (string, requis)
- outputSchema : présent (champs : arac, kayitlar, ok)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jeb_sorgu`

Requête MCP JEB.

- Champs d'entrée :
  - `govde` (string, optionnel)
  - `url` (string, requis)
  - `yontem` (string, requis)
- outputSchema : présent (champs : arac, durum, govde, ok, url, yontem)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_js_bundle`

Résumé de bundle.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_export_shape`

Forme des exports.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_require`

Graphe require/import.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_sourcemap`

Résolution de source-map.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_classdump`

Sortie class-dump (erreur honnête si absent).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_info`

En-tête Mach-O (architecture + type de fichier).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_loads`

Commandes load Mach-O (segment/dylib).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_objc`

Liste classes/catégories ObjC (lecture pure).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_otool`

Sortie otool (erreur honnête si absent).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_compare`

Diff de membres managed.

- Champs d'entrée :
  - `a` (string, requis)
  - `b` (string, requis)
- outputSchema : présent (champs : arac, detay, ok, ozet)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_import`

Enregistrement de reconstruction.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, detay, ok, ozet)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_verify`

Vérification de dépendances natives.

- Champs d'entrée :
  - `beklenen` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : arac, detay, ok, ozet)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_mips_funcs`

Pré-balayage de fonctions MIPS.

- Champs d'entrée :
  - `b64` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_mips_psp_profile`

Profil MIPS/PSP.

- Champs d'entrée :
  - `b64` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_missing_reason`

Outil manquant + commande d'installation.

- Champs d'entrée :
  - `eksik` (string, requis)
  - `platform` (string, optionnel)
- outputSchema : présent (champs : alternatif, eksik, kur, neden)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_net_capture`

Capture réseau locale (HAR).

- Champs d'entrée :
  - `url` (string, requis)
- outputSchema : présent (champs : kayıt, ok, summary, tool)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_obligation_advance`

Avancement d'anneau.

- Champs d'entrée :
  - `bulgu` (string, requis)
  - `defter` (string, requis)
  - `kod` (string, requis)
- outputSchema : présent (champs : links)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_close`

Scellement du registre.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : kapatıldı, links)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_ledger`

Création du registre.

- Champs d'entrée :
  - `bulgular` (string[], requis)
  - `evidence_digest` (string, requis)
  - `tools_sha256` (string, requis)
- outputSchema : présent (champs : evidence_digest, kapatıldı, ledger_id, links, tools_sha256)
- annotations : présentes (destructiveHint=false, idempotentHint=false, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_verify`

Vérification de chaîne.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : eksik, ok)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pcap_oku`

Fusion de flux PCAP + déchiffrement TLS par keylog.

- Champs d'entrée :
  - `keylog` (string, optionnel)
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pdb_indir`

Téléchargement de PDB depuis le serveur de symboles Microsoft via le record CodeView RSDS du répertoire de debug PE + intégrité + cache.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, cache, dosya, guid, ok, pdb, url, yas, yol)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_pdb_yolu`

Chemin PDB depuis le répertoire de debug PE.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, dosya, guid, ok, pdb, yas)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_imports`

Liste d'imports PE.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, dlls, dosya, fonksiyonlar, not, ok, sayi)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_info`

Infos d'en-tête PE.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, bit, dosya, entry, entry_hex, machine, machine_hex, ok, section_sayisi)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_sections`

Table de sections PE.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, bolumler, dosya, ok, sayi)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_caps`

Sondage des capacités de processus.

- Champs d'entrée : aucun
- outputSchema : présent (champs : kayıt, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_compare`

Comparaison pipe/PTY.

- Champs d'entrée :
  - `cmd` (string, requis)
- outputSchema : absent
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_run`

Enregistrement d'exécution de processus.

- Champs d'entrée :
  - `cmd` (string, requis)
- outputSchema : présent (champs : kayıt, ok, summary, tool)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_pwn_elf_layout`

Disposition ELF + mitigations.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : absent
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pwn_gadgets`

Indice de gadgets.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_r2_callgraph`

Graphe d'appels de fonctions r2.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, fonksiyonlar, hedef, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_r2_debug`

Debug groupé r2 (bp+regs).

- Champs d'entrée :
  - `addr` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : arac, bpAddr, cikti, hedef, not, ok)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_r2_esil`

Regs d'émulation r2 ESIL.

- Champs d'entrée :
  - `addr` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : addr, adim, arac, hedef, ok, regs)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_readiness`

Score de préparation à la reconstruction.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : arac, eksik, ok, seviye, skor)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_funcs`

Liste de fonctions en pseudo-code.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_harness`

Squelette de harnais C.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_tag`

Étiquette d'affaire.

- Champs d'entrée : aucun
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_registry_izi`

Écritures registre depuis des événements API.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_scan_repo`

Analyse de dépôt (type+plan).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_scan_repo_paralel`

Analyse parallèle de dépôt (pool de 4, annulable).

- Champs d'entrée :
  - `eszamanlilik` (integer, optionnel)
  - `path` (string, requis)
- outputSchema : présent (champs : details, iptalEdildi, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_sniff`

Type de fichier + moteur suggéré (octets magiques).

- Champs d'entrée :
  - `b64dosya` (string, requis)
- outputSchema : présent (champs : motor, tip)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_storage_dump`

Cookies + localStorage.

- Champs d'entrée :
  - `url` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_typedef_oner`

Suggestion de noms d'arguments + propagation.

- Champs d'entrée :
  - `text` (string, requis)
- outputSchema : présent (champs : arac, ok, oneriler, sayi)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_unpack_hunt`

Flux guidé pour packer inconnu.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : adimlar, arac, karar, ok)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_unpack_try`

Routage automatique d'unpack.

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : sonuc, yontem)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_upx_info`

Info « compressé UPX ou non ».

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, cikti, dosya, not, ok, sikisik)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_upx_unpack`

Décompression UPX.

- Champs d'entrée :
  - `out` (string, requis)
  - `path` (string, requis)
- outputSchema : présent (champs : arac, cikti, dosya, log, ok)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_wasm_decode`

Décodage WASM/WAT (wabt).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `rea_wasm_exports`

Liste d'exports WAT (hors ligne).

- Champs d'entrée :
  - `wat` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_imports`

Liste d'imports WASM.

- Champs d'entrée :
  - `b64` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_sections`

Table de sections WASM.

- Champs d'entrée :
  - `b64` (string, requis)
- outputSchema : présent (champs : details, ok, summary, tool)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_validate`

Validation WASM (wasm-validate).

- Champs d'entrée :
  - `path` (string, requis)
- outputSchema : présent (champs : arac, detay, ok, ozet)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `session_close`

Abandonne une session applicative et son tampon d'événements.

- Champs d'entrée :
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : closed, session_id)
- annotations : présentes (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `session_list`

Liste les sessions applicatives détenues dans ce processus.

- Champs d'entrée : aucun
- outputSchema : présent (champs : sessions)
- annotations : présentes (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `session_open`

Ouvre une session applicative pour un moteur. Renvoie session_id pour les arguments d'outils ultérieurs.

- Champs d'entrée :
  - `engine` (enum, requis)
- outputSchema : présent (champs : createdAt, engine, session_id)
- annotations : présentes (destructiveHint=false, idempotentHint=false, openWorldHint=false, readOnlyHint=false)

### `static_info`

Rapporte les capacités du moteur statique radare2, la disponibilité de r2 et la cible ouverte (le cas échéant).

- Champs d'entrée :
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : capabilities, engine, r2, session_id, target)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `strings`

Chaînes trouvées dans le binaire (adresse, section, longueur, texte).

- Champs d'entrée :
  - `limit` (integer, optionnel) — Max strings returned (default 200).
  - `min_length` (integer, optionnel) — Keep strings with length >= this (default 0).
  - `offset` (integer, optionnel) — Skip this many matches (default 0).
  - `section` (string, optionnel) — Only strings from this section, e.g. ".rodata".
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : offset, session_id, strings, total)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

### `xrefs`

Références croisées vers et/ou depuis une adresse (code et données).

- Champs d'entrée :
  - `address` (string | number, requis) — Target address as hex ("0x400200"), decimal, or flag name ("entry0").
  - `direction` (enum, optionnel)
  - `session_id` (string, requis) — Application session id. Not an MCP protocol session.
- outputSchema : présent (champs : address, from, session_id, to)
- annotations : présentes (openWorldHint=true, readOnlyHint=false)

## Ressources

- `rea-plus://capabilities-safety` — nom : `capabilities-safety` — mimeType : `application/json` — Résumé statique des capacités et des règles de sécurité (lecture seule).
- `rea-plus://server-info` — nom : `server-info` — mimeType : `application/json` — Identité statique du serveur et résumé de surface (lecture seule).

## Prompts

- `android-triage` — arguments : `focus` (optionnel), `path` (requis) — Flux de triage statique basé sur jadx pour APK (prompt sans effets secondaires).
- `dotnet-malware-triage` — arguments : `focus` (optionnel), `path` (requis) — Flux de triage statique de logiciels malveillants pour échantillon .NET (prompt sans effets secondaires).
- `packer-triage` — arguments : `focus` (optionnel), `path` (requis) — Flux rea ordonné, statique d'abord, pour la détection de packers/protections (prompt sans effets secondaires).
