# Changelog — rea-plus

Alle wichtigen Änderungen werden in dieser Datei festgehalten. Format: Keep a Changelog + SemVer.
Alle nennenswerten Änderungen sind hier dokumentiert (deutsche Zusammenfassung + englisches Detail).

## [0.10.2] — 2026-10-16

Release 0.10.2: P2-Verteilungs-/Qualitätswellen + Mach-O-Tiefe + P3-
Recherchenotizen. Werkzeugoberfläche unverändert (191 Werkzeuge + 2 Ressourcen +
3 Prompts). 96/96 Standardtests grün.

### Hinzugefügt

- Pages-Deploy-Workflow (`pages.yml`: main-Push → Site-Erzeugung → Deploy).
- Schema-Budget-CI-Schritt (200 KB Liste / 110 KB Schema / 600 B Schnitt).
- Gezieltes Fuzz-Harness (`scripts/fuzz-harness.mjs`: Klassifizierung + Bericht
  + `docs/FUZZ.md`; erster Lauf 0 Crashes).
- Portables Node-Bundle (`scripts/sea-portable.mjs` + `docs/SEA-DAGITIM.md`;
  keine SEA-Einzel-Exe wegen 3 Hindernissen).
- P3-Machbarkeitsnotizen (`docs/ARASTIRMA-*`: LLDB/TTD/angr WARTEN, kommerziell NICHT TUN).
- Beitragstrichter (erweitertes CONTRIBUTING + Good-First-Issue-Formular).

### Behoben

- `rea_macho_objc`-Fat-Binär-Slice-Auflösung (`arch`-Parameter + Ehrlichkeits-
  leiter); IL2CPP v31+ bleibt im eingeschränkten Modus, da offline nicht verifizierbar.
- ROADMAP-v0.10.1-Sync (P1-Schließungen eingearbeitet).

## [0.10.1] — 2026-10-16

Release 0.10.1: P1-Codepunkte geschlossen — tote-Facade-Bereinigung +
Golden-DEX-Fixture. Werkzeugoberfläche unverändert (191 Werkzeuge + 2 Ressourcen +
3 Prompts). 92/92 Standardtests grün.

### Behoben

- Tote Facade entfernt: `probeCache`/`parallelProbe`-Verhalten nach
  `workerCache` verlegt (`ResultCache`-TTL + `runProbes`);
  `tests/probe.test.mjs` unter `worker-cache.test.mjs` verlegt.
- Golden-DEX-Fixture: `tests/corpus/mini.dex` (synthetisches minimales DEX
  v035, deterministische Erzeugung `scripts/dex-fixture-uret.mjs`) +
  `dex-golden` 7 Tests + HASHES-Eintrag.
- `RepoScan`-`.dex → dex/jadx`-Mapping hinzugefügt.

## [0.10.0] — 2026-10-16

Release 0.10.0: 4 neue Werkzeuge (187→191), Serialisierungsqueue, Worker-Cache-
Anbindung, Verteilungsvorbereitung (SEA-Machbarkeit, Manifeste, SBOM, Sandbox),
dauerhafte Qualität (Schema-Budget, Docs-Site, Promptbibliothek, ObjC-/IL2CPP-/Go-
Tiefe). 187 `outputSchema`, 191 Annotations. 91/91 Standardtests grün.

### Hinzugefügt

- `rea_macho_objc/classdump`, `rea_il2cpp_methods`, `rea_go_buildinfo`.
- Volle Serialisierung (`REA_SESSION_SERIALIZE=1`, zeitstempelbelegt).
- Lebendige Worker-Cache-Anbindung (Reposcan-Pfad, zählerbelegt).
- SEA-Machbarkeitsbericht + Pilot-Script; winget-/scoop-/homebrew-Manifeste.
- SBOM (CycloneDX) + `docs/SANDBOX.md` (Hyper-V/VirtualBox).
- Schema-Budget (gemessene Schwellen), Docs-Site (7 Seiten), `docs/PROMPTS.md`.

