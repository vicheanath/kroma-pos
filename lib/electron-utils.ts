// Utility functions for Electron compatibility

// Check if running in Electron environment
export const isElectron = (): boolean => {
  // In a real Electron app, we would check for the Electron runtime
  // For this mock, we'll just check the user agent
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    return navigator.userAgent.toLowerCase().indexOf(" electron/") > -1
  }
  return false
}

// Generate a unique device ID for license activation
export const getDeviceId = (): string => {
  // In a real Electron app, we would use hardware identifiers
  // For this mock, we'll use localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    let deviceId = localStorage.getItem("pos_device_id")
    if (!deviceId) {
      deviceId = `DEVICE-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem("pos_device_id", deviceId)
    }
    return deviceId
  }
  return "unknown-device"
}

// Get app version (would come from package.json in a real Electron app)
export const getAppVersion = (): string => {
  return "1.0.0"
}

// Check if app needs update
export const checkForUpdates = async (): Promise<{ hasUpdate: boolean; version?: string }> => {
  // In a real app, this would check against a server
  // For this mock, we'll just return a simulated response
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { hasUpdate: false }
}

// Simulate saving app settings to electron-store
export const saveSettings = (settings: Record<string, any>): void => {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("pos_app_settings", JSON.stringify(settings))
  }
}

// Simulate loading app settings from electron-store
export const loadSettings = (): Record<string, any> => {
  if (typeof window !== "undefined" && window.localStorage) {
    const settings = localStorage.getItem("pos_app_settings")
    return settings ? JSON.parse(settings) : {}
  }
  return {}
}

// Simulate opening external links in default browser
export const openExternalLink = (url: string): void => {
  if (isElectron()) {
    console.log(`[Electron] Opening external link: ${url}`)
    // In a real Electron app, we would use shell.openExternal
  } else {
    window.open(url, "_blank")
  }
}
