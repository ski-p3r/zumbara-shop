"use server";

import axiosInstance from "../axios";

/* -------------------------------------------------------------------------- */
/*                               PRODUCT APIs                                 */
/* -------------------------------------------------------------------------- */

/**
 * GET /products
 */
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
  variant, // "first" | "latest" | undefined
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
  variant?: any;
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
    if (variant) params.append("variant", variant);

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

/**
 * GET /products/:id
 */
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

/**
 * POST /products
 */
export const createProduct = async (formData: {
  name: string;
  description?: string;
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

/**
 * PATCH /products/:id
 */
export const updateProduct = async (
  id: string,
  formData: Partial<{
    name: string;
    description?: string;
    image: string;
    categorySlug: string;
    price: number;
    stock: number;
  }>
) => {
  try {
    const response = await axiosInstance.patch(`/products/${id}`, formData);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

/**
 * DELETE /products/:id
 */
export const deleteProduct = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

/* -------------------------------------------------------------------------- */
/*                               VARIANT APIs                                 */
/* -------------------------------------------------------------------------- */

/**
 * POST /products/:productId/variants
 */
export const createVariant = async (
  productId: string,
  formData: {
    name: string;
    price: number;
    stock: number;
    image: string;
  }
) => {
  try {
    const response = await axiosInstance.post(
      `/products/${productId}/variants`,
      formData
    );
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

/**
 * PATCH /variants/:variantId
 */
export const updateVariant = async (
  variantId: string,
  formData: Partial<{
    name: string;
    price: number;
    stock: number;
    image: string;
  }>
) => {
  try {
    const response = await axiosInstance.patch(
      `/variants/${variantId}`,
      formData
    );
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

/**
 * DELETE /variants/:variantId
 */
export const deleteVariant = async (variantId: string) => {
  try {
    const response = await axiosInstance.delete(`/variants/${variantId}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

/**
 * DELETE /products/:productId/variants
 */
export const deleteVariantsByProduct = async (productId: string) => {
  try {
    const response = await axiosInstance.delete(
      `/products/${productId}/variants`
    );
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};