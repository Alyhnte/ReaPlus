// wave19-research.test.mjs: angr / AFL++ / LLDB / TTD yoklamalari.
// Sahte ikili REA_*_BIN ile verilir. Canli fuzz, debug veya time-travel yok.
// Kos: npm run build sonrasi node --test tests/wave19-research.test.mjs
import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  rea_angr_explore,
  rea_afl_fuzz,
  rea_lldb_script,
  rea_ttd_info,
  ANGR_EXPLORE_ARGS,
  AFL_FUZZ_ARGS,
  LLDB_SCRIPT_ARGS,
  TTD_INFO_ARGS,
  RESEARCH_PROBE_TIMEOUT_MS,
} from "../dist/rea-domains/research/ResearchProbes.js";
import { reaToolMetadata } from "../dist/server/toolMetadata.js";
import { TOOLSETS } from "../dist/server/toolsets.js";
import { applyWorkspaceRoot } from "../dist/server/workspaceRoot.js";

const ENV = ["PATH", "REA_ANGR_BIN", "REA_AFL_BIN", "REA_LLDB_BIN", "REA_TTD_BIN", "REA_WORKSPACE_ROOT"];
const onceki = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));

function dizin() {
  return mkdtempSync(join(tmpdir(), "rea-w19-"));
}

