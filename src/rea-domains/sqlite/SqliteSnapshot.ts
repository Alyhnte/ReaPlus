// SQLite anlik goruntu: dosya basligi ve sqlite_schema yapraklarindaki tablo adlari.
// Tablo listesi cagiranin verdigi dizi degil, sayfa kayitlarinin cozumudur.
import { existsSync, readFileSync, statSync } from "node:fs";

export const SQLITE_SNAPSHOT_TOOLS = ["rea_sqlite_snapshot"] as const;

const SIHIR = Buffer.from("SQLite format 3\0", "utf8");

type Engel = { ok: false; code: "capability_unsupported"; neden: string };
const engel = (neden: string): Engel => ({ ok: false, code: "capability_unsupported", neden });

function varint(b: Buffer, o: number): { v: number; n: number } | null {
  let v = 0;
  for (let i = 0; i < 8; i++) {
    if (o + i >= b.length) return null;
    const c = b[o + i] ?? 0;
    v = v * 128 + (c & 0x7f);
    if ((c & 0x80) === 0) return { v, n: i + 1 };
  }
  if (o + 8 >= b.length) return null;
  return { v: v * 256 + (b[o + 8] ?? 0), n: 9 };
}

function seriBoyut(t: number): number | null {
  if (t === 0 || t === 8 || t === 9) return 0;
  if (t === 1) return 1;
  if (t === 2) return 2;
  if (t === 3) return 3;
  if (t === 4) return 4;
  if (t === 5) return 6;
  if (t === 6 || t === 7) return 8;
  if (t === 10 || t === 11) return null;
  if (t >= 12 && t % 2 === 0) return (t - 12) / 2;
  if (t >= 13) return (t - 13) / 2;
  return null;
}

function sayfaBoyutuOku(b: Buffer): number | null {
  const ham = b.readUInt16BE(16);
  const boy = ham === 1 ? 65536 : ham;
  if (boy < 512 || boy > 65536 || (boy & (boy - 1)) !== 0) return null;
  return boy;
}

function metin(buf: Buffer, o: number, len: number, enc: number): string | null {
  if (o + len > buf.length) return null;
  const parca = buf.subarray(o, o + len);
  if (enc === 1) return parca.toString("utf8");
  if (enc === 2) return parca.toString("utf16le");
  if (enc === 3) {
    const cevrilmis = Buffer.alloc(parca.length);
    for (let i = 0; i + 1 < parca.length; i += 2) {
      cevrilmis[i] = parca[i + 1] ?? 0;
      cevrilmis[i + 1] = parca[i] ?? 0;
    }
    return cevrilmis.toString("utf16le");
  }
  return null;
}

function yerelYuk(payload: number, usable: number): number | null {
  const x = usable - 35;
  if (payload <= x) return payload;
  const m = Math.floor(((usable - 12) * 32) / 255) - 23;
  if (m < 0) return null;
  const k = m + ((payload - m) % (usable - 4));
  return k <= x ? k : m;
}

function tasmaOku(dosya: Buffer, sayfaBoyutu: number, reserved: number, ilk: number, kalan: number): Buffer | null {
  const usable = sayfaBoyutu - reserved;
  const parcalar: Buffer[] = [];
  let sayfa = ilk;
  let beklenen = kalan;
  const gorulen = new Set<number>();
  while (beklenen > 0) {
    if (sayfa === 0 || gorulen.has(sayfa)) return null;
    gorulen.add(sayfa);
    const off = (sayfa - 1) * sayfaBoyutu;
    if (off < 0 || off + sayfaBoyutu > dosya.length) return null;
    const sonraki = dosya.readUInt32BE(off);
    const govde = Math.min(beklenen, usable - 4);
    if (govde < 0) return null;
    parcalar.push(Buffer.from(dosya.subarray(off + 4, off + 4 + govde)));
    beklenen -= govde;
    sayfa = sonraki;
  }
  return Buffer.concat(parcalar);
}

function kayitCoz(payload: Buffer, enc: number): { tur: string; ad: string } | null {
  const bas = varint(payload, 0);
  if (!bas || bas.v < bas.n || bas.v > payload.length) return null;
  const tipler: number[] = [];
  let o = bas.n;
  while (o < bas.v) {
    const t = varint(payload, o);
    if (!t) return null;
    tipler.push(t.v);
    o += t.n;
  }
  if (o !== bas.v) return null;
  const alanlar: { metin: string | null }[] = [];
  for (const tip of tipler) {
    const boy = seriBoyut(tip);
    if (boy === null || o + boy > payload.length) return null;
    const metinMi = tip >= 13 && tip % 2 === 1;
    alanlar.push({ metin: metinMi ? metin(payload, o, boy, enc) : null });
    o += boy;
  }
  const tur = alanlar[0]?.metin;
  const ad = alanlar[1]?.metin;
  if (tur === null || tur === undefined || ad === null || ad === undefined) return null;
  return { tur, ad };
}

