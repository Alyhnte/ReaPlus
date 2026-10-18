# ReaPlus-Beispiel-Promptbibliothek

5 fertige Szenarien: Befehl + erwartete Ausgabe + was sie bedeutet. Jeder
**Befehl und jede Zahl hier stammt aus einem echten Lauf** (keine erfundene Ausgabe);
`tests/docs-examples.test.mjs` führt sie alle aus und verifiziert sie.

Oberfläche (Zusammenfassung der erzeugten Referenz [`TOOLS.md`](TOOLS.md)): **191 Werkzeuge**,
**187 outputSchema**, **191 annotations**, 2 Ressourcen, 7 Prompts.

Voraussetzung: `npm run build` (Beispiele laufen über `dist/`). Korpus-
dateien sind schreibgeschützt (`tests/corpus/`); kein Beispiel verändert sie.

## 1) PE-Triage — „Was ist diese Exe, was ruft sie auf?“

```bash
node dist/cli/index.js analyze-pe tests/corpus/mini_pe_x64.exe
```

Erwartete Ausgabe (echter Lauf):

```text
dosya: tests/corpus/mini_pe_x64.exe
machine: 0x8664 bit: 64 sections: 1 entry: 0x1000
dll (1): kernel32.dll
fonksiyon (1): kernel32.dll!ExitProcess
```

Was es bedeutet: `0x8664` = x64-COFF, eine einzige `.text`-Sektion, Entry `0x1000`;
ein einziger Import `kernel32.dll!ExitProcess` — Profil einer minimalen Testbinärdatei.
Maschinenlesbare Form:

```bash
node dist/cli/index.js analyze-pe tests/corpus/mini_pe_x64.exe --json
```

```json
{"ok":true,"path":"tests/corpus/mini_pe_x64.exe","machine":34404,
 "machine_hex":"0x8664","bit":"64","section_sayisi":1,"entry":4096,
 "entry_hex":"0x1000","dlls":["kernel32.dll"],
 "fonksiyonlar":["kernel32.dll!ExitProcess"],
 "bolumler":[{"ad":".text","vsize":4096,"vaddr":4096}]}
```

## 2) APK-Manifest — „Wie heißen Paket, Berechtigungen, Aktivitäten?“

Falls `jadx` installiert ist (sonst kommt `capability_unsupported` + Installationshinweis zurück,
kein erfundenes Manifest wird erzeugt):

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

Erwartete Ausgabe (echter Lauf, jadx 1.x):

```json
{"ok":true,"arac":"rea_jadx_manifest","apk":"tests/corpus/sahte.apk",
 "paket":"com.ornek.sahte","izinler":[],"aktiviteler":[]}
```

Was es bedeutet: jadx öffnet mit `--no-src` die Quellen und parst `AndroidManifest.xml`;
in der gefälschten Korpus-APK gibt es einen Paketnamen, aber keine Berechtigungen/Aktivitäten —
in einer echten App stünden hier Berechtigungen wie `INTERNET` und Aktivitäten wie `.MainActivity`.
Mit `rea_jadx_classes` geht es hinunter zur Klassenliste,
mit `rea_jadx_decompile` zur Quelle einer einzelnen Klasse.

## 3) Verhaltensprofil — „Ereignisse auf eine Timeline legen“

Reine Funktion, keine Ausführung — reiht API-/Syscall-/Netz-/Datei-/Prozess-Ereignisse
nach Quellenpriorität, erzeugt Erst-/Letzt- + Top-5-API-Zusammenfassung:

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

Erwartete Ausgabe (echter Lauf):

```text
4 olay api@2 -> process@4 top_api=CreateFileW
```

Was es bedeutet: 4 Ereignisse werden nicht chronologisch, sondern nach **Quellenpriorität**
(api > syscall > net > Datei > Prozess) gereiht; `sayılar`
`{api:2, net:1, process:1}`, `top_api` gibt die häufigste API. Bei leerer/unvollständiger
Liste kommt `capability_unsupported` zurück — keine leere Timeline wird erfunden.

## 4) Repo-Scan — „Welche Dateitypen liegen in diesem Verzeichnis?“

PE-/ELF-/APK-/JS-/WASM-Erkennung per Magie-Byte + Erweiterungshinweis, Engine-Empfehlung und
5-Dateien-Plan (vollständig offline, `.git`/`node_modules`/`dist` werden übersprungen):

```bash
node -e "import('node:fs').then(async fs=>{const {rea_scan_repo}=await import('./dist/rea-domains/reposcan/RepoScan.js');
const r=await rea_scan_repo('<hedef-dizin>');console.log(r.summary,JSON.stringify(r.details.tipler));})"
```

Echter Lauf in einem Verzeichnis mit 5 magischen Dateien:

```text
5 dosya, 5 tip {"pe":1,"elf":1,"apk":1,"js":1,"wasm":1}
```

Was es bedeutet: Jede Datei wird als `Pfad/Typ/Engine`-Tripel gelistet
(z. B. `.exe` → `pe`/`cutter`, `.apk` → `apk`/`jadx`, `.elf` →
`elf`/`radare2`); `planlar` gibt pro Datei das empfohlene nächste Werkzeug.
In einem ziellosen/leeren Verzeichnis leere Liste (`ok:true`), in einem
nicht vorhandenen Verzeichnis `capability_unsupported`.

## 5) PDB-Download — „Vom Debug-Datensatz zum Symbol“

Schritt 1 — PDB-Identität aus dem CodeView-RSDS-Datensatz auflösen (schreibgeschützt):

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-bilgili.exe>'))))"
```

Echter Lauf auf einer PE mit Debug-Info (lokal erzeugtes Beispiel):

```json
{"ok":true,"arac":"rea_pdb_yolu","pdb":"ornek_test.pdb",
 "guid":"ABCDEF01-2345-6789-ABCD-EF0123456789","yas":1}
```

Ohne Debug-Datensatz kommt `bulunamadi` zurück (`PDB debug kaydı yok`) — keine erfundene
GUID wird erzeugt.

Schritt 2 — Im Microsoft-Symbolserver-Layout herunterladen + Integrität + Cache:

```text
<server>/ornek_test.pdb/ABCDEF0123456789ABCDEF01234567891/ornek_test.pdb
```

Was es bedeutet: Die URL folgt dem Layout `Name/GUID-ohne-Bindestriche+ALTER/Name`; die heruntergeladene Datei
wird per MSF-Signatur + GUID+Alter-Muster verifiziert, unter `<Cache>/Name/SIG/Name`
geschrieben; der zweite Aufruf kommt ohne Netz mit `cache:true` zurück. Kaputter
Inhalt wird mit `butunluk_hatasi` abgewiesen, keine halbe Datei wird geschrieben; ohne Netz
`ag_hatasi` — eine gefälschte PDB wird niemals geschrieben. Das Cache-Verzeichnis
wird mit `REAPLUS_SYMBOL_CACHE` verlegt.

## Nächste Schritte

- Vollständige Werkzeugliste: [`TOOLS.md`](TOOLS.md) (erzeugt, 187 Werkzeuge).
- Verifikationsablauf: [`VERIFY.md`](VERIFY.md); Mitwirkungsablauf: `CONTRIBUTING.md`.
