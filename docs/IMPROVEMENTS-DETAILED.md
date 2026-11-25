# Improvement notes — detail (what it does / speed / cost / capability)

Status at v0.13.0: the eight items below are in the tree, with tests (`sniff`, `confidence`, `fallback`, worker cache, parallel scan, missing reasons / `doctor --fix`, config suggestion, telemetry). They are not an open backlog. The notes describe the design that shipped. Surface: 191 tools, 187 `outputSchema`, 191 annotations, 2 resources, 7 prompts.

## 1. Magic-byte sniffing (identify by content, not by extension)

- **What it does:** Reads the first bytes and finds the real type. A file called `.bin` can be an APK (PK zip). A file called `.dat` can be an ELF (`7f 45 4c 46`). Routing that trusts the extension picks the wrong engine. Sniffing picks the right one. v0.13.0 also reports ELF `e_machine` (including Hexagon) and PE ARMNT/ARM64 on this path.
- **What you get:** The wrong-engine attempts stop. After `capability_unsupported` you do not need a second guess; the first call hits the right gate.
- **What gets faster:** Time to open a target, especially in a bulk scan. The wrong-try, error, retry loop goes away.
- **What it costs:** A read of the first 4 KB plus a signature-table match (microseconds). The table has to be maintained when a new format appears.
- **Capability gained:** Automatic identification of extensionless, mis-extended, and nested files (dex inside an APK, ELF inside firmware), and a walk inward.

## 2. Confidence score (0–100 on every match)

- **What it does:** Turns "this APK opens with jadx at about 95, with Ghidra at about 40" into a decision. Gates used to say yes or no. The score ranks the best candidate.
- **What you get:** The router tries the highest score. Lower scores wait as backups. The user can be told why that tool was chosen.
- **What gets faster:** On multi-engine targets (Electron: JS or native?) the number of tries drops to one.
- **What it costs:** A score formula plus calibration tests. A bad calibration pushes a good engine down the list (that needs observation and adjustment).
- **Capability gained:** Automatic best-engine choice on ambiguous targets, and a decision you can explain.

## 3. Fallback chain (jadx to apktool, ghidra to hopper to ida)

- **What it does:** If the first tool is missing or broken, the second takes over. Example: no jadx, so apktool still returns the manifest and resources (decompile stays incomplete, but the job does not stop).
- **What you get:** A missing tool is no longer a full stop. You get a partial result plus "this is missing, install that."
- **What gets faster:** The operator does not wait. Partial evidence arrives immediately. Full evidence arrives once the tool is installed.
- **What it costs:** A chain definition plus a partial-result schema. Running two tools can make the total longer (not if they run in parallel).
- **Capability gained:** An MCP that still does work in a broken or incomplete environment. Hopper and IDA stay gate-only, so that leg of the chain does not invent analysis.

## 4. Caching probe results with a TTL

- **What it does:** `doctor` used to probe adb/java/r2 on every call (a process spawn, on the order of 10–100 ms each). The result is kept, for example for 60 seconds, and is not asked again. The live cache is the worker cache (`ResultCache` TTL + `runProbes`).
- **What you get:** Ten tool calls in a row cost one probe, not ten. Seconds per session come back.
- **What gets faster:** Every tool call, especially a fast sequence (`session_open`, then `open_target`, then `disassemble`).
- **What it costs:** A tool installed between calls stays invisible for up to 60 seconds (stale). Remedy: `doctor --refresh`, plus clearing the cache after install.
- **Capability gained:** Scale. In a multi-file scan the probe cost stays flat.

## 5. Parallel probes

- **What it does:** Checks several tools at once instead of in series.
- **What you get:** `doctor` takes as long as the slowest probe (800 ms down to about 150 ms is the original measurement, not a fresh benchmark).
- **What gets faster:** First launch and the `prerequisites` report, clearly.
- **What it costs:** Several processes spawn at once (a short CPU spike). On Windows, too many at once can trip an AV warning, so the cap is 4.
- **Capability gained:** Fast readiness. The agent decides about the environment without waiting through a serial list.

## 6. Structured missing-reason plus an install command

- **What it does:** "adb is missing" becomes a structured reason: what is missing, the install command (`winget install Google.PlatformTools` and the apt/brew equivalents), why it is needed, and an alternative. `doctor --fix` suggests the install and does not run it without confirmation.
- **What you get:** The user or the agent installs in one step and does not hunt through docs.
- **What gets faster:** The install loop (ask, search, install, retry) collapses to one message.
- **What it costs:** An install-command table on every gate, plus a per-platform split (winget / choco / apt / brew) to maintain.
- **Capability gained:** An MCP that proposes its own repair.

## 7. Automatic config suggestion

- **What it does:** Writes a `configs/` snippet for the tool that was found: "Ghidra was found, add REA_GHIDRA_DIR", as JSON ready to paste. The setup wizard (`rea-plus-cli setup`) is the shipped form of this, tested under a temp HOME.
- **What you get:** Manual config editing after install goes away. Setup becomes copy and paste.
- **What gets faster:** First install (the original note said 10 minutes down to 2; that figure is the design target, not a new measurement).
- **What it costs:** When the config schema changes, the snippet generator has to change. A wrong path needs a debug pass (a button that tests the path covers it).
- **Capability gained:** Guided setup for someone installing from zero.

## 8. Missing-tool telemetry

- **What it does:** Records which tool is missing most often and which target gets stuck (local, opt-in). Example: "wabt was missing in 7 of 10 runs", so the air-gap package embeds wabt.
- **What you get:** The roadmap leans on data. The gap that hurts most closes first.
- **What gets faster:** Everyone's install, over time, because the package contains the right tools.
- **What it costs:** A log write (microseconds) plus a privacy consent. Default is off, and the file is local.
- **Capability gained:** Priorities based on evidence.
