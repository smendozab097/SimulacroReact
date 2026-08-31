# Guía de Construcción Paso a Paso — Simulacro React + TypeScript

Este documento es una bitácora detallada de los componentes, contextos y lógica que vamos construyendo paso a paso para la integración del frontend con la API de gestión de productos. Úsalo como material de estudio para comprender la justificación detrás de cada línea de código.

---

## Índice de Pasos
1. [Paso 1: Gestión de Estado Global con AuthContext](#paso-1-gestión-de-estado-global-con-authcontext)

---

## Paso 1: Gestión de Estado Global con `AuthContext`

En aplicaciones profesionales de React, los datos de la sesión del usuario (su correo, nombre, rol y si está autenticado) son necesarios en múltiples pantallas (para proteger rutas, mostrar el nombre en el Navbar, o condicionar botones de administración). 

Para evitar pasar estos datos de componente en componente a través de props (un problema conocido como *Prop Drilling*), creamos un estado global utilizando la **Context API** de React.

### Archivo Creado: `src/context/authContext.tsx`
Este archivo expone dos cosas:
1. **`AuthProvider`**: El componente contenedor que provee el estado del usuario, la función de inicio de sesión (`login`) y cierre de sesión (`logout`) a toda la aplicación.
2. **`useAuth()`**: Un hook personalizado que permite a cualquier componente acceder a los datos de sesión de forma rápida, limpia y tipada.

### Análisis Detallado del Código:

#### 1. Definición del Contrato del Contexto (`AuthContextProps`)
```typescript
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
}
```
* **`user: User | null`**: Si el usuario está autenticado, contendrá un objeto con sus datos (`id`, `name`, `role`, etc.). Si no está autenticado, será `null`.
* **`loading: boolean`**: Al cargar la página por primera vez, el frontend verifica si hay un token guardado en el navegador para recuperar la sesión. Mientras hace esa llamada al backend, este estado es `true`. Sirve para pintar una pantalla de carga y evitar redirecciones erróneas al Login.
* **`login` y `logout`**: Las funciones que dispararán los flujos correspondientes.

#### 2. Recuperación Automática de Sesión (`useEffect`)
```typescript
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const userProfile = await getProfile();
      setUser(userProfile);
    } catch (error) {
      // Si el token es inválido o expiró, apiClient.interceptors se encarga de limpiarlo,
      // pero aquí aseguramos que el estado del usuario vuelva a null.
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, []);
```
* **¿Cómo funciona?** Cuando el usuario refresca la página, el componente se monta y este efecto se dispara una sola vez. Busca en el `localStorage` si hay un token guardado. Si hay un token, llama a la API a través de la función `getProfile()`. Si la API responde con éxito, guardamos el perfil del usuario en el estado local `user`, recuperando la sesión de manera transparente y automática.

#### 3. Función de Inicio de Sesión (`login`)
```typescript
const handleLogin = async (credentials: Login) => {
  // 1. Llama al servicio de autenticación que hace la petición POST a /auth/login
  const response = await loginService(credentials);
  
  // 2. Si la promesa se resuelve con éxito, el servicio ya guardó el token en localStorage.
  // 3. Procedemos a obtener el perfil del usuario recién logueado para llenar nuestro estado global.
  const userProfile = await getProfile();
  setUser(userProfile);
};
```
* **Nota sobre la modularidad:** Separamos la petición HTTP (que está en `auth.service.ts`) de la gestión del estado global (que está aquí en el `AuthContext`). El servicio se comunica con la API y el Contexto actualiza el estado de la UI de React.

#### 4. Función de Cierre de Sesión (`logout`)
```typescript
const handleLogout = async () => {
  try {
    await logoutService();
  } finally {
    // Nos aseguramos de limpiar el estado en el frontend pase lo que pase
    setUser(null);
  }
};
```
* **El uso de `finally`:** Aunque la petición HTTP para registrar el logout en el servidor falle (por ejemplo, por problemas de internet), es vital que el cliente siempre limpie el estado del usuario localmente por seguridad.

#### 5. El hook personalizado `useAuth`
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
```
* **¿Por qué se crea?** Para no tener que escribir `import { useContext } from 'react'` y `import { AuthContext } from '...'` en cada componente que requiera la sesión. Con `useAuth()`, obtenemos acceso directo y tipado al contexto en una sola línea.

---

## Paso 2: Composición de Componentes (LogisterCard como Contenedor) y Formularios Separados

En este paso, implementamos el flujo de sesión dividiendo las responsabilidades. Creamos un cascarón visual común llamado [`LogisterCard.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/components/LogisterCard.tsx) y separamos la lógica de **Inicio de Sesión** y **Registro** en páginas individuales. Esto mejora la modularidad del código alineándolo con las buenas prácticas vistas en clase.

