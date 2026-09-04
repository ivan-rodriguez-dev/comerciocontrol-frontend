/**
 * Cliente HTTP unico del frontend.
 *
 * Centraliza en un solo punto la URL base de la API, el envio del token JWT y
 * la traduccion de los errores que devuelve el backend a un objeto de error
 * uniforme. Ninguna pantalla llama a `fetch` directamente: todas pasan por aqui,
 * de modo que un cambio en el contrato de errores se corrige en un solo archivo.
 */

const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const CLAVE_TOKEN = 'comerciocontrol.token';
const CLAVE_USUARIO = 'comerciocontrol.usuario';

/** Error de aplicacion con el codigo HTTP y el mensaje que envio la API. */
export class ErrorApi extends Error {
  constructor(mensaje, estado, detalles) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.detalles = detalles ?? null;
  }
}

export const almacenSesion = {
  obtenerToken: () => localStorage.getItem(CLAVE_TOKEN),

  obtenerUsuario: () => {
    const crudo = localStorage.getItem(CLAVE_USUARIO);
    return crudo ? JSON.parse(crudo) : null;
  },

  guardar: (token, usuario) => {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  },

  limpiar: () => {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
  },
};

/**
 * Construye el mensaje de error a partir de la respuesta del backend.
 * La API responde con `{ mensaje, errores }`; si falla el parseo se usa el
 * texto por defecto del codigo HTTP.
 */
async function construirError(respuesta) {
  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    // Respuesta sin cuerpo JSON (por ejemplo un 500 del contenedor).
  }

  const mensaje =
    cuerpo?.mensaje ??
    cuerpo?.message ??
    (respuesta.status === 401
      ? 'La sesion expiro o las credenciales no son validas'
      : `La peticion fallo con codigo ${respuesta.status}`);

  return new ErrorApi(mensaje, respuesta.status, cuerpo?.errores);
}

/**
 * Ejecuta una peticion contra la API.
 *
 * @param {string} ruta      Ruta relativa, por ejemplo `/api/productos`.
 * @param {object} opciones  `metodo`, `cuerpo` y `parametros` de consulta.
 */
export async function peticion(ruta, { metodo = 'GET', cuerpo, parametros } = {}) {
  const url = new URL(ruta, URL_BASE);

  if (parametros) {
    Object.entries(parametros)
      .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
      .forEach(([clave, valor]) => url.searchParams.set(clave, valor));
  }

  const cabeceras = { Accept: 'application/json' };
  const token = almacenSesion.obtenerToken();
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    // El navegador no logro contactar al servidor: la API esta apagada.
    throw new ErrorApi('No se pudo contactar la API. Verifique que este en ejecucion.', 0);
  }

  if (!respuesta.ok) throw await construirError(respuesta);

  return respuesta.status === 204 ? null : respuesta.json();
}
