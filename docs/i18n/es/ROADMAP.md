# ROADMAP — hoja de ruta de ReaPlus

> Estado: v0.10.1 publicada (npm + MCP Registry + CI en verde). Este documento nació
> con los hallazgos de la revisión inicial del 2026-10-12 y se sincroniza con lo realizado
> al final de cada oleada. v0.10.1 cerró los puntos de código P1 (limpieza de facade muerta +
> fixture DEX dorado); la superficie de herramientas no cambió. Los números provienen de la superficie real
> del servidor compilado (salida de producción de [`TOOLS.md`](TOOLS.md)).
>
> **Métricas:** Impacto = contribución al valor de usuario/agente · Esfuerzo = S (días) / M (1-2 semanas) / L (mes+) · Prioridad = P0 (puerta externa) → P3 (largo plazo).

## Cerrados con la base v0.10.0 (resumen)

- Superficie MCP: 191 herramientas + 2 recursos + 3 prompts; referencia completa generada en [`TOOLS.md`](TOOLS.md).
- Perfiles `REA_TOOLSETS`: `all` 191 (predeterminado), `minimal` 8, `static` 98, `android` 27, `dotnet` 20, `web` 26, `debug` 50; unión con comas, perfil desconocido = error de arranque. Herramienta nueva solo en `all` (fail-closed).
- `REA_WORKSPACE_ROOT`: rutas `rea_*` + conduit + escrituras derivadas visibles al usuario dentro de la raíz; superficies temp/caché del operador como excepción consciente. Roots (legacy + modern MRTR) solo estrecha.
- HTTP sin token: allowlist de 44 herramientas de solo lectura (intersección con toolset) + `REA_AUDIT_LOG` (JSONL sin argumentos) + límite de tasa (120/min) + techo de concurrencia (16) + TTL de sesión (30 min).
- Base de tipos: 187 `outputSchema`, 191 annotations (cero sin marcar; 4 herramientas permanentemente sin esquema).
- Jobs asíncronos (5 herramientas, superficie 177→192) + cola de sesiones FIFO + serialización total + caché de workers + generalización de progress.
- Robustez de motores: timeouts de instalación de Frida, pause+push asíncronos de cdb, provisión de x64dbg, corrección jadx `-cp` + aceptación de APK en vivo.
- Honestidad estática: escenario de navegador, FLIRT, Wasm/DWARF, PE/PDB, Mach-O, IL2CPP/Go/Flutter, diff binario, PCAP/TLS, receta Android.
- Instalación: asistente `setup` + `doctor --fix`; manifiestos (winget/scoop/brew) + SBOM + receta de sandbox; factibilidad SEA.
- Calidad: manifiesto del corpus dorado, fuzz smoke (CI), e2e por defecto, presupuestos de perf + esquema, sitio de docs + biblioteca de prompts.
- Publicación: `rea-plus@0.10.0` en npm, `io.github.Alyhnte/rea-plus` en MCP Registry, cadena de tags (npm→espera→registry) con un solo disparador. **La confirmación de Frida en VM en vivo queda como puerta abierta** (no cerrada abajo).

## Cerrados con 0.7.2 + 0.7.3 (resumen)

- Se corrigieron `npm start`/`npm test` rotos, desajuste de versión y assets de runtime no copiados a dist.
- Se corrigieron envoltura de error (`isError`), puerta de inyección de direcciones, herramientas que devolvían `ok` falso, timeout/sesión parcial de Frida y escritura cruzada de checkpoints.
- Conjunto de pruebas por defecto en verde fuera de la máquina del autor (fixtures portables, puertas honestas de herramientas, cero rutas personales); CI Ubuntu Node 20+22 en verde.
- Instalación: instalación git con `prepare`, conexiones Cursor/VS Code en un clic, Dockerfile + workflow GHCR, ejemplos de config de cliente.

