// Helper functions for working with localStorage

// Keys used in localStorage
export const LOCAL_STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "pos-system:sidebar-collapsed",
  THEME: "pos-system:theme",
  LAST_VIEWED_CATEGORY: "pos-system:last-viewed-category",
}

/**
 * Get an item from localStorage with type safety
 * @param key The key to get from localStorage
 * @param defaultValue Default value if key doesn't exist
 * @returns The value from localStorage or the default value
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue
  }

  try {
    const item = window.localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }

    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error)
    return defaultValue
  }
}

/**
 * Set an item in localStorage with error handling
 * @param key The key to set in localStorage
 * @param value The value to store
 * @returns true if successful, false otherwise
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error)
    return false
  }
}

/**
 * Remove an item from localStorage
 * @param key The key to remove
 * @returns true if successful, false otherwise
 */
export function removeLocalStorageItem(key: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    window.localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error)
    return false
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const testKey = "__test__"
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}
