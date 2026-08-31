import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAuth } from "../context/authContext";
import { getProductById, deleteProduct } from "../services/product.service";
import { getAllFavorites } from "../services/favorite.service";
import FavoriteButton from "../components/FavoriteButton";
import type { Product } from "../interfaces/product.interface";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados locales
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar información del producto
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          const firstImg = typeof data.images[0] === "string" ? data.images[0] : (data.images[0] as any).url;
          setActiveImage(firstImg);
        }

        // Verificar si es favorito del usuario
        if (user) {
          try {
            const favs = await getAllFavorites();
            setIsFavorite(favs.some((f) => f.id === data.id));
          } catch (err) {
            console.error("Error loading favorites status in detail:", err);
          }
        }
      } catch (err: any) {
        console.error("Error loading product detail:", err);
        setErrorMsg(err.friendlyMessage || "No se pudo cargar el detalle del producto.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, user]);

  // Acción para eliminar producto
  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto permanentemente?");
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await deleteProduct(id);
      navigate("/"); // Redirigir al catálogo
    } catch (err: any) {
      console.error("Error deleting product:", err);
      alert(err.friendlyMessage || "Ocurrió un error al intentar eliminar el producto.");
    } finally {
      setDeleting(false);
    }
  };

  // Formateador de precios en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Botón Volver */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-slate-505 hover:text-blue-600 font-semibold mb-8 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al catálogo
      </Link>

      {loading ? (
        // Cargando
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : errorMsg || !product ? (
        // Error
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-red-700 text-sm font-semibold">{errorMsg || "Producto no encontrado."}</span>
        </div>
      ) : (
        // Contenido del Detalle del Producto
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Columna Izquierda: Galería de Imágenes */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="h-80 md:h-[400px] w-full bg-white border border-slate-200/50 rounded-2xl overflow-hidden flex items-center justify-center relative">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f1f5f9/94a3b8?text=Sin+Imagen";
                  }}
                />
              ) : (
                <span className="text-slate-400 font-medium">Sin imagen disponible</span>
              )}
              <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                product.stock > 0
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {product.stock > 0 ? `${product.stock} unidades en stock` : "Agotado"}
              </span>
            </div>

            {/* Carrusel de thumbnails para múltiples imágenes */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-thin">
                {product.images.map((img, idx) => {
                  const imgUrl = typeof img === "string" ? img : (img as any).url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`h-16 w-16 bg-slate-50 border rounded-xl overflow-hidden shrink-0 transition-all ${
                        activeImage === imgUrl ? "border-blue-600 ring-2 ring-blue-500/20" : "border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/100/f1f5f9/94a3b8?text=Error";
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Información del Producto */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Categoría */}
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                {product.category?.name || "General"}
              </span>

              {/* Título y Favorito */}
              <div className="flex items-center justify-between gap-4 mt-4">
                <h1 className="text-3xl font-black text-slate-805 tracking-tight leading-tight">
                  {product.name}
                </h1>
                {user && (
                  <FavoriteButton
                    productId={product.id}
                    isFavorite={isFavorite}
                    onToggle={(isFav) => setIsFavorite(isFav)}
                    className="shrink-0"
                  />
                )}
              </div>

              {/* Precio */}
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-slate-805 block">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Línea divisoria */}
              <div className="border-t border-slate-100 my-6"></div>

              {/* Descripción */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Descripción del producto
                </h3>
                <p className="text-slate-650 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {product.description || "Este producto no tiene una descripción detallada registrada."}
                </p>
              </div>
            </div>

            {/* Botones de acción para usuarios autenticados */}
            {user && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/productos/editar/${product.id}`}
                  className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl tracking-wide transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Producto
                </Link>
                
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold px-6 py-3.5 rounded-2xl tracking-wide transition-all border border-red-100 disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Eliminar Producto
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
