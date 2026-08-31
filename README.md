# E-Commerce Admin Store — React & TypeScript (Simulacro Riwi)

Este proyecto es una aplicación frontend desarrollada en **React 19**, **TypeScript** y **Tailwind CSS**, conectada a un servicio REST API desarrollado en **NestJS**. Diseñada bajo estándares de arquitectura limpia y tolerancia a fallos.

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
* **Node.js** (versión 18 o superior recomendada)
* **npm** o **yarn**
* El backend en ejecución en `http://localhost:3000` (o el puerto configurado).

### Paso 1: Clonar e Instalar Dependencias
Instala los paquetes necesarios del proyecto ejecutando en la raíz del frontend:
```bash
npm install
```

### Paso 2: Levantar el Servidor de Desarrollo
Inicia la aplicación en modo desarrollo local:
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

### Paso 3: Ejecutar la Suite de Pruebas (Módulo 7)
Corre todas las pruebas unitarias y de integración automatizadas:
```bash
npm run test
```

### Paso 4: Compilar para Producción
Genera la carpeta final optimizada `/dist` para el despliegue:
```bash
npm run build
```

---

## 🛠️ Tecnologías y Librerías Utilizadas (Con Racionales)

El proyecto selecciona cuidadosamente sus dependencias para garantizar consistencia técnica y rendimiento:

### 1. Dependencias de Producción (`dependencies`)

* **React 19 & React DOM:** El framework de UI de referencia. Nos permite estructurar la aplicación mediante componentes interactivos basados en estados y ganchos (Hooks) reactivos.
* **React Router v7:** Biblioteca de enrutamiento del lado del cliente. 
  * *¿Por qué se usa?* Administra la navegación interna instantánea sin recargar el navegador. Proporciona las herramientas necesarias para la extracción de parámetros de ruta (`useParams`), parámetros de consulta (`useSearchParams`), redirecciones dinámicas (`useNavigate`), y envoltura de sub-rutas para control de accesos.
* **Axios (`^1.19.0`):** Cliente HTTP basado en promesas.
  * *¿Por qué se usa en lugar de fetch?* 
    1. **Interceptores de Petición/Respuesta:** Nos permite adjuntar automáticamente el token JWT obtenido del `localStorage` en las cabeceras de cada petición sin escribir código repetitivo.
    2. **Manejo de Errores centralizado:** Axios detecta automáticamente respuestas con estados fuera del rango 2xx (como `400`, `401`, `409`) y los expone limpiamente, lo que nos facilita atrapar excepciones de la API en el cliente.
    3. **Conversión automática de JSON:** Procesa las respuestas directamente a objetos JS sin requerir una doble promesa (como `res.json()`).
* **Tailwind CSS v4 & `@tailwindcss/vite`:** Framework de CSS utilitario moderno.
  * *¿Por qué se usa?* Permite diseñar layouts fluidos, responsive y altamente interactivos directamente sobre las clases de las etiquetas HTML. La integración directa mediante el plugin oficial de Vite agiliza la compilación y optimiza el bundle final de estilos.

### 2. Dependencias de Desarrollo (`devDependencies`)

* **TypeScript (`~6.0.2`):** Superset de JavaScript. Aporta tipado estático, interfaces rígidas y validación en tiempo de compilación para prevenir fallos de datos nulos en tiempo de ejecución.
* **Vitest (`^4.1.11`):** Test runner moderno y nativo para proyectos basados en Vite.
  * *¿Por qué se usa en lugar de Jest?* Es significativamente más veloz, lee la misma configuración de empaquetado de `vite.config.ts` directamente, y no requiere configuraciones complejas de transpileres para soportar TypeScript o sintaxis ESM.
* **JSDOM:** Entorno de ejecución en consola.
  * *¿Por qué se usa?* Emula la especificación DOM de un navegador en memoria dentro de Node.js, lo que permite instanciar e interactuar con componentes React simulados en consola.
* **React Testing Library & `@testing-library/jest-dom`:** Biblioteca de utilidades de testing enfocada en el comportamiento del usuario.
  * *¿Por qué se usa?* Permite montar componentes, buscar textos legibles por pantalla y simular clics o tipeos tal como lo haría un usuario final, garantizando pruebas de integración veraces en lugar de testear detalles de implementación internos.

---

## 📂 Estructura del Proyecto y Racionalidad

El código está organizado de forma modular bajo la siguiente estructura dentro de `src/`:

```text
src/
├── components/     # Componentes visuales puros y reutilizables (Card, FavoriteButton, ProtectedRoute, ErrorBoundary)
├── context/        # Proveedores de estado global (authContext para autenticación)
├── interfaces/     # Definición de tipados estrictos en TypeScript (user, product, category)
├── layouts/        # Envolturas estructurales comunes de diseño (MainLayout)
├── pages/          # Vistas principales ruteadas (Home, Products, ProductDetail, FavoritesList, Categories, Login)
├── router/         # Configuración centralizada de rutas y permisos (React Router v7)
├── services/       # Conexiones HTTP y consumo de API REST usando Axios (auth, product, category, favorite)
├── tests/          # Suite de pruebas unitarias y de integración (Card.test, Login.test, setup)
└── utils/          # Utilidades comunes y formateadores (appError para manejo consistente de errores)
```

