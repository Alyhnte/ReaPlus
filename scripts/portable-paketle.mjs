#!/usr/bin/env node
// scripts/portable-paketle.mjs: portable node bundle → portable/<surum>/ (dalga-11/sea-portable).
// ROADMAP-A "portable node bundle" satirinin betigi: Node'suz Windows/Unix dagitimi;
// tek-dosya SEA DEGIL (3 engel acik, bkz. docs/SEA-DAGITIM.md) — burada bilincli kapsam:
// node.exe dosya olarak tasinir, imza/AV/end-to-end SEA derlemesi yok.
//
// NE KOPYALANIR / NEDEN (durust kural):
//  - node.exe        : process.execPath kopyasi — indirme YOK, sistem node ile ayni surum.
//  - dist/           : `npm run build` ciktisi; entry bin.["rea-plus"] = dist/server.js.
//  - package.json    : kok package.json (surum kaynagi).
//  - node_modules/   : yalniz URETIM (prod) bagimli kapanir kume — package.json
//                      dependencies koklerinden baslayip her paketin dependencies +
//                      optionalDependencies + peerDependencies (diskte kurulu olanlari)
//                      dfs ile gezilir; sadece bu kume kopyalanir.
//                      why: devDependencies (typescript, @types/node) calisma aninda
//                      gerekmez; playwright dinamik `import()` ile + harici tarayici
//                      binary gerekir — pakete gomulemez, HARIC tutulur; yoklugu
//                      browser domainlerinde capability_unsupported + kurulum ipucu doner
//                      (sahte basari yok). .bin/ ve .package-lock.json da haric (giris
//                      node.exe + dist/server.js ile; npm shim'i gerekmez).
//  - frida binding   : node_modules/frida/build/frida_binding.node (~129.4MiB) SEA blob'a
//                      GOMULEMEZ (docs/SEA-DAGITIM.md engel 1) — portable bundle'da DOSYA
//                      olarak tasinir; imza/AV sorunu yoktur, boyut biliniyor ve kayitli.
//  - start.bat       : portable baslatici `"%~dp0node.exe" "%~dp0dist\server.js"`.
//  - MANIFEST.json   : olcum + kural kaydi (test isareti).
//
// KOS: npm ci && npm run build && node scripts/portable-paketle.mjs [--zip] [--cikti <dizin>]
// CIKTI: portable/<surum>/ (+ MANIFEST.json; --zip ise ayni adli .zip, best-effort).
// YAZMA ALANI: yalniz cikti dizini (default portable/<surum>/); repo kaynagina dokunulmaz.
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(kok, "package.json"), "utf8"));
const SURUM = pkg.version;

const argv = process.argv.slice(2);
const zipIste = argv.includes("--zip");
const ciktiArg = argv.indexOf("--cikti");
const dizin = ciktiArg >= 0
  ? resolve(argv[ciktiArg + 1])
  : join(kok, "portable", SURUM);
const nodeAd = process.platform === "win32" ? "node.exe" : "node";

// 0. Onkosullar: derlenmis dist + kurulu node_modules sart (sahte dosya uretilmez).
const distKaynak = join(kok, "dist");
if (!existsSync(join(distKaynak, "server.js")) || !existsSync(join(distKaynak, "cli", "index.js"))) {
  console.error("dist/ eksik: once `npm ci` + `npm run build` kosulmali.");
  process.exit(1);
}
const nmKaynak = join(kok, "node_modules");
if (!existsSync(join(nmKaynak, "frida", "package.json"))) {
  console.error("node_modules/frida yok: once `npm ci` kosulmali.");
  process.exit(1);
}

// 1. Temiz cikti dizini (yalniz buraya yazilir).
rmSync(dizin, { recursive: true, force: true });
mkdirSync(dizin, { recursive: true });

// 2. Sistem node'unun kopyasi (indirme yok).
const nodeHedef = join(dizin, nodeAd);
copyFileSync(process.execPath, nodeHedef);
const nodeBoyut = statSync(nodeHedef).size;

// 3. dist/ + package.json (server.json/configs/ runtime'da okunmuyor — asgari paket).
cpSync(distKaynak, join(dizin, "dist"), { recursive: true });
copyFileSync(join(kok, "package.json"), join(dizin, "package.json"));

// 4. node_modules: prod bagimli kapanir kume (yukaridaki kural). dfs + gorunurluk
//    cozumlemesi: once paketin kendi node_modules/, sonra ustler, sonra kok.
const kume = new Map(); // "node_modules altindaki goreli yol" -> mutlak dizin
function paketDirBul(ad, baslangic) {
  let d = baslangic;
  for (;;) {
    const aday = join(d, "node_modules", ...ad.split("/"));
    if (existsSync(join(aday, "package.json"))) return aday;
    const ust = dirname(d);
    if (ust === d) return null;
    d = ust;
  }
}
const kuyruk = Object.keys(pkg.dependencies ?? {}).map((ad) => ({ ad, from: kok }));
const cozulemeyen = [];
while (kuyruk.length > 0) {
  const { ad, from } = kuyruk.shift();
  const dir = paketDirBul(ad, from);
  if (!dir) { cozulemeyen.push(ad); continue; } // peer'da diskte yoksa gecerli: kopyalanmaz
  const goreli = relative(nmKaynak, dir).split("\\").join("/");
  if (kume.has(goreli)) continue;
  kume.set(goreli, dir);
  const pj = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const bagimliliklar = {
    ...(pj.dependencies ?? {}),
    ...(pj.optionalDependencies ?? {}),
    ...(pj.peerDependencies ?? {}),
  };
  for (const alt of Object.keys(bagimliliklar)) kuyruk.push({ ad: alt, from: dir });
}
const nmHedef = join(dizin, "node_modules");
for (const [goreli, dir] of kume) {
  cpSync(dir, join(nmHedef, goreli), { recursive: true });
}

