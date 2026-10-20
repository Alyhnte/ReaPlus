// generate-tool-reference.mjs: docs/TOOLS.md'yi el yazisiyla degil, derlenmis
// sunucunun (dist/server.js) gercek MCP yuzeyinden uretir.
// - Sunucu stdio ile baslatilir; initialize + tools/list (sayfalama dahil) +
//   resources/list + prompts/list cekilir. Canli arac cagrisi yapilmaz.
// - Cikti deterministiktir (tarih yok, tum listeler kod noktasina gore sirali).
// - Kisisel yol / env degeri ciktiya sizdirilmaz (scrub).
// Kullanim:
//   node scripts/generate-tool-reference.mjs           -> docs/TOOLS.md yazar
//   node scripts/generate-tool-reference.mjs --check   -> yazmadan ad kumeleri
//      ve toplamlar bakimindan committed docs/TOOLS.md ile gercek yuzeyi kiyaslar
//      (sapmada exit 1). Tam sema bayt kiyasi yapilmaz.
//   node scripts/generate-tool-reference.mjs --stdout  -> Markdown'i stdout'a basar
// On kosul: npm run build (dist/server.js yoksa acik hatayla cikilir).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SERVER_PATH = join(ROOT, "dist", "server.js");
export const OUTPUT_PATH = join(ROOT, "docs", "TOOLS.md");
export const REQUEST_TIMEOUT_MS = 15_000;
export const BUILD_REQUIRED_MESSAGE =
  "dist/server.js not found: the tool reference is generated from the compiled server; run `npm run build` first.";

const sirala = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// Ciktiya kisisel yol sizdirmamak icin bilinen kokleri maskeler.
export function scrub(text) {
  if (text === undefined || text === null) return "";
  let s = String(text).replace(/\r\n?/g, "\n");
  for (const kok of [ROOT, homedir()]) {
    if (!kok) continue;
    s = s.split(kok).join("<kok>");
    s = s.split(kok.replace(/\\/g, "/")).join("<kok>");
  }
  s = s.replace(/[A-Za-z]:\\Users\\[^\\\s]+/g, "<home>");
  s = s.replace(/[A-Za-z]:\/Users\/[^/\s]+/g, "<home>");
  return s;
}

