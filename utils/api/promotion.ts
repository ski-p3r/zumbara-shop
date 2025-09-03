import axiosInstance from "../axios";

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
