import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllFavorites } from "../services/favorite.service";
import type { Product } from "../interfaces/product.interface";
import FavoriteButton from "../components/FavoriteButton";

const FavoritesList = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar favoritos al montar
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await getAllFavorites();
        setFavorites(data);
      } catch (err: any) {
        console.error("Error loading favorites page:", err);
        setErrorMsg(err.friendlyMessage || "No se pudieron cargar tus favoritos.");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  // Formateador de precios
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Encabezado */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-805 tracking-tight">Mis Favoritos</h1>
        <p className="text-slate-500 mt-1 leading-relaxed">
          Aquí encontrarás todos los productos que has marcado como tus preferidos.
        </p>
      </div>

      {loading ? (
        // Cargando
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : errorMsg ? (
        // Error
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-red-700 text-sm font-semibold">{errorMsg}</span>
        </div>
      ) : favorites.length === 0 ? (
        // Lista vacía
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
          <div className="h-16 w-16 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 fill-transparent stroke-red-500" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Aún no tienes favoritos</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            Navega por nuestra tienda y haz clic en el corazón de los productos que te encanten.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl tracking-wide transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            Explorar Tienda
          </Link>
        </div>
      ) : (
        // Grid de favoritos
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((product) => {
            const imageUrl = product.images && product.images.length > 0 
              ? (typeof product.images[0] === "string" ? product.images[0] : (product.images[0] as any).url) 
              : null;
            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:scale-[1.01] hover:shadow-md hover:border-blue-500/30 transition-all duration-200 flex flex-col justify-between group shadow-sm animate-fadeIn"
              >
                <div>
                  {/* Imagen */}
                  <div className="h-44 w-full bg-white relative flex items-center justify-center overflow-hidden">
                    <FavoriteButton
                      productId={product.id}
                      isFavorite={true}
                      onToggle={(isFav) => {
                        if (!isFav) {
                          setFavorites((prev) => prev.filter((p) => p.id !== product.id));
                        }
                      }}
                      className="absolute top-3 left-3 z-10"
                    />
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
      )}
    </div>
  );
};

export default FavoritesList;