### Behoben

- POSIX-jadx-Erkennung (PATH-Scan + X_OK).
- Hopper-POSIX-Ähnlichkeits-Tor.
- cdb-async-CI-Linux-Kompatibilität; Korpus-Normalisierung.

### Noch nicht erledigt

- Frida-Live-VM-Bestätigung; self-hosted Windows-Runner.
- Tote Facade entfernen (Probe-Test-Abhängigkeit); P3-Recherche.

## [0.9.0] — 2026-10-15

Release 0.9.0: Standardoberfläche mit 15 neuen Werkzeugen 172→187 (30 Conduit + 157 rea),
183 `outputSchema` + 187 Annotations bleiben erhalten, Installationsleichtigkeit (`setup`-
Assistent, `doctor --fix`) und Qualitätsplattform (Parser-Fuzz-Smoke, HTTP-e2e-
Standard, Leistungsbudgets, Beispielsitzungen + CONTRIBUTING) kamen hinzu.
86/86 Standardtests grün.

### Hinzugefügt

- 15 neue Werkzeuge (172→187): `rea_go_funclines`, `rea_go_goresym`,
  `rea_il2cpp_metadata`, `rea_il2cpp_dump`, `rea_bindiff_fonksiyonlar`,
  `rea_bindiff_karsilastir`, `rea_flutter_snapshot`, `rea_flutter_blutter`,
  `rea_macho_info`, `rea_macho_loads`, `rea_macho_otool`, `rea_pcap_oku`,
  `rea_scan_repo_paralel`, `rea_android_dinamik_recete`,
  `rea_android_recete_dogrula`.
- `rea-plus-cli setup`-Assistent (Client-Erkennung + Config-Schreiben) und
  `doctor --fix` (bestätigter Installationsvorschlag/-lauf).
- Parser-Fuzz-Smoke (`scripts/fuzz-parsers.mjs` + `parser-fuzz.test.mjs`;
  Seeds aus schreibgeschütztem Korpus, Schreiben nur nach tmpdir).
- HTTP-e2e in die Standardstrecke aufgenommen (`tests/e2e.http.mjs`).
- Leistungsbudgets (`perf-budget.test.mjs`: tools/list + Start).
- Beispielsitzungen (`docs/EXAMPLES.md` + `docs-examples.test.mjs`) und
  `CONTRIBUTING.md` (inkl. Korpusregeln).

### Behoben

- Hopper-POSIX-Ähnlichkeits-Tor: gefälschte Datei, die Ausführungsbit/Größe nicht ähnelt,
  zählt nicht als Hopper, ehrliches `capability_unsupported` kommt zurück.
- cdb-async-CI-Linux-Zweig und Korpus-Zeilenende-Normalisierung (Korrekturen aus 0.8.2) auf der 187-Werkzeug-Oberfläche mit Regressionstests festgenagelt.

### Noch nicht erledigt

- Frida-Live-VM-Bestätigung; self-hosted Windows-Runner.
- Windows-Einzeldatei-Exe (Node SEA); winget-/scoop-/homebrew-Manifeste; SBOM.
- P3-Recherche: LLDB-Engine, WinDbg-TTD, symbolische Ausführung (angr/Triton).

## [0.8.2] — 2026-10-15

Release 0.8.2: restliche Schema-Abdeckung geschlossen (168 `outputSchema`, 172 Annotations,
null unbezeichnet), PDB-Downloader als 172. Werkzeug registriert, Sitzungs-TTL und
moderne Roots-MRTR kamen, Progress-Generalisierung + Async-Whitelist auf 3er erhöht.
Standardoberfläche 172 Werkzeuge; Opt-in: async +5 (177), Queue +1 (173). 72/72
Standardtests grün (inkl. CI).

### Hinzugefügt

