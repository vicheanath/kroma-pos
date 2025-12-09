"use client";
import type React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSalesPage = pathname === "/sales";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {!isSalesPage && (
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center gap-2">
              {/* Header content can go here */}
            </div>
          </header>
        )}
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden min-w-0",
            isSalesPage ? "h-full" : "gap-4 p-4 md:p-8"
          )}
        >
          <div className="w-full overflow-hidden min-w-0 h-full">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
