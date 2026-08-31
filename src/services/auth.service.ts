import apiClient from "./apiClient";
import { AppError } from "../utils/appError";
import type {
  Login,
  Register,
  Auth,
  User,
  ChangePassword,
} from "../interfaces/auth.interface";

/**
 * Registrar un nuevo usuario y obtener el token de acceso
 */
export async function register(data: Register): Promise<Auth> {
  try {
    const response = await apiClient.post<Auth>("/auth/register", data);
    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
    }
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Iniciar sesión y obtener el token de acceso
 */
export async function login(data: Login): Promise<Auth> {
  try {
    const response = await apiClient.post<Auth>("/auth/login", data);
    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
    }
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Cerrar sesión (notifica al servidor y limpia el token local)
 */
export async function logout(): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>("/auth/logout");
    return response.data;
  } catch (error) {
    throw new AppError(error);
  } finally {
    localStorage.removeItem("token");
  }
}

/**
 * Obtener el perfil del usuario autenticado
 */
export async function getProfile(): Promise<User> {
  try {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Cambiar la contraseña del usuario autenticado
 */
export async function changePassword(data: ChangePassword): Promise<{ message: string }> {
  try {
    const response = await apiClient.patch<{ message: string }>("/users/me/password", data);
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}
