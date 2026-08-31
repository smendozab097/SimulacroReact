import apiClient from "./apiClient";
import { AppError } from "../utils/appError";
import type {
  Category,
  CreateCategory,
  UpdateCategory,
} from "../interfaces/category.interface";

/**
 * Listar todas las categorías (público)
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Obtener una categoría por ID (público)
 */
export async function getCategoryById(id: string): Promise<Category> {
  try {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Crear una categoría (requiere JWT y rol admin)
 */
export async function createCategory(data: CreateCategory): Promise<Category> {
  try {
    const response = await apiClient.post<Category>("/categories", data);
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Actualizar una categoría (requiere JWT y rol admin)
 */
export async function updateCategory(id: string, data: UpdateCategory): Promise<Category> {
  try {
    const response = await apiClient.patch<Category>(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Eliminar una categoría (requiere JWT y rol admin)
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    await apiClient.delete(`/categories/${id}`);
  } catch (error) {
    throw new AppError(error);
  }
}
