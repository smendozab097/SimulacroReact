import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { getAllProducts } from "../../services/product.service";
import type { Product } from "../../interfaces/product.interface";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);

  // Monitorear parámetro de logout para mostrar alerta
  useEffect(() => {
    if (searchParams.get("logout") === "success") {
      setShowLogoutAlert(true);
      
      // Limpiar el parámetro de la URL para que no reaparezca al recargar
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("logout");
      setSearchParams(newParams, { replace: true });
      
      // Cerrar automáticamente después de 5 segundos
      const timer = setTimeout(() => {
        setShowLogoutAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  // Cargar únicamente los 4 productos más recientes para la sección "Destacados"
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts({ page: 1, limit: 4 });
        setFeaturedProducts(response.data);
      } catch (err: any) {
        console.error("Error loading featured products:", err);
        setError(err.friendlyMessage || "No se pudieron cargar los productos destacados.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
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
    <main className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col items-center py-10 px-4 md:px-8 relative">
      {/* Toast flotante de cierre de sesión */}
      {showLogoutAlert && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl max-w-sm">
            <div className="h-8 w-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 text-sm font-semibold pr-2">
              Sesión cerrada correctamente. ¡Vuelve pronto!
            </div>
            <button
              onClick={() => setShowLogoutAlert(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <div className="w-full max-w-6xl mb-12 text-center md:text-left md:flex md:items-center md:justify-between bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-sm">
        <div className="mb-6 md:mb-0 md:max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Bienvenido a mi tienda virtual
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            Explora una experiencia e-commerce de alto nivel, completamente tipada, veloz y conectada a una API NestJS con Axios.
          </p>
        </div>
        <Link
          to="/productos"
          className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl tracking-wide transition-all shadow-md shadow-indigo-600/10 hover:scale-105 active:scale-95 shrink-0"
        >
          Explorar catálogo
        </Link>
      </div>

      {/* Featured Products Section */}
      <div className="w-full max-w-6xl mb-12">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200/60 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Productos Destacados</h2>
          <Link to="/productos" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Ver todos los productos
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl text-center max-w-xl mx-auto">
            <p className="font-semibold">{error}</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200/80 rounded-3xl p-6">
            <p className="text-slate-500 text-sm">No hay productos disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const imageUrl = product.images && product.images.length > 0 
                ? (typeof product.images[0] === "string" ? product.images[0] : (product.images[0] as any).url) 
                : null;
              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:scale-[1.01] hover:shadow-md transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    {/* Imagen */}
                    <div className="h-40 w-full bg-white relative flex items-center justify-center overflow-hidden">
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

                    {/* Contenido */}
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                        {product.category?.name || "General"}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 pt-0 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-base font-black text-slate-850">{formatPrice(product.price)}</span>
                    <Link
                      to={`/productos/${product.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Detalle
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;