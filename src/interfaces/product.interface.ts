import type { Category } from "./category.interface";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: Category;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProduct {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: string[];
}

export interface UpdateProduct {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  images?: string[];
}

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
