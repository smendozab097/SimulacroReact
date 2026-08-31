import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/authContext";
import { getAllProducts } from "../services/product.service";
import { getAllCategories } from "../services/category.service";
import { getAllFavorites } from "../services/favorite.service";
import FavoriteButton from "../components/FavoriteButton";
import type { Product } from "../interfaces/product.interface";
import type { Category } from "../interfaces/category.interface";

const Products = () => {
  const { user } = useAuth();

  // Estado para guardar favoritos del usuario
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Estados de catálogo de productos
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerError, setTriggerError] = useState<boolean>(false);

  // Estados de filtros, búsqueda y paginación
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8); // 8 productos por página de forma predeterminada
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // Cargar los favoritos del usuario al iniciar sesión o cambiar
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteIds([]);
        return;
      }
      try {
        const favs = await getAllFavorites();
        setFavoriteIds(favs.map((f) => f.id));
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    };
    fetchFavorites();
  }, [user]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await getAllCategories();
        setCategories(catData);
      } catch (err) {
        console.error("Error loading categories in catalog:", err);
      }
    };
    fetchCategories();
  }, []);

  // Cargar productos cada vez que cambien los filtros, búsqueda o paginación
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construir la consulta
        const queryParams = {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(categoryId ? { categoryId } : {}),
        };

        const response = await getAllProducts(queryParams);
        
        setProducts(response.data);
        setTotalPages(response.totalPages);
        setTotalProducts(response.total);
      } catch (err: any) {
        console.error("Error fetching products in catalog:", err);
        setError(err.friendlyMessage || "No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, categoryId, search]);

  // Manejar el cambio de filtros (restableciendo a la página 1)
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  // Formateador de precios en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (triggerError) {
    throw new Error("Fallo de renderizado simulado intencionalmente para evaluar el Error Boundary.");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Catálogo de Productos</h1>
          <p className="text-slate-500 mt-1 leading-relaxed">
            Busca, filtra y explora todos los productos disponibles en nuestra tienda.
          </p>
        </div>
        
        {/* Botón visible para cualquier usuario autenticado */}
        {user && (
          <Link
            to="/productos/nuevo"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-3.5 rounded-2xl tracking-wide transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            <svg xmlns="http://www.w3.org/2050/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Producto
          </Link>
        )}
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Buscador */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="search-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Buscar por nombre
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Ej: Camiseta, Audífonos..."
              className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-slate-800 pl-10 pr-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none"
            />
          </div>
        </div>

        {/* Filtro por Categorías */}
        <div className="space-y-1.5">
          <label htmlFor="category-select" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Categoría
          </label>
          <select
            id="category-select"
            value={categoryId}
            onChange={handleCategoryChange}
            className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-slate-850 px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Límite por Página */}
        <div className="space-y-1.5">
          <label htmlFor="limit-select" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Mostrar
          </label>
          <select
            id="limit-select"
            value={limit}
            onChange={handleLimitChange}
            className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-slate-850 px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="4">4 productos</option>
            <option value="8">8 productos</option>
            <option value="12">12 productos</option>
            <option value="20">20 productos</option>
          </select>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200/60 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Productos</h2>
        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200/60">
          {loading ? "Buscando..." : `${totalProducts} productos encontrados`}
        </span>
      </div>

      {loading ? (
        // Spinner
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-slate-500 font-medium">Obteniendo catálogo...</p>
        </div>
      ) : error ? (
        // Error
        <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-3xl text-center max-w-xl mx-auto shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-semibold">{error}</p>
        </div>
      ) : products.length === 0 ? (
        // Lista vacía
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl max-w-md mx-auto px-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-bold mb-1 text-slate-800">No se encontraron productos</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            No hay productos registrados que coincidan con la búsqueda o la categoría seleccionada.
          </p>
        </div>
      ) : (
        // Grid de productos
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const imageUrl = product.images && product.images.length > 0 
                ? (typeof product.images[0] === "string" ? product.images[0] : (product.images[0] as any).url) 
                : null;
              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:scale-[1.01] hover:shadow-md hover:border-blue-500/30 transition-all duration-200 flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    {/* Imagen */}
                    <div className="h-44 w-full bg-white relative flex items-center justify-center overflow-hidden">
                      {user && (
                        <FavoriteButton
                          productId={product.id}
                          isFavorite={favoriteIds.includes(product.id)}
                          onToggle={(isFav) => {
                            if (isFav) {
                              setFavoriteIds((prev) => [...prev, product.id]);
                            } else {
                              setFavoriteIds((prev) => prev.filter((id) => id !== product.id));
                            }
                          }}
                          className="absolute top-3 left-3 z-10"
                        />
                      )}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="object-contain h-full w-full p-2 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f1f5f9/94a3b8?text=Sin+Imagen";
                          }}
                        />
                      ) : (
                        <span className="text-slate-400 text-sm font-medium">Sin imagen</span>
                      )}
                      <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-sm ${
                        product.stock > 0
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
                      </span>
                    </div>

                    {/* Detalles */}
                    <div className="p-5">
                      <h3 className="font-bold text-base text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                        {product.category?.name || "General"}
                      </p>
                      <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {product.description || "Sin descripción disponible."}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-lg font-black text-slate-850">{formatPrice(product.price)}</span>
                    <Link
                      to={`/productos/${product.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-slate-200/60">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-650 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-sm font-bold text-slate-600">
                Página {page} de {totalPages}
              </span>

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-650 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Botón discreto para simulación de errores en el simulacro */}
      <div className="mt-16 text-center border-t border-slate-200/40 pt-8">
        <button
          type="button"
          onClick={() => setTriggerError(true)}
          className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors border border-dashed border-slate-200 hover:border-red-200 rounded-xl px-4 py-2 bg-white cursor-pointer"
        >
          🚨 Simular Fallo de Renderizado (Probar Error Boundary)
        </button>
      </div>
    </div>
  );
};

export default Products;
