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
export interface CreateCategoryPayload {
  name: string;
  imageUrl: string;
  parentId?: string; // Optional parentId for subcategories
}

export async function createCategory(payload: CreateCategoryPayload) {
  try {
    const response = await axiosInstance.post("/category", payload);
    console.log("Category created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}
export async function deleteCategory(categoryId: string) {
  try {
    const response = await axiosInstance.delete(`/category/${categoryId}`);
    console.log("Category deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}