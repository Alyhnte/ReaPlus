# Oturum: IDA ile hedef analizi + motor karşılaştırması

> **Senaryo:** Aynı hedefi iki motor üzerinden kuyruğa alın (IDA `idat` batch
> + Ghidra headless), fonksiyon listelerini tek şablona çevirip aradaki farkı
> sayıya dökün. Bu oturum rea-plus'ın IDA yüzeyini (`rea_ida_*`) ve dürüst
> kapı davranışını gösterir: **IDA kurulu değilse analiz uydurulmaz**,
> `capability_unsupported` döner.
>
> Örnek hedef: `tests/corpus/mini_branch.elf` (Ghidra tarafında fonksiyon:
> `entry`, `00400200`, boyut 30) ve `tests/corpus/mini_pe_x64.exe`.

## Ön koşullar

| Gereksinim | Not |
|---|---|
| IDA Pro lisansı + konsol binary | `idat64` / `idat` / `ida64` — `idaYolu()` sırayla `REA_IDA_PATH`'i, sonra PATH'teki üç adayı yoklar |
| `$env:REA_IDA_PATH` | Örn. `C:\ida\idat64.exe` — yalnız env'den okunur; kodda gizli varsayılan yol yok |
| `npm run build` | `dist/` yoksa `node -e import(...)` çalışmaz |
| (Opsiyonel) IDA MCP plugin | Aşağıdaki "IDA MCP notu" bölümüne bakın |

```powershell
$env:REA_IDA_PATH = "C:\ida\idat64.exe"   # kendi kurulumunuza göre
node dist/cli/index.js doctor --json        # ida satırı size "durum" raporlar
```

## Adım adım

### 1) IDA kurulu mu? — kapı testi

```powershell
node -e "import('./dist/rea-domains/ida/IdaProvider.js').then(m=>console.log(JSON.stringify(m.rea_ida_idb('tests/corpus/mini_branch.elf','out/mini_branch.i64'))))"
```

**IDA yokken gerçek çıktı** (uydurma sonuç yok; bu metin doğrudan kaynaktan gelir):

```json
{"ok":false,"code":"capability_unsupported","neden":"REA_IDA_PATH yok ve idat PATH'te bulunamadı — fallback: rizin/cutter (rea_cutter_*) ya da Ghidra headless (rea_ghidra_analyze) ile analiz edin"}
```

### 2) IDB batch üretimi (hedef **çalıştırılmaz**)

Kapı açıksa köprü şu argv'yi koşar (kaynak: `src/rea-domains/ida/IdaProvider.ts`,
`rea_ida_idb` — önce bitişik `-o` formu, kabul edilmezse ayrı argüman formu):

```text
idat -A -B -o<out.i64> <hedef>
```

- `-A`: otonom (etkileşim yok), `-B`: batch (idb üretip kapat).
- Zaman aşımı 300 sn; çıktı dosyası üretilmezse kapı kapanır.
- MCP girdileri: `{ "path": "...", "out": "..." }`.

Başarılı koşunun döndüğü biçim:

```json
{"ok":true,"arac":"rea_ida_idb","hedef":"<hedef>","idb":"<out>","idat":"<idat yolu>"}
```

Üretilen `.i64`'ü IDA GUI'de açıp sembolleri/decompile'ü siz alabilirsiniz;
araç batch'in sonunda GUI açmaz.

### 3) FLIRT yerine dürüst string tahmini

