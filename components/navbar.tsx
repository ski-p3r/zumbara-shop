"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useLanguage } from "@/providers/language-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAllCookies, getUserFromCookie } from "@/utils/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const router = useRouter();

  // Function to fetch or refetch user data
  const refreshUser = async () => {
    try {
      const response = await getUserFromCookie();
      setUser(response);
      console.log("User data fetched:", response);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null); // Reset user on error
    }
  };

  // Expose refreshUser globally and fetch user on mount
  useEffect(() => {
    (window as any).refreshUser = refreshUser; // Expose function globally
    refreshUser(); // Initial fetch on component mount

    return () => {
      delete (window as any).refreshUser; // Cleanup on unmount
    };
  }, []);

  const languages = [
    { code: "en", name: t("lang.en") },
    { code: "ar", name: t("lang.ar") },
    { code: "am", name: t("lang.am") },
  ];

  const navItems = [
    { key: "nav.home", href: "/" },
    { key: "nav.shop", href: "/shop" },
    { key: "nav.about", href: "/about" },
    { key: "nav.contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="py-2">
        <div className="flex items-center justify-between px-8 gap-16 sm:px-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <img
                src="/images/icon.png"
                alt="Zumbara Logo"
                className="h-8 w-8"
              />
            </Link>
            <div className="text-2xl font-bold text-primary">
              <Link href="/">Zumbara</Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={language === lang.code ? "bg-accent" : ""}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>
                        {user.firstName[0] + user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"}>
                  {user && user.role === "MASTER_ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin/products")}
                    >
                      {t("nav.go_to_admin")}
                    </DropdownMenuItem>
                  )}
                  {user && user.role !== "CUSTOMER" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/order-manager")}
                    >
                      {t("nav.go_to_order_manager")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push("/my-orders")}>
                    {t("nav.myOrders")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await clearAllCookies();

                      setUser(null);
                      router.push("/");
                    }}
                  >
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("auth/login")}
              >
                <User className="h-4 w-4" />
                <span className="ml-2">{t("nav.login")}</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.key)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
