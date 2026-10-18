# Biblioteca de prompts de ejemplo de ReaPlus

5 escenarios listos: comando + salida esperada + qué significa. Cada
comando y cada número aquí provienen de una ejecución real (sin salidas
inventadas); `tests/docs-examples.test.mjs` los ejecuta y los verifica.

Superficie (resumen de la referencia generada [`TOOLS.md`](TOOLS.md)): **191 herramientas**,
**187 outputSchema**, **191 annotations**, 2 recursos, 7 prompts.

Requisito previo: `npm run build` (los ejemplos se ejecutan sobre `dist/`). Los
archivos del corpus son de solo lectura (`tests/corpus/`); ningún ejemplo los modifica.

## 1) Triage de PE — "¿qué es este exe, a qué llama?"

```bash
node dist/cli/index.js analyze-pe tests/corpus/mini_pe_x64.exe
```

Salida esperada (ejecución real):

```text
dosya: tests/corpus/mini_pe_x64.exe
machine: 0x8664 bit: 64 sections: 1 entry: 0x1000
dll (1): kernel32.dll
fonksiyon (1): kernel32.dll!ExitProcess
```

Qué significa: `0x8664` = COFF x64, una sola sección `.text`, entrada en `0x1000`;
una única importación `kernel32.dll!ExitProcess` — el perfil de un binario de prueba mínimo.
Su forma legible por máquina:

```bash
node dist/cli/index.js analyze-pe tests/corpus/mini_pe_x64.exe --json
```

```json
{"ok":true,"path":"tests/corpus/mini_pe_x64.exe","machine":34404,
 "machine_hex":"0x8664","bit":"64","section_sayisi":1,"entry":4096,
 "entry_hex":"0x1000","dlls":["kernel32.dll"],
 "fonksiyonlar":["kernel32.dll!ExitProcess"],
 "bolumler":[{"ad":".text","vsize":4096,"vaddr":4096}]}
```

## 2) Manifiesto de APK — "¿nombre, permisos y actividades de este paquete?"

Si `jadx` está instalado (si no, devuelve `capability_unsupported` + pista de
instalación; no se inventa ningún manifiesto):

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

Salida esperada (ejecución real, jadx 1.x):

```json
{"ok":true,"arac":"rea_jadx_manifest","apk":"tests/corpus/sahte.apk",
 "paket":"com.ornek.sahte","izinler":[],"aktiviteler":[]}
```

Qué significa: jadx abre los recursos con `--no-src` y analiza
`AndroidManifest.xml`; en el APK ficticio del corpus hay nombre de paquete pero
sin permisos ni actividades — en una aplicación real aquí se listarían permisos
como `INTERNET` y actividades como `.MainActivity`. Con `rea_jadx_classes` se baja
a la lista de clases y con `rea_jadx_decompile` a la fuente de una sola clase.

## 3) Perfil de comportamiento — "ordena los eventos en una línea de tiempo"

Función pura, sin ejecución — ordena los eventos de api/syscall/net/archivo/proceso
por prioridad de fuente y produce un resumen de primero/último + top-5 de API:

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

Salida esperada (ejecución real):

```text
4 olay api@2 -> process@4 top_api=CreateFileW
```

Qué significa: los 4 eventos se ordenan no por cronología sino por **prioridad de
fuente** (api > syscall > net > archivo > proceso); `sayılar`
(`{api:2, net:1, process:1}`) cuenta por fuente y `top_api` da la API más frecuente. Con una
lista vacía o incompleta devuelve `capability_unsupported` — no se inventa ninguna línea de tiempo vacía.

## 4) Escaneo de repo — "¿qué tipos de archivos hay en este directorio?"

Detección de PE/ELF/APK/JS/WASM por bytes mágicos + pista de extensión, sugerencia de
motor y plan de 5 archivos (totalmente offline; se omiten `.git`/`node_modules`/`dist`):

```bash
node -e "import('node:fs').then(async fs=>{const {rea_scan_repo}=await import('./dist/rea-domains/reposcan/RepoScan.js');
const r=await rea_scan_repo('<hedef-dizin>');console.log(r.summary,JSON.stringify(r.details.tipler));})"
```

Ejecución real en un directorio con 5 archivos mágicos:

```text
5 dosya, 5 tip {"pe":1,"elf":1,"apk":1,"js":1,"wasm":1}
```

Qué significa: cada archivo se lista como trío `ruta/tipo/motor`
(p. ej., `.exe` → `pe`/`cutter`, `.apk` → `apk`/`jadx`, `.elf` →
`elf`/`radare2`); `planlar` da la siguiente herramienta recomendada para cada archivo.
En un directorio vacío o sin objetivo, lista vacía (`ok:true`); en un directorio
inexistente, `capability_unsupported`.

## 5) Descarga de PDB — "del registro de depuración al símbolo"

Paso 1 — Resuelve la identidad del PDB desde el registro CodeView RSDS (solo lectura):

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-bilgili.exe>'))))"
```

Ejecución real en un PE con información de depuración (muestra generada localmente):

```json
{"ok":true,"arac":"rea_pdb_yolu","pdb":"ornek_test.pdb",
 "guid":"ABCDEF01-2345-6789-ABCD-EF0123456789","yas":1}
```

Sin registro de depuración devuelve `bulunamadi` (`PDB debug kaydı yok` — sin registro
de depuración PDB); no se inventa ningún GUID.

Paso 2 — Descarga con diseño de servidor de símbolos de Microsoft + integridad + caché:

```text
<server>/ornek_test.pdb/ABCDEF0123456789ABCDEF01234567891/ornek_test.pdb
```

Qué significa: la URL sigue el diseño `Nombre/GUID-sin-guiones+EDAD/Nombre`; el archivo
descargado se valida con firma MSF + patrón GUID+edad y se escribe bajo
`<caché>/Nombre/FIRMA/Nombre`; la segunda llamada devuelve `cache:true` sin ir a la red. El contenido
corrupto se rechaza con `butunluk_hatasi` y no se escribe ningún archivo a medias; sin red,
`ag_hatasi` — nunca se escribe un PDB falso. El directorio de caché se traslada
con `REAPLUS_SYMBOL_CACHE`.

## Pasos siguientes

- Lista completa de herramientas: [`TOOLS.md`](TOOLS.md) (generada, 187 herramientas).
- Flujo de verificación: [`VERIFY.md`](VERIFY.md); flujo de contribución: `CONTRIBUTING.md`.
