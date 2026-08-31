import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { login as loginService, logout as logoutService, getProfile, register as registerService } from "../services/auth.service";
import type { User, Login, Register } from "../interfaces/auth.interface";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (credentials: Login) => Promise<void>;
  register: (payload: Register) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Intentar inicializar la sesión en el primer renderizado de la aplicación
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userProfile = await getProfile();
        setUser(userProfile);
      } catch (error) {
        // Si el token es inválido o el servidor está caído, limpiamos el estado del usuario
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Función para iniciar sesión
  const handleLogin = async (credentials: Login) => {
    // 1. Llama al servicio de autenticación que realiza la petición POST y guarda el token en localStorage
    await loginService(credentials);

    // 2. Si es exitoso, solicita el perfil del usuario recién logueado
    const userProfile = await getProfile();
    setUser(userProfile);
  };

  // Función para registrar un nuevo usuario
  const handleRegister = async (payload: Register) => {
    // 1. Registrar usuario y guardar token en localStorage
    await registerService(payload);

    // 2. Obtener el perfil del usuario
    const userProfile = await getProfile();
    setUser(userProfile);
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logoutService();
    } finally {
      // Garantizar que la sesión se limpia localmente pase lo que pase
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de autenticación de forma sencilla
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
