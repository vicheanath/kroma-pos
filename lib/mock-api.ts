// Mock API service to simulate license verification and subscription management

// Types for license API responses
export type LicenseStatus = "valid" | "expired" | "invalid" | "trial"

export interface LicenseInfo {
  status: LicenseStatus
  plan: "free" | "pro" | "enterprise"
  expiresAt: string // ISO date string
  licenseKey: string
  features: string[]
  maxStores: number
  maxUsers: number
  allowsCloudSync: boolean
  trialDaysLeft?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Simulated network delay
const simulateNetworkDelay = (minMs = 300, maxMs = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  return new Promise((resolve) => setTimeout(resolve, delay))
}

// Mock license data
const mockLicenses: Record<string, LicenseInfo> = {
  "FREE-0000-0000-0000": {
    status: "valid",
    plan: "free",
    expiresAt: "2099-12-31T23:59:59Z",
    licenseKey: "FREE-0000-0000-0000",
    features: ["basic_pos", "local_storage", "single_store"],
    maxStores: 1,
    maxUsers: 1,
    allowsCloudSync: false,
  },
  "PRO-1234-5678-9012": {
    status: "valid",
    plan: "pro",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    licenseKey: "PRO-1234-5678-9012",
    features: ["basic_pos", "local_storage", "advanced_reporting", "customer_management", "barcode_generation"],
    maxStores: 1,
    maxUsers: 5,
    allowsCloudSync: false,
  },
  "ENT-9876-5432-1098": {
    status: "valid",
    plan: "enterprise",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    licenseKey: "ENT-9876-5432-1098",
    features: [
      "basic_pos",
      "local_storage",
      "advanced_reporting",
      "customer_management",
      "barcode_generation",
      "cloud_sync",
      "multi_store",
      "user_roles",
      "priority_support",
    ],
    maxStores: 10,
    maxUsers: 50,
    allowsCloudSync: true,
  },
  "TRIAL-2022-3344-5566": {
    status: "trial",
    plan: "enterprise",
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    licenseKey: "TRIAL-2022-3344-5566",
    features: [
      "basic_pos",
      "local_storage",
      "advanced_reporting",
      "customer_management",
      "barcode_generation",
      "cloud_sync",
      "multi_store",
      "user_roles",
    ],
    maxStores: 3,
    maxUsers: 10,
    allowsCloudSync: true,
    trialDaysLeft: 14,
  },
  "EXPIRED-1111-2222-3333": {
    status: "expired",
    plan: "pro",
    expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    licenseKey: "EXPIRED-1111-2222-3333",
    features: ["basic_pos", "local_storage"],
    maxStores: 1,
    maxUsers: 1,
    allowsCloudSync: false,
  },
}

// Mock API endpoints
export const mockApi = {
  // Verify license key
  verifyLicense: async (licenseKey: string): Promise<ApiResponse<LicenseInfo>> => {
    await simulateNetworkDelay()

    // Check if license exists
    if (mockLicenses[licenseKey]) {
      return {
        success: true,
        data: mockLicenses[licenseKey],
      }
    }

    return {
      success: false,
      error: "Invalid license key",
    }
  },

  // Activate license (simulate activation process)
  activateLicense: async (licenseKey: string, deviceId: string): Promise<ApiResponse<LicenseInfo>> => {
    await simulateNetworkDelay()

    // Check if license exists
    if (mockLicenses[licenseKey]) {
      return {
        success: true,
        data: mockLicenses[licenseKey],
      }
    }

    return {
      success: false,
      error: "Failed to activate license",
    }
  },

  // Deactivate license (simulate deactivation process)
  deactivateLicense: async (licenseKey: string, deviceId: string): Promise<ApiResponse<{ deactivated: boolean }>> => {
    await simulateNetworkDelay()

    // Check if license exists
    if (mockLicenses[licenseKey]) {
      return {
        success: true,
        data: { deactivated: true },
      }
    }

    return {
      success: false,
      error: "Failed to deactivate license",
    }
  },

  // Get available plans
  getAvailablePlans: async (): Promise<
    ApiResponse<Array<{ id: string; name: string; price: number; features: string[] }>>
  > => {
    await simulateNetworkDelay()

    return {
      success: true,
      data: [
        {
          id: "free",
          name: "Free",
          price: 0,
          features: ["Basic POS functionality", "Single store", "Local data storage"],
        },
        {
          id: "pro",
          name: "Pro",
          price: 29,
          features: [
            "Everything in Free",
            "Advanced reporting",
            "Customer management",
            "Barcode generation",
            "Export data to CSV",
          ],
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 99,
          features: [
            "Everything in Pro",
            "Cloud sync and backup",
            "Multi-store management",
            "User role management",
            "Advanced analytics",
            "Priority support",
          ],
        },
      ],
    }
  },

  // Upgrade subscription (simulate payment and upgrade)
  upgradeSubscription: async (
    currentLicenseKey: string,
    newPlan: string,
  ): Promise<ApiResponse<{ licenseKey: string }>> => {
    await simulateNetworkDelay()

    // Generate a new license key based on the plan
    let newLicenseKey = ""
    switch (newPlan) {
      case "free":
        newLicenseKey = "FREE-0000-0000-0000"
        break
      case "pro":
        newLicenseKey = "PRO-1234-5678-9012"
        break
      case "enterprise":
        newLicenseKey = "ENT-9876-5432-1098"
        break
      default:
        return {
          success: false,
          error: "Invalid plan selected",
        }
    }

    return {
      success: true,
      data: { licenseKey: newLicenseKey },
    }
  },

  // Sync data to cloud (for enterprise users)
  syncToCloud: async (licenseKey: string, data: any): Promise<ApiResponse<{ syncId: string; timestamp: string }>> => {
    await simulateNetworkDelay()

    const license = mockLicenses[licenseKey]

    if (!license || !license.allowsCloudSync) {
      return {
        success: false,
        error: "Cloud sync not available for your plan",
      }
    }

    return {
      success: true,
      data: {
        syncId: `sync-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    }
  },

  // Get sync history (for enterprise users)
  getSyncHistory: async (licenseKey: string): Promise<ApiResponse<Array<{ id: string; timestamp: string }>>> => {
    await simulateNetworkDelay()

    const license = mockLicenses[licenseKey]

    if (!license || !license.allowsCloudSync) {
      return {
        success: false,
        error: "Cloud sync not available for your plan",
      }
    }

    // Generate mock sync history
    const history = Array.from({ length: 5 }, (_, i) => ({
      id: `sync-${Date.now() - i * 86400000}`,
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    }))

    return {
      success: true,
      data: history,
    }
  },
}

// Helper to generate a unique device ID (for license activation)
export const generateDeviceId = (): string => {
  // In a real Electron app, we would use hardware identifiers
  // For this mock, we'll generate a random ID and store it in localStorage
  let deviceId = localStorage.getItem("pos_device_id")
  if (!deviceId) {
    deviceId = `DEVICE-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem("pos_device_id", deviceId)
  }
  return deviceId
}
