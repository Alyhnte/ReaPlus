# ROADMAP-NEXT — v0.11.0 sonrası derin işler

Durum: rea'nın tüm kamusal yetenekleri ReaPlus'ta (191 araç, 2 resource, 3 prompt,
101 test dosyası). Ticari lisanslılar kapılı (Hopper/IDA/JEB), Linux-özeller belgeli
(binwalk). v0.11.0'da kapananlar: 5 dilli site i18n + `--check`, örnek oturum (metin),
npm OIDC provenance + SBOM release asset'i, Pages deploy, CONTRIBUTING + issue formları.

Önceki revizyondan kapanan maddeler:

- NEXT-3 syscall + dosya/registry izi → **KAPANDI** (v0.10.0, ROADMAP-F: ntdll numara
  eşleme + CreateFileW/RegSet profilleri + tek-çağrı davranış koşusu).
- NEXT-6 Android dinamik → **KAPANDI** (v0.10.0: 5 adımlı üretim reçetesi + kuru-doğrulama).

## 1. Derinlikten akla: soruşturma orkestrasyonu (en yüksek değer)

Araçlar var, dedektif yok. Sıradaki iş: hedef tipine göre otomatik plan kuran
`rea_investigate(hedef, soru)` — sniff→confidence→uygun provider→evidence bundle→readiness.
Bugün ajan bunu elle diziyor; orkestrasyon 5 çağrıyı 1'e indirir, kanıt formatı
standartlaşır. Maliyet: saf TS planlayıcı + 10 test. Risk: yok (salt-okunur).

## 2. Decompile kalitesi: tip yayılımı

Ghidra pseudo-C + ilspycmd C# + rizin disasm var; ama tipler çağrılar arası
yayılmıyor. `rea_typedef` (imza→struct önerisi, DWARF/PDB varsa okuma) eklensin.
Windows'ta `symchk`/DIA ile PDB çekme mümkün. Değer: okunabilirlik 10x.

## 3. Ölçek: repo-tarama modu

Tek dosya iyi; 10.000 dosyalı repo yavaş (her çağrı process spawn).
Çözüm: kalıcı worker + sonuç cache (probeCache deseni) + paralel kuyruk (4'lü).
`rea_scan_repo` toplu API. Maliyet: orta. Değer: CI entegrasyonu açılır.

## 4. Doğruluk: golden korpus (kısmen kapandı → genişlet)

Kısmen kapandı (v0.10.1): `tests/corpus/mini.dex` (sentetik) + mini_branch/mini_pe
fixture'ları + HASHES girdisi var. Hedef: **her provider için 5 gerçek binary'lik
korpus + beklenen çıktı hash'i**. Korpus büyüdükçe regresyon yakalanır.
Maliyet: düşük, sürekli.

## 5. MCP tam hizmet: kanıt şeması + görev şablonları

Orkestrasyon (1) kanıt zarfını standart şemaya bağlamalı: tüm provider çıktıları aynı
tipte paketlensin (hedef, yöntem, güven, kanıt, kalan belirsizlik). Prompt kütüphanesi
bugün 10 prompt + 2 resource; tam hizmet için RE görev şablonlarıyla (triage → static →
dynamic → diff → rapor) genişletilsin. Orkestrasyon + şema birlikte tek oturumda
"analiz + rapor"u kapatır. Maliyet: M.

## 6. Uzun vade (ağır — kod dalgası değil, araştırma/L)

- angr/Triton sembolik yürütme (VMProtect sınıfı için tek gerçek yol; WSL+conda).
- Fuzzing harness (AFL++ WSL).
- IDA/Hopper canlı köprü (lisans + headless API araştırması).
- LLDB motoru (Linux/macOS), WinDbg TTD okuma (ROADMAP-D P3).

## Açık dış kapılar (P0 — kod dalgası değil)

- Frida canlı VM exception onayı.
- Self-hosted Windows runner (Frida/debug testleri CI'da koşmuyor).
- npm Trusted Publisher (OIDC) — provenance var, Trusted Publisher ayarı yok.

## Öncelik sırası

orkestrasyon → typedef → repo-tarama → korpus → kanıt şeması/prompt → ağır işler.

---

## Dalga planı (4'erli; her iş izole worktree + TDD; dalga bitince tam test, sonra sonraki 4)

### dalga-11 — 4 iş (paralel, dosya sahiplikleri ayrışık)

1. `rea_investigate` orkestrasyon — yeni planlayıcı modülü + `tests/investigate*.test.mjs`.
2. `rea_typedef` tip yayılımı — decompile/okunabilirlik alanı + `tests/typedef*.test.mjs`.
3. `rea_scan_repo` repo-tarama — worker/cache alanı (mevcut worker-cache'e dokunmadan) +
   `tests/scan-repo*.test.mjs`.
4. Golden korpus genişletme — `tests/corpus/` + HASHES girdileri + korpus testi.

### dalga-12 — 4 iş

5. Kanıt zarfı şeması + orkestrasyon entegrasyonu (dalga-11.1'in üzerine; ortak tipler).
6. Prompt/resource yüzeyi: RE görev şablonları + `docs/PROMPTS.md` güncelleme.
7. asciinema/GIF örnek oturumlar (README + docs; ROADMAP-I P1).
8. SEA tek-dosya exe: fizibiliteden portable node bundle yolu (ROADMAP-A P2).