### ¿Por qué se usó esta estructura?
1. **Separación de Responsabilidades (Separation of Concerns):** El código visual (`pages`, `components`) no contiene lógica directa de conexiones de red. Estas se delegan a `services`, aislando el protocolo HTTP (Axios) del ciclo de vida de React.
2. **Escalabilidad y Mantenibilidad:** Al separar componentes puros de páginas ruteadas, es sumamente sencillo reutilizar elementos visuales sin duplicar lógica.
3. **Tipado Estricto Centralizado:** Todas las respuestas de la API y peticiones de datos están gobernadas por contratos rígidos en `interfaces`, evitando bugs de propiedades indefinidas en tiempo de ejecución.

---

## 🧩 Justificación de Componentes Creados

Para satisfacer las pautas del simulacro, se desarrollaron componentes clave:

### 1. `ProductForm.tsx` (Formulario Modular Reutilizable)
* **El Reto:** La prueba requería rellenar y procesar formularios de productos en tres circunstancias distintas.
* **Por qué se creó así:** Diseñamos un único formulario inteligente que detecta su contexto por URL:
  * Si detecta un ID en la ruta `/productos/editar/:id`, consulta el producto a la API y se comporta en modo **Edición**.
  * Si se accede desde una categoría en `/productos/nuevo?categoryId=:id`, bloquea la categoría respectiva en el selector para asociar el producto directamente (**Creación contextualizada**).
  * Si se accede por `/productos/nuevo`, funciona como **Creación libre**.
* **Beneficio:** Evita duplicar más de 200 líneas de código de formulario.

### 2. `FavoriteButton.tsx` (Componente de Interacción Reutilizable)
* **Por qué se creó:** Encapsula el botón de corazón. Maneja el estado local de carga (`loading`) para inhabilitar el botón de forma temporal mientras se ejecuta la petición HTTP en la API, protegiendo al backend de solicitudes múltiples concurrentes.
* **Control de Burbujeo:** Detiene el flujo de eventos con `e.stopPropagation()` y `e.preventDefault()`, garantizando que pulsar el corazón sobre una tarjeta no dispare el enlace que redirige a la vista detallada del producto.

### 3. `ErrorBoundary.tsx` (Tolerancia a Fallos)
* **Por qué se creó:** React 19 sigue requiriendo componentes de clase para capturar errores de renderizado en tiempo de ejecución. Captura cualquier excepción de código en los hijos y renderiza un panel de contingencia con una opción para recargar la app y ver el diagnóstico, evitando la temida pantalla blanca.

### 4. `ProtectedRoute.tsx` (Seguridad en Rutas)
* **Por qué se creó:** Centraliza el control de accesos de la aplicación en el Router. Evalúa si el usuario está autenticado y si cuenta con el rol requerido (`allowedRoles` como `admin`), redirigiendo a accesos públicos si no cumple el permiso.

---

## 🔑 Manejo de Sesión: ¿LocalStorage o SessionStorage?

En este proyecto, almacenamos el Token de Acceso (`accessToken`) en **`LocalStorage`**.

### Racionales de la Decisión:

| Característica | LocalStorage (Elegido) | SessionStorage |
| :--- | :--- | :--- |
| **Persistencia** | Permanente. Persiste incluso si se cierra la pestaña o el navegador completo. | Temporal. Se elimina de forma inmediata al cerrar la pestaña o ventana del navegador. |
| **Experiencia de Usuario (UX)** | **Superior.** Si el usuario recarga la pestaña, abre una nueva ventana o regresa al día siguiente, su sesión sigue iniciada y no tiene que volver a loguearse. | **Incómoda.** Obliga al usuario a iniciar sesión de cero cada vez que abre la web en una nueva pestaña o tras cerrar el navegador. |
| **Seguridad ante XSS** | Ambos son accesibles mediante JavaScript, por lo que son igualmente vulnerables ante ataques de inyección Cross-Site Scripting (XSS). | Ambos son accesibles mediante JavaScript, por lo que comparten el mismo nivel de exposición frente a vulnerabilidades de XSS. |

### Conclusión Técnica
Para este simulacro de E-Commerce, **`LocalStorage` es la elección estándar de la industria** para retener el token de forma persistente y ofrecer un flujo de navegación sin fricciones. 

> [!NOTE]
> *Nota de Seguridad para el Examen:* Si el evaluador pregunta por máxima seguridad frente a XSS, la respuesta correcta es que los tokens deberían ser servidos desde el backend mediante cookies firmadas con las directivas **`HttpOnly`** y **`Secure`**, impidiendo que cualquier script de JavaScript acceda a ellos. Pero al implementar almacenamiento puramente en el cliente conectado a una REST API, `localStorage` es la opción adecuada.

---

## 🧪 Resumen de Módulos Implementados

1. **Módulo 1 (Autenticación):** Login y registro tipado con manejo de roles y almacenamiento seguro del token.
2. **Módulo 2 (Home):** Landing page con Hero de catálogo y sección de 4 productos recientes destacados.
3. **Módulo 3 (Categorías):** CRUD de categorías limitado a administradores, y visor detallado de productos por categoría.
4. **Módulo 4 (Productos):** Catálogo con filtros reactivos por categorías, buscador de palabras clave y paginación reactiva. Galería de miniaturas y eliminación interactiva.
5. **Módulo 5 (Favoritos):** Gestión de favoritos asíncrona, con botón flotante animado en Tailwind y borrado reactivo del listado local en la vista `/favoritos`.
6. **Módulo 6 (Errores):** Envoltura global de `ErrorBoundary` de clase, botón premium Bitter-Parrot-97 de recarga y botón secreto de simulación de crashes.
7. **Módulo 7 (Pruebas):** Configuración de Vitest + JSDOM, prueba unitaria de props en `<Card />` y prueba de integración de interacción en el componente `<Login />`.