// facade/sniff.ts: sihirli bayt -> hedef tip + önerilen motor.
// İlk 4KB okunur; saf karar sniffBytes içindedir.
// Büyük dosyalar: başlık + aralıklı pencere okuma (mmap yok, fs read + offset),
// sabit tampon (64KB), erken çıkış, iptal desteği (Dalga G/8).
import { closeSync, openSync, readSync, statSync } from "node:fs";
import type { ReaPlusEngine } from "./sessionRouter.js";

// sniffBytes ile aynı küme: dosya türü belirteci.
export type SniffTip = "elf" | "apk" | "dex" | "wasm" | "pe" | "macho" | "bilinmiyor";

// Tanı sonucu: tür + bu türe en uygun motor önerisi.
// makine: ELF'te (>=20 bayt + tanınan e_machine) veya PE'de ARMNT/ARM64 COFF
// machine'inde dolar; diğer türlerde ve tanınmayan makinede alan hiç eklenmez (opsiyonel).
export interface SniffSonuc { tip: SniffTip; motor: ReaPlusEngine; makine?: string; }

// Tür bilinmeyince güvenli varsayılan: statik analiz motoru.
const VARSAYILAN: SniffSonuc = { tip: "bilinmiyor", motor: "radare2" };

// ELF e_machine adları: kanonik, küçük harfli, tireli; e_machine başına tek ad.
// (Kaynak: ELF gABI EM_* sabitleri; Hexagon = Qualcomm DSP, 164.)
const ELF_MAKINE: Readonly<Record<number, string>> = {
  2: "sparc",
  3: "x86",
  8: "mips",
  20: "ppc",
  21: "ppc64",
  22: "s390",
  40: "arm",
  43: "sparcv9",
  62: "x86-64",
  164: "hexagon",
  183: "aarch64",
  243: "risc-v",
  247: "bpf",
  258: "loongarch",
};

// ELF başlığından e_machine adı (offset 18, u16; EI_DATA=2 ise big-endian).
// Kapılar: en az 20 bayt + tanınan makine; aksi halde undefined (uydurma ad yok).
function elfMakine(buf: Uint8Array): string | undefined {
  if (buf.length < 20) return undefined;
  const makine = buf[5] === 2 ? (buf[18] << 8) | buf[19] : buf[18] | (buf[19] << 8);
  return ELF_MAKINE[makine];
}

// PE COFF machine kimlikleri: yalnız ARM aileleri (upstream 6.6.0 deltası, PR #3965).
// x86 (0x14c) / x86-64 (0x8664) bilinçli olarak YOK: bu makinelerde mevcut PE kaydı
// (tip+motor) ve alan kümesi birebir korunur. Legacy ARM (0x01c0), Thumb (0x01c2) ve
// ARM64EC (0xa641) upstream'de kabul edilmez; kimlik üretilmez.
const PE_MAKINE: Readonly<Record<number, string>> = {
  0x01c4: "armnt",
  0xaa64: "arm64",
};

// PE başlığından COFF machine adı: MZ + e_lfanew (0x3C, u32LE) + "PE\0\0" + machine (u16LE).
// Kapılar: tampon e_lfanew + 6 baytı kapsamalı, imza "PE\0\0" olmalı, machine tanınmalı;
// aksi halde undefined (uydurma ad yok; kısa/bozuk başlıkta alan eklenmez).
function peMakine(buf: Uint8Array): string | undefined {
  if (buf.length < 0x40) return undefined;
  const e = buf[0x3c] | (buf[0x3d] << 8) | (buf[0x3e] << 16) | (buf[0x3f] << 24);
  if (e < 0x40 || e + 6 > buf.length) return undefined;
  if (buf[e] !== 0x50 || buf[e + 1] !== 0x45 || buf[e + 2] !== 0x00 || buf[e + 3] !== 0x00) {
    return undefined;
  }
  return PE_MAKINE[buf[e + 4] | (buf[e + 5] << 8)];
}

// Saf imza eşleştirme: ELF, DEX, WASM, ZIP/APK, MZ/PE, Mach-O.
export function sniffBytes(buf: Uint8Array): SniffSonuc {
  const imza = [...buf.slice(0, 4)].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (imza.startsWith("7f454c46")) { // ELF: tür+motor sabit, makine yalnız tanınırsa eklenir
    const m = elfMakine(buf);
    return m ? { tip: "elf", motor: "radare2", makine: m } : { tip: "elf", motor: "radare2" };
  }
  if (imza.startsWith("6465780a")) return { tip: "dex", motor: "jadx" }; // DEX ("dex\n")
  if (imza.startsWith("0061736d")) return { tip: "wasm", motor: "wasm" }; // WASM
  if (imza.startsWith("504b0304")) return { tip: "apk", motor: "jadx" }; // ZIP/APK/JAR
  if (imza.startsWith("4d5a")) { // MZ/PE: motor sabit, makine yalnız ARMNT/ARM64'ta eklenir
    const m = peMakine(buf);
    return m ? { tip: "pe", motor: "x64dbg", makine: m } : { tip: "pe", motor: "x64dbg" };
  }
  if (imza === "feedfacf" || imza === "cefaedfe" || imza === "cafebabe") return { tip: "macho", motor: "hopper" };
  return { ...VARSAYILAN }; // tanınmayan imza
}

