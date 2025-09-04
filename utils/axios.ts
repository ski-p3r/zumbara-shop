import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { clearAllCookies, getFromCookies, setInCookies } from "./store";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.0.22:8000/api/v1";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  withCredentials: false, // Not used in React Native
});

// Add Bearer token (if exists) to Authorization header
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getFromCookies("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      // console.error(`API Error ${status}:`, error.response.data);

      if (status === 401) {
        const refreshToken = await getFromCookies("refreshToken");
        if (refreshToken) {
          // Attempt to refresh the token
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh/`);
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

            // Retry the original request with the new token
            if (error.config && error.config.headers && accessToken) {
              error.config.headers.Authorization = `Bearer ${accessToken}`;
            }
            if (error.config) {
              return axiosInstance.request(error.config);
            }
            return Promise.reject(error);
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            await clearAllCookies();
            return Promise.reject(refreshError);
          }
        } else {
          await clearAllCookies();
        }
      }
    } else if (error.request) {
      console.error("No response from server:", error.request);
    } else {
      console.error("Axios request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
