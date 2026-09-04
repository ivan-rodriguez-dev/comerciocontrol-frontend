import { useEffect, useMemo, useState } from 'react';
import Alerta from '../componentes/Alerta';
import Boton from '../componentes/Boton';
import CampoTexto from '../componentes/CampoTexto';
import { cajaServicio, productoServicio, ventaServicio } from '../api/servicios';
import { formatearMoneda } from '../utilidades/formato';

const PORCENTAJE_IVA = 0.19; // Solo para la vista previa; el importe oficial lo calcula la API.

/**
 * Punto de venta.
 *
 * Es la pantalla con mas interaccion del frontend: busca productos, arma el
 * carrito en el estado del componente, calcula un estimado en vivo y envia la
 * venta a la API. El total que se guarda es siempre el que devuelve el backend:
 * el calculo local es solo una vista previa para el cajero, porque las reglas de
 * negocio (IVA, descuento, validacion de stock) viven en el servidor.
 */
export default function PuntoDeVenta() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [venta, setVenta] = useState({ lineas: [], aviso: null });
  const [descuento, setDescuento] = useState('0');
  const [estadoCaja, setEstadoCaja] = useState(null);
  const [montoApertura, setMontoApertura] = useState('100000');
  const [abriendoCaja, setAbriendoCaja] = useState(false);
  const [error, setError] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    productoServicio.listar().then(setProductos).catch(setError);
    cajaServicio.estado().then(setEstadoCaja).catch(setError);
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos.slice(0, 8);
    return productos
      .filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(texto) ||
          producto.codigo.toLowerCase().includes(texto),
      )
      .slice(0, 8);
  }, [productos, busqueda]);

  // El estimado se recalcula solo cuando cambian el carrito o el descuento.
  const estimado = useMemo(() => {
    const subtotal = venta.lineas.reduce(
      (suma, linea) => suma + linea.precioVenta * linea.cantidad,
      0,
    );
    const descuentoValor = Math.min(Number(descuento) || 0, subtotal);
    const base = subtotal - descuentoValor;
    const iva = Math.round(base * PORCENTAJE_IVA);
    return { subtotal, descuentoValor, iva, total: base + iva };
  }, [venta.lineas, descuento]);

  /**
   * Agrega una unidad del producto al carrito.
   *
   * Toda la decision ocurre dentro del actualizador de estado y no en el cuerpo
   * del manejador. Si se leyera `carrito` desde el render actual, dos clics
   * seguidos sobre el mismo producto verian ambos el carrito vacio y crearian
   * dos lineas repetidas en lugar de sumar la cantidad; `previo` siempre trae el
   * estado mas reciente. El aviso de stock viaja en el mismo objeto de estado
   * para que el actualizador siga siendo una funcion pura.
   */
  const agregar = (producto) => {
    setVenta((previo) => {
      const enCarrito = previo.lineas.find((linea) => linea.id === producto.id);
      const cantidadEnCarrito = enCarrito?.cantidad ?? 0;

      if (producto.stockActual <= cantidadEnCarrito) {
        return { ...previo, aviso: `Sin stock disponible de "${producto.nombre}".` };
      }

      const lineas = enCarrito
        ? previo.lineas.map((linea) =>
            linea.id === producto.id ? { ...linea, cantidad: linea.cantidad + 1 } : linea,
          )
        : [...previo.lineas, { ...producto, cantidad: 1 }];

      return { lineas, aviso: null };
    });
  };

  const quitar = (id) =>
    setVenta((previo) => ({
      lineas: previo.lineas.filter((linea) => linea.id !== id),
      aviso: null,
    }));

  /** Abre la jornada de caja para habilitar el registro de ventas. */
  const abrirCaja = async (evento) => {
    evento.preventDefault();
    setAbriendoCaja(true);
    setError(null);

    try {
      await cajaServicio.abrir({ apertura: Number(montoApertura) || 0 });
      setEstadoCaja(await cajaServicio.estado());
    } catch (fallo) {
      setError(fallo);
    } finally {
      setAbriendoCaja(false);
    }
  };

  const cobrar = async () => {
    setRegistrando(true);
    setError(null);
    setComprobante(null);

    try {
      const registrada = await ventaServicio.registrar({
        descuento: Number(descuento) || 0,
        items: venta.lineas.map((linea) => ({ productoId: linea.id, cantidad: linea.cantidad })),
      });
      setComprobante(registrada);
      setVenta({ lineas: [], aviso: null });
      setDescuento('0');
      // El stock cambio en el servidor: se recarga el catalogo.
      setProductos(await productoServicio.listar());
    } catch (fallo) {
      setError(fallo);
    } finally {
      setRegistrando(false);
    }
  };

  const hayCajaAbierta = estadoCaja?.hayCajaAbierta === true;

  return (
    <section>
      <header className="pagina__titulo">
        <div>
          <h2>Punto de venta</h2>
          <p>
            {hayCajaAbierta
              ? `Caja abierta por ${estadoCaja.caja?.usuarioNombre ?? 'el turno actual'}`
              : 'No hay una caja abierta'}
          </p>
        </div>
      </header>

      {!hayCajaAbierta && estadoCaja && (
        <>
          <Alerta
            tipo="aviso"
            mensaje="Debe abrir la caja antes de registrar ventas. El servidor rechaza cualquier venta sin caja abierta."
          />
          <form className="panel apertura-caja" onSubmit={abrirCaja}>
            <CampoTexto
              etiqueta="Base en efectivo"
              nombre="apertura"
              tipo="number"
              valor={montoApertura}
              onChange={(_, valor) => setMontoApertura(valor)}
            />
            <Boton tipo="submit" cargando={abriendoCaja}>Abrir caja</Boton>
          </form>
        </>
      )}

      <Alerta mensaje={error?.message} detalles={error?.detalles} />
      <Alerta tipo="aviso" mensaje={venta.aviso} />

      {comprobante && (
        <Alerta
          tipo="exito"
          mensaje={`Venta #${comprobante.id} registrada por ${formatearMoneda(comprobante.total)} (IVA ${formatearMoneda(comprobante.iva)}). El stock se actualizo en el servidor.`}
        />
      )}

      <div className="pos">
        <div className="panel pos__catalogo">
          <CampoTexto
            etiqueta="Buscar producto"
            nombre="busqueda"
            valor={busqueda}
            onChange={(_, valor) => setBusqueda(valor)}
            marcador="Nombre o codigo"
          />

          <div className="pos__rejilla">
            {productosFiltrados.map((producto) => (
              <button
                key={producto.id}
                type="button"
                className="pos__producto"
                onClick={() => agregar(producto)}
                disabled={producto.stockActual <= 0}
              >
                <strong>{producto.nombre}</strong>
                <span className="pos__producto-precio">{formatearMoneda(producto.precioVenta)}</span>
                <small>Stock: {producto.stockActual}</small>
              </button>
            ))}
            {!productosFiltrados.length && <p className="tabla__vacia">Sin coincidencias.</p>}
          </div>
        </div>

        <aside className="panel pos__carrito">
          <h3>Carrito</h3>

          {venta.lineas.length === 0 ? (
            <p className="tabla__vacia">Agregue productos para iniciar la venta.</p>
          ) : (
            <ul className="pos__lineas">
              {venta.lineas.map((linea) => (
                <li key={linea.id}>
                  <div>
                    <strong>{linea.nombre}</strong>
                    <small>
                      {linea.cantidad} × {formatearMoneda(linea.precioVenta)}
                    </small>
                  </div>
                  <div className="pos__linea-derecha">
                    <span>{formatearMoneda(linea.precioVenta * linea.cantidad)}</span>
                    <button type="button" className="boton boton--texto" onClick={() => quitar(linea.id)}>
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <CampoTexto
            etiqueta="Descuento"
            nombre="descuento"
            tipo="number"
            valor={descuento}
            onChange={(_, valor) => setDescuento(valor)}
          />

          <dl className="pos__totales">
            <div><dt>Subtotal</dt><dd>{formatearMoneda(estimado.subtotal)}</dd></div>
            <div><dt>Descuento</dt><dd>−{formatearMoneda(estimado.descuentoValor)}</dd></div>
            <div><dt>IVA (19 %)</dt><dd>{formatearMoneda(estimado.iva)}</dd></div>
            <div className="pos__total"><dt>Total</dt><dd>{formatearMoneda(estimado.total)}</dd></div>
          </dl>

          <Boton
            onClick={cobrar}
            cargando={registrando}
            deshabilitado={!venta.lineas.length || !hayCajaAbierta}
            ancho="100%"
          >
            Cobrar
          </Boton>
          <p className="pos__nota">Los importes definitivos los calcula la API.</p>
        </aside>
      </div>
    </section>
  );
}
