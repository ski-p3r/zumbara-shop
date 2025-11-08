import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUserProfile } from "@/utils/api/user";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  role: "CUSTOMER" | "ADMIN" | "ORDER_MANAGER" | "DELIVERY";
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      fetchUserProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const userData = await getUserProfile();
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message =
            error?.response?.data?.details?.message ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch profile";

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          });
        }
      },

      updateUserProfile: (updates) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Individual action selectors (recommended approach)
export const useSetUser = () => useUserStore((state) => state.setUser);
export const useClearUser = () => useUserStore((state) => state.clearUser);
export const useFetchUserProfile = () =>
  useUserStore((state) => state.fetchUserProfile);
export const useUpdateUserProfile = () =>
  useUserStore((state) => state.updateUserProfile);

// State selectors
export const useUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated);
export const useIsLoading = () => useUserStore((state) => state.isLoading);
export const useUserError = () => useUserStore((state) => state.error);

// Role-based selectors
export const useIsAdmin = () =>
  useUserStore((state) => state.user?.role === "ADMIN");
export const useIsCustomer = () =>
  useUserStore((state) => state.user?.role === "CUSTOMER");
export const useIsOrderManager = () =>
  useUserStore((state) => state.user?.role === "ORDER_MANAGER");
export const useIsDelivery = () =>
  useUserStore((state) => state.user?.role === "DELIVERY");

// User info selectors
export const useUserName = () =>
  useUserStore((state) =>
    state.user ? `${state.user.firstName} ${state.user.lastName}` : null
  );

export const useUserAvatar = () => useUserStore((state) => state.user?.image);

// Alternative: Memoized actions selector (if you really need all actions together)
import { useMemo } from "react";

export const useUserActions = () => {
  const setUser = useSetUser();
  const clearUser = useClearUser();
  const fetchUserProfile = useFetchUserProfile();
  const updateUserProfile = useUpdateUserProfile();

  return useMemo(
    () => ({
      setUser,
      clearUser,
      fetchUserProfile,
      updateUserProfile,
    }),
    [setUser, clearUser, fetchUserProfile, updateUserProfile]
  );
};
