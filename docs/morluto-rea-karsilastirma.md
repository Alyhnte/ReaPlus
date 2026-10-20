# morluto/rea ↔ ReaPlus karşılaştırması

Tarih: 2026-10-19 · ReaPlus `v0.12.0` (`9fd2057`) ↔ upstream `rea-agents-6.7.0` (son release).
Kaynak: canlı `gh` API (release'ler, merge PR'lar, commit'ler) + ReaPlus grep kanıtları (2026-10-18/19).

## 1. Upstream release'leri (6.1.0 → 6.7.0) × ReaPlus

| rea release | Highlights | ReaPlus durumu |
|---|---|---|
| **6.7.0** (18.10) | Duplicate-member semantiği: setup son JSON/JSONC üyesini düzenler (client'ın okuduğu); 6.6.0'ı içerir (npm'e yayınlanmayan tag) | setup/client-config yüzeyi ReaPlus'ta yok → alakasız |
| **6.6.0** (18.10) | **571 commit / 236 merge PR**: Kuna SA provider; retained JS facts (paging + row Evidence); çok-locale APK tablosu; Ghidra Windows ARM PE (ARMNT/ARM64) + raw m68k; JADX deadline env; Electron window options; ~40 fix kategorisi (partial-fact retention, JS resolution, Apple plist, ADB, MCP contracts, SQLite/WASM/packet) | ana başlıklar port adayı (bkz. bölüm 4); breaking'ler upstream-internal → ReaPlus kendi Evidence şemasında |
| **6.5.0** (14.10) | JS cross-bundle relationship recovery; retained Evidence summary/paging; SQLite snapshot, packet/signal, WASM, Rust dep metadata, Electron fuses offline inspect | JS: `rea_js_sourcemap` + `rea_js_bundle_diff` ✓; **cross-bundle recovery yok**, SQLite **0 hit**, Electron fuse **yalnız sessionRouter tipi** → eklemi adayı |
| **6.4.0** (11.10) | Android: cihaz inceleme, **split-APK**, log, **screenshot**, **file transfer**, lifecycle + Apktool manifest/lokalized-string; JEB unit browse; large analiz summary'leri | `AdbBridge` install/logcat/screencap + `ApktoolBridge` ✓; **split-APK 0 hit, screenshot yalnız firmware-browser, adb transfer yalnız frida reçetesi** → kısmi eklemi adayı |
| **6.3.0** (9.10) | BREAKING: capture accounting + web diff accessibility/storage dims; typed JSON shape paths | Bizde bu capture/web-diff yüzeyi **yok** (domain ayrımı) → alakasız/düşük risk |
| **6.2.0** (9.10) | BREAKING: canonical Evidence (`normalized_result`), migration-6.2.md; `always-bump-minor` | Bizde Evidence facade kendi şemasıyla ✓ (upstream wrapper'ı benimsemiyor) → bilinçli ayrım |
| **6.1.0** (9.10) | BREAKING: Hopper regex → ECMAScript Unicode + 5s cancel worker; `set_current_document` kaldırıldı; Grok Build/Bot setup | `rea_hopper_tara(regexMi)` ✓ — bizde zaten `set_current_document` **yok** (çakışma sıfır); Unicode/worker deadline kapsamı farklı → izle |

## 2. Son merge PR'lar → ReaPlus karşılığı

### 6.1–6.5 dönemi (17 PR, 17–18 Eki)

| rea PR | Konu | ReaPlus'ta |
|---|---|---|
| #4944 | strict JSON for Claude Code config | **yok** (0 hit) — setup yüzeyi yok → alakasız |
| #4937 | signed 64-bit TOML int lossless | TOML parse **yok** → alakasız |
| #4930/#4824/#4796 | CI capacity/cache/plist test altyapısı | upstream'e özgü CI → alakasız |
| #4839 | plist negative-zero reals | bizde `Apple.ts` sadece basit XML `<key>/<string>` parse — **CFNumber gerçek okuma yok** → kapsamsal boşluk (B2) |
| #4838 | CommonJS bare **scoped** pkg dir resolution | JS domain'de paket çözümleme **yok** → kapsamsal boşluk (B3) |
| #4819 | **EM_HEXAGON (164) ELF** | **0 hit** → ELF e_machine yüzeyimizde eksik → bug adayı (B1) |
| #4823 | spaced output flag values (upstream CLI) | ReaPlus CLI ayrı parser → düşük risk (doğrulanmadı) |
| #4804/#4771 | Apktool locale-table paylaşımı + Evidence subject | `ApktoolBridge` var; locale paylaşımlı decode kapsamı doğrulanmadı → izle |
| #4791 | Android class page filter perf | bizde ADB yüzeyi farklı → alakasız |
| #4814/#4803/#4792 | test/docs/launcher alias | not |

### 6.6.0–6.7.0 dönemi (9 yeni merge, 18 Eki)

| rea PR | Konu | ReaPlus'ta |
|---|---|---|
| #5126 | fix(setup): empty APPDATA as unset (VS Code/Trae/Devin) | setup domain → alakasız |
| #4954 | feat(analysis-view): web capture'tan environment manifest | ReaPlus'ta web capture yok → alakasız |
| #5041 | fix(hopper): Linux embedding runtime onarımı | ticari lisans kapılı köprü → izle |
| #5017 | perf(hopper): decoded record reuse | izle |
| #5021/#5018 | fix(tests): Android önkoşul / fixture sahipliği | upstream test altyapısı → alakasız |
| #5002 | docs(jeb): Linux CE iş akışları | ticari lisans → izle |
| #4990 | perf(apktool): duplicate primary string önleme | `ApktoolBridge` string dedupe doğrulanacak → izle |
| #4983 | chore(release/6.7.0) | — |
| #4957 | fix(setup): duplicate JSON üyesi (client'ın okuduğu) | setup domain → alakasız |

### 6.7.0 sonrası commit dalgası (18–19 Eki, ~15 commit)

Partial-fact retention disiplini (fs snapshot, uninstall, native routes, reference comparison),
symlink race koruması, cancellation provenance, MCP procedure alias'ları, scoped unknown'lar.
ReaPlus `evidenceBundle` aynı felsefede; küçük uyarlama adayları olarak izlenir (henüz doğrulanmadı).

## 3. Olası bug adayları (grep kanıtlı)

| # | Aday | Kanıt | Etki |
|---|---|---|---|
| B1 | ELF **Hexagon** tanınmıyor | `EM_HEXAGON` src+tests **0 hit** | Qualcomm firmware'de tanıma boşluğu |
| B2 | plist'te gerçek numeric/CFNumber okunmuyor | `Apple.ts` basit key/string eşleşmesi; `negative-zero/CFNumber` 0 hit | iOS bundle'da sayısal anahtarlar sessiz kayıp |
| B3 | CommonJS bare scoped package çözümlenmiyor | `bare.?scoped/bareSpecifier` **0 hit** | JS analizinde `@scope/pkg` import'ları bilinmeyen |
| B4 | Sessiz sürüm bayatlaması (kapandı) | TOOLS 0.11.0'da takılı kaldı, `build → regen` sırası sabitlendi | regresyon: version-sync kapsamı genişletilebilir |
| B5 | `*.map` adlı **dizin** source-map sanılabilir (doğrulanacak) | upstream 6.6.0 bunu düzeltti; ReaPlus `js_sourcemap/bundle_diff` guard'ı doğrulanmadı | yanlış sınıflandırma (düşük) |

## 4. Port/ekleme adayları (öncelikli)

1. **JS cross-bundle recovery** (6.5.0) — `rea_js_bundle_diff` yanına doğal oturur. P-M.
2. **JS çözümleme genişletmesi** (6.6.0): scoped pkg, `main`, JSON require, `.mts/.cts`, `Object.defineProperty` export'ları. B3'ü kapatır. P-M.
3. **Android paketi** (6.4.0/6.6.0): split-APK, file transfer (snapshot identity), çok-locale decode, method-body bytecode recovery, Apktool advisory pencereleri. P-M/L (cihaz şart).
4. **Apple plist sayısal sadakat** (6.6.0): exact int, negative-zero, non-finite, OpenStep. B2'yi kapatır. P-M.
5. **Hexagon ELF e_machine** (#4819). P-S.
6. **Ghidra admission genişletmesi**: Windows ARM PE (ARMNT/ARM64) + raw m68k profili (6.6.0). P-M.
7. **SQLite snapshot inspect** (6.5.0) — sıfırdan yüzey. P-L.
8. **Electron**: fuses offline read (6.5.0) + `BrowserWindow` sabit çözümü (6.6.0). P-M.
9. **Kuna provider köprüsü** (6.6.0, caller-installed). P-L (opsiyonel).
10. **Apktool version advisory** (6.6.0) — sürümü kanıt değil, gözlem olarak raporla. P-S.

## 5. ReaPlus güncellemeleri (v0.12.0)

`63e775f` golden korpus (5 gerçek gcc binary + 16 test) · `d5ef760` 4 görev şablonu prompt'u
(toplam 7) · `a0ea39b`+`582b9b2`+`6d67eaf` portable bundle + release asset zinciri ·
`0c16da6` docs 191/2/7 senkronu (6 dil) + CLI guard realpath fix · `9fd2057` release.

## 6. Release notu düzeltmesi (2026-10-19)

- `v0.11.0` gövdesi: baştaki CP437-mojibake BOM (`´╗┐`) + 2 bozuk em-dash (`ÔÇö`) temizlendi.
- `v0.12.0` gövdesi: baştaki U+FEFF (BOM) temizlendi.
- Doğrulama: iki gövde de ilk kod noktası `#` (35), suspicious=0. Kaynak: node + `gh release edit --notes-file` (PowerShell UTF-16/BOM tuzağından bağımsız).
