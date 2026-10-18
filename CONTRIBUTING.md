# Katkı Rehberi (Contributing)

Issues ve PR'ler açık — hata raporu, özellik fikri, docs. Aşağıdaki akış
README'daki kısa bölümü genişletir; kurallar ihlal edilirse CI kızarır.

Formlar: `.github/ISSUE_TEMPLATE/` altında `bug-raporu.yml` (hata),
`ozellik-istegi.yml` (özellik) ve `good-first-issue.yml` (ilk PR adayı
küçük iş) — doğru formu seçin, boş issue yerine formu doldurun.

## Kurulum

```bash
git clone https://github.com/Alyhnte/ReaPlus.git
cd ReaPlus
npm ci                 # temiz kurulum (CI ile aynı)
npm run build          # tsc + çalışma-zamanı asset'leri -> dist/
```

Gereksinim: Node.js ≥ 20. Ghidra/rizin/jadx/Frida araçları opsiyoneldir —
eksik backend `capability_unsupported` + kurulum ipucu verir; kurulu
olmayan araç için sahte sonuç yazmayın. Kendi makine haritanız için
`node dist/cli/index.js doctor` koşturun.

Kendi işinizi ana projeden izole edin (bkz. **Dalga Kuralları**): ayrı bir
çalışma ağacında çalışın (`git worktree add ../ReaPlus-<konu> -b <konu>`)
ve `npm ci`'yi o dizinde çalıştırın; `npm ci` `prepare` sırasında `build`
de koşar.

## Test

```bash
npm run typecheck      # tsc --noEmit, PR öncesi zorunlu
npm test               # varsayılan küme (canlı enjeksiyon/debugger/paket
                       # yakalama/tarayıcı hariç; VM/CI işi için ayrı)
npm run test:live      # her şey dahil — yalnız VM/ayrı CI işinde
node --test tests/<alan>.test.mjs   # tek dosya koşusu
```

Tek dosya koşusu en hızlı geri bildirimdir; önce o testi kırmızıya düşürüp
sonra tam kümeye (`npm test`) geçin. CI (`.github/workflows/ci.yml`,
Ubuntu, Node 20 + 22) aynısını koşar: `npm ci` → `typecheck` → `build`
→ `test`.

Kurallar:

- Her dosya 90 sn tavanla koşar; asılı süreç/timer bırakmayın (ağaç-kill
  sizi kurtarır ama bilinçli yazın).
- Yeni örnek/çıktı ekliyorsanız sayıları gerçek koşudan alın, uydurmayın;
  `docs/EXAMPLES.md` + `tests/docs-examples.test.mjs` desenini izleyin.
- `tests/corpus/ornek.js` metin dosyasıdır: LF/CRLF churn'u normaldir,
  test bitince `git restore -- tests/corpus/ornek.js` ile döndürün.
- Test ve docs'ta kişisel yol/ev dizini sızdırmayın (`tmpdir()` kullanın,
  mutlak yolları assert etmeyin).
- Yeni fixture: `tests/corpus/README.md` adımlarını izleyin (dosya +
  sha256 + `HASHES.json` + `verify-corpus`); manifest-dışı dosya
  `corpus-manifest` testini geçirmez.

### Korpus kuralları (`tests/corpus/`)

Kanon: `tests/corpus/README.md`. Özet:

1. Dosyayı bu dizine koy.
2. sha256 özetini hesapla.
3. `HASHES.json` içine `kaynak` + `lisans` alanlarıyla yeni girdi ekle
   (bilinmiyorsa `"bilinmiyor"` yaz, uydurma lisans yazılmaz).
4. `node scripts/verify-corpus.mjs` ile doğrula — başarıda exit `0`;
   eksik/uyuşmaz/manifest-dışı dosyada dosya adıyla rapor + exit `1`
   (`HASHES.json` ve `README.md` fixture sayılmaz).
5. Manifest'e eklenmeyen dosya testleri geçirmez
   (`tests/corpus-manifest.test.mjs`).

Notlar:

- `tests/corpus/ornek.js` metin dosyasıdır: LF/CRLF churn'u normaldir,
  test bitince `git restore -- tests/corpus/ornek.js` ile döndürün.
