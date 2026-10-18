# Changelog — rea-plus

Todos los cambios notables se guardan en este archivo. Formato: Keep a Changelog + SemVer.
All notable changes are documented here (resumen en español + English detail).

## [0.11.0] — 2026-10-18

Versión 0.11.0: sitio i18n de 5 idiomas + tema premium + sesiones de
ejemplo + procedencia de publicación. Superficie de herramientas sin
cambios (191 herramientas + 2 recursos + 3 prompts). 101/101 pruebas
predeterminadas en verde.

### Añadido / Added

- Sitio de 5 idiomas (TR/EN/DE/FR/ES): `scripts/site-uret.mjs` con
  chrome i18n + selector de idioma; 5 idiomas × 7 páginas = 35 HTML.
- Tema premium del sitio (scroll-reveal + conmutador claro/oscuro).
- Sesiones de ejemplo (README "🎬 Örnek Oturumlar" +
  `docs/ornek-oturumlar/`: ghidra / ida / r2 — pruebas de salida
  reales, nada inventado).
- Procedencia de publicación npm (OIDC `--provenance`) + job
  `release-artifacts`: el SBOM CycloneDX se convierte en un asset
  automático de la release de GitHub.
- CONTRIBUTING dividido en 6 secciones H2 + formularios de issues
  `bug-raporu` / `ozellik-istegi` (esquema GitHub issue form).
- Modo `site-uret.mjs --check`: validación de presencia/tamaño/idioma
  de 35 páginas, `exit(1)` en archivo roto.

### Interno

- Oleadas 6–10 construidas en worktrees aislados con TDD; la suite
  completa está verde en la puerta.

## [0.10.2] — 2026-10-16

Versión 0.10.2: oleadas P2 de distribución/calidad + profundidad Mach-O + notas de
investigación P3. Superficie de herramientas sin cambios (191 herramientas + 2 recursos +
3 prompts). 96/96 pruebas por defecto en verde.

### Añadido / Added

- Workflow de despliegue Pages (`pages.yml`: push a main → site-uret → deploy).
- Paso CI de presupuesto de esquema (200KB lista / 110KB esquema / 600B media).
- Harness de fuzz dirigido (`scripts/fuzz-harness.mjs`: clasificación + informe
  + `docs/FUZZ.md`; primera ejecución 0 crash).
- Bundle node portable (`scripts/sea-portable.mjs` + `docs/SEA-DAGITIM.md`;
  sin SEA de un exe por 3 bloqueos).
- Notas de factibilidad P3 (`docs/ARASTIRMA-*`: LLDB/TTD/angr ESPERAR, comercial NO HACER).
- Embudo de contribución (ampliación de CONTRIBUTING + formulario good-first-issue).

### Corregido / Fixed

- Resolución de slice en fat binary de `rea_macho_objc` (parámetro `arch` + escalera de
  honestidad); modo limitado preservado porque IL2CPP v31+ no se pudo verificar offline.
- Sincronización ROADMAP v0.10.1 (cierres P1 procesados).

## [0.10.1] — 2026-10-16

Versión 0.10.1: puntos de código P1 cerrados — limpieza de facade muerta +
fixture DEX dorado. Superficie de herramientas sin cambios (191 herramientas + 2 recursos +
3 prompts). 92/92 pruebas por defecto en verde.

### Corregido / Fixed

- Facade muerta eliminada: comportamiento `probeCache`/`parallelProbe` movido a
  `workerCache` (`ResultCache` TTL + `runProbes`);
  `tests/probe.test.mjs` movido bajo `worker-cache.test.mjs`.
- Fixture DEX dorado: `tests/corpus/mini.dex` (DEX mínimo sintético v035,
  generación determinista `scripts/dex-fixture-uret.mjs`) +
  7 pruebas `dex-golden` + entrada HASHES.
- Asignación `RepoScan` `.dex → dex/jadx` añadida.

## [0.10.0] — 2026-10-16

