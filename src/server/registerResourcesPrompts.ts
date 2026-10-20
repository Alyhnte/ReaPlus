// rea-plus MCP resource + prompt kayitlari: statik, salt-okunur ve yan etkisiz.
// Resource'lar hicbir env degeri, kisisel yol veya rastgele dosya icerigi acmaz;
// prompt'lar yalniz metin uretir, hicbir arac calistirmaz.
import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

export const REA_SERVER_INFO_URI = "rea-plus://server-info";
export const REA_CAPABILITIES_SAFETY_URI = "rea-plus://capabilities-safety";
export const REA_PROMPT_NAMES = [
  "packer-triage", "dotnet-malware-triage", "android-triage",
  "pe-crash-triage", "elf-linux-triage", "binary-diff", "evidence-report",
] as const;

export interface ReaServerInfoInput {
  name: string;
  version: string;
}

const VM_RULE =
  "Canli veya dinamik isler (ornek calistirma, debugger/Frida enjeksiyonu, paket yakalama, " +
  "cihaza kurulum, tarayici otomasyonu) ana makinede yapilmaz; yalniz VM/CI'in ayri, bilincli " +
  "kosulan isinde yapilir. Bu akista emin degilsen statik adimda dur ve canli adimi atlama.";

const TRIAGE_ARGS = z.object({
  path: z.string().min(1).describe("Incelenecek ornegin yolu"),
  focus: z.string().min(1).optional().describe("Opsiyonel odak sorusu veya suphe alani"),
});

const DIFF_ARGS = z.object({
  eski: z.string().min(1).describe("Karsilastirilacak eski surumun yolu"),
  yeni: z.string().min(1).describe("Karsilastirilacak yeni surumun yolu"),
  focus: z.string().min(1).optional().describe("Opsiyonel odak sorusu veya suphe alani"),
});

function focusSatiri(focus?: string): string {
  const f = focus?.trim();
  return f ? `Odak: ${f}` : "Odak belirtilmedi; genel triage yap ve bulgulari onceliklendir.";
}

function promptSonuc(metin: string) {
  return { messages: [{ role: "user" as const, content: { type: "text" as const, text: metin } }] };
}

export function buildServerInfo(info: ReaServerInfoInput) {
  return {
    name: info.name,
    version: info.version,
    description: "Conduit live-debug core + Rea static reverse-engineering domains over stdio/HTTP.",
    transports: ["stdio", "streamable-http"],
    tools: { total: 191, conduit: 30, rea: 161 },
    resources: [REA_SERVER_INFO_URI, REA_CAPABILITIES_SAFETY_URI],
    prompts: [...REA_PROMPT_NAMES],
  };
}

export function buildCapabilitiesSafety() {
  return {
    capabilities: {
      tools: { total: 191, conduit: 30, rea: 161 },
      resources: { subscribe: false, uris: [REA_SERVER_INFO_URI, REA_CAPABILITIES_SAFETY_URI] },
      prompts: { names: [...REA_PROMPT_NAMES], sideEffectFree: true },
    },
    safety: {
      resourcesReadOnly: true,
      arbitraryFileResources: false,
      environmentValuesExposed: false,
      personalPathsExposed: false,
      staticAnalysisFirst: true,
      workOnCopyForWrites: true,
      liveExecution: "vm-ci-only",
      liveExecutionRule: VM_RULE,
    },
    domains: [
      "native-pe-elf", "ghidra", "cutter-r2", "dotnet", "android-jadx-apktool", "wasm-evm",
      "unpack", "javascript", "firmware", "browser", "frida-live", "behavior-evidence",
    ],
  };
}

export function buildPackerTriageText(path: string, focus?: string): string {
  return [
    `Hedef: ${path}`,
    focusSatiri(focus),
    "Gorev: packer/koruma triage'i yap. Bu prompt tek basina hicbir arac calistirmaz; adimlari sirayla, her adimda sonucu degerlendirerek uygula.",
    "1) rea_investigate(path) ile tip + sorusturma planini al; plan disina cikmadan ilerle.",
    "2) PE ise rea_pe_info(path), rea_pe_sections(path) ve rea_pe_imports(path) ile bolum entropisi/isaretleri ve import seyrekligine bak; PE degilse bu adimi atla.",
    "3) rea_upx_info(path) ile UPX izini dogrula.",
    "4) rea_unpack_hunt(path) ile bilinmeyen packer rehberli akisini al; ardindan gerekirse rea_unpack_try(path) yonlendirmesini izle. Yazma gerektiren acma adimlarinda (orn. rea_upx_unpack) yalniz ornegin kopyasi uzerinde calis, orijinali degistirme.",
    "5) Acilmis veya acilmamis kopyada rea_cutter_strings(path) veya rea_ghidra_strings(path) ile yalniz dikkat cekici stringleri ozetle; tum dokumu raporlama.",
    "Cikti: tespit edilen packer/koruma, dayanak kanitlar (bolum/import/string), guven duzeyi ve onerilen sonraki tek adim.",
    VM_RULE,
  ].join("\n");
}

