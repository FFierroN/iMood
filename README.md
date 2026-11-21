# iMood, catálogo de accesorios para iPhone (PWA)

Vite + JavaScript, instalable y con modo sin conexión. Basado en el catálogo Bruma:
un producto por pantalla, ficha con fotos, características y cotización por WhatsApp.

## Probar en tu computador
```bash
npm install
npm run dev        # http://localhost:5173
```

## Datos del catálogo
Todo sale de `public/productos.json`. Cada producto tiene:

| Campo | Qué es |
|---|---|
| `id` | identificador único, sin espacios (se usa en la dirección de la ficha) |
| `codigo` | orden en el catálogo |
| `categoria` | Audio, Carga, etc. (servirá para los filtros) |
| `nombre`, `subtitulo` | lo que se ve en la tarjeta |
| `precio` | en CLP, sin puntos (ej: `24990`) |
| `imagenes` | lista de fotos dentro de `public/img/...` (la primera es la portada) |
| `descripcion` | texto corto de la ficha |
| `specs` | características: `icono`, `titulo`, `valor` |
| `variantes` | opcional: `nombre`, `precio` y `nota` de cada opción |
| `visible` | `false` para ocultar el producto sin borrarlo |

Íconos disponibles para `specs`: `chip`, `bateria`, `audio`, `agua`, `carga`, `ruido`, `corazon`, `rayo`, `cable`.

### Agregar un producto
1. Crea una carpeta en `public/img/<id-del-producto>/` con fotos `.webp` (unos 600–1000 px, fondo blanco).
2. Copia un bloque en `productos.json`, cambia los datos y las rutas de las fotos.

## Íconos de la app
Se generan desde `public/favicon.svg` con `npm run iconos`.

## Publicar en Cloudflare
```bash
npm run build
npx wrangler deploy      # usa wrangler.jsonc
```
O conecta el repo en Cloudflare con build `npm run build` y carpeta de salida `dist`.