### Características Clave Implementadas:

#### 1. Patrón de Composición de Componentes (`children`)
En lugar de crear lógica pesada con pestañas condicionales que alternaran formularios en un solo archivo, convertimos a [`LogisterCard`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/components/LogisterCard.tsx) en un contenedor visual simple y reutilizable mediante la prop `children`:
```typescript
interface LogisterCardProps {
  title: string;
  subtitle: string;
  children: ReactNode; // Recibe el formulario específico
}

const LogisterCard = ({ title, subtitle, children }: LogisterCardProps) => {
  return (
    <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl">
      <h2 className="text-2xl font-black">{title}</h2>
      <p>{subtitle}</p>
      {children}
    </div>
  );
};
```
* **¿Por qué?** Permite reutilizar toda la maquetación (sombras, bordes, espaciados y títulos) sin mezclar la lógica de negocio de los formularios.

#### 2. Formularios Independientes y Controlados (`Login.tsx` y `Register.tsx`)
Separamos las páginas en [`Login.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/Login.tsx) y [`Register.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/Register.tsx). Cada página tiene sus propios estados y su propio handler `onSubmit`.
* **Login:** Maneja estados locales para `email` y `password`.
* **Registro:** Maneja estados locales para `name`, `email`, `password` y `confirmPassword`.

#### 3. Confirmación de Contraseña y Validación Local
En el registro de usuarios, agregamos el campo de seguridad **Confirmar contraseña** y realizamos una validación local antes de realizar la petición HTTP a la API:
```typescript
if (password !== confirmPassword) {
  setErrorMsg("Las contraseñas no coinciden.");
  setLoading(false);
  return;
}
```
* **¿Por qué?** Evita enviar peticiones innecesarias al servidor si el usuario cometió un error de tipeo al confirmar su contraseña, mejorando la seguridad y la experiencia del usuario.

#### 4. Captura y Renderizado de Errores de API (`AppError`)
Tanto en el login como en el registro, si la API devuelve un código de error (como credenciales incorrectas `401`, errores de campos `400` o correo en uso `409`), atrapamos el error con nuestra clase `AppError` y renderizamos un banner de error junto con los detalles en pantalla, cumpliendo con la directiva del proyecto.

---

## Paso 3: Protección de Rutas (Route Guards) a Dos Niveles

En este paso implementamos la seguridad y el control de acceso en la navegación. Creamos el componente guardián [`ProtectedRoute.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/components/ProtectedRoute.tsx) y reorganizamos el árbol de rutas en [`index.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/router/index.tsx).

### Conceptos Clave para Sustentar:

#### 1. ¿Cómo funciona el Guardián (`ProtectedRoute.tsx`)?
Es un componente funcional simple que intercepta el acceso a las rutas hijas. Ejecuta las siguientes verificaciones lógicas de arriba a abajo:
1. **Comprobar Carga (`loading`):** Mientras `AuthContext` está verificando el token en el servidor al refrescar la página, el guardián retorna `null` para no tomar decisiones apresuradas ni redirigir por error.
2. **Comprobar Autenticación (`!user`):** Si no hay un objeto de usuario en el estado global, significa que no ha iniciado sesión. Lo redirigimos a `/login` usando `<Navigate to="/login" replace />`.
3. **Comprobar Roles (`allowedRoles`):** Si la ruta protegida especifica ciertos roles válidos (ej: `['admin']`) y el rol del usuario actual (`user.role`) no está incluido, lo repele y redirige a la raíz `/` de la aplicación.
4. **Permitir Acceso (`<Outlet />`):** Si pasa todos los filtros, retorna `<Outlet />`.

