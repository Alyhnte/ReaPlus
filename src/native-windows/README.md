# native-windows — prebuild roadmap

> WP5, medium term: a Win32 prebuild binary plan for `process` / `authority` / `filesystem`.
> The TypeScript surface is fixed in `addon.ts`. A real Win32 read exists only in the prebuild binary.

Current code fact: if the host is not win32, every call returns `capability_unsupported`. If `REA_NATIVE_PREBUILD` is not `1`, `prebuildKapısı` returns `{ ok: true, tool, summary, veri: { iskelet: true } }`. That is a skeleton success, not a process, token, or directory read. Wave 17 (not done) stops this addon from returning that fake `ok`.

## Scope

| Surface | TypeScript function | Win32 counterpart (only inside the prebuild) |
|---|---|---|
| process | `rea_native_process_info(pid)` | CreateToolhelp32Snapshot + NtQueryInformationProcess |
| authority | `rea_native_authority_check(pid)` | OpenProcessToken + GetTokenInformation |
| filesystem | `rea_native_fs_snapshot(dir)` | USN journal / directory walk (depth ≤ 5) |

## Gates

- A host other than `win32` returns `capability_unsupported`, with a handoff for a Linux/macOS agent.
- Without `REA_NATIVE_PREBUILD=1` the binary is not touched, and the skeleton object above is what comes back (`iskelet: true`).
- `rea_native_caps()` returns the `win32` × `prebuild` matrix in one look. `prebuild` is false unless the env flag is `1`.

## Prebuild steps (not done; the binary is not in the tree)

1. `npm i -D prebuildify node-gyp` — install the build chain.
2. Add a `src/native-windows/binding.cc` target to `binding.gyp`.
3. Wrap the three entries with `Napi::`: `processInfo`, `authorityCheck`, `fsSnapshot`.
4. Put the `npx prebuildify --napi --strip` output under `prebuilds/win32-x64/`.
5. `addon.ts` loads from `../prebuilds` when `REA_NATIVE_PREBUILD=1`.
6. Signature: each prebuild is sealed with `SHA256SUMS` and recorded beside `tools_sha256` inside `evidenceBundle`.

## Tests

- `rea_native_caps()` expects `prebuild: false` in skeleton mode.
- `rea_native_process_info(0)` returns `capability_unsupported` (invalid pid) only after the prebuild gate has passed. Before that, pid 0 still hits the skeleton `ok: true`.
- `rea_native_fs_snapshot("", 2)` returns `capability_unsupported` (empty directory) only after the prebuild gate has passed.
- A live read is verified on a Win32 runner where the prebuild is installed. CI today is `ubuntu-latest` only, so that live read does not run there.
