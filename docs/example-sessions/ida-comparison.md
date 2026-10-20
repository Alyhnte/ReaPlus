# Session: Target analysis with IDA + engine comparison

> **Scenario:** Queue the same target through two engines (IDA `idat` batch
> + Ghidra headless), normalize the function lists to one schema, and turn the
> difference into numbers. This session shows rea-plus's IDA surface
> (`rea_ida_*`) and its honest gate behavior: **when IDA is not installed the
> analysis is not invented** — it returns `capability_unsupported`.
>
> Example targets: `tests/corpus/mini_branch.elf` (Ghidra side: function
> `entry`, `00400200`, size 30) and `tests/corpus/mini_pe_x64.exe`.

## Prerequisites

| Requirement | Note |
|---|---|
| IDA Pro license + console binary | `idat64` / `idat` / `ida64` — `idaYolu()` checks `REA_IDA_PATH` first, then the three PATH candidates |
| `$env:REA_IDA_PATH` | e.g. `C:\ida\idat64.exe` — read only from the environment; no hidden default path in code |
| `npm run build` | `node -e import(...)` does not work without `dist/` |
| (Optional) IDA MCP plugin | See the "IDA MCP note" section below |

```powershell
$env:REA_IDA_PATH = "C:\ida\idat64.exe"   # adjust to your install
node dist/cli/index.js doctor --json        # the ida line reports its "status" to you
```

## Step by step

### 1) Is IDA installed? — gate test

```powershell
node -e "import('./dist/rea-domains/ida/IdaProvider.js').then(m=>console.log(JSON.stringify(m.rea_ida_idb('tests/corpus/mini_branch.elf','out/mini_branch.i64'))))"
```

**Real output when IDA is absent** (no invented result; this text comes directly
from the source):

```json
{"ok":false,"code":"capability_unsupported","neden":"REA_IDA_PATH yok ve idat PATH'te bulunamadı — fallback: rizin/cutter (rea_cutter_*) ya da Ghidra headless (rea_ghidra_analyze) ile analiz edin"}
```

### 2) IDB batch generation (the target is **not executed**)

When the gate is open, the bridge runs the following argv (source:
`src/rea-domains/ida/IdaProvider.ts`, `rea_ida_idb` — the attached `-o` form
first, then the separate-argument form if that is rejected):

```text
idat -A -B -o<out.i64> <target>
```

- `-A`: autonomous (no interaction), `-B`: batch (produce the idb and close).
- Timeout is 300 s; if the output file is not produced, the gate closes.
- MCP input: `{ "path": "...", "out": "..." }`.

Shape returned by a successful run:

```json
{"ok":true,"arac":"rea_ida_idb","hedef":"<target>","idb":"<out>","idat":"<idat path>"}
```

You can open the generated `.i64` in the IDA GUI to inspect symbols/decompilation
yourself; the tool does not open a GUI at the end of the batch.

### 3) Honest string heuristic instead of FLIRT

`rea_ida_flirt` does **not apply a real FLIRT signature** (it needs no signature
DB + IDA); it reads the target file and looks for compiler patterns (`MSVC`,
`MFC`, `ATL`, `GCC:`, `clang version`, `__cxa_`, `.eh_frame`, `Borland`,
`Delphi`, `FLIRT`, ...). The confidence threshold is 0.5; a match below it
returns `kutuphane:"bilinmiyor"` — no fake certainty.

```powershell
node -e "import('./dist/rea-domains/ida/IdaProvider.js').then(m=>console.log(JSON.stringify(m.rea_ida_flirt('tests/corpus/mini_pe_x64.exe'))))"
```

Real tiny-PE output (no compiler trace → confidence 0):

```json
{"ok":true,"arac":"rea_ida_flirt","hedef":"tests/corpus/mini_pe_x64.exe","eslesmeler":[],"surumler":[],"sayi":0,"method":"string-heuristic","guven":0,"kutuphane":"bilinmiyor","idaMevcut":false,"not":"IDA bulunamadı (REA_IDA_PATH yok ve idat PATH'te bulunamadı); gerçek FLIRT imzası uygulanmadı, sonuç string-sezgisel tahmindir."}
```

