# Referencia de herramientas ReaPlus

> Este archivo se genera automáticamente; no lo edite a mano. Fuente: la superficie MCP real del servidor compilado
> (`dist/server.js`). Para regenerar:
> `npm run build && node scripts/generate-tool-reference.mjs`

## Resumen

- Servidor: `rea-plus` 0.13.0
- Herramientas totales: 191
- Recursos totales: 2
- Prompts totales: 3
- Herramientas con outputSchema: 187
- Herramientas con annotations: 191

## Herramientas

### `close_target`

Libera el objetivo binario (y su proceso radare2) retenido por una sesión.

- Campos de entrada:
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: closed, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_attach`

Attach por pid o, en una sesión frida, conecta a un Frida Gadget en escucha (gadget host:puerto) o a un paquete móvil en ejecución en USB (usb + package). El objetivo sigue corriendo tras debug_close.

- Campos de entrada:
  - `auto_analyze` (boolean, opcional) — Ejecuta el autoanálisis x64dbg tras adjuntar (más lento).
  - `break_on_entry` (boolean, opcional) — Pausa el debugueado justo tras adjuntar.
  - `gadget` (string, opcional) — Dirección de escucha host:puerto de Frida Gadget. Para objetivos que no admiten attach por pid.
  - `package` (string, opcional) — Nombre de proceso o paquete móvil. Por defecto Gadget. Obligatorio con usb.
  - `pid` (integer, opcional) — Id de proceso en vivo. Obligatorio salvo que se defina gadget o usb.
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
  - `usb` (boolean, opcional) — Usa el dispositivo Frida USB (teléfono o tableta) en lugar de un Gadget host:puerto.
- outputSchema: sí (campos: architecture, attached, engine, entry_point, mode, module_base, module_entry, path, pid, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_breakpoint`

Define, elimina o lista puntos de interrupción. La dirección puede ser hex, un número o una expresión x64dbg.

- Campos de entrada:
  - `action` (enum, opcional)
  - `address` (string | number, opcional) — Obligatorio para set/remove; ignorado para list.
  - `condition` (string, opcional) — Expresión de condición de ruptura (solo set).
  - `log_text` (string, opcional) — Texto de log al acertar (solo set).
  - `name` (string, opcional) — Nombre del punto de interrupción (solo set).
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
  - `type` (enum, opcional)
- outputSchema: sí
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_callstack`

Lee la pila de llamadas del hilo actual (dirección, módulo, función por frame).

- Campos de entrada:
  - `max_frames` (integer, opcional) — Máximos frames devueltos (por defecto 50).
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: frames, session_id, threadId)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `debug_close`

Desmonta el proceso x64dbg oculto retenido por una sesión. Los objetivos lanzados se detienen; los adjuntados se sueltan y siguen corriendo.

- Campos de entrada:
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: closed, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_code`

Código en vivo: desensambla en una dirección (por defecto, el puntero de instrucción detenido), ensambla una instrucción o ejecuta hasta una dirección. Requiere confirm:true.

- Campos de entrada:
  - `action` (enum, obligatorio)
  - `address` (string | number, opcional) — Dirección como hex ("0x140001000"), decimal o expresión del motor ("cip").
  - `confirm` (boolean, opcional) — Debe ser true o la herramienta devuelve confirmation_required y no toca el debugueado.
  - `count` (integer, opcional) — Conteo de instrucciones a desensamblar (por defecto 12).
  - `instruction` (string, opcional) — Una sola instrucción para ensamblar.
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_continue`

Reanuda el debugueado hasta el próximo punto de interrupción, paso único o salida. La parada publica un evento (debug.breakpoint_hit / debug.exited / debug.paused) recuperable con events_pull.

- Campos de entrada:
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: address, reason, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_memory`

Memoria de proceso en vivo: leer, buscar o volcar. Requiere confirm:true. Sin él, la llamada devuelve confirmation_required y no toca el debugueado.

- Campos de entrada:
  - `action` (enum, obligatorio)
  - `address` (string | number, opcional) — Dirección de lectura/volcado.
  - `confirm` (boolean, opcional) — Debe ser true o la herramienta devuelve confirmation_required y no toca el debugueado.
  - `length` (integer, opcional) — Longitud de búsqueda en bytes (por defecto 4096, o el módulo principal).
  - `max_results` (integer, opcional)
  - `pattern` (string, opcional) — Patrón de búsqueda. Bytes hex, o ascii cuando search_type es ascii.
  - `search_type` (enum, opcional)
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
  - `size` (integer, opcional) — Conteo de bytes para lectura (por defecto 64) o volcado (por defecto 256).
  - `start_address` (string | number, opcional) — Dirección como hex ("0x140001000"), decimal o expresión del motor ("cip").