#### 2. ¿Qué es `<Outlet />`?
* **Respuesta en examen:** *"`<Outlet />` es un componente de React Router que actúa como un marcador de posición (placeholder) o 'hueco'. React Router reemplazará este componente con el elemento hijo correspondiente de la ruta activa en ese momento. Esto nos permite anidar layouts y proteger conjuntos de rutas de forma centralizada sin duplicar lógica en cada página."*

#### 3. ¿Qué es `<Navigate replace />`?
* **Respuesta en examen:** *"`<Navigate>` es el componente declarativo de React Router para redirigir a los usuarios. La prop `replace` reemplaza la entrada actual en el historial de navegación en lugar de añadir una nueva. Esto evita que si el usuario hace clic en el botón de 'Volver' del navegador, sea devuelto al bucle infinito de redirección de la página protegida."*

#### 4. Configuración en el Router ([`index.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/router/index.tsx))
Organizamos el árbol de rutas utilizando anidamiento limpio:
```typescript
// Nivel 1: Protegidas para cualquier logueado
{
  element: <ProtectedRoute />,
  children: [
    { path: '/favoritos', element: <FavoritosPage /> },
    { path: '/productos/nuevo', element: <CrearProductoPage /> }
  ]
},
// Nivel 2: Protegidas solo para admin
{
  element: <ProtectedRoute allowedRoles={["admin"]} />,
  children: [
    { path: '/categorias/nuevo', element: <CrearCategoriaPage /> }
  ]
}
```
* **¿Por qué?** Esta estructura agrupa la seguridad en bloques claros. Cualquiera puede ver la lista pública de productos, pero solo los registrados pueden marcar favoritos, y solo los administradores pueden gestionar categorías.

---

## Paso 4: Módulo de Categorías (Listado, Detalle y Creación Admin)

En este paso, construimos la infraestructura de categorías de la aplicación según lo requerido por el **Módulo 3** de la prueba. 

### Conceptos Clave para Sustentar:

#### 1. Renombrar a `SimpleCard` (Reutilización de UI)
Originalmente teníamos un componente llamado `LogisterCard` dedicado al Login/Registro. 
* **Justificación técnica:** Dado que la creación de categorías (y posiblemente la de productos más adelante) requiere el mismo contenedor visual (una tarjeta limpia centrada con un título, descripción y cuerpo), cambiamos su nombre a **[`SimpleCard.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/components/SimpleCard.tsx)**. Esto sigue las buenas prácticas de desarrollo al eliminar nombres específicos de negocio y crear componentes visuales genéricos y 100% reutilizables.

#### 2. Listado Público y Botón Condicional de Admin ([`CategoriesList.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/CategoriesList.tsx))
La lista de categorías es de acceso público (visible sin inicio de sesión). Sin embargo, el botón para crear una nueva categoría está condicionado según el rol del usuario:
```typescript
{user?.role === "admin" && (
  <Link to="/categorias/nuevo">Crear Categoría</Link>
)}
```
* **¿Por qué?** Aunque la ruta `/categorias/nuevo` está protegida a nivel del enrutador, ocultar el botón en la interfaz mejora la experiencia de usuario (UX), evitando frustraciones al hacer clic en acciones que tienen prohibidas.

#### 3. Detalle de Categoría y Relación de Productos ([`CategoryDetail.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/CategoryDetail.tsx))
Esta vista demuestra cómo encadenar llamadas asíncronas para resolver dependencias:
1. Obtenemos el `id` dinámico de la categoría mediante el hook `useParams()` de React Router.
2. Solicitamos los metadatos de la categoría con `getCategoryById(id)`.
3. Buscamos los productos filtrados por esa categoría en la base de datos usando `getAllProducts({ categoryId: id })`:
```typescript
const categoryData = await getCategoryById(id);
const productsResponse = await getAllProducts({ categoryId: id });
```
* **Botón condicional:** En esta vista, el botón *"Agregar producto"* es visible para **cualquier usuario autenticado** (sin importar el rol), tal como exige la prueba: `{user && <Link to="...">Agregar producto</Link>}`.

