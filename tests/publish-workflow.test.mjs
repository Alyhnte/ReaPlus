import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Statik guvenlik testi: .github/workflows/publish.yml canli kosulmadan,
// yalniz metin uzerinden zincir modeli dogrulanir.
// Model: TEK tetikleyici (v* tag push) -> kapilar -> npm publish (NPM_TOKEN,
// --provenance ile OIDC imzali) -> npm gorunurluk bekleme -> MCP Registry
// publish (OIDC) + release-artifacts (SBOM'u GitHub Release'e ekler).
// Manuel tetikleyici yoktur (cift-kosucu duplicate-version yarisini bitirir).

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wfPath = path.join(root, ".github", "workflows", "publish.yml");
const wf = existsSync(wfPath) ? readFileSync(wfPath, "utf8") : "";
const lines = wf.split(/\r?\n/);

function sira(...parcalar) {
  let onceki = -1;
  for (const p of parcalar) {
    const idx = wf.indexOf(p);
    assert.ok(idx > onceki, `'${p}' bulunmali ve onceki adimlardan sonra gelmeli (idx=${idx}, onceki=${onceki})`);
    onceki = idx;
  }
}

describe("publish zincir guvenlik kosullari", () => {
  it("publish.yml mevcuttur", () => {
    assert.ok(existsSync(wfPath), ".github/workflows/publish.yml olmali");
    assert.ok(wf.length > 0, "workflow bos olmamali");
  });

  it("tek tetikleyici: v* tag push; manuel/dis tetikleyici yoktur", () => {
    const onBas = wf.indexOf("\non:");
    const onSon = wf.indexOf("\npermissions:");
    assert.ok(onBas >= 0 && onSon > onBas, "on: blogu permissions oncesinde bulunmali");
    const onBlogu = wf.slice(onBas, onSon);
    assert.ok(onBlogu.includes("tags:"), "tag tetikleyici olmali");
    assert.ok(onBlogu.includes('"v*"'), "v* tag deseni olmali");
    for (const yasak of ["workflow_dispatch:", "pull_request:", "pull_request_target:", "release:", "schedule:", "branches:"]) {
      assert.ok(!onBlogu.includes(yasak), `on: blogunda '${yasak}' olmamali (tek tetikleyici)`);
    }
  });

  it("global izinler yalniz contents:read + id-token:write", () => {
    assert.match(wf, /^permissions:\s*\n\s+contents:\s*read\s*\n\s+id-token:\s*write\s*$/m, "global permissions tam olarak contents:read + id-token:write olmali");
    for (const yasak of ["write-all", "packages: write", "actions: write", "id-token: read"]) {
      assert.ok(!wf.includes(yasak), `'${yasak}' olmamali`);
    }
    // contents: write yalnizca release-artifacts job'unun kendi izin blogunda olabilir.
    const icYazan = wf.split("contents: write").length - 1;
    assert.ok(icYazan <= 1, "contents: write en fazla bir kez (release-artifacts job'unda) olmali");
    assert.ok(wf.includes("  release-artifacts:"), "release-artifacts job'u olmali");
    assert.match(wf, /release-artifacts:[\s\S]*?permissions:\s*\n\s+contents:\s*write/, "contents: write yalnizca release-artifacts job'unda olmali");
  });

  it("Ubuntu + Node 22 + npm registry-url kullanir", () => {
    assert.ok(wf.includes("runs-on: ubuntu-latest"), "ubuntu-latest olmali");
    assert.ok(wf.includes("actions/setup-node@v4"), "setup-node@v4 olmali");
    assert.match(wf, /node-version:\s*22\b/, "Node 22 olmali");
    assert.ok(wf.includes('registry-url: "https://registry.npmjs.org"'), "registry-url npmjs olmali");
    assert.ok(wf.includes("actions/checkout@v4"), "checkout@v4 olmali");
  });

  it("kapilar sirali: npm ci -> typecheck -> build -> npm test -> publish kontrol -> npm publish", () => {
    sira(
      "run: npm ci",
      "run: npm run typecheck",
      "run: npm run build",
      "run: npm test",
      "Publish kontrol",
      "tests/publish.test.mjs",
      "tests/publish-workflow.test.mjs",
      "node scripts/publish-kontrol.mjs",
      "npm publish --access public",
    );
  });

  it("npm publish NPM_TOKEN secret ile yapilir (token metni workflow'da yok)", () => {
    assert.ok(wf.includes("NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}"), "NPM_TOKEN secret bagli olmali");
    // Ham token asla dosyada olmaz: 30+ karakterlik npm_ kimligi aranir.
    assert.ok(!/npm_[A-Za-z0-9]{20,}/.test(wf), "ham npm token workflow'da olmamali");
    assert.ok(!wf.includes("_authToken"), "_authToken workflow'da olmamali");
  });

  it("registry job npm job'una baglidir (needs) ve gorunurluk bekler", () => {
    assert.ok(wf.includes("needs: publish-npm"), "registry job publish-npm'e bagli olmali");
    sira("needs: publish-npm", "npm gorunurluk bekleme", "mcp-publisher publish");
    assert.ok(wf.includes("npm view rea-plus version"), "gorunurluk yoklamasi npm view ile olmali");
  });

  it("mcp-publisher: validate -> github-oidc login -> publish sirasi", () => {
    sira(
      "mcp-publisher validate",
      "login github-oidc",
      "mcp-publisher publish",
    );
  });

  it("diger yasaklar: git push/tag, continue-on-error, canli test, dry-run dali", () => {
    for (const yasak of ["git push", "git tag", "continue-on-error", "test:live", "npm install\n", "npm i ", "workflow_dispatch", "confirm_publish", "--dry-run"]) {
      assert.ok(!wf.includes(yasak), `'${yasak.trim()}' workflow'da olmamali`);
    }
  });
});

