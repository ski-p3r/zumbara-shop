"use server";

import axiosInstance from "../axios";

export const canIReviewProduct = async (productId: string) => {
  try {
    const response = await axiosInstance.get(
      `/reviews/product/${productId}/purchased`
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