- outputSchema: sí
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `debug_open`

Abre un objetivo PE para depuración en vivo en el motor de depuración de esta sesión. Autodetecta x86/x64 y deja el debugueado pausado. x64dbg rompe en la entrada; cdb se detiene en el breakpoint inicial del cargador e informa la entrada PE.

- Campos de entrada:
  - `auto_analyze` (boolean, opcional) — Ejecuta el autoanálisis x64dbg tras cargar (más lento).
  - `break_on_entry` (boolean, opcional) — Se detiene en el punto de entrada tras cargar.
  - `command_line_args` (string, opcional) — Argumentos de línea de comandos para el debugueado.
  - `path` (string, obligatorio) — Ruta de sistema de archivos del binario PE a depurar.
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: architecture, attached, engine, entry_point, mode, module_base, module_entry, opened, path, pid, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_pause`

Pausa asíncronamente un debugueado en ejecución. Idempotente si ya está pausado.

- Campos de entrada:
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: address, reason, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_plugin`

Scylla y ScyllaHide de x64dbg. status informa archivos en disco; dump y hide no abren ventana: un plugin headless faltante devuelve engine_unavailable con la ruta de plugins. Requiere confirm:true. cdb y frida devuelven capability_unsupported.

- Campos de entrada:
  - `action` (enum, obligatorio)
  - `confirm` (boolean, opcional) — Debe ser true o la herramienta devuelve confirmation_required y no toca el debugueado.
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `debug_registers`

Lee los registros del debugueado (generales + flags; segmento/depuración opcionales).

- Campos de entrada:
  - `include_debug` (boolean, opcional) — Incluye registros de depuración.
  - `include_segment` (boolean, opcional) — Incluye registros de segmento.
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: debug, flags, general, segment, session_id)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `debug_state`

Informa el estado de depuración en vivo (en ejecución/pausado/terminado + motivo de pausa) y el objetivo abierto, si hay.

- Campos de entrada:
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `debug_step`

Avanza el debugueado un paso (dentro o sobre llamadas) e informa la nueva ubicación.

