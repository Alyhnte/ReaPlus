# Session: Fast triage with radare2

> **Scenario:** Classify a newly received file (e.g. `tests/corpus/mini_branch.elf`)
> in 60 seconds: what is it, how many functions does it have, what does it do at
> entry, and which strings stand out. Then read the same target programmatically
> through rea-plus's r2 bridge (`rea_r2_callgraph` / `rea_r2_esil`). The target
> is **not executed**.

## Prerequisites

| Requirement | Note |
|---|---|
| radare2 6.x | On Windows, `radare2.exe`/`r2.exe` must be on PATH; because `.bat` wrappers cannot be spawned by the bridge, pass the full path via `REA_R2_BIN` |
| `npm run build` | The bridge is loaded from `dist/rea-domains/r2plus/R2Plus.js` |
| File access | There is an `existsSync` gate; a missing path returns `capability_unsupported` |

Bridge binary candidate order (source: `R2Plus.ts`): `REA_R2_BIN` first, then
`radare2`, then `r2`. Caps: analysis (`aaa`) 60 s, output 16 MB.

## Step by step (manual, from the shell)

### 0) Color and relocs warning

The r2 shell emits ANSI-colored output (for docs/CI use: `-e scr.color=0`).
The following warning after import is **normal** and does not break analysis:

```text
WARN: Relocs has not been applied. Please use `-e bin.relocs.apply=true` or `-e bin.cache=true` next time
```

### 1) Info card — what is this file?

```bash
r2 -e scr.color=0 -A -q -c 'iI' tests/corpus/mini_branch.elf
```

Selected lines from real output:

```text
arch     x86
baddr    0x400000
binsz    1049
bintype  elf
bits     64
canary   false
class    ELF64
crypto   false
endian   little
lang     c
machine  AMD x86-64 architecture
nx       false
os       linux
pic      false
static   true
stripped true
```

Reading: ELF64, x86-64, static and stripped (function names removed) — when there
are no semantic names, start from the entry address (next step).

### 2) Strings

```bash
r2 -e scr.color=0 -A -q -c 'iz' tests/corpus/mini_branch.elf
```

Real output:

```text
nth paddr      vaddr      len size section type  string
-------------------------------------------------------
0   0x00000300 0x00400300 13  14   .rodata ascii HELLO-FIXTURE
1   0x0000030e 0x0040030e 11  12   .rodata ascii mini-branch
```

### 3) Function list

```bash
r2 -e scr.color=0 -A -q -c 'afl' tests/corpus/mini_branch.elf
```

Real output (single function: `entry0`, name length 4, size 30 bytes):

```text
0x00400200    4     30 entry0
```

### 4) Disassembly of the entry function

```bash
r2 -e scr.color=0 -A -q -c 'pdf @ entry0' tests/corpus/mini_branch.elf
```

Real output (key lines, not trimmed):

```text
/ 30: entry0 (uint32_t arg1);
| `- args(rdi)
|           0x00400200      488d05f900..   lea rax, str.HELLO_FIXTURE  ; segment.LOAD1
|                                                                      ; 0x400300 ; "HELLO-FIXTURE"
|           0x00400207      55             push rbp
|           0x00400208      4889e5         mov rbp, rsp
|           0x0040020b      83ff00         cmp edi, 0                  ; arg1
|       ,=< 0x0040020e      740b           je 0x40021b
|       |   0x00400210      b801000000     mov eax, 1
|      ,==< 0x00400215      eb09           jmp 0x400220
|      ||   ; CODE XREF from entry0 @ 0x40020e(x)
|      |`-> 0x0040021b      b802000000     mov eax, 2
|      `--> 0x00400220      5d             pop rbp
\           0x00400221      c3             ret
```

Reading: if `edi` (arg1) equals 0 it returns 2, otherwise 1 — a small decision
branch (`lea` pointing at the `HELLO-FIXTURE` string). The Ghidra decompilation
shows the same logic in `docs/example-sessions/ghidra-analysis.md` section 5.

## Step by step (rea-plus bridge)

### 5) Call graph

```powershell
node -e "import('./dist/rea-domains/r2plus/R2Plus.js').then(m=>console.log(JSON.stringify(m.rea_r2_callgraph('tests/corpus/mini_branch.elf'))))"
```

Real output (via `aaa` + `agfj`; `addr` is decimal, `cagrilar` holds call targets):

```json
{"ok":true,"arac":"rea_r2_callgraph","hedef":"tests/corpus/mini_branch.elf","fonksiyonlar":[{"ad":"entry0","addr":4194816,"cagrilar":[]}]}
```

`4194816` = `0x400200` (decimal). MCP input: `{ "path": "..." }`.

### 6) ESIL emulation (static, target does not run)

```powershell
node -e "import('./dist/rea-domains/r2plus/R2Plus.js').then(m=>console.log(JSON.stringify(m.rea_r2_esil('tests/corpus/mini_branch.elf','0x400200',6))))"
```

Real output (registers after 6 steps):

```json
{"ok":true,"arac":"rea_r2_esil","hedef":"tests/corpus/mini_branch.elf","addr":"0x400200","adim":6,"regs":{"rax":1,"rbx":0,"rcx":0,"rdx":0,"rsi":0,"rdi":0,"r8":0,"r9":0,"r10":0,"r11":0,"r12":0,"r13":0,"r14":0,"r15":0,"rip":4194837,"rbp":18446744073709552000,"rflags":68,"rsp":0}}
```

`rip` is `4194837` (`0x400205`) — during the first 6 steps `lea`/`push` prepare
the stack; note that `rsp:0` reflects ESIL's stack model, not a real process.
The MCP layer is called without a step count (`{"path","addr"}`); the default
step count is 6.

### 7) Batch debug (limited, honest note)

`rea_r2_debug` runs the `db+dc+dr+dk` chain. On Windows it returns real output +
a note (not unsupported):

```text
r2 -d on Windows can be limited (the ELF is not Win32); the output is real r2 output
```

If you need a live debugger, switch to the `dbg-bridge` (x64dbg/cdb) side; r2 is
only the static + lightweight ESIL surface here.

## Address format and gates

The address input is restricted by this pattern (`ADRES_RE`): `0x...` hex, a
decimal number, or a symbol/function name (`entry0`, `str.HELLO_FIXTURE`). Input
that does not match returns
`{"ok":false,"code":"capability_unsupported","neden":"geçersiz adres: ..."}`
— shell characters such as `;`/`!` do not pass the gate.

## Common errors and fixes

| Symptom | Cause | Fix |
|---|---|---|
| `{"ok":false,...,"neden":"radare2 not on PATH"}` | radare2 is not installed | Download from [radare2 releases](https://github.com/radareorg/radare2/releases) and add it to PATH, or set `REA_R2_BIN` to the full path |
| ENOENT when a `.bat` path is passed to the same gate | Windows cannot spawn `.bat` directly | Point `REA_R2_BIN` at `radare2.exe`, not the `.bat` |
| `reason: target missing: ...` | The file does not exist | Check the corpus path (`tests/corpus/...`) |
| `reason: invalid address: ...` | Does not match `ADRES_RE` | Use the `0x400200` / `4194816` / `entry0` form |
| `aaa` takes too long | Large + obfuscated target | When the 60 s bridge cap is hit it returns `capability_unsupported` + duration; narrow the target or continue manually with `r2 -A` |
| Colored/corrupt output is saved | r2 ANSI | `-e scr.color=0` |
| Relocs warning | Normal after import | `-e bin.relocs.apply=true` or `-e bin.cache=true` |
