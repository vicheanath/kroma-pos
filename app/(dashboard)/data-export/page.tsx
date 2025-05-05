"use client"

import { DataExportImport } from "@/components/data-export-import"

export default function DataExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Export & Import</h1>
        <p className="text-muted-foreground">Export or import your POS data for backup or migration</p>
      </div>

      <DataExportImport />
    </div>
  )
}