Versión 0.10.0: 4 herramientas nuevas (187→191), cola de serialización, enlace de
worker-cache, preparación de distribución (factibilidad SEA, manifiestos, SBOM, sandbox),
calidad permanente (presupuesto de esquema, sitio de docs, biblioteca de prompts, profundidad
ObjC/IL2CPP/Go). 187 `outputSchema`, 191 annotations. 91/91 pruebas por defecto en verde.

### Añadido / Added

- `rea_macho_objc/classdump`, `rea_il2cpp_methods`, `rea_go_buildinfo`.
- Serialización total (`REA_SESSION_SERIALIZE=1`, probada con marca de tiempo).
- Enlace en vivo de worker-cache (ruta reposcan, probada por contador).
- Informe de factibilidad SEA + script piloto; manifiestos winget/scoop/homebrew.
- SBOM (CycloneDX) + `docs/SANDBOX.md` (Hyper-V/VirtualBox).
- Presupuesto de esquema (umbrales medidos), sitio de docs (7 páginas), `docs/PROMPTS.md`.

### Corregido / Fixed

- Descubrimiento jadx POSIX (barrido PATH + X_OK).
- Puerta de similitud Hopper POSIX.
- Compatibilidad cdb-async con CI-Linux; corpus normalizado.

### Aún no hecho / Not yet done

- Confirmación de Frida en VM en vivo; runner Windows autoalojado.
- Borrado de facade muerta (dependencia de prueba probe); investigación P3.

## [0.9.0] — 2026-10-15

Versión 0.9.0: superficie por defecto de 172→187 con 15 herramientas nuevas (30 conduit + 157 rea),
183 `outputSchema` + 187 annotations preservados, facilidad de instalación (asistente `setup`,
`doctor --fix`) y plataforma de calidad (fuzz smoke del analizador, e2e HTTP por
defecto, presupuestos de rendimiento, sesiones de ejemplo + CONTRIBUTING). 86/86
pruebas por defecto en verde.

### Añadido / Added

- 15 herramientas nuevas (172→187): `rea_go_funclines`, `rea_go_goresym`,
  `rea_il2cpp_metadata`, `rea_il2cpp_dump`, `rea_bindiff_fonksiyonlar`,
  `rea_bindiff_karsilastir`, `rea_flutter_snapshot`, `rea_flutter_blutter`,
  `rea_macho_info`, `rea_macho_loads`, `rea_macho_otool`, `rea_pcap_oku`,
  `rea_scan_repo_paralel`, `rea_android_dinamik_recete`,
  `rea_android_recete_dogrula`.
- Asistente `rea-plus-cli setup` (detección de clientes + escritura de config) y
  `doctor --fix` (sugerencia/ejecución de instalación confirmada).
- Fuzz smoke del analizador (`scripts/fuzz-parsers.mjs` + `parser-fuzz.test.mjs`;
  semillas del corpus de solo lectura, escritura solo a tmpdir).
- E2E HTTP movido al carril por defecto (`tests/e2e.http.mjs`).
- Presupuestos de rendimiento (`perf-budget.test.mjs`: tools/list + arranque).
- Sesiones de ejemplo (`docs/EXAMPLES.md` + `docs-examples.test.mjs`) y
  `CONTRIBUTING.md` (incluidas reglas del corpus).

### Corregido / Fixed

- Puerta de similitud Hopper POSIX: un archivo falso que no se parece en bit/tamaño ejecutable
  no cuenta como Hopper, devuelve un honesto `capability_unsupported`.
- Rama cdb async CI-Linux y normalización de fin de línea del corpus (correcciones heredadas de
  0.8.2) fijadas con pruebas de regresión en la superficie de 187 herramientas.

### Aún no hecho / Not yet done

- Confirmación de Frida en VM en vivo; runner Windows autoalojado.
- EXE Windows de un archivo (Node SEA); manifiestos winget/scoop/homebrew; SBOM.
- Investigación P3: motor LLDB, WinDbg TTD, ejecución simbólica (angr/Triton).

## [0.8.2] — 2026-10-15

Versión 0.8.2: cobertura de esquema restante cerrada (168 `outputSchema`, 172 annotations,
cero sin marcar), descargador PDB registrado como herramienta 172, TTL de sesión y
Roots moderno MRTR, generalización de progress + whitelist asíncrona triple.
Superficie por defecto 172 herramientas; opt-in: async +5 (177), cola +1 (173). 72/72
pruebas por defecto en verde (CI incluido).

