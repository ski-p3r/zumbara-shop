"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated, useIsLoading } from "@/stores/user-store";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsLoading();

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate page
    if (!isLoading && isAuthenticated) {
      router.push("/"); // or '/admin' or '/dashboard' based on your app logic
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Only show auth pages if user is not authenticated
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // While redirecting, show loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
