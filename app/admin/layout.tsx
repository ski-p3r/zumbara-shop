"use client";

import { usePathname } from "next/navigation";
import { navItems } from "@/components/admin/admin-sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  useIsAuthenticated,
  useIsAdmin,
  useIsLoading,
  useUser,
} from "@/stores/user-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function getBreadcrumb(pathname: string) {
  for (const item of navItems) {
    // Direct match for top-level nav items (Dashboard, Orders, Settings…)
    if (item.url && item.url === pathname) {
      return { main: item.title, sub: "" };
    }

    // Match nested items (Products → All Products / Add Product)
    if (item.items) {
      // Match child
      const child = item.items.find((c: any) => c.url === pathname);
      if (child) return { main: item.title, sub: child.title };

      // If visiting parent route (e.g. /admin/products), show first item as default (All Products)
      const base = pathname.replace(/\/+$/, "");
      const parentBase = item.items[0]?.url?.split("/").slice(0, -1).join("/");
      if (base === parentBase) {
        return { main: item.title, sub: item.items[0].title };
      }
    }
  }

  return { main: "Dashboard", sub: "" };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { main, sub } = getBreadcrumb(pathname);
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const isLoading = useIsLoading();
  const user = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      } else if (!isAdmin) {
        // Redirect to unauthorized page if not admin
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            {!isAuthenticated
              ? "Please log in to access the admin panel."
              : "You don't have permission to access the admin panel."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{main}</BreadcrumbLink>
                </BreadcrumbItem>

                {sub && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{sub}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
