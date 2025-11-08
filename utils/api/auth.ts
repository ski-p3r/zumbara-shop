// "use server";
import axiosInstance from "../axios";
import { setInCookies } from "../store";

export const Login = async (data: { phone: string; password: string }) => {
  try {
    const response = await axiosInstance.post("/auth/login", data);
    const accessToken = response.data.accessToken;
    const refreshToken = response.data.refreshToken;
    await setInCookies("accessToken", accessToken);
    await setInCookies("refreshToken", refreshToken);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const RequestOtp = async (data: { phone: string }) => {
  try {
    const response = await axiosInstance.post("/auth/request-otp", data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const VerifyOtp = async (data: { phone: string; code: string }) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otp", data);

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Verification failed" };
  }
};

export const Register = async (data: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  expoPushToken?: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/register", data);
    const accessToken = response.data.accessToken;
    const refreshToken = response.data.refreshToken;
    await setInCookies("accessToken", accessToken);
    await setInCookies("refreshToken", refreshToken);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const ForgotPassword = async (data: { phone: string }) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

export const ResetPassword = async (data: {
  phone: string;
  code: string;
  newPassword: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.details?.message ||
      error?.response?.data?.message ||
      "Failed to reset password.";
    throw new Error(message);
  }
};
