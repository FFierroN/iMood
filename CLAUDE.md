# iMood: catálogo de accesorios para iPhone

## Qué es
PWA con Vite + JavaScript (sin framework), basada en el catálogo Bruma
(`D:\Felip\Documents\PERFUMES\bruma`). Solo en español.

## Estructura
- `public/productos.json`: los datos del catálogo (fuente única por ahora, sin Supabase).
- `public/img/<id>/`: fotos de cada producto en .webp.
- `src/main.js`: vistas (lista tipo slides verticales + ficha con galería, variantes y características).
- `src/data.js`: carga de datos con copia en localStorage para uso sin conexión.
- `src/style.css`: estilos. Colores en variables de `:root`, acento en `--mood` (degradado).
- `scripts/iconos.mjs`: genera los PNG de la app desde `public/favicon.svg` (`npm run iconos`).

## Reglas del proyecto
- WhatsApp: un solo número (`WA_NUMERO` en `src/main.js`). El mensaje lleva solo el nombre del
  producto (y la variante si aplica), sin número de catálogo.
- Precios en CLP. Los actuales son ficticios hasta que Felipe entregue los reales.
- Todavía no hay filtros, pero se agregarán: usar el campo `categoria` cuando llegue el momento.
- No describir productos como "originales" ni usar logos de Apple en la interfaz sin confirmar con Felipe.
