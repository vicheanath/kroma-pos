"use client";

import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { DatabaseInitializer } from "@/components/database-initializer";
import { PosDataProvider } from "@/components/pos-data-provider";
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DatabaseInitializer>
            <PosDataProvider>{children}</PosDataProvider>
            <Toaster />
          </DatabaseInitializer>
        </ThemeProvider>
        
      </body>
    </html>
  );
}
