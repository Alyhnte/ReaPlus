import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (ad) => JSON.parse(readFileSync(path.join(root, ad), "utf8"));

function constVersion(relPath) {
  const src = readFileSync(path.join(root, relPath), "utf8");
  const m = src.match(/export\s+const\s+REA_PLUS_VERSION\s*=\s*"([^"]+)"/);
  assert.ok(m, `${relPath} icinde REA_PLUS_VERSION sabiti bulunmali`);
  return m[1];
}

describe("surum senkronu (tek otorite: package.json version)", () => {
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");
  const server = readJson("server.json");

  it("tum surum alanlari package.json version ile ayni", () => {
    assert.match(pkg.version, /^\d+\.\d+\.\d+$/, "package.json version semver olmali");
    const alanlar = new Map([
      ["package.json version", pkg.version],
      ["package-lock.json version", lock.version],
      ["package-lock.json packages[''] version", lock.packages?.[""]?.version],
      ["server.json version", server.version],
      ["server.json packages[0] version", server.packages?.[0]?.version],
      ["src/server.ts REA_PLUS_VERSION", constVersion("src/server.ts")],
      ["src/facade/createReaPlusServer.ts REA_PLUS_VERSION", constVersion("src/facade/createReaPlusServer.ts")],
    ]);
    for (const [ad, surum] of alanlar) {
      assert.equal(typeof surum, "string", `${ad} tanimli olmali`);
      assert.equal(surum, pkg.version, `${ad} (${surum}) package.json version (${pkg.version}) ile ayni olmali`);
    }
  });

  it("lock/server paket adlari package.json name ile ayni", () => {
    assert.equal(lock.name, pkg.name);
    assert.equal(lock.packages?.[""]?.name, pkg.name);
    assert.equal(server.packages?.[0]?.identifier, pkg.name);
  });

  it("package.json/package-lock.json/server.json BOM'suzdur", () => {
    for (const ad of ["package.json", "package-lock.json", "server.json"]) {
      const raw = readFileSync(path.join(root, ad));
      assert.ok(!(raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf), `${ad} BOM icermemeli`);
    }
  });
});

describe("surum tasiyici belgeler (kok + i18n + site + manifest)", () => {
  const pkg = readJson("package.json");
  const oku = (rel) => readFileSync(path.join(root, rel), "utf8");
  const DILLER = ["de", "en", "es", "fr"];

  it("i18n dil dizinleri yerinde", () => {
    const dizinler = readdirSync(path.join(root, "docs", "i18n"), { withFileTypes: true })
      .filter((g) => g.isDirectory())
      .map((g) => g.name);
    for (const dil of DILLER) assert.ok(dizinler.includes(dil), `docs/i18n/${dil} bulunmali`);
  });

  function tasiyici(ad, metin, re, aciklama) {
    const m = metin.match(re);
    assert.ok(m, `${ad}: ${aciklama} bulunamadi`);
    assert.equal(m[1], pkg.version, `${ad}: ${aciklama} (${m[1]}) package.json version (${pkg.version}) ile ayni olmali`);
  }

  it("README surum iddialari package.json ile ayni (kok + i18n + site)", () => {
    const hedefler = [
      "README.md",
      ...DILLER.map((d) => `docs/i18n/${d}/README.md`),
      "docs/site/readme.html",
      ...DILLER.map((d) => `docs/site/${d}/readme.html`),
    ];
    for (const ad of hedefler) {
      const iddialar = [...oku(ad).matchAll(/rea-plus@(\d+\.\d+\.\d+)/g)].map((m) => m[1]);
      assert.ok(iddialar.length > 0, `${ad}: rea-plus@ surum iddiasi bulunamadi`);
      for (const surum of iddialar) {
        assert.equal(surum, pkg.version, `${ad}: rea-plus@${surum} package.json version (${pkg.version}) ile ayni olmali`);
      }
    }
  });

  it("TOOLS.md sunucu surum satiri package.json ile ayni (kok + i18n + site)", () => {
    const md = /^- (?:Sunucu|Server|Servidor|Serveur)\s*:\s*`rea-plus`\s*(\d+\.\d+\.\d+)/m;
    for (const ad of ["docs/TOOLS.md", ...DILLER.map((d) => `docs/i18n/${d}/TOOLS.md`)]) {
      tasiyici(ad, oku(ad), md, "sunucu surum satiri");
    }
    const html = /<li>(?:Sunucu|Server|Servidor|Serveur)\s*:\s*<code>rea-plus<\/code>\s+(\d+\.\d+\.\d+)/;
    for (const ad of ["docs/site/tools.html", ...DILLER.map((d) => `docs/site/${d}/tools.html`)]) {
      tasiyici(ad, oku(ad), html, "sunucu surum satiri");
    }
  });

  it("ROADMAP durum satiri package.json ile ayni (kok + i18n + site)", () => {
    const md = /^> (?:Durum|Stand|Status|État|Estado)\s*:\s*v(\d+\.\d+\.\d+)/m;
    for (const ad of ["docs/ROADMAP.md", ...DILLER.map((d) => `docs/i18n/${d}/ROADMAP.md`)]) {
      tasiyici(ad, oku(ad), md, "durum satiri surumu");
    }
    const html = /<blockquote>(?:Durum|Stand|Status|État|Estado)\s*:\s*v(\d+\.\d+\.\d+)/;
    for (const ad of ["docs/site/roadmap.html", ...DILLER.map((d) => `docs/site/${d}/roadmap.html`)]) {
      tasiyici(ad, oku(ad), html, "durum satiri surumu");
    }
  });

  it("CHANGELOG en ust surumu package.json ile ayni (kok + i18n + site)", () => {
    const md = /^## \[(\d+\.\d+\.\d+)\]/m;
    for (const ad of ["CHANGELOG.md", ...DILLER.map((d) => `docs/i18n/${d}/CHANGELOG.md`)]) {
      tasiyici(ad, oku(ad), md, "en ust surum girisi");
    }
    const html = /<h2 id="[^"]*">\[(\d+\.\d+\.\d+)\]/;
    for (const ad of ["docs/site/changelog.html", ...DILLER.map((d) => `docs/site/${d}/changelog.html`)]) {
      tasiyici(ad, oku(ad), html, "en ust surum girisi");
    }
  });

  it("dagitim manifestleri package.json surumunu tasir", () => {
    const yamllar = [];
    const gez = (d) => {
      for (const g of readdirSync(d, { withFileTypes: true })) {
        const tam = path.join(d, g.name);
        if (g.isDirectory()) gez(tam);
        else if (/\.ya?ml$/.test(g.name)) yamllar.push(tam);
      }
    };
    gez(path.join(root, "winget"));
    assert.ok(yamllar.length > 0, "winget altinda YAML bulunamadi");
    assert.ok(yamllar.some((y) => y.split(path.sep).includes(pkg.version)), `winget surum dizini (${pkg.version}) bulunamadi`);
    for (const y of yamllar) {
      tasiyici(path.relative(root, y), readFileSync(y, "utf8"), /PackageVersion\s*:\s*["']?(\d+\.\d+\.\d+)/, "PackageVersion");
    }
    assert.equal(readJson("scoop/rea-plus.json").version, pkg.version, "scoop version package.json ile ayni olmali");
    tasiyici("homebrew/rea-plus.rb", oku("homebrew/rea-plus.rb"), /version\s+["'](\d+\.\d+\.\d+)["']/, "formula version");
  });
});
