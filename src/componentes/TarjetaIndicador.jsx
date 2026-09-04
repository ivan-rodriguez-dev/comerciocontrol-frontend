import { formatearMoneda, formatearNumero } from '../utilidades/formato';

/**
 * Tarjeta de indicador (KPI) del tablero.
 *
 * Es el ejemplo mas claro de reutilizacion en el proyecto: el mismo componente
 * dibuja las seis metricas del dashboard cambiando solo sus props.
 */
export default function TarjetaIndicador({ etiqueta, valor, formato = 'numero', detalle, acento }) {
  const valorFormateado =
    formato === 'moneda' ? formatearMoneda(valor) : formatearNumero(valor);

  return (
    <article className="tarjeta-indicador">
      <span className="tarjeta-indicador__etiqueta">{etiqueta}</span>
      <strong className="tarjeta-indicador__valor" style={acento ? { color: acento } : undefined}>
        {valorFormateado}
      </strong>
      {detalle && <span className="tarjeta-indicador__detalle">{detalle}</span>}
    </article>
  );
}
