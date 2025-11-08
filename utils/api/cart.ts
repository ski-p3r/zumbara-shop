"use server";

import axiosInstance from "../axios";
import { getFromCookies } from "../store";

export const addToCart = async ({
  productId,
  variantId,
  quantity = 1,
}: {
  productId: string;
  variantId?: string;
  quantity?: number;
}) => {
  try {
    const payload: any = { productId, quantity };
    if (variantId) payload.variantId = variantId;

    const response = await axiosInstance.post("/cart", payload);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const getCart = async () => {
  const cartId = await getFromCookies("cartId");
  let url = "/cart";
  if (cartId) url += `?cartId=${cartId}`;

  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const incrementCartItem = async (itemId: string, quantity: number) => {
  const cartId = await getFromCookies("cartId");
  let url = `/cart/${itemId}`;
  if (cartId) {
    url += `?cartId=${cartId}`;
  }

  await axiosInstance.patch(url, {
    quantity: quantity + 1,
  });
};

export const decrementCartItem = async (itemId: string, quantity: number) => {
  const cartId = await getFromCookies("cartId");
  const newQty = quantity - 1;

  // If qty reaches 0 → Delete item
  if (newQty <= 0) {
    await deleteCartItem(itemId);
    return;
  }
  let url = `/cart/${itemId}`;
  if (cartId) {
    url += `?cartId=${cartId}`;
  }

  await axiosInstance.patch(url, {
    quantity: newQty,
  });
};

export const deleteCartItem = async (itemId: string) => {
  const cartId = await getFromCookies("cartId");
  let url = `/cart/${itemId}`;
  if (cartId) {
    url += `?cartId=${cartId}`;
  }
  await axiosInstance.delete(url);
};
