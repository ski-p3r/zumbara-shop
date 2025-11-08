"use server";

import axiosInstance from "../axios";

export const getProducts = async ({
  search,
  categorySlug,
  minPrice,
  maxPrice,
  minRating,
  maxRating,
  sort = "NEWEST",
  page = 1,
  pageSize = 10,
  variant = true,
}: {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  sort?: "NEWEST" | "OLDEST" | "PRICE_ASC" | "PRICE_DESC";
  page?: number;
  pageSize?: number;
  variant?: boolean;
}) => {
  try {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (categorySlug) params.append("categorySlug", categorySlug);
    if (minPrice !== undefined) params.append("minPrice", String(minPrice));
    if (maxPrice !== undefined) params.append("maxPrice", String(maxPrice));
    if (minRating !== undefined) params.append("minRating", String(minRating));
    if (maxRating !== undefined) params.append("maxRating", String(maxRating));
    if (sort) params.append("sort", sort);
    if (page) params.append("page", String(page));
    if (pageSize) params.append("pageSize", String(pageSize));
    if (variant !== undefined) params.append("variant", String(variant));

    const response = await axiosInstance.get(`/products?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching products:",
      error?.response?.data || error.message
    );
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const getProductById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const createProduct = async (formData: {
  name: string;
  description: string;
  image: string;
  categorySlug: string;
  price: number;
  stock: number;
}) => {
  try {
    const response = await axiosInstance.post("/products", formData);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};
