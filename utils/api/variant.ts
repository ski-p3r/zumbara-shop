import axiosInstance from "../axios";

export interface AddVariantPayload {
  productId: string;
  variantName: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  imageUrl: string;
}
export type UpdateProductVariantDto = Partial<AddVariantPayload>;
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
 export async function updateVariants(id: string,payload: UpdateProductVariantDto) {
  try {
    const response = await axiosInstance.put(`/product-variants/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating variants:", error);
    throw error;
  }
 }
export async function deleteProductVariant  (id: string)  {
  try{
  const response = await axiosInstance.delete(`/product-variants/${id}`);
  return response.data;
  } catch (error) {
    console.error("Error deleting variant:", error);
    throw error;
  }
};