- 20 Conduit- + `rea_pdb_indir`-`outputSchema` (gesamt 168); Annotations 172/172.
- `rea_pdb_indir`-Registrierung (Microsoft-Symbolserver, mit Integrität, gecacht, nur im `all`-Profil).
- Sitzungs-TTL (`REA_SESSION_TTL_MS`, Standard 30 Min, 0=aus).
- Roots-modern-MRTR (`inputRequired`/`inputResponses`); `list_changed` in Legacy.
- Progress-Stage-Helfer in 2 weiteren Werkzeugen; Async-Whitelist 3er.

### Behoben

- cdb-async-Test-CI-Linux-Kompatibilität (`engine_unavailable`-Zweig wird akzeptiert).
- Korpus-Hash-Zeilenende-Normalisierung; `ornek.js`-HASHES-Korrektur.

### Noch nicht erledigt

- Frida-Live-VM-Bestätigung; self-hosted Windows-Runner; dauerhafter DEX-Korpus.
- P2-Verteilungsleichtigkeit; Analysetiefe; P3-Recherche.

## [0.8.1] — 2026-10-14

Release 0.8.1: Engine-Robustheit (Sitzungsqueue, Frida-Timeout, cdb-async, x64dbg-
Provisionierung), statische Ehrlichkeit (Browser-Szenario, FLIRT, Wasm/DWARF, PE/PDB),
Verhalten und Skalierung (Syscall-Matrix, Ein-Aufruf-Lauf, Worker-Cache), dauerhafte Test-
plattform (Golden-Korpus, 147 outputSchema, Progress-Generalisierung). Standard-
oberfläche bleibt bei 171 Werkzeugen; alle Neuerungen sind Opt-in oder Ehrlich-Fehler-
Verbesserungen. 70/70 Standardtests grün.

### Hinzugefügt

- Sitzungs-FIFO-Queue (`REA_SESSION_QUEUE=1` Opt-in, 32 Tiefe, `session_queue_status`-Werkzeug; Standard-171-Oberfläche unverändert).
- Frida-Installations-Timeouts (Attach 15 s/Script 10 s/Load 15 s, mit Env-Override, aufräumendes `engine_timeout` bei Timeout).
- cdb-Async-Pause + Push-Ereignisse (Event-Loop blockiert nicht, `pauseAsync` Opt-in).
- x64dbg-Provisionierung (`reaX64dbgDoctor` + `reaX64dbgSetup`, idempotent, hashverifiziert).
- Echte Ausführung von Browser-Szenarien (schrittbelegt, mit Dry-Run-Modus, ohne Backends `capability_unsupported`).
- Syscall-Nummern-Matrix + CreateFileW-/RegSet-Profile.
- Ein-Aufruf-Verhaltenslauf (`BehaviorRun`: Spawn+Trace+Capture, Pflicht-Timeout, Crash-Ehrlichkeit).
- Worker-Cache (LRU-100, hash-geschlüsselt, `REA_CACHE=0`-Bypass).
- Golden-Korpus-Manifest (`tests/corpus/HASHES.json` + `verify-corpus.mjs`).
- Progress-Generalisierungs-Helfer (`createStageProgress`, `onAbort`).
- 27 neue `outputSchema` (gesamt 147: 137 rea + 10 Conduit).

### Behoben

- jadx-`-jar`-Hängen: auf `-cp jadx.cli.JadxCLI`-Form umgestellt; Live-APK-Akzeptanz bestanden (`com.zb.test`, 7 Berechtigungen, 5 Klassen, 2,2 s).
- FLIRT-Falschbenennung: Beschreibung und Ergebnis tragen `string-heuristic` + Konfidenz-Score.
- WasmInfo-Mehrbyte-LEB + DWARF-v5/abbrev_offset/mehre FORMs (negative Größe und gefälschte Leer-Zusammenfassung beendet).
- PE-`SizeOfOptionalHeader` + PeReader-/PdbReader-Doppelcode vereint; PDB-Download (gecacht, mit Integrität).

