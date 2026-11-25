// rea-domains/wasm-evm: Go metin taraması + saf ELF/gadget okuma (pwntools yok).
import { existsSync, readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
export type ReaGpResult =
  | { ok: true; tool: string; summary: string; details?: unknown }
  | { ok: false; code: "capability_unsupported"; reason: string };

function destekYok(reason: string): ReaGpResult {
  return { ok: false, code: "capability_unsupported", reason };
}

// Go.mod özeti: module + go directive satırlarını çeker.
export function rea_go_module(gomod: string): ReaGpResult {
  const mod = gomod.match(/^module\s+(\S+)/m)?.[1];
  const ver = gomod.match(/^go\s+(\S+)/m)?.[1];
  if (!mod) return { ok: false, code: "capability_unsupported", reason: "go.mod parse edilemedi" };
  return { ok: true, tool: "rea_go_module", summary: `${mod} (go ${ver ?? "?"})`, details: { mod, ver } };
}

// Go build version dizesi: "go1.22..." kalıbını arar.
export function rea_go_version(binHead: string): ReaGpResult {
  const m = binHead.match(/go1\.\d+(\.\d+)?/);
  if (!m) return { ok: false, code: "capability_unsupported", reason: "go version izi yok" };
  return { ok: true, tool: "rea_go_version", summary: m[0], details: { version: m[0] } };
}

// sniff.ts ile aynı kanonik adlar; import döngüsü olmasın diye kopya.
const ELF_MACHINE: Readonly<Record<number, string>> = {
  2: "sparc", 3: "x86", 8: "mips", 20: "ppc", 21: "ppc64", 22: "s390",
  40: "arm", 43: "sparcv9", 62: "x86-64", 164: "hexagon", 183: "aarch64",
  243: "risc-v", 247: "bpf", 258: "loongarch",
};
const ET_NAME: Readonly<Record<number, string>> = { 1: "ET_REL", 2: "ET_EXEC", 3: "ET_DYN", 4: "ET_CORE" };
const PT_LOAD = 1;
const PT_DYNAMIC = 2;
const PT_GNU_STACK = 0x6474e551;
const PT_GNU_RELRO = 0x6474e552;
const PF_X = 1;
const DT_NULL = 0n;
const DT_FLAGS = 30n;
const DT_FLAGS_1 = 0x6ffffffbn;
const DF_BIND_NOW = 0x8n;
const DF_1_NOW = 0x1n;
// Gerçek ELF'lerde birkaç düzine program başlığı olur; PN_XNUM (0xffff) ve
// daha büyük sayılar burada section header'dan çözülmez.
const MAX_PHNUM = 512;

function readU(buf: Buffer, off: number, size: number, be: boolean): bigint | null {
  if (off < 0 || off + size > buf.length) return null;
  if (size === 2) return BigInt(be ? buf.readUInt16BE(off) : buf.readUInt16LE(off));
  if (size === 4) return BigInt(be ? buf.readUInt32BE(off) : buf.readUInt32LE(off));
  if (size === 8) {
    const hi = be ? buf.readUInt32BE(off) : buf.readUInt32LE(off + 4);
    const lo = be ? buf.readUInt32BE(off + 4) : buf.readUInt32LE(off);
    return (BigInt(hi) << 32n) | BigInt(lo);
  }
  return null;
}

interface Phdr { type: number; flags: number; offset: number; filesz: number }

function readPhdr(buf: Buffer, off: number, elf64: boolean, be: boolean): Phdr | null {
  if (elf64) {
    const type = readU(buf, off, 4, be);
    const flags = readU(buf, off + 4, 4, be);
    const offset = readU(buf, off + 8, 8, be);
    const filesz = readU(buf, off + 32, 8, be);
    if (type === null || flags === null || offset === null || filesz === null) return null;
    if (offset > BigInt(Number.MAX_SAFE_INTEGER) || filesz > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    return { type: Number(type), flags: Number(flags), offset: Number(offset), filesz: Number(filesz) };
  }
  const type = readU(buf, off, 4, be);
  const offset = readU(buf, off + 4, 4, be);
  const filesz = readU(buf, off + 16, 4, be);
  const flags = readU(buf, off + 24, 4, be);
  if (type === null || flags === null || offset === null || filesz === null) return null;
  return { type: Number(type), flags: Number(flags), offset: Number(offset), filesz: Number(filesz) };
}

// BIND_NOW yoksa false; segment okunamazsa null (tam RELRO uydurulmaz).
function dynamicBindNow(buf: Buffer, ph: Phdr, elf64: boolean, be: boolean): boolean | null {
  const step = elf64 ? 16 : 8;
  if (ph.filesz < step || ph.offset < 0 || ph.offset + ph.filesz > buf.length) return null;
  const end = ph.offset + ph.filesz;
  for (let at = ph.offset; at + step <= end; at += step) {
    const tag = readU(buf, at, elf64 ? 8 : 4, be);
    const val = readU(buf, at + (elf64 ? 8 : 4), elf64 ? 8 : 4, be);
    if (tag === null || val === null) return null;
    if (tag === DT_NULL) break;
    if (tag === DT_FLAGS && (val & DF_BIND_NOW) !== 0n) return true;
    if (tag === DT_FLAGS_1 && (val & DF_1_NOW) !== 0n) return true;
  }
  return false;
}

// ELF başlığı + program başlıkları: PIE/NX/RELRO tahmin edilmez, bayttan okunur.
export function rea_pwn_elf_layout(elfPath: string): ReaGpResult {
  if (!elfPath) return destekYok("elf yolu boş");
  if (!existsSync(elfPath)) return destekYok("dosya yok");
  let buf: Buffer;
  try { buf = readFileSync(elfPath); } catch (e) { return destekYok(`elf okunamadı: ${(e as Error).message}`); }
  if (buf.length < 4 || buf[0] !== 0x7f || buf[1] !== 0x45 || buf[2] !== 0x4c || buf[3] !== 0x46) return destekYok("not an ELF file");
  if (buf.length < 16) return destekYok("truncated ELF header");
  const cls = buf[4];
  const data = buf[5];
  if (cls !== 1 && cls !== 2) return destekYok("unsupported ELF class");
  if (data !== 1 && data !== 2) return destekYok("unsupported ELF endian");
  const elf64 = cls === 2;
  const be = data === 2;
  const headerSize = elf64 ? 64 : 52;
  const phentsizeOff = elf64 ? 54 : 42;
  const phnumOff = elf64 ? 56 : 44;
  const phoffOff = elf64 ? 32 : 28;
  const phoffSize = elf64 ? 8 : 4;
  if (buf.length < headerSize) return destekYok("truncated ELF header");
  const eType = Number(readU(buf, 16, 2, be));
  const eMachine = Number(readU(buf, 18, 2, be));
  const phoff = readU(buf, phoffOff, phoffSize, be);
  const phentsize = Number(readU(buf, phentsizeOff, 2, be));
  const phnum = Number(readU(buf, phnumOff, 2, be));
  if (phoff === null) return destekYok("truncated ELF header");
  if (phnum > MAX_PHNUM) return destekYok(`program header count ${phnum} is absurd`);
  const expectEnt = elf64 ? 56 : 32;
  if (phentsize < expectEnt) return destekYok("truncated ELF program header");
  if (phoff > BigInt(Number.MAX_SAFE_INTEGER)) return destekYok("truncated ELF program header");
  const tableEnd = phoff + BigInt(phnum) * BigInt(phentsize);
  if (phnum > 0 && (phoff < 0n || tableEnd > BigInt(buf.length))) return destekYok("truncated ELF program header");
  const phdrs: Phdr[] = [];
  for (let i = 0; i < phnum; i++) {
    const ph = readPhdr(buf, Number(phoff) + i * phentsize, elf64, be);
    if (!ph) return destekYok("truncated ELF program header");
    phdrs.push(ph);
  }
  const loads = phdrs.filter((p) => p.type === PT_LOAD).length;
  const stacks = phdrs.filter((p) => p.type === PT_GNU_STACK);
  const nx = stacks.length === 0 ? null : !stacks.some((p) => (p.flags & PF_X) !== 0);
  const relroSeg = phdrs.some((p) => p.type === PT_GNU_RELRO);
  let relro: "full" | "partial" | "none" | "unknown" = "none";
  if (relroSeg) {
    const dynamics = phdrs.filter((p) => p.type === PT_DYNAMIC);
    if (dynamics.length === 0) relro = "partial";
    else {
      let bind = false;
      let unread = false;
      for (const d of dynamics) {
        const got = dynamicBindNow(buf, d, elf64, be);
        if (got === null) unread = true;
        else if (got) bind = true;
      }
      relro = bind ? "full" : unread ? "unknown" : "partial";
    }
  }
  const eName = ET_NAME[eType] ?? "unknown";
  const machine = ELF_MACHINE[eMachine];
  const elfClass = elf64 ? 64 : 32;
  const details: Record<string, unknown> = {
    class: elfClass,
    endian: be ? "big" : "little",
    e_type: eName,
    e_machine: eMachine,
    ...(machine ? { machine } : {}),
    pie: eType === 3,
    nx,
    relro,
    loads,
  };
  return { ok: true, tool: "rea_pwn_elf_layout", summary: `${eName} class=${elfClass} pie=${eType === 3} nx=${nx} relro=${relro} loads=${loads}`, details };
}

const RET_MNEM = /^(ret|retn|retf)$/i;

function retIleBiter(ins: string): boolean {
  const parts = ins.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return false;
  return RET_MNEM.test(parts[0]) || RET_MNEM.test(parts[parts.length - 1]);
}

// Harf-only mnemonic'i yutmamak için adres jetonunda rakam veya 0x şart.
function adresSoy(line: string): string {
  return line.replace(/^(?:0x[0-9a-fA-F]+|[0-9a-fA-F]*[0-9][0-9a-fA-F]*)(?::\s*|\s+)/i, "");
}

// Gadget: ret/retn/retf ile biten 1..5 komut. "gadget:" satırı tek başına sayılmaz.
export function rea_pwn_gadgets(hintText: string): ReaGpResult {
  const ins: string[] = [];
  for (const raw of String(hintText ?? "").split(/\r?\n/)) {
    const line = adresSoy(raw.trim());
    if (!line) continue;
    for (const part of line.split(";")) {
      const p = part.trim();
      if (p) ins.push(p);
    }
  }
  const gadgets: { text: string }[] = [];
  let start = 0;
  for (let i = 0; i < ins.length; i++) {
    if (!retIleBiter(ins[i])) continue;
    const from = Math.max(start, i - 4);
    gadgets.push({ text: ins.slice(from, i + 1).join("; ") });
    start = i + 1;
  }
  if (!gadgets.length) return destekYok("no ret-terminated gadget in the disassembly text");
  return {
    ok: true, tool: "rea_pwn_gadgets", summary: `${gadgets.length} gadget`,
    details: { n: gadgets.length, gadgets: gadgets.slice(0, 32) },
  };
}

// Go pclntab izi: buildid + pclnametab + fonksiyon tahmini (tamamen offline).
export function rea_go_pclntab(yol: string): ReaGpResult {
  // Yoksa erken kapı: dosya erişimi şart.
  if (!yol || !existsSync(yol)) return { ok: false, code: "capability_unsupported", reason: "dosya yok" };
  // Ham baytı latin1 metne çevir: Go izleri ASCII'dir.
  const metin = readFileSync(yol).toString("latin1");
  // Buildid kalıbı: go1.21 / go1.22.1 gibi.
  const buildid = metin.match(/go1\.\d+(\.\d+)?/)?.[0];
  // pclntab/funcnametab bayrakları: Go runtime tablo adları.
  const pclntab = metin.includes("gopclntab") || metin.includes("pclntab");
  const pclnametab = metin.includes("pclnametab") || metin.includes("funcnametab");
  // Üçü de yoksa Go izi yoktur.
  if (!buildid && !pclntab && !pclnametab) return { ok: false, code: "capability_unsupported", reason: "go pclntab izi yok" };
  // Fonksiyon tahmini: .func sembolleri + .go: satırları + func sayımı.
  const funcs = metin.match(/[A-Za-z0-9_/.@-]+\.func[A-Za-z0-9_.]*/g) ?? [];
  const gosat = metin.match(/\.go:\d+/g) ?? [];
  const tahmin = Math.max(funcs.length, gosat.length, metin.split("func").length - 1);
  return { ok: true, tool: "rea_go_pclntab", summary: `${buildid ?? "?"} pclntab=${pclntab ? "var" : "yok"} ~${tahmin} func`, details: { buildid, pclntab, pclnametab, tahminiFonksiyon: tahmin } };
}

// Go vendor/modül yolları: ilk 100 benzersiz yol (tamamen offline).
export function rea_go_vendor(yol: string): ReaGpResult {
  // Yoksa erken kapı.
  if (!yol || !existsSync(yol)) return { ok: false, code: "capability_unsupported", reason: "dosya yok" };
  // latin1 metin: vendor öneki ve bilinen domain kalıpları aranır.
  const metin = readFileSync(yol).toString("latin1");
  const ham = [...metin.matchAll(/(?:vendor\/|github\.com\/|golang\.org\/|gopkg\.in\/)[A-Za-z0-9_\-/.]+/g)].map((m) => m[0]);
  // Tekille + ilk 100 ile kırp.
  const yollar = [...new Set(ham)].slice(0, 100);
  if (!yollar.length) return { ok: false, code: "capability_unsupported", reason: "vendor/modül yolu yok" };
  return { ok: true, tool: "rea_go_vendor", summary: `${yollar.length} yol`, details: { yollar, sayi: yollar.length } };
}

// --- Go derinliği: pclntab fonksiyon + dosya:satır eşlemesi (saf TS, yürütme yok) ---
// Go sinyali: go1.x dizesi ya da pclntab/funcnametab tablo adları.
function goSinyalVarMi(metin: string): boolean {
  return /go1\.\d+/.test(metin) || metin.includes("gopclntab") || metin.includes("pclntab") || metin.includes("funcnametab");
}
// Dış araç kapısı: önce env yolu, yoksa PATH (where/which). Çalıştırma yok, yalnız konum.
function goAracBul(envAd: string, adaylar: string[]): string | null {
  const ozel = process.env[envAd];
  if (ozel) return existsSync(ozel) ? ozel : null;
  const prob = process.platform === "win32" ? "where" : "which";
  for (const bin of adaylar) {
    try {
      const r = spawnSync(prob, [bin], { stdio: "ignore", timeout: 5000 });
      if (r.status === 0) return bin;
    } catch { /* sonraki aday */ }
  }
  return null;
}
export interface GoEsleme { fonksiyon: string | null; dosya: string; satir: number }
// Fonksiyon + dosya:satır: ofsetli tarama, her satır en yakın önceki func ile eşlenir
// (4KB yakınlık heuristic; sembol tablosu çözümü değil, notta belirtilir).
export function rea_go_funclines(yol: string): ReaGpResult {
  if (!yol || !existsSync(yol)) return { ok: false, code: "capability_unsupported", reason: "dosya yok" };
  const metin = readFileSync(yol).toString("latin1");
  if (!goSinyalVarMi(metin)) return { ok: false, code: "capability_unsupported", reason: "go sinyali yok (go1.x/pclntab bulunamadı)" };
  const funclar: { ad: string; at: number }[] = [];
  for (const m of metin.matchAll(/[A-Za-z0-9_/.@-]+\.func[A-Za-z0-9_.]*/g)) funclar.push({ ad: m[0], at: m.index ?? 0 });
  const satirlar: { dosya: string; satir: number; at: number }[] = [];
  for (const m of metin.matchAll(/([A-Za-z0-9_/.@-]+\.go):(\d+)/g))
    satirlar.push({ dosya: m[1] as string, satir: Number(m[2]), at: m.index ?? 0 });
  if (!funclar.length && !satirlar.length) return { ok: false, code: "capability_unsupported", reason: "go satır izi yok" };
  const fonksiyonlar = [...new Set(funclar.map((f) => f.ad))].slice(0, 200);
  const dosyaSatir = [...new Set(satirlar.map((s) => `${s.dosya}:${s.satir}`))].slice(0, 200);
  const esleme: GoEsleme[] = satirlar.slice(0, 200).map((s) => {
    let once: { ad: string; at: number } | null = null;
    for (const f of funclar) if (f.at <= s.at && s.at - f.at <= 4096 && (!once || f.at > once.at)) once = f;
    return { fonksiyon: once?.ad ?? null, dosya: s.dosya, satir: s.satir };
  });
  return {
    ok: true, tool: "rea_go_funclines", summary: `${fonksiyonlar.length} func ${esleme.length} eşleme`,
    details: { fonksiyonlar, dosyaSatir, esleme, eslemeNotu: "yakınlık heuristic (4KB pencere), sembol tablosu çözümü değil" },
  };
}
// GoReSym: araç yoksa dürüst kapı + kurulum ipucu; varsa timeout'lu gerçek çağrı.
export function rea_go_goresym(yol: string): ReaGpResult {
  if (!yol || !existsSync(yol)) return { ok: false, code: "capability_unsupported", reason: "dosya yok" };
  const metin = readFileSync(yol).toString("latin1");
  if (!goSinyalVarMi(metin)) return { ok: false, code: "capability_unsupported", reason: "go sinyali yok (go1.x/pclntab bulunamadı)" };
  const arac = goAracBul("REA_GORESYM_BIN", ["GoReSym", "goresym"]);
  if (!arac) return { ok: false, code: "capability_unsupported", reason: "GoReSym yok (kurulum: https://github.com/mandiant/GoReSym ; bulunan exe yolunu REA_GORESYM_BIN ile ver)" };
  try {
    const cikti = execFileSync(arac, ["-f", yol], { encoding: "utf8", timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
    return { ok: true, tool: "rea_go_goresym", summary: "goresym çıktısı", details: { cikti: String(cikti).slice(0, 4000) } };
  } catch (e) {
    return { ok: false, code: "capability_unsupported", reason: `GoReSym çalışmadı: ${(e as Error)?.message ?? e}` };
  }
}

// --- Go buildinfo derinliği: build-id + modül bağımlılık listesi (saf metin okuma) ---
// Biçim (Go debug/buildinfo): "Go buildinf:" işaretinden sonra tab-ayraçlı satırlar:
//   path\t<ana paket yolu> | mod\t<yol>\t<surum>[\t<ozet>] | dep\t<yol>\t<surum>\t<ozet>.
// Blok ilk yabancı satırda biter; "=>" (replace) satırları atlanır. ELF not/sembol
// çözümü değildir — bu sınır `not` alanında belirtilir.
export interface GoModul { yol: string; surum: string }
export function rea_go_buildinfo(yol: string): ReaGpResult {
  if (!yol || !existsSync(yol)) return { ok: false, code: "capability_unsupported", reason: "dosya yok" };
  const metin = readFileSync(yol).toString("latin1");
  if (!goSinyalVarMi(metin)) return { ok: false, code: "capability_unsupported", reason: "go sinyali yok (go1.x/pclntab bulunamadı)" };
  const surum = metin.match(/go1\.\d+(\.\d+)?/)?.[0] ?? null;
  const sinirliNot = "tam modül grafiği için `go version -m` ya da GoReSym";
  const isaret = metin.indexOf("Go buildinf:");
  if (isaret < 0) {
    return {
      ok: true, tool: "rea_go_buildinfo", summary: `${surum ?? "?"} buildinfo yok (sınırlı)`,
      details: {
        buildid: surum, goSurumu: surum, modul: null, anaModul: null,
        moduller: [] as GoModul[], modulSayisi: 0, sinirli: true,
        not: `buildinfo bölümü yok (sınırlı: yalnız sürüm izi); ${sinirliNot}`,
      },
    };
  }
  const satirlar = metin.slice(isaret).split("\n").slice(1, 502);
  let modul: string | null = null;
  let anaModul: GoModul | null = null;
  const moduller: GoModul[] = [];
  const gorulen = new Set<string>();
  let blokBozuk = false;
  let satirGordu = false;
  for (const ham of satirlar) {
    const satir = ham.replace(/[\0\r]+$/g, "");
    if (!satir) continue;
    const parca = satir.split("\t");
    const bas = parca[0];
    if (bas !== "path" && bas !== "mod" && bas !== "dep" && bas !== "=>") break; // blok bitti
    satirGordu = true;
    if (bas === "path") {
      if (modul === null) modul = (parca[1] ?? "").trim() || null;
    } else if (bas === "mod") {
      if (!anaModul) anaModul = { yol: (parca[1] ?? "").trim(), surum: (parca[2] ?? "").trim() };
    } else if (bas === "dep") {
      const y = (parca[1] ?? "").trim();
      const s = (parca[2] ?? "").trim();
      if (!y) { blokBozuk = true; continue; }
      if (!gorulen.has(y)) {
        gorulen.add(y);
        moduller.push({ yol: y, surum: s });
        if (moduller.length >= 200) break;
      }
    }
    // "=>" (replace) satırları blok akışını bozmaz, kayda alınmaz.
  }
  const sinirli = !satirGordu || blokBozuk;
  return {
    ok: true, tool: "rea_go_buildinfo",
    summary: `${surum ?? "?"} modul=${moduller.length}${sinirli ? " sinirli" : ""}`,
    details: {
      buildid: surum, goSurumu: surum, modul, anaModul, moduller,
      modulSayisi: moduller.length, sinirli,
      not: sinirli
        ? `buildinfo işareti var ama blok çözülemedi (sınırlı); ${sinirliNot}`
        : `metin taraması (ELF not/sembol çözümü değil); ${sinirliNot}`,
    },
  };
}