### Añadido / Added

- 20 conduit + `rea_pdb_indir` con `outputSchema` (total 168); annotations 172/172.
- Registro `rea_pdb_indir` (servidor de símbolos Microsoft, con integridad, con caché, solo en perfil `all`).
- TTL de sesión (`REA_SESSION_TTL_MS`, 30 min por defecto, 0=desactivado).
- Roots moderno MRTR (`inputRequired`/`inputResponses`); `list_changed` en legacy.
- Ayudantes de etapa de progress en 2 herramientas más; whitelist asíncrona triple.

### Corregido / Fixed

- Compatibilidad CI-Linux de la prueba cdb-async (se acepta la rama `engine_unavailable`).
- Normalización de fin de línea de hash del corpus; corrección HASHES de `ornek.js`.

### Aún no hecho / Not yet done

- Confirmación de Frida en VM en vivo; runner Windows autoalojado; corpus DEX permanente.
- Facilidad de distribución P2; profundidad de análisis; investigación P3.

## [0.8.1] — 2026-10-14

Versión 0.8.1: robustez de motores (cola de sesiones, timeout Frida, cdb async, provisión
x64dbg), honestidad estática (escenario de navegador, FLIRT, Wasm/DWARF, PE/PDB),
comportamiento y escala (matriz de syscalls, ejecución en una llamada, caché de workers), plataforma de pruebas
permanente (corpus dorado, 147 outputSchema, generalización de progress). Superficie por
defecto preservada en 171 herramientas; toda novedad es opt-in o mejora de error honesto.
70/70 pruebas por defecto en verde.

### Añadido / Added

- Cola de sesiones FIFO (`REA_SESSION_QUEUE=1` opt-in, profundidad 32, herramienta `session_queue_status`; superficie 171 por defecto sin cambios).
- Timeouts de instalación de Frida (attach 15 s/script 10 s/load 15 s, con override por env, `engine_timeout` con limpieza unload/detach ante timeout).
- Pause asíncrono + eventos push de cdb (el event loop no se bloquea, `pauseAsync` opt-in).
- Provisión x64dbg (`reaX64dbgDoctor` + `reaX64dbgSetup`, idempotente, con verificación de hash).
- Ejecución real de escenario de navegador (con evidencia por paso, modo dry-run, `capability_unsupported` sin backends).
- Matriz de números de syscall + perfiles CreateFileW/RegSet.
- Ejecución conductual en una llamada (`BehaviorRun`: spawn+trace+capture, timeout obligatorio, honestidad ante fallos).
- Caché de workers (LRU-100, con clave hash, bypass `REA_CACHE=0`).
- Manifiesto del corpus dorado (`tests/corpus/HASHES.json` + `verify-corpus.mjs`).
- Ayudantes de generalización de progress (`createStageProgress`, `onAbort`).
- 27 `outputSchema` nuevos (total 147: 137 rea + 10 conduit).

### Corregido / Fixed

- Cuelgue jadx `-jar`: cambiado a forma `-cp jadx.cli.JadxCLI`; pasó la aceptación de APK en vivo (`com.zb.test`, 7 permisos, 5 clases, 2,2 s).
- Nombre falso de FLIRT: descripción y resultado llevan `string-heuristic` + puntuación de confianza.
- WasmInfo LEB multibyte + DWARF v5/abbrev_offset/múltiples FORM (fin de tamaños negativos y resumen vacío falso).
- PE `SizeOfOptionalHeader` + código duplicado PeReader/PdbReader unificado; descarga PDB (con caché, con integridad).

### Aún no hecho / Not yet done

- Confirmación de Frida en VM en vivo; corpus DEX permanente (fixture dentro del repo); runner Windows autoalojado.
- 24 herramientas restantes sin esquema; generalización de progress (handlers síncronos); trusted publisher OIDC + provenance.

## [0.8.0] — 2026-10-14

