ReaPlus Docs (ES) — textos de la carcasa del sitio estático.

Fuente: `scripts/site-uret.mjs` (definiciones de página, navegación, búsqueda
y línea de resumen). Este archivo traduce solo las cadenas visibles de la
carcasa; el contenido de cada página vive en sus propios archivos
(`README.md`, `TOOLS.md`, `EXAMPLES.md`, `ROADMAP.md`, `CHANGELOG.md`,
`PROMPTS.md` de esta misma carpeta).

**Páginas y navegación** (`html` → título → descripción):

- `index.html` → "Página principal" → sitio estático único con todo el contenido.
- `readme.html` → "README" → "Instalación, clientes, características, seguridad".
- `tools.html` → "Referencia de herramientas" → "Catálogo completo generado (superficie real)".
- `examples.html` → "Ejemplos" → "5 escenarios de ejecuciones reales".
- `roadmap.html` → "Hoja de ruta" → "Tareas prioritarias y cerradas".
- `changelog.html` → "Cambios" → "Notas de versión (Keep a Changelog)".
- `prompts.html` → "Biblioteca de prompts" → "10 plantillas de preguntas listas".

La página activa se muestra destacada; las demás son enlaces (separados por "·").

**Búsqueda del índice:**

- Etiqueta: "Buscar en el sitio:".
- Marcador del campo: "p. ej., pcap, receta, fuzz".
- Las entradas del índice de prompts llevan la descripción "prompt listo".

**Línea de resumen de superficie** (encabezado de cada página):

- Prefijo: "Resumen de superficie (ejecución real, TOOLS.md):".
- Formato: "<n> herramientas · <n> outputSchema · <n> annotations · <n> recursos · <n> prompts".

**Cuerpo del índice:**

- "README + Referencia de herramientas + Ejemplos + Hoja de ruta + Cambios + Biblioteca de prompts — un solo sitio estático. Generación: `node scripts/site-uret.mjs`."

**Notas de generación (ES):**

- Atributo de idioma: `<html lang="es">`.
- Sufijo de título: "— ReaPlus Docs".
- Enlaces relativos desconocidos a `.md` se escriben como URL blob de GitHub (sin enlaces rotos); las anclas `#` se resuelven con los id generados por el slugger de estilo GitHub.
