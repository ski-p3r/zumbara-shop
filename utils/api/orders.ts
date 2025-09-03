import axiosInstance from "../axios";

export async function getOrders(params?: {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get("/order/my", {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getOrderDetail(orderId: string) {
  try {
    const response = await axiosInstance.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
