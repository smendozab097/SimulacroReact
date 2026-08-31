import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../context/authContext";
import { getCategoryById } from "../services/category.service";
import { getAllProducts } from "../services/product.service";
import type { Category } from "../interfaces/category.interface";
import type { Product } from "../interfaces/product.interface";

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Estados locales
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // 1. Obtener información de la categoría
        const categoryData = await getCategoryById(id);
        setCategory(categoryData);

        // 2. Obtener lista de productos que pertenecen a la categoría
        const productsResponse = await getAllProducts({ categoryId: id });
        setProducts(productsResponse.data);
      } catch (err: any) {
        console.error("Error loading category detail:", err);
        setErrorMsg(err.friendlyMessage || "No se pudo cargar el detalle de la categoría.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [id]);

  // Formateador de precios en pesos colombianos o genérico
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Botón de retroceso */}
      <Link
        to="/categorias"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold mb-6 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a Categorías
      </Link>

      {/* Cargando */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : errorMsg || !category ? (
        // Error
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-red-700 text-sm font-semibold">{errorMsg || "Categoría no encontrada."}</span>
        </div>
      ) : (
        // Contenido Principal
        <div>
          {/* Encabezado de la Categoría */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Detalle de Categoría</span>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-1">{category.name}</h1>
              <p className="text-slate-500 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                {category.description || "Esta categoría no posee una descripción cargada en el sistema."}
              </p>
            </div>
            
            {/* Botón visible solo para usuarios Autenticados (Cualquier rol) */}
            {user && (
              <Link
                to={`/productos/nuevo?categoryId=${category.id}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl tracking-wide transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Agregar producto a esta categoría
              </Link>
            )}
          </div>

          {/* Listado de Productos de la Categoría */}
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Productos Relacionados</h2>
          
          {products.length === 0 ? (
            // Lista vacía
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-bold text-slate-700">Sin productos</h3>
              <p className="text-slate-500 text-sm mt-1">Aún no se han registrado productos asociados a esta categoría.</p>
            </div>
          ) : (
            // Grid de productos
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const imageUrl = product.images && product.images.length > 0 
                  ? (typeof product.images[0] === "string" ? product.images[0] : (product.images[0] as any).url) 
                  : null;
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Imagen del producto */}
                      <div className="h-48 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              // Reemplazar por fallback silencioso si falla la carga de la imagen
                              (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f1f5f9/94a3b8?text=Sin+Imagen";
                            }}
                          />
                        ) : (
                          <span className="text-slate-400 font-medium text-sm">Sin imagen</span>
                        )}
                        <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          product.stock > 0
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
                        </span>
                      </div>

                      {/* Info del producto */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                        <p className="text-slate-500 text-xs mt-1 font-semibold">{category.name}</p>
                        <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                          {product.description || "Sin descripción."}
                        </p>
                      </div>
                    </div>

                    {/* Footer del producto */}
                    <div className="p-6 pt-0 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xl font-black text-slate-800">{formatPrice(product.price)}</span>
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
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