- Campos de entrada:
  - `count` (integer, opcional) — Pasos a dar (por defecto 1).
  - `kind` (enum, opcional)
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: address, disassembly, function, kind, module, registers, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_thread`

Hilos en vivo: lista, selecciona, congela, reanuda o lee el contexto de un hilo. El id es el valor devuelto por list (índice cdb, id de hilo OS x64dbg/frida). Requiere confirm:true. Frida no tiene API de suspender ni cambiar.

- Campos de entrada:
  - `action` (enum, obligatorio)
  - `confirm` (boolean, opcional) — Debe ser true o la herramienta devuelve confirmation_required y no toca el debugueado.
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
  - `thread_id` (integer, opcional)
- outputSchema: sí
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `debug_time`

Instantánea de checkpoint, línea de tiempo de checkpoints y rebobinado de un checkpoint. Un checkpoint son los registros del hilo activo, la lista de hilos y una ventana de memoria. Requiere confirm:true.

- Campos de entrada:
  - `action` (enum, obligatorio)
  - `checkpoint_id` (string, opcional)
  - `confirm` (boolean, opcional) — Debe ser true o la herramienta devuelve confirmation_required y no toca el debugueado.
  - `memory_size` (integer, opcional) — Bytes capturados en el puntero de instrucción (por defecto 64).
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `disassemble`

Desensambla instrucciones en una dirección (lineal, `count` ops) o una función entera. Por defecto, la función de entrada.

- Campos de entrada:
  - `address` (string | number, opcional) — Dirección objetivo como hex ("0x400200"), decimal o nombre de flag ("entry0").
  - `count` (integer, opcional) — Ops para modo dirección (por defecto 32).
  - `function` (string, opcional) — Nombre o dirección de función, p. ej. "entry0".
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: count, location, ops, session_id, text)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `dump`

Lee bytes crudos en una dirección como texto hexdump o arreglo JSON de bytes.

- Campos de entrada:
  - `address` (string | number, obligatorio) — Dirección objetivo como hex ("0x400200"), decimal o nombre de flag ("entry0").
  - `format` (enum, opcional)
  - `length` (integer, opcional) — Bytes a leer (por defecto 128).
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: address, bytes, format, length, session_id, text)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `events_pull`

Recupera eventos guardados de una sesión de aplicación desde un número de secuencia. No suscribe a notificaciones push.

- Campos de entrada:
  - `after` (integer, opcional) — Devuelve eventos con seq mayor que este.
  - `limit` (integer, opcional)
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: events, retainedFrom, session_id)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `explain`

Breve explicación en turco de una ventana de ensamblado: qué hace la región, a dónde salta y qué llamadas notifican al usuario o al sistema. Pasa las instrucciones ya desensambladas o un session_id. Una sesión de depuración en vivo solo se lee cuando confirm es true. Llama a esto cuando el usuario pregunte qué significa el ensamblado.

- Campos de entrada:
  - `address` (string | number, opcional) — Dirección a desensamblar cuando se omiten las instrucciones.
  - `confirm` (boolean, opcional) — Obligatorio solo cuando explain desensambla por sí mismo una sesión de depuración en vivo. Las instrucciones pegadas omiten esto.
  - `count` (integer, opcional) — Cuántas instrucciones leer (por defecto 16).
  - `instructions` (object[], opcional) — Ops ya obtenidas. Cuando se define, no se llama al depurador.
  - `session_id` (string, opcional) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: atlamalar, bildirimler, cagrilar, dil, gosterilen, kaynak, komut_sayisi, ozet, satirlar)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `get_cfg`

Grafo de flujo de control de una función como JSON y/o DOT de Graphviz. Por defecto, la función de entrada.

- Campos de entrada:
  - `address` (string | number, opcional) — Dirección objetivo como hex ("0x400200"), decimal o nombre de flag ("entry0").
  - `format` (enum, opcional)
  - `function` (string, opcional) — Nombre o dirección de función, p. ej. "entry0".
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: dot, function, json, location, session_id)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `health`

Informa la vida del puente. No toca ningún motor de depuración.

- Campos de entrada: ninguno
- outputSchema: sí (campos: name, protocol, sessions, status)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `open_target`

Abre un objetivo binario para análisis estático en una sesión radare2. Solo se admite mode 'static'; cualquier otro es error de capacidad. Requiere r2 en PATH.

- Campos de entrada:
  - `mode` (string, opcional) — Modo de análisis. Solo se admite "static".
  - `path` (string, obligatorio) — Ruta de sistema de archivos del binario a analizar.
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: engine, mode, opened, path, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `prerequisites`

Comprueba los programas que usa Conduit (radare2, x64dbg, cdb, Python, Frida, Graphviz, ScyllaHide). Los faltantes incluyen URL de descarga y dónde poner los archivos. El puente no los descarga. Llama a esto cuando falte una herramienta o antes de elegir motor.

- Campos de entrada: ninguno
- outputSchema: sí (campos: araclar, ozet)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=true, readOnlyHint=true)

### `rea_adb_devices`

Lista de dispositivos conectados.

- Campos de entrada: ninguno
- outputSchema: sí (campos: arac, cihazlar, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_adb_install`

Instalación de APK en el dispositivo.

- Campos de entrada:
  - `apk_path` (string, obligatorio)
  - `seri` (string, opcional)
- outputSchema: sí (campos: apk, arac, ok, sonuc)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_adb_logcat`

Volcado logcat del dispositivo.

- Campos de entrada:
  - `seri` (string, opcional)
- outputSchema: sí (campos: arac, ok, satirlar, toplam_satir)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_adb_packages`

Lista de paquetes instalados.

- Campos de entrada:
  - `filtre` (string, opcional)
  - `seri` (string, opcional)
- outputSchema: sí (campos: arac, ok, paketler)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_adb_screencap`

Captura de pantalla del dispositivo.

- Campos de entrada:
  - `out` (string, obligatorio)
  - `seri` (string, opcional)
- outputSchema: sí (campos: arac, bayt, ok, yol)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_android_dinamik_recete`

Generación de receta de análisis dinámico Android.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, ok, recete)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_android_recete_dogrula`

Validación en seco de la receta.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: adim_sayisi, arac, ok)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_detect`

Señal NativeAOT.

- Campos de entrada:
  - `b64dosya` (string, obligatorio)
  - `metin` (string, opcional)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_objc`

Trazas de dispatch ObjC.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_profile`

Perfil AOT.

- Campos de entrada:
  - `b64dosya` (string, obligatorio)
  - `metin` (string, opcional)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_aot_swift`

Trazas de dispatch Swift.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apktool_build`

Reconstrucción de APK desde el dir decodificado.

- Campos de entrada:
  - `dir` (string, obligatorio)
  - `out` (string, obligatorio)
- outputSchema: sí (campos: arac, ciktiApk, ok, proje)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_caps`

Sondeo de capacidades apktool.

- Campos de entrada: ninguno
- outputSchema: sí (campos: aapt2, aapt2Tamam, apktool, arac, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_apktool_decode`

Decodificación de APK (recursos).

- Campos de entrada:
  - `apk_path` (string, obligatorio)
  - `out` (string, obligatorio)
