"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useLicense } from "./license-provider"

export type SubscriptionTier = "free" | "pro" | "enterprise"

export type Store = {
  id: string
  name: string
  address: string
  isActive: boolean
}

type SubscriptionContextType = {
  tier: SubscriptionTier
  upgradeTier: (tier: SubscriptionTier) => void
  stores: Store[]
  activeStore: Store | null
  setActiveStore: (storeId: string) => void
  addStore: (store: Omit<Store, "id">) => void
  removeStore: (storeId: string) => void
  updateStore: (store: Store) => void
  lastSynced: Date | null
  syncHistory: Array<{ date: Date; status: "success" | "failed"; message: string }>
  addSyncRecord: (status: "success" | "failed", message: string) => void
  canUseEnterpriseFeatures: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: "free",
  upgradeTier: () => {},
  stores: [],
  activeStore: null,
  setActiveStore: () => {},
  addStore: () => {},
  removeStore: () => {},
  updateStore: () => {},
  lastSynced: null,
  syncHistory: [],
  addSyncRecord: () => {},
  canUseEnterpriseFeatures: false,
})

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { licenseInfo, upgradePlan } = useLicense()
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [stores, setStores] = useState<Store[]>([
    {
      id: "main-store",
      name: "Main Store",
      address: "123 Main St, City, Country",
      isActive: true,
    },
  ])
  const [activeStoreId, setActiveStoreId] = useState<string>("main-store")
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncHistory, setSyncHistory] = useState<Array<{ date: Date; status: "success" | "failed"; message: string }>>(
    [],
  )
  const { toast } = useToast()

  // Update subscription tier based on license info
  useEffect(() => {
    if (licenseInfo) {
      setTier(licenseInfo.plan)
    }
  }, [licenseInfo])

  const activeStore = stores.find((store) => store.id === activeStoreId) || null

  const upgradeTier = async (newTier: SubscriptionTier) => {
    const success = await upgradePlan(newTier)

    if (success) {
      setTier(newTier)
      toast({
        title: "Subscription Updated",
        description: `Your subscription has been upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}.`,
      })
    }
  }

  const setActiveStore = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId)
    if (store) {
      setActiveStoreId(storeId)
      toast({
        title: "Store Changed",
        description: `Now managing: ${store.name}`,
      })
    }
  }

  const addStore = (store: Omit<Store, "id">) => {
    if (tier !== "enterprise") {
      toast({
        title: "Enterprise Feature",
        description: "Multiple stores are only available on Enterprise plan.",
        variant: "destructive",
      })
      return
    }

    // Check if we've reached the store limit
    if (licenseInfo && stores.length >= licenseInfo.maxStores) {
      toast({
        title: "Store Limit Reached",
        description: `Your plan allows a maximum of ${licenseInfo.maxStores} stores.`,
        variant: "destructive",
      })
      return
    }

    const newStore = {
      ...store,
      id: crypto.randomUUID(),
    }
    setStores((prev) => [...prev, newStore])
    toast({
      title: "Store Added",
      description: `${store.name} has been added to your stores.`,
    })
  }

  const removeStore = (storeId: string) => {
    if (stores.length <= 1) {
      toast({
        title: "Cannot Remove Store",
        description: "You must have at least one store.",
        variant: "destructive",
      })
      return
    }

    setStores((prev) => prev.filter((store) => store.id !== storeId))

    // If we're removing the active store, switch to another one
    if (activeStoreId === storeId) {
      const firstStore = stores.find((store) => store.id !== storeId)
      if (firstStore) {
        setActiveStoreId(firstStore.id)
      }
    }

    toast({
      title: "Store Removed",
      description: "The store has been removed.",
    })
  }

  const updateStore = (updatedStore: Store) => {
    setStores((prev) => prev.map((store) => (store.id === updatedStore.id ? updatedStore : store)))
    toast({
      title: "Store Updated",
      description: `${updatedStore.name} has been updated.`,
    })
  }

  const addSyncRecord = (status: "success" | "failed", message: string) => {
    const newRecord = {
      date: new Date(),
      status,
      message,
    }
    setSyncHistory((prev) => [newRecord, ...prev])
    if (status === "success") {
      setLastSynced(new Date())
    }
  }

  // Check if user can use enterprise features
  const canUseEnterpriseFeatures = tier === "enterprise" && licenseInfo?.status === "valid"

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        upgradeTier,
        stores,
        activeStore,
        setActiveStore,
        addStore,
        removeStore,
        updateStore,
        lastSynced,
        syncHistory,
        addSyncRecord,
        canUseEnterpriseFeatures,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
