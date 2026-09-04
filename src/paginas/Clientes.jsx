import { useCallback, useEffect, useState } from 'react';
import Alerta from '../componentes/Alerta';
import Boton from '../componentes/Boton';
import CampoTexto from '../componentes/CampoTexto';
import Tabla from '../componentes/Tabla';
import { clienteServicio } from '../api/servicios';
import { formatearFecha } from '../utilidades/formato';

const CLIENTE_VACIO = { nombre: '', cedula: '', telefono: '', email: '', direccion: '' };

/**
 * Modulo de clientes.
 *
 * Reutiliza los mismos componentes de inventario (CampoTexto, Tabla, Alerta,
 * Boton) sin escribir marcado nuevo: es la ventaja practica del desarrollo
 * basado en componentes.
 */
export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState(CLIENTE_VACIO);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const consultar = useCallback(async (texto) => {
    try {
      setClientes(await clienteServicio.listar({ q: texto }));
      setError(null);
    } catch (fallo) {
      setError(fallo);
    }
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => consultar(busqueda), 350);
    return () => clearTimeout(temporizador);
  }, [busqueda, consultar]);

  const cambiarCampo = (nombre, valor) =>
    setFormulario((previo) => ({ ...previo, [nombre]: valor }));

  const guardar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(null);

    try {
      const creado = await clienteServicio.crear(formulario);
      setExito(`Cliente "${creado.nombre}" registrado.`);
      setFormulario(CLIENTE_VACIO);
      setFormularioVisible(false);
      consultar(busqueda);
    } catch (fallo) {
      setError(fallo);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section>
      <header className="pagina__titulo">
        <div>
          <h2>Clientes</h2>
          <p>{clientes.length} clientes registrados</p>
        </div>
        <Boton
          variante={formularioVisible ? 'secundario' : 'primario'}
          onClick={() => setFormularioVisible((visible) => !visible)}
        >
          {formularioVisible ? 'Cancelar' : 'Nuevo cliente'}
        </Boton>
      </header>

      <Alerta mensaje={error?.message} detalles={error?.detalles} />
      <Alerta tipo="exito" mensaje={exito} />

      {formularioVisible && (
        <form className="panel formulario-rejilla" onSubmit={guardar}>
          <CampoTexto etiqueta="Nombre" nombre="nombre" valor={formulario.nombre} onChange={cambiarCampo} requerido />
          <CampoTexto etiqueta="Cedula" nombre="cedula" valor={formulario.cedula} onChange={cambiarCampo} />
          <CampoTexto etiqueta="Telefono" nombre="telefono" valor={formulario.telefono} onChange={cambiarCampo} />
          <CampoTexto etiqueta="Correo" nombre="email" tipo="email" valor={formulario.email} onChange={cambiarCampo} />
          <CampoTexto etiqueta="Direccion" nombre="direccion" valor={formulario.direccion} onChange={cambiarCampo} />
          <div className="formulario-rejilla__acciones">
            <Boton tipo="submit" cargando={guardando}>Guardar cliente</Boton>
          </div>
        </form>
      )}

      <div className="panel">
        <CampoTexto
          etiqueta="Buscar"
          nombre="busqueda"
          valor={busqueda}
          onChange={(_, valor) => setBusqueda(valor)}
          marcador="Nombre o cedula"
        />
        <Tabla
          columnas={[
            { clave: 'nombre', titulo: 'Nombre' },
            { clave: 'cedula', titulo: 'Cedula' },
            { clave: 'telefono', titulo: 'Telefono' },
            { clave: 'email', titulo: 'Correo' },
            { clave: 'fechaRegistro', titulo: 'Registro', render: (f) => formatearFecha(f.fechaRegistro) },
          ]}
          filas={clientes}
          mensajeVacio="Ningun cliente coincide con la busqueda."
        />
      </div>
    </section>
  );
}
