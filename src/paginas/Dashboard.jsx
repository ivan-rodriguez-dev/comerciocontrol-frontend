import { useEffect, useState } from 'react';
import Alerta from '../componentes/Alerta';
import Tabla from '../componentes/Tabla';
import TarjetaIndicador from '../componentes/TarjetaIndicador';
import { productoServicio, reporteServicio } from '../api/servicios';
import { fechaDeHoy, formatearMoneda } from '../utilidades/formato';

/**
 * Tablero de indicadores.
 *
 * Ilustra el ciclo de vida basico de un componente: al montarse (`useEffect` con
 * arreglo de dependencias vacio) pide los datos a la API, muestra un estado de
 * carga mientras llegan y luego re-renderiza con la informacion recibida.
 * Las tres consultas se lanzan en paralelo con `Promise.all` para no encadenar
 * esperas innecesarias.
 */
export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true; // Evita actualizar el estado si el componente se desmonta.

    async function cargar() {
      try {
        const hoy = fechaDeHoy();
        const [inventario, ventas, criticos] = await Promise.all([
          reporteServicio.inventario(),
          reporteServicio.ventas({ desde: hoy, hasta: hoy }),
          productoServicio.stockCritico(),
        ]);
        if (vigente) setDatos({ inventario, ventas, criticos });
      } catch (fallo) {
        if (vigente) setError(fallo);
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, []);

  if (cargando) return <p className="estado-carga">Cargando indicadores…</p>;
  if (error) return <Alerta mensaje={error.message} />;

  const { inventario, ventas, criticos } = datos;

  return (
    <section>
      <header className="pagina__titulo">
        <h2>Tablero</h2>
        <p>Resumen del negocio al {new Date().toLocaleDateString('es-CO')}</p>
      </header>

      <div className="rejilla-indicadores">
        <TarjetaIndicador etiqueta="Ventas de hoy" valor={ventas.total} formato="moneda" />
        <TarjetaIndicador
          etiqueta="Transacciones"
          valor={ventas.cantidadVentas}
          detalle={`Ticket promedio ${formatearMoneda(ventas.ticketPromedio)}`}
        />
        <TarjetaIndicador etiqueta="Productos" valor={inventario.totalProductos} />
        <TarjetaIndicador etiqueta="Unidades en stock" valor={inventario.unidadesTotales} />
        <TarjetaIndicador
          etiqueta="Valor del inventario"
          valor={inventario.valorVenta}
          formato="moneda"
          detalle={`Costo ${formatearMoneda(inventario.valorCosto)}`}
        />
        <TarjetaIndicador
          etiqueta="Stock critico"
          valor={inventario.productosCriticos}
          acento={inventario.productosCriticos > 0 ? '#EF4444' : '#16A34A'}
          detalle="Productos por reponer"
        />
      </div>

      <section className="panel">
        <h3>Productos que requieren reposicion</h3>
        <Tabla
          columnas={[
            { clave: 'codigo', titulo: 'Codigo' },
            { clave: 'nombre', titulo: 'Producto' },
            { clave: 'categoria', titulo: 'Categoria' },
            { clave: 'stockActual', titulo: 'Stock', alinear: 'right' },
            { clave: 'stockMinimo', titulo: 'Minimo', alinear: 'right' },
            {
              clave: 'estado',
              titulo: 'Estado',
              render: (fila) => (
                <span className={`insignia insignia--${fila.estado?.toLowerCase()}`}>
                  {fila.estado}
                </span>
              ),
            },
          ]}
          filas={criticos}
          mensajeVacio="Ningun producto esta por debajo del stock minimo."
        />
      </section>
    </section>
  );
}
