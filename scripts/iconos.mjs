// Genera los íconos PNG de la app (instalable) a partir de public/favicon.svg.
// Uso: npm run iconos  (solo hace falta volver a correrlo si cambias el logo)
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const ruta = (n) => fileURLToPath(new URL(`../public/${n}`, import.meta.url));
const png = (texto, px, nombre) =>
  sharp(Buffer.from(texto), { density: 300 }).resize(px, px).png().toFile(ruta(nombre));

await png(svg, 180, 'apple-touch-icon.png');
await png(svg, 192, 'pwa-192.png');
await png(svg, 512, 'pwa-512.png');

// "Maskable": Android recorta el ícono con su propia forma, así que va sin esquinas
// redondeadas y con el dibujo más chico (dentro de la zona segura del 80 %)
const maskable = svg
  .replace('rx="112"', 'rx="0"')
  .replace('<g id="glifo">', '<g id="glifo" transform="translate(51.2 51.2) scale(0.8)">');
await png(maskable, 512, 'pwa-maskable-512.png');

console.log('Íconos generados en public/');
