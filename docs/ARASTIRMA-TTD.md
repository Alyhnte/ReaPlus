# Research — reading WinDbg TTD (Time Travel Debugging) traces

> Tag key: each item ends with **[in-repo]** (checkable against a file in this repo) or **[unverified]** (from the repo plus training data; not confirmed in an official document). No invented API or URL. An official address that is not certain is not written down.

## 1. State today

- There is no TTD code or gate (no TTD file under engines/, no TTD env) **[in-repo]**.
- The nearest engine is `cdb.ts`: it drives the console debugger over stdio. Async pause and real push events closed in v0.10.0 **[in-repo]** (`docs/ROADMAP.md` section D).
- ROADMAP section D still lists reading WinDbg TTD traces as missing, effort L, priority P3 **[in-repo]**. That row stays open.
- CI is `ubuntu-latest` only. There is no self-hosted Windows runner, so a Windows-only TTD path would not be exercised in CI **[in-repo]** (`.github/workflows/ci.yml`).

## 2. Official source / API

- TTD is WinDbg's time-travel record (Windows only): the target is recorded and can be queried backward and forward. Playback and queries go through WinDbg **[unverified]**.
- A clean, stable, headless "read the trace" API (the cdb-stdio equivalent) was not confirmed. The known query path is WinDbg's own command and script surface **[unverified]**.
- Producing a trace means running the target under TTD (heavy recording, large trace files) **[unverified]**. That splits "read a trace we were given" from "also produce the trace."
- Conclusion: the gate is **PARTIAL**. Playback and query look possible inside WinDbg, and there is no independent headless read API on the evidence we have **[unverified]**. That is close to the Hopper pattern (no headless API, so gate-only) **[in-repo]**.

## 3. Interface required (proposal, no code)

- Stage 1 (cheap, honest): given a TTD trace file, replay and query it through WinDbg/cdb. A TTD-replay branch behind the existing `cdb.ts` abstraction (proposal) **[in-repo]** (engine at `src/conduit-core/engines/cdb.ts`).
- Stage 2 (expensive): producing traces and indexing them. That needs its own engine file (proposal).
- At every stage a missing binding is `capability_unsupported`. No stub **[in-repo]** (rule in `docs/MCP-CONTRACTS.md`, pattern in `docs/DETECTION.md` section 5). Wave 19 (not done) is the planned integration: `capability_unsupported` when the dependency is absent, working when it is present.
- Windows-locked: on any other platform, a closed branch plus a handoff note (the same shape as binwalk's linux-only pattern) **[in-repo]**.

## 4. Effort

- **L** (a month or more). ROADMAP already says L **[in-repo]**. Stage 1 alone might be M, but trace-format churn plus the Windows lock keeps the estimate at L (judgment).

## 5. Recommendation

- **WAIT.** Reason: an independent headless read gate was not confirmed **[unverified]**. It is Windows-locked, effort L, and P3 is the right place **[in-repo]**. When P3 opens, try a stage-1 prototype (an existing trace plus a WinDbg replay query). Leave trace production for stage 2. Do not mark this row closed.
