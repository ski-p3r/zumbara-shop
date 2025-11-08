"use server";

import axiosInstance from "../axios";

// ✅ Get notifications (optionally filter read or unread)
export const getNotifications = async (read?: boolean) => {
  try {
    const params = read !== undefined ? { read } : {};
    const response = await axiosInstance.get("/notifications", { params });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

// ✅ Get notification by ID
export const getNotificationById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/notifications/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

// ✅ Mark single notification as read
export const markNotificationAsRead = async (id: string) => {
  try {
    const response = await axiosInstance.patch(`/notifications/${id}/read`, {
      read: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

// ✅ Delete notification
export const deleteNotification = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const haveUnreadNotifications = async () => {
  try {
    const response = await axiosInstance.get("/notifications/have-new");
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};