### Noch nicht erledigt

- Frida-Live-VM-Bestätigung; DEX-Dauerkorpus (Repo-interne Fixture); self-hosted Windows-Runner.
- Restliche 24 schemalose Werkzeuge; Progress-Generalisierung (synchrone Handler); Trusted-Publisher-OIDC + Provenance.

## [0.8.0] — 2026-10-14

Release 0.8.0: MCP-Protokolloberfläche gewachsen (Ressourcen/Prompts, Toolsets, typisierte
Outputs), Sicherheitsgrenzen hinzugefügt (Workspace-Wurzel, tokenloses HTTP, Audit),
Async-Job + Progress-Piloten für lange Jobs kamen hinzu. Folgendes beschreibt den Stand dieses Releases;
externe Tore im Abschnitt „Noch nicht erledigt“ sind offen.
Release 0.8.0: größere MCP-Oberfläche, neue Sicherheitsgrenzen, Async-Job- und
Progress-Piloten. Externe Tore unter „Noch nicht erledigt“ bleiben offen.

### Hinzugefügt

- Werkzeugreferenz: aus der echten MCP-Oberfläche des kompilierten Servers erzeugtes `docs/TOOLS.md`
  (171 Werkzeuge + 2 Ressourcen + 3 Prompts). README und ROADMAP sind an diese Referenz angebunden.
- MCP-Ressourcen: statische, schreibgeschützte `rea-plus://server-info` und
  `rea-plus://capabilities-safety` (öffnet keine Env-Werte, persönliche Pfade oder Dateiinhalte).
- MCP-Prompts: nebeneffektfreie, nur Text erzeugende `packer-triage`-,
  `dotnet-malware-triage`- und `android-triage`-Abläufe.
- `REA_TOOLSETS`-Profile: undefiniert/leer/`all` = 171 Werkzeuge; `minimal` = 8,
  `static` = 98, `android` = 27, `dotnet` = 20, `web` = 26, `debug` = 50.
  Kommaschreibweise ist Vereinigung; unbekanntes/leeres Profil fällt nicht still auf `all` zurück,
  sondern gibt einen offenen Startfehler. Ressourcen/Prompts werden nicht gefiltert.
- `REA_WORKSPACE_ROOT`-Arbeitswurzel-Schranke: wenn definiert, werden `rea_*`-Pfadargumente,
  Conduit-`open_target`/`debug_open`-Pfade und nutzersichtbare abgeleitete Schreibvorgänge
  (`.unpacked`, `.extracted`, HAR-Ausgabe) innerhalb der Wurzel mit Realpath-Beleg verifiziert;
  wenn undefiniert, ändert sich das Verhalten nicht. Operator-Temp-/Cache-Oberflächen sind bewusste Ausnahme:
  Browser-Artefaktverzeichnis, Ghidra-TMP-Projekt-/Eingabeverzeichnisse, Hopper-TMP-Request-
  datei und apktool-Framework-Cache werden nicht in die Wurzel gezwungen.
- Tokenloser-HTTP-schreibgeschützter Modus: Wenn `DBG_BRIDGE_TOKEN` undefiniert ist, registriert HTTP neben der Warnung
  nur eine 44-Werkzeug-schreibgeschützte Allowlist ohne Pfadparameter
  (Ergebnis ist Schnittmenge mit `REA_TOOLSETS`). Token-HTTP und stdio behalten die volle
  (oder Toolset-) Oberfläche. Neue/nicht gelistete Werkzeuge erscheinen nicht in tokenlosem HTTP.
- `REA_AUDIT_LOG` (JSONL, auf beiden Transporten): pro Zeile nur `ts`,
  `transport`, `tool`, `durationMs`, `isError`. Argument, Token, Pfad oder Ziel-
  inhalt wird niemals geschrieben; Schreibfehler schaltet Audit mit einer Warnung ab, lässt den Server nicht abstürzen.
