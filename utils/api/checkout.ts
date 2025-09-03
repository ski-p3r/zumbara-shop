import axios from "../axios";

export async function createOrder(cartId: string, paymentMethod: string) {
  try {
    const response = await axios.post("/order/", { cartId, paymentMethod });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getOrder() {
  try {
    const response = await axios.get(`/order/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getOrderById(orderId: string) {
  try {
    const response = await axios.get(`/order/${orderId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function chapaPayOrder(orderId: string) {
  try {
    const response = await axios.post("/payment/initialize/chapa/", {
      orderId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function onDeliveryPayOrder(orderId: string) {
  try {
    const response = await axios.post("/payment/initialize/on-delivery/", {
      orderId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function checkPaymentStatus(invoiceNumber: string) {
  try {
    const response = await axios.get(`/payment/verify/chapa/${invoiceNumber}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function reInitializeChapa(invoiceNumber: string) {
  try {
    const response = await axios.get(
      `/payment/reinitialize/chapa/${invoiceNumber}/`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
