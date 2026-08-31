import apiClient from "./apiClient";
import { AppError } from "../utils/appError";
import type {
  Product,
  CreateProduct,
  UpdateProduct,
  ProductQuery,
  PaginatedProducts,
} from "../interfaces/product.interface";

/**
 * Listar productos con soporte de paginación, filtros y búsqueda de texto
 */
export async function getAllProducts(query?: ProductQuery): Promise<PaginatedProducts> {
  try {
    const response = await apiClient.get<PaginatedProducts>("/products", {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Obtener el detalle de un producto por ID
 */
export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Crear un nuevo producto (requiere JWT)
 */
export async function createProduct(data: CreateProduct): Promise<Product> {
  try {
    const response = await apiClient.post<Product>("/products", data);
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Actualizar un producto existente (requiere JWT)
 */
export async function updateProduct(id: string, data: UpdateProduct): Promise<Product> {
  try {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  } catch (error) {
    throw new AppError(error);
  }
}

/**
 * Eliminar un producto por ID (requiere JWT)
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    await apiClient.delete(`/products/${id}`);
  } catch (error) {
    throw new AppError(error);
  }
}
