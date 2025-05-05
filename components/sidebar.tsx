"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/discounts", label: "Discounts", icon: Percent },
  { href: "/receipt-designer", label: "Receipt Designer", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/data-export", label: "Data Export", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", newState.toString());
      return newState;
    });
  };

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  return (
    <motion.div
      animate={{ width: isCollapsed ? 60 : 240 }}
      className="fixed inset-y-0 left-0 z-10 flex h-full flex-col bg-gray-800 text-white transition-all"
    >
      <div className="flex items-center justify-between p-4">
        <span className={cn("text-lg font-bold", isCollapsed && "hidden")}>
          POS System
        </span>
        <button onClick={toggleSidebar} aria-label="Toggle Sidebar">
          {isCollapsed ? (
            <Menu className="h-6 w-6" />
          ) : (
            <X className="h-6 w-6" />
          )}
        </button>
      </div>
      <nav className="flex flex-col gap-2 p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 p-2 rounded hover:bg-gray-700",
              isCollapsed && "justify-center"
            )}
          >
            <Icon className="h-5 w-5" />
            {!isCollapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