- `tests/corpus/*` içine el ile oynanmış ya da manifestsiz dosya
  bırakmayın.

## Kod Stili

- **Dosya adları `kebab-case`**: `bug-raporu.yml`, `docs-examples.test.mjs`,
  `verify-corpus.mjs`. Test dosyası deseni `<konu>.test.mjs`.
- **Fonksiyon ve değişken adları `camelCase`**; sınıf/Sabit (örn.
  `REA_PLUS_VERSION`) yazımlarını değiştirmeyin — `version-sync` testi
  bağlayıcıdır.
- **TypeScript `strict: true`** (`tsconfig.json`): tip deliği (`any`,
  `@ts-ignore`) ile testten kaçmayın; hata dürüstçe fırlatın.
- **Yorum yalnızca "why" için**: "ne yaptığı" açıklayan yorum tekrardır,
  kod okunuyorsa yorum yazılmaz; nedenini anlatmayan yorum yazmayın.
- Yazım/dil tutarlılığı: belge ve şablonlarda Türkçe, kod içi log/uyarı
  mesajları mevcut dosyanın diliyle uyumlu.

## Dalga Kuralları

Paralel dalgalar aynı repoda farklı worktree'lerde çalışır; kurallar:

- **Worktree izolasyonu**: her dalga kendi worktree'nde (`dalga-<n>/<konu>`
  dalı) çalışır; ana dal (main) ve başka dalgaların worktree'lerine
  dokunulmaz. Kendi worktree'nizde `npm ci` yapın, işi orada bitirin.
- **Sadece kendi yetki alanınız**: yalnız sizin görevlendirildiğiniz
  dosyaları değiştirin. Çakışması muhtemel dosyalara (ör.
  `.github/ISSUE_TEMPLATE/good-first-issue.yml`, `docs/TOOLS.md`,
  `.github/workflows/`) başka dal dokunuyorsa dokunmayın.
- **TDD zorunlu**: yeni davranış ve hata düzeltmesi test-önce yazılır;
  kırmızı → yeşil → refactor. Testi gevşeterek yeşile dönmek yasaktır
  (aşağıdaki **TDD kuralı**).
- **commit / push yalnız ana ajan**: dalga ajanı değişiklik dosyalarını
  olduğu gibi bırakır ve test sonucunu raporlar; kendisi commit/push atmaz.
- **`tests/corpus/ornek.js` kirlenir**: test koşusu dosyayı LF'ye çevirir
  (churn normaldir); iş bitmeden önce
  `git restore -- tests/corpus/ornek.js` ile temizleyin.

### TDD kuralı

Yeni davranış ve hata düzeltmesi test-önce (test-first) yazılır:
önce başarısız test (kırmızı), sonra en küçük implementasyon (yeşil),
sonra temizlik (refactor). Testi gevşeterek yeşile dönmek yasaktır.

```bash
node --test tests/<alan>.test.mjs   # tek dosya koşusu, örn. tests/corpus-manifest.test.mjs
npm run typecheck                     # tsc --noEmit, PR öncesi zorunlu
npm test                              # varsayılan küme (node scripts/run-tests.mjs)
```

- Yeni örnek/çıktı sayılarını gerçek koşudan alın, uydurmayın;
  `docs/EXAMPLES.md` + `tests/docs-examples.test.mjs` desenini izleyin.
- Her dosya 90 sn tavanla koşar; asılı süreç/timer bırakmayın.
- Test ve docs'ta kişisel yol/ev dizini sızdırmayın (`tmpdir()`
  kullanın, mutlak yolları assert etmeyin).

## PR Akışı

1. **Dal açın**: `dalga-<n>/<konu>` (düzeltme `fix/...`, docs `docs/...`).
2. **Worktree'de çalışın**: kendi izole çalışma ağacınızda (Dalga
   Kuralları); ana projeye dokunmayın.
3. **TDD**: önce kırmızı test, sonra en küçük yeşil implementasyon.
4. **Test yeşil**: yerelde `npm run typecheck` + `npm test` geçmeli;
   çıktıyı (`npm test` özeti) PR açıklamasına test kanıtı olarak ekleyin.
