# Oturum: radare2 ile hızlı triage

> **Senaryo:** Yeni gelen bir dosyayı (ör. `tests/corpus/mini_branch.elf`)
> 60 saniyede sınıflandırın: nedir, kaç fonksiyon var, girişte ne yapıyor,
> hangi stringler dikkat çekiyor. Sonra rea-plus'ın r2 köprüsüyle
> (`rea_r2_callgraph` / `rea_r2_esil`) aynı hedefi programatik okuyun.
> Hedef **çalıştırılmaz**.

## Ön koşullar

| Gereksinim | Not |
|---|---|
| radare2 6.x | Windows'ta `radare2.exe`/`r2.exe` PATH'te; `.bat` sarmalayıcılar köprü tarafından spawn edilemediği için tam yolu `REA_R2_BIN` ile verin |
| `npm run build` | Köprü `dist/rea-domains/r2plus/R2Plus.js` dosyasından okunur |
| Dosya erişimi | `existsSync` kapısı vardır; yol yoksa `capability_unsupported` |

Köprü binary aday sırası (kaynak: `R2Plus.ts`): önce `REA_R2_BIN`, sonra
`radare2`, sonra `r2`. Üst sınırlar: analiz (`aaa`) 60 sn, çıktı 16 MB.

## Adım adım (elle, kabuktan)

### 0) Renk ve relocs uyarısı

r2 kabuğunda ANSI renkli çıktı gelir (doküman/CI için: `-e scr.color=0`).
Import sonrası şu uyarı **normaldir**, analizi bozmaz:

```text
WARN: Relocs has not been applied. Please use `-e bin.relocs.apply=true` or `-e bin.cache=true` next time
```

### 1) Bilgi kartı — bu dosya nedir?

```bash
r2 -e scr.color=0 -A -q -c 'iI' tests/corpus/mini_branch.elf
```

Gerçek çıktıdan seçilmiş satırlar:

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

Okuma: ELF64, x86-64, statik ve stripped (fonksiyon adları silinmiş) —
semantik adlar yoksa giriş adresiyle (sonraki adım) başlayın.

### 2) Stringler

```bash
r2 -e scr.color=0 -A -q -c 'iz' tests/corpus/mini_branch.elf
```

Gerçek çıktı:

```text
nth paddr      vaddr      len size section type  string
-------------------------------------------------------
0   0x00000300 0x00400300 13  14   .rodata ascii HELLO-FIXTURE
1   0x0000030e 0x0040030e 11  12   .rodata ascii mini-branch
```

### 3) Fonksiyon listesi

```bash
r2 -e scr.color=0 -A -q -c 'afl' tests/corpus/mini_branch.elf
```

Gerçek çıktı (tek fonksiyon: `entry0`, ad 4, boyut 30 bayt):

```text
0x00400200    4     30 entry0
```

### 4) Giriş fonksiyonunun disassembly'i

```bash
r2 -e scr.color=0 -A -q -c 'pdf @ entry0' tests/corpus/mini_branch.elf
```

Gerçek çıktı (kırpmadan önemli satırlar):

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

Okuma: `edi` (arg1) 0'a eşitse 2 döner, değilse 1 — küçük bir karar dalı
(`HELLO-FIXTURE` stringine işaret eden `lea`). Ghidra decompile'ı aynı mantığı
`docs/ornek-oturumlar/ghidra-analiz.md` bölüm 5'te gösterir.

## Adım adım (rea-plus köprüsü)

### 5) Çağrı grafiği

```powershell
node -e "import('./dist/rea-domains/r2plus/R2Plus.js').then(m=>console.log(JSON.stringify(m.rea_r2_callgraph('tests/corpus/mini_branch.elf'))))"
```

Gerçek çıktı (`aaa` + `agfj` üzerinden; `addr` ondalık, `cagrilar` çağrı hedefleri):

```json
{"ok":true,"arac":"rea_r2_callgraph","hedef":"tests/corpus/mini_branch.elf","fonksiyonlar":[{"ad":"entry0","addr":4194816,"cagrilar":[]}]}
```

`4194816` = `0x400200` (ondalık). MCP girdisi: `{ "path": "..." }`.

### 6) ESIL emülasyonu (statik, hedef çalışmaz)

```powershell
node -e "import('./dist/rea-domains/r2plus/R2Plus.js').then(m=>console.log(JSON.stringify(m.rea_r2_esil('tests/corpus/mini_branch.elf','0x400200',6))))"
```

Gerçek çıktı (6 adım sonrası registerler):

```json
{"ok":true,"arac":"rea_r2_esil","hedef":"tests/corpus/mini_branch.elf","addr":"0x400200","adim":6,"regs":{"rax":1,"rbx":0,"rcx":0,"rdx":0,"rsi":0,"rdi":0,"r8":0,"r9":0,"r10":0,"r11":0,"r12":0,"r13":0,"r14":0,"r15":0,"rip":4194837,"rbp":18446744073709552000,"rflags":68,"rsp":0}}
```

`rip` `4194837` (`0x400205`) — ilk 6 adımda `lea`/`push` yığını hazırlıyor;
`rsp:0` ESIL'in yığın modelinin gerçek bir süreçten farkına dikkat edin.
MCP katmanı adımsız çağrılır (`{"path","addr"}`); adım varsayılanı 6'dır.

### 7) Toplu debug (sınırlı, dürüst not)

`rea_r2_debug` `db+dc+dr+dk` zincirini koşar. Windows'ta gerçek çıktı + not
döner (unsupported değil):

```text
Windows'ta r2 -d sınırlı olabilir (ELF Win32 değil); çıktı gerçek r2 çıktısıdır
```

Canlı debugger gerekiyorsa `dbg-bridge` (x64dbg/cdb) tarafına geçin; r2 burada
yalnız statik + hafif ESIL yüzeyidir.

## Adres formatı ve kapılar

Adres girdisi şu kalıpla sınırlıdır (`ADRES_RE`): `0x...` hex, ondalık sayı ya
da sembol/fonksiyon adı (`entry0`, `str.HELLO_FIXTURE`). Uymayan girdi
`{"ok":false,"code":"capability_unsupported","neden":"geçersiz adres: ..."}` döner
— kabuktan gelen `;`/`!` gibi karakterler kapıdan geçmez.

## Olası hatalar ve çözümü

| Belirti | Neden | Çözüm |
|---|---|---|
| `{"ok":false,...,"neden":"radare2 PATH'te yok"}` | radare2 kurulu değil | [radare2 releases](https://github.com/radareorg/radare2/releases) indirip PATH'e koyun ya da `REA_R2_BIN` = tam yol |
| Aynı kapıda `.bat` yolu verildiyse ENOENT | Windows `.bat` doğrudan spawn edilemez | `REA_R2_BIN`'i `radare2.exe`'ye çevirin, `.bat` değil |
| `neden: hedef yok: ...` | Dosya yok | Korpus yolunu kontrol edin (`tests/corpus/...`) |
| `neden: geçersiz adres: ...` | `ADRES_RE` uymuyor | `0x400200` / `4194816` / `entry0` formu kullanın |
| `aaa` çok uzun sürüyor | Büyük + obfuscate hedef | 60 sn köprü sınırı dolarsa `capability_unsupported` + süre döner; hedefi küçültün ya da elle `r2 -A` ile devam edin |
| Renkli/bozuk çıktı kaydediliyor | r2 ANSI | `-e scr.color=0` |
| Relocs uyarısı | Import sonrası normal | `-e bin.relocs.apply=true` ya da `-e bin.cache=true` |
