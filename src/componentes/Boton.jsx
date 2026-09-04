/**
 * Boton reutilizable.
 *
 * Recibe por props la variante visual y el estado de carga, de modo que todas
 * las acciones de la aplicacion se ven y se comportan igual sin repetir estilos.
 */
export default function Boton({
  children,
  variante = 'primario',
  tipo = 'button',
  cargando = false,
  deshabilitado = false,
  onClick,
  ancho,
}) {
  const inactivo = deshabilitado || cargando;

  return (
    <button
      type={tipo}
      className={`boton boton--${variante}`}
      style={ancho ? { width: ancho } : undefined}
      disabled={inactivo}
      onClick={onClick}
    >
      {cargando ? 'Procesando…' : children}
    </button>
  );
}
