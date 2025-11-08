"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SquareTerminal,
  Bot,
  BookOpen,
  User,
  Folder,
  BadgePercent,
  PieChart,
  Settings2,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Users,
  Megaphone,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  useUser,
  useUserName,
  useUserAvatar,
  useUserActions,
  useIsAdmin,
  useClearUser,
} from "@/stores/user-store";

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = useUser();
  const isAdmin = useIsAdmin();

  // If user is not admin, don't render the sidebar
  if (!isAdmin) {
    return null;
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="data-[state=collapsed]:[&>*]:items-center"
      {...props}
    >
      <SidebarHeader>
        <BrandLogo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  BRAND LOGO                                 */
/* -------------------------------------------------------------------------- */
function BrandLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div
      className={`
        flex items-center gap-2
        ${
          isCollapsed ? "px-2" : "px-4"
        }   /* less horizontal padding when collapsed */
        py-3
      `}
    >
      {/* ---- ALWAYS VISIBLE LOGO ---- */}
      <div
        className={`bg-primary rounded-lg flex items-center justify-center ${
          isCollapsed ? "h-8 w-8" : "h-6 w-6"
        }`}
      >
        <span
          className={`font-bold ${
            isCollapsed ? "text-lg" : "text-sm"
          } text-white`}
        >
          Z
        </span>
      </div>

      {/* ---- TEXT ONLY WHEN EXPANDED ---- */}
      {!isCollapsed && (
        <span className="font-semibold text-lg tracking-tight">Zumbara</span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  NAV ITEMS                                  */
/* -------------------------------------------------------------------------- */
export const navItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: SquareTerminal,
  },
  {
    title: "Products",
    icon: Bot,
    items: [
      { title: "All Products", url: "/admin/products" },
      { title: "Add Product", url: "/admin/products/add" },
    ],
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: BookOpen,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Folder,
  },
  {
    title: "Promotions",
    url: "/admin/promotions",
    icon: Megaphone,
    items: [
      { title: "All Promotions", url: "/admin/promotions" },
      { title: "Add Promotion", url: "/admin/promotions/new" },
    ],
  },
];

import { ChevronDown } from "lucide-react";

function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Management</SidebarGroupLabel>

      <SidebarMenu>
        {navItems.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavItem({
  item,
}: {
  item: {
    title: string;
    url?: string;
    icon: any;
    items?: { title: string; url: string }[];
  };
}) {
  const hasChildren = item.items && item.items.length > 0;

  if (!hasChildren) {
    return (
      <SidebarMenuItem className="px-0 ">
        <SidebarMenuButton asChild>
          <Link href={item.url!}>
            <item.icon className="h-8 w-8" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible className="">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full">
            <item.icon className="" />
            <span>{item.title}</span>
            <ChevronDown className="ml-auto h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>

      <CollapsibleContent>
        <SidebarMenuSub className="ml-6 mt-1 space-y-0.5">
          {item.items!.map((sub) => (
            <SidebarMenuSubItem key={sub.title}>
              <SidebarMenuSubButton asChild>
                <Link href={sub.url}>
                  <span>{sub.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   USER MENU (Popover Design)               */
/* -------------------------------------------------------------------------- */
function NavUser() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const user = useUser();
  const userName = useUserName();
  const userAvatar = useUserAvatar();
  const clearUser = useClearUser();

  const handleLogout = () => {
    clearUser();
    window.location.href = "/";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          className={`
            flex items-center gap-2 w-full p-2
            ${isCollapsed ? "justify-center" : "justify-start"}
            hover:bg-accent/50 transition-colors rounded-md
          `}
        >
          {/* Avatar – always visible */}
          {userAvatar ? (
            <img
              src={userAvatar}
              width={32}
              height={32}
              alt={userName || "User"}
              className="rounded-full ring-2 ring-border"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-border">
              <span className="text-white text-sm font-medium">
                {user ? getInitials(user.firstName, user.lastName) : "U"}
              </span>
            </div>
          )}

          {/* User info – only when expanded */}
          {!isCollapsed && user && (
            <div className="flex flex-col text-left leading-tight">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs opacity-70 capitalize">
                {user.role.toLowerCase()}
              </span>
            </div>
          )}

          {/* Chevron – only when expanded */}
          {!isCollapsed && (
            <ChevronsUpDown className="ml-auto h-4 w-4 opacity-70" />
          )}
        </SidebarMenuButton>
      </PopoverTrigger>

      {/* Popover content – smart positioning */}
      <PopoverContent
        side={isCollapsed ? "right" : "top"}
        align={isCollapsed ? "start" : "end"}
        sideOffset={8}
        className="w-56 p-2"
      >
        <div className="flex items-center gap-3 p-2">
          {userAvatar ? (
            <img
              src={userAvatar}
              width={40}
              height={40}
              alt={userName || "User"}
              className="rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-medium">
                {user ? getInitials(user.firstName, user.lastName) : "U"}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role.toLowerCase()} • Zumbara
            </p>
          </div>
        </div>

        <div className="border-t my-2"></div>

        <div className="space-y-1">
          <Link
            href="/profile"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>

          <Link
            href="/settings"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </Link>

          <div className="border-t my-1"></div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-destructive/10 text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
