"use client"

import { useState, useRef } from "react"
import { usePosData } from "@/components/pos-data-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Printer, Plus, Minus, RefreshCw, Package, Check, X, Pencil } from "lucide-react"

// Barcode template types
type BarcodeTemplate = {
  id: string
  name: string
  width: number
  height: number
  labelsPerRow: number
  fontSize: number
  showPrice: boolean
  showName: boolean
  showSku: boolean
  margin: number
  padding: number
}

// Default barcode templates
const BARCODE_TEMPLATES: BarcodeTemplate[] = [
  {
    id: "small",
    name: "Small (30x20mm)",
    width: 113,
    height: 76,
    labelsPerRow: 3,
    fontSize: 8,
    showPrice: true,
    showName: true,
    showSku: false,
    margin: 2,
    padding: 5,
  },
  {
    id: "medium",
    name: "Medium (50x30mm)",
    width: 189,
    height: 113,
    labelsPerRow: 2,
    fontSize: 10,
    showPrice: true,
    showName: true,
    showSku: true,
    margin: 4,
    padding: 8,
  },
  {
    id: "large",
    name: "Large (100x50mm)",
    width: 378,
    height: 189,
    labelsPerRow: 1,
    fontSize: 12,
    showPrice: true,
    showName: true,
    showSku: true,
    margin: 6,
    padding: 10,
  },
  {
    id: "custom",
    name: "Custom",
    width: 200,
    height: 100,
    labelsPerRow: 2,
    fontSize: 10,
    showPrice: true,
    showName: true,
    showSku: true,
    margin: 4,
    padding: 8,
  },
]

// Barcode types
const BARCODE_TYPES = [
  { id: "CODE128", name: "Code 128" },
  { id: "EAN13", name: "EAN-13" },
  { id: "EAN8", name: "EAN-8" },
  { id: "UPC", name: "UPC-A" },
  { id: "CODE39", name: "Code 39" },
]

