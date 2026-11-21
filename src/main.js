import '@fontsource-variable/manrope';
import './style.css';
import { registerSW } from 'virtual:pwa-register';
import waNegro from './assets/whatsapp-negro.png';
import { cargarProductos } from './data.js';

registerSW({ immediate: true });

const app = document.querySelector('#app');

// ---------- WhatsApp ----------
const WA_NUMERO = '56959227912';
const waLink = (mensaje) => `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`;
const MSG_GENERAL = 'Hola, estuve viendo el catálogo de iMood y tengo una consulta.';
const msgProducto = (nombre) => `Hola, me interesa ${nombre}. ¿Me podrían dar más información?`;

// ---------- utilidades ----------
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const peso = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
const tienePrecio = (v) => v != null && v !== '';
// Fotos: se aceptan rutas internas (img/...) o direcciones https
const urlFoto = (u) => {
  if (/^https:\/\//.test(u || '')) return u;
  if (/^img\/[\w\-./]+$/.test(u || '') && !u.includes('..')) return `${import.meta.env.BASE_URL}${u}`;
  return '';
};
// Precio a mostrar en la tarjeta: si las variantes cuestan distinto, "Desde" el más barato
function precioTarjeta(p) {
  const precios = (p.variantes || []).map((v) => v.precio).filter(tienePrecio);
  if (precios.length) {
    const min = Math.min(...precios);
    return precios.some((x) => x !== min) ? `Desde ${peso(min)}` : peso(min);
  }
  return tienePrecio(p.precio) ? peso(p.precio) : '';
}
const nombreConVariante = (p, v) => (v ? `${p.nombre} (${v.nombre})` : p.nombre);

// ---------- estado ----------
const FAV_KEY = 'imood:favoritos';
function leerFavs() {
  try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch { return new Set(); }
}
const estado = {
  productos: [],
  guardado: false,
  soloFavs: false,
  favs: leerFavs(),
  variante: {}, // variante elegida por producto: { 'cargador-20w': 1 }
  indice: 0 // producto que se está viendo, para volver al mismo lugar desde la ficha
};
function alternarFav(id) {
  estado.favs.has(id) ? estado.favs.delete(id) : estado.favs.add(id);
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...estado.favs])); } catch {}
}

// ---------- íconos ----------
const ICO = (d) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICONOS = {
  chip: ICO('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>'),
  bateria: ICO('<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M6 10v4M10 10v4"/>'),
  audio: ICO('<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>'),
  agua: ICO('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
  carga: ICO('<path d="M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0zM12 17v4"/>'),
  ruido: ICO('<path d="M3 12h2M7 8v8M11 5v14M15 9v6"/><path d="M19 9l3 6M22 9l-3 6"/>'),
  corazon: ICO('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M7 12h3l1-2 2 4 1-2h3"/>'),
  rayo: ICO('<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>'),
  cable: ICO('<path d="M7 3v4M5 7h4v4a2 2 0 0 1-4 0zM7 13v3a4 4 0 0 0 8 0V9a4 4 0 0 1 8 0"/>'),
  estrella: ICO('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>')
};
const CORAZON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg>';
const FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
const WA_ICONO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 0 1 0 16.2 8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.1.89.9-3.02-.2-.31A8.1 8.1 0 0 1 12.04 3.8zM8.8 7.4c-.2 0-.5.07-.75.35-.26.28-1 1-1 2.4s1.03 2.8 1.17 3c.15.2 2 3.2 4.95 4.35 2.45.97 2.95.78 3.48.73.53-.05 1.7-.7 1.95-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.34-.3-.15-1.7-.84-1.97-.94-.26-.1-.46-.15-.65.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.65-1.6-.9-2.18-.23-.56-.47-.48-.65-.49z"/></svg>';
// Si una foto no existe o no carga, se muestra este dibujo en su lugar
const SIN_FOTO = `<div class="sin-foto">${ICO('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>')}</div>`;

document.addEventListener(
  'error',
  (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.closest('.slide-foto, .galeria')) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = SIN_FOTO;
    img.replaceWith(tpl.content.firstElementChild);
  },
  true
);

// ---------- piezas de interfaz ----------
function foto(p, i = 0, carga = 'lazy') {
  const url = urlFoto(p.imagenes?.[i]);
  return url
    ? `<img src="${esc(url)}" alt="${esc(p.nombre)}${i ? `, foto ${i + 1}` : ''}" loading="${carga}" decoding="async" />`
    : SIN_FOTO;
}

