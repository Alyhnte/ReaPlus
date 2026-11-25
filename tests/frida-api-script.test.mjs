// frida-api-script.test.mjs: enjekte edilen API iz betiği kaynak kilidi.
// CANLI TEST DEĞİL: Frida'ya bağlanmaz, süreç açmaz. Betik metnini
// buildApiTracerSource() üretir; rea_frida_api aynı fonksiyonu yükler.
// Koş: npm run build sonrası `node --test tests/frida-api-script.test.mjs`
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildApiTracerSource } from "../dist/rea-domains/frida-plus/ApiTracer.js";

describe("rea_frida_api betiği (canlı değil)", () => {
  it("kanca kurar ve bekler; CreateFileW, GetTickCount, CloseHandle çağırmaz", () => {
    const src = buildApiTracerSource();
    assert.equal(src.includes("CreateFileW"), false);
    assert.equal(src.includes("GetTickCount"), false);
    assert.equal(src.includes("CloseHandle"), false);
    assert.equal(src.includes("Interceptor.attach"), true);
    assert.equal(src.includes("enumerateImports"), true);
    assert.equal(src.includes("setTimeout"), true);
  });
});
