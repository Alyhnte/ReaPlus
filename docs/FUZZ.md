# Fuzz guide

A repeatable fuzz layer aimed at the parsers (ROADMAP P3).
It is Node-based. AFL++ and WSL are not required, and it runs on this machine. Wiring AFL++ itself stays open.

## Prerequisite

```sh
npm run build   # tests want the parsers in dist/
```

## Quick run (CI-friendly, under 60s)

```sh
node scripts/fuzz-harness.mjs --seed 1 --adet 50
```

Default budget: 50 inputs per target, 2000 ms cap per call, 45000 ms cap overall. Exit code: `0` when there are no findings, `1` when there is a crash, a hang, or a skip, `2` on a runner error. The summary on stdout is JSON. The detailed report lives under `--rapor-dir` (default: the tmp dir).

A longer run:

```sh
node scripts/fuzz-harness.mjs --seed 7 --adet 500 --toplam-tavan 300000 --rapor-dir ./tmp-fuzz-7
```

## Report

`--rapor-dir` gets two files:

- `ozet.json` — seed / count / caps, totals for crash / hang / skipped, the `sinif` distribution, signature groups, and seed sha256 values (so a run can be repeated).
- `rapor.md` — a human summary, the group table, and the command to repeat the run.
- `repro/` — inputs that crashed or hung (`.bin` plus `.json` metadata).

## Crash classes

These strings are the `sinif` values the harness emits. They stay as written in code.

| Class | Meaning |
|---|---|
| `tip` | `TypeError` |
| `aralik` | `RangeError` |
| `sozdizimi` | `SyntaxError` |
| `yigin-tasmasi` | call-stack overflow (message match) |
| `bellek` | out of memory (message match) |
| `genel` | other `Error` values |
| `bilinmeyen` | a throw that is not an `Error` (string, number, ...) |

The same `sinif:name:message` signature is collected into one group.

## Seed rules

- Seeds are read read-only from `tests/corpus`. They are **never written**.
- If you suspect corruption: `git restore -- tests/corpus/<file>` and check with `node scripts/verify-corpus.mjs`.
- Working files and repros live only under the tmp dir or `--rapor-dir`. They are not written into a real user directory.

## CI

The `fuzz-parsers.mjs` smoke step in `ci.yml` stays. This harness is the targeted layer. It is checked with `node --test tests/fuzz-harness.test.mjs`.

## AFL++ note

If AFL++ is installed, `repro/*.bin` can be reused as AFL++ corpus seeds. Downloading or installing AFL++ is not this harness's job (no network download). An AFL++ integration that returns `capability_unsupported` when the dependency is absent is wave 19, and it is not done.
