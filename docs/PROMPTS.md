# ReaPlus Prompt Kütüphanesi (10 hazır prompt + 4 görev şablonu)

Ajanın rea-plus'a soracağı 10 hazır soru kalıbı + 4 MCP görev şablonu akışı.
Her prompt: **Amaç** +
**Örnek çağrı** (gerçek MCP/`rea-plus-cli` formu, alan adları üretilmiş
referans [`TOOLS.md`](TOOLS.md) ile aynı) + **Beklenen çıktı** türü.
Yüzey: **187 araç**, **183 outputSchema**, **187 annotations**, 2 resource, 7 prompt.

> Not: `confirm:true` isteyen canlı-debug çağrıları listede yok; buradaki
> 14 promptun tamamı salt-okunur/statik akışlardır.

## 1) Triage — "bu dosya nedir, nereden başlarım?"

**Amaç:** Bilinmeyen bir dosyayı tek çağrıda sınıfla ve sonraki adım planını al.

**Örnek çağrı:**

```json
{ "name": "rea_investigate", "arguments": { "path": "sample.exe" } }
```

**Beklenen çıktı:** `ok/plan/skor/tip/motor/yedekler` alanlı nesne (`outputSchema`
alanları: `arac, motor, ok, plan, skor, tip, yedekler`); tip (pe/elf/apk/…),
güven skoru ve önerilen motor + yedek plan listesi.

## 2) Manifest — "bu APK'nın paketi, izinleri, aktiviteleri?"

**Amaç:** APK'nın `AndroidManifest.xml` kimliğini jadx ile çöz.

**Örnek çağrı:**

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

**Beklenen çıktı:** `ok/paket/izinler/aktiviteler` alanlı nesne; jadx yoksa
uydurma manifest yerine `capability_unsupported` + kurulum ipucu.

## 3) Davranış — "olayları zaman çizgisine diz"

**Amaç:** API/syscall/net/dosya/process olaylarından kaynak-öncelikli özet üret
(yürütme yok, saf fonksiyon).

**Örnek çağrı:**

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

**Beklenen çıktı:** Metin özet (`4 olay api@2 -> process@4 top_api=CreateFileW`
biçimi) + `sıralı/sayılar/top_api/ilk/son` detayları; boş listede
`capability_unsupported`.

## 4) Repo — "bu dizinde ne tür dosyalar var?"

**Amaç:** Bir dizindeki PE/ELF/APK/JS/WASM dosyalarını sihir baytla tespit edip
dosya başına sonraki-araç planı al.

**Örnek çağrı:**

```json
{ "name": "rea_scan_repo", "arguments": { "path": "<hedef-dizin>" } }
```

**Beklenen çıktı:** `summary` metni (`5 dosya, 5 tip …` biçimi) +
`details.tipler` sayımı + `details.planlar` (dosya → önerilen motor);
hedefsiz dizinde boş liste (`ok:true`).

## 5) PDB — "debug kaydından sembole git"

**Amaç:** PE'nin CodeView RSDS kaydından PDB kimliğini çöz, Microsoft symbol
server düzeninde indir (bütünlüklü + önbellekli).

**Örnek çağrı:**

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-bilgili.exe>'))))"
```

**Beklenen çıktı:** Adım 1'de `pdb/guid/yas` (`rea_pdb_yolu` alanları:
`arac, dosya, guid, ok, pdb, yas`); adım 2'de `Ad/GUID-tiresiz+YAŞ/Ad`
düzenli URL, `yol/cache` bilgisi (`rea_pdb_indir` alanları:
`arac, cache, dosya, guid, ok, pdb, url, yas, yol`); bozuk içerikte
`butunluk_hatasi`, ikinci çağrıda `cache:true`.

## 6) Diff — "iki sürüm arasında fonksiyon farkı ne?"

**Amaç:** İki ikili sürümün fonksiyon listelerini karşılaştırıp
eklenen/çıkarılan/değişen/aynen kalan kümeleri al (N-day incelemesi girişi).

**Örnek çağrı:**

```json
{ "name": "rea_bindiff_karsilastir", "arguments": { "text": "<rea_bindiff_fonksiyonlar çıktısı>" } }
```

**Beklenen çıktı:** `aynen/cikarilan/degisen/eklenen/eski/yeni/istatistik/ozet`
alanlı nesne; girdi `rea_bindiff_fonksiyonlar` (`path` zorunlu) çıktısıdır.

## 7) Pcap — "bu yakalamada hangi akışlar var, TLS çözülür mü?"

**Amaç:** PCAP dosyasındaki akışları birleştir; keylog varsa TLS içeriğini çöz.

**Örnek çağrı:**

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap" } }
```

