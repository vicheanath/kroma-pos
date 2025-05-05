"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"
import { settingsApi } from "@/lib/db"

type ThemeSettingsContextType = {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  isLoading: boolean
}

const ThemeSettingsContext = createContext<ThemeSettingsContextType>({
  theme: "system",
  setTheme: () => {},
  isLoading: true,
})

export function ThemeSettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const { theme: currentTheme, setTheme: setNextTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const appSettings = await settingsApi.getAppSettings()
        if (appSettings.theme && appSettings.theme !== currentTheme) {
          setNextTheme(appSettings.theme)
        }
      } catch (error) {
        console.error("Failed to load theme settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Only run on client-side
    if (typeof window !== "undefined") {
      loadThemeSettings()
    } else {
      setIsLoading(false)
    }
  }, [currentTheme, setNextTheme])

  const setTheme = async (newTheme: "light" | "dark" | "system") => {
    try {
      setNextTheme(newTheme)
      await settingsApi.updateTheme(newTheme)
    } catch (error) {
      console.error("Failed to update theme settings:", error)
      toast({
        title: "Settings Error",
        description: "Failed to save theme preference",
        variant: "destructive",
      })
    }
  }

  return (
    <ThemeSettingsContext.Provider
      value={{
        theme: (currentTheme as "light" | "dark" | "system") || "system",
        setTheme,
        isLoading,
      }}
    >
      {children}
    </ThemeSettingsContext.Provider>
  )
}

export const useThemeSettings = () => useContext(ThemeSettingsContext)