export function buildDotnetMalwareTriageText(path: string, focus?: string): string {
  return [
    `Hedef: ${path}`,
    focusSatiri(focus),
    "Gorev: .NET ornegi icin zararli-yazilim triage'i yap. Bu prompt tek basina hicbir arac calistirmaz; adimlari sirayla, her adimda sonucu degerlendirerek uygula ve ornegi asla calistirma.",
    "1) rea_investigate(path) ile tip + sorusturma planini al.",
    "2) rea_dotnet_metadata(path) ile assembly metadata, referanslar ve entry point'i cikar.",
    "3) rea_dotnet_cil(path) ile CIL method dokumunu incele; odak varsa filtre ile ilgili methodlara daralt. Supheli kaliplari (process injection, reflection yukleme, ag, kalicilik, sifre cozme donguleri) isaretle ama calistirma.",
    "4) Gerekirse rea_ilspy_decompile(path, out) ile yalniz kopyaya ait cikti dizinine C# decompile al; orijinal ornegi degistirme.",
    "5) Native bagimlilik suphesi varsa rea_pe_imports(path) ve rea_pe_sections(path) ile capraz kontrol yap; referans ornek varsa rea_managed_compare ile farki ozetle.",
    "Cikti: supheli davranis basliklari, her birinin dayandigi tip/method kaniti, guven duzeyi ve onerilen sonraki tek adim. Kanit yoksa zararli hukum verme.",
    VM_RULE,
  ].join("\n");
}

export function buildAndroidTriageText(path: string, focus?: string): string {
  return [
    `Hedef (apk_path): ${path}`,
    focusSatiri(focus),
    "Gorev: Android APK triage'i yap. Bu prompt tek basina hicbir arac calistirmaz; adimlari sirayla, her adimda sonucu degerlendirerek uygula.",
    "1) rea_investigate(path) ile tip + sorusturma planini al.",
    "2) rea_jadx_manifest(apk_path) ile paket, izinler, exported bilesenler ve entry noktalarini ozetle.",
    "3) rea_jadx_classes(apk_path) ile sinif listesini al; odakla ilgili veya supheli siniflari sec.",
    "4) Secilen siniflar icin rea_jadx_decompile(apk_path, sinif, out) ile yalniz kopyaya ait cikti dizinine decompile al; gerekiyorsa rea_jadx_xrefs ile cagri zincirini daralt. Tum APK'yi kosulsuz dokme.",
    "5) Flutter suphesi varsa rea_flutter_scan(path) ve gerekirse rea_flutter_payload(path) ile capraz kontrol yap.",
    "Cikti: izin/bilesen riskleri, incelenen siniflar, dayanak kanitlar, guven duzeyi ve onerilen sonraki tek adim.",
    "Cihaza kurulum, calistirma veya logcat gibi canli adimlar (orn. rea_adb_install) bu akisin disindadir.",
    VM_RULE,
  ].join("\n");
}

export function buildPeCrashTriageText(path: string, focus?: string): string {
  return [
    `Hedef: ${path}`,
    focusSatiri(focus),
    "Gorev: PE/crash triage'i yap; akis triage -> statik -> crash kaniti -> davranis seklinde ilerler. Bu prompt tek basina hicbir arac calistirmaz; adimlari sirayla, her adimda sonucu degerlendirerek uygula ve ornegi asla calistirma.",
    "1) rea_investigate(path) ile tip + sorusturma planini al; plan disina cikmadan ilerle.",
    "2) PE ise rea_pe_info(path), rea_pe_sections(path) ve rea_pe_imports(path) ile baslik, bolum entropisi ve import tablosunu oku; PE degilse bu adimi atla.",
    "3) Eldeki crash notu metni icin rea_crash_kayit_parse(text) ile kaydi cevir, rea_crash_ozet(text) ile ozeti al, cikan olaylar JSON'unu rea_crash_timeline(olaylar) ve rea_crash_hint(olaylar) ile sirala; crash kaydi yoksa bu adimi atla.",
    "4) Toplanan api/net olaylari JSON metni ile rea_behavior_full(api, net) ve rea_behavior_timeline(olaylar) ile zaman cizelgesi + ozet uret; olay yoksa uydurma, eksigi acikca yaz.",
    "5) Debug bilgisi varsa rea_pdb_yolu(path) ile PDB kimligini dogrula; yoksa bu adimi atla.",
    "Cikti: triage ogesi, statik bulgular, crash kanitinin derecesi ve davranis ozeti; her bulgu icin dayanak (bolum/import/olay) + guven duzeyi ve onerilen sonraki tek adim. Kanit yoksa zararli hukum verme.",
    VM_RULE,
  ].join("\n");
}