## A) Distribución e instalación

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Publicación en npm (`rea-plus`) | CERRADO (v0.8.0, cadena v0.9.0+): `rea-plus@0.10.0` en el registry; cadena de tags (npm→espera→registry, un disparador) | Instalación en un comando: `npx -y rea-plus` | S | — |
| ✅ Registro MCP Registry (`mcp-publisher`) | CERRADO (v0.8.0, cadena v0.9.0+): `io.github.Alyhnte/rea-plus` publicado | Descubrimiento en el catálogo oficial | S | — |
| ✅ Publicar imagen GHCR con el primer release | CERRADO (v0.7.4): etiquetas publicadas para `ghcr.io/alyhnte/reaplus` y tracción anónima verificada | Cero instalación para usuarios Docker | S | — |
| ✅ Asistente `rea-plus-cli setup` | CERRADO (v0.10.0): detección de clientes + escritura confirmada + `.bak` + dry-run; probado solo en HOME temporal | Se elimina la mayor fricción | M | — |
| ✅ `doctor --fix` | CERRADO (v0.10.0): sugerencia de instalación con puerta de confirmación (winget/brew/apt); no ejecuta sin confirmación | Un comando ante herramientas faltantes | M | — |
| ◐ EXE Windows de un archivo (Node SEA) | FACTIBILIDAD LISTA (v0.10.0): SEA hello-world funcionó; app completa con 3 bloqueos (binding Frida 129MB, playwright dinámico, firma) — alternativa: bundle node portable | Distribución sin Node; como asset de release | M | P2 |
| ✅ Manifiestos winget/scoop/homebrew | CERRADO (v0.10.0): tres manifiestos versionados + con hash; sin envío a tiendas | Descubrimiento vía gestores de paquetes | S | — |
| ◐ Release firmado + SBOM | PARCIAL (v0.10.0): SBOM (CycloneDX) generado; sin firma ni provenance/Trusted Publisher | Confianza en la cadena de suministro | S | P2 |

## B) Protocolo MCP y experiencia del agente

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Perfiles toolset (`REA_TOOLSETS=static,debug`) | CERRADO: `all` 191, `minimal` 8, `static` 98, `android` 27, `dotnet` 20, `web` 26, `debug` 50; unión con comas, perfil desconocido = error de arranque, resources/prompts sin filtrar | Menos contexto en la lista de herramientas, más acierto | S | — |
| ✅ Resources | CERRADO: 2 recursos estáticos de solo lectura (`rea-plus://server-info`, `rea-plus://capabilities-safety`); sin apertura arbitraria de archivos/env, sin subscribe | Identidad del servidor + reglas de seguridad legibles por URI | M | — |
| ✅ Prompts | CERRADO: 3 prompts sin efectos secundarios (`packer-triage`, `dotnet-malware-triage`, `android-triage`); el prompt no ejecuta herramientas, solo devuelve texto de flujo ordenado | Flujos de triage listos en una selección | S | — |
| ✅ `outputSchema` + `structuredContent` | CERRADO (v0.10.0): 187 herramientas con `outputSchema` (4 permanentemente sin esquema); en resultados de objeto plano `structuredContent` iguala al JSON de texto — estado por herramienta en [`TOOLS.md`](TOOLS.md) | Consumo con tipos seguros | M | — |
| ✅ Notificación de progress + cancelación | CERRADO (v0.10.0): ayudantes de etapa + 3 herramientas con etapas; handlers síncronos fuera de alcance (documentado) | El agente ve el progreso, puede abandonar | M | — |
| ✅ Annotations de herramientas | CERRADO (v0.10.0): 191 annotations (cero sin marcar) | UX de confirmación del cliente | S | — |
| ✅ Modelo de jobs asíncronos (iniciar → poll) | CERRADO (v0.10.0): 5 herramientas job (superficie 192); whitelist triple; cancelar mata el árbol de procesos | Trabajos largos por poll sin bloqueos | M | — |
| ✅ Soporte Roots | CERRADO (v0.10.0): legacy + modern MRTR; el workspace nunca se ensancha en ninguna ruta | El espacio de trabajo se estrecha solo | S | — |
| ✅ Cola de sesiones + serialización | CERRADO (v0.10.0): FIFO-32 + `REA_SESSION_SERIALIZE` (probado con marca de tiempo), timeout+cancelación preservados | Se acaban las carreras | M | — |

