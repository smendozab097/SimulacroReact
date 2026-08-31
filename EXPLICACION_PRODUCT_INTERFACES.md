# Guía de Estudio: Explicación Detallada de `product.interface.ts`

Este documento explica de forma minuciosa el diseño, origen y justificación de cada una de las interfaces creadas en el archivo [product.interface.ts](file:///c:/Users/sebas/OneDrive/Documentos/4-Proyectos/Riwi/SimulacroReact/src/interfaces/product.interface.ts). El objetivo es ayudarte a entender el **porqué** de cada propiedad para que puedas replicar este mismo criterio al crear o modificar otras interfaces en el futuro.

---

## 1. Interfaz: `Product`

Representa el modelo o entidad de un **producto completo** tal y como está guardado en la base de datos del backend.

```typescript
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: Category;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

### ¿Por qué y para qué se creó?
Se creó para representar la información completa que devuelve el backend al realizar peticiones de lectura como `GET /products` o `GET /products/:id`.
* **En el frontend:** La usamos para tipar el estado del componente que lista los productos (ej: `const [products, setProducts] = useState<Product[]>([])`) o para tipar las props de un componente tarjeta (`CardProps`).

### Justificación de sus propiedades:
* **`id: string`**: **Obligatorio.** Todo registro en la base de datos del backend tiene un identificador único (generalmente un UUID o un ID numérico). Lo necesitamos en el frontend para la prop `key` en listas de React (`products.map(p => <Card key={p.id} ... />)`) y para navegar al detalle (`/products/${p.id}`).
* **`name: string`**: **Obligatorio.** El nombre del producto. Siempre debe existir porque el backend no permite productos sin nombre.
* **`description?: string`**: **Opcional (`?`).** Algunos productos pueden no tener descripción. Usamos la interrogación para que TypeScript no nos obligue a proveerla y nos permita manejar casos donde el backend devuelva `null` o no envíe la propiedad.
* **`price: number` y `stock: number`**: **Obligatorios.** El precio y la cantidad disponible en inventario. Son de tipo numérico para poder realizar cálculos matemáticos en el frontend (ej. calcular el subtotal del carrito de compras).
* **`categoryId: string`**: **Obligatorio.** Es la clave foránea (*foreign key*) que asocia este producto a una categoría específica en la base de datos.
* **`category?: Category`**: **Opcional (`?`).** Cuando el backend realiza un "join" (o relación de tablas), nos devuelve el objeto de la categoría completo (con su propio nombre y descripción). Es opcional porque no todos los endpoints de productos devuelven la categoría resuelta; algunos solo devuelven el `categoryId` para ahorrar ancho de banda.
* **`images?: string[]`**: **Opcional (`?`).** Representa una lista de URLs de imágenes del producto. Es opcional porque un producto nuevo podría crearse sin fotos. Es un arreglo de cadenas (`string[]`) ya que un producto puede tener varias fotos asociadas.
* **`createdAt?: string` y `updatedAt?: string`**: **Opcionales (`?`).** Fechas de creación y última actualización autogeneradas por la base de datos (NestJS/PostgreSQL). Vienen en formato string (ISO 8601, ej. `2026-08-25T12:00:00Z`). Son opcionales porque solo las necesitamos si queremos mostrar en pantalla cuándo se añadió el producto.

---

## 2. Interfaz: `CreateProductDto`

Representa el **objeto de transferencia de datos (DTO)** necesario para poder registrar un producto nuevo en el backend.

```typescript
export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: string[];
}
```

### ¿Por qué y para qué se creó?
Se creó para mapear la estructura de datos requerida por el endpoint `POST /products`.
* **En el frontend:** La usamos para tipar el estado del formulario de creación de productos (el valor inicial del formulario) y la petición que enviamos mediante `productService.create(data)`.

### Justificación de sus propiedades:
* **¿Por qué NO tiene `id`?**
  Porque el `id` lo genera automáticamente la base de datos en el servidor al insertar el registro. Si lo enviáramos en la petición, el backend lo ignoraría o podría arrojar un error de validación.
* **¿Por qué NO tiene `createdAt` ni `updatedAt`?**
  Al igual que el `id`, estas fechas son controladas por el servidor en el momento exacto en que se realiza la transacción.
* **¿Por qué las demás propiedades son iguales a `Product`?**
  Porque para crear un producto necesitamos proveer todos los campos requeridos por las reglas del negocio del backend (nombre, precio, stock, categoría).

---

## 3. Interfaz: `UpdateProductDto`

Representa la estructura de datos que enviamos al backend cuando deseamos **modificar o actualizar** un producto existente.

```typescript
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  images?: string[];
}
```

### ¿Por qué y para qué se creó?
Se creó para el endpoint `PATCH /products/:id`. El método HTTP `PATCH` se utiliza para realizar **actualizaciones parciales**.
* **En el frontend:** Nos permite tipar la función de edición. Al actualizar, el usuario puede modificar solo el precio, o solo el nombre, por lo que no es obligatorio enviar todo el objeto completo.

### Justificación de sus propiedades:
* **¿Por qué todas las propiedades tienen `?` (son opcionales)?**
  Como es una actualización parcial, el backend solo requiere los campos que realmente cambiaron. Si solo cambiaste el `price`, puedes enviar únicamente `{ price: 150.00 }`. Si TypeScript nos obligara a mandar todas las propiedades, tendríamos que re-enviar datos que no han cambiado, incrementando el tráfico de red innecesariamente.
* **¿Por qué NO tiene `id`?**
  El ID no se modifica. El ID del producto que se va a editar se pasa directamente en la URL del endpoint (ej. `PATCH /products/123`), por lo que no forma parte del cuerpo de la petición (*request body*).

---

## 4. Interfaz: `ProductQuery`

Representa los **parámetros de consulta (Query Params)** que podemos concatenar en la URL para filtrar o paginar productos.

```typescript
export interface ProductQuery {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}
```

### ¿Por qué y para qué se creó?
Se creó para mapear la firma de la petición `GET /products?search=...&page=...`.
* **En el frontend:** La usamos como argumento en el método de listado `productService.findAll(query)`. Al tiparla, nos aseguramos de que sólo enviamos parámetros que el backend realmente soporta y entiende.

### Justificación de sus propiedades:
* **¿Por qué todas son opcionales (`?`)?**
  Porque si el usuario entra a la tienda por primera vez, no hay filtros activos (se listan todos los productos con la paginación por defecto del backend). Por lo tanto, una petición limpia a `/products` es perfectamente válida.
* **`search?: string`**: Filtro de búsqueda por texto (ej. buscar "celular").
* **`categoryId?: string`**: Filtro para obtener únicamente productos que pertenezcan a una categoría en específico.
* **`page?: number` y `limit?: number`**: Indispensables para la paginación. Definen qué página queremos ver (ej. página 2) y cuántos productos queremos recibir por página (ej. 10 productos). Son de tipo `number` porque Axios o el servicio se encargarán de convertirlos a texto en la URL final.

---

## 5. Interfaz: `PaginatedProductsResponse`

Representa la estructura exacta del objeto respuesta que devuelve la API cuando consultamos la lista de productos paginada.

```typescript
export interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### ¿Por qué y para qué se creó?
Se creó porque el backend no devuelve un arreglo simple (`Product[]`) al hacer `GET /products`, sino un **objeto de paginación** que contiene metadatos de control.
* **En el frontend:** Si asumiéramos que la API nos devuelve un arreglo simple, al intentar hacer `response.data.map(...)` la aplicación se rompería porque estaríamos tratando de iterar sobre un objeto que contiene propiedades como `total` y `totalPages`. Necesitamos esta interfaz para indicarle a React que los productos reales están dentro de la propiedad `data`.

### Justificación de sus propiedades:
* **`data: Product[]`**: **Obligatorio.** El listado real de productos de la página actual. Aquí es donde aplicaremos el `.map()` en React.
* **`total: number`**: **Obligatorio.** La cantidad total de productos que existen en la base de datos (independientemente del límite de la página). Sirve para mostrar mensajes como: *"Se encontraron 150 productos"*.
* **`page: number`**: **Obligatorio.** La página actual que se está visualizando.
* **`limit: number`**: **Obligatorio.** La cantidad máxima de productos configurada para mostrar por página.
* **`totalPages: number`**: **Obligatorio.** El total de páginas calculadas por el backend (es el resultado de dividir el `total` entre el `limit`). Con este número podemos dibujar los botones de navegación de la paginación en el frontend (ej. botones del 1 al 15).
