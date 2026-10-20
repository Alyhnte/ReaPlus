# ReaPlus Example Prompt Library

5 ready-made scenarios: command + expected output + what it means. **Every
command and every number here comes from a real run** (no fabricated output);
`tests/docs-examples.test.mjs` executes and verifies all of them.

Surface (generated reference [`TOOLS.md`](TOOLS.md) summary): **191 tools**,
**187 outputSchemas**, **191 annotations**, 2 resources, 7 prompts.

Prerequisite: `npm run build` (examples run against `dist/`). Corpus
files are read-only (`tests/corpus/`); no example modifies them.

## 1) PE triage — "what is this exe, what does it call?"

```bash
node dist/cli/index.js analyze-pe tests/corpus/mini_pe_x64.exe
```

Expected output (real run):

```text
dosya: tests/corpus/mini_pe_x64.exe
machine: 0x8664 bit: 64 sections: 1 entry: 0x1000
dll (1): kernel32.dll
fonksiyon (1): kernel32.dll!ExitProcess
```

What it means: `0x8664` = x64 COFF, a single `.text` section, entry at
`0x1000`; a single import `kernel32.dll!ExitProcess` — the profile of a
minimal test binary. Machine-readable form:

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

## 2) APK manifest — "what are this package's name, permissions, activities?"

If `jadx` is installed (otherwise it returns `capability_unsupported` + an
install hint; no fabricated manifest is generated):

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

Expected output (real run, jadx 1.x):

```json
{"ok":true,"arac":"rea_jadx_manifest","apk":"tests/corpus/sahte.apk",
 "paket":"com.ornek.sahte","izinler":[],"aktiviteler":[]}
```

What it means: jadx unpacks sources with `--no-src` and parses
`AndroidManifest.xml`; the fake corpus APK has a package name but no
permissions/activities — in a real app, permissions like `INTERNET` and
activities like `.MainActivity` would be listed here. Drill into the class
list with `rea_jadx_classes`, into a single class's source with
`rea_jadx_decompile`.

## 3) Behavior profile — "lay events on a timeline"

Pure function, no execution — orders API/syscall/net/file/process events by
source priority and produces a first/last + top-5 API summary:

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

Expected output (real run):

```text
4 olay api@2 -> process@4 top_api=CreateFileW
```

What it means: the 4 events are ordered not chronologically but by **source
priority** (api > syscall > net > dosya > process); `sayılar` is
`{api:2, net:1, process:1}` and `top_api` gives the most frequent API. An
empty/missing list returns `capability_unsupported` — no empty timeline is
fabricated.

## 4) Repo scan — "what kinds of files are in this directory?"

PE/ELF/APK/JS/WASM detection via magic bytes + extension hints, engine
suggestion, and a 5-file plan (fully offline; `.git`/`node_modules`/`dist`
are skipped):

```bash
node -e "import('node:fs').then(async fs=>{const {rea_scan_repo}=await import('./dist/rea-domains/reposcan/RepoScan.js');
const r=await rea_scan_repo('<target-dir>');console.log(r.summary,JSON.stringify(r.details.tipler));})"
```

Real run in a directory with 5 magic-byte files:

```text
5 dosya, 5 tip {"pe":1,"elf":1,"apk":1,"js":1,"wasm":1}
```

What it means: each file is listed as a `yol/tip/motor` triple (e.g. `.exe`
→ `pe`/`cutter`, `.apk` → `apk`/`jadx`, `.elf` → `elf`/`radare2`);
`planlar` gives the suggested next tool per file. A targetless/empty
directory yields an empty list (`ok:true`); a missing directory yields
`capability_unsupported`.

## 5) PDB download — "from debug record to symbols"

Step 1 — Resolve the PDB identity from the CodeView RSDS record (read-only):

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-info.exe>'))))"
```

Real run on a PE with debug info (locally generated sample):

```json
{"ok":true,"arac":"rea_pdb_yolu","pdb":"ornek_test.pdb",
 "guid":"ABCDEF01-2345-6789-ABCD-EF0123456789","yas":1}
```

Without a debug record it returns `bulunamadi` (`PDB debug kaydı yok`) — no
fabricated GUID is generated.

Step 2 — Download in Microsoft symbol server layout + integrity + cache:

```text
<server>/ornek_test.pdb/ABCDEF0123456789ABCDEF01234567891/ornek_test.pdb
```

What it means: the URL follows the `Name/GUID-dashless+AGE/Name` layout; the
downloaded file is verified against the MSF signature + GUID+age pattern
and written under `<cache>/Name/SIG/Name`; the second call returns
`cache:true` without hitting the network. Corrupt content is rejected with
`butunluk_hatasi` and no partial file is written; without network,
`ag_hatasi` — a fake PDB is never written. The cache directory can be moved
with `REAPLUS_SYMBOL_CACHE`.

## Next steps

- Full tool list: [`TOOLS.md`](TOOLS.md) (generated, 191 tools).
- Verification flow: [`VERIFY.md`](VERIFY.md); contribution flow: `CONTRIBUTING.md`.
