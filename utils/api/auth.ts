import axios from "../axios";
import { setInCookies } from "../store";

export async function registerUser(params: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  language: string;
}) {
  try {
    const response = await axios.post("/auth/register/", params);
    const { accessToken, refreshToken, user } = response.data;
    console.log({ data: response.data });

    if (accessToken) {
      await setInCookies("token", accessToken);
    }
    if (refreshToken) {
      await setInCookies("refreshToken", refreshToken);
    }
    if (user) {
      console.log({ user });

      await setInCookies("user", JSON.stringify(user));
    }
    let cart = await axios.get("/cart/");
    if (
      !cart.data ||
      (Array.isArray(cart.data.items) && cart.data.items.length === 0)
    ) {
      // Create a new cart if none exists or if it's empty
      cart = await axios.post("/cart/", {});
    }
    if (cart.data) {
      await setInCookies("cart", cart.data.id);
    }
    console.log({ cart: cart.data.id });
    return response;
  } catch (error) {
    // console.error("Error registering user:", error);
    throw error;
  }
}

export async function loginUser(params: { email: string; password: string }) {
  try {
    const response = await axios.post("/auth/login/", params);
    const { accessToken, refreshToken, user } = response.data;
    if (accessToken) {
      await setInCookies("token", accessToken);
    }
    if (refreshToken) {
      await setInCookies("refreshToken", refreshToken);
    }
    if (user) {
      await setInCookies("user", JSON.stringify(user));
    }
    let cart = await axios.get("/cart/");
    if (
      !cart.data ||
      (Array.isArray(cart.data.items) && cart.data.items.length === 0)
    ) {
      // Create a new cart if none exists or if it's empty
      cart = await axios.post("/cart/", {});
    }
    if (cart.data) {
      await setInCookies("cart", cart.data.id);
    }
    console.log({ cart: cart.data.id });
    return response;
  } catch (error) {
    // console.error("Error logging in user:", error);
    throw error;
  }
}

// Forgot password (send OTP)
export const forgotPassword = async (dto: { phone: string }) => {
  return axios.post("/auth/forgot-password", dto);
};

// Reset password (with OTP)
export const resetPassword = async (dto: {
  phone: string;
  otp: string;
  newPassword: string;
}) => {
  console.log("Resetting password with DTO:", dto);

  return axios.post("/auth/reset-password", dto);
};
