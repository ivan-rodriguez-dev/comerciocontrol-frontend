import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/AutenticacionContexto';

/**
 * Estructura comun de las pantallas autenticadas: barra lateral de navegacion,
 * encabezado con los datos de la sesion y el area donde React Router monta la
 * pagina activa mediante `<Outlet />`.
 */

const MODULOS = [
  { clave: 'dashboard', ruta: '/dashboard', etiqueta: 'Tablero', icono: '▦' },
  { clave: 'inventario', ruta: '/inventario', etiqueta: 'Inventario', icono: '▤' },
  { clave: 'pos', ruta: '/punto-de-venta', etiqueta: 'Punto de venta', icono: '▣' },
  { clave: 'clientes', ruta: '/clientes', etiqueta: 'Clientes', icono: '▨' },
];

export default function Layout() {
  const { usuario, cerrarSesion, puedeVer } = useAutenticacion();
  const navegar = useNavigate();

  // Cada rol ve solo sus modulos: la misma matriz de accesos que aplica la API.
  const modulosVisibles = MODULOS.filter((modulo) => puedeVer(modulo.clave));

  const salir = () => {
    cerrarSesion();
    navegar('/login', { replace: true });
  };

  return (
    <div className="layout">
      <aside className="barra-lateral">
        <div className="barra-lateral__marca">
          <span className="barra-lateral__logo">CC</span>
          <div>
            <strong>ComercioControl</strong>
            <small>Punto de venta</small>
          </div>
        </div>

        <nav className="barra-lateral__nav">
          {modulosVisibles.map((modulo) => (
            <NavLink
              key={modulo.clave}
              to={modulo.ruta}
              className={({ isActive }) =>
                `barra-lateral__enlace ${isActive ? 'barra-lateral__enlace--activo' : ''}`
              }
            >
              <span className="barra-lateral__icono">{modulo.icono}</span>
              {modulo.etiqueta}
            </NavLink>
          ))}
        </nav>

        <footer className="barra-lateral__pie">
          <small>Ficha 3235886 · ADSO</small>
        </footer>
      </aside>

      <div className="contenido">
        <header className="encabezado">
          <div>
            <strong className="encabezado__nombre">{usuario?.nombre}</strong>
            <span className="etiqueta-rol">{usuario?.rol}</span>
          </div>
          <button type="button" className="boton boton--texto" onClick={salir}>
            Cerrar sesion
          </button>
        </header>

        <main className="pagina">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