// 5. Baslatici: portable entry = dist/server.js (bin.["rea-plus"]).
//    start.bat her platformda uretilir (metin dosyasi; Windows disinda da kayit/gosterim);
//    Linux/macOS'ta ek olarak calisabilir start.sh yazilir.
writeFileSync(
  join(dizin, "start.bat"),
  `@echo off\r\nrem rea-plus portable v${SURUM} — node.exe kopyasi + dist/server.js (kurulum yok)\r\n"%~dp0${nodeAd}" "%~dp0dist\\server.js" %*\r\n`,
  "utf8",
);
if (process.platform !== "win32") {
  const sh = join(dizin, "start.sh");
  writeFileSync(sh, `#!/bin/sh\n# rea-plus portable v${SURUM} — node kopyasi + dist/server.js (kurulum yok)\nexec "$(dirname "$0")/node" "$(dirname "$0")/dist/server.js" "$@"\n`, "utf8");
}

// 6. Haric kume raporu (durust kayit): kok nm icinde kume disinda kalanlar.
//    Not: kume anahtari "node_modules altindaki goreli yol" (scoped paketler
//    "@scope/ad"); kok girdisi her zaman ilk segmenttir ("@scope" veya "ad").
const kokGirdiler = readdirSync(nmKaynak, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);
const kumeUst = new Set([...kume.keys()].map((g) => g.split("/")[0]));
const haric = kokGirdiler.filter((g) => !kumeUst.has(g)).sort();

// 7. Boyut sayimi (gercek olcum; uydurma yok).
let dosyaSayisi = 0; let toplamBayt = 0;
(function gez(d) {
  for (const g of readdirSync(d, { withFileTypes: true })) {
    const t = join(d, g.name);
    if (g.isDirectory()) gez(t);
    else { dosyaSayisi++; toplamBayt += statSync(t).size; }
  }
})(dizin);
const bayt = (p) => {
  try {
    const s = statSync(join(dizin, p));
    if (!s.isDirectory()) return s.size;
    let n = 0;
    (function g(d) {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const t = join(d, e.name);
        if (e.isDirectory()) g(t); else n += statSync(t).size;
      }
    })(join(dizin, p));
    return n;
  } catch { return -1; }
};

const fridaBindingYolu = join(nmKaynak, "frida", "build", "frida_binding.node");
const manifest = {
  ad: "rea-plus-portable",
  surum: SURUM,
  platform: process.platform,
  mimari: process.arch,
  node: { surum: process.version, kaynak: "sistem node kopyasi (process.execPath); indirme yok", boyut: nodeBoyut },
  olusturma: new Date().toISOString(),
  giris: { baslatici: "start.bat", server: "dist/server.js", bin: pkg.bin ?? {} },
  icerik: {
    dosyaSayisi,
    toplamBayt,
    baytlar: { node: bayt(nodeAd), dist: bayt("dist"), nodeModules: bayt("node_modules") },
  },
  nodeModulesKurali: {
    kaynak: "prod bagimli kapanir kume (dependencies + optionalDependencies + peerDependencies, diskte kurulular)",
    kopyalananPaketSayisi: kume.size,
    kopyalanan: [...kume.keys()].sort(),
    haricUstGirdiler: haric,
    nedenHaric:
      "devDependencies calisma aninda gerekmez (typescript, @types/node); playwright dinamik import + harici " +
      "tarayici binary gerektirir — pakete gomulemez, yoklugu browser domainlerinde capability_unsupported doner; " +
      ".bin/ ve .package-lock.json npm shim'i gerektirmez (giris node.exe + dist/server.js).",
    cozulemeyenPeerler: [...new Set(cozulemeyen)].sort(),
  },
  frida: {
    binding: "node_modules/frida/build/frida_binding.node",
    bayt: existsSync(fridaBindingYolu) ? statSync(fridaBindingYolu).size : -1,
    paketleme: "dosya olarak tasinir; SEA blob'a gomulemez (docs/SEA-DAGITIM.md engel 1) — portable bundle bu yuzden tek dosya degil",
  },
  duman: {
    komut: "node dist/cli/index.js analyze-evm transfer(address,uint256) --json",
    beklenen: "0xa9059cbb",
  },
};
writeFileSync(join(dizin, "MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");

// 8. Zip (yalniz --zip ile; best-effort — basarisizsa dizin yine ciktidir).
let zipYolu = null;
if (zipIste) {
  try {
    zipYolu = `${dizin}.zip`;
    if (process.platform === "win32") {
      execFileSync(
        "powershell",
        ["-NoProfile", "-Command", `Compress-Archive -Path '${dizin}' -DestinationPath '${zipYolu}' -Force`],
        { timeout: 900_000 },
      );
    } else {
      execFileSync("tar", ["-czf", zipYolu, "-C", dirname(dizin), basename(dizin)], { timeout: 900_000 });
    }
    console.log(`[portable-paketle] zip: ${zipYolu} (${statSync(zipYolu).size} bayt)`);
  } catch (e) {
    console.warn(`[portable-paketle] UYARI: zip uretilemedi (${String(e).split("\n")[0]}); dizin ciktidir.`);
    zipYolu = null;
  }
}

console.log(`[portable-paketle] TAMAM: ${dizin}`);
console.log(`[portable-paketle] dosya: ${dosyaSayisi}, toplam: ${toplamBayt} bayt (node ${nodeBoyut} bayt)`);
console.log(`[portable-paketle] node_modules: ${kume.size} prod paket; haric ust: ${haric.join(", ")}`);
