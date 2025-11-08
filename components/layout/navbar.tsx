"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  Bell,
  Search,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useUser,
  useUserName,
  useUserAvatar,
  useClearUser, // Use individual selector
  useIsAuthenticated,
} from "@/stores/user-store";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useUser();
  const userName = useUserName();
  const userAvatar = useUserAvatar();
  const isAuthenticated = useIsAuthenticated();
  const clearUser = useClearUser(); // Use individual selector

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogout = () => {
    clearUser();
    window.location.href = "/";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <div className="cursor-pointer md:hidden">
                {open ? (
                  <X className="h-6 w-6 text-foreground" />
                ) : (
                  <Menu className="h-6 w-6 text-foreground" />
                )}
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <h2 className="text-lg font-semibold text-foreground">Menu</h2>
              </SheetHeader>
              <nav className="mt-6 flex flex-col space-y-4 text-sm font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                {/* Add authenticated user links to mobile menu */}
                {isAuthenticated && user && (
                  <>
                    <div className="border-t pt-4"></div>
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="hover:text-primary transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setOpen(false)}
                      className="hover:text-primary transition-colors"
                    >
                      Orders
                    </Link>
                    {user.role === "ADMIN" ||
                      (user.role === "ORDER_MANAGER" && (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="hover:text-primary transition-colors text-primary"
                        >
                          Admin Dashboard
                        </Link>
                      ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="text-left hover:text-primary transition-colors text-red-600"
                    >
                      Logout
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-primary"
          >
            Zumbara
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: Search + Icons */}
        <div className="flex items-center gap-4">
          {/* Icons */}
          <div className="flex items-center gap-3">
            <Sun
              onClick={() => setTheme("light")}
              className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer hidden dark:block"
            />
            <Moon
              onClick={() => setTheme("dark")}
              className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer block dark:hidden"
            />

            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              {/* <span className="absolute -top-1 -right-1 text-[10px] font-semibold bg-primary text-white px-1 rounded-full">
              3
            </span> */}
            </Link>

            <Link href="/notifications">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Link>

            {/* User */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-8 w-8">
                    <AvatarImage
                      src={userAvatar || ""}
                      alt={userName || "User"}
                    />
                    <AvatarFallback>
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{userName}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.role.toLowerCase()}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="text-blue-600">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/register"
                  className="hidden sm:block text-sm hover:underline"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="hidden sm:block text-sm hover:underline"
                >
                  Sign In
                </Link>
                <Link href="/login" className="sm:hidden">
                  <User className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
