/**
 * Servicios de la API agrupados por modulo de negocio.
 *
 * Cada objeto refleja un grupo de endpoints del backend, de modo que los
 * componentes trabajan con nombres del dominio (`productoServicio.listar()`)
 * en lugar de rutas HTTP sueltas.
 */

import { peticion } from './clienteHttp';

export const autenticacionServicio = {
  iniciarSesion: (usuario, password) =>
    peticion('/api/auth/login', { metodo: 'POST', cuerpo: { usuario, password } }),

  perfil: () => peticion('/api/auth/perfil'),
};

export const productoServicio = {
  listar: (filtros = {}) => peticion('/api/productos', { parametros: filtros }),
  consultar: (id) => peticion(`/api/productos/${id}`),
  stockCritico: () => peticion('/api/productos/stock-critico'),
  categorias: () => peticion('/api/productos/categorias'),
  crear: (producto) => peticion('/api/productos', { metodo: 'POST', cuerpo: producto }),
  actualizar: (id, producto) =>
    peticion(`/api/productos/${id}`, { metodo: 'PUT', cuerpo: producto }),
};

export const clienteServicio = {
  listar: (filtros = {}) => peticion('/api/clientes', { parametros: filtros }),
  crear: (cliente) => peticion('/api/clientes', { metodo: 'POST', cuerpo: cliente }),
  actualizar: (id, cliente) =>
    peticion(`/api/clientes/${id}`, { metodo: 'PUT', cuerpo: cliente }),
};

export const ventaServicio = {
  listar: (rango = {}) => peticion('/api/ventas', { parametros: rango }),
  consultar: (id) => peticion(`/api/ventas/${id}`),
  registrar: (venta) => peticion('/api/ventas', { metodo: 'POST', cuerpo: venta }),
};

export const cajaServicio = {
  estado: () => peticion('/api/caja/estado'),
  abrir: (apertura) => peticion('/api/caja/apertura', { metodo: 'POST', cuerpo: apertura }),
};

export const reporteServicio = {
  ventas: (rango = {}) => peticion('/api/reportes/ventas', { parametros: rango }),
  inventario: () => peticion('/api/reportes/inventario'),
  masVendidos: (rango = {}) => peticion('/api/reportes/mas-vendidos', { parametros: rango }),
};
