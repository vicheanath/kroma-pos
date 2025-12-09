"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Home,
  ShoppingCart,
  Package,
  LayoutGrid,
  Percent,
  Receipt,
  BarChart3,
  ClipboardList,
  Settings,
  QrCode,
  Barcode,
  Warehouse,
  Users,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Role requirements for navigation items
const navMain: (NavItem & { roles?: string[] })[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  {
    href: "/inventory",
    label: "Inventory",
    icon: Warehouse,
    roles: ["admin", "manager"],
  },
  {
    href: "/employees",
    label: "Employees",
    icon: Users,
    roles: ["admin", "manager"],
  },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/discounts", label: "Discounts", icon: Percent },
];

const navTools: NavItem[] = [
  { href: "/barcode-designer", label: "Barcode Designer", icon: Barcode },
  { href: "/barcode-generator", label: "Barcode Generator", icon: QrCode },
  { href: "/receipt-designer", label: "Receipt Designer", icon: Receipt },
];

const navReports: (NavItem & { roles?: string[] })[] = [
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "manager", "cashier"],
  },
  {
    href: "/data-export",
    label: "Data Export",
    icon: ClipboardList,
    roles: ["admin"],
  },
];

function NavMain({ items }: { items: (NavItem & { roles?: string[] })[] }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role as string | undefined;

  // Filter items based on user role
  const filteredItems = items.filter((item) => {
    if (!item.roles) return true; // No role requirement
    if (!userRole) return false; // User not logged in
    return item.roles.includes(userRole);
  });

  return (
    <SidebarMenu>
      {filteredItems.map((item) => {
        const Icon = item.icon;
        // Check if pathname matches or starts with the href (for sub-routes)
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
              <Link href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function NavTools({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
              <Link href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function NavReports({ items }: { items: (NavItem & { roles?: string[] })[] }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role as string | undefined;

  // Filter items based on user role
  const filteredItems = items.filter((item) => {
    if (!item.roles) return true; // No role requirement
    if (!userRole) return false; // User not logged in
    return item.roles.includes(userRole);
  });

  if (filteredItems.length === 0) return null;

  return (
    <SidebarMenu>
      {filteredItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
              <Link href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { data: session } = useSession();
  const isSettingsActive = pathname === "/settings";
  const userRole = session?.user?.role as string | undefined;
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  // Check if user can access settings (admin or manager)
  const canAccessSettings = userRole === "admin" || userRole === "manager";

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Package className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">POS System</span>
                  <span className="truncate text-xs">Point of Sale</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={navMain} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavTools items={navTools} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavReports items={navReports} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {canAccessSettings && (
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                isActive={isSettingsActive}
                tooltip="Settings"
              >
                <Link href="/settings">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Settings className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {state === "collapsed" ? "Settings" : "System Settings"}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="font-semibold truncate w-full">
                      {userName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate w-full">
                      {userEmail}
                    </div>
                    {userRole && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {userRole}
                      </Badge>
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
