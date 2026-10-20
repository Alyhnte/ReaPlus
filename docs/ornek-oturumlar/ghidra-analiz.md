# Oturum: Ghidra headless ile binary analiz akışı

> **Senaryo:** Elinizde analiz edilecek bir ELF/PE var (örnek: repo korpusundaki
> `tests/corpus/mini_branch.elf` — entry `0x400200`, tek fonksiyon `entry`,
> boyut 30 bayt). Amaç: hedefi **çalıştırmadan** import + otomatik analiz +
> fonksiyon/string/disasm/decompile dökümü almak. Bu oturum rea-plus'ın
> Ghidra köprüsünü (`rea_ghidra_*`) ve arkasındaki gerçek `analyzeHeadless`
> akışını gösterir.

## Ön koşullar

| Gereksinim | Nasıl doğrulanır |
|---|---|
| Ghidra 12.x (zip kurulumu; winget paketi yok) | `$env:REA_GHIDRA_DIR` tanımlı, dizin mevcut |
| `support\analyzeHeadless.bat` | `Test-Path "$env:REA_GHIDRA_DIR\support\analyzeHeadless.bat"` |
| `support\pyghidraRun.bat` (Ghidra 12 headless Jython içermez; `.py` betikler PyGhidra kipinde koşar) | `Test-Path "$env:REA_GHIDRA_DIR\support\pyghidraRun.bat"` |
| JDK 21+ (`java -version` 17+ sağlamalı; JRE yetmez) | `java -version` |
| rea-plus derlenmiş | `npm run build` (repo kökünde) |

Kurulum sabiti (yalnız ortam değişkeni, kodda gizli varsayılan yol yok):

```powershell
$env:REA_GHIDRA_DIR = "C:\tools\ghidra\ghidra_12.1.4_PUBLIC"
Test-Path "$env:REA_GHIDRA_DIR\support\analyzeHeadless.bat"   # True olmalı
Test-Path "$env:REA_GHIDRA_DIR\support\pyghidraRun.bat"       # True olmalı
node dist/cli/index.js doctor --json                           # java satırı "var" olmalı
```

`doctor` eksik bir parçayı dürüstçe raporlar: Java yoksa `"durum":"yok"` +
katalog linki döner; hiçbir yerde sahte "kurulu" gösterilmez.

## Adım adım (repo kökünden)

### 1) Import + otomatik analiz (betiksiz)

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>{const r=m.rea_ghidra_analyze('tests/corpus/mini_branch.elf');console.log(r.ok, r.ok?String(r.log).split('\n').slice(-6).join('\n'):r.neden);})"
```

Bu çağrı şu gerçek argv ile `analyzeHeadless.bat` koşar (köprü kaynağı:
`src/rea-domains/ghidra/GhidraBridge.ts`, `rea_ghidra_analyze`):

```text
analyzeHeadless.bat <gecici-proje-dizini> rea_tmp -import <hedef> -overwrite -deleteProject
```

Beklenen çıktı biçimi (log **kuyruğu**; ilk analiz 1-3 dk sürebilir):

```text
true
-----------------------------------------------------
     Total Time   1 secs
-----------------------------------------------------
INFO  REPORT: Analysis succeeded for file: file:///.../mini_branch.elf (HeadlessAnalyzer)
INFO  REPORT: Save succeeded for: /mini_branch.elf (rea_tmp:/mini_branch.elf) (HeadlessAnalyzer)
INFO  REPORT: Import succeeded (HeadlessAnalyzer)
```

Proje geçicidir: her koşuda sıfırlanır ve `-deleteProject` ile silinir; diskte
kalıntı birikmez.

### 2) Fonksiyon listesi

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>console.log(JSON.stringify(m.rea_ghidra_funcs('tests/corpus/mini_branch.elf'))))"
```