- HTTP-Schranken: pro IP `REA_HTTP_RATE_LIMIT_PER_MIN` (Standard 120/Min) und
  aktives-Anfragen-Dach `REA_HTTP_MAX_CONCURRENT` (Standard 16); bei Überschreitung `429`.
  Nicht-positiv-ganzzahliger Wert fällt nicht still auf Standard zurück, sondern gibt Startfehler.
- Typsichere Outputs (partielle Basis): 147 Werkzeuge tragen `outputSchema`, 169 Werkzeuge haben
  Annotations; bei Text-JSON mit schlichtem Objekt als Ergebnis trägt `structuredContent` denselben
  Wert. Werkzeuge außerhalb der Schemamenge geben schemaloses Text-JSON zurück; Stand pro Werkzeug
  in `docs/TOOLS.md`. Die Schema-Abdeckung ist nicht auf alle 171 Werkzeuge erweitert.
- Async-Job-Pilot: Mit `REA_ASYNC_JOBS=1` werden 5 Job-Werkzeuge
  (`rea_job_start/status/result/cancel/list`) registriert; Standardoberfläche bleibt 171
  Werkzeuge, Opt-in-Oberfläche ist 176 Werkzeuge. Die Queue lässt höchstens 2 gleichzeitige Jobs
  laufen, Datensätze sind prozessintern, und die Whitelist enthält heute nur das AbortSignal-nehmende
  `rea_process_run`-Werkzeug; Abbruch eines laufenden Jobs tötet den Prozessbaum.
- Roots-Pilot: Mit `REA_ROOTS=1` und auf dem Legacy-stdio-Weg werden Client-Wurzeln gezogen;
  Wurzeln können die `REA_WORKSPACE_ROOT`-Schranke nur einengen. Der MRTR-Ablauf des modernen Protokolls
  ist eigene Arbeit und wird nicht als unterstützt dargestellt.
- Progress-/Abbruch-Pilot: `rea_process_run` sendet die erste Meldung ohne Warten, folgende
  mit höchstens etwa 20/s; `notifications/cancelled` tötet den Kindprozess-
  baum. Andere synchrone Handler sind außerhalb dieses Piloten.
- Release-Vorbereitung: Registry-Name `io.github.Alyhnte/rea-plus` und Paket-`mcpName`
  bereit; Publish-Workflow als nur manuell getriggerte Vorbereitung mit Dry-Run-Standard hinzugefügt
  (echtes Release verlangt offene `PUBLISH`-Bestätigung).
- jadx-Brücken-Ehrlichkeit (Codebasis): Manifest-Paket-/Berechtigungs-/Aktivitäts- und Klassen-FQCN-
  Extraktion beruht auf echter Parsierung; ein Live-jadx-Lauf ist kein Beleg dieses Eintrags.
- Frida-Agent-Exception-Verhalten (Codebasis): Exception, die nicht zur Adresse des installierten
  Slots passt, wird nicht mehr als Breakpoint missverstanden und geschluckt, sondern mit `false` in den echten Ablauf entlassen.

### Noch nicht erledigt

- npm-Release erfolgt: `rea-plus@0.8.0` in der Registry, Verbrauchereinrichtung
  (`npm install` + stdio `initialize`/`tools/list` = 171) verifiziert. MCP-Registry-
  Eintrag erfolgt: `io.github.Alyhnte/rea-plus` released (GHA + OIDC). Unterstützte
  Einrichtung ist `npx -y rea-plus` und GHCR.
- Frida-Live-VM-Bestätigung ist nicht abgeschlossen; obiger Frida-Punkt zählt nicht als Live-Akzeptanz-
  beleg.
- DEX-Golden-APK-Akzeptanztest (Live-jadx + echte APK) ist nicht abgeschlossen;
  Golden-Korpus-Tor steht offen.

