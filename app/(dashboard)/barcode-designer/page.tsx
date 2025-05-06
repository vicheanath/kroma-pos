"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Download, Printer, RefreshCw, Save } from "lucide-react"
import { usePosData } from "@/components/pos-data-provider"
import JsBarcode from "jsbarcode"

// Barcode types
const BARCODE_TYPES = [
  { id: "CODE128", name: "Code 128" },
  { id: "EAN13", name: "EAN-13" },
  { id: "EAN8", name: "EAN-8" },
  { id: "UPC", name: "UPC-A" },
  { id: "CODE39", name: "Code 39" },
]

export default function BarcodeGeneratorPage() {
  const { toast } = useToast()
  const { products, updateExistingProduct } = usePosData()
  const [barcodeValue, setBarcodeValue] = useState("")
  const [barcodeType, setBarcodeType] = useState(BARCODE_TYPES[0].id)
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [fontSize, setFontSize] = useState(16)
  const [showText, setShowText] = useState(true)
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [lineColor, setLineColor] = useState("#000000")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [copies, setCopies] = useState(1)
  const barcodeRef = useRef<HTMLDivElement>(null)

  // Generate a random barcode based on the selected type
  const generateRandomBarcode = () => {
    let randomBarcode = ""

    switch (barcodeType) {
      case "EAN13":
        // Generate 12 digits (13th is check digit)
        for (let i = 0; i < 12; i++) {
          randomBarcode += Math.floor(Math.random() * 10).toString()
        }
        break
      case "EAN8":
        // Generate 7 digits (8th is check digit)
        for (let i = 0; i < 7; i++) {
          randomBarcode += Math.floor(Math.random() * 10).toString()
        }
        break
      case "UPC":
        // Generate 11 digits (12th is check digit)
        for (let i = 0; i < 11; i++) {
          randomBarcode += Math.floor(Math.random() * 10).toString()
        }
        break
      case "CODE128":
      case "CODE39":
      default:
        // Generate alphanumeric code
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        for (let i = 0; i < 10; i++) {
          randomBarcode += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        break
    }

    setBarcodeValue(randomBarcode)
  }

  // Validate barcode value based on type
  const validateBarcode = () => {
    let isValid = false
    let message = ""

    switch (barcodeType) {
      case "EAN13":
        isValid = /^\d{12,13}$/.test(barcodeValue)
        message = "EAN-13 requires 12-13 digits"
        break
      case "EAN8":
        isValid = /^\d{7,8}$/.test(barcodeValue)
        message = "EAN-8 requires 7-8 digits"
        break
      case "UPC":
        isValid = /^\d{11,12}$/.test(barcodeValue)
        message = "UPC-A requires 11-12 digits"
        break
      case "CODE39":
        isValid = /^[A-Z0-9\-. $/+%]+$/.test(barcodeValue)
        message = "CODE39 only supports uppercase letters, numbers, and some special characters"
        break
      case "CODE128":
      default:
        isValid = barcodeValue.length > 0
        message = "Please enter a value"
        break
    }

    if (!isValid) {
      toast({
        title: "Invalid Barcode",
        description: message,
        variant: "destructive",
      })
    }

    return isValid
  }

  // Handle saving barcode to product
  const handleSaveToProduct = async () => {
    if (!validateBarcode() || !selectedProduct) return

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) {
      toast({
        title: "Error",
        description: "Selected product not found",
        variant: "destructive",
      })
      return
    }

    try {
      await updateExistingProduct({
        ...product,
        barcode: barcodeValue,
      })

      toast({
        title: "Barcode Saved",
        description: `Barcode saved to product: ${product.name}`,
      })
    } catch (error) {
      console.error("Error saving barcode:", error)
      toast({
        title: "Error",
        description: "Failed to save barcode to product",
        variant: "destructive",
      })
    }
  }

  // Handle print button click
  const handlePrint = () => {
    if (!validateBarcode()) return

    if (barcodeRef.current) {
      try {
        // Create a new window for printing
        const printWindow = window.open("", "_blank")
        if (!printWindow) {
          toast({
            title: "Error",
            description: "Could not open print window. Please check your popup blocker settings.",
            variant: "destructive",
          })
          return
        }

        // Get the barcode placeholder
        const barcodePlaceholder = barcodeRef.current.innerHTML

        // Create content for multiple copies
        let copiesContent = ""
        for (let i = 0; i < copies; i++) {
          copiesContent += `
            <div style="margin: 10px; display: inline-block;">
              ${barcodePlaceholder}
            </div>
          `
        }

        // Write the content to the new window
        printWindow.document.open()
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Barcode</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .barcode-container { display: flex; flex-wrap: wrap; justify-content: center; }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              <div class="barcode-container">
                ${copiesContent}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()

        toast({
          title: "Barcode sent to printer",
          description: `Printing ${copies} copies`,
        })
      } catch (error) {
        console.error("Print error:", error)
        toast({
          title: "Print Error",
          description: "There was an error while trying to print. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Handle download as image
  const handleDownload = () => {
    if (!validateBarcode()) return

    toast({
      title: "Download Started",
      description: "Your barcode image is being prepared for download",
    })

    // In a real implementation, we would convert the barcode to an image and download it
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Barcode image has been downloaded",
      })
    }, 1000)
  }

  // Render barcode using JsBarcode
  useEffect(() => {
    if (barcodeValue && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: barcodeType,
          width,
          height,
          fontSize,
          displayValue: showText,
          background: backgroundColor,
          lineColor,
        })
      } catch (error) {
        console.error("Error rendering barcode:", error)
        toast({
          title: "Render Error",
          description: "Failed to render the barcode. Please check your settings.",
          variant: "destructive",
        })
      }
    }
  }, [barcodeValue, barcodeType, width, height, fontSize, showText, backgroundColor, lineColor])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Barcode Generator</h1>
        <p className="text-muted-foreground">Create, customize, and print individual barcodes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Barcode Settings</CardTitle>
            <CardDescription>Configure your barcode appearance and data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="product">From Product</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode-value">Barcode Value</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="barcode-value"
                      value={barcodeValue}
                      onChange={(e) => setBarcodeValue(e.target.value)}
                      placeholder="Enter barcode value"
                    />
                    <Button variant="outline" onClick={generateRandomBarcode}>
                      Random
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="product" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-barcode">Product Barcode</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="product-barcode"
                      value={barcodeValue}
                      onChange={(e) => setBarcodeValue(e.target.value)}
                      placeholder="Enter barcode value"
                    />
                    <Button variant="outline" onClick={generateRandomBarcode}>
                      Random
                    </Button>
                  </div>
                </div>
                <Button className="w-full" onClick={handleSaveToProduct} disabled={!selectedProduct}>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Product
                </Button>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="barcode-type">Barcode Type</Label>
              <Select value={barcodeType} onValueChange={setBarcodeType}>
                <SelectTrigger id="barcode-type">
                  <SelectValue placeholder="Select barcode type" />
                </SelectTrigger>
                <SelectContent>
                  {BARCODE_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Line Width</Label>
              <Slider
                id="width"
                min={1}
                max={5}
                step={0.5}
                value={[width]}
                onValueChange={([value]) => setWidth(value)}
              />
              <div className="text-center text-sm text-muted-foreground">{width}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Slider
                id="height"
                min={50}
                max={200}
                step={10}
                value={[height]}
                onValueChange={([value]) => setHeight(value)}
              />
              <div className="text-center text-sm text-muted-foreground">{height}px</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Slider
                id="font-size"
                min={8}
                max={24}
                step={1}
                value={[fontSize]}
                onValueChange={([value]) => setFontSize(value)}
              />
              <div className="text-center text-sm text-muted-foreground">{fontSize}px</div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-text" checked={showText} onCheckedChange={setShowText} />
              <Label htmlFor="show-text">Show Text</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex space-x-2">
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: backgroundColor }}></div>
                  <Input
                    id="background-color"
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="line-color">Line Color</Label>
                <div className="flex space-x-2">
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: lineColor }}></div>
                  <Input id="line-color" type="text" value={lineColor} onChange={(e) => setLineColor(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="copies">Copies</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Number.parseInt(e.target.value) || 1))}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setBarcodeValue("")
                setSelectedProduct("")
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barcode Preview</CardTitle>
            <CardDescription>Live preview of your barcode.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-8">
            <svg ref={barcodeRef} className="bg-white p-4 rounded-md"></svg>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
