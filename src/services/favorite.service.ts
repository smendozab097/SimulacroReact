import apiClient from "./apiClient";
import { AppError } from "../utils/appError";
import type { Product } from "../interfaces/product.interface";

/**
 * Listar los productos favoritos del usuario autenticado (requiere JWT)
 */
export async function getAllFavorites(): Promise<Product[]> {
  try {
    const response = await apiClient.get<Product[]>("/favorites");
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Agregar un producto a favoritos (requiere JWT)
 */
export async function addFavorite(productId: string): Promise<void> {
  try {
    await apiClient.post(`/favorites/${productId}`);
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Quitar un producto de favoritos (requiere JWT)
 */
export async function removeFavorite(productId: string): Promise<void> {
  try {
    await apiClient.delete(`/favorites/${productId}`);
  } catch (error) {
    throw new AppError(error);
  }
}