5. **PR**: küçük ve tek konulu; açıklama + test kanıtı zorunlu.
6. **Review → merge**: yorumlar düzeltilir, CI yeşil olduktan sonra merge.

Ek kurallar:

- CI (`.github/workflows/ci.yml`, Ubuntu, Node 20 + 22) aynı kapıları
  koşar: `npm ci` → `typecheck` → `build` → `test`.
- Bunlara dokunmayın/kırmayın:
  - Conduit çekirdek 30 araç adı dondurulmuştur
    (`src/facade/toolNamespace.ts`); yeniden adlandırma yasaktır.
  - `docs/TOOLS.md` elle düzenlenmez —
    `node scripts/generate-tool-reference.mjs` ile üretilir;
    `tool-reference` testi sapmayı yakalar.
  - Yeni araç dürüst başarısız olur (`capability_unsupported`, asla sahte
    `ok`); canlı-mutasyon çağrıları `confirm:true` ister.
- `good-first-issue` arıyorsanız: README/ROADMAP sayı senkronu, corpus
  fixture köken tablosu gibi küçük tutarlılık işleri ideal ilk PR'dır.

### `good-first-issue` etiketi + ilk PR

Etiketin anlamı: bakımcıların yeni başlayanlara uygun gördüğü küçük,
tek konulu iş. Bulmak için Issues sekmesinde `good-first-issue` etiket
filtresini kullanın.

Uygun iş ölçütleri:

- Tek PR boyutunda, tek konulu.
- Canlı enjeksiyon/debugger, paket yakalama, tarayıcı, ağ indirmesi
  gerektirmez; yeni araç adı eklemez (Conduit çekirdek 30 araç adı
  dondurulmuştur — `src/facade/toolNamespace.ts`).
- Korpus fixture'ı ekliyorsa korpus kurallarına uyar.
- Klasik örnekler: README/ROADMAP sayı senkronu, corpus köken tablosu
  tamamlama, docs yazım tutarlılığı.

Öneri formu: `.github/ISSUE_TEMPLATE/good-first-issue.yml` — görev
tanımı, kabul kriteri, alan, ilgili dosya ve "yeni başlayan uygunluğu"
kutularını doldurun; bakımcılar etiketi forma göre takar.

İlk PR adımları:

1. Yerde `npm run typecheck` + `npm test` yeşil olmalı.
2. Küçük, tek konulu PR + açıklama + test kanıtı (`npm test` çıktısı).
3. Dokunulmazlar: `docs/TOOLS.md` (üretim:
   `node scripts/generate-tool-reference.mjs`), conduit araç adları,
   mevcut CI workflow'ları (`.github/workflows/`).

## Yayın

Yayın yetkisi bakımcıdadır; katkıcılar PR ile sınırlıdır.

- **Tetikleyici**: `v*` tag push — `.github/workflows/publish.yml`
  (tek tetikleyici; manuel publish workflow'u emekli).
- **Sıra**: kapılar (`npm ci` → `typecheck` → `build` → `test` →
  publish kontrol) → `npm publish --access public` (`NPM_TOKEN`) →
  npm'de sürüm görünene kadar yoklama (10 dk tavan) → MCP Registry
  yayını (`server.json` validate + GitHub OIDC).
- **Kuru prova**: `node scripts/publish-kontrol.mjs`
  (`npm pack --dry-run`; publish yapmaz, paket içeriğini doğrular).
  `prepublishOnly` zaten `npm run build` koşar.
- **SBOM**: `node scripts/sbom-uret.mjs` → `sbom.json` (CycloneDX).
  `tests/dagitim-manifest.test.mjs` sürüm + bileşen tutarlılığını kapıda
  otomatik doğrular — sürüm atlanınca SBOM'u yeniden üretin, yoksa tam
  küme testi düşer.
- **Sürüm senkronu**: `package.json` `version` tek otorite;
  `package-lock.json`, `server.json` ve `src/**` içindeki
  `REA_PLUS_VERSION` onunla aynı kalmalı (`tests/version-sync.test.mjs`).
  `CHANGELOG.md` + `docs/release-v*.md` yayın notlarıyla birlikte
  güncellenir.