Versión 0.8.0: la superficie del protocolo MCP creció (resources/prompts, toolsets, salidas
tipadas), se añadieron límites de seguridad (raíz de workspace, HTTP sin token, auditoría) y
llegaron pilotos de jobs asíncronos + progress. Lo siguiente describe el estado de esta versión;
las puertas externas de "Aún no hecho" siguen abiertas.
Release 0.8.0: bigger MCP surface, new security boundaries, async job and
progress pilots. External gates in "Not yet done" remain open.

### Añadido / Added

- Referencia de herramientas: `docs/TOOLS.md` generada desde la superficie MCP real del servidor compilado
  (171 herramientas + 2 recursos + 3 prompts). README y ROADMAP enlazan a esta referencia.
- Resources MCP: `rea-plus://server-info` y `rea-plus://capabilities-safety` estáticos de solo lectura
  (no exponen valor env, ruta personal ni contenido de archivos).
- Prompts MCP: flujos `packer-triage`, `dotnet-malware-triage` y `android-triage` sin efectos secundarios que solo generan texto.
- Perfiles `REA_TOOLSETS`: indefinido/vacío/`all` = 171 herramientas; `minimal` = 8,
  `static` = 98, `android` = 27, `dotnet` = 20, `web` = 26, `debug` = 50.
  La escritura con comas es unión; un perfil desconocido/vacío no cae en silencio a `all`,
  da error abierto en el arranque. Resources/prompts no se filtran.
- Límite de raíz de trabajo `REA_WORKSPACE_ROOT`: cuando está definido, argumentos de ruta `rea_*`,
  rutas conduit `open_target`/`debug_open` y escrituras derivadas visibles al usuario
  (`.unpacked`, `.extracted`, salida HAR) dentro de la raíz, verificados con prueba realpath;
  sin definir, el comportamiento no cambia. Superficies temp/caché del operador como excepción consciente:
  directorio de artefactos del navegador, directorios tmp de proyecto/entrada de Ghidra, archivo tmp de solicitud
  hopper y caché framework de apktool no se fuerzan dentro de la raíz.
- Modo solo lectura HTTP sin token: cuando `DBG_BRIDGE_TOKEN` no está definido, HTTP registra,
  junto a la advertencia, solo una allowlist de solo lectura de 44 herramientas sin parámetros de ruta
  (el resultado es intersección con `REA_TOOLSETS`). HTTP con token y stdio preservan la superficie completa
  (o de toolset). Herramientas nuevas/fuera de lista no aparecen en HTTP sin token.
- `REA_AUDIT_LOG` (JSONL, en ambos transportes): por línea solo `ts`,
  `transport`, `tool`, `durationMs`, `isError`. Argumentos, tokens, rutas o contenido objetivo
  nunca se escriben; un error de escritura cierra la auditoría con una sola advertencia, no tumba el servidor.
- Límites HTTP: por IP `REA_HTTP_RATE_LIMIT_PER_MIN` (120/min por defecto) y
  techo de solicitudes activas `REA_HTTP_MAX_CONCURRENT` (16 por defecto); al exceder, `429`.
  Un valor no entero positivo no cae en silencio al valor por defecto, da error de arranque.
- Salidas con tipos seguros (base parcial): 147 herramientas llevan `outputSchema`, 169 herramientas tienen
  annotations; en resultados cuyo JSON de texto es objeto plano, `structuredContent` lleva el mismo
  valor. Herramientas fuera del conjunto de esquema devuelven JSON de texto sin esquema; el estado por
  herramienta está en `docs/TOOLS.md`. La cobertura de esquema no se ha ampliado a las 171 herramientas.
- Piloto de jobs asíncronos: con `REA_ASYNC_JOBS=1` se registran 5 herramientas job
  (`rea_job_start/status/result/cancel/list`); la superficie por defecto queda en 171
  herramientas, la superficie opt-in es 176. La cola corre como máximo 2 trabajos concurrentes,
  los registros son dentro del proceso y la whitelist hoy solo incluye la herramienta
  `rea_process_run` con AbortSignal; cancelar un trabajo en curso mata el árbol de procesos.