function hucreYuku(dosya: Buffer, sayfa: Buffer, hucreOf: number, usable: number, sayfaBoyutu: number, reserved: number): Buffer | null {
  const boyut = varint(sayfa, hucreOf);
  if (!boyut) return null;
  const rowid = varint(sayfa, hucreOf + boyut.n);
  if (!rowid) return null;
  const yerel = yerelYuk(boyut.v, usable);
  if (yerel === null) return null;
  const veri = hucreOf + boyut.n + rowid.n;
  if (veri + yerel > sayfa.length) return null;
  const govde = Buffer.from(sayfa.subarray(veri, veri + yerel));
  if (yerel === boyut.v) return govde;
  if (veri + yerel + 4 > sayfa.length) return null;
  const tasma = tasmaOku(dosya, sayfaBoyutu, reserved, sayfa.readUInt32BE(veri + yerel), boyut.v - yerel);
  if (!tasma) return null;
  return Buffer.concat([govde, tasma]);
}

function semaTablolari(dosya: Buffer, sayfaBoyutu: number, reserved: number, enc: number): string[] | null {
  const usable = sayfaBoyutu - reserved;
  const tablolar: string[] = [];
  const gorulen = new Set<number>();
  const yuru = (sayfaNo: number): boolean => {
    if (sayfaNo <= 0 || gorulen.has(sayfaNo)) return false;
    gorulen.add(sayfaNo);
    const off = (sayfaNo - 1) * sayfaBoyutu;
    if (off < 0 || off + sayfaBoyutu > dosya.length) return false;
    const sayfa = dosya.subarray(off, off + sayfaBoyutu);
    const bas = sayfaNo === 1 ? 100 : 0;
    if (bas + 8 > sayfa.length) return false;
    const tur = sayfa[bas];
    if (tur !== 0x0d && tur !== 0x05) return false;
    const ic = tur === 0x05;
    const hucre = sayfa.readUInt16BE(bas + 3);
    const pointer = bas + (ic ? 12 : 8);
    if (pointer + hucre * 2 > sayfa.length) return false;
    const cocuklar: number[] = [];
    for (let i = 0; i < hucre; i++) {
      const hOf = sayfa.readUInt16BE(pointer + i * 2);
      if (hOf >= sayfa.length) return false;
      if (ic) {
        if (hOf + 4 > sayfa.length) return false;
        cocuklar.push(sayfa.readUInt32BE(hOf));
      } else {
        const yuk = hucreYuku(dosya, sayfa, hOf, usable, sayfaBoyutu, reserved);
        if (!yuk) return false;
        const kayit = kayitCoz(yuk, enc);
        if (kayit && kayit.tur === "table") tablolar.push(kayit.ad);
      }
    }
    if (ic) {
      cocuklar.push(sayfa.readUInt32BE(bas + 8));
      for (const c of cocuklar) if (!yuru(c)) return false;
    }
    return true;
  };
  return yuru(1) ? tablolar : null;
}

export function rea_sqlite_snapshot(yol: string) {
  if (!yol) return engel("yol boş");
  if (!existsSync(yol)) return engel(`dosya yok: ${yol}`);
  let bilgi;
  try { bilgi = statSync(yol); } catch { return engel(`dosya yok: ${yol}`); }
  if (!bilgi.isFile()) return engel("sqlite dosyası değil");
  const b = readFileSync(yol);
  if (b.length < 100 || !b.subarray(0, 16).equals(SIHIR)) return engel("SQLite sihiri yok");
  const sayfaBoyutu = sayfaBoyutuOku(b);
  if (!sayfaBoyutu || b.length < sayfaBoyutu) return engel("SQLite sayfa boyutu geçersiz");
  const reserved = b[20] ?? 0;
  if (reserved >= sayfaBoyutu) return engel("SQLite ayrılmış bayt geçersiz");
  const enc = b.readUInt32BE(56);
  if (enc !== 1 && enc !== 2 && enc !== 3) return engel("SQLite metin kodlaması yok");
  const tablolar = semaTablolari(b, sayfaBoyutu, reserved, enc);
  if (!tablolar) return engel("SQLite şema sayfası çözülemedi");
  return { ok: true as const, arac: "rea_sqlite_snapshot" as const, dosya: yol, sayfaBoyutu, tablolar };
}
