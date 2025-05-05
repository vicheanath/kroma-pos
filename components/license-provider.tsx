"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { mockApi, type LicenseInfo, type LicenseStatus, generateDeviceId } from "@/lib/mock-api"
import { useToast } from "@/components/ui/use-toast"

type LicenseContextType = {
  licenseInfo: LicenseInfo | null
  licenseStatus: LicenseStatus | "checking" | "unknown"
  licenseKey: string
  setLicenseKey: (key: string) => void
  isLoading: boolean
  error: string | null
  checkLicense: () => Promise<boolean>
  activateLicense: (key: string) => Promise<boolean>
  deactivateLicense: () => Promise<boolean>
  upgradePlan: (plan: "free" | "pro" | "enterprise") => Promise<boolean>
  isFeatureEnabled: (feature: string) => boolean
}

const LicenseContext = createContext<LicenseContextType>({
  licenseInfo: null,
  licenseStatus: "unknown",
  licenseKey: "",
  setLicenseKey: () => {},
  isLoading: false,
  error: null,
  checkLicense: async () => false,
  activateLicense: async () => false,
  deactivateLicense: async () => false,
  upgradePlan: async () => false,
  isFeatureEnabled: () => false,
})

// Default license key (free plan)
const DEFAULT_LICENSE_KEY = "FREE-0000-0000-0000"

export function LicenseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null)
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | "checking" | "unknown">("checking")
  const [licenseKey, setLicenseKey] = useState<string>(() => {
    // Try to get license key from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("pos_license_key") || DEFAULT_LICENSE_KEY
    }
    return DEFAULT_LICENSE_KEY
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Check license on startup
  useEffect(() => {
    const checkLicenseOnStartup = async () => {
      setIsLoading(true)
      setLicenseStatus("checking")

      try {
        const storedKey = localStorage.getItem("pos_license_key") || DEFAULT_LICENSE_KEY
        setLicenseKey(storedKey)

        const response = await mockApi.verifyLicense(storedKey)

        if (response.success && response.data) {
          setLicenseInfo(response.data)
          setLicenseStatus(response.data.status)
          setError(null)

          // Show toast for trial or expired license
          if (response.data.status === "trial") {
            toast({
              title: "Trial License",
              description: `You have ${response.data.trialDaysLeft} days left in your trial.`,
              variant: "default",
            })
          } else if (response.data.status === "expired") {
            toast({
              title: "License Expired",
              description: "Your license has expired. Please renew to continue using all features.",
              variant: "destructive",
            })
          }
        } else {
          setLicenseInfo(null)
          setLicenseStatus("invalid")
          setError(response.error || "Failed to verify license")
          toast({
            title: "License Error",
            description: response.error || "Failed to verify license",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("License check error:", err)
        setLicenseInfo(null)
        setLicenseStatus("unknown")
        setError("Network error while checking license")
        toast({
          title: "Network Error",
          description: "Failed to connect to license server. Working in offline mode.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkLicenseOnStartup()
  }, [toast])

  // Check license manually
  const checkLicense = async (): Promise<boolean> => {
    setIsLoading(true)
    setLicenseStatus("checking")

    try {
      const response = await mockApi.verifyLicense(licenseKey)

      if (response.success && response.data) {
        setLicenseInfo(response.data)
        setLicenseStatus(response.data.status)
        setError(null)
        toast({
          title: "License Verified",
          description: `Your ${response.data.plan.toUpperCase()} license is valid.`,
        })
        return true
      } else {
        setLicenseInfo(null)
        setLicenseStatus("invalid")
        setError(response.error || "Failed to verify license")
        toast({
          title: "License Error",
          description: response.error || "Failed to verify license",
          variant: "destructive",
        })
        return false
      }
    } catch (err) {
      console.error("License check error:", err)
      setLicenseInfo(null)
      setLicenseStatus("unknown")
      setError("Network error while checking license")
      toast({
        title: "Network Error",
        description: "Failed to connect to license server",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Activate license
  const activateLicense = async (key: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const deviceId = generateDeviceId()
      const response = await mockApi.activateLicense(key, deviceId)

      if (response.success && response.data) {
        setLicenseKey(key)
        setLicenseInfo(response.data)
        setLicenseStatus(response.data.status)
        setError(null)

        // Save license key to localStorage
        localStorage.setItem("pos_license_key", key)

        toast({
          title: "License Activated",
          description: `Your ${response.data.plan.toUpperCase()} license has been activated.`,
        })
        return true
      } else {
        setError(response.error || "Failed to activate license")
        toast({
          title: "Activation Error",
          description: response.error || "Failed to activate license",
          variant: "destructive",
        })
        return false
      }
    } catch (err) {
      console.error("License activation error:", err)
      setError("Network error while activating license")
      toast({
        title: "Network Error",
        description: "Failed to connect to license server",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Deactivate license
  const deactivateLicense = async (): Promise<boolean> => {
    setIsLoading(true)

    try {
      const deviceId = generateDeviceId()
      const response = await mockApi.deactivateLicense(licenseKey, deviceId)

      if (response.success && response.data?.deactivated) {
        // Reset to free license
        setLicenseKey(DEFAULT_LICENSE_KEY)
        localStorage.setItem("pos_license_key", DEFAULT_LICENSE_KEY)

        // Check the free license
        const freeResponse = await mockApi.verifyLicense(DEFAULT_LICENSE_KEY)
        if (freeResponse.success && freeResponse.data) {
          setLicenseInfo(freeResponse.data)
          setLicenseStatus(freeResponse.data.status)
        }

        setError(null)
        toast({
          title: "License Deactivated",
          description: "Your license has been deactivated. Reverted to Free plan.",
        })
        return true
      } else {
        setError(response.error || "Failed to deactivate license")
        toast({
          title: "Deactivation Error",
          description: response.error || "Failed to deactivate license",
          variant: "destructive",
        })
        return false
      }
    } catch (err) {
      console.error("License deactivation error:", err)
      setError("Network error while deactivating license")
      toast({
        title: "Network Error",
        description: "Failed to connect to license server",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Upgrade plan
  const upgradePlan = async (plan: "free" | "pro" | "enterprise"): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await mockApi.upgradeSubscription(licenseKey, plan)

      if (response.success && response.data) {
        const newLicenseKey = response.data.licenseKey

        // Activate the new license
        const activationResult = await activateLicense(newLicenseKey)
        return activationResult
      } else {
        setError(response.error || "Failed to upgrade subscription")
        toast({
          title: "Upgrade Error",
          description: response.error || "Failed to upgrade subscription",
          variant: "destructive",
        })
        return false
      }
    } catch (err) {
      console.error("Subscription upgrade error:", err)
      setError("Network error while upgrading subscription")
      toast({
        title: "Network Error",
        description: "Failed to connect to license server",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Check if a feature is enabled
  const isFeatureEnabled = (feature: string): boolean => {
    if (!licenseInfo) return false
    return licenseInfo.features.includes(feature)
  }

  return (
    <LicenseContext.Provider
      value={{
        licenseInfo,
        licenseStatus,
        licenseKey,
        setLicenseKey,
        isLoading,
        error,
        checkLicense,
        activateLicense,
        deactivateLicense,
        upgradePlan,
        isFeatureEnabled,
      }}
    >
      {children}
    </LicenseContext.Provider>
  )
}

export const useLicense = () => useContext(LicenseContext)
