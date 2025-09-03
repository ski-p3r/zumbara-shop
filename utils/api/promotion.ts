import axiosInstance from "../axios";
export interface CreatePromotionPayload {
  title: string;
  description: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  bannerUrl: string;
}


// Fetch active promotions (active=r)
export async function getPromotions(params?: { active?: string }) {
  try {
    const response = await axiosInstance.get("/promotion", {
      params: { active: "r", ...(params || {}) },
    });
    console.log("Fetched promotions:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}
export async function createPromotion(payload: CreatePromotionPayload) {
  try {
    const response = await axiosInstance.post("/promotion", payload);
    console.log("Promotion created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating promotion:", error);
    throw error;
  }
}
export async function getPromotionById(promotionId: string) {
  try {
    const response = await axiosInstance.get(`/promotion/${promotionId}`);
    console.log("Fetched promotion:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching promotion:", error);
    throw error;
  }
}
export async function updatePromotion(
  promotionId: string,
  payload: {
    title: string;
    description: string;
    startDate: string; // ISO 8601 format
    endDate: string;   // ISO 8601 format
    bannerUrl: string;
  }
) {
  try {
    const response = await axiosInstance.patch(`/promotion/${promotionId}`, payload);
    console.log("Promotion updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating promotion:", error);
    throw error;
  }
}