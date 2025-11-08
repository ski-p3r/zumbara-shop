// "use server";

import { useSetUser } from "@/stores/user-store";
import axiosInstance from "../axios";
import { Role, UserSortField, SortOrder } from "../constants/users";

// Re-export for backward compatibility
export { Role, UserSortField, SortOrder };

// utils/api/users.ts
import { useUserStore } from "@/stores/user-store";

// ✅ GET CURRENT USER PROFILE (with direct store update)
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/users/me");
    const userData = response.data;

    // Update store directly using getState()
    useUserStore.getState().setUser(userData);

    return userData;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch profile";
    throw new Error(message);
  }
};

// ✅ UPDATE CURRENT USER PROFILE
export const updateUserProfile = async (data: {
  firstName?: string;
  lastName?: string;
  image?: string;
}) => {
  try {
    const response = await axiosInstance.patch("/users/me", data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update profile";
    throw new Error(message);
  }
};

// ✅ CHANGE PASSWORD
export const changeUserPassword = async (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await axiosInstance.patch("/users/change-password", data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to change password";
    throw new Error(message);
  }
};

// ✅ GET ALL USERS (Admin Only)
export const getAllUsers = async (query?: {
  role?: keyof typeof Role;
  otpVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
  dateFrom?: string;
  dateTo?: string;
}) => {
  try {
    const response = await axiosInstance.get("/users", { params: query });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch users";
    throw new Error(message);
  }
};

// ✅ CHANGE USER ROLE (Admin Only)
export const changeUserRole = async (data: {
  userId: string;
  role: keyof typeof Role;
}) => {
  try {
    const response = await axiosInstance.patch("/users/change-role", data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to change user role";
    throw new Error(message);
  }
};
