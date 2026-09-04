import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './diseno/Layout';
import Clientes from './paginas/Clientes';
import Dashboard from './paginas/Dashboard';
import Inventario from './paginas/Inventario';
import Login from './paginas/Login';
import PuntoDeVenta from './paginas/PuntoDeVenta';
import { ProveedorAutenticacion, useAutenticacion } from './contexto/AutenticacionContexto';

/**
 * Estructura de navegacion de la aplicacion.
 *
 * `RutaProtegida` envuelve las pantallas que exigen sesion: si no hay usuario
 * redirige al login, y si el rol no tiene permiso sobre el modulo lo devuelve al
 * tablero. Es el mismo criterio que aplica el backend, replicado en la interfaz
 * para no ofrecer opciones que la API va a rechazar.
 */
function RutaProtegida({ modulo, children }) {
  const { autenticado, puedeVer } = useAutenticacion();

  if (!autenticado) return <Navigate to="/login" replace />;
  if (modulo && !puedeVer(modulo)) return <Navigate to="/dashboard" replace />;

  return children;
}

function RutaPublica({ children }) {
  const { autenticado } = useAutenticacion();
  return autenticado ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <ProveedorAutenticacion>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />

          <Route
            element={
              <RutaProtegida>
                <Layout />
              </RutaProtegida>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/inventario"
              element={<RutaProtegida modulo="inventario"><Inventario /></RutaProtegida>}
            />
            <Route
              path="/punto-de-venta"
              element={<RutaProtegida modulo="pos"><PuntoDeVenta /></RutaProtegida>}
            />
            <Route
              path="/clientes"
              element={<RutaProtegida modulo="clientes"><Clientes /></RutaProtegida>}
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  );
}
