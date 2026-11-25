# Golden corpus

This directory holds the canonical fixtures for offline tests.

## Files

| File | Source | License |
|---|---|---|
| `mini_branch.elf` | unknown | unknown |
| `mini_pe_x64.exe` | unknown | unknown |
| `ornek.js` | produced by `scripts/korpus-kur.mjs` (deterministic) | unknown |
| `ornek.wasm` | produced by `scripts/korpus-kur.mjs` (deterministic) | unknown |
| `sahte.apk` | produced by `scripts/korpus-kur.mjs` (deterministic) | unknown |
| `real_tiny.exe` | `src/tiny_exit.c` + `scripts/corpus-gercek-derle.mjs` (local gcc, PE32+ x64) | MIT |
| `real_tiny_console.exe` | `src/hello.c` + `scripts/corpus-gercek-derle.mjs` (local gcc, PE32+ x64) | MIT |
| `real_tiny_o2.exe` | `src/hello.c` + `scripts/corpus-gercek-derle.mjs` (local gcc, PE32+ x64) | MIT |
| `real_dll.dll` | `src/dll_add.c` + `scripts/corpus-gercek-derle.mjs` (local gcc, PE32+ x64 DLL) | MIT |
| `real_tiny.obj` | `src/tiny_exit.c` + `scripts/corpus-gercek-derle.mjs` (local gcc, COFF obj) | MIT |
| `mini.dex` | produced by `scripts/dex-fixture-uret.mjs` (deterministic) | unknown |

The `real_*` files are real. They are compiled with local `gcc` (MinGW-w64) from the `src/*.c` sources in this directory. `-Wl,--no-insert-timestamp` keeps a COFF TimeDateStamp out of the image, so rebuilding with the same toolchain yields the same bytes (deterministic). Hashes are taken from the compiler output. They are not invented. On the ELF side, local `gcc` targets PE, so a real ELF cannot be produced (no cross toolchain). `mini_branch.elf` stays synthetic.

Unknown source and license cells are deliberately the string `bilinmiyor`. A made-up license is not written. When a fixture with a known origin is added, `HASHES.json` is updated. The manifest fields are `kaynak` and `lisans`.

## Check

```sh
node scripts/verify-corpus.mjs
```

On success the exit code is `0`. On a missing file, a mismatch, or a file outside the manifest, the report names the file and the exit code is `1`. `HASHES.json` and this `README.md` are not fixtures.

## Line-ending note (`ornek.js`)

`ornek.js` is a text file. `scripts/korpus-kur.mjs` writes it with LF. On a machine with `core.autocrlf=true`, `git checkout` / `git restore` yields CRLF. The `HASHES.json` reference points at the **post-restore/checkout** bytes (CRLF in this worktree). The `tests/corpus.test.mjs` run converts the file to LF. That churn is expected. When the test finishes, put it back with `git restore -- tests/corpus/ornek.js`.

## Adding a fixture

1. Put the file in this directory.
2. Compute the sha256 digest.
3. Add a new entry to `HASHES.json` with `kaynak` and `lisans` fields (if unknown, write `"bilinmiyor"`, do not invent one).
4. Check with `node scripts/verify-corpus.mjs`.
5. A file that is not in the manifest does not pass the tests (`tests/corpus-manifest.test.mjs`).
