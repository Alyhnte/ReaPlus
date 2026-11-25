# Research — commercial integrations (IDA / Hopper / JEB)

> Tag key: each item ends with **[in-repo]** (checkable against a file in this repo) or **[unverified]** (from the repo plus training data; not confirmed in an official document). No invented API or URL. An official address that is not certain is not written down.

## 1. State today

- All three commercial providers are **gate-only** (a gate plus `capability_unsupported`, no analysis) **[in-repo]** (rows in `docs/TOOL-COVERAGE.md`):
  - Hopper: `HopperProvider.ts` open/close plus `hopperDurumu` / `hopperYolu`, `REA_HOPPER_PATH`, and a darwin/linux gate (no exec) **[in-repo]**.
  - IDA: `IdaProvider.ts` open/close plus `idaYolu`, an idat64/idat/ida64 `-h` probe (exec-probe only, no analysis exec) **[in-repo]**.
  - JEB: `JebProvider.ts` open/close plus `jebDurumu` / `jebMcpUrl`, validation of `REA_JEB_MCP_URL` (no spawn and no fetch, by design) **[in-repo]**.
- Hopper has a judgment on record: research is done, there is NO headless API (from official sources), so the tool stays honest as request preparation, and a POSIX similarity gate was added **[in-repo]** (`docs/ROADMAP.md` section E).
- Standing judgment: commercially licensed tools stay gated (Hopper/IDA/JEB) **[in-repo]** (`docs/ROADMAP-NEXT.md`).
- Catalog: 3 of the 8 rea entries are commercial (`hopper`, `ida`, `jeb` on the rea side) **[in-repo]** (`docs/DETECTION.md` section 2, `docs/MCP-CONTRACTS.md`).

## 2. Official source / API (an honest gate per vendor)

- **Hopper: NO gate for analysis.** The repo's research already judged that there is no headless query API **[in-repo]**. This file does not claim a new gate.
- **IDA: the gate is PARTIAL.** A console executable plus a batch-script path (IDAPython) appears to exist (the idat probe is in-repo **[in-repo]**; the batch-script API details are **[unverified]**). A live bridge needs a license plus a batch pipeline. A clean query API was not confirmed **[unverified]**.
- **JEB: a gate EXISTS at the interface.** The JEB side offers an MCP URL. The repo validates `jebMcpUrl` and deliberately leaves the call to the caller (caller-owned) **[in-repo]** (the JEB row in `docs/TOOL-COVERAGE.md`). Server-side work is arranging caller-owned calls. There is no new protocol (judgment).
- Shared limit: all three are licensed. This file does not claim license terms or prices **[unverified]** (not written).

## 3. Interface required (proposal, no code)

- Keep the current gate-only pattern: status / path / MCP-URL gates under `src/rea-domains/{hopper,ida,jeb}/`, and `capability_unsupported` when the tool is missing **[in-repo]** (current files plus `docs/MCP-CONTRACTS.md`).
- New work is only worth considering for an IDA batch-script pipeline (produce an idb, read the dump, behind `rea_` tools). No new interface for Hopper (no analysis gate). No server-side call for JEB (caller-owned). All of that is a proposal.
- A fallback chain (`ghidra`, then `hopper`, then `ida`) is already in the improvement notes **[in-repo]** (`docs/IMPROVEMENTS-DETAILED.md` section 3). Until a commercial gate actually analyzes, that leg of the chain runs as a closed branch.

## 4. Effort

- **L** (a month or more). The Hopper row in ROADMAP is L **[in-repo]**. An IDA batch pipeline plus licensed CI verification (a licensed product does not run in CI) keeps the estimate at L (judgment).

## 5. Recommendation

- **DO NOT** build a new commercial bridge. Reason: Hopper has no analysis gate **[in-repo]**, IDA has no confirmed clean query API **[unverified]**, and JEB has no server-side job (caller-owned) **[in-repo]**. License cost plus effort L means a poor return even at P3. Keep the current gate-only plus handoff pattern. In a licensed environment the agent still gets an honest `capability_unsupported` plus an install hint **[in-repo]**.