## C) Seguridad

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Restricción de raíz de trabajo (`REA_WORKSPACE_ROOT`) | CERRADO: rutas `rea_*` + conduit + escrituras derivadas dentro de la raíz con realpath; temp/caché del operador como excepción | Se cierra la superficie de prompt-injection | M | — |
| ✅ Modo solo lectura en HTTP sin token | CERRADO: sin token, allowlist de 44 herramientas; intersección con toolset | El puerto abierto se vuelve inofensivo | S | — |
| ✅ Registro de auditoría (JSONL) | CERRADO: por línea `ts`/`transport`/`tool`/`durationMs`/`isError`; sin secretos | Revisión de incidentes | S | — |
| ✅ Límite de tasa + concurrencia + TTL de sesión | CERRADO: 120/min + 16 concurrentes + TTL 30 min; valor inválido = error de arranque | Resistencia + higiene | S | — |
| ✅ Receta de sandbox (documento de perfil VM) | CERRADO (v0.10.0): `docs/SANDBOX.md` (Hyper-V + VirtualBox, instantánea + restauración) | Entorno aislado listo | S | — |

## D) Motores de depuración

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Cola de sesiones + serialización | CERRADO (v0.10.0): FIFO-32 + modo serie total; timeout+cancelación preservados | Se acaban las carreras | M | — |
| ◐ Informe real de excepciones en el agente Frida | CÓDIGO + BLOQUEO LISTOS, PUERTA EN VIVO ABIERTA: `false` fuera de slot, timeouts de instalación; sin confirmación de Frida en VM en vivo | Los fallos reales se vuelven visibles | S | **P0** (VM en vivo) |
| ✅ Timeouts attach/createScript/load de Frida | CERRADO (v0.10.0): 15/10/15 s + override por env + `engine_timeout` con limpieza | Se acaban los cuelgues | S | — |
| ✅ cdb: pause asíncrono + eventos push reales | CERRADO (v0.10.0): el event loop no se bloquea, push a suscriptores | Comodidad multisesión | M | — |
| ✅ Autoprovisión de plugins x64dbg | CERRADO (v0.10.0): doctor + setup, idempotente + con verificación de hash | Cae la fricción de instalación | M | — |
| Motor LLDB (Linux/macOS) | Depuración en vivo solo en Windows | Se amplía la cobertura de plataforma | L | P3 |
| Lectura de registros TTD de WinDbg | No existe | Análisis de viaje en el tiempo | L | P3 |

## E) Dominios estáticos (profundidad y honestidad)

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Manifest/campos de clase reales en jadx | CERRADO (v0.10.0): corrección `-cp` + APK real uno a uno + barrido de descubrimiento POSIX | Salida Android fiable | S | — |
| ✅ Escenario de navegador | CERRADO (v0.10.0): los pasos se ejecutan de verdad + con evidencia + dry-run | Hace lo que dice su nombre | M | — |
| ✅ Honestidad FLIRT | CERRADO (v0.10.0): `string-heuristic` + puntuación de confianza | Confianza | S | — |
| ✅ Wasm/DWARF | CERRADO (v0.10.0): LEB multibyte + v5/abbrev_offset | Resumen real | S/M | — |
| ✅ PE + PDB | CERRADO (v0.10.0): encabezado real + descarga + caché | Nombres correctos + símbolo | S/M | — |
| ✅ Mach-O/iOS | CERRADO (v0.10.0): TS puro + fat + lista ObjC | Objetivos Apple | M | — |
| ✅ IL2CPP/Go/Flutter | CERRADO (v0.10.0): conteo + asignación + instantánea; rama honesta si falta la herramienta | Profundidad RE | L | — |
| ✅ Diff binario | CERRADO (v0.10.0): añadido/eliminado/cambiado + streaming | Análisis de parches | M | — |
| ◐ Puente Hopper real | INVESTIGACIÓN LISTA: sin API headless (de fuente oficial) → honesto como preparación de solicitud; puerta de similitud POSIX añadida | Datos reales con licencia | L | P3 |