Beklenen çıktı biçimi (`DumpFuncs.py` JSON'u — gerçek koşudan):

```json
{"ok":true,"arac":"rea_ghidra_funcs","hedef":"tests/corpus/mini_branch.elf","fonksiyonlar":[{"name":"entry","entry":"00400200","size":30,"callingConvention":"processEntry"}]}
```

`entry` Ghidra adres biçimidir (`00400200`, `0x` yok); `size` bayt sayısı,
`callingConvention` analizörün tahminidir (minik ELF'te `processEntry`).

### 3) Disassembly (adres hex ya da sembol adı olabilir)

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>{const r=m.rea_ghidra_disasm('tests/corpus/mini_branch.elf','0x400200',6);console.log(r.ok?r.kod:JSON.stringify(r));})"
```

Beklenen çıktı biçimi (`kod` alanı, mnemonic + operand):

```text
00400200 LEA LEA RAX,[0x400300]
00400207 PUSH PUSH RBP
00400208 MOV MOV RBP,RSP
0040020b CMP CMP EDI,0x0
0040020e JZ JZ 0x0040021b
00400210 MOV MOV EAX,0x1
```

Aynı çağrının ham formu `talimatlar` dizisidir:
`[{addr, mnemonic, bytes, length, text}]` (ör. ilk kayıt
`{"addr":"00400200","mnemonic":"LEA","bytes":"488d05f9000000","length":7,...}`).

### 4) Tanımlı stringler

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>console.log(JSON.stringify(m.rea_ghidra_strings('tests/corpus/mini_branch.elf'))))"
```

Beklenen çıktı biçimi (ilk kayıtlar; `.shstrtab::*` kayıtları bölüm adlarıdır):

```json
{"ok":true,"arac":"rea_ghidra_strings","hedef":"tests/corpus/mini_branch.elf","strings":[{"address":"00400300","value":"HELLO-FIXTURE"},{"address":"0040030e","value":"mini-branch"},{"address":".shstrtab::00000001","value":".text"}]}
```

### 5) Decompiler (pseudo-C)

```powershell
node -e "import('./dist/rea-domains/ghidra/GhidraBridge.js').then(m=>{const r=m.rea_ghidra_decompile('tests/corpus/mini_branch.elf','0x400200');console.log(r.ok?r.kod:JSON.stringify(r));})"
```

Beklenen çıktı biçimi (gerçek koşudan; decompile yoksa köprü disasm'a düşer):

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

## rea-plus'sız (ham headless) eşdeğer

Köprünün koştuğu iki gerçek hat vardır — betik tipine göre:

```powershell
# .java betikler (ve betiksiz import): analyzeHeadless
& "$env:REA_GHIDRA_DIR\support\analyzeHeadless.bat" <projeDizini> rea_tmp `
  -import tests\corpus\mini_branch.elf -overwrite `
  -postScript ReaDump <cikti.json> -scriptPath <repo>\src\rea-domains\ghidra\scripts `
  -deleteProject

# .py betikler (Ghidra 12'de Jython yok): PyGhidra kipinde pyghidraRun
& "$env:REA_GHIDRA_DIR\support\pyghidraRun.bat" --headless <projeDizini> rea_tmp `
  -import tests\corpus\mini_branch.elf -overwrite `
  -postScript DumpFuncs.py <cikti.json> -scriptPath <repo>\src\rea-domains\ghidra\scripts `
  -deleteProject
```

`-scriptPath` altında repo-içi gerçek betikler durur: `DumpFuncs.py`,
`DumpDisasm.py`, `DumpDecompile.py`, `DumpXrefs.py`, `DumpStrings.py`,
`ImportTrace.py`. Betiklerin beklentisi aynıdır: `args[0]` (gerekirse `args[1]`)
= JSON çıktı dosyası; köprü dosyayı okuyup MCP şemasına çevirir.

## Olası hatalar ve çözümü

| Belirti | Neden | Çözüm |
|---|---|---|
| `{"ok":false,"code":"capability_unsupported","neden":"REA_GHIDRA_DIR tanımlı değil..."}` | Kurulum yolu yalnız env'den okunur | `REA_GHIDRA_DIR`'yi zip açılana dizine çevirin |
| Aynı kapıda `support/analyzeHeadless.bat yok` | Yanlış dizin (tools/ değil ghidra_...PUBLIC) | `REA_GHIDRA_DIR` **kurulum kökü** olmalı (`support\` alt klasörü içeren) |
| Headless başlıyor ama `.py` betik çalışmıyor | Ghidra 12 headless Jython içermez | `.py` betikler köprü tarafından otomatik `pyghidraRun --headless` ile koşar; elle koşarken aynı kipi kullanın |
| `Java ... 17+` uyarısı / JVM hata | JRE kurulu, JDK değil | JDK 21+ kurun (`winget install Microsoft.OpenJDK.21`); `JAVA_HOME` + PATH'te `bin` |
| İlk çağrı çok yavaş (1-3 dk) | Sınıf arama + analizörler ilk açılışta koşar | Sonraki koşular `packed-db-cache` ile ~9-15 sn'ye iner; test/CI tavanı 300 sn |
| `analyzeHeadless hatası` + zaman aşımı | Büyük hedefde otomatik analiz uzuyor | Hedefi daraltın ya da yalnız `.text` dilimini verin; köprüde üst sınır 300 sn |
| `Adres cozulemedi: ...` | `DumpDisasm.py` adresi hex/sembol/fonksiyon adıyla çözemedi | `0x400200`, `entry` ya da tam fonksiyon adı deneyin |