function agaciOldur(child) {
  if (!child || child.exitCode !== null || !child.pid) return;
  if (process.platform === "win32") {
    try { spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" }); } catch { /* zaten olu */ }
  } else {
    try { process.kill(-child.pid, "SIGKILL"); } catch { try { child.kill("SIGKILL"); } catch { /* zaten olu */ } }
  }
}

// Derlenmis sunucuyu stdio ile baslatip MCP yuzeyini toplar. Surec agaci her
// durumda (basari/hata/timeout) temizlenir.
export async function collectSurface({ serverPath = SERVER_PATH, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  if (!existsSync(serverPath)) throw new Error(BUILD_REQUIRED_MESSAGE);
  const env = { ...process.env };
  delete env.REA_WORKSPACE_ROOT; // yol korumasi bu uretimin konusu degil
  delete env.REA_TOOLSETS; // referans her zaman tam yuzeyden uretilir
  const child = spawn(process.execPath, [serverPath], {
    cwd: ROOT,
    env,
    detached: process.platform !== "win32",
    stdio: ["pipe", "pipe", "pipe"],
  });
  let tampon = "";
  let stderrLog = "";
  let sonrakiId = 1;
  const bekleyenler = new Map();
  child.stderr.on("data", (d) => { stderrLog = (stderrLog + d).slice(-4000); });
  child.on("error", (e) => { stderrLog += String(e); });
  child.stdout.on("data", (parca) => {
    tampon += parca.toString("utf8");
    for (;;) {
      const i = tampon.indexOf("\n");
      if (i < 0) return;
      const satir = tampon.slice(0, i).trim();
      tampon = tampon.slice(i + 1);
      if (!satir) continue;
      let mesaj;
      try { mesaj = JSON.parse(satir); } catch { continue; } // JSON disi satir protokolun parcasi degil
      if (mesaj && typeof mesaj.id === "number" && bekleyenler.has(mesaj.id)) {
        const { resolveP, rejectP, zamanlayici } = bekleyenler.get(mesaj.id);
        bekleyenler.delete(mesaj.id);
        clearTimeout(zamanlayici);
        if (mesaj.error) rejectP(new Error(`JSON-RPC hata: ${JSON.stringify(mesaj.error)}`));
        else resolveP(mesaj.result);
      }
    }
  });
  const istek = (method, params) => {
    const id = sonrakiId++;
    return new Promise((resolveP, rejectP) => {
      const zamanlayici = setTimeout(() => {
        bekleyenler.delete(id);
        rejectP(new Error(`${method} zaman asimi (${timeoutMs}ms). stderr: ${scrub(stderrLog.slice(-1000))}`));
      }, timeoutMs);
      bekleyenler.set(id, { resolveP, rejectP, zamanlayici });
      try { child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); }
      catch (e) { clearTimeout(zamanlayici); bekleyenler.delete(id); rejectP(e); }
    });
  };
  const sayfaliListele = async (method, anahtar) => {
    const hepsi = [];
    let cursor;
    do {
      const sayfa = await istek(method, cursor ? { cursor } : {});
      if (!Array.isArray(sayfa?.[anahtar])) throw new Error(`${method} yaniti '${anahtar}' dizisi icermiyor.`);
      hepsi.push(...sayfa[anahtar]);
      cursor = sayfa.nextCursor;
    } while (cursor);
    return hepsi;
  };
  try {
    const baslat = await istek("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "generate-tool-reference", version: "0" },
    });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }) + "\n");
    const tools = await sayfaliListele("tools/list", "tools");
    const resources = await sayfaliListele("resources/list", "resources");
    const prompts = await sayfaliListele("prompts/list", "prompts");
    return {
      serverInfo: {
        name: String(baslat?.serverInfo?.name ?? ""),
        version: String(baslat?.serverInfo?.version ?? ""),
      },
      tools, resources, prompts,
    };
  } finally {
    for (const { rejectP, zamanlayici } of bekleyenler.values()) {
      clearTimeout(zamanlayici);
      rejectP(new Error("yuzey toplama bitti, surec kapatiliyor"));
    }
    bekleyenler.clear();
    if (child.exitCode === null) {
      const cikis = new Promise((r) => child.once("exit", r));
      try { child.stdin.end(); } catch { /* kapali */ }
      const sonuc = await Promise.race([cikis.then(() => "cikti"), new Promise((r) => setTimeout(() => r("zaman"), 3000))]);
      if (sonuc !== "cikti") {
        agaciOldur(child);
        await Promise.race([cikis, new Promise((r) => setTimeout(r, 3000))]);
      }
    }
  }
}

export function typeSummary(schema) {
  if (!schema || typeof schema !== "object") return "unknown";
  if (typeof schema.$ref === "string") return schema.$ref.split("/").at(-1) || "$ref";
  if (Array.isArray(schema.enum)) return "enum";
  if (Array.isArray(schema.anyOf)) return schema.anyOf.map(typeSummary).join(" | ");
  if (Array.isArray(schema.oneOf)) return schema.oneOf.map(typeSummary).join(" | ");
  if (Array.isArray(schema.type)) return schema.type.join(" | ");
  if (schema.type === "array") return `${typeSummary(schema.items)}[]`;
  if (typeof schema.type === "string") return schema.type;
  return "unknown";
}

export function inputFields(tool) {
  const props = tool?.inputSchema?.properties;
  if (!props || typeof props !== "object") return [];
  const required = new Set(Array.isArray(tool.inputSchema.required) ? tool.inputSchema.required : []);
  return Object.keys(props).sort(sirala).map((name) => {
    const p = props[name] && typeof props[name] === "object" ? props[name] : {};
    return {
      name,
      type: typeSummary(p),
      required: required.has(name),
      description: scrub(p.description ?? "").replace(/\s*\n\s*/g, " ").trim(),
    };
  });
}

