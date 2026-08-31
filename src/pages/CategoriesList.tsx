import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/authContext";
import { getAllCategories } from "../services/category.service";
import type { Category } from "../interfaces/category.interface";

const CategoriesList = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (err: any) {
        console.error("Error loading categories:", err);
        setErrorMsg(err.friendlyMessage || "No se pudieron cargar las categorías.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Categorías</h1>
          <p className="text-slate-500 mt-1 leading-relaxed">
            Explora nuestros productos filtrados por sus respectivas categorías.
          </p>
        </div>
        {/* Botón visible solo para Administradores */}
        {user?.role === "admin" && (
          <Link
            to="/categorias/nuevo"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl tracking-wide transition-all shadow-md shadow-blue-600/10 hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Crear Categoría
          </Link>
        )}
      </div>

      {/* Renderizado de error */}
      {errorMsg && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-red-700 text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Renderizado de Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : categories.length === 0 ? (
        // Estado lista vacía
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-bold text-slate-800">No hay categorías</h3>
          <p className="text-slate-500 text-sm mt-1">Aún no se han creado categorías en la base de datos.</p>
        </div>
      ) : (
        // Rejilla de categorías
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categorias/${category.id}`}
              className="group bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-500 text-sm mt-2 line-clamp-3 leading-relaxed">
                  {category.description || "Sin descripción disponible."}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm mt-5 group-hover:translate-x-1 transition-transform">
                <span>Ver productos</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
