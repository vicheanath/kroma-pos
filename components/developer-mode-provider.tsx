"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"

type DeveloperModeContextType = {
  isDeveloperMode: boolean
  toggleDeveloperMode: () => void
  generateMockData: (options: {
    products?: number
    sales?: number
    categories?: number
  }) => Promise<void>
  clearMockData: () => Promise<void>
  simulateSyncError: () => void
  simulateSyncSuccess: () => void
  simulateLicenseExpiration: () => void
  mockUsers: Array<{ id: string; name: string; email: string; role: string }>
  currentMockUser: { id: string; name: string; email: string; role: string } | null
  setCurrentMockUser: (user: { id: string; name: string; email: string; role: string } | null) => void
}

const DeveloperModeContext = createContext<DeveloperModeContextType>({
  isDeveloperMode: false,
  toggleDeveloperMode: () => {},
  generateMockData: async () => {},
  clearMockData: async () => {},
  simulateSyncError: () => {},
  simulateSyncSuccess: () => {},
  simulateLicenseExpiration: () => {},
  mockUsers: [],
  currentMockUser: null,
  setCurrentMockUser: () => {},
})

// Mock users for testing
const MOCK_USERS = [
  { id: "user1", name: "Admin User", email: "admin@example.com", role: "admin" },
  { id: "user2", name: "Manager User", email: "manager@example.com", role: "manager" },
  { id: "user3", name: "Cashier User", email: "cashier@example.com", role: "cashier" },
]

export function DeveloperModeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false)
  const [currentMockUser, setCurrentMockUser] = useState<{
    id: string
    name: string
    email: string
    role: string
  } | null>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Initialize state from localStorage only once on mount
  useEffect(() => {
    const devMode = searchParams?.get("devMode") === "true" || localStorage.getItem("devMode") === "true"
    setIsDeveloperMode(devMode)

    // Load saved mock user
    if (devMode) {
      const savedUser = localStorage.getItem("mockUser")
      if (savedUser) {
        try {
          setCurrentMockUser(JSON.parse(savedUser))
        } catch (e) {
          console.error("Failed to parse saved mock user", e)
        }
      }
    }
  }, [searchParams])

  // Save current mock user to localStorage when it changes
  useEffect(() => {
    if (currentMockUser) {
      localStorage.setItem("mockUser", JSON.stringify(currentMockUser))
    } else {
      localStorage.removeItem("mockUser")
    }
  }, [currentMockUser])

  // Memoize functions to prevent unnecessary re-renders
  const generateMockData = useCallback(
    async (options: { products?: number; sales?: number; categories?: number }) => {
      if (!isDeveloperMode) return

      const { products = 10, sales = 20, categories = 5 } = options

      toast({
        title: "Generating Mock Data",
        description: `Creating ${categories} categories, ${products} products, and ${sales} sales records.`,
      })

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Mock Data Generated",
        description: "Test data has been added to the database.",
      })
    },
    [isDeveloperMode, toast],
  )

  const clearMockData = useCallback(async () => {
    if (!isDeveloperMode) return

    toast({
      title: "Clearing Mock Data",
      description: "Removing all test data from the database.",
    })

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Mock Data Cleared",
      description: "All test data has been removed.",
    })
  }, [isDeveloperMode, toast])

  const simulateSyncError = useCallback(() => {
    if (!isDeveloperMode) return

    toast({
      title: "Sync Error",
      description: "Simulated sync error has occurred.",
      variant: "destructive",
    })
  }, [isDeveloperMode, toast])

  const simulateSyncSuccess = useCallback(() => {
    if (!isDeveloperMode) return

    toast({
      title: "Sync Complete",
      description: "Simulated sync completed successfully.",
    })
  }, [isDeveloperMode, toast])

  const simulateLicenseExpiration = useCallback(() => {
    if (!isDeveloperMode) return

    toast({
      title: "License Expired",
      description: "Your license has expired. Please renew to continue using all features.",
      variant: "destructive",
    })
  }, [isDeveloperMode, toast])

  const toggleDeveloperMode = useCallback(() => {
    setIsDeveloperMode((prev) => {
      const newValue = !prev
      // Update localStorage based on the new value
      if (newValue) {
        localStorage.setItem("devMode", "true")
      } else {
        localStorage.removeItem("devMode")
        setCurrentMockUser(null)
        localStorage.removeItem("mockUser")
      }

      // Show toast based on the new value
      toast({
        title: newValue ? "Developer Mode Enabled" : "Developer Mode Disabled",
        description: newValue
          ? "Developer tools and testing features are now available."
          : "The application is now in production mode.",
      })

      return newValue
    })
  }, [toast])

  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = {
    isDeveloperMode,
    toggleDeveloperMode,
    generateMockData,
    clearMockData,
    simulateSyncError,
    simulateSyncSuccess,
    simulateLicenseExpiration,
    mockUsers: MOCK_USERS,
    currentMockUser,
    setCurrentMockUser,
  }

  return <DeveloperModeContext.Provider value={contextValue}>{children}</DeveloperModeContext.Provider>
}

export const useDeveloperMode = () => useContext(DeveloperModeContext)