// Yuzeyden deterministik Markdown uretir (saf fonksiyon: ayni yuzey -> ayni metin).
export function renderReference(surface) {
  const tools = [...surface.tools].sort((a, b) => sirala(a.name, b.name));
  const resources = [...surface.resources].sort((a, b) => sirala(a.uri, b.uri));
  const prompts = [...surface.prompts].sort((a, b) => sirala(a.name, b.name));
  const outputSayisi = tools.filter((t) => t.outputSchema && typeof t.outputSchema === "object").length;
  const annotationSayisi = tools.filter((t) => t.annotations && typeof t.annotations === "object" && Object.keys(t.annotations).length).length;
  const L = [];
  L.push("# ReaPlus Tool Reference");
  L.push("");
  L.push("> This file is auto-generated; do not edit by hand. Source: the real MCP");
  L.push("> surface of the compiled server (`dist/server.js`). To regenerate:");
  L.push("> `npm run build && node scripts/generate-tool-reference.mjs`");
  L.push("");
  L.push("## Summary");
  L.push("");
  L.push(`- Server: \`${scrub(surface.serverInfo.name)}\` ${scrub(surface.serverInfo.version)}`);
  L.push(`- Total tools: ${tools.length}`);
  L.push(`- Total resources: ${resources.length}`);
  L.push(`- Total prompts: ${prompts.length}`);
  L.push(`- Tools with outputSchema: ${outputSayisi}`);
  L.push(`- Tools with annotations: ${annotationSayisi}`);
  L.push("");
  L.push("## Tools");
  for (const t of tools) {
    L.push("");
    L.push(`### \`${t.name}\``);
    L.push("");
    L.push(scrub(t.description ?? "").trim() || "_No description._");
    L.push("");
    const alanlar = inputFields(t);
    if (!alanlar.length) {
      L.push("- Input fields: none");
    } else {
      L.push("- Input fields:");
      for (const a of alanlar) {
        const desc = a.description ? ` — ${a.description}` : "";
        L.push(`  - \`${a.name}\` (${a.type}, ${a.required ? "required" : "optional"})${desc}`);
      }
    }
    if (t.outputSchema && typeof t.outputSchema === "object") {
      const outProps = t.outputSchema.properties ? Object.keys(t.outputSchema.properties).sort(sirala) : [];
      L.push(`- outputSchema: present${outProps.length ? ` (fields: ${outProps.join(", ")})` : ""}`);
    } else L.push("- outputSchema: absent");
    if (t.annotations && typeof t.annotations === "object" && Object.keys(t.annotations).length) {
      const parcalar = Object.keys(t.annotations).sort(sirala).map((k) => `${k}=${JSON.stringify(t.annotations[k])}`);
      L.push(`- annotations: present (${parcalar.join(", ")})`);
    } else L.push("- annotations: absent");
  }
  L.push("");
  L.push("## Resources");
  L.push("");
  if (!resources.length) L.push("_No resources._");
  for (const r of resources) {
    const parc = [`- \`${r.uri}\``];
    if (r.name) parc.push(`name: \`${scrub(r.name)}\``);
    if (r.mimeType) parc.push(`mimeType: \`${r.mimeType}\``);
    const desc = scrub(r.description ?? "").replace(/\s*\n\s*/g, " ").trim();
    L.push(parc.join(" — ") + (desc ? ` — ${desc}` : ""));
  }
  L.push("");
  L.push("## Prompts");
  L.push("");
  if (!prompts.length) L.push("_No prompts._");
  for (const p of prompts) {
    const args = Array.isArray(p.arguments) ? [...p.arguments].sort((a, b) => sirala(a.name, b.name)) : [];
    const argMetni = args.length
      ? `arguments: ${args.map((a) => `\`${a.name}\` (${a.required ? "required" : "optional"})`).join(", ")}`
      : "arguments: none";
    const desc = scrub(p.description ?? "").replace(/\s*\n\s*/g, " ").trim();
    L.push(`- \`${p.name}\` — ${argMetni}${desc ? ` — ${desc}` : ""}`);
  }
  L.push("");
  return scrub(L.join("\n"));
}