export function buildElfLinuxTriageText(path: string, focus?: string): string {
  return [
    `Hedef: ${path}`,
    focusSatiri(focus),
    "Gorev: ELF/Linux triage'i yap. Bu prompt tek basina hicbir arac calistirmaz; adimlari sirayla, her adimda sonucu degerlendirerek uygula ve ornegi asla calistirma.",
    "1) rea_investigate(path) ile tip + sorusturma planini al.",
    "2) rea_pwn_elf_layout(path) ile segment/kesit duzeni ve mitigation (NX/PIE/RELRO/canary) durumunu al.",
    "3) rea_dwarf_ozet(path) ile DWARF sembollerini ozetle; sembol yoksa uydurma, eksigi acikca yaz.",
    "4) Go ikili suphesi varsa rea_go_buildinfo(path) ve rea_go_funclines(path) ile surum + modul bilgisini dogrula; Go degilse bu adimi atla.",
    "5) rea_cutter_funcs(path) ile fonksiyon listesi ve rea_cutter_strings(path) ile dikkat cekici stringleri al; Ghidra tercih ediliyorsa rea_ghidra_analyze(path) sonrasi rea_ghidra_funcs(path) ve rea_ghidra_strings(path) ile ayni adimi yap, iki motorun ciktilarini karistirma.",
    "6) Onceki adimlarin disassembly metnine rea_pwn_gadgets(text) ile gadget adaylarini tara; odak bir zincir ise bu adima yogunlas, degilse ozeti gec.",
    "Cikti: ELF tipi + mitigation durumu, sembol ve gadget kanitlari, guven duzeyi ve onerilen sonraki tek adim.",
    VM_RULE,
  ].join("\n");
}

export function buildBinaryDiffText(eski: string, yeni: string, focus?: string): string {
  return [
    `Eski surum: ${eski}`,
    `Yeni surum: ${yeni}`,
    focusSatiri(focus),
    "Gorev: iki surum arasi binary diff / yama analizi yap. Bu prompt tek basina hicbir arac calistirmaz; adimlari sirayla, her adimda sonucu degerlendirerek uygula ve dosyalarin kendisini degistirme.",
    "1) rea_investigate(eski) ve rea_investigate(yeni) ile iki surumun tipini ve sorusturma planini dogrula; format farkliysa dur ve devam etme.",
    "2) rea_bindiff_fonksiyonlar(eski) ve rea_bindiff_fonksiyonlar(yeni) ile iki fonksiyon listesini (kimlik/adres + hash + imza) cikar.",
    "3) rea_bindiff_karsilastir(text) cagrisina {\"eski\": \"<eski>\", \"yeni\": \"<yeni>\"} JSON'ini ver; arac yollarin kendisini okuyup eklenen/cikarilan/degisen/aynen kumelerini dondurur.",
    "4) Ghidra kuruluysa rea_ghidra_vt(eski, yeni) ile version-tracking karsilastirmasini al ve degisen fonksiyonlarin adreslerini karsilastir; Ghidra yoksa bu adimi atla, rea_missing_reason(eksik) ile kurulum nedenini yaz.",
    "5) Degisen fonksiyonlarin adresleri icin rea_ghidra_decompile(eski, addr) ve rea_ghidra_decompile(yeni, addr) ile kod karsilastirmasi yap; odak varsa yalniz odaktaki fonksiyonlara daralt, tum listeyi dokme.",
    "Cikti: eklenen/cikarilan/degisen fonksiyonlar, her biri icin kanit (hash/imza/adres), yamanin etki alani, guven duzeyi ve onerilen sonraki tek adim.",
    VM_RULE,
  ].join("\n");
}

