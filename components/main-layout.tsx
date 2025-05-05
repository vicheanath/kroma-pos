"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { usePosData } from "./pos-data-provider"
import { useSubscription } from "./subscription-provider"
import { useLicense } from "./license-provider"
import { Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { StoreSelector } from "./store-selector"
import { mockApi } from "@/lib/mock-api"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { syncToCloud } = usePosData()
  const { canUseEnterpriseFeatures, addSyncRecord, stores } = useSubscription()
  const { licenseInfo, licenseStatus } = useLicense()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsMounted(true)

    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSync = async () => {
    if (!canUseEnterpriseFeatures) {
      addSyncRecord("failed", "Cloud sync is an Enterprise feature")
      return
    }

    if (!isOnline) {
      addSyncRecord("failed", "Cannot sync while offline")
      return
    }

    setIsSyncing(true)
    try {
      // Call the mock API for cloud sync
      if (licenseInfo) {
        const syncData = { products: true, sales: true, categories: true }
        const response = await mockApi.syncToCloud(licenseInfo.licenseKey, syncData)

        if (response.success) {
          await syncToCloud()
          addSyncRecord("success", "Data successfully synced to cloud")
        } else {
          addSyncRecord("failed", response.error || "Failed to sync data to cloud")
        }
      } else {
        addSyncRecord("failed", "No valid license found")
      }
    } catch (error) {
      addSyncRecord("failed", "Failed to sync data to cloud")
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {pathname === "/dashboard" && "Dashboard"}
              {pathname === "/sales" && "Sales"}
              {pathname === "/products" && "Products"}
              {pathname === "/categories" && "Categories"}
              {pathname === "/reports" && "Reports"}
              {pathname === "/settings" && "Settings"}
              {pathname === "/settings/subscription" && "Subscription"}
            </h1>
            {stores.length > 1 && <StoreSelector />}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Wifi className="h-3.5 w-3.5" />
                  <span>Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Offline</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing || !canUseEnterpriseFeatures || !isOnline || licenseStatus !== "valid"}
              className="relative"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  {(!canUseEnterpriseFeatures || licenseStatus !== "valid") && (
                    <AlertCircle className="w-3 h-3 absolute -top-1 -right-1 text-amber-500" />
                  )}
                  Sync to Cloud
                </>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
