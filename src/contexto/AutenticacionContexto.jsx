/**
 * Contexto de autenticacion.
 *
 * Guarda el usuario de la sesion y expone las operaciones de entrada y salida.
 * Se usa contexto en lugar de pasar el usuario por props porque casi todos los
 * componentes lo necesitan (la barra lateral para filtrar modulos, el punto de
 * venta para saber el rol, el encabezado para mostrar el nombre) y encadenar
 * props por cada nivel del arbol seria fragil.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { almacenSesion } from '../api/clienteHttp';
import { autenticacionServicio } from '../api/servicios';

/** Modulos que puede ver cada rol. Refleja la matriz de accesos del backend. */
const MODULOS_POR_ROL = {
  administrador: ['dashboard', 'inventario', 'pos', 'clientes'],
  vendedor: ['dashboard', 'pos', 'clientes'],
  bodeguero: ['dashboard', 'inventario'],
};

const AutenticacionContexto = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(() => almacenSesion.obtenerUsuario());

  const iniciarSesion = useCallback(async (nombreUsuario, password) => {
    const respuesta = await autenticacionServicio.iniciarSesion(nombreUsuario, password);
    almacenSesion.guardar(respuesta.token, respuesta.usuario);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    almacenSesion.limpiar();
    setUsuario(null);
  }, []);

  const puedeVer = useCallback(
    (modulo) => {
      if (!usuario) return false;
      return (MODULOS_POR_ROL[usuario.rol] ?? []).includes(modulo);
    },
    [usuario],
  );

  // Se memoriza el valor para no re-renderizar todo el arbol en cada render.
  const valor = useMemo(
    () => ({ usuario, autenticado: Boolean(usuario), iniciarSesion, cerrarSesion, puedeVer }),
    [usuario, iniciarSesion, cerrarSesion, puedeVer],
  );

  return <AutenticacionContexto.Provider value={valor}>{children}</AutenticacionContexto.Provider>;
}

export function useAutenticacion() {
  const contexto = useContext(AutenticacionContexto);
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de <ProveedorAutenticacion>');
  }
  return contexto;
}