## [0.7.4] — 2026-10-13

Verteilungs-Patch: fremde Installation erleichtert; ein Paket-
fehler, der Verbraucher sperrte, behoben. README neu geschrieben (Ein-Klick-Installationen, Architekturdiagramm,
Client-Matrix), volle Roadmap in `docs/ROADMAP.md`.

### Behoben

- Playwright ist nun optional und wird faul geladen. Zuvor importierte Produktcode es statisch in `devDependencies`:
  Jeder, der das Paket installierte, erhielt beim Start
  `ERR_MODULE_NOT_FOUND`. Der Server startet ohne Playwright, Browser-Werkzeuge
  geben `capability_unsupported` zurück. Für Browser: `npm i playwright && npx playwright install chromium`.

### Hinzugefügt

- `prepare`-Script: Git-Installationen (`npx -y github:Alyhnte/ReaPlus`) bauen dist automatisch.
- Ein-Klick-Installationslinks (Cursor, VS Code) + Client-Config-Beispiele:
  Claude Desktop/Code, Cursor, VS Code, Windsurf, Codex, opencode (`configs/`).
- `Dockerfile` + GHCR-Workflow: Bei Releases wird das `ghcr.io/alyhnte/reaplus`-Image gepresst.
- `smithery.yaml`-Registry-Metadaten; persönliche Pfade in Config-Beispielen bereinigt.
- Visuelle README (Badges, Mermaid-Architektur, Env-Tabelle, Sicherheitsmodell) und
  `docs/ROADMAP.md` (9 thematische, priorisierte Volltabelle).

## [0.7.3] — 2026-10-12

CI-/Portabilitäts-Patch: Standard-Testmenge nun auch außerhalb der Autorenmaschine
(sauberes Ubuntu-CI, Node 20+22) grün. Dieselbe Generalisierung auch im Produktcode angewandt:
Werkzeugerkennung nur Env + PATH, kein maschinenspezifischer fester Pfad mehr.

### Behoben

- Test-Fixtures lesen statt persönlicher Temp-Pfade den eingecheckten Korpus
  (`tests/corpus`, relativ zu `import.meta.url`); `korpus-kur` frischt nur
  per `REA_KORPUS_ELF`/`REA_KORPUS_PE`-Env auf.
- Vorhandenseinsprüfungen rechnen damit, dass `spawnSync` nicht wirft (`r.error`/Status):
  Produkt und Test sehen auf einer Maschine ohne mitmdump nun das Tor korrekt (13-s-
  Schein-Proxy-Warten ist auch weg).
- Bei fehlendem Werkzeug verhalten sich Tests prinzipiell: ohne wabt/upx/ilspy/dnfile/Chromium
  `capability_unsupported`-Assert oder ehrlicher Skip; UPX-Version nicht mehr auf 5.2.1 festgenagelt.
- Produkt-Werkzeugerkennung generalisiert: `REA_UPX_BIN`, `REA_WABT_BIN`, `REA_AAPT2_BIN` + PATH;
  persönliche WinGet-/`C:\tools`-Pfade entfernt. .NET-CIL-Python-Suche
  versucht die Reihenfolge `python`/`python3`/`py` (auf Linux meist nur python3 vorhanden).
- Ghidra-Projektverzeichnis statt persönlichem Pfad unter `os.tmpdir()`; Ghidra-Tests
  setzen keinen Standard-Installationspfad voraus (`REA_GHIDRA_DIR` Pflicht, Live-Spur).
- CLI-Tests rufen Node nicht aus PATH, sondern per `process.execPath` auf.
- Test-Runner druckt die Fehlerqueue für CI-Diagnose länger aus.

### Verifizierung

- Lokal: in voller-PATH- und werkzeugloser (schmaler-PATH-) Umgebung 43/43; Lauf aus anderem Arbeitsverzeichnis ebenfalls grün.
- CI: Ubuntu Node 20 + 22 grün (`fix/inceleme-duzeltmeleri`-Zweig und main).

