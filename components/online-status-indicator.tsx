"use client"

import { useOnlineStatus } from "./online-status-provider"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function OnlineStatusIndicator() {
  const { isOnline } = useOnlineStatus()

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          isOnline
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3.5 w-3.5" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            <span>Offline</span>
          </>
        )}
      </div>
    </div>
  )
}
