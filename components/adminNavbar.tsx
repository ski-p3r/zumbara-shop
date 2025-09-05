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
import { getUserFromCookie, clearAllCookies } from "@/utils/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
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
      setUser(null);
    }
  };

  // Expose refreshUser globally and fetch user on mount
  useEffect(() => {
    (window as any).refreshUser = refreshUser;
    refreshUser();

    return () => {
      delete (window as any).refreshUser;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await clearAllCookies();
      setUser(null);
      router.push("/");
      toast.success(t("nav.logoutSuccess"));
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error(t("nav.logoutError"));
    }
  };

  const languages = [
    { code: "en", name: t("lang.en") },
    { code: "ar", name: t("lang.ar") },
    { code: "am", name: t("lang.am") },
  ];

  const navItems = [
    { key: "nav.products", href: "/admin/products" },
    { key: "nav.promotions", href: "/admin/promotions" },
    { key: "nav.categories", href: "/admin/categories" },
    { key: "nav.orders", href: "/admin/orders" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="py-3">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 gap-4 sm:gap-8 md:gap-12 lg:gap-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/">
              <img
                src="/images/icon.png"
                alt="Zumbara Logo"
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
            </Link>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              <Link href="/">Zumbara</Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="min-w-[120px]">
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
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="min-w-[120px]">
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
                <DropdownMenuContent align={isRTL ? "start" : "end"} className="min-w-[120px]">
                  <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/auth/login")}
                className="flex items-center"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="ml-2 hidden sm:inline">{t("nav.login")}</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden relative w-10 h-10 flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              <div className="relative w-6 h-6">
                <Menu
                  className={`h-6 w-6 absolute transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                  }`}
                />
                <X
                  className={`h-6 w-6 absolute transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t py-4 px-4 sm:px-6">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}