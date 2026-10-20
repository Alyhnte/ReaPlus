# Session: Binary analysis flow with Ghidra headless

> **Scenario:** You have an ELF/PE to analyze (example: `tests/corpus/mini_branch.elf`
> from the repo corpus — entry `0x400200`, one function `entry`, size 30 bytes).
> Goal: import + automatic analysis + function/string/disasm/decompile output
> **without running the target**. This session shows rea-plus's Ghidra bridge
> (`rea_ghidra_*`) and the real `analyzeHeadless` flow behind it.

## Prerequisites

| Requirement | How to verify |
|---|---|
| Ghidra 12.x (zip install; no winget package) | `$env:REA_GHIDRA_DIR` is set and the directory exists |
| `support\analyzeHeadless.bat` | `Test-Path "$env:REA_GHIDRA_DIR\support\analyzeHeadless.bat"` |
| `support\pyghidraRun.bat` (Ghidra 12 headless does not include Jython; `.py` scripts run in PyGhidra mode) | `Test-Path "$env:REA_GHIDRA_DIR\support\pyghidraRun.bat"` |
| JDK 21+ (`java -version` must report 17+; a JRE is not enough) | `java -version` |
| rea-plus built | `npm run build` (run from the repo root) |

Install constant (environment variable only; no hidden default path in code):

```powershell
$env:REA_GHIDRA_DIR = "C:\tools\ghidra\ghidra_12.1.4_PUBLIC"
Test-Path "$env:REA_GHIDRA_DIR\support\analyzeHeadless.bat"   # must be True
Test-Path "$env:REA_GHIDRA_DIR\support\pyghidraRun.bat"       # must be True
node dist/cli/index.js doctor --json                           # the java line must say "present"
```

`doctor` reports a missing piece honestly: with no Java it returns `"status":"missing"` +
a catalog link; nothing anywhere shows a fake "installed".

## Step by step (from the repo root)

### 1) Import + automatic analysis (no script)

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>{const r=m.rea_ghidra_analyze('tests/corpus/mini_branch.elf');console.log(r.ok, r.ok?String(r.log).split('\n').slice(-6).join('\n'):r.neden);})"
```

This call runs `analyzeHeadless.bat` with the following real argv (bridge source:
`src/rea-domains/ghidra/GhidraBridge.ts`, `rea_ghidra_analyze`):

```text
analyzeHeadless.bat <temp-project-dir> rea_tmp -import <target> -overwrite -deleteProject
```

Expected output shape (the **tail** of the log; the first analysis can take 1-3 min):

```text
true
-----------------------------------------------------
     Total Time   1 secs
-----------------------------------------------------
INFO  REPORT: Analysis succeeded for file: file:///.../mini_branch.elf (HeadlessAnalyzer)
INFO  REPORT: Save succeeded for: /mini_branch.elf (rea_tmp:/mini_branch.elf) (HeadlessAnalyzer)
INFO  REPORT: Import succeeded (HeadlessAnalyzer)
```

The project is temporary: it is reset on every run and removed with
`-deleteProject`; no residue accumulates on disk.

### 2) Function list

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>console.log(JSON.stringify(m.rea_ghidra_funcs('tests/corpus/mini_branch.elf'))))"
```

Expected output shape (`DumpFuncs.py` JSON — from a real run):

```json
{"ok":true,"arac":"rea_ghidra_funcs","hedef":"tests/corpus/mini_branch.elf","fonksiyonlar":[{"name":"entry","entry":"00400200","size":30,"callingConvention":"processEntry"}]}
```

`entry` is in Ghidra's address format (`00400200`, no `0x`); `size` is bytes,
`callingConvention` is the analyzer's guess (`processEntry` for the tiny ELF).

