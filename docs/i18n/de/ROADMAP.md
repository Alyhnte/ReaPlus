# ROADMAP — ReaPlus-Fahrplan

> Stand: v0.10.1 released (npm + MCP Registry + CI grün). Dieses Dokument ist mit den
> Befunden der ersten Prüfung vom 2026-10-12 geboren und wurde am Ende jeder Welle mit dem
> Erreichten synchronisiert. v0.10.1 schloss die P1-Codepunkte (tote-Facade-Bereinigung +
> Golden-DEX-Fixture); die Werkzeugoberfläche änderte sich nicht. Zahlen stammen von der echten Oberfläche des kompilierten Servers
> ([`TOOLS.md`](TOOLS.md)-Erzeugungsausgabe).
>
> **Maßstäbe:** Wirkung = Beitrag zum Nutzer-/Agentenwert · Aufwand = S (Tage) / M (1–2 Wochen) / L (Monat+)
> · Priorität = P0 (Außentor) → P3 (lange Frist).

## Mit v0.10.0-Basis Geschlossenes (Zusammenfassung)

- MCP-Oberfläche: 191 Werkzeuge + 2 Ressourcen + 3 Prompts; erzeugte Vollreferenz [`TOOLS.md`](TOOLS.md).
- `REA_TOOLSETS`-Profile: `all` 191 (Standard), `minimal` 8, `static` 98, `android` 27, `dotnet` 20, `web` 26, `debug` 50; Komma-Vereinigung, unbekanntes Profil = Startfehler. Neues Werkzeug nur in `all` (fail-closed).
- `REA_WORKSPACE_ROOT`: `rea_*` + Conduit-Pfade + nutzersichtbare abgeleitete Schreibvorgänge innerhalb der Wurzel; Operator-Temp-/Cache-Oberflächen bewusste Ausnahme. Roots (legacy + modern MRTR) engen nur ein.
- Tokenloses HTTP: Allowlist mit 44 schreibgeschützten Werkzeugen (Schnittmenge mit Toolset) + `REA_AUDIT_LOG` (argumentloses JSONL) + Ratenlimit (120/Min) + Nebenläufigkeitsdeckel (16) + Sitzungs-TTL (30 Min).
- Typbasis: 187 `outputSchema`, 191 Annotations (null unbezeichnet; 4 Werkzeuge dauerhaft schemalos).
- Async-Job (5 Werkzeuge, Oberfläche 177→192) + Sitzungs-FIFO-Queue + volle Serialisierung + Worker-Cache + Progress-Generalisierung.
- Engine-Robustheit: Frida-Installations-Timeouts, cdb-Async-Pause+Push, x64dbg-Provisionierung, jadx-`-cp`-Korrektur + Live-APK-Akzeptanz.
- Statische Ehrlichkeit: Browser-Szenario, FLIRT, Wasm/DWARF, PE/PDB, Mach-O, IL2CPP/Go/Flutter, Binärdiff, PCAP/TLS, Android-Rezeptur.
- Installation: `setup`-Assistent + `doctor --fix`; Manifeste (winget/scoop/brew) + SBOM + Sandbox-Rezeptur; SEA-Machbarkeit.
- Qualität: Golden-Korpus-Manifest, Fuzz-Smoke (CI), e2e Standard, Perf- + Schema-Budgets, Docs-Site + Promptbibliothek.
- Release: `rea-plus@0.10.0` in npm, `io.github.Alyhnte/rea-plus` in der MCP Registry, Tag-Kette (npm→warten→Registry) mit einzelnem Trigger. **Frida-Live-VM-Bestätigung steht als offenes Tor** (unten nicht geschlossen).

## Mit 0.7.2 + 0.7.3 Geschlossenes (Zusammenfassung)

