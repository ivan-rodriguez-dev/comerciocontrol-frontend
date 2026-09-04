/**
 * Tabla generica de datos.
 *
 * Recibe la definicion de columnas por props; cada columna puede traer una
 * funcion `render` para decidir como se dibuja la celda. Asi la misma tabla
 * sirve para productos, clientes y ventas sin duplicar el marcado.
 */
export default function Tabla({ columnas, filas, claveFila = 'id', mensajeVacio = 'Sin registros' }) {
  if (!filas?.length) {
    return <p className="tabla__vacia">{mensajeVacio}</p>;
  }

  return (
    <div className="tabla__contenedor">
      <table className="tabla">
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna.clave} style={columna.alinear ? { textAlign: columna.alinear } : undefined}>
                {columna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila[claveFila]}>
              {columnas.map((columna) => (
                <td
                  key={columna.clave}
                  style={columna.alinear ? { textAlign: columna.alinear } : undefined}
                >
                  {columna.render ? columna.render(fila) : fila[columna.clave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
