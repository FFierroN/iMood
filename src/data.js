// Capa de datos: lee public/productos.json y guarda una copia para cuando no haya conexión.
// Si más adelante usamos Supabase, solo cambia este archivo: el resto de la app no sabe de dónde vienen los datos.

const CACHE_KEY = 'imood:catalogo';

export async function cargarProductos() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}productos.json`);
    if (!res.ok) throw new Error('No se pudo cargar el catálogo');
    const items = (await res.json()).filter((p) => p.visible !== false);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(items)); } catch {}
    return { items, guardado: false };
  } catch (err) {
    // Sin conexión: usa la última copia guardada
    try {
      const copia = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (copia?.length) return { items: copia, guardado: true };
    } catch {}
    throw err;
  }
}