- Kaputte `npm start`/`npm test`, Versionsinkonsistenz, nicht nach dist kopierte Runtime-Assets behoben.
- Fehlerhülle (`isError`), Adressinjektions-Tor, `ok` fälschende Werkzeuge, Frida-Timeout/Halbsitzung, Checkpoint-Fremdschreibung behoben.
- Standard-Testmenge auch außerhalb der Autorenmaschine grün (portable Fixtures, ehrliche Werkzeugtore, null persönliche Pfade); CI Ubuntu Node 20+22 grün.
- Installation: `prepare`-gestützte Git-Installation, Ein-Klick-Cursor-/VS-Code-Anbindungen, Dockerfile + GHCR-Workflow, Client-Config-Beispiele.

## A) Verteilung und Installation

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ npm-Veröffentlichung (`rea-plus`) | ABGESCHLOSSEN (v0.8.0, Kette v0.9.0+): `rea-plus@0.10.0` in der Registry; Tag-Kette (npm→warten→Registry, einzelner Trigger) | Installation in einem Befehl: `npx -y rea-plus` | S | — |
| ✅ MCP-Registry-Eintrag (`mcp-publisher`) | ABGESCHLOSSEN (v0.8.0, Kette v0.9.0+): `io.github.Alyhnte/rea-plus` released | Auffindbarkeit im offiziellen Katalog | S | — |
| ✅ GHCR-Image mit erstem Release pressen | ABGESCHLOSSEN (v0.7.4): Tags für `ghcr.io/alyhnte/reaplus` veröffentlicht und anonyme Ziehbarkeit verifiziert | Null-Installation für Docker-Nutzer | S | — |
| ✅ `rea-plus-cli setup`-Assistent | ABGESCHLOSSEN (v0.10.0): Client-Erkennung + bestätigtes Schreiben + `.bak` + Dry-Run; nur in temporärem HOME getestet | Größte Reibung beseitigt | M | — |
| ✅ `doctor --fix` | ABGESCHLOSSEN (v0.10.0): bestätigungsgesteuerter Installationsvorschlag (winget/brew/apt); läuft nicht ohne Bestätigung | Ein Befehl bei fehlendem Werkzeug | M | — |
| ◐ Windows-Einzeldatei-Exe (Node SEA) | MACHBARKEIT FERTIG (v0.10.0): Hello-World-SEA lief; Voll-App mit 3 Hindernissen (129 MB Frida-Binding, dynamisches Playwright, Signierung) — Alternative: portables Node-Bundle | Verteilung ohne Node; als Release-Asset | M | P2 |
| ✅ winget-/scoop-/homebrew-Manifeste | ABGESCHLOSSEN (v0.10.0): drei Manifeste versioniert + gehasht; keine Store-Einreichung | Entdeckung per Paketmanager | S | — |
| ◐ Signiertes Release + SBOM | TEILWEISE (v0.10.0): SBOM (CycloneDX) erzeugt; Signatur + Provenance/Trusted Publisher fehlen | Lieferkettenvertrauen | S | P2 |

