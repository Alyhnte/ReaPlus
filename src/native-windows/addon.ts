// rea-plus native-windows: süreç, bütünlük ve dizin anlık görüntüsü.
// MCP yüzeyine kayıtlı değildir. win32 dışında capability_unsupported döner.
// Sahte prebuild başarısı yok: ok:true yalnız gerçek okuma tamamlanınca gelir.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export type ReaNativeSonuç =
  | { ok: true; tool: string; summary: string; veri: Record<string, unknown> }
  | { ok: false; code: "capability_unsupported"; reason: string };

const DOSYA_TAVAN = 200;

// Mandatory Label RID -> kısa ad. Sabit bir seviye varsayılmaz.
const BÜTÜNLÜK: Readonly<Record<number, string>> = {
  0x0000: "untrusted",
  0x1000: "low",
  0x2000: "medium",
  0x2100: "medium-plus",
  0x3000: "high",
  0x4000: "system",
  0x5000: "protected",
};

function desteklenmiyor(reason: string): ReaNativeSonuç {
  return { ok: false, code: "capability_unsupported", reason };
}

// Platform kapısı: win32 dışı hostta her çağrı handoff'a düşer.
function win32Kapısı(tool: string): ReaNativeSonuç | null {
  if (process.platform !== "win32") {
    return desteklenmiyor(`${tool} yalnız win32 (platform=${process.platform})`);
  }
  return null;
}

function psHata(e: unknown): string {
  if (e && typeof e === "object") {
    const err = e as { stderr?: unknown; message?: unknown };
    const stderr = typeof err.stderr === "string" ? err.stderr.trim() : "";
    if (stderr) {
      return stderr.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).slice(-4).join(" | ").slice(0, 500);
    }
    if (typeof err.message === "string" && err.message) return err.message.slice(0, 500);
  }
  return String(e).slice(0, 500);
}

// Gerçek powershell.exe. Betik UTF-16LE kodlanır; tırnak kaçışı yoktur.
function psÇalıştır(script: string): string {
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  return execFileSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded],
    { encoding: "utf8", timeout: 25_000, windowsHide: true, maxBuffer: 2_000_000 },
  ).replace(/^\uFEFF/, "").trim();
}

function geçerliPid(pid: number): boolean {
  return Number.isInteger(pid) && pid > 0;
}

// Win32_Process: Name + CommandLine. $PID PowerShell'in kendi pid'idir; $hedef kullanılır.
function psJson(script: string): Record<string, unknown> {
  const json = JSON.parse(psÇalıştır(script)) as Record<string, unknown>;
  if (typeof json.hata === "string" && json.hata.length > 0) throw new Error(json.hata);
  return json;
}

function süreçOku(pid: number): { ad: string; komut: string } {
  const script = `
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
function Fail([string]$m) { @{ hata = $m } | ConvertTo-Json -Compress; exit 0 }
$hedef = ${pid}
$p = @(Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $hedef")
if ($p.Count -lt 1) { Fail "Win32_Process yok: ProcessId=$hedef" }
$bir = $p[0]
if ([string]::IsNullOrEmpty([string]$bir.Name)) { Fail "Win32_Process Name bos: ProcessId=$hedef" }
$komut = if ($null -eq $bir.CommandLine) { '' } else { [string]$bir.CommandLine }
@{ ad = [string]$bir.Name; komut = $komut } | ConvertTo-Json -Compress
`;
  const json = psJson(script);
  if (typeof json.ad !== "string" || json.ad.length === 0) {
    throw new Error(`Win32_Process Name bos: ProcessId=${pid}`);
  }
  return { ad: json.ad, komut: typeof json.komut === "string" ? json.komut : "" };
}

