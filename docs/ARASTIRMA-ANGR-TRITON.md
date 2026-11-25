# Research — symbolic execution (angr / Triton, WSL)

> Tag key: each item ends with **[in-repo]** (checkable against a file in this repo) or **[unverified]** (from the repo plus training data; not confirmed in an official document). No invented API or URL. An official address that is not certain is not written down.

## 1. State today

- There is no symbolic-execution code or gate **[in-repo]**.
- ROADMAP section F: symbolic execution (angr/Triton, WSL) is missing. It is the only real path in the VMProtect class. Effort L, priority P3 **[in-repo]**. The row stays open.
- The long-term section of `docs/ROADMAP-NEXT.md` still lists angr/Triton (WSL plus conda) as not done **[in-repo]**.
- The nearest existing pattern is the Android dynamic recipe: a 5-step generation plus a dry check, with missing tools flagged. That is a recipe, not an engine **[in-repo]** (`docs/ROADMAP.md` section F).

## 2. Official source / API

- angr is a Python symbolic-execution framework with a headless script API (project, state, simulation-manager). It installs with pip or conda **[unverified]**.
- Triton is a dynamic symbolic-execution library (C++/Python bindings). It needs an instrumentation backend **[unverified]**.
- Neither one is called directly from this repo (Node/MCP, Windows-heavy). They have to be bridged through WSL (`wsl.exe` plus a conda env inside WSL) **[unverified]** (the bridge requirement). The WSL path is not new for the repo: binwalk/unblob are linux-only with a handoff **[in-repo]** (`docs/TOOL-COVERAGE.md`).
- Known limits: state explosion caps coverage on real targets. License and distribution terms were not confirmed **[unverified]**.
- Conclusion: a gate **EXISTS** (both are headless and scriptable) but only together with the bridge (WSL plus conda) and the scale limits **[unverified]**.

## 3. Interface required (proposal, no code)

- Stage 1 (cheap, honest): a new area under `src/rea-domains/` (for example `symbolic/`), a gate provider in the Hopper/IDA/JEB shape: probe WSL and the conda env, and on a miss return `capability_unsupported` plus a recipe or handoff (like the Android dynamic recipe) **[in-repo]** (patterns in `docs/DETECTION.md` section 5 and `docs/ROADMAP.md` section F).
- Stage 2 (expensive): a real engine bridge. Send work to WSL, serialize the trace and the state, timeout plus cancel (the same shape as the job model) **[in-repo]** (job pattern in `docs/ROADMAP.md` section B).
- A new provider follows the `rea_` prefix and the collision rule (`qualifyReaTool`, `assertNoCollision`) **[in-repo]** (`docs/MCP-CONTRACTS.md`).
- Wave 19 (not done) is the planned real angr/Triton integration: `capability_unsupported` when the dependency is absent, working when it is present. New tools, if any are added then, land in the `all` profile only. That is not this document's job, and it is not in the tree today.

## 4. Effort

- **L** (a month or more). ROADMAP already says L **[in-repo]**. Stage 1 (recipe plus gate) alone could be S/M. A full engine is L (judgment).

## 5. Recommendation

- **WAIT** (the stage-1 recipe is the first P3 job). Reason: the gate is technically open **[unverified]**, but the WSL-plus-conda install cost and state explosion mean the value is on narrow targets. Start with a recipe and a handoff (an honest branch when the tool is missing — the IL2CPP/Go/Flutter pattern **[in-repo]**). Build the engine after there is a proven demand. Do not mark angr or Triton closed.
