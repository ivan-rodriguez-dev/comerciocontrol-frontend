import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alerta from '../componentes/Alerta';
import Boton from '../componentes/Boton';
import CampoTexto from '../componentes/CampoTexto';
import { useAutenticacion } from '../contexto/AutenticacionContexto';

/**
 * Pantalla de inicio de sesion.
 *
 * Ejemplo de formulario controlado: `credenciales` es el estado del componente
 * y el evento `onSubmit` dispara la llamada a la API. Mientras la peticion esta
 * en curso el boton se bloquea para evitar envios duplicados.
 */
export default function Login() {
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { iniciarSesion } = useAutenticacion();
  const navegar = useNavigate();

  const cambiarCampo = (nombre, valor) =>
    setCredenciales((previo) => ({ ...previo, [nombre]: valor }));

  const enviar = async (evento) => {
    evento.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await iniciarSesion(credenciales.usuario, credenciales.password);
      navegar('/dashboard', { replace: true });
    } catch (fallo) {
      setError(fallo);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login">
      <form className="login__tarjeta" onSubmit={enviar}>
        <div className="login__marca">
          <span className="login__logo">CC</span>
          <h1>ComercioControl</h1>
          <p>Punto de venta e inventario</p>
        </div>

        <Alerta mensaje={error?.message} detalles={error?.detalles} />

        <CampoTexto
          etiqueta="Usuario"
          nombre="usuario"
          valor={credenciales.usuario}
          onChange={cambiarCampo}
          marcador="ivan.admin"
          requerido
          autoFocus
        />

        <CampoTexto
          etiqueta="Contrasena"
          nombre="password"
          tipo="password"
          valor={credenciales.password}
          onChange={cambiarCampo}
          marcador="••••••••"
          requerido
        />

        <Boton tipo="submit" cargando={enviando} ancho="100%">
          Iniciar sesion
        </Boton>

        <p className="login__ayuda">
          La API debe estar en ejecucion en <code>http://localhost:8080</code>
        </p>
      </form>
    </div>
  );
}