## B) MCP-Protokoll und Agentenerfahrung

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ Toolset-Profile (`REA_TOOLSETS=static,debug`) | ABGESCHLOSSEN: `all` 191, `minimal` 8, `static` 98, `android` 27, `dotnet` 20, `web` 26, `debug` 50; Komma-Vereinigung, unbekanntes Profil = Startfehler, Ressourcen/Prompts ungefiltert | Werkzeuglistenkontext schrumpft, Trefferquote steigt | S | — |
| ✅ Ressourcen | ABGESCHLOSSEN: 2 statische schreibgeschützte Ressourcen (`rea-plus://server-info`, `rea-plus://capabilities-safety`); keine beliebige Datei-/Env-Öffnung, kein Subscribe | Server-Identität + Sicherheitsregeln per URI lesbar | M | — |
| ✅ Prompts | ABGESCHLOSSEN: 3 nebeneffektfreie Prompts (`packer-triage`, `dotnet-malware-triage`, `android-triage`); Prompt führt kein Werkzeug aus, gibt nur sequenziellen Ablaufttext zurück | Fertige Triage-Abläufe in einer Auswahl | S | — |
| ✅ `outputSchema` + `structuredContent` | ABGESCHLOSSEN (v0.10.0): 187 Werkzeuge mit `outputSchema` (4 dauerhaft schemalos); bei schlichten Objekt-Ergebnissen ist `structuredContent` gleich dem Text-JSON — Stand pro Werkzeug in [`TOOLS.md`](TOOLS.md) | Typsicherer Konsum | M | — |
| ✅ Progress-Meldung + Abbruch | ABGESCHLOSSEN (v0.10.0): Stage-Helfer + 3 gestufte Werkzeuge; synchrone Handler außerhalb des Umfangs (dokumentiert) | Agent sieht Fortschritt, kann abbrechen | M | — |
| ✅ Werkzeug-Annotations | ABGESCHLOSSEN (v0.10.0): 191 Annotations (null unbezeichnet) | Client-Bestätigungs-UX | S | — |
| ✅ Async-Job-Modell (starten → pollen) | ABGESCHLOSSEN (v0.10.0): 5 Job-Werkzeuge (192 Oberfläche); Whitelist 3er; Abbruch tötet den Prozessbaum | Lange Jobs werden ohne Blockieren gepollt | M | — |
| ✅ Roots-Unterstützung | ABGESCHLOSSEN (v0.10.0): legacy + modern MRTR; Workspace erweitert sich auf keinem Weg | Arbeitsbereich verengt sich automatisch | S | — |
| ✅ Sitzungsqueue + Serialisierung | ABGESCHLOSSEN (v0.10.0): FIFO-32 + `REA_SESSION_SERIALIZE` (zeitstempelbelegt), Timeout+Abbruch bleiben erhalten | Races enden | M | — |

## C) Sicherheit

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ Arbeitswurzel-Schranke (`REA_WORKSPACE_ROOT`) | ABGESCHLOSSEN: `rea_*` + Conduit-Pfade + abgeleitete Schreibvorgänge per Realpath innerhalb der Wurzel; Operator-Temp-/Cache-Ausnahme | Prompt-Injection-Oberfläche schließt sich | M | — |
| ✅ Schreibgeschützter Modus bei tokenlosem HTTP | ABGESCHLOSSEN: ohne Token Allowlist mit 44 Werkzeugen; Schnittmenge mit Toolset | Offener Port wird harmlos | S | — |
| ✅ Audit-Log (JSONL) | ABGESCHLOSSEN: pro Zeile `ts`/`transport`/`tool`/`durationMs`/`isError`; Geheimnisse werden nicht geschrieben | Vorfalluntersuchung | S | — |
| ✅ Ratenlimit + Nebenläufigkeit + Sitzungs-TTL | ABGESCHLOSSEN: 120/Min + 16 gleichzeitig + 30 Min TTL; ungültiger Wert = Startfehler | Widerstandsfähigkeit + Hygiene | S | — |
| ✅ Sandbox-Rezeptur (VM-Profildokument) | ABGESCHLOSSEN (v0.10.0): `docs/SANDBOX.md` (Hyper-V + VirtualBox, Snapshot + Wiederherstellung) | Fertige isolierte Umgebung | S | — |

## D) Debugger-Engines

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ Sitzungsqueue + Serialisierung | ABGESCHLOSSEN (v0.10.0): FIFO-32 + voller Seri-Modus; Timeout+Abbruch bleiben erhalten | Races enden | M | — |
| ◐ Echte Exception-Berichterstattung im Frida-Agenten | CODE + SPERRE FERTIG, LIVE-TOR OFFEN: `false` außerhalb von Slots, Installations-Timeouts; keine Frida-Live-VM-Bestätigung | Echte Abstürze werden sichtbar | S | **P0** (Live-VM) |
| ✅ Frida-Attach-/createScript-/Load-Timeouts | ABGESCHLOSSEN (v0.10.0): 15/10/15 s + Env-Override + aufräumendes `engine_timeout` | Hängen endet | S | — |
| ✅ cdb: Async-Pause + echte Push-Ereignisse | ABGESCHLOSSEN (v0.10.0): Event-Loop blockiert nicht, Push an Abonnenten | Mehrsitzungskomfort | M | — |
| ✅ x64dbg-Plugin-Auto-Provisionierung | ABGESCHLOSSEN (v0.10.0): Doctor + Setup, idempotent + hashverifiziert | Installationsreibung entfällt | M | — |
| LLDB-Engine (Linux/macOS) | Live-Debug nur Windows | Plattformabdeckung wächst | L | P3 |
| WinDbg-TTD-Aufzeichnungen lesen | Fehlend | Zeitreiseanalyse | L | P3 |

