// Dalga 19 sonrasi: dort arac kendi dosya formatini surec icinde yurutur.
// Cagiranlar: registerReaTools.ts (MCP), tests/wave19-research.test.mjs.
// Dis angr / afl-fuzz / lldb / windbg sureci yoktur. Dosyaya yazilmaz.
// Sihir bayti tutmayan veya kesik dosya capability_unsupported doner;
// yol sayisi, calistirma sayisi veya modul sayisi uydurulmaz.
import { readFileSync } from "node:fs";

const REAVM = Buffer.from("REAVM\0");
const REAFZ = Buffer.from("REAFZ\0");
const REALDB = Buffer.from("REALDB\0");
const REATD = Buffer.from("REATD\0");

const STEP_BUDGET = 4096;
const STATE_BUDGET = 64;

type Val = { k: "c"; n: number } | { k: "s"; id: number };
type State = { pc: number; stack: Val[]; constraints: number; nextId: number };
type Engel = { ok: false; code: "capability_unsupported"; neden: string };

const engel = (neden: string): Engel => ({ ok: false, code: "capability_unsupported", neden });

function oku(yol: string, neden: string): Buffer | Engel {
  if (!yol || !yol.trim()) return engel(neden);
  try {
    return readFileSync(yol);
  } catch {
    return engel(neden);
  }
}

function sihir(buf: Buffer, beklenen: Buffer): boolean {
  return buf.length >= beklenen.length && buf.subarray(0, beklenen.length).equals(beklenen);
}

function kopya(st: State, pc: number): State {
  return {
    pc,
    stack: st.stack.map((v) => ({ ...v })),
    constraints: st.constraints + 1,
    nextId: st.nextId,
  };
}

function pop(st: State): Val | null {
  return st.stack.pop() ?? null;
}

// REAVM: 0x10 INPUT, 0x01 imm PUSH, 0x02 ADD, 0x03 EQ, 0x04 hedef JZ, 0x05 HALT.
// Sembolik JZ iki yolu da acar. Biten yollarin kisit toplami doner.
function yurutReavm(code: Buffer): { paths: number; constraints: number } | Engel {
  const live: State[] = [{ pc: 0, stack: [], constraints: 0, nextId: 0 }];
  let steps = 0;
  let paths = 0;
  let constraints = 0;
  while (live.length > 0) {
    if (steps >= STEP_BUDGET || live.length > STATE_BUDGET) return engel("REAVM adım bütçesi aşıldı");
    const st = live.pop();
    if (!st) break;
    steps += 1;
    if (st.pc < 0 || st.pc >= code.length) continue;
    const op = code[st.pc] ?? 0;
    if (op === 0x05) {
      paths += 1;
      constraints += st.constraints;
      continue;
    }
    if (op === 0x10) {
      st.stack.push({ k: "s", id: st.nextId });
      st.nextId += 1;
      st.pc += 1;
      live.push(st);
      continue;
    }
    if (op === 0x01) {
      if (st.pc + 1 >= code.length) continue;
      st.stack.push({ k: "c", n: code[st.pc + 1] ?? 0 });
      st.pc += 2;
      live.push(st);
      continue;
    }
    if (op === 0x02 || op === 0x03) {
      const b = pop(st);
      const a = pop(st);
      if (!a || !b) continue;
      if (a.k === "c" && b.k === "c") {
        const n = op === 0x02 ? (a.n + b.n) & 255 : (a.n === b.n ? 1 : 0);
        st.stack.push({ k: "c", n });
      } else {
        st.stack.push({ k: "s", id: st.nextId });
        st.nextId += 1;
      }
      st.pc += 1;
      live.push(st);
      continue;
    }
    if (op === 0x04) {
      if (st.pc + 1 >= code.length) continue;
      const hedef = code[st.pc + 1] ?? 0;
      const cond = pop(st);
      if (!cond) continue;
      const sonraki = st.pc + 2;
      if (cond.k === "c") {
        st.pc = cond.n === 0 ? hedef : sonraki;
        live.push(st);
      } else {
        live.push(kopya(st, sonraki), kopya(st, hedef));
      }
      continue;
    }
  }
  return { paths, constraints };
}

export function rea_angr_explore(yol: string) {
  const buf = oku(yol, "REAVM yolu yok");
  if (!Buffer.isBuffer(buf)) return buf;
  if (!sihir(buf, REAVM)) return engel("REAVM programı değil");
  const sonuc = yurutReavm(buf.subarray(REAVM.length));
  if ("code" in sonuc) return sonuc;
  return { ok: true as const, arac: "rea_angr_explore" as const, paths: sonuc.paths, constraints: sonuc.constraints };
}