#### 4. Formulario de Creación de Categoría ([`CreateCategory.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/CreateCategory.tsx))
* **Protección:** Esta vista está registrada dentro del bloque del administrador en el enrutador (`allowedRoles={['admin']}`), por lo que está blindada contra accesos indeseados por URL directa.
* **Control de Errores:** Al igual que en la autenticación, si el administrador ingresa un nombre vacío o si el servidor está caído, la excepción es interceptada por `AppError` y mostrada de forma amigable en pantalla.

---

## Paso 5: Módulo de Productos (Filtros, Paginación y Formulario Reutilizable)

En este paso, implementamos el **Módulo 4** completo para la gestión y exploración avanzada del catálogo de productos.

### Conceptos Clave para Sustentar:

#### 1. Búsqueda, Filtros y Paginación Reactiva en el Catálogo ([`Home.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/auth/Home.tsx))
La carga de datos del catálogo reacciona en tiempo real a los cambios de estado del usuario utilizando un gancho `useEffect` que escucha cambios en `search`, `categoryId`, `page` y `limit`:
```typescript
useEffect(() => {
  const fetchProducts = async () => {
    const response = await getAllProducts({ page, limit, search, categoryId });
    setProducts(response.data);
    setTotalPages(response.totalPages);
  };
  fetchProducts();
}, [page, limit, categoryId, search]);
```
* **Respuesta en examen:** *“Al añadir las variables de estado al arreglo de dependencias del `useEffect`, React ejecuta automáticamente el bloque de consulta HTTP y vuelve a renderizar los productos cada vez que el usuario escribe un término, filtra por una categoría diferente o cambia de página.”*
* **Formateo de Precios:** Usamos la API estándar `Intl.NumberFormat('es-CO')` para dar un aspecto extremadamente premium a la visualización de costos de productos en pesos colombianos.

#### 2. Galería Dinámica y Eliminación Segura ([`ProductDetail.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/ProductDetail.tsx))
* **Galería:** Para el campo de imágenes, permitimos que un producto tenga un arreglo de múltiples URLs. En la vista de detalle, renderizamos miniaturas en la parte inferior; al hacer clic en ellas, se actualiza el estado de la imagen activa (`activeImage`), logrando una experiencia de usuario fluida sin recargar la página.
* **Operaciones Protegidas:** Solo mostramos los botones de *Editar* y *Eliminar* a usuarios con sesión iniciada (`user !== null`). La eliminación dispara una llamada DELETE asíncrona a la API.

#### 3. El Desafío de la Reutilización del Formulario ([`ProductForm.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/components/ProductForm.tsx))
La prueba nos exigía reutilizar el formulario de productos para tres escenarios. Lo logramos diseñando un único componente inteligente:
* **Escenario A (Creación General):** Se accede por `/productos/nuevo`. El usuario ve y puede elegir la categoría en el desplegable.
* **Escenario B (Creación con Contexto):** Se accede por `/productos/nuevo?categoryId=:id`. Leemos el query-param de la URL usando `useSearchParams()` y deshabilitamos el desplegable para obligar a que se asocie a la categoría de origen.
* **Escenario C (Edición):** Se accede por `/productos/editar/:id`. El hook `useParams()` captura el ID. Al detectar que existe, el formulario entra en modo edición, consulta la base de datos con `getProductById` y pre-rellena todos los campos con los datos actuales.

Este enfoque ahorra cientos de líneas de código duplicado, reduce el mantenimiento y demuestra el dominio de las herramientas avanzadas de enrutamiento de React.

---

## Paso 6: Módulo de Favoritos e Interacciones de Usuario

En este paso, implementamos el **Módulo 5** para permitir a los usuarios logueados marcar y desmarcar productos como favoritos con sincronización en la API del backend.

### Conceptos Clave para Sustentar:

#### 1. Componente Reutilizable Único ([`FavoriteButton.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/components/FavoriteButton.tsx))
* **Justificación técnica:** Dado que la acción de agregar y remover un favorito se repite en tres vistas diferentes (las tarjetas del catálogo general, el listado de favoritos y la vista de detalle de cada producto), encapsular la lógica en un componente centralizado elimina la duplicación de código.
* **Manejo de Carga y Concurrencia:** Definimos un estado local `loading` en el botón. Mientras la llamada HTTP a la API (`addFavorite` o `removeFavorite`) se encuentra en tránsito, el botón se deshabilita temporalmente. Esto evita que clics múltiples y repetidos del usuario generen peticiones concurrentes conflictivas en el servidor.

#### 2. Control de Propagación de Eventos (Event Bubbling)
En las tarjetas de productos, todo el bloque contenedor es un enlace `<Link to="...">` que redirige al detalle. 
* **El Problema:** Al hacer clic en el botón del corazón flotante, el navegador disparaba el evento de clic tanto para el botón como para el enlace padre, llevando al usuario a la vista de detalle en lugar de solo procesar el favorito.
* **La Solución:** En el manejador del clic de `FavoriteButton`, detuvimos el burbujeo de eventos nativos de JavaScript usando `e.stopPropagation()` y prevenimos la acción por defecto del enlace padre con `e.preventDefault()`:
```typescript
const handleToggle = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation(); // Detiene el burbujeo hacia el Link padre
  ...
}
```

#### 3. Reactividad en la Lista de Favoritos ([`FavoritesList.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/FavoritesList.tsx))
En la página de favoritos `/favoritos`, queremos que al hacer clic en el corazón rojo (desmarcar), el producto sea removido visualmente de la rejilla de inmediato.
* **¿Cómo funciona?** Pasamos una función callback al componente:
```typescript
onToggle={(isFav) => {
  if (!isFav) {
    setFavorites((prev) => prev.filter((p) => p.id !== product.id));
  }
}}
```
* **UX Inmediata:** Al invocar el filtro sobre el estado local, React actualiza la vista al instante sin requerir que recarguemos la página completa ni hacer llamadas adicionales de listado al servidor, ofreciendo una experiencia limpia y libre de latencia.

---

## Paso 7: Módulo de Manejo de Errores (Tolerancia a fallos en la interfaz)

En este paso, implementamos el **Módulo 6** completo, asegurando que un fallo imprevisto en la ejecución del código o en las llamadas a servicios de red nunca deje al usuario con una pantalla en blanco.

### Conceptos Clave para Sustentar:

#### 1. Componente de Clase `ErrorBoundary` ([`ErrorBoundary.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/components/ErrorBoundary.tsx))
* **Justificación de por qué es un Componente de Clase:** *“A pesar de que React ha migrado en su gran mayoría al paradigma de ganchos funcionales (Hooks), las APIs para capturar excepciones en el ciclo de vida de renderizado (`componentDidCatch` y `getDerivedStateFromError`) siguen estando disponibles únicamente a nivel de componentes de clase. Por ello, es una buena práctica y requisito escribir un componente de clase para esta tarea en React.”*
* **Mecánica de Captura:** Al heredarse de `React.Component`, cualquier error sintáctico, referencia nula o error en el mapeo de datos que ocurra en los componentes hijos será interceptado automáticamente. En lugar de colapsar la UI, se activa el estado `hasError: true` y se despliega una interfaz de contingencia alternativa.

#### 2. Diseño del Botón de Recarga Premium (Estilo Uiverse Bitter-Parrot-97)
* **Animación e Interacción:** El botón para recargar la aplicación (`window.location.reload()`) utiliza una estructura de tres círculos CSS dinámicos superpuestos (`.button-bg-layer-1`, `-2`, `-3`) con retardos de tiempo (`transition-delay`). 
* **Estilo visual:** Al pasar el cursor, estas capas se expanden radialmente a escala completa (`scale(1)`) rellenando el fondo, mientras que el texto principal se desliza suavemente hacia arriba dando paso a una versión con transiciones de color limpias y pulidas, usando la paleta corporativa azul/índigo de la tienda.

