"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ComputerIcon as Desktop } from "lucide-react"

export function ElectronReadyIndicator() {
  const [isElectron, setIsElectron] = useState(false)

  useEffect(() => {
    // Check if running in Electron
    // In a real app, Electron would inject a userAgent or global variable
    const userAgent = navigator.userAgent.toLowerCase()
    setIsElectron(userAgent.indexOf(" electron/") > -1)
  }, [])

  if (!isElectron) return null

  return (
    <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <Desktop className="h-3 w-3 mr-1" />
      Desktop App
    </Badge>
  )
}