- Piloto Roots: con `REA_ROOTS=1` y ruta stdio legacy se obtienen las raíces del cliente;
  las raíces solo pueden estrechar el límite `REA_WORKSPACE_ROOT`. El flujo MRTR del protocolo moderno
  es trabajo aparte y no se presenta como soportado.
- Piloto de progress/cancelación: `rea_process_run` envía la primera notificación sin esperar y las siguientes
  como máximo a ~20/s; `notifications/cancelled` mata el árbol de procesos hijo. Los demás handlers síncronos
  están fuera de este piloto.
- Preparación de publicación: nombre Registry `io.github.Alyhnte/rea-plus` y `mcpName` del paquete
  listos; el workflow publish se añadió solo como preparación manual con dry-run por defecto
  (la publicación real pide confirmación `PUBLISH` abierta).
- Honestidad del puente jadx (base de código): paquete/permisos/actividades del manifiesto y extracción FQCN de
  clases se basan en análisis real; la ejecución jadx en vivo no es prueba de esta entrada.
- Comportamiento de excepciones del agente Frida (base de código): la excepción que no coincide con la dirección del
  slot instalado ya no se traga como breakpoint, se deja al flujo real con `false`.

### Aún no hecho / Not yet done

- Publicación npm hecha: `rea-plus@0.8.0` en el registry, instalación consumidora verificada
  (`npm install` + stdio `initialize`/`tools/list` = 171). Registro MCP Registry hecho:
  `io.github.Alyhnte/rea-plus` publicado (GHA + OIDC). Instalación soportada: `npx -y rea-plus` y GHCR.
- Confirmación de Frida en VM en vivo no completada; el punto Frida de arriba no cuenta como
  prueba de aceptación en vivo.
- Prueba de aceptación APK DEX dorado (jadx en vivo + APK real) no completada;
  la puerta del corpus dorado sigue abierta.

## [0.7.4] — 2026-10-13

Parche de distribución: instalación ajena más fácil; corregido un error de paquete que
bloqueaba al consumidor. README reescrito (instalaciones en un clic, diagrama de arquitectura,
matriz de clientes), hoja de ruta completa en `docs/ROADMAP.md`.

### Corregido / Fixed

- Playwright ahora opcional y de carga perezosa. Antes, estando en `devDependencies`,
  el código de producto lo importaba estáticamente: quien instalaba el paquete recibía en el arranque
  `ERR_MODULE_NOT_FOUND`. El servidor abre sin Playwright, las herramientas de navegador
  devuelven `capability_unsupported`. Para navegador: `npm i playwright && npx playwright install chromium`.

### Añadido / Added

- Script `prepare`: instalaciones git (`npx -y github:Alyhnte/ReaPlus`) compilan dist automáticamente.
- Enlaces de instalación en un clic (Cursor, VS Code) + ejemplos de config de cliente:
  Claude Desktop/Code, Cursor, VS Code, Windsurf, Codex, opencode (`configs/`).
- `Dockerfile` + workflow GHCR: en los releases se publica la imagen `ghcr.io/alyhnte/reaplus`.
- Metadatos registry `smithery.yaml`; rutas personales limpiadas en los ejemplos de config.
- README visual (insignias, arquitectura Mermaid, tabla env, modelo de seguridad) y
  `docs/ROADMAP.md` (tabla completa tematizada ×9, priorizada).

## [0.7.3] — 2026-10-12

Parche CI/portabilidad: el conjunto de pruebas por defecto ahora está en verde fuera de la máquina
del autor (CI Ubuntu limpio, Node 20+22). La misma generalización se aplicó al código de producto:
descubrimiento de herramientas solo por env + PATH, sin rutas fijas específicas de máquina.

### Corregido / Fixed

- Los fixtures de prueba leen el corpus versionado en el repo (`tests/corpus`, relativo a
  `import.meta.url`) en lugar de rutas Temp personales; `korpus-kur` solo refresca con
  env `REA_KORPUS_ELF`/`REA_KORPUS_PE`.
- Las sondas de existencia tienen en cuenta que `spawnSync` no lanza (`r.error`/status):
  en una máquina sin mitmdump, producto y prueba ahora ven la puerta correcta (también cayó la
  espera proxy falsa de 13 s).