// Dosyadan ilk 4KB okur; yoksa/okunamazsa bilinmiyor döner (kapı kodu yok).
// KRİTİK: dosyanın tamamı belleğe alınmaz; yalnız başlık penceresi okunur.
export function sniffFile(yol: string): SniffSonuc {
  const bas = baslikOku(yol, 4096);
  if (!bas) return { ...VARSAYILAN };
  return sniffBytes(bas);
}

// İlk N baytı sabit tamponla okur (dosyanın tamamı belleğe alınmaz).
// Yoksa/okunamazsa null döner.
export function baslikOku(yol: string, baytSayisi = 4096): Buffer | null {
  if (!yol || baytSayisi <= 0) return null;
  let fd = -1;
  try {
    const boy = statSync(yol).size;
    if (boy === 0) return Buffer.alloc(0); // boş dosya: hata değil, boş başlık
    fd = openSync(yol, "r");
    const n = Math.min(baytSayisi, boy);
    const buf = Buffer.alloc(n);
    let doldu = 0;
    while (doldu < n) {
      const k = readSync(fd, buf, doldu, n - doldu, doldu);
      if (k <= 0) break;
      doldu += k;
    }
    return doldu > 0 ? buf.subarray(0, doldu) : null;
  } catch {
    return null;
  } finally {
    if (fd >= 0) { try { closeSync(fd); } catch { /* kapanmış */ } }
  }
}

// Sabit tampon: tek pencere üst sınırı (BinaryDiff PENCERE ile aynı).
export const STREAMING_PENCERE = 64 * 1024;

export interface PencereSecenek {
  pencereBoy?: number; // varsayılan 64KB; üst sınır 64KB (tavan garantisi)
  sinyal?: AbortSignal; // iptal: abort olursa üretim durur (AbortError)
}

// Sabit tamponlu pencere üretici: GB'lık dosyalarda OOM bitirir.
// - Tembel açılır: fd ilk next()'te açılır (tüketilmeyen akış okuma yapmaz).
// - İstemci break/return edince finally fd'yi kapatır (kaynak israfı yok).
// - Sinyal abort olursa AbortError fırlatır, fd kapanır (üretici durur).
// - Asılı süreç/timer yok: yalnız senkron fs okuma, kapatma garantili.
export class PencereAkis {
  readonly yol: string;
  readonly pencereBoy: number;
  readonly sinyal?: AbortSignal;
  readonly boy: number;
  okunan = 0; // toplam okunan bayt
  tavan = 0; // tek okuma azamisi (<= STREAMING_PENCERE)
  pencereSayisi = 0; // verilen pencere adedi
  kapatildi = false; // açık fd kalmadı mı
  private fd = -1;

  constructor(yol: string, sec: PencereSecenek = {}) {
    this.yol = yol;
    const istenen = sec.pencereBoy ?? STREAMING_PENCERE;
    this.pencereBoy = Math.min(Math.max(1, Math.floor(istenen)), STREAMING_PENCERE);
    this.sinyal = sec.sinyal;
    this.boy = statSync(yol).size; // yoksa fırlatır (çağıran yakalar)
  }

  kapat(): void {
    if (this.fd >= 0) { try { closeSync(this.fd); } catch { /* kapanmış */ } this.fd = -1; }
    this.kapatildi = true;
  }

  private iptalKontrol(): void {
    if (this.sinyal?.aborted) {
      const e = new Error("akış iptal edildi");
      e.name = "AbortError";
      throw e;
    }
  }

  *pencereler(baslangic = 0): Generator<{ ofset: number; veri: Buffer }, void, void> {
    try {
      this.iptalKontrol();
      this.fd = openSync(this.yol, "r");
      const tampon = Buffer.alloc(this.pencereBoy);
      let ofset = Math.max(0, Math.floor(baslangic));
      while (ofset < this.boy) {
        this.iptalKontrol();
        const k = readSync(this.fd, tampon, 0, Math.min(this.pencereBoy, this.boy - ofset), ofset);
        if (k <= 0) break;
        this.okunan += k;
        if (k > this.tavan) this.tavan = k;
        this.pencereSayisi++;
        yield { ofset, veri: Buffer.from(tampon.subarray(0, k)) };
        ofset += k;
      }
    } finally {
      this.kapat();
    }
  }
}
