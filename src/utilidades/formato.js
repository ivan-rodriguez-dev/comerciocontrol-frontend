/**
 * Funciones de formato para presentar datos al usuario.
 *
 * Se centralizan aqui para que los importes se vean igual en todas las
 * pantallas y para no repetir la configuracion regional en cada componente.
 */

const MONEDA = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const NUMERO = new Intl.NumberFormat('es-CO');

export const formatearMoneda = (valor) => MONEDA.format(valor ?? 0);

export const formatearNumero = (valor) => NUMERO.format(valor ?? 0);

/** Convierte la fecha `YYYY-MM-DD HH:mm:ss` que envia la API a formato legible. */
export function formatearFecha(texto) {
  if (!texto) return '—';
  const fecha = new Date(texto.replace(' ', 'T'));
  if (Number.isNaN(fecha.getTime())) return texto;
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Fecha de hoy en formato `YYYY-MM-DD`, que es el que esperan los reportes. */
export const fechaDeHoy = () => new Date().toISOString().slice(0, 10);
