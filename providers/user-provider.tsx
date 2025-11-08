"use client";

import { useEffect } from "react";
import { useFetchUserProfile, useIsLoading } from "@/stores/user-store"; // Use individual selector

export function UserProvider({ children }: { children: React.ReactNode }) {
  const fetchUserProfile = useFetchUserProfile(); // Use individual selector
  const isLoading = useIsLoading();

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
