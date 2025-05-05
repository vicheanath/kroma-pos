"use client";
import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      <Sidebar
        onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)}
      />
      <main
        className={cn(
          "transition-all duration-300 p-4 md:p-8",
          isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
        )}
      >
        {children}
      </main>
    </>
  );
}
