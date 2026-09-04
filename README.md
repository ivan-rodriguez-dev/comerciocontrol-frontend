# ComercioControl — Frontend (React)

Interfaz web del proyecto formativo **ComercioControl**, construida con **React 19 + Vite**.
Consume la API REST del proyecto ([comerciocontrol-api](https://github.com/ivan-rodriguez-dev/API-PROYECTO-))
y comparte con ella el modelo de datos y las reglas de negocio.

**Evidencia:** GA7-220501096-AA4-EV03_IVO · Iván Manuel Rodríguez David · Ficha 3235886

---

## 1. Qué hace

| Módulo | Pantalla | Endpoints que consume |
|--------|----------|----------------------|
| Autenticación | Inicio de sesión con JWT | `POST /api/auth/login` |
| Tablero | Seis indicadores del negocio y productos por reponer | `GET /api/reportes/inventario`, `/reportes/ventas`, `/productos/stock-critico` |
| Inventario | Catálogo con buscador, filtro por categoría y alta de productos | `GET/POST /api/productos`, `GET /api/productos/categorias` |
| Punto de venta | Carrito, descuento, IVA, apertura de caja y cobro | `GET /api/caja/estado`, `POST /api/caja/apertura`, `POST /api/ventas` |
| Clientes | Consulta y registro de clientes | `GET/POST /api/clientes` |

El menú lateral se arma según el rol del usuario, con la misma matriz de accesos que aplica el
backend: el administrador ve los cuatro módulos, el vendedor no ve Inventario y el bodeguero no ve
Punto de venta ni Clientes.

## 2. Tecnologías

| Componente | Uso |
|-----------|-----|
| React 19 | Biblioteca de interfaz basada en componentes |
| Vite 8 | Servidor de desarrollo y empaquetado |
| React Router 7 | Navegación entre módulos y rutas protegidas |
| `fetch` + JWT | Consumo de la API; el token viaja en `Authorization: Bearer` |
| CSS con variables | Paleta compartida con la aplicación de escritorio |

No se usan librerías de componentes ni de estado: el proyecto emplea únicamente `useState`,
`useEffect`, `useMemo`, `useCallback` y `useContext`, que es lo que pide el componente formativo.

## 3. Requisitos

- **Node.js 20+**
- La **API en ejecución** en `http://localhost:8080`

## 4. Cómo ejecutar

```bash
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`. Para apuntar a otra URL de la API, edite `.env`:

```
VITE_API_URL=http://localhost:8080
```

Para generar la versión de producción:

```bash
npm run build
```

### Usuarios de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `ivan.admin` | `Admin2026*` | administrador |
| `laura.ventas` | `Venta2026*` | vendedor |
| `carlos.bodega` | `Bodega2026*` | bodeguero |

## 5. Estructura

```
src/
├── api/
│   ├── clienteHttp.js      # Cliente HTTP único: URL base, JWT y errores
│   └── servicios.js        # Endpoints agrupados por módulo de negocio
├── componentes/            # Componentes reutilizables (Boton, CampoTexto, Tabla…)
├── contexto/
│   └── AutenticacionContexto.jsx
├── diseno/
│   └── Layout.jsx          # Barra lateral, encabezado y <Outlet />
├── paginas/                # Una pantalla por módulo
├── utilidades/
│   └── formato.js          # Moneda, número y fecha en formato es-CO
└── estilos/
    └── global.css
```

## 6. Decisiones de diseño

**Un solo cliente HTTP.** Ninguna pantalla llama a `fetch` directamente. `clienteHttp.js` centraliza
la URL base, adjunta el token y traduce los errores del backend a un objeto `ErrorApi` con su código
HTTP. Un cambio en el contrato de errores se corrige en un archivo, no en cinco.

**Los importes los calcula el servidor.** El punto de venta muestra un estimado en vivo para el
cajero, pero el total que se guarda es el que devuelve `POST /api/ventas`. El IVA, el descuento y la
validación de stock viven en el backend, de modo que el escritorio y la web nunca discrepan.

**Estado del carrito con actualizador funcional.** `agregar()` decide dentro de `setVenta(previo => …)`
y no con el valor del render actual. Leyendo el estado del render, dos clics seguidos sobre el mismo
producto veían ambos el carrito vacío y creaban dos líneas repetidas en vez de sumar la cantidad.

**Contexto para la sesión.** El usuario se expone con `useContext` porque casi todos los componentes
lo necesitan; encadenar props por cada nivel del árbol sería frágil.

## 7. Estándares de codificación

Se mantienen las convenciones definidas en la evidencia GA7-AA1-EV02, adaptadas a React:

- **Componentes:** `PascalCase`, un componente por archivo, nombre de archivo igual al componente.
- **Variables y funciones:** `camelCase` descriptivo en español (`estadoCaja`, `productosFiltrados`).
- **Constantes:** `MAYUSCULAS_CON_GUION` (`PORCENTAJE_IVA`, `MODULOS_POR_ROL`).
- **Clases CSS:** convención BEM (`barra-lateral__enlace--activo`).
- **Organización:** una carpeta por responsabilidad (`api`, `componentes`, `paginas`, `contexto`).
- **Comentarios:** encabezado en cada archivo explicando su papel; comentarios en línea solo donde la
  intención no es evidente en el código.

## 8. Autor

Iván Manuel Rodríguez David — Ficha 3235886
Tecnología en Análisis y Desarrollo de Software (ADSO) — SENA
