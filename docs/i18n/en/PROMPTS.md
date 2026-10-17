# ReaPlus Prompt Library (10 ready-made prompts)

10 ready-made question patterns for an agent to ask rea-plus. Each prompt:
**Goal** + **Sample call** (real MCP/`rea-plus-cli` form; field names match
the generated reference [`TOOLS.md`](TOOLS.md)) + **Expected output** kind.
Surface: **187 tools**, **183 outputSchemas**, **187 annotations**, 2
resources, 3 prompts.

> Note: live-debug calls requiring `confirm:true` are not in this list; all
> 10 prompts here are read-only/static flows.

## 1) Triage — "what is this file, where do I start?"

**Goal:** Classify an unknown file in one call and get the next-step plan.

**Sample call:**

```json
{ "name": "rea_investigate", "arguments": { "path": "sample.exe" } }
```

**Expected output:** object with `ok/plan/skor/tip/motor/yedekler` fields
(`outputSchema` fields: `arac, motor, ok, plan, skor, tip, yedekler`); type
(pe/elf/apk/…), confidence score, and suggested engine + fallback plan list.

## 2) Manifest — "what are this APK's package, permissions, activities?"

**Goal:** Resolve the APK's `AndroidManifest.xml` identity with jadx.

**Sample call:**

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

**Expected output:** object with `ok/paket/izinler/aktiviteler` fields;
without jadx, `capability_unsupported` + install hint instead of a fabricated
manifest.

## 3) Behavior — "lay events on a timeline"

**Goal:** Produce a source-priority summary from API/syscall/net/file/process
events (no execution, pure function).

**Sample call:**

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

**Expected output:** Text summary (in the
`4 olay api@2 -> process@4 top_api=CreateFileW` form) +
`sıralı/sayılar/top_api/ilk/son` details; `capability_unsupported` on an
empty list.

## 4) Repo — "what kinds of files are in this directory?"

**Goal:** Detect PE/ELF/APK/JS/WASM files in a directory via magic bytes and
get a per-file next-tool plan.

**Sample call:**

```json
{ "name": "rea_scan_repo", "arguments": { "path": "<target-dir>" } }
```

**Expected output:** `summary` text (in the `5 dosya, 5 tip …` form) +
`details.tipler` counts + `details.planlar` (file → suggested engine); empty
list for a targetless directory (`ok:true`).

## 5) PDB — "go from debug record to symbols"

**Goal:** Resolve the PDB identity from the PE's CodeView RSDS record,
download in Microsoft symbol server layout (integrity-checked + cached).

**Sample call:**

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-info.exe>'))))"
```

**Expected output:** in step 1, `pdb/guid/yas` (`rea_pdb_yolu` fields:
`arac, dosya, guid, ok, pdb, yas`); in step 2, a
`Ad/GUID-tiresiz+YAŞ/Ad`-layout URL with `yol/cache` info (`rea_pdb_indir`
fields: `arac, cache, dosya, guid, ok, pdb, url, yas, yol`);
`butunluk_hatasi` on corrupt content, `cache:true` on the second call.

## 6) Diff — "what is the function diff between two versions?"

**Goal:** Compare two binary versions' function lists and get the
added/removed/changed/unchanged sets (N-day review input).

**Sample call:**

```json
{ "name": "rea_bindiff_karsilastir", "arguments": { "text": "<rea_bindiff_fonksiyonlar output>" } }
```

**Expected output:** object with
`aynen/cikarilan/degisen/eklenen/eski/yeni/istatistik/ozet` fields; the input
is `rea_bindiff_fonksiyonlar` (`path` required) output.

## 7) Pcap — "which streams are in this capture, does TLS decrypt?"

**Goal:** Reassemble the streams in a PCAP file; decrypt TLS content if a
keylog is present.

**Sample call:**

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap" } }
```

With keylog:

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap", "keylog": "sslkeylog.txt" } }
```

**Expected output:** reassembled stream list inside `details/summary`
(`outputSchema` present); `keylog` is optional — without it, meta-streams are
returned with encrypted content undecrypted.

## 8) Recipe — "generate and validate a dynamic analysis plan for this APK"

**Goal:** Generate a dry-validated dynamic analysis recipe from an APK path
(no execution, plan + validation).

**Sample call:**

```json
{ "name": "rea_android_dinamik_recete", "arguments": { "path": "ornek.apk" } }
```

Then, with the recipe text:

```json
{ "name": "rea_android_recete_dogrula", "arguments": { "text": "<recipe-text>" } }
```

**Expected output:** the first returns an object with a `recete` field; the
second a validation result with `adim_sayisi/ok` fields.

## 9) Fuzz — "do parsers survive malformed input?"

**Goal:** Feed malformed input to PE/ELF/WASM/metadata parsers from corpus
seeds and scan for crashes/exceptions (writes go to tmpdir only).

**Sample call:**

```bash
node scripts/fuzz-parsers.mjs
```

**Expected output:** console summary (seed count, crashed-input list; zero
crashes on a clean run) + green `tests/parser-fuzz.test.mjs`; corpus
(`tests/corpus/`) stays read-only.

## 10) Perf — "do the list/startup budgets hold?"

**Goal:** Measure `tools/list` response-time + server startup-time budgets,
catch regressions via test.

**Sample call:**

```bash
node tests/perf-budget.test.mjs
```

**Expected output:** node:test output (budget thresholds defined in
`tests/perf-budget.test.mjs`); a threshold breach turns the test red,
durations are reported in milliseconds on the console.