If you need a real FLIRT result: open the `rea_ida_idb` output in IDA and apply
the signature there (the tool does not claim to do this).

### 4) Engine comparison (Ghidra ↔ r2 ↔ IDA)

To turn the difference into numbers, both engines' function lists are normalized
to `{name, sig, body}`, and `rea_diff_summary` / `rea_diff_match` receive them as
JSON strings (`{"a": "...", "b": "..."}`).

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>console.log(JSON.stringify(m.rea_ghidra_funcs('tests/corpus/mini_branch.elf'))))"
node -e "import('./dist/rea-domains/r2plus/R2Plus.js').then(m=>console.log(JSON.stringify(m.rea_r2_callgraph('tests/corpus/mini_branch.elf'))))"
```

Ghidra: `[{"name":"entry","entry":"00400200","size":30,"callingConvention":"processEntry"}]`
r2: `[{"ad":"entry0","addr":4194816,"cagrilar":[]}]`

```powershell
node -e "import('./dist/rea-domains/javascript/BinaryDiff.js').then(m=>{
const a=[{name:'entry',sig:'processEntry',body:'lea push mov cmp jz'},{name:'sym.imp.exit',sig:'',body:'jmp'}];
const b=[{name:'entry',sig:'processEntry',body:'lea push mov cmp jz'},{name:'entry0',sig:'processEntry',body:'lea push mov cmp jz'}];
console.log(JSON.stringify(m.rea_diff_summary(a,b)));
console.log(JSON.stringify(m.rea_diff_match(a,b)));})"
```

Real output shape:

```json
{"ok":true,"tool":"rea_diff_summary","summary":"+1 -1","details":{"added":1,"removed":1}}
{"ok":true,"tool":"rea_diff_match","summary":"1 eşleşme","details":{"matched":[{"from":"entry","to":"entry","score":1}]}}
```

Interpretation: the name difference (`entry` ↔ `entry0`) looks like
"added/removed", but `rea_diff_match` matches the same body — engine naming
differs, the function is the same. You can normalize the IDA side the same way
and use it as a third string instead of `a`/`b`.

### 5) Order for a larger target

1. `rea_ida_idb` (generation can take a while; 300 s cap), or
2. a quick pass with Ghidra (`rea_ghidra_analyze` + `rea_ghidra_funcs`), then
3. deepen only the conflicting/suspicious functions in IDA (GUI + signatures).

This order follows the repo decision that the commercial gate is gate-only:
`docs/ARASTIRMA-TICARI-ENTEGRASYONLAR.md`.

## IDA MCP note (honest boundary)

- At the `doctor`/catalog level, the suggested env name for IDA is `REA_IDA_URL`
  (source: `src/facade/configSuggest.ts`).
- **rea-plus does not fetch data from that URL.** rea-plus's registered IDA
  tools are `rea_ida_idb` and `rea_ida_flirt`; `REA_IDA_URL` points at an IDA MCP
  plugin you install separately (a separate server inside IDA). That plugin's
  tool names depend on its version; this document does not invent them.
- Finish the comparison with the rea-plus tools in this session; treat IDA MCP
  only as an extra query surface on the IDA side.

## Common errors and fixes

| Symptom | Cause | Fix |
|---|---|---|
| `capability_unsupported` + `REA_IDA_PATH`/`idat` missing | IDA is not installed or not on PATH | Set `REA_IDA_PATH` to the full idat path; or switch to the Ghidra/rizin fallback (the tool already reports it) |
| `capability_unsupported` + target missing | `path` is wrong or the file does not exist | Pass the corpus path as `tests/corpus/...` |
| `capability_unsupported` + empty output path | The `out` parameter is empty | Provide an output path with a `.i64`/`.idb` extension |
| `idat batch error: ...` | Missing license/plugin/console, or the batch crashed | Try the same target manually with `idat -A -B -o... <target>`; verify the IDA console install |
| `idb could not be produced: <path>` | idat did not write output | Check write permissions and free disk space; switch to the scripted `-S` variant |
| Gate is open but the `.i64` does not open in IDA | Version mismatch | Open the idb with the IDA version that produced it (the batch uses that version's IDA) |