- outputSchema: sí (campos: apk, arac, ciktiDir, ok)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_framework`

Instalación de APK framework.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: apk, arac, ok)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_apktool_info`

Versiones apktool+aapt2.

- Campos de entrada: ninguno
- outputSchema: sí (campos: arac, ok, surum)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_apple_bundle`

Anatomía del bundle.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apple_macho`

Magia Mach-O + lista dyld.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_apple_plist`

Lectura de claves Info.plist.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_behavior_full`

Informe de comportamiento en una llamada.

- Campos de entrada:
  - `api` (string, obligatorio)
  - `net` (string, opcional)
- outputSchema: sí (campos: bulgular, cizelge, ok, ozet, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_behavior_timeline`

Línea de tiempo de eventos + resumen.

- Campos de entrada:
  - `olaylar` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_best_motor`

Mejor motor para el tipo objetivo (puntuación).

- Campos de entrada:
  - `adaylar` (string[], obligatorio)
  - `tip` (string, obligatorio)
- outputSchema: no
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_bindiff_fonksiyonlar`

Lista de funciones del binario (nombre/dirección + hash).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, bicim, dosya, fonksiyonlar, istatistik, ok, sayi, sembollu)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_bindiff_karsilastir`

Diferencia de funciones entre dos versiones.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: arac, aynen, cikarilan, degisen, eklenen, eski, istatistik, ok, ozet, yeni)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_browser_caps`

Sondeo de capacidades del navegador.

- Campos de entrada: ninguno
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_browser_click`

Clic + estado posterior.

- Campos de entrada:
  - `selector` (string, obligatorio)
  - `url` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_browser_har_import`

Importación HAR.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_browser_nav`

Apertura de página + título.

- Campos de entrada:
  - `url` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_browser_scenario`

Grabación de escenario.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_browser_shot`

Captura de pantalla de página completa.

- Campos de entrada:
  - `out` (string, obligatorio)
  - `url` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_config_suggest`

Fragmento de config MCP para las herramientas halladas.

- Campos de entrada:
  - `bulunan` (string[], obligatorio)
- outputSchema: sí (campos: snippet)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_console_yakala`

Mensajes de consola.

- Campos de entrada:
  - `url` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_coverage`

Tasa de cobertura.

- Campos de entrada:
  - `incelenen` (integer, obligatorio)
  - `toplam` (integer, obligatorio)
- outputSchema: sí (campos: arac, kalan, ok, oran)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_append`

Adición de evento de fallo.

- Campos de entrada:
  - `olay` (string, obligatorio)
  - `olaylar` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_hint`

Pista de fallo.

- Campos de entrada:
  - `olaylar` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_kayit_parse`

Análisis de nota de fallo.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: arac, ok, registerlar, sinyal, threadSayisi, threadler)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_ozet`

Resumen de fallo.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: arac, ilkFrame, ok, sinyal, registerSayisi, threadSayisi)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_crash_timeline`

Línea de tiempo de fallos.

- Campos de entrada:
  - `olaylar` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_cutter_caps`

Sondeo de capacidades Cutter/rizin.

- Campos de entrada: ninguno
- outputSchema: sí (campos: arac, ok, pdc, surum)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_decompile`

Pseudodescompilación Cutter.

- Campos de entrada:
  - `addr` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: addr, arac, hedef, kaynak, kod, not, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_disasm`

Desensamblado Cutter/rizin.

- Campos de entrada:
  - `addr` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: addr, arac, hedef, ok, ops)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_funcs`

Lista de funciones Cutter/rizin.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, fonksiyonlar, hedef, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_strings`

Lista de strings Cutter/rizin.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, hedef, ok, strings)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_cutter_xrefs`

Lista de xrefs Cutter/rizin.

- Campos de entrada:
  - `addr` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: addr, arac, hedef, ok, xrefs)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_diff_match`

Correspondencia de funciones (arreglos JSON).

- Campos de entrada:
  - `a` (string, obligatorio)
  - `b` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_diff_summary`

Resumen de añadidos/eliminados.

- Campos de entrada:
  - `a` (string, obligatorio)
  - `b` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_com`

Detección COM.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_int21`

Barrido de llamadas INT21.

- Campos de entrada:
  - `b64` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_mz`

Comprobación de encabezado MZ.

- Campos de entrada:
  - `b64` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dos_psp`

Análisis de struct PSP.

- Campos de entrada:
  - `b64` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dosya_izi`

Escrituras/lecturas de archivo desde eventos API.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_dotnet_cil`

Volcado de métodos CIL (dnfile).

