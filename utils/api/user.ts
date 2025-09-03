import axios from "../axios";
import { setInCookies } from "../store";

// Get user profile (requires auth)
export const getTheUser = async () => {
  const response = await axios.get("/auth/profile");
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
  return response;
};

// Change password (requires auth)
export const changePassword = async (dto: {
  oldPassword: string;
  newPassword: string;
}) => {
  return axios.post("/auth/change-password", dto);
};

// Update profile (requires auth)
export type UpdateProfileDto = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  address?: string;
  language?: string;
  profileImage?: string;
};

export const updateProfile = async (dto: UpdateProfileDto) => {
  const response = await axios.put("/auth/update-profile", dto);
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
  return response;
};
