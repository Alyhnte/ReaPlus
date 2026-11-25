// Dalga 19: angr / AFL++ / LLDB / WinDbg TTD yoklamalari.
// Ikili yoksa, stdout sozlesmesi tutmazsa veya cikis 0 degilse capability_unsupported.
// Basarisiz surecten sayi uydurulmaz. Hedef dosyaya yazilmaz.
//
// Cagri sozlesmesi (sahte ikili argumanlari yok sayabilir):
// - rea_angr_explore: REA_ANGR_BIN veya PATH'teki `python` — `<bin> --explore <path>`
//   stdout tek JSON satir: {"ok":true,"paths":N,"constraints":M}
// - rea_afl_fuzz: yalniz REA_AFL_BIN — `<bin> --version` (hedef yok, kampanya yok)
//   stdout: "afl-fuzz++…" ve "execs_done : N"
// - rea_lldb_script: yalniz REA_LLDB_BIN — `<bin> --version` (attach yok)
//   stdout: "stop reason = …"
// - rea_ttd_info: yalniz REA_TTD_BIN — `<bin> --version` (time-travel oturumu yok)
//   stdout: "ModuleCount: N"
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { delimiter, join } from "node:path";

export const RESEARCH_PROBE_TIMEOUT_MS = 4000;

export const AFL_FUZZ_ARGS = ["--version"] as const;
export const LLDB_SCRIPT_ARGS = ["--version"] as const;
export const TTD_INFO_ARGS = ["--version"] as const;

export function ANGR_EXPLORE_ARGS(yol: string): readonly string[] {
  return ["--explore", yol];
}

type Engel = { ok: false; code: "capability_unsupported"; neden: string };
const engel = (neden: string): Engel => ({ ok: false, code: "capability_unsupported", neden });

function dosyaMi(p: string): boolean {
  try { return statSync(p).isFile(); } catch { return false; }
}

function pathIkili(ad: string): string | null {
  const dizinler = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  const uzantilar = ["", ".exe", ".cmd", ".bat", ".com"];
  for (const d of dizinler) {
    for (const uz of uzantilar) {
      const p = join(d, `${ad}${uz}`);
      if (dosyaMi(p)) return p;
    }
  }
  return null;
}

function envIkili(envAd: string, pathYedek?: string): string | null {
  const ozel = process.env[envAd]?.trim();
  if (ozel) return dosyaMi(ozel) ? ozel : null;
  if (pathYedek) return pathIkili(pathYedek);
  return null;
}

function calistir(bin: string, args: readonly string[]) {
  const opts = { encoding: "utf8" as const, windowsHide: true, timeout: RESEARCH_PROBE_TIMEOUT_MS };
  if (process.platform === "win32" && /\.(cmd|bat)$/i.test(bin)) {
    const satir = [bin, ...args].map((s) => (/[\s"&|<>^]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s)).join(" ");
    const r = spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/c", satir], opts);
    if (r.error && (r.error as NodeJS.ErrnoException).code === "ETIMEDOUT" && r.pid) {
      spawnSync("taskkill", ["/PID", String(r.pid), "/T", "/F"], { windowsHide: true });
    }
    return r;
  }
  return spawnSync(bin, args as string[], opts);
}

function cikti(bin: string, args: readonly string[], yokNeden: string) {
  const r = calistir(bin, args);
  if (r.error || r.status !== 0) return { ok: false as const, neden: yokNeden };
  return { ok: true as const, stdout: String(r.stdout ?? "") };
}

function jsonSatir(stdout: string): Record<string, unknown> | null {
  const adaylar = [stdout.trim(), ...stdout.split(/\r?\n/).map((s) => s.trim())];
  for (const s of adaylar) {
    if (!s.startsWith("{")) continue;
    try {
      const v: unknown = JSON.parse(s);
      if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
    } catch { /* sonraki satir */ }
  }
  return null;
}

function sayiMi(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function rea_angr_explore(yol: string) {
  if (!yol || !yol.trim()) return engel("angr yolu boş");
  const bin = envIkili("REA_ANGR_BIN", "python");
  if (!bin) return engel("angr yok (REA_ANGR_BIN veya PATH python)");
  const r = cikti(bin, ANGR_EXPLORE_ARGS(yol), "angr çalışmadı veya çıkış 0 değil");
  if (!r.ok) return engel(r.neden);
  const json = jsonSatir(r.stdout);
  if (!json || json.ok !== true || !sayiMi(json.paths) || !sayiMi(json.constraints)) {
    return engel("angr stdout tek JSON satır değil");
  }
  return {
    ok: true as const,
    arac: "rea_angr_explore" as const,
    paths: json.paths,
    constraints: json.constraints,
  };
}

export function rea_afl_fuzz() {
  const bin = envIkili("REA_AFL_BIN");
  if (!bin) return engel("afl yok (REA_AFL_BIN)");
  const r = cikti(bin, AFL_FUZZ_ARGS, "afl çalışmadı veya çıkış 0 değil");
  if (!r.ok) return engel(r.neden);
  const surum = r.stdout.match(/afl-fuzz\+\+[0-9][0-9A-Za-z.]*/);
  const execs = r.stdout.match(/execs_done\s*:\s*(\d+)/);
  if (!surum || !execs) return engel("afl stdout execs_done satırı yok");
  return {
    ok: true as const,
    arac: "rea_afl_fuzz" as const,
    version: surum[0],
    execs_done: Number(execs[1]),
  };
}

export function rea_lldb_script() {
  const bin = envIkili("REA_LLDB_BIN");
  if (!bin) return engel("lldb yok (REA_LLDB_BIN)");
  const r = cikti(bin, LLDB_SCRIPT_ARGS, "lldb çalışmadı veya çıkış 0 değil");
  if (!r.ok) return engel(r.neden);
  const m = r.stdout.match(/stop reason = (.+)/);
  const stop = m?.[1]?.trim();
  if (!stop) return engel("lldb stdout stop reason yok");
  return { ok: true as const, arac: "rea_lldb_script" as const, stop_reason: stop };
}

export function rea_ttd_info() {
  const bin = envIkili("REA_TTD_BIN");
  if (!bin) return engel("ttd yok (REA_TTD_BIN)");
  const r = cikti(bin, TTD_INFO_ARGS, "ttd çalışmadı veya çıkış 0 değil");
  if (!r.ok) return engel(r.neden);
  const m = r.stdout.match(/ModuleCount:\s*(\d+)/);
  if (!m) return engel("ttd stdout ModuleCount yok");
  return { ok: true as const, arac: "rea_ttd_info" as const, module_count: Number(m[1]) };
}