- Campos de entrada:
  - `filtre` (string, opcional)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, assembly, dosya, filtre, method_sayisi, methods, not, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_dotnet_metadata`

Lectura de metadatos del ensamblado.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, clr, dosya, not, ok, okuyucu)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_dwarf_ozet`

Resumen DWARF de ELF.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, dosya, fonksiyonAdlari, ok, subprogramSayisi, unitSayisi)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evidence_bundle`

Construcción del paquete de evidencias.

- Campos de entrada:
  - `ogeler` (string, obligatorio)
  - `sakli` (string, obligatorio)
- outputSchema: sí (campos: digest, items, retained, tools_sha256)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evidence_verify`

Verificación del paquete de evidencias.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: ok)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_disasm`

Desensamblado de bytecode EVM (offline).

- Campos de entrada:
  - `hex` (string, obligatorio)
- outputSchema: sí (campos: arac, detay, ok, ozet)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_selector`

Selector de 4 bytes EVM (keccak, offline).

- Campos de entrada:
  - `sig` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_selectors`

Selectores EVM candidatos.

- Campos de entrada:
  - `hex` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_evm_stats`

Estadística de opcodes EVM.

- Campos de entrada:
  - `hex` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_fallback`

Cadena alternativa si falta la primaria.

- Campos de entrada:
  - `birincil` (string, obligatorio)
  - `mevcut` (string[], obligatorio)
- outputSchema: no
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_firmware_caps`

Sondeo de capacidades de firmware.

- Campos de entrada: ninguno
- outputSchema: sí (campos: ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_firmware_extract`

Extracción de firmware.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: ok, summary, tool)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_firmware_handoff`

Nota de handoff de firmware.

- Campos de entrada:
  - `neden` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: handoff, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_blutter`

Análisis Dart con Blutter (error honesto si falta).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: izler, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_payload`

Trazas de payload Flutter.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: izler, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_scan`

Barrido de trazas Flutter/Dart.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: buildId, dartMi, motor, ok, summary, tool, tur)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_flutter_snapshot`

Info de instantánea AOT Flutter (magia Dart + versión).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: dartMi, dartSurumu, izolasyon, magic, ok, summary, tool, tur)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_frida_api`

Trazador de API (nombre+args+retval).

- Campos de entrada:
  - `desen` (string, opcional)
  - `pid` (integer, obligatorio)
- outputSchema: sí (campos: arac, cagrilar, ok, pid, sayi)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_frida_cond`

Punto de interrupción condicional.

- Campos de entrada:
  - `adres` (string, obligatorio)
  - `kosul` (string, obligatorio)
  - `pid` (integer, obligatorio)
- outputSchema: sí (campos: adres, arac, hitSayisi, ok, pid, tuttu)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_pause`

Pausa del proceso objetivo (NtSuspend).

- Campos de entrada:
  - `pid` (integer, obligatorio)
- outputSchema: sí (campos: arac, durum, ok, pid)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_resume`

Reanudación del proceso pausado.

- Campos de entrada:
  - `pid` (integer, obligatorio)
- outputSchema: sí (campos: arac, durum, ok, pid)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_frida_stalker`

Traza de llamadas Stalker.

- Campos de entrada:
  - `pid` (integer, obligatorio)
  - `sure_ms` (integer, opcional)
- outputSchema: sí (campos: arac, cagrilar, ok, pid, sayi)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_frida_step`

Emulación de próxima instrucción.

- Campos de entrada:
  - `adres` (string, opcional)
  - `pid` (integer, obligatorio)
- outputSchema: sí (campos: adres, arac, ok, pid, sonraki, vurdu)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_fs_diff`

Diff de instantáneas.

- Campos de entrada:
  - `once` (string, obligatorio)
  - `sonra` (string, obligatorio)
- outputSchema: sí (campos: kayıt, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_fs_snapshot`

Instantánea de directorio.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: kayıt, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ghidra_analyze`

Importación+análisis headless Ghidra.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, hedef, log, ok)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_decompile`

Pseudocódigo Ghidra.

- Campos de entrada:
  - `addr` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: addr, arac, hedef, kod, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_disasm`

Desensamblado Ghidra.

- Campos de entrada:
  - `addr` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: addr, arac, hedef, kod, ok, sayi, talimatlar)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_funcs`

Lista de funciones Ghidra.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, fonksiyonlar, hedef, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_strings`

Lista de strings Ghidra.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, hedef, ok, strings)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_trace`

Instantánea → importación Ghidra Trace.

- Campos de entrada:
  - `kayit` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, hedef, ok, sonuc)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_vt`

Diff de funciones entre dos binarios (version tracking).

- Campos de entrada:
  - `eski` (string, obligatorio)
  - `yeni` (string, obligatorio)
- outputSchema: sí (campos: arac, degisen, eklenen, eski, ok, ozet, silinen, yeni)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_ghidra_xrefs`

