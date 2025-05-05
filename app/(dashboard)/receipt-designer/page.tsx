"use client"

import { ReceiptDesigner } from "@/components/receipt-designer"
import { ReceiptSettingsProvider } from "@/components/receipt-settings-provider"

export default function ReceiptDesignerPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Receipt Designer</h1>
        <p className="text-muted-foreground">Customize your receipt design and settings</p>
      </div>

      <ReceiptSettingsProvider>
        <ReceiptDesigner />
      </ReceiptSettingsProvider>
    </div>
  )
}
