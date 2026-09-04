import { useCallback, useEffect, useState } from 'react';
import Alerta from '../componentes/Alerta';
import Boton from '../componentes/Boton';
import CampoTexto from '../componentes/CampoTexto';
import Tabla from '../componentes/Tabla';
import { productoServicio } from '../api/servicios';
import { formatearMoneda } from '../utilidades/formato';

const PRODUCTO_VACIO = {
  codigo: '',
  nombre: '',
  categoria: '',
  precioCosto: '',
  precioVenta: '',
  stockActual: '',
  stockMinimo: '',
};

/**
 * Modulo de inventario: consulta con filtros y alta de productos.
 *
 * Muestra dos interacciones tipicas de React: el buscador, que reconsulta la API
 * cuando cambia el texto, y el formulario de creacion, que al recibir un error
 * de validacion del backend lo presenta campo por campo sin perder lo escrito.
 */
export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({ q: '', categoria: '' });
  const [formulario, setFormulario] = useState(PRODUCTO_VACIO);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const consultar = useCallback(async (criterios) => {
    setCargando(true);
    try {
      setProductos(await productoServicio.listar(criterios));
      setError(null);
    } catch (fallo) {
      setError(fallo);
    } finally {
      setCargando(false);
    }
  }, []);

  // Primera carga: catalogo y lista de categorias para el filtro.
  useEffect(() => {
    consultar(filtros);
    productoServicio.categorias().then(setCategorias).catch(() => setCategorias([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultar]);

  // El buscador espera 350 ms tras la ultima tecla para no consultar en cada letra.
  useEffect(() => {
    const temporizador = setTimeout(() => consultar(filtros), 350);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const cambiarFiltro = (nombre, valor) =>
    setFiltros((previo) => ({ ...previo, [nombre]: valor }));

  const cambiarCampo = (nombre, valor) =>
    setFormulario((previo) => ({ ...previo, [nombre]: valor }));

  const guardar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(null);

    try {
      const creado = await productoServicio.crear({
        codigo: formulario.codigo,
        nombre: formulario.nombre,
        categoria: formulario.categoria,
        precioCosto: Number(formulario.precioCosto),
        precioVenta: Number(formulario.precioVenta),
        stockActual: Number(formulario.stockActual),
        stockMinimo: Number(formulario.stockMinimo),
      });
      setExito(`Producto "${creado.nombre}" registrado con el codigo ${creado.codigo}.`);
      setFormulario(PRODUCTO_VACIO);
      setFormularioVisible(false);
      consultar(filtros);
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
          <h2>Inventario</h2>
          <p>{productos.length} productos en el catalogo</p>
        </div>
        <Boton
          variante={formularioVisible ? 'secundario' : 'primario'}
          onClick={() => setFormularioVisible((visible) => !visible)}
        >
          {formularioVisible ? 'Cancelar' : 'Nuevo producto'}
        </Boton>
      </header>

      <Alerta mensaje={error?.message} detalles={error?.detalles} />
      <Alerta tipo="exito" mensaje={exito} />

      {formularioVisible && (
        <form className="panel formulario-rejilla" onSubmit={guardar}>
          <CampoTexto etiqueta="Codigo" nombre="codigo" valor={formulario.codigo} onChange={cambiarCampo} requerido />
          <CampoTexto etiqueta="Nombre" nombre="nombre" valor={formulario.nombre} onChange={cambiarCampo} requerido />
          <CampoTexto etiqueta="Categoria" nombre="categoria" valor={formulario.categoria} onChange={cambiarCampo} />
          <CampoTexto etiqueta="Precio costo" nombre="precioCosto" tipo="number" valor={formulario.precioCosto} onChange={cambiarCampo} requerido />
          <CampoTexto etiqueta="Precio venta" nombre="precioVenta" tipo="number" valor={formulario.precioVenta} onChange={cambiarCampo} requerido />
          <CampoTexto etiqueta="Stock actual" nombre="stockActual" tipo="number" valor={formulario.stockActual} onChange={cambiarCampo} requerido />
          <CampoTexto etiqueta="Stock minimo" nombre="stockMinimo" tipo="number" valor={formulario.stockMinimo} onChange={cambiarCampo} requerido />
          <div className="formulario-rejilla__acciones">
            <Boton tipo="submit" cargando={guardando}>Guardar producto</Boton>
          </div>
        </form>
      )}

      <div className="panel">
        <div className="filtros">
          <CampoTexto
            etiqueta="Buscar"
            nombre="q"
            valor={filtros.q}
            onChange={cambiarFiltro}
            marcador="Codigo o nombre del producto"
          />
          <label className="campo">
            <span className="campo__etiqueta">Categoria</span>
            <select
              className="campo__entrada"
              value={filtros.categoria}
              onChange={(evento) => cambiarFiltro('categoria', evento.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </label>
        </div>

        {cargando ? (
          <p className="estado-carga">Consultando productos…</p>
        ) : (
          <Tabla
            columnas={[
              { clave: 'codigo', titulo: 'Codigo' },
              { clave: 'nombre', titulo: 'Producto' },
              { clave: 'categoria', titulo: 'Categoria' },
              { clave: 'precioVenta', titulo: 'Precio', alinear: 'right', render: (f) => formatearMoneda(f.precioVenta) },
              { clave: 'stockActual', titulo: 'Stock', alinear: 'right' },
              {
                clave: 'estado',
                titulo: 'Estado',
                render: (fila) => (
                  <span className={`insignia insignia--${fila.estado?.toLowerCase()}`}>{fila.estado}</span>
                ),
              },
            ]}
            filas={productos}
            mensajeVacio="Ningun producto coincide con la busqueda."
          />
        )}
      </div>
    </section>
  );
}