export default function BarcodeDesignerPage() {
  const { toast } = useToast()
  const { products } = usePosData()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<BarcodeTemplate>(BARCODE_TEMPLATES[1])
  const [customTemplate, setCustomTemplate] = useState<BarcodeTemplate>(BARCODE_TEMPLATES[3])
  const [barcodeType, setBarcodeType] = useState(BARCODE_TYPES[0].id)
  const [showPreview, setShowPreview] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  // Get the active template (either selected or custom)
  const getActiveTemplate = (): BarcodeTemplate => {
    return selectedTemplate.id === "custom" ? customTemplate : selectedTemplate
  }

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    const template = BARCODE_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      if (template.id === "custom") {
        setCustomTemplate((prev) => ({ ...prev }))
      }
    }
  }

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  // Handle select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p.id))
    }
  }

  // Handle print button click
  const handlePrint = () => {
    if (printRef.current) {
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

        // Get the print content
        const printContent = printRef.current.innerHTML

        // Write the content to the new window
        printWindow.document.open()
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Barcodes</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .barcode-container { display: flex; flex-wrap: wrap; }
                .barcode-label { 
                  background: white; 
                  border: 1px solid #ddd; 
                  display: flex; 
                  flex-direction: column; 
                  align-items: center; 
                  justify-content: center;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              <div class="barcode-container">
                ${printContent}
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
          title: "Barcodes sent to printer",
          description: `Printing ${selectedProducts.length * quantity} barcodes`,
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

  // Render a barcode label
  const renderBarcodeLabel = (productId: string, index: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product || !product.barcode) return null

    const template = getActiveTemplate()

    return (
      <div
        key={`${productId}-${index}`}
        className="barcode-label bg-white border border-border flex flex-col items-center justify-center p-2"
        style={{
          width: `${template.width}px`,
          height: `${template.height}px`,
          padding: `${template.padding}px`,
          margin: `${template.margin}px`,
        }}
      >
        {template.showName && (
          <div className="text-center font-medium truncate w-full" style={{ fontSize: `${template.fontSize}pt` }}>
            {product.name}
          </div>
        )}

        <div
          className="barcode-placeholder my-1 bg-muted h-10 w-3/4"
          style={{
            height: `${template.height / 3}px`, // Adjust height dynamically
          }}
        ></div>

        <div className="flex w-full justify-between" style={{ fontSize: `${template.fontSize}pt` }}>
          {template.showSku && product.sku && <div className="text-muted-foreground">SKU: {product.sku}</div>}
          {template.showPrice && <div className="font-bold">${product.price.toFixed(2)}</div>}
        </div>
      </div>
    )
  }

  // Render preview barcodes
  const renderPreviewBarcodes = () => {
    if (!products || products.length === 0) {
      return <div className="text-muted-foreground p-4">No products available</div>
    }

    const validProductIds = selectedProducts.filter((id) => {
      const product = products.find((p) => p.id === id)
      return product && product.barcode
    })

    if (validProductIds.length === 0) {
      return <div className="text-muted-foreground p-4">No products with barcodes selected</div>
    }

    const previewItems = validProductIds.slice(0, 6).map((productId, index) => renderBarcodeLabel(productId, index))

    return (
      <>
        {previewItems}
        {validProductIds.length > 6 && (
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            +{validProductIds.length - 6} more
          </div>
        )}
      </>
    )
  }

  // Render print barcodes
  const renderPrintBarcodes = () => {
    const validProductIds = selectedProducts.filter((id) => {
      const product = products.find((p) => p.id === id)
      return product && product.barcode
    })

    if (validProductIds.length === 0) {
      return <div className="text-muted-foreground p-4">No products with barcodes selected</div>
    }

    const printItems = []
    for (let productIndex = 0; productIndex < validProductIds.length; productIndex++) {
      const productId = validProductIds[productIndex]
      for (let i = 0; i < quantity; i++) {
        const element = renderBarcodeLabel(productId, i)
        if (element) {
          printItems.push(element)
        }
      }
    }

    return printItems
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Barcode Designer</h1>
        <p className="text-muted-foreground">Create and print barcodes for your products.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Barcode Settings</CardTitle>
              <CardDescription>Configure your barcode design and print settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Label Template</Label>
                <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {BARCODE_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="quantity">Quantity (per product)</Label>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button variant="outline" size="icon" onClick={() => setQuantity((prev) => prev + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="preview" checked={showPreview} onCheckedChange={setShowPreview} />
                <Label htmlFor="preview">Show Preview</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedProducts([])}>
                Clear Selection
              </Button>
              <Button onClick={handlePrint} disabled={selectedProducts.length === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Print Barcodes
              </Button>
            </CardFooter>
          </Card>

          {selectedTemplate.id === "custom" && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Template</CardTitle>
                <CardDescription>Customize your barcode template.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={customTemplate.width}
                      onChange={(e) =>
                        setCustomTemplate({
                          ...customTemplate,
                          width: Number.parseInt(e.target.value) || 100,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={customTemplate.height}
                      onChange={(e) =>
                        setCustomTemplate({
                          ...customTemplate,
                          height: Number.parseInt(e.target.value) || 50,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labels-per-row">Labels Per Row</Label>
                  <Input
                    id="labels-per-row"
                    type="number"
                    min="1"
                    max="10"
                    value={customTemplate.labelsPerRow}
                    onChange={(e) =>
                      setCustomTemplate({
                        ...customTemplate,
                        labelsPerRow: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size (pt)</Label>
                  <Slider
                    id="font-size"
                    min={6}
                    max={16}
                    step={1}
                    value={[customTemplate.fontSize]}
                    onValueChange={([value]) =>
                      setCustomTemplate({
                        ...customTemplate,
                        fontSize: value,
                      })
                    }
                  />
                  <div className="text-center text-sm text-muted-foreground">{customTemplate.fontSize}pt</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="margin">Margin (px)</Label>
                    <Input
                      id="margin"
                      type="number"
                      min="0"
                      value={customTemplate.margin}
                      onChange={(e) =>
                        setCustomTemplate({
                          ...customTemplate,
                          margin: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="padding">Padding (px)</Label>
                    <Input
                      id="padding"
                      type="number"
                      min="0"
                      value={customTemplate.padding}
                      onChange={(e) =>
                        setCustomTemplate({
                          ...customTemplate,
                          padding: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-name"
                      checked={customTemplate.showName}
                      onCheckedChange={(checked) =>
                        setCustomTemplate({
                          ...customTemplate,
                          showName: checked,
                        })
                      }
                    />
                    <Label htmlFor="show-name">Show Product Name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-price"
                      checked={customTemplate.showPrice}
                      onCheckedChange={(checked) =>
                        setCustomTemplate({
                          ...customTemplate,
                          showPrice: checked,
                        })
                      }
                    />
                    <Label htmlFor="show-price">Show Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-sku"
                      checked={customTemplate.showSku}
                      onCheckedChange={(checked) =>
                        setCustomTemplate({
                          ...customTemplate,
                          showSku: checked,
                        })
                      }
                    />
                    <Label htmlFor="show-sku">Show SKU</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setCustomTemplate(BARCODE_TEMPLATES[3])}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Select Products</CardTitle>
              <CardDescription>Choose products to generate barcodes for.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden flex flex-col">
              <div className="flex justify-between mb-4">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedProducts.length === products.length ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Select All
                    </>
                  )}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {selectedProducts.length} of {products.length} products selected
                </div>
              </div>

              <div className="overflow-auto flex-grow border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Select</th>
                      <th className="text-left p-2 font-medium">Product</th>
                      <th className="text-left p-2 font-medium">Barcode</th>
                      <th className="text-left p-2 font-medium">Price</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleProductSelect(product.id)}
                              className="h-4 w-4"
                              disabled={!product.barcode}
                            />
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                              {product.image ? (
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.sku && <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          {product.barcode ? (
                            <div className="font-mono text-xs">{product.barcode}</div>
                          ) : (
                            <div className="text-xs text-destructive">No barcode</div>
                          )}
                        </td>
                        <td className="p-2">${product.price.toFixed(2)}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!product.barcode}
                              onClick={() => {
                                if (!selectedProducts.includes(product.id)) {
                                  handleProductSelect(product.id)
                                }
                                handlePrint()
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // Navigate to product edit page
                                toast({
                                  title: "Edit Product",
                                  description: "Navigate to product edit page to add or edit barcode",
                                })
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No products found. Add products with barcodes to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {showPreview && selectedProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Preview</h3>
                  <div className="border rounded-md p-4 bg-muted/30 overflow-auto">
                    <div
                      className="flex flex-wrap justify-start"
                      style={{
                        maxWidth: `${
                          getActiveTemplate().width * getActiveTemplate().labelsPerRow +
                          getActiveTemplate().margin * 2 * getActiveTemplate().labelsPerRow
                        }px`,
                      }}
                    >
                      {renderPreviewBarcodes()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden print area */}
      <div className="hidden">
        <div ref={printRef} className="p-4 bg-white">
          <div
            className="flex flex-wrap justify-start"
            style={{
              maxWidth: `${
                getActiveTemplate().width * getActiveTemplate().labelsPerRow +
                getActiveTemplate().margin * 2 * getActiveTemplate().labelsPerRow
              }px`,
            }}
          >
            {renderPrintBarcodes()}
          </div>
        </div>
      </div>
    </div>
  )
}




