// rea-domains/wasm-evm: NativeAOT PE + Swift/ObjC dispatch iskeleti (offline)
// CLR başlığı ve ObjC/Swift selector metni saf TS ile taranır.
export type ReaAotResult =
  | { ok: true; tool: string; summary: string; details?: unknown }
  | { ok: false; code: "capability_unsupported"; reason: string };

// Ortam kapısı: PE baytı + metin segmenti gerekir.
function needPe(buf: Uint8Array): ReaAotResult | null {
  // Çok kısa girdi PE taraması için yetersizdir.
  if (!buf || buf.length < 128) {
    return { ok: false, code: "capability_unsupported", reason: "PE baytı yok/çok kısa" };
  }
  // MZ imzası yoksa yönetilen/native ayrımı yapılamaz.
  if (buf[0] !== 0x4d || buf[1] !== 0x5a) {
    return { ok: false, code: "capability_unsupported", reason: "MZ imzası yok" };
  }
  return null;
}

// NativeAOT tespiti: "RTR_" / "S_P_CoreLib" yer tutucu dizgileri arar.
export function rea_aot_detect(buf: Uint8Array, text: string): ReaAotResult {
  const gate = needPe(buf);
  if (gate) return gate;
  // Gerçek CLR header parse WP4d'de; iskelet dizi sinyali kullanır.
  const marks = ["RTR_", "S_P_CoreLib", "NativeAOT", "__managed"];
  const hit = marks.filter((m) => text.includes(m));
  if (!hit.length) return { ok: false, code: "capability_unsupported", reason: "AOT sinyali yok" };
  return { ok: true, tool: "rea_aot_detect", summary: `AOT adayı: ${hit.join(",")}`, details: { hit } };
}

// ObjC selector taraması: "+ [...]"/"- [...]" kalıplarını sayar.
export function rea_aot_objc(text: string): ReaAotResult {
  // Boş metinde dispatch tablosu aranamaz.
  if (!text) return { ok: false, code: "capability_unsupported", reason: "metin boş" };
  // Köşeli parantezli çağrılar ObjC msgSend sinyalidir.
  const re = /[+-]\s*\[[^\]]+\]/g;
  const found = text.match(re) ?? [];
  if (!found.length) return { ok: false, code: "capability_unsupported", reason: "ObjC selector yok" };
  return { ok: true, tool: "rea_aot_objc", summary: `${found.length} ObjC selector`, details: { sample: found.slice(0, 5) } };
}

// Swift dispatch taraması: "$s" mangled prefix + "dispatch" anahtarı.
export function rea_aot_swift(text: string): ReaAotResult {
  // Boş metinde Swift sembolü aranamaz.
  if (!text) return { ok: false, code: "capability_unsupported", reason: "metin boş" };
  // $s prefix Swift mangling sinyalidir (iskelet sayımı).
  const mangled = (text.match(/\$s[A-Za-z0-9_]+/g) ?? []).length;
  if (!mangled) return { ok: false, code: "capability_unsupported", reason: "Swift sembolü yok" };
  return { ok: true, tool: "rea_aot_swift", summary: `${mangled} Swift sembolü`, details: { mangled } };
}

function u16(buf: Uint8Array, o: number): number {
  return (buf[o] ?? 0) | ((buf[o + 1] ?? 0) << 8);
}

function u32(buf: Uint8Array, o: number): number {
  return ((buf[o] ?? 0) | ((buf[o + 1] ?? 0) << 8) | ((buf[o + 2] ?? 0) << 16) | ((buf[o + 3] ?? 0) << 24)) >>> 0;
}

type Bolum = { va: number; size: number; raw: number };

function rvaOfset(bolumler: readonly Bolum[], rva: number): number | null {
  for (const s of bolumler) {
    if (rva >= s.va && rva < s.va + s.size) return s.raw + (rva - s.va);
  }
  return null;
}

// IMAGE_COR20_HEADER: cb, major, minor, flags, EntryPointToken. RVA bolum tablosundan dosya ofsetine iner.
export function okuClr(buf: Uint8Array): { major: number; minor: number; flags: number; entryPoint: number } | null {
  if (!buf || buf.length < 0x40 || buf[0] !== 0x4d || buf[1] !== 0x5a) return null;
  const lfanew = u32(buf, 0x3c);
  if (lfanew <= 0 || lfanew + 24 > buf.length) return null;
  if (u32(buf, lfanew) !== 0x4550) return null;
  const coff = lfanew + 4;
  const bolumSayisi = u16(buf, coff + 2);
  const optBoy = u16(buf, coff + 16);
  const opt = coff + 20;
  if (optBoy < 96 || opt + optBoy > buf.length) return null;
  const magic = u16(buf, opt);
  const sayac = magic === 0x10b ? 92 : magic === 0x20b ? 108 : -1;
  const dizin = magic === 0x10b ? 96 : magic === 0x20b ? 112 : -1;
  if (sayac < 0 || opt + dizin + 15 * 8 > opt + optBoy) return null;
  if (u32(buf, opt + sayac) <= 14) return null;
  const com = opt + dizin + 14 * 8;
  const rva = u32(buf, com);
  const boyut = u32(buf, com + 4);
  if (rva === 0 || boyut < 24) return null;
  const bolumler: Bolum[] = [];
  const tablo = opt + optBoy;
  for (let i = 0; i < bolumSayisi; i += 1) {
    const o = tablo + i * 40;
    if (o + 40 > buf.length) return null;
    const sanal = u32(buf, o + 8);
    const ham = u32(buf, o + 16);
    bolumler.push({ va: u32(buf, o + 12), size: Math.max(sanal, ham), raw: u32(buf, o + 20) });
  }
  const off = rvaOfset(bolumler, rva);
  if (off === null || off + 24 > buf.length) return null;
  const cb = u32(buf, off);
  if (cb < 24 || off + cb > buf.length) return null;
  return { major: u16(buf, off + 4), minor: u16(buf, off + 6), flags: u32(buf, off + 16), entryPoint: u32(buf, off + 20) };
}

// Tek giriş: PE + metin ile AOT/ObjC/Swift özetini birleştirir.
// CLR basligi varsa sayilar dosyadan gelir. ObjC/Swift taramasi durdugu icin iskelet true kalir.
export function rea_aot_profile(buf: Uint8Array, text: string): ReaAotResult {
  const aot = rea_aot_detect(buf, text);
  const objc = rea_aot_objc(text);
  const swift = rea_aot_swift(text);
  const clr = okuClr(buf);
  if (!aot.ok && !objc.ok && !swift.ok && !clr) return { ok: false, code: "capability_unsupported", reason: "AOT/ObjC/Swift sinyali yok" };
  return {
    ok: true,
    tool: "rea_aot_profile",
    summary: "AOT dispatch profil iskeleti",
    details: { aot, objc, swift, iskelet: true, ...(clr ? { clr } : {}) },
  };
}
