// utils/api/analytics.ts
import axiosInstance from "../axios";

export const getDashboard = async () => {
  const res = await axiosInstance.get("/analytics/dashboard");
  return res.data;
};

export const getSales = async (from: string, to: string) => {
  const res = await axiosInstance.get(`/analytics/sales?from=${from}&to=${to}`);
  return res.data;
};

export const getOrderTrends = async (from: string, to: string) => {
  const res = await axiosInstance.get(
    `/analytics/orders/trends?from=${from}&to=${to}`
  );
  return res.data;
};

export const getPayments = async () => {
  const res = await axiosInstance.get("/analytics/payments");
  return res.data;
};

export const getDeliveries = async () => {
  const res = await axiosInstance.get("/analytics/deliveries");
  return res.data;
};
