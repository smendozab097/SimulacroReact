import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/authContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // 1. Si la sesión se está cargando (verificación inicial), no redirigimos
  if (loading) {
    return null;
  }

  // 2. Si el usuario no ha iniciado sesión, redirigir a la pantalla de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si la ruta requiere roles específicos y el usuario no cuenta con ellos, redirigir al catálogo principal
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. Si está autenticado y tiene el rol autorizado, inyectar los componentes hijos de la ruta
  return <Outlet />;
};

export default ProtectedRoute;
