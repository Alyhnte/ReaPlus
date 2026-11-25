// Electron fuse teli: sentinel sonrasi surum + belgelenmis V1 baytlari.
// Kaynak: @electron/fuses FuseV1Options sirasi ve FuseState (0x30 kapali, 0x31 acik).
// Electron kurulmaz, pencere acilmaz.
import { existsSync, readFileSync, statSync } from "node:fs";

export const ELECTRON_FUSE_TOOLS = ["rea_electron_fuses"] as const;

export const FUSE_SENTINEL = "dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX";

// Teldeki bayt sirasi Electron'un acik FuseV1Options sirasidir.
export const FUSE_V1_NAMES = [
  "runAsNode",
  "enableCookieEncryption",
  "enableNodeOptionsEnvironmentVariable",
  "enableNodeCliInspectArguments",
  "enableEmbeddedAsarIntegrityValidation",
  "onlyLoadAppFromAsar",
  "loadBrowserProcessSpecificV8Snapshot",
  "grantFileProtocolExtraPrivileges",
] as const;

type Engel = { ok: false; code: "capability_unsupported"; neden: string };
const engel = (neden: string): Engel => ({ ok: false, code: "capability_unsupported", neden });

export function rea_electron_fuses(yol: string) {
  if (!yol) return engel("yol boş");
  if (!existsSync(yol)) return engel(`dosya yok: ${yol}`);
  let bilgi;
  try { bilgi = statSync(yol); } catch { return engel(`dosya yok: ${yol}`); }
  if (!bilgi.isFile()) return engel("fuse dosyası değil");
  const b = readFileSync(yol);
  const ix = b.indexOf(FUSE_SENTINEL);
  if (ix < 0) return engel("fuse sentinel yok");
  const bas = ix + FUSE_SENTINEL.length;
  if (bas + 1 + FUSE_V1_NAMES.length > b.length) return engel("fuse teli eksik");
  const surum = b[bas];
  if (surum !== 1) return engel(`fuse sürümü desteklenmiyor: ${surum}`);
  const fuses: { ad: string; durum: "on" | "off" }[] = [];
  for (let i = 0; i < FUSE_V1_NAMES.length; i++) {
    const bayt = b[bas + 1 + i];
    if (bayt !== 0x30 && bayt !== 0x31) return engel(`fuse baytı on/off değil: ${FUSE_V1_NAMES[i]}`);
    fuses.push({ ad: FUSE_V1_NAMES[i], durum: bayt === 0x31 ? "on" : "off" });
  }
  return { ok: true as const, arac: "rea_electron_fuses" as const, dosya: yol, surum: 1 as const, fuses };
}