- Ante herramientas ausentes, las pruebas se comportan por principio: sin wabt/upx/ilspy/dnfile/Chromium,
  assert `capability_unsupported` o skip honesto; la versión UPX ya no está fijada a 5.2.1.
- Descubrimiento de herramientas de producto generalizado: `REA_UPX_BIN`, `REA_WABT_BIN`, `REA_AAPT2_BIN` + PATH;
  rutas personales WinGet/`C:\tools` eliminadas. La búsqueda python de CIL .NET prueba
  el orden `python`/`python3`/`py` (en Linux suele haber solo python3).
- Directorio de proyecto Ghidra bajo `os.tmpdir()` en lugar de ruta personal; las pruebas Ghidra
  no asumen ruta de instalación por defecto (`REA_GHIDRA_DIR` obligatorio, carril en vivo).
- Las pruebas CLI invocan a node con `process.execPath`, no desde el PATH.
- El corredor de pruebas imprime una cola de errores más larga para diagnóstico CI.

### Verificación / Verification

- Local: 43/43 en entorno PATH completo y estrecho (sin herramientas); ejecución desde otro directorio de trabajo también en verde.
- CI: Ubuntu Node 20 + 22 en verde (rama `fix/inceleme-duzeltmeleri` y main).

## [0.7.2] — 2026-10-12

Correcciones de revisión amplia: rutas de entrada/publicación rotas, envoltura de errores, inyección
superficies, resultados `ok` falsos y robustez de motores. Para versiones intermedias (0.2.0–0.7.1),
ver archivos `docs/release-v*.md`.

### Corregido / Fixed

- `npm start` ahora ejecuta la entrada real (`dist/server.js`); el objetivo anterior
  (`dist/facade/createReaPlusServer.js`) era una factoría sin transporte, el servidor nunca abría.
- `npm test` corre `scripts/run-tests.mjs` en lugar del script viejo que apuntaba fuera del repo;
  CI ahora ejecuta de verdad el conjunto por defecto (43 archivos).
- Envoltura de errores: resultados `ok:false` y errores lanzados de herramientas rea ahora van a MCP con
  `isError: true`; fin del reporte como éxito.
- La compilación también copia archivos de runtime (`frida-agent.js`, scripts `.py` de Ghidra);
  el motor Frida ya no da `engine_unavailable` en el paquete publicado. `prepublishOnly` añadido.
- Versión en una sola verdad: `package.json`, `server.json`, `server.ts` todos en 0.7.2.
- El fallback `decompile` de Cutter corría `pdf` sin análisis y devolvía `ok` vacío; ahora corre
  `aaa;pdf` y la salida vacía da `capability_unsupported`.
- `korpus-kur` preserva el corpus versionado si no hay fuentes Temp personales (no cae en CI);
  la prueba de idempotencia mide en la segunda ejecución.

### Seguridad / Security

- Entradas de dirección validadas en esquema y puentes (hex/número/símbolo); inyección de comandos r2/rizin
  (`;`, escape `!`) cerrada.
- La ruta cmd.exe de radare2 rechaza metacaracteres; el cierre mata el árbol de procesos
  (no quedan nietos r2 huérfanos).
- `rea_jeb_sorgu` por defecto solo puede POST a loopback; objetivo remoto pide
  `REA_JEB_ALLOW_REMOTE=1`, hosts link-local/metadata bloqueados en todo caso.
- Sin token HTTP, el servidor advierte en voz alta en el arranque (auth desactivada).

### Honestidad / Honesty

- `rea_dotnet_metadata` contaba todo PE como .NET mirando solo MZ; ahora comprueba el directorio
  CLR real (DataDirectory[14]), sin lector externo obligatorio.
- `rea_pwn_elf_layout` devolvía `capability_unsupported` en lugar de un `ok` falso "en cola".
- `stdout_sha256_kısa` ahora es SHA-256 de verdad (antes era FNV-1a); canal PTY falso y
  comparación pipe/PTY eliminados — el canal es honestamente `pipe`, compare vuelve por puerta.
- `rea_net_capture` apunta de verdad a la URL localhost dada; el servidor señuelo solo se levanta
  con entrada `data:` y se indica en el resumen.

