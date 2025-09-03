import axiosInstance from "../axios";
import { getFromCookies } from "../store";

export async function getCart() {
  try {
    const response = await axiosInstance.get("/cart/");
    console.log("Get cart response:", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function addItemToCart(
  productId: string,
  variantId: string,
  quantity: number
) {
  try {
    const cartId = await getFromCookies("cart");
    if (!cartId) {
      throw new Error("No cart ID found");
    }
    const token = await getFromCookies("token");
    const payload = {
      productId,
      variantId,
      quantity,
    };
    const response = await axiosInstance.post(`/cart/${cartId}/`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    console.log("Add to cart response:", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    const cartId = await getFromCookies("cart");
    if (!cartId) {
      throw new Error("No cart ID found");
    }
    const response = await axiosInstance.put(`/cart/${cartId}/${itemId}/`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function removeItemFromCart(itemId: string) {
  try {
    const cartId = await getFromCookies("cart");
    if (!cartId) {
      throw new Error("No cart ID found");
    }
    const response = await axiosInstance.delete(`/cart/${cartId}/${itemId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
