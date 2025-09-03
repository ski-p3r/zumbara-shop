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