export function buildEvidenceReportText(path: string, focus?: string): string {
  return [
    `Hedef: ${path}`,
    focusSatiri(focus),
    "Gorev: kanit paketini rapora dondur. Bu prompt tek basina hicbir arac calistirmaz; adimlari sirayla, her adimda sonucu degerlendirerek uygula; kanit yoksa uydurma, eksigi acikca yaz.",
    "1) rea_investigate(path) ile inceleme kapsamini ve bulgularin hedefini netlestir.",
    "2) Bulgular ve saklanan kanit listeleri JSON metni olarak rea_evidence_bundle(ogeler, sakli) ile paketle; donen digest + tools_sha256 degerlerini raporun basina yaz.",
    "3) Paketi rea_evidence_verify(text) ile dogrula; dogrulanmiyorsa raporu durdur ve hatayi yaz.",
    "4) rea_obligation_ledger(bulgular, tools_sha256, evidence_digest) ile defteri kur, her bulgu icin rea_obligation_advance(defter, bulgu, kod) ile kanit zincirini ilerlet, ardindan rea_obligation_verify(text) ile zinciri dogrula ve rea_obligation_close(text) ile muhurle.",
    "5) rea_readiness(text) ile hazirlik skorunu, rea_coverage(incelenen, toplam) ile kapsam oranini rapora ekle.",
    "6) Eksik araclari rea_missing_reason(eksik, platform) ile kurulum ipuclariyla listele; kapsam disi kalan adimlari acikca belirt.",
    "Cikti: yonetic ozet, bulgu listesi (bulgu + kanit + guven), kanit digest'i, obligation zincir durumu, hazirlik skoru, kapsam orani ve onerilen sonraki tek adim.",
    VM_RULE,
  ].join("\n");
}

export function registerResourcesPrompts(server: McpServer, info: ReaServerInfoInput): void {
  server.registerResource(
    "server-info",
    REA_SERVER_INFO_URI,
    { title: "ReaPlus server info", description: "Statik sunucu kimligi ve yuzey ozeti (salt-okunur).", mimeType: "application/json" },
    (uri) => ({
      contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(buildServerInfo(info), null, 2) }],
    }),
  );
  server.registerResource(
    "capabilities-safety",
    REA_CAPABILITIES_SAFETY_URI,
    { title: "ReaPlus capabilities and safety", description: "Statik yetenek ve guvenlik kurallari ozeti (salt-okunur).", mimeType: "application/json" },
    (uri) => ({
      contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(buildCapabilitiesSafety(), null, 2) }],
    }),
  );

  server.registerPrompt(
    "packer-triage",
    { title: "Packer triage", description: "Sequential, static-first rea flow for packer/protection detection (side-effect-free prompt).", argsSchema: TRIAGE_ARGS },
    ({ path, focus }) => promptSonuc(buildPackerTriageText(path, focus)),
  );
  server.registerPrompt(
    "dotnet-malware-triage",
    { title: ".NET malware triage", description: "Static malware-triage flow for a .NET sample (side-effect-free prompt).", argsSchema: TRIAGE_ARGS },
    ({ path, focus }) => promptSonuc(buildDotnetMalwareTriageText(path, focus)),
  );
  server.registerPrompt(
    "android-triage",
    { title: "Android triage", description: "jadx-based static triage flow for an APK (side-effect-free prompt).", argsSchema: TRIAGE_ARGS },
    ({ path, focus }) => promptSonuc(buildAndroidTriageText(path, focus)),
  );
  server.registerPrompt(
    "pe-crash-triage",
    { title: "PE/crash triage", description: "Triage -> static -> crash -> behavior flow for a PE target (side-effect-free prompt).", argsSchema: TRIAGE_ARGS },
    ({ path, focus }) => promptSonuc(buildPeCrashTriageText(path, focus)),
  );
  server.registerPrompt(
    "elf-linux-triage",
    { title: "ELF/Linux triage", description: "Static layout -> symbol -> gadget triage flow for an ELF target (side-effect-free prompt).", argsSchema: TRIAGE_ARGS },
    ({ path, focus }) => promptSonuc(buildElfLinuxTriageText(path, focus)),
  );
  server.registerPrompt(
    "binary-diff",
    { title: "Binary diff / patch analysis", description: "Function diff and patch-review flow between two versions (side-effect-free prompt).", argsSchema: DIFF_ARGS },
    ({ eski, yeni, focus }) => promptSonuc(buildBinaryDiffText(eski, yeni, focus)),
  );
  server.registerPrompt(
    "evidence-report",
    { title: "Evidence report", description: "Flow that turns an evidence bundle into a verified report (side-effect-free prompt).", argsSchema: TRIAGE_ARGS },
    ({ path, focus }) => promptSonuc(buildEvidenceReportText(path, focus)),
  );
}
