# Biblioteca de prompts de ReaPlus (10 prompts listos)

10 plantillas de preguntas que el agente le hace a rea-plus. Cada prompt: **Objetivo** +
**Llamada de ejemplo** (forma real MCP/`rea-plus-cli`; los nombres de campo coinciden con la
referencia generada [`TOOLS.md`](TOOLS.md)) + tipo de **Salida esperada**.
Superficie: **187 herramientas**, **183 outputSchema**, **187 annotations**, 2 recursos, 3 prompts.

> Nota: las llamadas de depuración en vivo que piden `confirm:true` no están en la lista; los
> 10 prompts son todos flujos de solo lectura/estáticos.

## 1) Triage — "¿qué es este archivo, por dónde empiezo?"

**Objetivo:** Clasificar un archivo desconocido en una sola llamada y obtener el plan de pasos siguientes.

**Llamada de ejemplo:**

```json
{ "name": "rea_investigate", "arguments": { "path": "sample.exe" } }
```

**Salida esperada:** objeto con campos `ok/plan/skor/tip/motor/yedekler` (campos de
`outputSchema`: `arac, motor, ok, plan, skor, tip, yedekler`); tipo (pe/elf/apk/…),
puntuación de confianza y lista de motor recomendado + planes alternativos.

## 2) Manifiesto — "¿paquete, permisos y actividades de este APK?"

**Objetivo:** Resolver la identidad `AndroidManifest.xml` del APK con jadx.

**Llamada de ejemplo:**

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

**Salida esperada:** objeto con campos `ok/paket/izinler/aktiviteler`; sin jadx,
`capability_unsupported` + pista de instalación en lugar de un manifiesto inventado.

## 3) Comportamiento — "ordena los eventos en una línea de tiempo"

**Objetivo:** Producir un resumen por prioridad de fuente a partir de eventos de
API/syscall/net/archivo/proceso (sin ejecución, función pura).

**Llamada de ejemplo:**

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

**Salida esperada:** resumen de texto (formato `4 olay api@2 -> process@4 top_api=CreateFileW`)
+ detalles `sıralı/sayılar/top_api/ilk/son`; con lista vacía,
`capability_unsupported`.

## 4) Repo — "¿qué tipos de archivos hay en este directorio?"

**Objetivo:** Detectar archivos PE/ELF/APK/JS/WASM de un directorio por bytes mágicos y obtener el
plan de siguiente herramienta por archivo.

**Llamada de ejemplo:**

```json
{ "name": "rea_scan_repo", "arguments": { "path": "<hedef-dizin>" } }
```

**Salida esperada:** texto `summary` (formato `5 dosya, 5 tip …`) +
conteo `details.tipler` + `details.planlar` (archivo → motor recomendado);
en un directorio sin objetivo, lista vacía (`ok:true`).

## 5) PDB — "del registro de depuración al símbolo"

**Objetivo:** Resolver la identidad del PDB desde el registro CodeView RSDS del PE y descargarlo
con diseño de servidor de símbolos de Microsoft (con integridad + caché).

**Llamada de ejemplo:**

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-bilgili.exe>'))))"
```

**Salida esperada:** en el paso 1, `pdb/guid/yas` (campos de `rea_pdb_yolu`:
`arac, dosya, guid, ok, pdb, yas`); en el paso 2, URL con diseño
`Ad/GUID-tiresiz+YAŞ/Ad`, información de `yol/cache` (campos de `rea_pdb_indir`:
`arac, cache, dosya, guid, ok, pdb, url, yas, yol`); con contenido corrupto,
`butunluk_hatasi`; en la segunda llamada, `cache:true`.

## 6) Diff — "¿cuál es la diferencia de funciones entre dos versiones?"

**Objetivo:** Comparar las listas de funciones de dos versiones de un binario y obtener los
conjuntos añadido/eliminado/cambiado/idéntico (puerta de entrada a un análisis N-day).

**Llamada de ejemplo:**

```json
{ "name": "rea_bindiff_karsilastir", "arguments": { "text": "<rea_bindiff_fonksiyonlar çıktısı>" } }
```

**Salida esperada:** objeto con campos `aynen/cikarilan/degisen/eklenen/eski/yeni/istatistik/ozet`;
la entrada es salida de `rea_bindiff_fonksiyonlar` (`path` obligatorio).

## 7) Pcap — "¿qué flujos hay en esta captura, se puede descifrar el TLS?"

**Objetivo:** Reensamblar los flujos de un archivo PCAP; si hay keylog, descifrar el contenido TLS.

**Llamada de ejemplo:**

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap" } }
```

Con keylog:

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap", "keylog": "sslkeylog.txt" } }
```

**Salida esperada:** lista de flujos reensamblados en `details/summary`
(hay `outputSchema`); `keylog` es opcional: si no se da, los meta-flujos se devuelven
sin descifrar el contenido cifrado.

## 8) Receta — "genera y valida el plan de análisis dinámico para este APK"

**Objetivo:** Generar una receta de análisis dinámico con validación en seco a partir de la ruta del APK
(sin ejecución, plan + validación).

**Llamada de ejemplo:**

```json
{ "name": "rea_android_dinamik_recete", "arguments": { "path": "ornek.apk" } }
```

Luego, con el texto de la receta:

```json
{ "name": "rea_android_recete_dogrula", "arguments": { "text": "<recete-metni>" } }
```

**Salida esperada:** la primera, objeto con campo `recete`; la segunda, resultado de
validación con campos `adim_sayisi/ok`.

## 9) Fuzz — "¿los analizadores se cuelgan con entradas corruptas?"

**Objetivo:** Alimentar entradas corruptas con semillas del corpus a los analizadores de
PE/ELF/WASM/metadatos y barrer fallos/excepciones (escritura solo a tmpdir).

**Llamada de ejemplo:**

```bash
node scripts/fuzz-parsers.mjs
```

**Salida esperada:** resumen de consola (número de semillas, lista de entradas que fallan; cero
fallos en una ejecución limpia) + verde en `tests/parser-fuzz.test.mjs`; el corpus
(`tests/corpus/`) permanece de solo lectura.

## 10) Perf — "¿se cumplen los presupuestos de lista/apertura?"

**Objetivo:** Medir los presupuestos de tiempo de respuesta de `tools/list` + tiempo de arranque del servidor y
atrapar la regresión con pruebas.

**Llamada de ejemplo:**

```bash
node tests/perf-budget.test.mjs
```

**Salida esperada:** salida de node:test (umbrales de presupuesto definidos dentro de
`tests/perf-budget.test.mjs`); superar un umbral pone la prueba en rojo y los tiempos se
informan en consola en milisegundos.