Lista de xrefs Ghidra.

- Campos de entrada:
  - `addr` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: addr, arac, hedef, ok, xrefs)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_go_buildinfo`

Build-id Go + dependencias de módulo.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_funclines`

Asignación función Go + archivo:línea.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_goresym`

Análisis GoReSym (error honesto si falta).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_module`

Info de módulo Go.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_go_version`

Traza de versión Go.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hap_liste`

Lista de archivos HAP.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, dosya, dosyalar, ok, sayi)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hap_manifest`

Manifiesto HAP (bundle/versión).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, bundleName, dosya, kaynak, ok, version)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_hopper_istek`

Generación de archivo de solicitud Hopper.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: adresler, arac, hedef, hopper, istekDosyasi, ok)
- annotations: sí (destructiveHint=true, readOnlyHint=false)

### `rea_hopper_tara`

Búsqueda de string/regex en archivo.

- Campos de entrada:
  - `desen` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, desen, eslesmeler, hedef, ok, regex, sayi)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ida_flirt`

Estimación de compilador/biblioteca por strings (no firma FLIRT real; si IDA está instalado, usa la salida rea_ida_idb para verificar aplicando la firma en IDA).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, eslesmeler, guven, hedef, idaMevcut, kutuphane, method, not, ok, sayi, surumler)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ida_idb`

Generación batch de IDB (idat).

- Campos de entrada:
  - `out` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, hedef, idat, idb, ok)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_il2cpp_dump`

Volcado con Il2CppDumper (error honesto si falta).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, cikti, dosya, dosyaSayisi, log, ok, ozet)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_il2cpp_metadata`

Conteo clases/métodos de global-metadata IL2CPP.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, assemblySayisi, dosya, goruntuSayisi, metodSayisi, not, ok, ozet, sinifSayisi, surum)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_il2cpp_methods`

Firmas de métodos IL2CPP (marca honesta si limitado).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, dosya, imzaSayisi, imzalar, metodSayisi, not, ok, sinirli, surum)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_ilspy_decompile`

Decompilación C# .NET.

- Campos de entrada:
  - `out` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, ciktiDir, cs_sayisi, dosya, not, ok)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_investigate`

Plan de investigación automática (sniff+puntuación+alternativas).

- Campos de entrada:
  - `path` (string, obligatorio)
  - `soru` (string, opcional)
- outputSchema: sí (campos: arac, motor, ok, plan, skor, tip, yedekler)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_classes`

Lista de clases del APK.

- Campos de entrada:
  - `apk_path` (string, obligatorio)
- outputSchema: sí (campos: arac, ok, siniflar, toplam_sinif)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_jadx_decompile`

Decompilación de una clase del APK.

- Campos de entrada:
  - `apk_path` (string, obligatorio)
  - `out` (string, obligatorio)
  - `sinif` (string, obligatorio)
- outputSchema: sí (campos: arac, bayt, ciktiDir, dosya, ok, sinif)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_jadx_full`

Decompilación total del APK.

- Campos de entrada:
  - `apk_path` (string, obligatorio)
  - `out` (string, obligatorio)
- outputSchema: sí (campos: arac, ciktiDir, java_dosya_sayisi, ok)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_jadx_manifest`

Resumen del manifiesto del APK.

- Campos de entrada:
  - `apk_path` (string, obligatorio)
- outputSchema: sí (campos: aktiviteler, apk, arac, izinler, ok, paket)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_jadx_methods`

Lista de métodos en la salida decompilada.

- Campos de entrada:
  - `dir` (string, obligatorio)
- outputSchema: sí (campos: arac, methodlar, ok)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_read`

Lectura de clase decompilada (400 líneas).

- Campos de entrada:
  - `dir` (string, obligatorio)
  - `sinif` (string, obligatorio)
- outputSchema: sí (campos: arac, dosya, ok, satirlar, toplam_satir)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jadx_xrefs`

Búsqueda de término en la salida decompilada.

- Campos de entrada:
  - `dir` (string, obligatorio)
  - `terim` (string, obligatorio)
- outputSchema: sí (campos: arac, kayitlar, ok)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_jeb_sorgu`

Consulta MCP JEB.

- Campos de entrada:
  - `govde` (string, opcional)
  - `url` (string, obligatorio)
  - `yontem` (string, obligatorio)
- outputSchema: sí (campos: arac, durum, govde, ok, url, yontem)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_js_bundle`

Resumen del bundle.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_export_shape`

Forma de exports.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_require`

