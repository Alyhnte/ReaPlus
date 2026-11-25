# native-windows — Win32 reads

> The TypeScript surface in `addon.ts` is not an MCP tool. On win32 it reads the live process, token integrity, and a directory tree. It does not return a skeleton `ok: true`.

Current code fact: if the host is not win32, every call returns `capability_unsupported`. There is no `REA_NATIVE_PREBUILD` success path. A missing or invalid pid, an unreadable token, an empty directory string, or a depth outside 0-5 also returns `capability_unsupported` with the real error.

## Scope

| Surface | TypeScript function | Win32 read |
|---|---|---|
| process | `rea_native_process_info(pid)` | `Get-CimInstance Win32_Process` (`Name`, `CommandLine`) |
| authority | `rea_native_authority_check(pid)` | `OpenProcessToken` + `GetTokenInformation` integrity RID |
| filesystem | `rea_native_fs_snapshot(dir, depth)` | Directory walk, depth 0-5, sha256, 200-file cap |
| caps | `rea_native_caps()` | Whether those commands actually run |

## Gates

- A host other than `win32` returns `capability_unsupported`.
- `rea_native_caps()` reports `komutlar.process`, `komutlar.authority`, and `komutlar.fs` from live probes. It does not report a prebuild flag.
- Process name and command line come from CIM. Integrity `elevated` is derived from the token RID (`high`, `system`, `protected`).
- The snapshot returns sorted relative paths and content sha256. It does not queue a fake job.

## Prebuild binary

A native `binding.cc` prebuild is still not in the tree. The functions above do the read in-process with PowerShell and Node `fs`, so callers do not need `REA_NATIVE_PREBUILD=1`.