function coker(girdi: Buffer, indeks: number, deger: number, ikiBayt: boolean): boolean {
  if (girdi[indeks] !== deger) return false;
  if (!ikiBayt) return true;
  const ikinci = (indeks + 1) % girdi.length;
  return girdi[ikinci] === ((deger + 1) & 255);
}

// REAFZ: sihir, u8 indeks, u8 deger, u8 mod (1 = ikinci bayt da tutmali), u8 tohum uzunlugu, tohum.
// Her konum 0..255 denenir. Ilk cokmede durulur. Cokme yoksa tum tur sayilir.
export function rea_afl_fuzz(yol: string) {
  const buf = oku(yol, "REAFZ yolu yok");
  if (!Buffer.isBuffer(buf)) return buf;
  if (!sihir(buf, REAFZ) || buf.length < 10) return engel("REAFZ hedefi değil");
  const indeks = buf[6] ?? 0;
  const deger = buf[7] ?? 0;
  const ikiBayt = buf[8] === 1;
  const tohumUzun = buf[9] ?? 0;
  if (tohumUzun === 0 || buf.length < 10 + tohumUzun) return engel("REAFZ tohumu eksik");
  if (indeks >= tohumUzun) return engel("REAFZ çökme indeksi tohumun dışında");
  const tohum = buf.subarray(10, 10 + tohumUzun);
  let execs = 0;
  let crashes = 0;
  for (let konum = 0; konum < tohumUzun; konum += 1) {
    for (let v = 0; v < 256; v += 1) {
      const girdi = Buffer.from(tohum);
      girdi[konum] = v;
      execs += 1;
      if (coker(girdi, indeks, deger, ikiBayt)) {
        crashes += 1;
        return { ok: true as const, arac: "rea_afl_fuzz" as const, execs_done: execs, crashes };
      }
    }
  }
  return { ok: true as const, arac: "rea_afl_fuzz" as const, execs_done: execs, crashes };
}

// REALDB: sihir, u16le uzunluk, bellek. Betik: "breakpoint set --address 0xN" ve "run".
// Her bayt bir adimdir. Kesme adresinde durur; adres disindaysa imaj sonuna kadar gider.
export function rea_lldb_script(yol: string, betikYol: string) {
  const imaj = oku(yol, "REALDB yolu yok");
  if (!Buffer.isBuffer(imaj)) return imaj;
  if (!sihir(imaj, REALDB) || imaj.length < 9) return engel("REALDB imajı değil");
  const uzun = imaj.readUInt16LE(REALDB.length);
  if (imaj.length < REALDB.length + 2 + uzun) return engel("REALDB imajı kesik");
  let betik: string;
  try {
    betik = readFileSync(betikYol, "utf8");
  } catch {
    return engel("betik yok");
  }
  let bp: number | null = null;
  let run = false;
  for (const ham of betik.split(/\r?\n/)) {
    const satir = ham.trim();
    if (!satir || satir.startsWith("#")) continue;
    const m = /^breakpoint set --address 0x([0-9a-fA-F]+)$/.exec(satir);
    if (m) {
      bp = Number.parseInt(m[1] ?? "", 16);
      continue;
    }
    if (satir === "run") {
      run = true;
      continue;
    }
    return engel("betik satırı tanınmadı");
  }
  if (bp === null || !run) return engel("betikte kesme noktası ve run yok");
  let pc = 0;
  while (pc < uzun) {
    if (pc === bp) {
      return { ok: true as const, arac: "rea_lldb_script" as const, stop_reason: "breakpoint 1.1", pc };
    }
    pc += 1;
  }
  return { ok: true as const, arac: "rea_lldb_script" as const, stop_reason: "exited", pc };
}

// REATD: sihir, u16le adet, her modul u8 uzunluk + utf8 ad. Kesik kayit sayi dondurmez.
export function rea_ttd_info(yol: string) {
  const buf = oku(yol, "REATD yolu yok");
  if (!Buffer.isBuffer(buf)) return buf;
  if (!sihir(buf, REATD) || buf.length < REATD.length + 2) return engel("REATD izi değil");
  const adet = buf.readUInt16LE(REATD.length);
  const modules: string[] = [];
  let o = REATD.length + 2;
  for (let i = 0; i < adet; i += 1) {
    if (o >= buf.length) return engel("REATD izi kesik");
    const n = buf[o] ?? 0;
    o += 1;
    if (o + n > buf.length) return engel("REATD izi kesik");
    modules.push(buf.subarray(o, o + n).toString("utf8"));
    o += n;
  }
  return { ok: true as const, arac: "rea_ttd_info" as const, module_count: modules.length, modules };
}
