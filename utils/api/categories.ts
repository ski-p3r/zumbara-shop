// "use server";

import axiosInstance from "../axios";

export const getCategories = async (parent?: string) => {
  try {
    const endpoint = parent
      ? `/categories?parent=${parent}`
      : "/categories?root=true";
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const createCategory = async (categoryData: {
  name: string;
  path?: string;
  image: string;
}) => {
  try {
    const response = await axiosInstance.post("/categories", categoryData);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const updateCategory = async (
  categoryId: string,
  categoryData: {
    name: string;
    path: string;
    image: string;
  }
) => {
  try {
    const response = await axiosInstance.patch(
      `/categories/${categoryId}`,
      categoryData
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

export const deleteCategory = async (categoryId: string) => {
  try {
    const response = await axiosInstance.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const getCategory = async (categoryId: string) => {
  try {
    const response = await axiosInstance.get(`/categories/${categoryId}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};