function sahte(kok, ad, govde) {
  const js = join(kok, `${ad}.mjs`);
  writeFileSync(js, govde);
  const node = process.execPath.replace(/"/g, "");
  if (process.platform === "win32") {
    const cmd = join(kok, `${ad}.cmd`);
    writeFileSync(cmd, `@echo off\r\n"${node}" "%~dp0${ad}.mjs" %*\r\n`);
    return cmd;
  }
  const bin = join(kok, ad);
  writeFileSync(bin, `#!/bin/sh\nexec "${node}" "${js.replace(/\\/g, "/")}" "$@"\n`);
  chmodSync(bin, 0o755);
  return bin;
}

function argvYazan(kok, ad, satirlar, cikis = 0) {
  const kayit = join(kok, `${ad}-argv.json`);
  const yaz = satirlar.map((s) => `console.log(${JSON.stringify(s)});`).join("\n");
  const govde = `import { writeFileSync } from "node:fs";
writeFileSync(${JSON.stringify(kayit)}, JSON.stringify(process.argv));
${yaz}
process.exit(${cikis});
`;
  return { bin: sahte(kok, ad, govde), kayit };
}

afterEach(() => {
  for (const k of ENV) {
    if (onceki[k] === undefined) delete process.env[k];
    else process.env[k] = onceki[k];
  }
});

describe("dalga 19 yoklama sozlesmesi", () => {
  it("zaman asimi 5 saniyenin altindadir", () => {
    assert.ok(RESEARCH_PROBE_TIMEOUT_MS < 5000);
    assert.deepEqual(AFL_FUZZ_ARGS, ["--version"]);
    assert.deepEqual(LLDB_SCRIPT_ARGS, ["--version"]);
    assert.deepEqual(TTD_INFO_ARGS, ["--version"]);
  });

  it("dort arac outputSchema ve readOnlyHint tasir; ozel profillerde yoktur", () => {
    for (const ad of ["rea_angr_explore", "rea_afl_fuzz", "rea_lldb_script", "rea_ttd_info"]) {
      const meta = reaToolMetadata(ad);
      assert.ok(meta?.outputSchema, `${ad} outputSchema yok`);
      assert.equal(meta.annotations?.readOnlyHint, true, `${ad} readOnlyHint true olmali`);
      assert.equal(meta.annotations?.destructiveHint, false);
      for (const liste of Object.values(TOOLSETS)) {
        assert.equal(liste.includes(ad), false, `${ad} ozel profilde`);
      }
    }
  });
});

describe("rea_angr_explore", () => {
  it("sahte python tek JSON satirini paths ve constraints olarak okur", () => {
    const kok = dizin();
    const hedef = join(kok, "ornek.bin");
    writeFileSync(hedef, "ornek");
    const { bin, kayit } = argvYazan(kok, "python", ['{"ok":true,"paths":2,"constraints":1}']);
    process.env.REA_ANGR_BIN = bin;
    const r = rea_angr_explore(hedef);
    assert.equal(r.ok, true);
    assert.equal(r.arac, "rea_angr_explore");
    assert.equal(r.paths, 2);
    assert.equal(r.constraints, 1);
    const argv = JSON.parse(readFileSync(kayit, "utf8"));
    assert.deepEqual(argv.slice(-ANGR_EXPLORE_ARGS(hedef).length), [...ANGR_EXPLORE_ARGS(hedef)]);
    assert.equal(readFileSync(hedef, "utf8"), "ornek");
  });

  it("PATH uzerindeki python da ayni JSON sozlesmesini okur", () => {
    const kok = dizin();
    const { bin } = argvYazan(kok, "python", ['{"ok":true,"paths":2,"constraints":1}']);
    assert.ok(bin.endsWith("python.cmd") || bin.endsWith("python") || bin.endsWith("python.exe"));
    delete process.env.REA_ANGR_BIN;
    process.env.PATH = `${kok}${delimiter}${onceki.PATH ?? ""}`;
    const r = rea_angr_explore(join(kok, "hedef.bin"));
    assert.equal(r.ok, true);
    assert.equal(r.paths, 2);
    assert.equal(r.constraints, 1);
  });

  it("olmayan ikili, JSON olmayan stdout ve sifir disi cikis capability_unsupported; yol sayisi uydurulmaz", () => {
    const kok = dizin();
    process.env.REA_ANGR_BIN = join(kok, "python-yok.exe");
    const yok = rea_angr_explore(join(kok, "a.bin"));
    assert.equal(yok.ok, false);
    assert.equal(yok.code, "capability_unsupported");
    assert.equal(yok.paths, undefined);

    const bozuk = sahte(kok, "py-bozuk", `console.log("not-json");\nprocess.exit(0);\n`);
    process.env.REA_ANGR_BIN = bozuk;
    const jsonDegil = rea_angr_explore(join(kok, "a.bin"));
    assert.equal(jsonDegil.ok, false);
    assert.equal(jsonDegil.code, "capability_unsupported");
    assert.equal(jsonDegil.paths, undefined);

    const { bin } = argvYazan(kok, "py-hata", ['{"ok":true,"paths":99,"constraints":7}'], 2);
    process.env.REA_ANGR_BIN = bin;
    const cikis = rea_angr_explore(join(kok, "a.bin"));
    assert.equal(cikis.ok, false);
    assert.equal(cikis.code, "capability_unsupported");
    assert.equal(cikis.paths, undefined);
    assert.equal(cikis.constraints, undefined);
  });

  it("yol calisma kokune uyar", () => {
    const kok = dizin();
    const dis = dizin();
    process.env.REA_WORKSPACE_ROOT = kok;
    const ic = applyWorkspaceRoot("rea_angr_explore", { path: join(kok, "ic.bin") }, process.env, kok);
    assert.equal(ic.path, join(kok, "ic.bin"));
    assert.throws(() => applyWorkspaceRoot("rea_angr_explore", { path: join(dis, "dis.bin") }, process.env, kok));
  });
});

describe("rea_afl_fuzz", () => {
  it("surum ve execs_done satirini okur; hedef vermez ve kampanya baslatmaz", () => {
    const kok = dizin();
    const { bin, kayit } = argvYazan(kok, "afl", ["afl-fuzz++4.21c", "execs_done : 10"]);
    process.env.REA_AFL_BIN = bin;
    const r = rea_afl_fuzz();
    assert.equal(r.ok, true);
    assert.equal(r.arac, "rea_afl_fuzz");
    assert.equal(r.version, "afl-fuzz++4.21c");
    assert.equal(r.execs_done, 10);
    assert.equal(r.session, undefined);
    const argv = JSON.parse(readFileSync(kayit, "utf8"));
    assert.deepEqual(argv.slice(-AFL_FUZZ_ARGS.length), [...AFL_FUZZ_ARGS]);
    assert.equal(argv.some((a) => String(a).includes("hedef")), false);
  });

  it("ikili yoksa veya execs_done satiri yoksa capability_unsupported", () => {
    const kok = dizin();
    process.env.REA_AFL_BIN = join(kok, "afl-yok.exe");
    const yok = rea_afl_fuzz();
    assert.equal(yok.ok, false);
    assert.equal(yok.code, "capability_unsupported");
    assert.equal(yok.execs_done, undefined);

    delete process.env.REA_AFL_BIN;
    const envYok = rea_afl_fuzz();
    assert.equal(envYok.code, "capability_unsupported");

    const bin = sahte(kok, "afl-surum", `console.log("afl-fuzz++4.21c");\nprocess.exit(0);\n`);
    process.env.REA_AFL_BIN = bin;
    const satirsiz = rea_afl_fuzz();
    assert.equal(satirsiz.ok, false);
    assert.equal(satirsiz.code, "capability_unsupported");
    assert.equal(satirsiz.execs_done, undefined);
  });

  it("donguye giren sahte fuzz basari sayilmaz", () => {
    const kok = dizin();
    const pidDosya = join(kok, "pid.txt");
    const bin = sahte(kok, "afl-dongu", `import { writeFileSync } from "node:fs";
writeFileSync(${JSON.stringify(pidDosya)}, String(process.pid));
console.log("afl-fuzz++4.21c");
console.log("execs_done : 10");
setInterval(() => {}, 1000);
`);
    process.env.REA_AFL_BIN = bin;
    const bas = Date.now();
    const r = rea_afl_fuzz();
    const sure = Date.now() - bas;
    if (existsSync(pidDosya)) {
      const pid = readFileSync(pidDosya, "utf8").trim();
      spawnSync("taskkill", ["/PID", pid, "/T", "/F"], { windowsHide: true });
    }
    assert.equal(r.ok, false);
    assert.equal(r.code, "capability_unsupported");
    assert.equal(r.execs_done, undefined);
    assert.ok(sure < 8000, `zaman asimi gec geldi: ${sure}ms`);
  });
});

describe("rea_lldb_script", () => {
  it("stop reason satirini okur; canli oturum iddiasinda bulunmaz", () => {
    const kok = dizin();
    const { bin, kayit } = argvYazan(kok, "lldb", ["(lldb) target create", "stop reason = breakpoint 1.1"]);
    process.env.REA_LLDB_BIN = bin;
    const r = rea_lldb_script();
    assert.equal(r.ok, true);
    assert.equal(r.arac, "rea_lldb_script");
    assert.equal(r.stop_reason, "breakpoint 1.1");
    assert.equal(r.session, undefined);
    const argv = JSON.parse(readFileSync(kayit, "utf8"));
    assert.deepEqual(argv.slice(-LLDB_SCRIPT_ARGS.length), [...LLDB_SCRIPT_ARGS]);
  });

  it("ikili yoksa veya stop reason yoksa capability_unsupported", () => {
    const kok = dizin();
    process.env.REA_LLDB_BIN = join(kok, "lldb-yok.exe");
    const yok = rea_lldb_script();
    assert.equal(yok.ok, false);
    assert.equal(yok.code, "capability_unsupported");
    assert.equal(yok.stop_reason, undefined);

    const bin = sahte(kok, "lldb-bos", `console.log("(lldb) target create");\nprocess.exit(0);\n`);
    process.env.REA_LLDB_BIN = bin;
    const bos = rea_lldb_script();
    assert.equal(bos.ok, false);
    assert.equal(bos.code, "capability_unsupported");
    assert.equal(bos.stop_reason, undefined);
  });
});

describe("rea_ttd_info", () => {
  it("ModuleCount okur; time-travel oturumu acmaz", () => {
    const kok = dizin();
    const { bin, kayit } = argvYazan(kok, "ttd", ["TraceDump.exe", "ModuleCount: 3"]);
    process.env.REA_TTD_BIN = bin;
    const r = rea_ttd_info();
    assert.equal(r.ok, true);
    assert.equal(r.arac, "rea_ttd_info");
    assert.equal(r.module_count, 3);
    assert.equal(r.session, undefined);
    assert.equal(r.time_travel, undefined);
    const argv = JSON.parse(readFileSync(kayit, "utf8"));
    assert.deepEqual(argv.slice(-TTD_INFO_ARGS.length), [...TTD_INFO_ARGS]);
  });

  it("ikili yoksa veya ModuleCount yoksa capability_unsupported", () => {
    const kok = dizin();
    process.env.REA_TTD_BIN = join(kok, "ttd-yok.exe");
    const yok = rea_ttd_info();
    assert.equal(yok.ok, false);
    assert.equal(yok.code, "capability_unsupported");
    assert.equal(yok.module_count, undefined);

    const bin = sahte(kok, "ttd-bos", `console.log("TraceDump.exe");\nprocess.exit(0);\n`);
    process.env.REA_TTD_BIN = bin;
    const bos = rea_ttd_info();
    assert.equal(bos.ok, false);
    assert.equal(bos.code, "capability_unsupported");
    assert.equal(bos.module_count, undefined);
  });
});