// Uretilmis Markdown'dan ad kumelerini ve ilan edilen toplamlari geri okur
// (--check ve testler bunu kullanir; sema bayt kiyasina girilmez).
export function parseReference(markdown) {
  const metin = String(markdown);
  const toplam = (etiket) => {
    const m = metin.match(new RegExp(`^- ${etiket}: (\\d+)$`, "m"));
    return m ? Number(m[1]) : null;
  };
  const bolum = (bas, bit) => {
    const i = metin.indexOf(bas);
    if (i < 0) return "";
    const j = bit ? metin.indexOf(bit, i + bas.length) : -1;
    return metin.slice(i, j >= 0 ? j : undefined);
  };
  const aracBolumu = bolum("## Tools", "## Resources");
  const tools = [...aracBolumu.matchAll(/^### `([^`]+)`$/gm)].map((m) => m[1]);
  const resources = [...bolum("## Resources", "## Prompts").matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]);
  const prompts = [...bolum("## Prompts", null).matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]);
  return {
    tools, resources, prompts,
    totals: {
      tools: toplam("Total tools"),
      resources: toplam("Total resources"),
      prompts: toplam("Total prompts"),
    },
  };
}

// Dokuman ile gercek yuzey arasinda ad kume + toplam sapmalarini listeler.
export function checkReference(markdown, surface) {
  const doc = parseReference(markdown);
  const problemler = [];
  const kiyas = (etiket, dokumanAdlari, gercekAdlar, ilanToplam) => {
    const d = new Set(dokumanAdlari);
    const g = new Set(gercekAdlar);
    for (const ad of [...g].filter((x) => !d.has(x)).sort(sirala)) problemler.push(`${etiket}: gercek yuzeyde var, dokumanda yok: ${ad}`);
    for (const ad of [...d].filter((x) => !g.has(x)).sort(sirala)) problemler.push(`${etiket}: dokumanda var, gercek yuzeyde yok: ${ad}`);
    if (dokumanAdlari.length !== d.size) problemler.push(`${etiket}: dokumanda yinelenen ad var`);
    if (ilanToplam === null) problemler.push(`${etiket}: dokumanda toplam satiri yok`);
    else if (ilanToplam !== gercekAdlar.length) problemler.push(`${etiket}: dokuman toplami ${ilanToplam}, gercek yuzey ${gercekAdlar.length}`);
    if (ilanToplam !== null && ilanToplam !== dokumanAdlari.length) problemler.push(`${etiket}: dokuman toplami ${ilanToplam}, dokumandaki ad sayisi ${dokumanAdlari.length}`);
  };
  kiyas("arac", doc.tools, surface.tools.map((t) => t.name), doc.totals.tools);
  kiyas("resource", doc.resources, surface.resources.map((r) => r.uri), doc.totals.resources);
  kiyas("prompt", doc.prompts, surface.prompts.map((p) => p.name), doc.totals.prompts);
  return { ok: problemler.length === 0, problemler, doc };
}

async function main(argv) {
  const check = argv.includes("--check");
  const stdout = argv.includes("--stdout");
  const surface = await collectSurface();
  const counts = `arac=${surface.tools.length} resource=${surface.resources.length} prompt=${surface.prompts.length}`;
  if (check) {
    if (!existsSync(OUTPUT_PATH)) {
      console.error("docs/TOOLS.md not found: run `node scripts/generate-tool-reference.mjs` first.");
      return 1;
    }
    const { ok, problemler } = checkReference(readFileSync(OUTPUT_PATH, "utf8"), surface);
    if (!ok) {
      console.error(`TOOLS.md deviates from the real surface (${counts}):`);
      for (const p of problemler) console.error(`- ${p}`);
      return 1;
    }
    console.log(`TOOLS.md current: name sets and totals match the real surface (${counts}).`);
    return 0;
  }
  const markdown = renderReference(surface);
  if (stdout) { process.stdout.write(markdown); return 0; }
  writeFileSync(OUTPUT_PATH, markdown, "utf8");
  console.log(`docs/TOOLS.md generated (${counts}; ${(markdown.match(/\n/g) ?? []).length} lines).`);
  return 0;
}

// argv ile import.meta.url ayni dosyayi farkli gecitten (junction/subst) gosterir;
// realpath karsilastirmasi CLI girisini yol haritelerinden bagimsiz kil.
const gercekYol = (p) => { try { return realpathSync(p); } catch { return p; } };
const anaDosya = process.argv[1] ? gercekYol(resolve(process.argv[1])) : "";
if (anaDosya && anaDosya === gercekYol(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).then(
    (code) => { process.exitCode = code; },
    (e) => { console.error(String(e?.message ?? e)); process.exitCode = 1; },
  );
}
