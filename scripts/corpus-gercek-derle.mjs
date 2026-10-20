// scripts/corpus-gercek-derle.mjs: golden korpus GERÇEK binary derleyicisi (yerel gcc).
// Koş: node scripts/corpus-gercek-derle.mjs (ağ yok; tests/corpus/src/*.c → tests/corpus/real_*).
// Çıktı: 5 derlenmiş artifact (3 PE exe + DLL + COFF obj) + boyut/sha256 raporu
// (HASHES.json güncellemesi için; hash'ler uydurulmaz, derleyiciden okunur).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(kok, "tests", "corpus", "src");
const corpusDir = join(kok, "tests", "corpus");

// gcc adayı: env → PATH → WinGet WinLibs paket dizininde wildcard arama.
function gccBul() {
  const env = process.env.REA_CORPUS_GCC;
  if (env && existsSync(env)) return env;
  const probe = spawnSync("gcc", ["--version"], { stdio: "ignore" });
  if (probe.status === 0) return "gcc";
  const paketler = join(process.env.LOCALAPPDATA ?? "", "Microsoft", "WinGet", "Packages");
  if (existsSync(paketler)) {
    for (const ad of readdirSync(paketler)) {
      if (!ad.startsWith("BrechtSanders.WinLibs")) continue;
      const yol = join(paketler, ad, "mingw64", "bin", "gcc.exe");
      if (existsSync(yol)) return yol;
    }
  }
  return null;
}

// Deterministik PE: COFF TimeDateStamp gömülmez (ld --no-insert-timestamp).
const DERLEMELER = [
  { hedef: "real_tiny.exe", kaynak: "tiny_exit.c", bayrak: ["-Os", "-mwindows", "-s", "-Wl,--no-insert-timestamp"] },
  { hedef: "real_tiny_console.exe", kaynak: "hello.c", bayrak: ["-O0", "-Wl,--no-insert-timestamp"] },
  { hedef: "real_tiny_o2.exe", kaynak: "hello.c", bayrak: ["-O2", "-Wl,--no-insert-timestamp"] },
  { hedef: "real_dll.dll", kaynak: "dll_add.c", bayrak: ["-O2", "-shared", "-Wl,--no-insert-timestamp"] },
  { hedef: "real_tiny.obj", kaynak: "tiny_exit.c", bayrak: ["-c", "-O2"] },
];

const gcc = gccBul();
if (!gcc) {
  console.error("HATA: gcc yok (PATH + bilinen WinGet konumu denendi); gerçek binary üretilemez");
  process.exit(1);
}
for (const d of DERLEMELER) {
  const s = join(srcDir, d.kaynak);
  const o = join(corpusDir, d.hedef);
  const r = spawnSync(gcc, [...d.bayrak, "-o", o, s], { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
  if (r.status !== 0) {
    console.error(`HATA ${d.hedef}: gcc çıkış ${r.status}\n${r.stderr ?? ""}`);
    process.exit(1);
  }
  const bayt = readFileSync(o);
  console.log(`${d.hedef}\t${statSync(o).size} bayt\tsha256=${createHash("sha256").update(bayt).digest("hex")}\t${gcc} ${d.bayrak.join(" ")} ${d.kaynak}`);
}
