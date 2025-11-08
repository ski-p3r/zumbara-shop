// "use server";

import axiosInstance from "../axios";

export interface Promotion {
  id: string;
  title: string;
  image: string;
  description?: string;
  startedAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface CreatePromotionData {
  title: string;
  image: string;
  description?: string;
  startedAt: string;
  expiresAt: string;
}

export interface UpdatePromotionData {
  title?: string;
  image?: string;
  description?: string;
  startedAt?: string;
  expiresAt?: string;
}

export interface PromotionQuery {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "startedAt" | "expiresAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  active?: string;
  page?: number;
  limit?: number;
}

// ✅ GET ALL PROMOTIONS
export const getPromotions = async (query?: PromotionQuery) => {
  try {
    // Convert page/limit to string if they exist, since NestJS DTO expects string values
    const params: any = {};

    if (query?.search) params.search = query.search;
    if (query?.dateFrom) params.dateFrom = query.dateFrom;
    if (query?.dateTo) params.dateTo = query.dateTo;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    if (query?.active) params.active = query.active;
    // if (query?.page) params.page = query.page.toString();
    // if (query?.limit) params.limit = query.limit.toString();

    const response = await axiosInstance.get("/promotions", { params });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch promotions";
    throw new Error(message);
  }
};

// ✅ GET SINGLE PROMOTION
export const getPromotion = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/promotions/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch promotion";
    throw new Error(message);
  }
};

// ✅ CREATE PROMOTION
export const createPromotion = async (data: CreatePromotionData) => {
  try {
    const response = await axiosInstance.post("/promotions", data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create promotion";
    throw new Error(message);
  }
};

// ✅ UPDATE PROMOTION
export const updatePromotion = async (
  id: string,
  data: UpdatePromotionData
) => {
  try {
    const response = await axiosInstance.patch(`/promotions/${id}`, data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update promotion";
    throw new Error(message);
  }
};

// ✅ DELETE PROMOTION
export const deletePromotion = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/promotions/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete promotion";
    throw new Error(message);
  }
};