## [0.7.2] — 2026-10-12

Umfassende Prüfungs-Korrekturen: kaputte Einstiegs-/Release-Wege, Fehlerhülle, Injektions-
oberflächen, gefälschte `ok`-Ergebnisse und Engine-Robustheit. Für Zwischenreleases (0.2.0–0.7.1)
siehe `docs/release-v*.md`-Dateien.

### Behoben

- `npm start` führt nun den echten Einstieg (`dist/server.js`) aus; vorheriges Ziel
  (`dist/facade/createReaPlusServer.js`) war eine transportlose Fabrik, der Server startete nie.
- `npm test` läuft nun `scripts/run-tests.mjs` statt altem Script mit Repo-externem Zeiger;
  CI fährt nun wirklich die Standardmenge (43 Dateien).
- Fehlerhülle: `ok:false`-Ergebnisse und geworfene Fehler in rea-Werkzeugen gehen nun an MCP
  mit `isError: true`; Berichten als Erfolg beendet.
- Build kopiert auch Laufzeitdateien (`frida-agent.js`, Ghidra-`.py`-Scripts);
  im Release-Paket gibt die Frida-Engine nun kein `engine_unavailable` mehr. `prepublishOnly` hinzugefügt.
- Version auf eine Wahrheit reduziert: `package.json`, `server.json`, `server.ts` alle 0.7.2.
- Cutter-`decompile`-Fallback lief analysefrei `pdf` und gab leeres `ok` zurück; läuft nun
  `aaa;pdf`, leere Ausgabe gibt `capability_unsupported`.
- `korpus-kur` bewahrt ohne persönliche Temp-Quellen den eingecheckten Korpus (stürzt in CI nicht ab);
  Idempotenztest misst beim zweiten Lauf.

### Sicherheit

- Adresseneingaben in Schema und Brücken validiert (Hex/Zahl/Symbol); r2-/rizin-
  Kommandoinjektion (`;`-/`!`-Flucht) geschlossen.
- radare2-cmd.exe-Pfad weist Metazeichen ab; Schließen tötet den Prozessbaum
  (r2-Enkel wird nicht verwaist).
- `rea_jeb_sorgu` kann standardmäßig nur Loopback-POST; fernes Ziel
  verlangt `REA_JEB_ALLOW_REMOTE=1`, Link-Local-/Metadata-Hosts in jedem Fall blockiert.
- HTTP-Token undefiniert warnt der Server beim Start laut (Auth deaktiviert).

### Ehrlichkeit

- `rea_dotnet_metadata` hielt per MZ-Blick jedes PE für .NET; prüft nun echtes
  CLR-Verzeichnis (DataDirectory[14]), externer Reader keine Pflicht.
- `rea_pwn_elf_layout` gibt statt gefälschtem wartendem `ok` nun `capability_unsupported` zurück.
- `stdout_sha256_kısa` ist nun wirklich SHA-256 (zuvor FNV-1a); gefälschter PTY-Kanal und
  Pipe-/PTY-Vergleich entfernt — Kanal ehrlich `pipe`, Compare kommt vom Tor zurück.
- `rea_net_capture` zielt wirklich auf die gegebene Localhost-URL; Köder-Server nur
  bei `data:`-Eingabe aufgebaut und in der Zusammenfassung genannt.

### Robustheit

- Frida-Agent-RPCs (`callAgent`, `describe`) mit Timeout; gescheiterter Inject hinterlässt keine Halb-
  sitzung (Detach + Map-Bereinigung).
- Re-Open/Re-Attach räumt Checkpoints des alten Ziels weg; Rewind kann nicht in falschen Prozess
  zurückschreiben.
- Bei gleichzeitigem Re-Open-Race wird der Debugger der überschriebenen Sitzung nicht verwaist
  (x64dbg/cdb/frida).