Keylog ile:

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap", "keylog": "sslkeylog.txt" } }
```

**Beklenen çıktı:** `details/summary` içinde birleştirilmiş akış listesi
(`outputSchema` var); `keylog` opsiyoneldir, verilmezse şifreli içerik
çözülmeden meta-akışlar döner.

## 8) Reçete — "bu APK için dinamik analiz planı üret ve doğrula"

**Amaç:** APK yolundan kuru-doğrulamalı dinamik analiz reçetesi üret
(çalıştırma yok, plan + doğrulama).

**Örnek çağrı:**

```json
{ "name": "rea_android_dinamik_recete", "arguments": { "path": "ornek.apk" } }
```

Ardından reçete metniyle:

```json
{ "name": "rea_android_recete_dogrula", "arguments": { "text": "<recete-metni>" } }
```

**Beklenen çıktı:** İlki `recete` alanlı nesne; ikincisi `adim_sayisi/ok`
alanlı doğrulama sonucu.

## 9) Fuzz — "ayrıştırıcılar bozuk girdide çökmüyor mu?"

**Amaç:** PE/ELF/WASM/metadata ayrıştırıcılarına korpus tohumlarıyla bozuk
girdi verip çökme/istisna taraması yap (yazma yalnız tmpdir'e).

**Örnek çağrı:**

```bash
node scripts/fuzz-parsers.mjs
```

**Beklenen çıktı:** Konsol özeti (tohum sayısı, çöken girdi listesi; temiz
koşuda sıfır çökme) + `tests/parser-fuzz.test.mjs` yeşili; korpus
(`tests/corpus/`) salt okunur kalır.

## 10) Perf — "liste/açılış bütçeleri tutuyor mu?"

**Amaç:** `tools/list` yanıt süresi + sunucu açılış süresi bütçelerini ölç,
regresyonu testle yakala.

**Örnek çağrı:**

```bash
node tests/perf-budget.test.mjs
```

**Beklenen çıktı:** node:test çıktısı (bütçe eşikleri `tests/perf-budget.test.mjs`
içinde tanımlı); eşik aşımı testi kırmızıya düşürür, süreler konsolda
milisaniye olarak raporlanır.

## Görev şablonu prompt'ları (MCP kayıtlı, 4 akış)

Aşağıdaki 4 prompt `prompts/list` üzerinden kayıtlıdır: her biri yalnızca
**sıralı akış metni** döndürür (`promptSonuc`), araç çağırmaz. `path` (veya
`eski`/`yeni`) zorunlu, `focus` opsiyoneldir. Kullanılan araç adları
[`TOOLS.md`](TOOLS.md) ile doğrulanmıştır. Tüm akışlar VM/CI'da `confirm:true`
isteyen canlı-debug adımlarını atlar ve örneği asla çalıştırmaz.

### 11) PE/crash triage - "çöken PE'yi statikten davranışa nasıl inceleyeyim?"

**Amaç:** PE hedefte triage → statik → crash kanıtı → davranış sırasıyla
ilerlet; crash kaydı yoksa davranışı uydurmadan eksikliği yaz.

**Örnek çağrı:**

```json
{ "name": "pe-crash-triage", "arguments": { "path": "ornek.exe", "focus": "yuksek entropi" } }
```

**Beklenen çıktı:** metin akışı: `rea_investigate` → `rea_pe_info` /
`rea_pe_sections` / `rea_pe_imports` → `rea_crash_kayit_parse` /
`rea_crash_ozet` / `rea_crash_timeline` / `rea_crash_hint` →
`rea_behavior_full` / `rea_behavior_timeline` → `rea_pdb_yolu` (varsa);
sonuçta triage öğesi, statik bulgular, crash kanıtının derecesi ve
davranış özeti + her bulgu için güven düzeyi.

### 12) ELF/Linux triage - "ELF hedefi sembol/ekipman açısından nasıl taranır?"

**Amaç:** ELF/Linux hedefte segment/kesit düzeni, DWARF sembolleri, Go
derleme bilgisi ve gadget adaylarını sırayla topla.

**Örnek çağrı:**

```json
{ "name": "elf-linux-triage", "arguments": { "path": "hedef.elf" } }
```

**Beklenen çıktı:** metin akışı: `rea_investigate` → `rea_pwn_elf_layout` →
`rea_dwarf_ozet` → `rea_go_buildinfo` / `rea_go_funclines` (Go ise) →
`rea_cutter_funcs` / `rea_cutter_strings` (veya Ghidra: `rea_ghidra_analyze` →
`rea_ghidra_funcs` / `rea_ghidra_strings`) → `rea_pwn_gadgets`; sonuçta ELF
tipi + mitigation (NX/PIE/RELRO/canary) durumu, sembol/gadget kanıtları ve
güven düzeyi.

### 13) Binary diff - "iki sürüm arasında ne değişmiş, yamanın etkisi ne?"

**Amaç:** İki sürüm arası fonksiyon diff'ini çıkar, değişen fonksiyonları
decompile ederek yamanın etki alanını belirle.

**Örnek çağrı:**

```json
{ "name": "binary-diff", "arguments": { "eski": "v1.exe", "yeni": "v2.exe", "focus": "acik yamasi" } }
```

**Beklenen çıktı:** metin akışı: `rea_investigate` (iki sürüm) →
`rea_bindiff_fonksiyonlar` (eski+yeni) → `rea_bindiff_karsilastir` (girdi
JSON: `{"eski": "<eski>", "yeni": "<yeni>"}`) → `rea_ghidra_vt` (Ghidra varsa) →
`rea_ghidra_decompile` (değişen fonksiyon adresleri); sonuçta eklenen /
çıkarılan / değişen fonksiyonlar + her biri için kanıt (hash/imza/adres) ve
yamanın etki alanı.

### 14) Evidence report - "topladığım kanıtları rapora nasıl dönüştürürüm?"

**Amaç:** Kanıt paketini digest'leyip doğrula, obligation defteriyle her
bulgunun kanıt zincirini kapat, hazırlık skoru + kapsam oranını raporla.

**Örnek çağrı:**

```json
{ "name": "evidence-report", "arguments": { "path": "ornek.bin", "focus": "rapor kapsami" } }
```

**Beklenen çıktı:** metin akışı: `rea_investigate` → `rea_evidence_bundle` →
`rea_evidence_verify` → `rea_obligation_ledger` / `rea_obligation_advance` /
`rea_obligation_verify` / `rea_obligation_close` → `rea_readiness` /
`rea_coverage` → `rea_missing_reason` (eksik araç); sonuçta yönetici özeti,
bulgu listesi (bulgu + kanıt + güven), kanıt digest'i, obligation zincir
durumu, hazırlık skoru ve kapsam oranı.