### 3) Disassembly (the address may be hex or a symbol name)

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>{const r=m.rea_ghidra_disasm('tests/corpus/mini_branch.elf','0x400200',6);console.log(r.ok?r.kod:JSON.stringify(r));})"
```

Expected output shape (the `kod` field, mnemonic + operand):

```text
00400200 LEA LEA RAX,[0x400300]
00400207 PUSH PUSH RBP
00400208 MOV MOV RBP,RSP
0040020b CMP CMP EDI,0x0
0040020e JZ JZ 0x0040021b
00400210 MOV MOV EAX,0x1
```

The raw form of the same call is the `talimatlar` array:
`[{addr, mnemonic, bytes, length, text}]` (e.g. the first record is
`{"addr":"00400200","mnemonic":"LEA","bytes":"488d05f9000000","length":7,...}`).

### 4) Defined strings

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>console.log(JSON.stringify(m.rea_ghidra_strings('tests/corpus/mini_branch.elf'))))"
```

Expected output shape (first records; `.shstrtab::*` records are section names):

```json
{"ok":true,"arac":"rea_ghidra_strings","hedef":"tests/corpus/mini_branch.elf","strings":[{"address":"00400300","value":"HELLO-FIXTURE"},{"address":"0040030e","value":"mini-branch"},{"address":".shstrtab::00000001","value":".text"}]}
```

### 5) Decompiler (pseudo-C)

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>{const r=m.rea_ghidra_decompile('tests/corpus/mini_branch.elf','0x400200');console.log(r.ok?r.kod:JSON.stringify(r));})"
```

Expected output shape (from a real run; the bridge falls back to disassembly when
decompilation is unavailable):

```c
undefined8 processEntry entry(void)

{
  undefined8 uVar1;
  int in_EDI;

  if (in_EDI == 0) {
    uVar1 = 2;
  }
  else {
    uVar1 = 1;
  }
  return uVar1;
}
```

## Raw headless equivalent (without rea-plus)

There are two real paths the bridge uses, depending on script type:

```powershell
# .java scripts (and scriptless import): analyzeHeadless
& "$env:REA_GHIDRA_DIR\support\analyzeHeadless.bat" <projectDir> rea_tmp `
  -import tests\corpus\mini_branch.elf -overwrite `
  -postScript ReaDump <output.json> -scriptPath <repo>\src\rea-domains\ghidra\scripts `
  -deleteProject

# .py scripts (no Jython in Ghidra 12): pyghidraRun in PyGhidra mode
& "$env:REA_GHIDRA_DIR\support\pyghidraRun.bat" --headless <projectDir> rea_tmp `
  -import tests\corpus\mini_branch.elf -overwrite `
  -postScript DumpFuncs.py <output.json> -scriptPath <repo>\src\rea-domains\ghidra\scripts `
  -deleteProject
```

The real in-repo scripts live under `-scriptPath`: `DumpFuncs.py`,
`DumpDisasm.py`, `DumpDecompile.py`, `DumpXrefs.py`, `DumpStrings.py`,
`ImportTrace.py`. Their expectation is the same: `args[0]` (and `args[1]` when
needed) is the JSON output file; the bridge reads the file and maps it to the MCP
schema.

## Common errors and fixes

| Symptom | Cause | Fix |
|---|---|---|
| `{"ok":false,"code":"capability_unsupported","neden":"REA_GHIDRA_DIR is not defined..."}` | The install path is read only from the environment | Point `REA_GHIDRA_DIR` at the directory where the zip was extracted |
| `support/analyzeHeadless.bat not found` at the same gate | Wrong directory (`tools/` instead of `ghidra_...PUBLIC`) | `REA_GHIDRA_DIR` must be the **install root** (the directory containing `support\`) |
| Headless starts but a `.py` script does not run | Ghidra 12 headless does not include Jython | The bridge runs `.py` scripts automatically with `pyghidraRun --headless`; use the same mode when running manually |
| `Java ... 17+` warning / JVM error | A JRE is installed, not a JDK | Install JDK 21+ (`winget install Microsoft.OpenJDK.21`); put `bin` on `JAVA_HOME` + PATH |
| First call is very slow (1-3 min) | Class search + analyzers run on first start | Later runs drop to ~9-15 s with the `packed-db-cache`; the test/CI cap is 300 s |
| `analyzeHeadless error` + timeout | Automatic analysis is long on a large target | Narrow the target or pass only the `.text` slice; the bridge cap is 300 s |
| `Address could not be resolved: ...` | `DumpDisasm.py` could not resolve the address as hex/symbol/function name | Try `0x400200`, `entry`, or the full function name |