Grafo require/import.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_js_sourcemap`

Resolución de source-map.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_classdump`

Salida class-dump (error honesto si falta).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_info`

Encabezado Mach-O (arquitectura + tipo de archivo).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_loads`

Comandos load Mach-O (segmento/dylib).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_objc`

Lista clases/categorías ObjC (lectura pura).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_macho_otool`

Salida otool (error honesto si falta).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_compare`

Diff de miembros managed.

- Campos de entrada:
  - `a` (string, obligatorio)
  - `b` (string, obligatorio)
- outputSchema: sí (campos: arac, detay, ok, ozet)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_import`

Registro de reconstrucción.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, detay, ok, ozet)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_managed_verify`

Verificación de dependencia nativa.

- Campos de entrada:
  - `beklenen` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, detay, ok, ozet)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_mips_funcs`

Pre-barrido de funciones MIPS.

- Campos de entrada:
  - `b64` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_mips_psp_profile`

Perfil MIPS/PSP.

- Campos de entrada:
  - `b64` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_missing_reason`

Herramienta faltante + comando de instalación.

- Campos de entrada:
  - `eksik` (string, obligatorio)
  - `platform` (string, opcional)
- outputSchema: sí (campos: alternatif, eksik, kur, neden)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_net_capture`

Captura de red local (HAR).

- Campos de entrada:
  - `url` (string, obligatorio)
- outputSchema: sí (campos: kayıt, ok, summary, tool)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_obligation_advance`

Avance del anillo.

- Campos de entrada:
  - `bulgu` (string, obligatorio)
  - `defter` (string, obligatorio)
  - `kod` (string, obligatorio)
- outputSchema: sí (campos: links)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_close`

Sellado del libro.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: kapatıldı, links)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_ledger`

Creación del libro.

- Campos de entrada:
  - `bulgular` (string[], obligatorio)
  - `evidence_digest` (string, obligatorio)
  - `tools_sha256` (string, obligatorio)
- outputSchema: sí (campos: evidence_digest, kapatıldı, ledger_id, links, tools_sha256)
- annotations: sí (destructiveHint=false, idempotentHint=false, openWorldHint=false, readOnlyHint=true)

### `rea_obligation_verify`

Verificación de la cadena.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: eksik, ok)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pcap_oku`

Reensamblaje de flujos PCAP + descifrado TLS con keylog.

- Campos de entrada:
  - `keylog` (string, opcional)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pdb_indir`

Descarga de PDB desde el servidor de símbolos Microsoft vía registro CodeView RSDS del dir de depuración PE + integridad + caché.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, cache, dosya, guid, ok, pdb, url, yas, yol)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_pdb_yolu`

Ruta PDB desde el dir de depuración PE.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, dosya, guid, ok, pdb, yas)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_imports`

Lista de imports PE.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, dlls, dosya, fonksiyonlar, not, ok, sayi)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_info`

Info de encabezado PE.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, bit, dosya, entry, entry_hex, machine, machine_hex, ok, section_sayisi)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pe_sections`

Tabla de secciones PE.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, bolumler, dosya, ok, sayi)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_caps`

Sondeo de capacidades de proceso.

- Campos de entrada: ninguno
- outputSchema: sí (campos: kayıt, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_compare`

Comparación pipe/PTY.

- Campos de entrada:
  - `cmd` (string, obligatorio)
- outputSchema: no
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_process_run`

Registro de ejecución de proceso.

- Campos de entrada:
  - `cmd` (string, obligatorio)
- outputSchema: sí (campos: kayıt, ok, summary, tool)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_pwn_elf_layout`

Layout ELF + mitigaciones.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: no
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_pwn_gadgets`

Pista de gadgets.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_r2_callgraph`

Grafo de llamadas de funciones r2.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, fonksiyonlar, hedef, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_r2_debug`

Depuración por lotes r2 (bp+regs).

- Campos de entrada:
  - `addr` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, bpAddr, cikti, hedef, not, ok)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_r2_esil`

Regs de emulación ESIL r2.

- Campos de entrada:
  - `addr` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: addr, adim, arac, hedef, ok, regs)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_readiness`

Puntuación de preparación de reconstrucción.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: arac, eksik, ok, seviye, skor)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_funcs`

Lista de funciones en pseudocódigo.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_harness`

Esqueleto de harness C.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_recon_tag`

Etiqueta de caso.

- Campos de entrada: ninguno
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_registry_izi`

Escrituras de registro desde eventos API.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_scan_repo`

Escaneo de repo (tipo+plan).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_scan_repo_paralel`

Escaneo paralelo de repo (pool de 4, cancelable).

- Campos de entrada:
  - `eszamanlilik` (integer, opcional)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, iptalEdildi, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_sniff`

