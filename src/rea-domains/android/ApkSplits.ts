// Split APK dizini: her *.apk bir zip. Merkezi dizin giris sayisi, dosya adindan
// base/split rolu, AndroidManifest veya splits XML'inden cozulebilen split adi.
// apktool calismaz.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { crc32, inflateRawSync } from "node:zlib";

export const APK_SPLIT_TOOLS = ["rea_apk_splits"] as const;

type Engel = { ok: false; code: "capability_unsupported"; neden: string };
const engel = (neden: string): Engel => ({ ok: false, code: "capability_unsupported", neden });

type Giris = { ad: string; yontem: number; comp: number; uncomp: number; crc: number; lho: number };

function eocdBul(b: Buffer): number {
  const alt = Math.max(0, b.length - 65557);
  for (let i = b.length - 22; i >= alt; i--) {
    if (b.readUInt32LE(i) === 0x06054b50) return i;
  }
  return -1;
}

function merkez(b: Buffer): Giris[] | null {
  if (b.length < 22 || b[0] !== 0x50 || b[1] !== 0x4b) return null;
  const e = eocdBul(b);
  if (e < 0) return null;
  const adet = b.readUInt16LE(e + 10);
  const off = b.readUInt32LE(e + 16);
  if (off > b.length) return null;
  const out: Giris[] = [];
  let o = off;
  for (let k = 0; k < adet; k++) {
    if (o + 46 > b.length || b.readUInt32LE(o) !== 0x02014b50) return null;
    const al = b.readUInt16LE(o + 28);
    const el = b.readUInt16LE(o + 30);
    const cl = b.readUInt16LE(o + 32);
    if (o + 46 + al + el + cl > b.length) return null;
    out.push({
      ad: b.subarray(o + 46, o + 46 + al).toString("utf8"),
      yontem: b.readUInt16LE(o + 10),
      crc: b.readUInt32LE(o + 16),
      comp: b.readUInt32LE(o + 20),
      uncomp: b.readUInt32LE(o + 24),
      lho: b.readUInt32LE(o + 42),
    });
    o += 46 + al + el + cl;
  }
  return out;
}

function coz(b: Buffer, g: Giris): Buffer | null {
  if (g.lho + 30 > b.length || b.readUInt32LE(g.lho) !== 0x04034b50) return null;
  const flags = b.readUInt16LE(g.lho + 6);
  const yontem = b.readUInt16LE(g.lho + 8);
  const nl = b.readUInt16LE(g.lho + 26);
  const el = b.readUInt16LE(g.lho + 28);
  const yerelBoy = b.readUInt32LE(g.lho + 18);
  const boy = (flags & 0x8) ? g.comp : yerelBoy;
  const bas = g.lho + 30 + nl + el;
  if (bas + boy > b.length) return null;
  const ham = b.subarray(bas, bas + boy);
  let out: Buffer;
  if (yontem === 0) out = Buffer.from(ham);
  else if (yontem === 8) {
    try { out = inflateRawSync(ham); } catch { return null; }
  } else return null;
  if ((crc32(out) >>> 0) !== g.crc) return null;
  return out;
}

function utf8Uzunluk(b: Buffer, p: number): { n: number; v: number } | null {
  if (p >= b.length) return null;
  const b0 = b[p] ?? 0;
  if ((b0 & 0x80) === 0) return { n: 1, v: b0 };
  if (p + 1 >= b.length) return null;
  return { n: 2, v: ((b0 & 0x7f) << 8) | (b[p + 1] ?? 0) };
}

function havuzOku(chunk: Buffer): string[] | null {
  if (chunk.length < 28 || chunk.readUInt16LE(0) !== 0x0001) return null;
  const header = chunk.readUInt16LE(2);
  const adet = chunk.readUInt32LE(8);
  const flags = chunk.readUInt32LE(16);
  const stringsStart = chunk.readUInt32LE(20);
  if (header < 28 || stringsStart > chunk.length) return null;
  const utf8 = (flags & 0x100) !== 0;
  const out: string[] = [];
  for (let i = 0; i < adet; i++) {
    const of = header + i * 4;
    if (of + 4 > chunk.length) return null;
    const p0 = stringsStart + chunk.readUInt32LE(of);
    if (p0 < 0 || p0 >= chunk.length) return null;
    if (!utf8) {
      if (p0 + 2 > chunk.length) return null;
      const n = chunk.readUInt16LE(p0);
      const bayt = n * 2;
      if (p0 + 2 + bayt > chunk.length) return null;
      out.push(chunk.subarray(p0 + 2, p0 + 2 + bayt).toString("utf16le"));
    } else {
      const charLen = utf8Uzunluk(chunk, p0);
      if (!charLen) return null;
      const byteLen = utf8Uzunluk(chunk, p0 + charLen.n);
      if (!byteLen) return null;
      const bas = p0 + charLen.n + byteLen.n;
      if (bas + byteLen.v > chunk.length) return null;
      out.push(chunk.subarray(bas, bas + byteLen.v).toString("utf8"));
    }
  }
  return out;
}

function dizgi(havuz: string[], ix: number): string | null {
  if (ix === 0xffffffff || ix < 0 || ix >= havuz.length) return null;
  return havuz[ix] ?? null;
}