`rea_ida_flirt` **gerçek FLIRT imzası uygulamaz** (imza DB'si + IDA gerekmez);
hedef dosyayı okuyup derleyici kalıplarını arar (`MSVC`, `MFC`, `ATL`, `GCC:`,
`clang version`, `__cxa_`, `.eh_frame`, `Borland`, `Delphi`, `FLIRT`, ...).
Güven eşiği 0.5; altında kalan eşleşme `kutuphane:"bilinmiyor"` olur —
sahte kesinlik yok.

```powershell
node -e "import('./dist/rea-domains/ida/IdaProvider.js').then(m=>console.log(JSON.stringify(m.rea_ida_flirt('tests/corpus/mini_pe_x64.exe'))))"
```

Gerçek minik PE çıktısı (derleyici izi yok → güven 0):

```json
{"ok":true,"arac":"rea_ida_flirt","hedef":"tests/corpus/mini_pe_x64.exe","eslesmeler":[],"surumler":[],"sayi":0,"method":"string-heuristic","guven":0,"kutuphane":"bilinmiyor","idaMevcut":false,"not":"IDA bulunamadı (REA_IDA_PATH yok ve idat PATH'te bulunamadı); gerçek FLIRT imzası uygulanmadı, sonuç string-sezgisel tahmindir."}
```

Gerçek FLIRT sonucu istiyorsanız: `rea_ida_idb` çıktısını IDA'da açıp imza
uygulayın (araç bunu iddia etmiyor).

### 4) Motor karşılaştırması (Ghidra ↔ r2 ↔ IDA)

Farkı sayıya dökmek için iki motorun fonksiyon listesi aynı şablona çevrilir
`{name, sig, body}` ve `rea_diff_summary` / `rea_diff_match` JSON string
olarak alır (`{"a": "...", "b": "..."}`).

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

Gerçek çıktı biçimi:

```json
{"ok":true,"tool":"rea_diff_summary","summary":"+1 -1","details":{"added":1,"removed":1}}
{"ok":true,"tool":"rea_diff_match","summary":"1 eşleşme","details":{"matched":[{"from":"entry","to":"entry","score":1}]}}
```

Yorum: isim farkı (`entry` ↔ `entry0`) "eklendi/silindi" gibi görünür ama
`rea_diff_match` aynı gövdeyi eşleştirir — motor isimlendirmesi farklıdır,
fonksiyon aynıdır. IDA tarafını da aynı şablona çevirip üçüncü dizgi olarak
`a`/`b` yerine kullanabilirsiniz.

### 5) Daha büyük hedefde sıra

1. `rea_ida_idb` (üretim uzun sürebilir; 300 sn tavanı) veya
2. Ghidra ile hızlı tur (`rea_ghidra_analyze` + `rea_ghidra_funcs`), sonra
3. Sadece çakışan/şüpheli fonksiyonlar IDA'da derinleştirilir (GUI + imza).

Bu sıralama, ticari kapının gate-only olduğu repo kararına uygundur:
`docs/ARASTIRMA-TICARI-ENTEGRASYONLAR.md`.

## IDA MCP notu (dürüst sınır)

- `doctor`/katalog seviyesinde IDA için önerilen env adı `REA_IDA_URL`'dir
  (kaynak: `src/facade/configSuggest.ts`).
- **rea-plus bu URL'den veri çekmez.** rea-plus'ın kayıtlı IDA araçları
  `rea_ida_idb` ve `rea_ida_flirt`'tür; `REA_IDA_URL`, sizin ayrıca kurduğunuz
  IDA MCP plugin'ine (IDA içinde ayrı sunucu) işaret eder. O plugin'in araç
  adları sürümüne bağlıdır; bu doküman o adları uydurmaz.
- Karşılaştırmayı bu oturumdaki rea-plus araçları üzerinden bitirin; IDA MCP'yi
  yalnızca IDA tarafında ek sorgu yüzeyi olarak düşünün.

## Olası hatalar ve çözümü

| Belirti | Neden | Çözüm |
|---|---|---|
| `capability_unsupported` + `REA_IDA_PATH yok ve idat PATH'te bulunamadı` | IDA kurulu değil ya da PATH'te değil | `REA_IDA_PATH` = idat tam yolu; ya da Ghidra/rizin fallback'ine geçin (araç fallback'i zaten yazar) |
| `capability_unsupported` + `hedef yok: ...` | `path` yanlış veya dosya yok | Korpus yolunu `tests/corpus/...` formunda verin |
| `capability_unsupported` + `cikti yolu boş` | `out` parametresi boş | `.i64`/`.idb` uzantılı çıktı yolu verin |
| `idat batch hatası: ...` | Lisans/eklenti/konsol eksik ya da batch çöktü | Aynı hedefi elle `idat -A -B -o... <hedef>` ile deneyin; IDA konsol kurulumunu doğrulayın |
| `idb üretilemedi: <yol>` | idat çıktı yazmadı | Yazma izinleri + diskin dolu olmaması; betikli `-S` varyantına geçin |
| Kapı açık ama `.i64` IDA'da açılmıyor | Sürüm uyumsuzluğu | idb'yi üreten IDA sürümüyle açın (batch, o sürümün IDA'sını kullanır) |
