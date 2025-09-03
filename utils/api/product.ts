import axiosInstance from "../axios";

export interface GetProductsParams {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
}
export interface CreateProductPayload {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
}

export async function getProducts(params?: GetProductsParams) {
  try {
    const response = await axiosInstance.get("/products/", { params });
    return response;
  } catch (error) {
    throw error;
  }
}
 

export async function getProductById(productId: string) {
  try {
    const response = await axiosInstance.get(`/products/${productId}/`);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function canIReview(productId: string) {
  try {
    const response = await axiosInstance.get(`/review/${productId}/can-review`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
export async function createProduct(payload: CreateProductPayload) {
  try {
    const response = await axiosInstance.post("/products", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export interface PostReviewPayload {
  reviewText: string;
  rating: number;
}

export async function postReview(
  productId: string,
  payload: PostReviewPayload
) {
  try {
    const response = await axiosInstance.post(`/review/${productId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error posting review:", error);
    throw error;
  }
}
export interface EditProductPayload {
  name?: string;
  description?: string;
  categoryId?: string;
  basePrice?: number;
}

export async function editProduct(productId: string, payload: EditProductPayload) {
  try {
    const response = await axiosInstance.put(`/products/${productId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error editing product:", error);
    throw error;
  }
}