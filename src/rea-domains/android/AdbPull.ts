// adb pull: REA_ADB_BIN veya PATH'teki adb gercekten calisir.
// Ikili yoksa capability_unsupported. Cihaz uydurulmaz.
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { delimiter, join } from "node:path";

export const ADB_PULL_TOOLS = ["rea_adb_pull"] as const;

type Engel = { ok: false; code: "capability_unsupported"; neden: string };
const engel = (neden: string): Engel => ({ ok: false, code: "capability_unsupported", neden });

function dosyaMi(p: string): boolean {
  try { return statSync(p).isFile(); } catch { return false; }
}

export function adbIkili(): string | null {
  const ozel = process.env.REA_ADB_BIN?.trim();
  if (ozel) return dosyaMi(ozel) ? ozel : null;
  const dizinler = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  const uzantilar = ["", ".exe", ".cmd", ".bat", ".com"];
  for (const d of dizinler) {
    for (const uz of uzantilar) {
      const p = join(d, `adb${uz}`);
      if (dosyaMi(p)) return p;
    }
  }
  return null;
}

function calistir(bin: string, args: string[]) {
  if (process.platform === "win32" && /\.(cmd|bat)$/i.test(bin)) {
    const satir = [bin, ...args].map((s) => (/[\s"&|<>^]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s)).join(" ");
    return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/c", satir], {
      encoding: "utf8",
      windowsHide: true,
      timeout: 20000,
    });
  }
  return spawnSync(bin, args, { encoding: "utf8", windowsHide: true, timeout: 20000 });
}

export function rea_adb_pull(uzak: string, yerel: string, seri?: string) {
  if (!uzak || !yerel) return engel("adb pull yolu boş");
  const bin = adbIkili();
  if (!bin) return engel("adb yok (REA_ADB_BIN veya PATH)");
  const args = seri ? ["-s", seri, "pull", uzak, yerel] : ["pull", uzak, yerel];
  const r = calistir(bin, args);
  if (r.error && (r.error as NodeJS.ErrnoException).code === "ENOENT") {
    return engel("adb çalıştırılamadı");
  }
  if (r.status !== 0) {
    const neden = String(r.stderr || r.error?.message || "adb pull başarısız").trim().slice(0, 500);
    return { ok: false as const, code: "adb_pull_failed" as const, cikis: r.status, neden };
  }
  if (!existsSync(yerel)) {
    return { ok: false as const, code: "adb_pull_failed" as const, cikis: 0, neden: "adb 0 döndü ama yerel dosya yok" };
  }
  const bayt = statSync(yerel).size;
  return { ok: true as const, arac: "rea_adb_pull" as const, uzak, yerel, bayt, cikis: 0 as const };
}