function botonFav(p) {
  const fav = estado.favs.has(p.id);
  return `<button class="fav" data-id="${esc(p.id)}" aria-pressed="${fav}" aria-label="${fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">${CORAZON}</button>`;
}

// Tarjeta: foto, categoría, nombre, subtítulo y precio
function slide(p) {
  const precio = precioTarjeta(p);
  return `
  <section class="slide" aria-label="${esc(p.nombre)}">
    <div class="tarjeta">
      <a class="slide-foto" href="#/producto/${encodeURIComponent(p.id)}" aria-label="Ver detalles de ${esc(p.nombre)}">${foto(p)}</a>
      ${botonFav(p)}
      <a class="wa-slide" href="${esc(waLink(msgProducto(p.nombre)))}" target="_blank" rel="noopener noreferrer" aria-label="Consultar ${esc(p.nombre)} por WhatsApp" title="Consultar por WhatsApp"><img src="${waNegro}" alt="" width="28" height="28" /></a>
    </div>
    <a class="slide-texto" href="#/producto/${encodeURIComponent(p.id)}">
      ${p.categoria ? `<p class="categoria">${esc(p.categoria)}</p>` : ''}
      <h2 class="nombre">${esc(p.nombre)}</h2>
      ${p.subtitulo ? `<p class="subtitulo">${esc(p.subtitulo)}</p>` : ''}
      ${precio ? `<p class="precio">${esc(precio)}</p>` : ''}
      <span class="ver-mas">Ver detalles</span>
    </a>
  </section>`;
}

function filtrados() {
  return estado.productos
    .filter((p) => !estado.soloFavs || estado.favs.has(p.id))
    .sort((a, b) => (a.codigo ?? 0) - (b.codigo ?? 0));
}

// ---------- vista: lista (un producto por pantalla) ----------
function vistaLista() {
  app.innerHTML = `
  <header class="barra">
    <button type="button" id="logo-inicio" class="logo" aria-label="iMood, ir al inicio del catálogo"><span class="logo-i">i</span><span class="logo-mood">Mood</span></button>
    <button type="button" id="ver-favs" class="btn-barra btn-fav" aria-pressed="${estado.soloFavs}" aria-label="Ver solo mis favoritos" title="Mis favoritos">${CORAZON}</button>
    <a class="wa-circulo" href="${esc(waLink(MSG_GENERAL))}" target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp" title="Consultar por WhatsApp"><img src="${waNegro}" alt="" width="28" height="28" /></a>
  </header>
  ${estado.guardado ? '<p class="aviso" role="status">Sin conexión. Mostrando la última versión guardada.</p>' : ''}
  <div id="pager" class="pager" tabindex="0" aria-label="Catálogo de productos. Desliza hacia arriba para ver el siguiente."></div>
  <div id="riel" class="riel" aria-hidden="true"><div class="riel-linea"></div><div id="riel-pulgar" class="riel-pulgar"></div><div id="riel-burbuja" class="riel-burbuja" hidden></div></div>
  <p id="contador" class="contador" aria-live="polite"></p>`;

  const pager = document.querySelector('#pager');
  pintarSlides(false);
  // Vuelve al producto en el que estabas antes de abrir la ficha
  pager.scrollTop = estado.indice * pager.clientHeight;
  actualizarContador();

  document.querySelector('#logo-inicio').addEventListener('click', () => {
    pager.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const btnFavs = document.querySelector('#ver-favs');
  btnFavs.addEventListener('click', () => {
    estado.soloFavs = !estado.soloFavs;
    btnFavs.setAttribute('aria-pressed', estado.soloFavs);
    pintarSlides(true);
  });

  // Riel lateral: arrastrar para recorrer el catálogo rápidamente
  const riel = document.querySelector('#riel');
  const burbuja = document.querySelector('#riel-burbuja');
  const irA = (clientY) => {
    const slides = pager.querySelectorAll('.slide:not(.vacio-slide)');
    if (!slides.length) return;
    const r = riel.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    const i = Math.round(f * (slides.length - 1));
    pager.style.scrollSnapType = 'none';
    pager.scrollTop = i * pager.clientHeight;
    burbuja.textContent = `${i + 1} · ${slides[i].getAttribute('aria-label') || ''}`;
    burbuja.style.top = `${f * 100}%`;
    burbuja.hidden = false;
  };
  const soltar = () => {
    burbuja.hidden = true;
    pager.style.scrollSnapType = '';
    pager.scrollTop = Math.round(pager.scrollTop / pager.clientHeight) * pager.clientHeight;
  };
  riel.addEventListener('pointerdown', (e) => { riel.setPointerCapture(e.pointerId); riel.dataset.arrastrando = '1'; irA(e.clientY); });
  riel.addEventListener('pointermove', (e) => { if (riel.dataset.arrastrando) irA(e.clientY); });
  ['pointerup', 'pointercancel'].forEach((ev) => riel.addEventListener(ev, () => { delete riel.dataset.arrastrando; soltar(); }));

  let pendiente = false;
  pager.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      estado.indice = Math.round(pager.scrollTop / pager.clientHeight);
      actualizarContador();
    });
  });

  pager.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav');
    if (!btn) return;
    alternarFav(btn.dataset.id);
    const fav = estado.favs.has(btn.dataset.id);
    btn.setAttribute('aria-pressed', fav);
    btn.setAttribute('aria-label', fav ? 'Quitar de favoritos' : 'Guardar en favoritos');
  });
}

