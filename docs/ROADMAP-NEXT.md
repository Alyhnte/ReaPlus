# ROADMAP-NEXT — v0.11.0 sonrası derin işler

Durum: rea'nın tüm kamusal yetenekleri ReaPlus'ta (191 araç, 2 resource, 7 prompt,
101 test dosyası). Ticari lisanslılar kapılı (Hopper/IDA/JEB), Linux-özeller belgeli
(binwalk). v0.11.0'da kapananlar: 5 dilli site i18n + `--check`, örnek oturum (metin),
npm OIDC provenance + SBOM release asset'i, Pages deploy, CONTRIBUTING + issue formları.

## Önceki revizyonun maddeleri — kanıtla kapandı (2026-10-18 sayımı)

- ~~NEXT-1 `rea_investigate` orkestrasyonu~~ → **KAPANDI**: `src/facade/investigate.ts`
  (60 satır) + `sniff/confidence/evidenceBundle/readiness/missingReasons` facadeleri;
  kayıt `src/server/registerReaTools.ts:480`; şema `toolMetadata.ts:781`;
  `tests/investigate.test.mjs`, `evidence.test.mjs`, `sniff.test.mjs`,
  `confidence.test.mjs`, `readiness.test.mjs` yeşil. Prompt'lar zaten
  `rea_investigate(path)` çağırıyor. (v0.5.0 full port'ta girmiş, dosya bayat kalmış.)
- ~~NEXT-2 `rea_typedef` tip yayılımı~~ → **KAPANDI**: `rea_typedef_oner` aracı
  `src/rea-domains/typedef/TypeSpread.ts` altında kayıtlı; `tests/typedef.test.mjs` yeşil.
- ~~NEXT-3 syscall + dosya/registry izi~~ → **KAPANDI** (v0.10.0, ROADMAP-F: ntdll numara
  eşleme + CreateFileW/RegSet profilleri + tek-çağrı davranış koşusu).
- ~~NEXT-4 `rea_scan_repo` repo-tarama~~ → **KAPANDI**: `rea_scan_repo` +
  `rea_scan_repo_paralel` (4'lü havuz, iptal) `src/rea-domains/reposcan/RepoScan.ts`;
  `tests/reposcan.test.mjs`, `parallel-scan.test.mjs` yeşil.
- ~~NEXT-6 Android dinamik~~ → **KAPANDI** (v0.10.0: 5 adımlı üretim reçetesi + kuru-doğrulama).

## 1. Doğruluk: golden korpus (açık — kısmen kapandı → genişlet)

Kısmen kapandı (v0.10.1): `tests/corpus/mini.dex` (sentetik) + mini_branch/mini_pe
fixture'ları + HASHES girdisi var. Hedef: **gerçek (derlenmiş) binary'lik korpus +
beklenen çıktı hash'i**; korpus büyüdükçe regresyon yakalanır. Maliyet: düşük, sürekli.

## 2. MCP tam hizmet: görev şablonları (açık)

Kanıt zarfı ayakta (`src/facade/evidenceBundle.ts` + `tests/evidence.test.mjs`).
Kalan: prompt kütüphanesi (bugün 10 prompt + 2 resource) RE görev şablonlarıyla
genişletilsin (triage → static → dynamic → diff → rapor); `docs/PROMPTS.md` senkron.
Maliyet: S/M.

## 3. Uzun vade (ağır — kod dalgası değil, araştırma/L)

- angr/Triton sembolik yürütme (VMProtect sınıfı için tek gerçek yol; WSL+conda).
- Fuzzing harness (AFL++ WSL).
- IDA/Hopper canlı köprü (lisans + headless API araştırması).
- LLDB motoru (Linux/macOS), WinDbg TTD okuma (ROADMAP-D P3).
- asciinema/GIF örnek oturum (ROADMAP-I P1; render aracı kurulu değil — README'de
  metin transkriptleri var, görsel kayıt araç kurulumu bekliyor).

## Açık dış kapılar (P0 — kod dalgası değil, kullanıcı/altyapı ayarı)

- Frida canlı VM exception onayı.
- Self-hosted Windows runner (Frida/debug testleri CI'da koşmuyor).
- npm Trusted Publisher (OIDC) — provenance var, Trusted Publisher ayarı yok.

## Öncelik sırası

korpus → görev şablonları → SEA portable (ROADMAP-A P2) → araştırma/L.

---

## Dalga planı (4'erli; her iş izole worktree + TDD; dalga bitince tam test, sonra sonraki 4)

### dalga-11 — 3 açık iş (paralel, dosya sahiplikleri ayrışık)

1. Golden korpus genişletme — `tests/corpus/` + HASHES girdileri + korpus testi.
2. Prompt görev şablonları — `src/server/registerResourcesPrompts.ts` + `docs/PROMPTS.md`
   + `tests/resources-prompts.test.mjs`.
3. SEA tek-dosya/portable bundle — `scripts/` + release asset yolu (ROADMAP-A P2).

### dalga-12 — release + doküman senkronu

4. README + ROADMAP senkron, CHANGELOG (5 dil), v0.12.0 bump, manifest (winget/scoop/brew),
   SBOM, site regen → tag `v0.12.0` → CI/publish/docker izleme.

### son iş

5. `github.com/morluto/rea` karşılaştırması: doğrulanmış/enleşmiş PR'lar, release'ler,
   commitler → ReaPlus'a karşı tam tablo (olası bug'lar + yeni yükseltme/ekleme adayları).