describe("npm provenance + SBOM release zinciri", () => {
  it("npm publish adiminda --provenance flag'i vardir", () => {
    assert.ok(wf.includes("npm publish --access public --provenance"), "npm publish --provenance ile yapilmali (OIDC imzali publish)");
    assert.ok(wf.includes("id-token: write"), "provenance icin id-token:write izni olmali");
  });

  it("release-artifacts job'u publish-npm'e baglidir (needs)", () => {
    assert.match(wf, /release-artifacts:\s*\n\s+needs:\s*publish-npm/, "release-artifacts needs: publish-npm icermeli");
    assert.match(wf, /release-artifacts:[\s\S]*?runs-on:\s*ubuntu-latest/, "release-artifacts ubuntu-latest uzerinde kosmali");
  });

  it("release-artifacts: SBOM uretimi icin sbom-uret.mjs cagirilir", () => {
    assert.ok(wf.includes("node scripts/sbom-uret.mjs"), "sbom-uret.mjs cagrisi olmali");
  });

  it("release-artifacts: gh release create SBOM dosyasini release'e ekler", () => {
    assert.ok(wf.includes("gh release create"), "gh release create cagrisi olmali");
    assert.match(wf, /gh release create "\$GITHUB_REF_NAME"/, "gh release create tag adiyla ($GITHUB_REF_NAME) cagirilmali");
    assert.ok(wf.includes("--generate-notes"), "gh release create --generate-notes ile cagirilmali");
  });

  it("release-artifacts: npm ci -> sbom -> build -> portable-paketle --zip -> gh release sirasi", () => {
    // Sira yalnizca release-artifacts blogu icinde kontrol edilir; publish-npm'deki
    // ilk "npm run build" burada kirmizi yapmasin diye dilim uzerinden okunur.
    const ra = wf.slice(wf.indexOf("  release-artifacts:"), wf.indexOf("  publish-registry:"));
    assert.ok(ra.length > 0, "release-artifacts blogu bulunmali");
    let onceki = -1;
    for (const p of ["run: npm ci", "node scripts/sbom-uret.mjs", "run: npm run build", "node scripts/portable-paketle.mjs --zip", "gh release create"]) {
      const idx = ra.indexOf(p);
      assert.ok(idx > onceki, `release-artifacts icinde '${p}' sirayla gelmeli (idx=${idx}, onceki=${onceki})`);
      onceki = idx;
    }
  });

  it("release-artifacts: gh release create portable zip dosyasini da ekler", () => {
    assert.match(
      wf,
      /gh release create "\$GITHUB_REF_NAME"[^\r\n]*portable\/\*\.zip/,
      "gh release create --generate-notes sbom.cdx.json portable/*.zip formatinda olmali (portable asset release'e gider)",
    );
  });

  it("release-artifacts: gh release create adimi GH_TOKEN tasir", () => {
    // gh CLI Actions icinde token'ı yalnizca GH_TOKEN env'inden okur; job izni
    // (contents: write) tek basina yetmez — dogrulanmazsa adim exit code 4 ile duser.
    const adim = wf.match(
      /- name: GitHub Release olustur \(SBOM ekli\)\r?\n([\s\S]*?)(?=\r?\n  \S|\r?\n*$)/,
    );
    assert.ok(adim, "GitHub Release olustur adimi bulunmali");
    const blok = adim[1];
    assert.match(blok, /env:/, "adimin env blogu olmali");
    assert.match(
      blok,
      /GH_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/,
      "GH_TOKEN github.token ile bagli olmali",
    );
  });
});
