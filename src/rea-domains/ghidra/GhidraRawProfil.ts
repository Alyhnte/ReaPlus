// Ghidra ham-binary dil profilleri (upstream 6.6.0 paritesi; PR #4018).
// Ham (raw) aileler yalnız çağıran-tanımlıdır: başlık tespiti bu aileleri asla
// üretmez (upstream: RAW_ONLY_ARCHITECTURES; HeaderArchitecture dışında tutulur,
// bu yüzden sniff/makine alanına bağlanmaz). Bu modül saf veri + eşlemedir;
// MCP yüzeyinde araç yoktur (dalga kaydı: yüzey dışı saf fonksiyon deseni).
// Ham-binary yüzeyi açılırsa tüketici buraya bağlanır.

export interface RawDilProfili {
  ad: string; // aile adı
  dil: string; // Ghidra language id (sürüm sabit)
  baytSirasi: "be" | "le"; // aile başına tek sabit sıra (upstream)
  adresBitGenisligi: number;
  girisHizasi: number; // giriş noktası bayt hizası (m68k: çift = 2)
}

// Delta tablosu: yalnız upstream #4018 ile eklenen aile (m68k).
// 6502 / x86 / x86-64 / arm / arm64 ham aileleri upstream'de zaten kabuldür;
// bu portta mevcut kayıt olmadığından uydurma satır eklenmez.
// Not: 68000 dili 68040 üst kümesini de çözer (upstream varsayılanı).
export const RAW_DIL_PROFILLERI: readonly RawDilProfili[] = [
  { ad: "m68k", dil: "68000:BE:32:default", baytSirasi: "be", adresBitGenisligi: 32, girisHizasi: 2 },
];

// Aile adından profil: tanınmayan ad undefined döner (uydurma profil yok).
export function rawDilProfili(ad: string): RawDilProfili | undefined {
  return RAW_DIL_PROFILLERI.find((p) => p.ad === ad);
}

// Giriş hizası kapısı: upstream ham-kabul kuralı (m68k girişi çift hizalı olmalı).
export function rawGirisGecerliMi(ad: string, giris: number): boolean {
  const p = rawDilProfili(ad);
  return p !== undefined && Number.isInteger(giris) && giris >= 0 && giris % p.girisHizasi === 0;
}
