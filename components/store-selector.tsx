"use client"

import { useSubscription } from "./subscription-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store } from "lucide-react"

export function StoreSelector() {
  const { stores, activeStore, setActiveStore, canUseEnterpriseFeatures } = useSubscription()

  if (!canUseEnterpriseFeatures || stores.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Store className="h-4 w-4 text-muted-foreground" />
      <Select value={activeStore?.id} onValueChange={setActiveStore}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select store" />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
