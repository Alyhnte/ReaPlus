// rea-domains/wasm-evm: 16-bit DOS + MIPS/PSP köprü iskeleti (offline)
// DOS MZ başlığı ve MIPS/PSP profili saf TS ile taranır, harici disassembler yok.
export type ReaDosMipsResult =
  | { ok: true; tool: string; summary: string; details?: unknown }
  | { ok: false; code: "capability_unsupported"; reason: string };
// Ortam kapısı: DOS profili için ham bayt erişimi gerekir.
function needBytes(buf: Uint8Array): ReaDosMipsResult | null {
  // Boş ya da çok kısa girdi disassembly için yetersizdir.
  if (!buf || buf.length < 64) {
    return { ok: false, code: "capability_unsupported", reason: "ham bayt yok/çok kısa" };
  }
  return null;
}

// MZ başlığı kontrolü: "MZ" + e_lfanew okuması (iskelet).
export function rea_dos_mz(buf: Uint8Array): ReaDosMipsResult {
  const gate = needBytes(buf);
  if (gate) return gate;
  // İlk iki bayt 0x4D 0x5A değilse DOS binary değildir.
  if (buf[0] !== 0x4d || buf[1] !== 0x5a) {
    return { ok: false, code: "capability_unsupported", reason: "MZ imzası yok" };
  }
  // e_lfanew LE u32 (0x3C); iskelet sadece aralık kontrolü yapar.
  const eLfanew = buf[0x3c] | (buf[0x3d] << 8) | (buf[0x3e] << 16) | (buf[0x3f] << 24);
  if (eLfanew < 0 || eLfanew >= buf.length) return { ok: false, code: "capability_unsupported", reason: "e_lfanew aralık dışı" };
  return { ok: true, tool: "rea_dos_mz", summary: `MZ ok, e_lfanew=${eLfanew}`, details: { eLfanew } };
}

// INT 21h taraması: 0xCD 0x21 dizilimini sayar (DOS syscall sinyali).
export function rea_dos_int21(buf: Uint8Array): ReaDosMipsResult {
  const gate = needBytes(buf);
  if (gate) return gate;
  // 16-bit DOS'ta CD 21 en yaygın servis çağrısıdır.
  let hits = 0;
  for (let i = 0; i + 1 < buf.length; i++) if (buf[i] === 0xcd && buf[i + 1] === 0x21) hits++;
  if (!hits) return { ok: false, code: "capability_unsupported", reason: "INT 21h bulunamadı" };
  return { ok: true, tool: "rea_dos_int21", summary: `${hits} INT 21h`, details: { hits } };
}

// MIPS fonksiyon ön-taraması: JAL (0x0Cxxxxxx) sayımı iskeleti.
export function rea_mips_funcs(buf: Uint8Array): ReaDosMipsResult {
  const gate = needBytes(buf);
  if (gate) return gate;
  // Big-endian JAL opcode üst 6 biti 000011 (0x0C) kontrolü.
  let jal = 0;
  for (let i = 0; i + 3 < buf.length; i += 4) if ((buf[i] >> 2) === 0x03) jal++;
  if (!jal) return { ok: false, code: "capability_unsupported", reason: "MIPS JAL yok" };
  return { ok: true, tool: "rea_mips_funcs", summary: `${jal} JAL adayı`, details: { jal } };
}

function oku16(buf: Uint8Array, o: number, be: boolean): number {
  const a = buf[o] ?? 0;
  const b = buf[o + 1] ?? 0;
  return be ? (a << 8) | b : a | (b << 8);
}

function oku32(buf: Uint8Array, o: number, be: boolean): number {
  const a = buf[o] ?? 0;
  const b = buf[o + 1] ?? 0;
  const c = buf[o + 2] ?? 0;
  const d = buf[o + 3] ?? 0;
  return (be ? (a * 0x1000000 + b * 0x10000 + c * 0x100 + d) : (a + b * 0x100 + c * 0x10000 + d * 0x1000000)) >>> 0;
}

// ELF32, e_machine EM_MIPS (8). e_entry ve e_flags dosyanin kendi endian degerinden okunur.
export function okuElfMips(buf: Uint8Array): { machine: number; entry: number; flags: number; endian: "le" | "be" } | null {
  if (!buf || buf.length < 52) return null;
  if (buf[0] !== 0x7f || buf[1] !== 0x45 || buf[2] !== 0x4c || buf[3] !== 0x46) return null;
  if (buf[4] !== 1) return null;
  const be = buf[5] === 2;
  if (buf[5] !== 1 && !be) return null;
  const machine = oku16(buf, 18, be);
  if (machine !== 8) return null;
  return { machine, entry: oku32(buf, 24, be), flags: oku32(buf, 36, be), endian: be ? "be" : "le" };
}

// PSP profil özeti: DOS + MIPS bulgularını tek kayda indirger.
// ELF basligi varsa machine/entry/flags dosyadan gelir. JAL listesi fonksiyon degildir; iskelet true kalir.
export function rea_mips_psp_profile(buf: Uint8Array): ReaDosMipsResult {
  const dos = rea_dos_int21(buf);
  const mips = rea_mips_funcs(buf);
  const elf = okuElfMips(buf);
  if (!dos.ok && !mips.ok && !elf) {
    return { ok: false, code: "capability_unsupported", reason: "DOS+MIPS sinyali yok" };
  }
  return {
    ok: true,
    tool: "rea_mips_psp_profile",
    summary: "DOS/MIPS profil iskeleti",
    details: { dos, mips, iskelet: true, ...(elf ? { elf } : {}) },
  };
}