function pintarSlides(volverAlInicio) {
  const lista = filtrados();
  const pager = document.querySelector('#pager');
  pager.innerHTML = lista.length
    ? lista.map(slide).join('')
    : `<section class="slide vacio-slide"><p class="vacio">${
        estado.soloFavs ? 'Aún no tienes favoritos. Toca el corazón de un producto para guardarlo.' : 'No hay productos para mostrar.'
      }</p></section>`;
  if (volverAlInicio) { pager.scrollTop = 0; estado.indice = 0; }
  actualizarContador();
}

function actualizarContador() {
  const el = document.querySelector('#contador');
  if (!el) return;
  const total = document.querySelectorAll('#pager .slide:not(.vacio-slide)').length;
  el.textContent = total ? `${Math.min(estado.indice + 1, total)} de ${total}` : 'Sin resultados';
  const pulgar = document.querySelector('#riel-pulgar');
  if (pulgar) {
    pulgar.style.top = total > 1 ? `${(Math.min(estado.indice, total - 1) / (total - 1)) * 100}%` : '0%';
    document.querySelector('#riel').hidden = total < 2;
  }
}

// ---------- vista: ficha del producto ----------
function vistaDetalle(id) {
  const p = estado.productos.find((x) => String(x.id) === id);
  const volver = `<a class="volver" href="#/" aria-label="Volver al catálogo">${FLECHA}<span>Catálogo</span></a>`;
  if (!p) {
    app.innerHTML = `<main class="detalle"><div class="fila-sup">${volver}</div><p class="vacio">No encontramos ese producto.</p></main>`;
    return;
  }
  const fotos = (p.imagenes || []).length ? p.imagenes : [null];
  const variantes = p.variantes || [];
  const elegida = Math.min(estado.variante[p.id] ?? 0, Math.max(variantes.length - 1, 0));

  app.innerHTML = `
  <main class="detalle">
    <div class="fila-sup">${volver}${botonFav(p)}</div>

    <div class="galeria-marco">
      <div class="galeria" id="galeria" tabindex="0" aria-label="Fotos de ${esc(p.nombre)}">
        ${fotos.map((_, i) => `<div class="galeria-item">${foto(p, i, i === 0 ? 'eager' : 'lazy')}</div>`).join('')}
      </div>
      ${fotos.length > 1 ? `<div class="puntos" role="group" aria-label="Elegir foto">
        ${fotos.map((_, i) => `<button type="button" class="punto" data-foto="${i}" aria-label="Foto ${i + 1}" aria-current="${i === 0}"></button>`).join('')}
      </div>` : ''}
    </div>

    <div class="cabecera">
      ${p.categoria ? `<p class="categoria">${esc(p.categoria)}</p>` : ''}
      <h1 class="nombre">${esc(p.nombre)}</h1>
      ${p.subtitulo ? `<p class="subtitulo">${esc(p.subtitulo)}</p>` : ''}
    </div>

    ${variantes.length ? `
    <section class="bloque">
      <h2 id="t-var">Elige tu opción</h2>
      <div class="variantes" role="radiogroup" aria-labelledby="t-var">
        ${variantes.map((v, i) => `
        <button type="button" class="variante" role="radio" data-variante="${i}" aria-checked="${i === elegida}">
          <span class="v-nombre">${esc(v.nombre)}</span>
          ${tienePrecio(v.precio) ? `<span class="v-precio">${esc(peso(v.precio))}</span>` : ''}
        </button>`).join('')}
      </div>
      <p class="nota-variante" id="nota-variante" aria-live="polite"></p>
    </section>` : ''}

    ${p.descripcion ? `<p class="descripcion">${esc(p.descripcion)}</p>` : ''}

    ${p.specs?.length ? `
    <section class="bloque">
      <h2>Características</h2>
      <ul class="specs">
        ${p.specs.map((s) => `
        <li>
          <span class="spec-ico">${ICONOS[s.icono] || ICONOS.estrella}</span>
          <span><span class="spec-titulo">${esc(s.titulo)}</span><span class="spec-valor">${esc(s.valor)}</span></span>
        </li>`).join('')}
      </ul>
    </section>` : ''}
  </main>

  <div class="compra">
    <div class="compra-int">
      <p class="compra-precio" id="compra-precio" aria-live="polite"></p>
      <a class="wa-btn" id="wa-ficha" target="_blank" rel="noopener noreferrer">${WA_ICONO}<span>Cotizar por WhatsApp</span></a>
    </div>
  </div>`;

  // Precio, nota y mensaje de WhatsApp según la variante elegida
  const actualizarCompra = (i) => {
    const v = variantes[i];
    const precio = v && tienePrecio(v.precio) ? v.precio : p.precio;
    document.querySelector('#compra-precio').innerHTML = tienePrecio(precio)
      ? `${esc(peso(precio))}${v ? `<span>${esc(v.nombre)}</span>` : ''}`
      : '<span>Precio a consultar</span>';
    document.querySelector('#wa-ficha').href = waLink(msgProducto(nombreConVariante(p, v)));
    const nota = document.querySelector('#nota-variante');
    if (nota) { nota.textContent = v?.nota || ''; nota.hidden = !v?.nota; }
  };
  actualizarCompra(elegida);

  document.querySelectorAll('[data-variante]').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.variante);
      estado.variante[p.id] = i;
      document.querySelectorAll('[data-variante]').forEach((x) => x.setAttribute('aria-checked', x === b));
      actualizarCompra(i);
    })
  );

  // Galería: deslizar para ver las fotos; los puntos indican cuál se está viendo
  const galeria = document.querySelector('#galeria');
  const puntos = document.querySelectorAll('.punto');
  galeria.addEventListener('scroll', () => {
    const i = Math.round(galeria.scrollLeft / galeria.clientWidth);
    puntos.forEach((pt, j) => pt.setAttribute('aria-current', j === i));
  }, { passive: true });
  puntos.forEach((pt) =>
    pt.addEventListener('click', () => galeria.scrollTo({ left: Number(pt.dataset.foto) * galeria.clientWidth, behavior: 'smooth' }))
  );

  const btnFav = document.querySelector('.fila-sup .fav');
  btnFav.addEventListener('click', () => {
    alternarFav(p.id);
    const f = estado.favs.has(p.id);
    btnFav.setAttribute('aria-pressed', f);
    btnFav.setAttribute('aria-label', f ? 'Quitar de favoritos' : 'Guardar en favoritos');
  });
}

// ---------- rutas ----------
function ruta() {
  const m = location.hash.match(/^#\/producto\/(.+)$/);
  document.body.classList.toggle('modo-lista', !m);
  if (m) { vistaDetalle(decodeURIComponent(m[1])); window.scrollTo(0, 0); }
  else vistaLista();
}
window.addEventListener('hashchange', ruta);

// ---------- arranque ----------
app.innerHTML = '<p class="cargando" role="status">Cargando catálogo…</p>';
cargarProductos()
  .then(({ items, guardado }) => {
    estado.productos = items;
    estado.guardado = guardado;
    ruta();
  })
  .catch((err) => {
    console.error(err);
    app.innerHTML = '<p class="vacio" role="alert">No pudimos cargar el catálogo. Revisa tu conexión y vuelve a abrir la app.</p>';
  });
