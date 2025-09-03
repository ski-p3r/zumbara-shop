import axiosInstance from "../axios";

export async function getCategories(parentId?: string) {
  try {
    const params = parentId ? { parentId } : undefined;
    const response = await axiosInstance.get("/category/", { params });
    return response;
  } catch (error) {
    // console.error("Error fetching categories:", error);
    throw error;
  }
}
