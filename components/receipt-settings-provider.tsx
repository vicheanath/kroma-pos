"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { settingsApi, type ReceiptSettings, DEFAULT_RECEIPT_SETTINGS } from "@/lib/db"

type ReceiptSettingsContextType = {
  settings: ReceiptSettings
  updateSettings: (newSettings: Partial<ReceiptSettings>) => Promise<void>
  isLoading: boolean
}

const ReceiptSettingsContext = createContext<ReceiptSettingsContextType>({
  settings: DEFAULT_RECEIPT_SETTINGS,
  updateSettings: async () => {},
  isLoading: true,
})

export function ReceiptSettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<ReceiptSettings>(DEFAULT_RECEIPT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await settingsApi.getReceiptSettings()
        setSettings(storedSettings)
      } catch (error) {
        console.error("Failed to load receipt settings:", error)
        toast({
          title: "Settings Error",
          description: "Failed to load receipt settings. Using defaults.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  const updateSettings = async (newSettings: Partial<ReceiptSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      await settingsApi.saveReceiptSettings(updatedSettings)
      setSettings(updatedSettings)
      toast({
        title: "Settings Updated",
        description: "Receipt settings have been updated",
      })
    } catch (error) {
      console.error("Failed to update receipt settings:", error)
      toast({
        title: "Settings Error",
        description: "Failed to update receipt settings",
        variant: "destructive",
      })
    }
  }

  return (
    <ReceiptSettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </ReceiptSettingsContext.Provider>
  )
}

export const useReceiptSettings = () => useContext(ReceiptSettingsContext)
