import { Link, useNavigate } from "react-router"
import { useAuth } from "../context/authContext"

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await logout();
    navigate("/?logout=success");
  };

  return (
    <header className="h-15 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <nav className="h-full flex items-center max-w-6xl mx-auto px-4 md:px-8">
          <ul className="flex gap-6 text-slate-600 font-semibold text-base">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/productos" className="hover:text-blue-600 transition-colors">Productos</Link>
            <Link to="/categorias" className="hover:text-blue-600 transition-colors">Categorías</Link>
            {user && (
              <Link to="/favoritos" className="hover:text-blue-600 transition-colors">Favoritos</Link>
            )}
          </ul>
          
          <div className="ml-auto flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-600">
                  Hola, <span className="font-bold text-slate-800">{user.name}</span>
                  {user.role === "admin" && (
                    <span className="ml-1.5 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold border border-red-200">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogoutClick}
                  className="font-semibold text-base text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="font-semibold text-base text-slate-700 hover:text-blue-600 transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
    </header>
  )
}

export default Navbar