## F) Análisis conductual y dinámico

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Matriz de syscalls + perfiles CreateFileW/RegSet | CERRADO (v0.10.0): asignación de números ntdll + perfiles de acceso | Informe profundo | S | — |
| ✅ Ejecución conductual en una llamada | CERRADO (v0.10.0): spawn+trace+capture, timeout obligatorio, honestidad ante fallos | Perfil en una llamada | M | — |
| ✅ PCAP + keylog TLS | CERRADO (v0.10.0): reensamblaje de flujos + descifrado con keylog; lo indescifrable queda `sifreli` | Tráfico C2 legible | M | — |
| ✅ Receta dinámica Android | CERRADO (v0.10.0): generación en 5 pasos + validación en seco; herramienta faltante marcada | Inicio móvil | M | — |
| Ejecución simbólica (angr/Triton, WSL) | No existe | Único camino real ante clase VMProtect | L | P3 |
| Harness de fuzzing (AFL++ WSL) | No existe | Hallar fallos en analizadores objetivo | L | P3 |

## G) Escala y rendimiento

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Enlace en vivo de caché de workers | CERRADO (v0.10.0): ruta reposcan probada por contador | Repetición rápida | M | — |
| ✅ Limpieza de facade muerta (`probeCache`/`parallelProbe`) | CERRADO (v0.10.1): comportamiento movido a `workerCache` (`ResultCache` TTL + `runProbes`); `probe.test.mjs` movido bajo `worker-cache.test.mjs` | Fuera el código muerto | S | — |
| ✅ Escaneo paralelo (pool de 4) | CERRADO (v0.10.0): fusión ordenada + cancelación + aislamiento de errores | Integración CI | M | — |
| ✅ Presupuesto de esquema | CERRADO (v0.10.0): umbrales medidos (200KB/110KB/600B) | Se acaba el hinchazón | S | — |
| Forzado del presupuesto de esquema en CI | Hay prueba, no hay paso CI | El presupuesto rompe en CI | S | P2 |
| ✅ Lectura con streaming | CERRADO (v0.10.0): búfer 64KB + parada al cancelar | Se acaba el OOM | M | — |

## H) Pruebas y calidad

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Manifiesto del corpus dorado | CERRADO (v0.10.1): `tests/corpus/mini.dex` (DEX mínimo sintético v035, `scripts/dex-fixture-uret.mjs`) + 7 pruebas `dex-golden` + entrada HASHES | La regresión se atrapa pronto | M | — |
| Runner Windows autoalojado | Las pruebas Frida/debug no corren en CI | La superficie más riesgosa se verifica siempre | M | P0 |
| ✅ Fuzz smoke del analizador en CI | CERRADO (v0.10.0): mutación determinista, fallo/cuelgue=0 | Se atrapan clases silenciosas | M | — |
| ✅ E2E HTTP en el conjunto por defecto | CERRADO (v0.10.0): sacado de LIVE, sin flakes | La regresión de transporte se ve | S | — |
| ✅ Presupuestos de rendimiento | CERRADO (v0.10.0): umbrales medidos, método de mediana | Se acaba la acumulación | S | — |

## I) Documentación y comunidad

| Propuesta | Estado actual / brecha | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| ✅ Referencia automática de herramientas | CERRADO (v0.10.0): [`TOOLS.md`](TOOLS.md) desde la superficie real (191 herramientas + 2 recursos + 3 prompts) | Catálogo actualizado | S | — |
| Sesiones de ejemplo (asciinema/GIF) en el README | Sin evidencia visual | Convence en 10 segundos (conversión a estrellas) | S | P1 |
| ◐ Sitio de docs | GENERADO (v0.10.0): 7 páginas estáticas + 0 enlaces rotos | Documentación con búsqueda | M | P2 |
| Despliegue Pages (sitio listo, sin publicar) | `docs/site/` generado pero sin conectar a GitHub Pages | Documentación en una URL | S | P2 |
| ✅ Biblioteca de prompts | CERRADO (v0.10.0): `docs/PROMPTS.md` (10 prompts, con llamada de ejemplo) | Primer valor en minutos | S | — |
| good-first-issue + ampliación de CONTRIBUTING | Un párrafo | Se abre el embudo de contribución | S | P3 |

---

**Orden sugerido (lo abierto):** Frida en VM en vivo → runner → trusted publisher → sesiones de ejemplo → despliegue Pages → investigación P3.
Cerrados en v0.10.1: limpieza de facade muerta + corpus DEX dorado (marcados ✅ arriba); cerrados en v0.10.0: todas las oleadas I/J/K.
