/**
 * Mensaje de retroalimentacion al usuario.
 *
 * Unifica como se muestran los errores de la API y las confirmaciones de exito.
 * Si no hay mensaje el componente no dibuja nada, para que quien lo use no tenga
 * que envolverlo en un condicional.
 */
export default function Alerta({ tipo = 'error', mensaje, detalles }) {
  if (!mensaje) return null;

  return (
    <div className={`alerta alerta--${tipo}`} role="alert">
      <p className="alerta__mensaje">{mensaje}</p>
      {detalles && (
        <ul className="alerta__detalles">
          {Object.entries(detalles).map(([campo, texto]) => (
            <li key={campo}>
              <strong>{campo}:</strong> {texto}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
