// BrowserWindow kurucu secenekleri: Electron acik dokumanindaki anahtar tablosu.
// https://www.electronjs.org/docs/latest/api/browser-window
// Anahtar siniflandirilir; pencere acilmaz.
export const ELECTRON_WINDOW_TOOLS = ["rea_electron_window"] as const;

export const BROWSER_WINDOW_OPTIONS: readonly string[] = [
  "width",
  "height",
  "x",
  "y",
  "useContentSize",
  "center",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "resizable",
  "movable",
  "minimizable",
  "maximizable",
  "closable",
  "focusable",
  "alwaysOnTop",
  "fullscreen",
  "fullscreenable",
  "simpleFullscreen",
  "skipTaskbar",
  "hiddenInMissionControl",
  "kiosk",
  "title",
  "icon",
  "show",
  "paintWhenInitiallyHidden",
  "frame",
  "parent",
  "modal",
  "acceptFirstMouse",
  "disableAutoHideCursor",
  "autoHideMenuBar",
  "enableLargerThanScreen",
  "backgroundColor",
  "hasShadow",
  "opacity",
  "darkTheme",
  "transparent",
  "type",
  "visualEffectState",
  "titleBarStyle",
  "titleBarOverlay",
  "trafficLightPosition",
  "roundedCorners",
  "thickFrame",
  "vibrancy",
  "backgroundMaterial",
  "zoomToPageWidth",
  "tabbingIdentifier",
  "webPreferences",
  "shadow",
  "accentColor",
];

const BILINEN = new Set(BROWSER_WINDOW_OPTIONS);

type Engel = { ok: false; code: "capability_unsupported"; neden: string };
const engel = (neden: string): Engel => ({ ok: false, code: "capability_unsupported", neden });

function duzNesne(v: unknown): v is Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v) as unknown;
  return p === Object.prototype || p === null;
}

export function rea_electron_window(text: string) {
  if (!text || !text.trim()) return engel("BrowserWindow JSON yok");
  let v: unknown;
  try { v = JSON.parse(text); } catch { return engel("BrowserWindow JSON değil"); }
  if (!duzNesne(v)) return engel("BrowserWindow seçenekleri nesne değil");
  const bilinen: string[] = [];
  const bilinmeyen: string[] = [];
  for (const anahtar of Object.keys(v)) {
    if (BILINEN.has(anahtar)) bilinen.push(anahtar);
    else bilinmeyen.push(anahtar);
  }
  bilinen.sort();
  bilinmeyen.sort();
  return {
    ok: true as const,
    arac: "rea_electron_window" as const,
    bilinen,
    bilinmeyen,
    calisiyor: false as const,
  };
}