### Tests

- Neu: `tests/fixes-regression.test.mjs` (12 Tests) nagelt diese Korrekturen fest.
- Standardmenge: 43 Dateien / 321 Its grün. Live-Injektion-/Debug- und lokale Ghidra-
  Tests unter `npm run test:live` (VM/CI), werden auf der Hauptmaschine nicht gebündelt gefahren.

## [0.1.0] — 2026-10-12

Erstes lauffähiges Paket: Conduit eingefroren, rea darauf aufgesetzt.

### Hinzugefügt

- `src/conduit-core`: Conduit eins-zu-eins, schreibgeschützt. 30 eingefrorene Werkzeugnamen
  (`health`, `session_open/close/list`, `events_pull`, `static_info`,
  `open/close_target`, `disassemble`, `get_cfg`, `xrefs`, `strings`, `dump`,
  `debug_open/attach/close/state/breakpoint/continue/step/pause/registers/
  callstack/memory/code/thread/plugin/time`, `explain`, `prerequisites`).
  Keine Umbenennung; Regel mit `toolNamespace.ts` gesperrt.
- `src/facade`: 7 Module — `sessionRouter`, `toolNamespace`, `catalogMerge`,
  `createReaPlusServer`, `compactSchema`, `evidenceBundle`, `obligationLedger`.
  Präfixregel: jedes rea-stämmige Tool `rea_*` / `hopper_*` / `ghidra_*` /
  `jeb_*` / `evm_*` / `firmware_*` / `browser_*` / `adb_*`.
- `src/rea-domains`: 19 Domänendateien (9 Ordner) — hopper, ghidra, ida, jeb,
  javascript (JsAnalyzer/ReconHarness/BinaryDiff), android (Jadx/Adb/Apktool),
  dotnet (ManagedInspector), wasm-evm (WasmEvmBridge/CrashTimeline/GoPwn/
  DosMips/NativeAot), firmware-browser (Firmware/Browser/ProcessCapture).
- `keccak`: `js-sha3` mit Offline-EVM-Selektor — `transfer(address,uint256)`
  → `0xa9059cbb`, `approve(address,uint256)` → `0x095ea7b3`.
  WAT-Export-Scan ebenfalls offline, ohne `wabt` `capability_unsupported`.
- Werkzeugzahl: 8 rea-Werkzeuge → 33+ Gesamtziel; in diesem Release bedient der lauffähige Server
  30 Conduit + 8 rea = 38 Live-Tools (8 -> 33 Tool-Fahrplan gesperrt).
  Vereinter Katalog: 8 Conduit + 9 rea = 17 Einträge (`mergedCatalog()`, Cutter hinzugefügt).
- Lauffähiger Server: `src/server.ts` → `dist/server.js` (bin: `rea-plus`).
  Transport: stdio (Standard) + `POST /mcp` und `GET /health` (zustandslos,
  `DBG_BRIDGE_TOKEN`-Bearer-Tor gleich mit Conduit).
- Configs: `configs/claude-desktop`, `configs/cursor`, `configs/opencode`
  darunter stdio- + http-JSONs (Platzhalter `<REA_PLUS_DIR>` kommentiert).
- Tests: `tests/namespace.test.mjs` (Präfix- + Kollisions-Sperre) und
  `tests/reaplus.smoke.mjs` (Keccak-Selektoren + frozen=30 + Katalog=17).
  Ausführung: `node tests/namespace.test.mjs`, `node tests/reaplus.smoke.mjs`.
- Paket-Hygiene: `server.json` (io.github.rea-plus), `LICENSE` (MIT 2026),
  `.gitignore`, `.npmrc`, CI-Workflow.

### Regeln

- Fehlende Fähigkeit = kein Stub, `capability_unsupported` + Download-Empfehlung.
- Live-Jobs verlangen `confirm:true`. HTTP-Localhost-Verifikation an.