// OpenProcessToken + GetTokenInformation(TokenIntegrityLevel). Hata metni olduğu gibi yukarı çıkar.
function bütünlükOku(pid: number): number {
  const script = `
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
function Fail([string]$m) { @{ hata = $m } | ConvertTo-Json -Compress; exit 0 }
$hedef = ${pid}
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class ReaTok17 {
  [DllImport("kernel32.dll", SetLastError=true)]
  public static extern IntPtr OpenProcess(uint access, bool inherit, int pid);
  [DllImport("advapi32.dll", SetLastError=true)]
  public static extern bool OpenProcessToken(IntPtr proc, uint access, out IntPtr token);
  [DllImport("advapi32.dll", SetLastError=true)]
  public static extern bool GetTokenInformation(IntPtr token, int cls, IntPtr buf, int len, out int ret);
  [DllImport("advapi32.dll")]
  public static extern IntPtr GetSidSubAuthority(IntPtr sid, uint index);
  [DllImport("advapi32.dll")]
  public static extern IntPtr GetSidSubAuthorityCount(IntPtr sid);
  [DllImport("kernel32.dll", SetLastError=true)]
  public static extern bool CloseHandle(IntPtr h);
  [DllImport("kernel32.dll")]
  public static extern int GetLastError();
}
'@
$h = [ReaTok17]::OpenProcess(0x1000, $false, $hedef)
if ($h -eq [IntPtr]::Zero) { Fail "OpenProcess failed: Win32=$([ReaTok17]::GetLastError()) ProcessId=$hedef" }
$tok = [IntPtr]::Zero
if (-not [ReaTok17]::OpenProcessToken($h, 0x0008, [ref]$tok) -or $tok -eq [IntPtr]::Zero) {
  $e = [ReaTok17]::GetLastError()
  [void][ReaTok17]::CloseHandle($h)
  Fail "OpenProcessToken failed: Win32=$e ProcessId=$hedef"
}
$need = 0
[void][ReaTok17]::GetTokenInformation($tok, 25, [IntPtr]::Zero, 0, [ref]$need)
if ($need -le 0) {
  $e = [ReaTok17]::GetLastError()
  [void][ReaTok17]::CloseHandle($tok)
  [void][ReaTok17]::CloseHandle($h)
  Fail "GetTokenInformation size failed: Win32=$e ProcessId=$hedef"
}
$buf = [Runtime.InteropServices.Marshal]::AllocHGlobal($need)
try {
  $got = 0
  if (-not [ReaTok17]::GetTokenInformation($tok, 25, $buf, $need, [ref]$got)) {
    Fail "GetTokenInformation failed: Win32=$([ReaTok17]::GetLastError()) ProcessId=$hedef"
  }
  $sidPtr = [Runtime.InteropServices.Marshal]::ReadIntPtr($buf)
  $count = [Runtime.InteropServices.Marshal]::ReadByte([ReaTok17]::GetSidSubAuthorityCount($sidPtr))
  if ($count -lt 1) { Fail "SID subauthority yok: ProcessId=$hedef" }
  $rid = [Runtime.InteropServices.Marshal]::ReadInt32([ReaTok17]::GetSidSubAuthority($sidPtr, [uint32]($count - 1)))
  @{ rid = $rid } | ConvertTo-Json -Compress
} finally {
  [Runtime.InteropServices.Marshal]::FreeHGlobal($buf)
  [void][ReaTok17]::CloseHandle($tok)
  [void][ReaTok17]::CloseHandle($h)
}
`;
  const json = psJson(script);
  const rid = Number(json.rid);
  if (!Number.isInteger(rid) || rid < 0) throw new Error(`integrity RID okunamadi: ProcessId=${pid}`);
  return rid;
}

function bütünlükAdı(rid: number): string | null {
  return BÜTÜNLÜK[rid] ?? null;
}

function elevatedMi(ad: string): boolean {
  return ad === "high" || ad === "system" || ad === "protected";
}

type DosyaÖzeti = { yol: string; sha256: string };

function dosyaÖzeti(kök: string, tam: string): DosyaÖzeti {
  const yol = relative(kök, tam).replace(/\\/g, "/");
  const sha256 = createHash("sha256").update(readFileSync(tam)).digest("hex");
  return { yol, sha256 };
}

