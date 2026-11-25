# Research — an LLDB engine (live debug on Linux/macOS)

> Tag key: each item ends with **[in-repo]** (checkable against a file in this repo) or **[unverified]** (from the repo plus training data; not confirmed in an official document). No invented API or URL. An official address that is not certain is not written down.

## 1. State today

- Live debug is Windows-only. Conduit engines under `src/conduit-core/engines/` are `cdb.ts`, `x64dbg.ts`, `frida.ts`, and `radare2.ts` (static) **[in-repo]**.
- The session router is `CONDUIT_ENGINES = { radare2, x64dbg, cdb, frida }` mapping to `"conduit"`. Everything else is `"rea-domains"` **[in-repo]** (`docs/DETECTION.md` section 4).
- ROADMAP section D: an LLDB engine (Linux/macOS) is still open. Live debug is Windows-only. Effort L, priority P3 **[in-repo]**.
- There is no LLDB code or gate (no `lldb.ts` under engines/, no `REA_LLDB_*` env) **[in-repo]**.
- CI is `ubuntu-latest` only. A self-hosted Windows runner is still absent. That does not by itself provide LLDB **[in-repo]**.

## 2. Official source / API

- LLDB is the LLVM debugger. It offers a scriptable SB API (`SBDebugger`, `SBTarget`, `SBProcess` and the rest of that family) and can be driven headless through its Python module **[unverified]**.
- A stable, documented SB API is what separates this item from Hopper. Hopper was judged to have NO headless API **[in-repo]** (`docs/ROADMAP.md` section E). LLDB appears to have a scriptable headless API **[unverified]**.
- License and distribution terms (which LLVM version, which Python, macOS signing requirements) were not confirmed **[unverified]**.

## 3. Interface required (proposal, no code)

- `src/conduit-core/engines/lldb.ts` (a new engine: spawn, session, events, the same abstraction as `cdb.ts` / `x64dbg.ts`) plus a registration in `engines/registry.ts` plus adding it to the session router as a conduit engine **[in-repo]** (file names come from the current layout; the contents are a proposal).
- An install gate: a `doctor` / `prerequisites` probe (LLDB plus the Python module). When it is missing, return `capability_unsupported`, the same shape as Hopper/IDA/JEB **[in-repo]** (pattern in `docs/DETECTION.md` section 5 and `docs/MCP-CONTRACTS.md`). Wave 19 (not done) is that integration: unsupported when the dependency is absent, working when it is present.
- A platform gate: enabled only on Linux/macOS. On Windows, a closed branch (the same shape as binwalk's linux-only plus handoff) **[in-repo]** (pattern on the binwalk row of `docs/TOOL-COVERAGE.md`).

## 4. Effort

- **L** (a month or more). ROADMAP already says L **[in-repo]**. A new live engine means session plus events plus timeout plus serialization. The cdb async-pause work was M **[in-repo]**.

## 5. Recommendation

- **WAIT.** Reason: the technical gate looks open (a headless scriptable API appears to exist) **[unverified]**, but the effort is L and P3 is the right slot. Still ahead of it: the P0 Frida live VM approval, the self-hosted Windows runner, and Trusted Publisher account setup **[in-repo]** (`docs/ROADMAP.md`, suggested order). Schema-budget CI and Pages deploy have already shipped (`ci.yml` runs `tests/schema-budget.test.mjs`; `pages.yml` deploys). They are not blockers for this row anymore. When P3 opens, the first prototype is a read-only `lldb` status gate plus `capability_unsupported`. Analysis comes after that. Do not mark this row closed.
