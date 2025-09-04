import axiosInstance from "../axios";

export interface AddVariantPayload {
  productId: string;
  variantName: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  imageUrl: string;
}

export async function addVariant(payload: AddVariantPayload) {
  try {
    const response = await axiosInstance.post("/product-variants", payload);
    console.log("Variant added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding variant:", error);
    throw error;
  }
}