function xmlSplitler(buf: Buffer): { manifest: string | null; hepsi: string[] } | null {
  const baslangic = buf.subarray(0, Math.min(buf.length, 64)).toString("utf8");
  if (baslangic.includes("<")) {
    const t = buf.toString("utf8");
    const hepsi = [...t.matchAll(/\b(?:android:)?split\s*=\s*"([^"]*)"/g)].map((m) => m[1] ?? "").filter(Boolean);
    return { manifest: hepsi[0] ?? null, hepsi };
  }
  if (buf.length < 8 || buf.readUInt16LE(0) !== 0x0003) return { manifest: null, hepsi: [] };
  const limit = Math.min(buf.length, buf.readUInt32LE(4));
  let o = buf.readUInt16LE(2);
  if (o < 8) o = 8;
  let havuz: string[] | null = null;
  let manifest: string | null = null;
  const hepsi: string[] = [];
  while (o + 8 <= limit) {
    const type = buf.readUInt16LE(o);
    const header = buf.readUInt16LE(o + 2);
    const size = buf.readUInt32LE(o + 4);
    if (size < 8 || o + size > limit) return null;
    if (type === 0x0001) havuz = havuzOku(buf.subarray(o, o + size));
    if (type === 0x0102 && havuz && header >= 16 && o + header + 20 <= o + size) {
      const ext = o + header;
      const eleman = dizgi(havuz, buf.readUInt32LE(ext + 4));
      const attrStart = buf.readUInt16LE(ext + 8);
      const attrSize = buf.readUInt16LE(ext + 10);
      const attrCount = buf.readUInt16LE(ext + 12);
      if (attrSize >= 20) {
        for (let i = 0; i < attrCount; i++) {
          const a = ext + attrStart + i * attrSize;
          if (a + 20 > o + size) break;
          const ad = dizgi(havuz, buf.readUInt32LE(a + 4));
          if (ad !== "split") continue;
          const ham = buf.readUInt32LE(a + 8);
          const tip = buf[a + 15];
          const veri = buf.readUInt32LE(a + 16);
          const deger = dizgi(havuz, ham) ?? (tip === 0x03 ? dizgi(havuz, veri) : null);
          if (!deger) continue;
          hepsi.push(deger);
          if (eleman === "manifest" && manifest === null) manifest = deger;
        }
      }
    }
    o += size;
  }
  return { manifest: manifest ?? hepsi[0] ?? null, hepsi };
}

function rolVeAd(dosya: string): { rol: "base" | "split" | "diger"; ad: string | null } {
  const taban = dosya.replace(/\\/g, "/").split("/").pop() ?? dosya;
  const alt = taban.toLowerCase();
  if (alt === "base.apk") return { rol: "base", ad: null };
  if (alt.startsWith("split_") && alt.endsWith(".apk")) {
    return { rol: "split", ad: taban.slice("split_".length, -".apk".length) };
  }
  return { rol: "diger", ad: null };
}

export function rea_apk_splits(yol: string) {
  if (!yol) return engel("yol boş");
  if (!existsSync(yol)) return engel(`dizin yok: ${yol}`);
  let bilgi;
  try { bilgi = statSync(yol); } catch { return engel(`dizin yok: ${yol}`); }
  if (!bilgi.isDirectory()) return engel("apk dizini değil");
  const adlar = readdirSync(yol).filter((a) => a.toLowerCase().endsWith(".apk")).sort();
  if (adlar.length === 0) return engel("dizinde apk yok");
  const apkler: {
    dosya: string;
    rol: "base" | "split" | "diger";
    ad: string | null;
    manifestSplit: string | null;
    metaSplitler: string[];
    girisSayisi: number;
  }[] = [];
  for (const dosya of adlar) {
    const b = readFileSync(join(yol, dosya));
    const m = merkez(b);
    if (!m) return engel(`zip merkezi dizin okunamadı: ${dosya}`);
    const manifestG = m.find((g) => g.ad === "AndroidManifest.xml" || g.ad.endsWith("/AndroidManifest.xml"));
    let manifestSplit: string | null = null;
    if (manifestG) {
      const xml = coz(b, manifestG);
      if (!xml) return engel(`AndroidManifest okunamadı: ${dosya}`);
      const cozum = xmlSplitler(xml);
      if (!cozum) return engel(`AndroidManifest çözülemedi: ${dosya}`);
      manifestSplit = cozum.manifest;
    }
    const metaSplitler: string[] = [];
    for (const g of m) {
      if (!/splits/i.test(g.ad) || !g.ad.toLowerCase().endsWith(".xml")) continue;
      const xml = coz(b, g);
      if (!xml) return engel(`splits metadata okunamadı: ${dosya}`);
      const cozum = xmlSplitler(xml);
      if (!cozum) return engel(`splits metadata çözülemedi: ${dosya}`);
      for (const ad of cozum.hepsi) if (!metaSplitler.includes(ad)) metaSplitler.push(ad);
    }
    const kim = rolVeAd(dosya);
    apkler.push({
      dosya,
      rol: kim.rol,
      ad: kim.ad,
      manifestSplit,
      metaSplitler,
      girisSayisi: m.length,
    });
  }
  return { ok: true as const, arac: "rea_apk_splits" as const, dizin: yol, apkler };
}
