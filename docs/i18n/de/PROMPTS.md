# ReaPlus-Promptbibliothek (10 fertige Prompts)

10 fertige Fragevorlagen, die der Agent an rea-plus stellt. Jeder Prompt: **Ziel** +
**Beispielaufruf** (echte MCP-/`rea-plus-cli`-Form, Feldnamen identisch mit der erzeugten
Referenz [`TOOLS.md`](TOOLS.md)) + Art der **erwarteten Ausgabe**.
Oberfläche: **187 Werkzeuge**, **183 outputSchema**, **187 annotations**, 2 Ressourcen, 3 Prompts.

> Hinweis: Live-Debug-Aufrufe, die `confirm:true` verlangen, stehen nicht in der Liste; alle
> 10 Prompts hier sind schreibgeschützte/statische Abläufe.

## 1) Triage — „Was ist diese Datei, wo fange ich an?“

**Ziel:** Eine unbekannte Datei in einem Aufruf klassifizieren und den Folgeplan erhalten.

**Beispielaufruf:**

```json
{ "name": "rea_investigate", "arguments": { "path": "sample.exe" } }
```

**Erwartete Ausgabe:** Objekt mit den Feldern `ok/plan/skor/tip/motor/yedekler` (`outputSchema`-
Felder: `arac, motor, ok, plan, skor, tip, yedekler`); Typ (pe/elf/apk/…),
Konfidenz-Score und empfohlene Engine + Fallback-Planliste.

## 2) Manifest — „Paket, Berechtigungen, Aktivitäten dieser APK?“

**Ziel:** Die `AndroidManifest.xml`-Identität der APK mit jadx auflösen.

**Beispielaufruf:**

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

**Erwartete Ausgabe:** Objekt mit den Feldern `ok/paket/izinler/aktiviteler`; ohne jadx kein
erfundenes Manifest, sondern `capability_unsupported` + Installationshinweis.

## 3) Verhalten — „Ereignisse auf eine Timeline legen“

**Ziel:** Aus API-/Syscall-/Netz-/Datei-/Prozess-Ereignissen eine quellenpriorisierte Zusammenfassung erzeugen
(keine Ausführung, reine Funktion).

**Beispielaufruf:**

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

**Erwartete Ausgabe:** Textzusammenfassung (Format `4 olay api@2 -> process@4 top_api=CreateFileW`)
plus Details `sıralı/sayılar/top_api/ilk/son`; bei leerer Liste
`capability_unsupported`.

## 4) Repo — „Welche Dateitypen liegen in diesem Verzeichnis?“

**Ziel:** PE-/ELF-/APK-/JS-/WASM-Dateien in einem Verzeichnis per Magie-Byte erkennen und
pro Datei einen Folgewerkzeug-Plan erhalten.

**Beispielaufruf:**

```json
{ "name": "rea_scan_repo", "arguments": { "path": "<hedef-dizin>" } }
```

**Erwartete Ausgabe:** `summary`-Text (Format `5 dosya, 5 tip …`) +
`details.tipler`-Zählung + `details.planlar` (Datei → empfohlene Engine);
in einem ziellosen Verzeichnis leere Liste (`ok:true`).

## 5) PDB — „Vom Debug-Datensatz zum Symbol“

**Ziel:** Aus dem CodeView-RSDS-Datensatz der PE die PDB-Identität auflösen, im Microsoft-Symbol-
server-Layout herunterladen (mit Integrität + Cache).

**Beispielaufruf:**

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-bilgili.exe>'))))"
```

**Erwartete Ausgabe:** In Schritt 1 `pdb/guid/yas` (`rea_pdb_yolu`-Felder:
`arac, dosya, guid, ok, pdb, yas`); in Schritt 2 URL im Layout `Name/GUID-ohne-Bindestriche+ALTER/Name`,
`yol/cache`-Info (`rea_pdb_indir`-Felder:
`arac, cache, dosya, guid, ok, pdb, url, yas, yol`); bei kaputtem Inhalt
`butunluk_hatasi`, beim zweiten Aufruf `cache:true`.

## 6) Diff — „Was ist der Funktionsunterschied zwischen zwei Versionen?“

**Ziel:** Die Funktionslisten zweier Binärversionen vergleichen und die Mengen hinzugefügt/entfernt/geändert/unverändert erhalten (Einstieg in N-day-Analyse).

**Beispielaufruf:**

```json
{ "name": "rea_bindiff_karsilastir", "arguments": { "text": "<rea_bindiff_fonksiyonlar çıktısı>" } }
```

**Erwartete Ausgabe:** Objekt mit den Feldern `aynen/cikarilan/degisen/eklenen/eski/yeni/istatistik/ozet`;
Eingabe ist die Ausgabe von `rea_bindiff_fonksiyonlar` (`path` Pflicht).

## 7) Pcap — „Welche Ströme hat dieser Mitschnitt, löst sich TLS?“

**Ziel:** Ströme in einer PCAP-Datei reassemblieren; bei Keylog TLS-Inhalte entschlüsseln.

**Beispielaufruf:**

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap" } }
```

Mit Keylog:

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap", "keylog": "sslkeylog.txt" } }
```

**Erwartete Ausgabe:** Reassemblierte Stromliste in `details/summary`
(`outputSchema` vorhanden); `keylog` ist optional, ohne Angabe kommen
verschlüsselte Inhalte unentschlüsselt als Meta-Ströme zurück.

## 8) Rezeptur — „Dynamischen Analyseplan für diese APK erzeugen und verifizieren“

**Ziel:** Aus einem APK-Pfad eine trockengeprüfte dynamische Analyse-Rezeptur erzeugen
(keine Ausführung, Plan + Verifikation).

**Beispielaufruf:**

```json
{ "name": "rea_android_dinamik_recete", "arguments": { "path": "ornek.apk" } }
```

Danach mit dem Rezepturtext:

```json
{ "name": "rea_android_recete_dogrula", "arguments": { "text": "<recete-metni>" } }
```

**Erwartete Ausgabe:** Erstens Objekt mit Feld `recete`; zweitens Verifikationsergebnis mit den Feldern `adim_sayisi/ok`.

## 9) Fuzz — „Stürzen Parser bei kaputter Eingabe ab?“

**Ziel:** PE-/ELF-/WASM-/Metadata-Parser mit Korpus-Seeds mit kaputter
Eingabe füttern und nach Absturz-/Ausnahme-Scan suchen (Schreiben nur nach tmpdir).

**Beispielaufruf:**

```bash
node scripts/fuzz-parsers.mjs
```

**Erwartete Ausgabe:** Konsolenzusammenfassung (Seed-Zahl, Liste abgestürzter Eingaben; bei sauberem
Lauf null Abstürze) + `tests/parser-fuzz.test.mjs`-Grün; Korpus
(`tests/corpus/`) bleibt schreibgeschützt.

## 10) Perf — „Halten Listen-/Start-Budgets?“

**Ziel:** `tools/list`-Antwortzeit + Server-Startzeit-Budgets messen,
Regression per Test fangen.

**Beispielaufruf:**

```bash
node tests/perf-budget.test.mjs
```

**Erwartete Ausgabe:** node:test-Ausgabe (Budget-Schwellen definiert in `tests/perf-budget.test.mjs`);
Schwellenüberschreitung lässt den Test rot werden, Zeiten werden in der Konsole
in Millisekunden berichtet.