## E) Statische Domänen (Tiefe und Ehrlichkeit)

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ jadx echte Manifest-/Klassenfelder | ABGESCHLOSSEN (v0.10.0): `-cp`-Korrektur + echte APK eins-zu-eins + POSIX-Erkennungsscan | Android-Ausgabe verlässlich | S | — |
| ✅ Browser-Szenario | ABGESCHLOSSEN (v0.10.0): Schritte laufen wirklich + belegt + Dry-Run | Läuft wie benannt | M | — |
| ✅ FLIRT-Ehrlichkeit | ABGESCHLOSSEN (v0.10.0): `string-heuristic` + Konfidenz-Score | Vertrauen | S | — |
| ✅ Wasm/DWARF | ABGESCHLOSSEN (v0.10.0): Mehrbyte-LEB + v5/abbrev_offset | Echte Zusammenfassung | S/M | — |
| ✅ PE + PDB | ABGESCHLOSSEN (v0.10.0): echter Header + Download + Cache | Korrekte Namen + Symbol | S/M | — |
| ✅ Mach-O/iOS | ABGESCHLOSSEN (v0.10.0): reines TS + Fat + ObjC-Liste | Apple-Ziele | M | — |
| ✅ IL2CPP/Go/Flutter | ABGESCHLOSSEN (v0.10.0): Zählung + Mapping + Snapshot; ehrlicher Zweig ohne Werkzeug | RE-Tiefe | L | — |
| ✅ Binärdiff | ABGESCHLOSSEN (v0.10.0): hinzugefügt/entfernt/geändert + Streaming | Patch-Analyse | M | — |
| ◐ Echte Hopper-Brücke | RECHERCHE FERTIG: keine Headless-API (offiziell belegt) → ehrlich als Request-Vorbereitung; POSIX-Ähnlichkeits-Tor hinzugefügt | Echte Daten bei Lizenz | L | P3 |

## F) Verhaltens- und dynamische Analyse

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ Syscall-Matrix + CreateFileW/RegSet | ABGESCHLOSSEN (v0.10.0): ntdll-Nummern-Mapping + Zugriffsprofile | Tiefer Bericht | S | — |
| ✅ Ein-Aufruf-Verhaltenslauf | ABGESCHLOSSEN (v0.10.0): Spawn+Trace+Capture, Pflicht-Timeout, Crash-Ehrlichkeit | Profil in einem Aufruf | M | — |
| ✅ PCAP + TLS-Keylog | ABGESCHLOSSEN (v0.10.0): Strom-Reassemblierung + Keylog-Entschlüsselung; Unentschlüsselbares `sifreli` | C2-Verkehr lesbar | M | — |
| ✅ Dynamische Android-Rezeptur | ABGESCHLOSSEN (v0.10.0): 5-schrittige Erzeugung + Trocken-Verifikation; fehlendes Werkzeug markiert | Mobil-Einstieg | M | — |
| Symbolische Ausführung (angr/Triton, WSL) | Fehlend | Einziger echter Weg in der VMProtect-Klasse | L | P3 |
| Fuzzing-Harness (AFL++ WSL) | Fehlend | Crash-Finden in Zielparsern | L | P3 |

