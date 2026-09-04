/**
 * Campo de formulario controlado.
 *
 * El valor vive en el estado del componente padre y llega por props; el campo
 * solo notifica los cambios con `onChange`. Ese es el patron de componente
 * controlado de React: una sola fuente de verdad para el dato.
 */
export default function CampoTexto({
  etiqueta,
  nombre,
  valor,
  onChange,
  tipo = 'text',
  marcador = '',
  requerido = false,
  error = null,
  autoFocus = false,
}) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">
        {etiqueta}
        {requerido && <span className="campo__obligatorio"> *</span>}
      </span>
      <input
        className={`campo__entrada ${error ? 'campo__entrada--error' : ''}`}
        type={tipo}
        name={nombre}
        value={valor}
        placeholder={marcador}
        autoFocus={autoFocus}
        onChange={(evento) => onChange(nombre, evento.target.value)}
      />
      {error && <span className="campo__error">{error}</span>}
    </label>
  );
}