// Derinlik 0 yalnız bu dizinin dosyalarıdır. Sembolik bağ izlenmez.
function yürü(kök: string, dizin: string, derinlik: number): DosyaÖzeti[] {
  const adlar = [...readdirSync(dizin)].sort((a, b) => a.localeCompare(b));
  return adlar.flatMap((ad) => {
    const tam = join(dizin, ad);
    let st;
    try { st = lstatSync(tam); } catch { return []; }
    if (st.isSymbolicLink()) return [];
    if (st.isDirectory()) return derinlik > 0 ? yürü(kök, tam, derinlik - 1) : [];
    if (!st.isFile()) return [];
    return [dosyaÖzeti(kök, tam)];
  });
}

function komutDene(fn: () => unknown): boolean {
  try { fn(); return true; } catch { return false; }
}

// Süreç bilgisi: PID -> Win32_Process Name + CommandLine.
export function rea_native_process_info(pid: number): ReaNativeSonuç {
  const kapı = win32Kapısı("rea_native_process_info");
  if (kapı) return kapı;
  if (!geçerliPid(pid)) return desteklenmiyor("geçersiz pid");
  try {
    const { ad, komut } = süreçOku(pid);
    return { ok: true, tool: "rea_native_process_info", summary: `pid=${pid} ad=${ad}`, veri: { pid, ad, komut } };
  } catch (e) { return desteklenmiyor(psHata(e)); }
}

// Yetki denetimi: token integrity RID. Okunamayan süreç başarı sayılmaz.
export function rea_native_authority_check(pid: number): ReaNativeSonuç {
  const kapı = win32Kapısı("rea_native_authority_check");
  if (kapı) return kapı;
  if (!geçerliPid(pid)) return desteklenmiyor("geçersiz pid");
  try {
    const rid = bütünlükOku(pid);
    const bütünlük = bütünlükAdı(rid);
    if (!bütünlük) return desteklenmiyor(`bilinmeyen integrity RID=${rid} ProcessId=${pid}`);
    const elevated = elevatedMi(bütünlük);
    return {
      ok: true,
      tool: "rea_native_authority_check",
      summary: `pid=${pid} bütünlük=${bütünlük} elevated=${elevated}`,
      veri: { pid, rid, elevated, bütünlük },
    };
  } catch (e) { return desteklenmiyor(psHata(e)); }
}

// Dizin yürüyüşü: göreli dosya yolu + içerik sha256. En fazla 200 dosya.
export function rea_native_fs_snapshot(dizin: string, derinlik = 2): ReaNativeSonuç {
  const kapı = win32Kapısı("rea_native_fs_snapshot");
  if (kapı) return kapı;
  if (!dizin) return desteklenmiyor("dizin boş");
  if (!Number.isInteger(derinlik) || derinlik < 0 || derinlik > 5) {
    return desteklenmiyor("derinlik 0-5 aralığında olmalı");
  }
  try {
    const st = lstatSync(dizin);
    if (st.isSymbolicLink() || !st.isDirectory()) return desteklenmiyor(`dizin değil: ${dizin}`);
    const sıralı = yürü(dizin, dizin, derinlik).sort((a, b) => a.yol.localeCompare(b.yol));
    const kirpildi = sıralı.length > DOSYA_TAVAN;
    const dosyalar = kirpildi ? sıralı.slice(0, DOSYA_TAVAN) : sıralı;
    return {
      ok: true,
      tool: "rea_native_fs_snapshot",
      summary: `${dosyalar.length} dosya derinlik=${derinlik}`,
      veri: { dizin, derinlik, dosyalar, kirpildi },
    };
  } catch (e) { return desteklenmiyor(psHata(e)); }
}

// Yetenek: CIM, token sorgusu ve dizin okuma gerçekten çalışıyor mu.
export function rea_native_caps(): ReaNativeSonuç {
  const kapı = win32Kapısı("rea_native_caps");
  if (kapı) return kapı;
  const komutlar = {
    process: komutDene(() => süreçOku(process.pid)),
    authority: komutDene(() => bütünlükOku(process.pid)),
    fs: komutDene(() => readdirSync(process.cwd())),
  };
  return {
    ok: true,
    tool: "rea_native_caps",
    summary: `process=${komutlar.process} authority=${komutlar.authority} fs=${komutlar.fs}`,
    veri: { win32: true, komutlar },
  };
}