## G) Skalierung und Leistung

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ Lebendige Worker-Cache-Anbindung | ABGESCHLOSSEN (v0.10.0): Reposcan-Pfad zählerbelegt | Schnelle Wiederholung | M | — |
| ✅ Tote-Facade-Bereinigung (`probeCache`/`parallelProbe`) | ABGESCHLOSSEN (v0.10.1): Verhalten nach `workerCache` verlegt (`ResultCache`-TTL + `runProbes`); `probe.test.mjs` unter `worker-cache.test.mjs` verlegt | Toter Code entfernt | S | — |
| ✅ Paralleles Scannen (4er-Pool) | ABGESCHLOSSEN (v0.10.0): sequenzielles Zusammenführen + Abbruch + Fehlerisolation | CI-Integration | M | — |
| ✅ Schema-Budget | ABGESCHLOSSEN (v0.10.0): gemessene Schwellen (200 KB/110 KB/600 B) | Aufblähung endet | S | — |
| Schema-Budget-CI-Erzwingung | Test vorhanden, kein CI-Schritt | Budget bricht in CI | S | P2 |
| ✅ Streamendes Lesen | ABGESCHLOSSEN (v0.10.0): 64-KB-Puffer + Stopp bei Abbruch | OOM endet | M | — |

## H) Test und Qualität

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ Golden-Korpus-Manifest | ABGESCHLOSSEN (v0.10.1): `tests/corpus/mini.dex` (synthetisches minimales DEX v035, `scripts/dex-fixture-uret.mjs`) + `dex-golden` 7 Tests + HASHES-Eintrag | Regression wird früh gefangen | M | — |
| Self-hosted-Windows-Runner | Frida-/Debug-Tests laufen nicht in CI | Riskanteste Oberfläche kontinuierlich verifiziert | M | P0 |
| ✅ Parser-Fuzz-CI-Smoke | ABGESCHLOSSEN (v0.10.0): deterministische Mutation, Crash/Hang=0 | Stille Klassen werden gefangen | M | — |
| ✅ HTTP-e2e in Standardmenge | ABGESCHLOSSEN (v0.10.0): aus LIVE entfernt, kein Flake | Transportregression sichtbar | S | — |
| ✅ Leistungsbudgets | ABGESCHLOSSEN (v0.10.0): gemessene Schwellen, Medianmethode | Ansammlung endet | S | — |

## I) Dokumentation und Community

| Vorschlag | Stand heute / Lücke | Wirkung | Aufwand | Priorität |
|---|---|---|---|---|
| ✅ Automatische Werkzeugreferenz | ABGESCHLOSSEN (v0.10.0): [`TOOLS.md`](TOOLS.md) aus echter Oberfläche (191 Werkzeuge + 2 Ressourcen + 3 Prompts) | Aktueller Katalog | S | — |
| Beispielsitzungen (asciinema/GIF) in README | Kein visueller Beleg | Überzeugung in den ersten 10 Sekunden (Stern-Konversion) | S | P1 |
| ◐ Docs-Site | ERZEUGT (v0.10.0): 7 statische Seiten + 0 kaputte Links | Durchsuchbare Doku | M | P2 |
| Pages-Deploy (Site fertig, kein Release) | `docs/site/` erzeugt, aber nicht an GitHub Pages angebunden | Doku unter einer URL | S | P2 |
| ✅ Promptbibliothek | ABGESCHLOSSEN (v0.10.0): `docs/PROMPTS.md` (10 Prompts, mit Beispielaufruf) | Erster Wert in Minuten | S | — |
| good-first-issue + erweiterndes CONTRIBUTING | Ein Absatz | Beitragstrichter öffnet sich | S | P3 |

---

**Empfohlene Reihenfolge (Offengebliebenes):** Frida-Live-VM → Runner → Trusted Publisher → Beispielsitzungen → Pages-Deploy → P3-Recherche.
In v0.10.1 Geschlossenes: tote-Facade-Bereinigung + Golden-DEX-Korpus (oben ✅-markierte); in v0.10.0 Geschlossenes: alle I/J/K-Wellen.