#### 3. Botón de Simulación de Error de Renderizado ([`Products.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/pages/Products.tsx))
* **Propósito en la Evaluación:** Para demostrar en vivo que el `ErrorBoundary` funciona correctamente, integramos un disparador controlado en la página del catálogo general.
* **Código de simulación:**
```typescript
if (triggerError) {
  throw new Error("Fallo de renderizado simulado intencionalmente para evaluar el Error Boundary.");
}
```
* Al hacer clic en el botón de alerta, el estado `triggerError` cambia a `true`, forzando al componente a lanzar un error en plena ejecución. El `ErrorBoundary` global captura la excepción al instante y renderiza el panel de contingencia, demostrando que la app es 100% tolerante a fallos críticos.

---

## Paso 8: Infraestructura y Casos de Prueba (Módulo 7 — Pruebas)

En este paso final, implementamos el **Módulo 7**, instalando y configurando un entorno de pruebas robusto y automatizado para certificar el correcto funcionamiento de los componentes clave de la aplicación.

### Conceptos Clave para Sustentar:

#### 1. Configuración de `Vitest` y `JSDOM` ([`vite.config.ts`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/vite.config.ts))
* **¿Por qué Vitest?** *“Es el test runner moderno por excelencia para proyectos creados sobre Vite. Comparte la misma configuración del compilador y es significativamente más veloz que alternativas clásicas como Jest.”*
* **¿Por qué JSDOM?** *“Puesto que las pruebas se ejecutan en un entorno virtualizado de Node.js (consola), no disponemos de un navegador real. JSDOM emula un entorno completo del navegador en memoria, lo que permite a React Testing Library renderizar el árbol de componentes de React, consultar elementos del DOM e interactuar con el mouse o teclado exactamente como lo haría un usuario real.”*
* **Archivo de Configuración Global (`setup.ts`):** Creamos [`setup.ts`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/tests/setup.ts) para importar `@testing-library/jest-dom`, lo que inyecta aserciones naturales en todos nuestros archivos de pruebas (ej: `toBeInTheDocument()`).

#### 2. Caso de Prueba Unitaria Pura ([`Card.test.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/tests/Card.test.tsx))
* **Objetivo:** Validar que un componente puramente presentacional (`Card`) renderice su contenido de manera inmutable basándose exclusivamente en los datos que recibe por parámetros (`Props`).
* **Sustentación:** *“Renderizamos la tarjeta inyectando valores de texto arbitrarios en sus propiedades y confirmamos que las consultas del selector (`screen.getByText`) localicen el título, subtítulo e hijos inyectados. Al ser un componente puro sin estados, esta prueba es determinista y no requiere simular contextos.”*

#### 3. Caso de Prueba de Integración Dinámica ([`Login.test.tsx`](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/tests/Login.test.tsx))
* **Objetivo:** Simular un escenario de interacción de usuario completo sobre el formulario de Login, rellenando inputs, enviando datos y verificando la invocación del servicio correspondiente sin mockear todo el sistema.
* **Estrategia de Mock controlado:** Usamos `vi.mock()` sobre el módulo de contexto de autenticación:
```typescript
vi.mock("../context/authContext", () => ({
  useAuth: vi.fn(),
}));
```
* **Mecánica del Test:**
  1. Envolvemos el componente `<Login />` con `<MemoryRouter>` para suplir los contextos del enrutamiento de React Router (como el gancho `useNavigate` y el componente `<Link>`).
  2. Sustituimos la función `login` de autenticación por un espía (`vi.fn()`) para inspeccionar sus llamados.
  3. Simulamos la acción del usuario rellenando los inputs de correo y contraseña mediante disparadores de eventos `fireEvent.change`.
  4. Disparamos la acción de envío simulando un clic en el botón de submit (`fireEvent.click`).
  5. Validamos mediante `await waitFor` que el espía de autenticación sea invocado exactamente con el objeto de credenciales estructurado (`{ email, password }`), garantizando que la vinculación del formulario y el controlador sea totalmente correcta.