### Robustez / Robustness

- RPC del agente Frida (`callAgent`, `describe`) con timeout; un inject fallido no deja media
  sesión (detach + limpieza de mapa).
- Re-open/re-attach limpia los checkpoints del objetivo viejo; rewind no puede escribir atrás al
  proceso equivocado.
- En carrera de re-open concurrente, el debugger de la sesión sobrescrita no queda huérfano
  (x64dbg/cdb/frida).

### Pruebas / Tests

- Nuevo: `tests/fixes-regression.test.mjs` (12 pruebas) fija estas correcciones.
- Conjunto por defecto: 43 archivos / 321 its en verde. Inyección en vivo/debug y Ghidra local
  bajo `npm run test:live` (VM/CI), no se corren en lote en la máquina principal.

## [0.1.0] — 2026-10-12

Primer paquete funcional: conduit congelado, rea encima.

### Añadido / Added

- `src/conduit-core`: conduit verbatim, solo lectura. 30 nombres de herramienta congelados
  (`health`, `session_open/close/list`, `events_pull`, `static_info`,
  `open/close_target`, `disassemble`, `get_cfg`, `xrefs`, `strings`, `dump`,
  `debug_open/attach/close/state/breakpoint/continue/step/pause/registers/
  callstack/memory/code/thread/plugin/time`, `explain`, `prerequisites`).
  Sin renombres; regla fijada con `toolNamespace.ts`.
- `src/facade`: 7 módulos — `sessionRouter`, `toolNamespace`, `catalogMerge`,
  `createReaPlusServer`, `compactSchema`, `evidenceBundle`, `obligationLedger`.
  Regla de prefijo: toda herramienta de origen rea lleva `rea_*` / `hopper_*` / `ghidra_*` /
  `jeb_*` / `evm_*` / `firmware_*` / `browser_*` / `adb_*`.
- `src/rea-domains`: 19 archivos de dominio (9 carpetas) — hopper, ghidra, ida, jeb,
  javascript (JsAnalyzer/ReconHarness/BinaryDiff), android (Jadx/Adb/Apktool),
  dotnet (ManagedInspector), wasm-evm (WasmEvmBridge/CrashTimeline/GoPwn/
  DosMips/NativeAot), firmware-browser (Firmware/Browser/ProcessCapture).
- `keccak`: selector EVM offline con `js-sha3` — `transfer(address,uint256)`
  → `0xa9059cbb`, `approve(address,uint256)` → `0x095ea7b3`.
  El barrido de exports WAT también offline; sin `wabt`, `capability_unsupported`.
- Conteo de herramientas: 8 herramientas rea → objetivo total 33+; en esta versión el servidor runnable
  ofrece 30 conduit + 8 rea = 38 herramientas en vivo (ruta 8 → 33 fijada en hoja de ruta).
  Catálogo unido: 8 conduit + 9 rea = 17 entradas (`mergedCatalog()`, Cutter añadido).
- Servidor runnable: `src/server.ts` → `dist/server.js` (bin: `rea-plus`).
  Transporte: stdio (por defecto) + `POST /mcp` y `GET /health` (sin estado,
  puerta Bearer `DBG_BRIDGE_TOKEN` igual que conduit).
- Configs: JSON stdio + http bajo `configs/claude-desktop`, `configs/cursor`, `configs/opencode`
  (con marcador `<REA_PLUS_DIR>` comentado).
- Tests: `tests/namespace.test.mjs` (fija prefijo + colisión) y
  `tests/reaplus.smoke.mjs` (selectores keccak + frozen=30 + catálogo=17).
  Ejecución: `node tests/namespace.test.mjs`, `node tests/reaplus.smoke.mjs`.
- Higiene de paquete: `server.json` (io.github.rea-plus), `LICENSE` (MIT 2026),
  `.gitignore`, `.npmrc`, workflow CI.

### Reglas / Policy

- Capacidad faltante = sin stub, `capability_unsupported` + sugerencia de descarga.
- Trabajos en vivo piden `confirm:true`. Verificación localhost HTTP activada.