Tipo de archivo + sugerencia de motor (bytes mágicos).

- Campos de entrada:
  - `b64dosya` (string, obligatorio)
- outputSchema: sí (campos: motor, tip)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_storage_dump`

Cookies + localStorage.

- Campos de entrada:
  - `url` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_typedef_oner`

Sugerencia de nombre de argumento + propagación.

- Campos de entrada:
  - `text` (string, obligatorio)
- outputSchema: sí (campos: arac, ok, oneriler, sayi)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_unpack_hunt`

Flujo guiado de packer desconocido.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: adimlar, arac, karar, ok)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_unpack_try`

Enrutamiento automático de desempaquetado.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: sonuc, yontem)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_upx_info`

Info de si está comprimido con UPX.

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, cikti, dosya, not, ok, sikisik)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_upx_unpack`

Descompresión UPX.

- Campos de entrada:
  - `out` (string, obligatorio)
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, cikti, dosya, log, ok)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `rea_wasm_decode`

Decodificación WASM/WAT (wabt).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `rea_wasm_exports`

Lista de exports WAT (offline).

- Campos de entrada:
  - `wat` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_imports`

Lista de imports WASM.

- Campos de entrada:
  - `b64` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_sections`

Tabla de secciones WASM.

- Campos de entrada:
  - `b64` (string, obligatorio)
- outputSchema: sí (campos: details, ok, summary, tool)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `rea_wasm_validate`

Validación WASM (wasm-validate).

- Campos de entrada:
  - `path` (string, obligatorio)
- outputSchema: sí (campos: arac, detay, ok, ozet)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `session_close`

Descarta una sesión de aplicación y su búfer de eventos.

- Campos de entrada:
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: closed, session_id)
- annotations: sí (destructiveHint=true, openWorldHint=true, readOnlyHint=false)

### `session_list`

Lista las sesiones de aplicación retenidas en este proceso.

- Campos de entrada: ninguno
- outputSchema: sí (campos: sessions)
- annotations: sí (destructiveHint=false, idempotentHint=true, openWorldHint=false, readOnlyHint=true)

### `session_open`

Abre una sesión de aplicación para un motor. Devuelve session_id para argumentos posteriores de herramientas.

- Campos de entrada:
  - `engine` (enum, obligatorio)
- outputSchema: sí (campos: createdAt, engine, session_id)
- annotations: sí (destructiveHint=false, idempotentHint=false, openWorldHint=false, readOnlyHint=false)

### `static_info`

Informa capacidades del motor estático radare2, disponibilidad de r2 y el objetivo abierto (si hay).

- Campos de entrada:
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: capabilities, engine, r2, session_id, target)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `strings`

Strings halladas en el binario (dirección, sección, longitud, texto).

- Campos de entrada:
  - `limit` (integer, opcional) — Máximas strings devueltas (por defecto 200).
  - `min_length` (integer, opcional) — Conserva strings con longitud >= esta (por defecto 0).
  - `offset` (integer, opcional) — Omite estas coincidencias (por defecto 0).
  - `section` (string, opcional) — Solo strings de esta sección, p. ej. ".rodata".
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: offset, session_id, strings, total)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

### `xrefs`

Referencias cruzadas hacia y/o desde una dirección (código y datos).

- Campos de entrada:
  - `address` (string | number, obligatorio) — Dirección objetivo como hex ("0x400200"), decimal o nombre de flag ("entry0").
  - `direction` (enum, opcional)
  - `session_id` (string, obligatorio) — Id de sesión de la aplicación. No es una sesión del protocolo MCP.
- outputSchema: sí (campos: address, from, session_id, to)
- annotations: sí (openWorldHint=true, readOnlyHint=false)

## Recursos

- `rea-plus://capabilities-safety` — nombre: `capabilities-safety` — mimeType: `application/json` — Resumen de capacidades estáticas y reglas de seguridad (solo lectura).
- `rea-plus://server-info` — nombre: `server-info` — mimeType: `application/json` — Identidad estática del servidor y resumen de superficie (solo lectura).

## Prompts

- `android-triage` — argumentos: `focus` (opcional), `path` (obligatorio) — Flujo de triage estático del APK basado en jadx (prompt sin efectos secundarios).
- `dotnet-malware-triage` — argumentos: `focus` (opcional), `path` (obligatorio) — Flujo de triage de malware estático para muestra .NET (prompt sin efectos secundarios).
- `packer-triage` — argumentos: `focus` (opcional), `path` (obligatorio) — Flujo rea ordenado con prioridad estática para detección de packer/protección (prompt sin efectos secundarios).
