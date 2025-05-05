"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload, Loader2, FileArchive, FileText, ImageIcon, Database } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { exportAllData, importAllData } from "@/lib/data-portability"
import { settingsApi } from "@/lib/db"
import JSZip from "jszip"

export function DataExportImport() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setProgress(0)
    setProgressText("Preparing data...")

    try {
      // Create a new JSZip instance
      const zip = new JSZip()

      // Get all data
      setProgress(10)
      setProgressText("Fetching products data...")
      const data = await exportAllData()

      // Add data as JSON file
      setProgress(30)
      setProgressText("Adding data to archive...")
      zip.file("pos-data.json", JSON.stringify(data, null, 2))

      // Get receipt settings to extract logo
      setProgress(50)
      setProgressText("Processing receipt settings...")
      const receiptSettings = await settingsApi.getReceiptSettings()

      // If there's a logo, extract and add it
      if (receiptSettings.storeLogo) {
        setProgress(60)
        setProgressText("Processing logo image...")

        try {
          // Convert base64 to blob
          const base64Data = receiptSettings.storeLogo.split(",")[1]
          const byteCharacters = atob(base64Data)
          const byteArrays = []

          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512)

            const byteNumbers = new Array(slice.length)
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i)
            }

            const byteArray = new Uint8Array(byteNumbers)
            byteArrays.push(byteArray)
          }

          const blob = new Blob(byteArrays, { type: "image/png" })
          zip.file("images/store-logo.png", blob)
        } catch (error) {
          console.error("Error processing logo:", error)
        }
      }

      // Process product images
      setProgress(70)
      setProgressText("Processing product images...")

      if (data.products && data.products.length > 0) {
        let processedImages = 0
        const totalImages = data.products.filter((p) => p.image).length

        if (totalImages > 0) {
          // Create images folder
          const imagesFolder = zip.folder("images/products")

          for (const product of data.products) {
            if (product.image) {
              try {
                // Convert base64 to blob
                const base64Data = product.image.split(",")[1]
                const byteCharacters = atob(base64Data)
                const byteArrays = []

                for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                  const slice = byteCharacters.slice(offset, offset + 512)

                  const byteNumbers = new Array(slice.length)
                  for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i)
                  }

                  const byteArray = new Uint8Array(byteNumbers)
                  byteArrays.push(byteArray)
                }

                const blob = new Blob(byteArrays, { type: "image/png" })
                imagesFolder?.file(`${product.id}.png`, blob)

                processedImages++
                setProgress(70 + Math.floor((processedImages / totalImages) * 20))
                setProgressText(`Processing product images (${processedImages}/${totalImages})...`)
              } catch (error) {
                console.error(`Error processing image for product ${product.id}:`, error)
              }
            }
          }
        }
      }

      // Generate the zip file
      setProgress(90)
      setProgressText("Generating archive file...")
      const content = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: {
            level: 9,
          },
        },
        (metadata) => {
          setProgress(90 + Math.floor(metadata.percent / 10))
        },
      )

      // Create download link
      setProgress(100)
      setProgressText("Download ready!")
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = `pos-data-export-${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully as a ZIP archive.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setTimeout(() => {
        setProgress(0)
        setProgressText("")
      }, 3000)
    }
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setProgress(0)
    setProgressText("Reading file...")

    try {
      // Check if it's a zip file
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        setProgressText("Processing ZIP archive...")

        // Read the zip file
        const zip = new JSZip()
        const zipData = await zip.loadAsync(file)

        setProgress(30)
        setProgressText("Extracting data...")

        // Get the JSON data file
        const dataFile = zipData.file("pos-data.json")
        if (!dataFile) {
          throw new Error("Invalid ZIP archive: missing pos-data.json file")
        }

        const jsonContent = await dataFile.async("string")
        const data = JSON.parse(jsonContent)

        setProgress(60)
        setProgressText("Importing data...")

        // Import the data
        await importAllData(data)

        setProgress(100)
        setProgressText("Import complete!")

        toast({
          title: "Data Imported",
          description: "Your data has been imported successfully from the ZIP archive. The page will refresh.",
        })
      } else {
        // Assume it's a JSON file
        setProgressText("Processing JSON file...")

        // Read the JSON file
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            setProgress(30)
            setProgressText("Parsing data...")

            const data = JSON.parse(e.target?.result as string)

            setProgress(60)
            setProgressText("Importing data...")

            // Import the data
            await importAllData(data)

            setProgress(100)
            setProgressText("Import complete!")

            toast({
              title: "Data Imported",
              description: "Your data has been imported successfully. The page will refresh.",
            })
          } catch (error) {
            console.error("Import error:", error)
            toast({
              title: "Import Failed",
              description: "There was an error importing your data. Please check the file format.",
              variant: "destructive",
            })
          } finally {
            setIsImporting(false)
          }
        }

        reader.readAsText(file)
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import Failed",
        description: "There was an error importing your data. Please check the file format.",
        variant: "destructive",
      })
      setIsImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Portability</CardTitle>
        <CardDescription>Export or import your POS data for backup or migration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>
            Export your data as a ZIP archive for backup purposes or to migrate to another device. The archive includes:
          </p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              All your POS data (products, categories, sales, etc.)
            </li>
            <li className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
              Store logo and product images
            </li>
            <li className="flex items-center">
              <FileArchive className="h-4 w-4 mr-2 text-amber-500" />
              Receipt design settings
            </li>
          </ul>
        </div>

        {(progress > 0 || isExporting || isImporting) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progressText}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1" onClick={handleExport} disabled={isExporting || isImporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleImportClick}
            disabled={isExporting || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json,.zip" className="hidden" />
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex items-start">
        <Database className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
        <p>
          Importing data will overwrite your current data. Make sure to export your current data first if you want to
          keep it. The system supports both JSON and ZIP archive formats for import.
        </p>
      </CardFooter>
    </Card>
  )
}
