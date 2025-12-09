"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Download,
  Printer,
  RefreshCw,
  Save,
  Barcode,
  Settings,
  Eye,
  Sparkles,
  FileText,
} from "lucide-react";
import { usePosData } from "@/components/pos-data-provider";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

// Barcode types
const BARCODE_TYPES = [
  { id: "CODE128", name: "Code 128" },
  { id: "EAN13", name: "EAN-13" },
  { id: "EAN8", name: "EAN-8" },
  { id: "UPC", name: "UPC-A" },
  { id: "CODE39", name: "Code 39" },
];

export default function BarcodeGeneratorPage() {
  const { toast } = useToast();
  const { products, updateExistingProduct } = usePosData();
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeType, setBarcodeType] = useState(BARCODE_TYPES[0].id);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [fontSize, setFontSize] = useState(16);
  const [showText, setShowText] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [lineColor, setLineColor] = useState("#000000");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [copies, setCopies] = useState(1);
  const barcodeRef = useRef<HTMLDivElement>(null);

  // Generate a random barcode based on the selected type
  const generateRandomBarcode = () => {
    let randomBarcode = "";

    switch (barcodeType) {
      case "EAN13":
        // Generate 12 digits (13th is check digit)
        for (let i = 0; i < 12; i++) {
          randomBarcode += Math.floor(Math.random() * 10).toString();
        }
        break;
      case "EAN8":
        // Generate 7 digits (8th is check digit)
        for (let i = 0; i < 7; i++) {
          randomBarcode += Math.floor(Math.random() * 10).toString();
        }
        break;
      case "UPC":
        // Generate 11 digits (12th is check digit)
        for (let i = 0; i < 11; i++) {
          randomBarcode += Math.floor(Math.random() * 10).toString();
        }
        break;
      case "CODE128":
      case "CODE39":
      default:
        // Generate alphanumeric code
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (let i = 0; i < 10; i++) {
          randomBarcode += chars.charAt(
            Math.floor(Math.random() * chars.length)
          );
        }
        break;
    }

    setBarcodeValue(randomBarcode);
  };

  // Validate barcode value based on type
  const validateBarcode = () => {
    let isValid = false;
    let message = "";

    switch (barcodeType) {
      case "EAN13":
        isValid = /^\d{12,13}$/.test(barcodeValue);
        message = "EAN-13 requires 12-13 digits";
        break;
      case "EAN8":
        isValid = /^\d{7,8}$/.test(barcodeValue);
        message = "EAN-8 requires 7-8 digits";
        break;
      case "UPC":
        isValid = /^\d{11,12}$/.test(barcodeValue);
        message = "UPC-A requires 11-12 digits";
        break;
      case "CODE39":
        isValid = /^[A-Z0-9\-. $/+%]+$/.test(barcodeValue);
        message =
          "CODE39 only supports uppercase letters, numbers, and some special characters";
        break;
      case "CODE128":
      default:
        isValid = barcodeValue.length > 0;
        message = "Please enter a value";
        break;
    }

    if (!isValid) {
      toast({
        title: "Invalid Barcode",
        description: message,
        variant: "destructive",
      });
    }

    return isValid;
  };

  // Handle saving barcode to product
  const handleSaveToProduct = async () => {
    if (!validateBarcode() || !selectedProduct) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      toast({
        title: "Error",
        description: "Selected product not found",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateExistingProduct({
        ...product,
        barcode: barcodeValue,
      });

      toast({
        title: "Barcode Saved",
        description: `Barcode saved to product: ${product.name}`,
      });
    } catch (error) {
      console.error("Error saving barcode:", error);
      toast({
        title: "Error",
        description: "Failed to save barcode to product",
        variant: "destructive",
      });
    }
  };

  // Handle print button click
  const handlePrint = () => {
    if (!validateBarcode() || !barcodeRef.current) return;

    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "Error",
          description:
            "Could not open print window. Please check your popup blocker settings.",
          variant: "destructive",
        });
        return;
      }

      // Get the SVG element
      const svg = barcodeRef.current.querySelector("svg");
      if (!svg) {
        toast({
          title: "Error",
          description: "No barcode to print",
          variant: "destructive",
        });
        return;
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = svg.cloneNode(true) as SVGElement;
      const svgString = new XMLSerializer().serializeToString(svgClone);

      // Create content for multiple copies
      let copiesContent = "";
      for (let i = 0; i < copies; i++) {
        copiesContent += `
          <div style="margin: 10px; display: inline-block; page-break-inside: avoid;">
            ${svgString}
          </div>
        `;
      }

      // Write the content to the new window
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background: ${backgroundColor};
              }
              .barcode-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: 10px;
              }
              .barcode-container > div {
                background: ${backgroundColor};
                padding: 10px;
                border-radius: 4px;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 10px;
                  background: white;
                }
                .barcode-container {
                  gap: 0;
                }
                .barcode-container > div {
                  margin: 5px;
                  page-break-inside: avoid;
                }
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
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      toast({
        title: "Barcode sent to printer",
        description: `Printing ${copies} copies`,
      });
    } catch (error: any) {
      console.error("Print error:", error);
      toast({
        title: "Print Error",
        description:
          error.message ||
          "There was an error while trying to print. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle PDF preview
  const handlePreviewPDF = () => {
    if (!validateBarcode() || !barcodeRef.current) return;

    try {
      const svg = barcodeRef.current.querySelector("svg");
      if (!svg) {
        toast({
          title: "Error",
          description: "No barcode to preview",
          variant: "destructive",
        });
        return;
      }

      // Get product information if selected
      const product = selectedProduct
        ? products.find((p) => p.id === selectedProduct)
        : null;

      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        // Create PDF - use larger format if product info is included
        const hasProductInfo = product && product.name;
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: hasProductInfo ? [80, 60] : [80, 50], // Larger if product info
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Add background color
        const bgColor = backgroundColor.replace("#", "");
        const r = parseInt(bgColor.substring(0, 2), 16);
        const g = parseInt(bgColor.substring(2, 4), 16);
        const b = parseInt(bgColor.substring(4, 6), 16);
        pdf.setFillColor(r, g, b);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

        // Calculate barcode dimensions
        const imgWidth = img.width;
        const imgHeight = img.height;
        const maxBarcodeWidth = pdfWidth - 10;
        const maxBarcodeHeight = hasProductInfo
          ? pdfHeight - 25
          : pdfHeight - 10;
        const ratio = Math.min(
          maxBarcodeWidth / imgWidth,
          maxBarcodeHeight / imgHeight
        );

        const barcodeWidth = imgWidth * ratio;
        const barcodeHeight = imgHeight * ratio;
        const barcodeX = (pdfWidth - barcodeWidth) / 2;
        const barcodeY = hasProductInfo ? 20 : (pdfHeight - barcodeHeight) / 2;

        // Convert image to data URL
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        canvas.width = imgWidth;
        canvas.height = imgHeight;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL("image/png");

        // Add product information if available
        if (hasProductInfo && product) {
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          // Use Roboto for better Unicode support (jsPDF doesn't support Noto Sans Khmer directly)
          // But we'll use helvetica which has better Unicode support in jsPDF
          pdf.setFont("helvetica", "bold");

          // Product name (truncate if too long)
          const productName =
            product.name.length > 30
              ? product.name.substring(0, 30) + "..."
              : product.name;
          pdf.text(productName, pdfWidth / 2, 8, {
            align: "center",
            maxWidth: pdfWidth - 4,
          });

          // Product details (size, price, etc.)
          if (product.variations && product.variations.length > 0) {
            const variation = product.variations[0];
            let details = "";
            if (variation.name) details += variation.name;
            if (variation.price !== undefined) {
              details += details
                ? ` $${variation.price.toFixed(2)}`
                : `$${variation.price.toFixed(2)}`;
            }
            if (details) {
              pdf.setFontSize(8);
              pdf.setFont("helvetica", "normal");
              pdf.text(details, pdfWidth / 2, 14, {
                align: "center",
                maxWidth: pdfWidth - 4,
              });
            }
          } else if (product.price !== undefined) {
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text(`$${product.price.toFixed(2)}`, pdfWidth / 2, 14, {
              align: "center",
            });
          }

          // Barcode value
          if (showText) {
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "normal");
            pdf.text(barcodeValue, pdfWidth / 2, barcodeY + barcodeHeight + 5, {
              align: "center",
            });
          }
        } else {
          // Just barcode value if no product
          if (showText) {
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text(barcodeValue, pdfWidth / 2, barcodeY + barcodeHeight + 5, {
              align: "center",
            });
          }
        }

        // Add barcode image to PDF
        pdf.addImage(
          imgData,
          "PNG",
          barcodeX,
          barcodeY,
          barcodeWidth,
          barcodeHeight
        );

        // Generate PDF blob and open in new window
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const newWindow = window.open(pdfUrl, "_blank");

        if (!newWindow) {
          toast({
            title: "Error",
            description:
              "Could not open PDF preview. Please check your popup blocker settings.",
            variant: "destructive",
          });
          return;
        }

        URL.revokeObjectURL(url);
        // Don't revoke pdfUrl immediately as the window needs it
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

        toast({
          title: "PDF Preview Opened",
          description: "Barcode PDF preview has been opened in a new window",
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast({
          title: "Error",
          description: "Failed to load barcode image",
          variant: "destructive",
        });
      };

      img.src = url;
    } catch (error: any) {
      console.error("PDF preview error:", error);
      toast({
        title: "PDF Preview Error",
        description: error.message || "Failed to generate PDF preview",
        variant: "destructive",
      });
    }
  };

  // Handle download as image
  const handleDownload = () => {
    if (!validateBarcode() || !barcodeRef.current) return;

    try {
      const svg = barcodeRef.current.querySelector("svg");
      if (!svg) {
        toast({
          title: "Error",
          description: "No barcode to download",
          variant: "destructive",
        });
        return;
      }

      // Convert SVG to canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `barcode-${barcodeValue}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            URL.revokeObjectURL(url);

            toast({
              title: "Download Complete",
              description: "Barcode image has been downloaded",
            });
          }
        });
      };
      img.src = url;
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Error",
        description: error.message || "Failed to download barcode",
        variant: "destructive",
      });
    }
  };

  // Update barcode value when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct);
      if (product && product.barcode) {
        setBarcodeValue(product.barcode);
      }
    }
  }, [selectedProduct, products]);

  // Render barcode using JsBarcode
  useEffect(() => {
    if (barcodeValue && barcodeRef.current) {
      try {
        // Clear existing content
        barcodeRef.current.innerHTML = "";

        // Create SVG element
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        barcodeRef.current.appendChild(svg);

        // Generate barcode
        JsBarcode(svg, barcodeValue, {
          format: barcodeType,
          width: width,
          height: height,
          fontSize: fontSize,
          displayValue: showText,
          background: backgroundColor,
          lineColor: lineColor,
          margin: 10,
        });
      } catch (error: any) {
        console.error("Error rendering barcode:", error);
        toast({
          title: "Render Error",
          description:
            error.message ||
            "Failed to render the barcode. Please check your settings.",
          variant: "destructive",
        });
      }
    } else if (barcodeRef.current) {
      // Clear if no barcode value
      barcodeRef.current.innerHTML = "";
    }
  }, [
    barcodeValue,
    barcodeType,
    width,
    height,
    fontSize,
    showText,
    backgroundColor,
    lineColor,
    toast,
  ]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 overflow-hidden min-w-0"
    >
      <motion.div variants={itemVariants} className="min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <Barcode className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Barcode Designer
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and print barcodes for your products.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Barcode Settings
              </CardTitle>
              <CardDescription>
                Configure your barcode design and print settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger
                    value="manual"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger
                    value="product"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    From Product
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="barcode-value"
                      className="text-sm font-medium"
                    >
                      Barcode Value
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode-value"
                        value={barcodeValue}
                        onChange={(e) => setBarcodeValue(e.target.value)}
                        placeholder="Enter barcode value"
                        className="border-2 focus:border-primary"
                      />
                      <Button
                        variant="outline"
                        onClick={generateRandomBarcode}
                        className="gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Random
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="product" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="product" className="text-sm font-medium">
                      Select Product
                    </Label>
                    <Select
                      value={selectedProduct}
                      onValueChange={setSelectedProduct}
                    >
                      <SelectTrigger id="product" className="border-2">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                            {product.barcode && (
                              <span className="text-muted-foreground ml-2">
                                ({product.barcode})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="product-barcode"
                      className="text-sm font-medium"
                    >
                      Product Barcode
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="product-barcode"
                        value={barcodeValue}
                        onChange={(e) => setBarcodeValue(e.target.value)}
                        placeholder="Enter barcode value"
                        className="border-2 focus:border-primary"
                      />
                      <Button
                        variant="outline"
                        onClick={generateRandomBarcode}
                        className="gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Random
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full gap-2 shadow-sm"
                    onClick={handleSaveToProduct}
                    disabled={!selectedProduct || !barcodeValue}
                  >
                    <Save className="h-4 w-4" />
                    Save to Product
                  </Button>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="barcode-type" className="text-sm font-medium">
                  Barcode Type
                </Label>
                <Select value={barcodeType} onValueChange={setBarcodeType}>
                  <SelectTrigger id="barcode-type" className="border-2">
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

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Appearance Settings</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="width" className="text-sm font-medium">
                      Line Width
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {width}
                    </span>
                  </div>
                  <Slider
                    id="width"
                    min={1}
                    max={5}
                    step={0.5}
                    value={[width]}
                    onValueChange={([value]) => setWidth(value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="height" className="text-sm font-medium">
                      Height
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {height}px
                    </span>
                  </div>
                  <Slider
                    id="height"
                    min={50}
                    max={200}
                    step={10}
                    value={[height]}
                    onValueChange={([value]) => setHeight(value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="font-size" className="text-sm font-medium">
                      Font Size
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {fontSize}px
                    </span>
                  </div>
                  <Slider
                    id="font-size"
                    min={8}
                    max={24}
                    step={1}
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                  <Label htmlFor="show-text" className="text-sm font-medium">
                    Show Text
                  </Label>
                  <Switch
                    id="show-text"
                    checked={showText}
                    onCheckedChange={setShowText}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Color Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="background-color"
                      className="text-sm font-medium"
                    >
                      Background
                    </Label>
                    <div className="flex gap-2">
                      <div
                        className="w-12 h-10 rounded-md border-2 cursor-pointer"
                        style={{ backgroundColor: backgroundColor }}
                        onClick={() => {
                          const input = document.getElementById(
                            "background-color"
                          ) as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <Input
                        id="background-color"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="border-2 h-10 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line-color" className="text-sm font-medium">
                      Line Color
                    </Label>
                    <div className="flex gap-2">
                      <div
                        className="w-12 h-10 rounded-md border-2 cursor-pointer"
                        style={{ backgroundColor: lineColor }}
                        onClick={() => {
                          const input = document.getElementById(
                            "line-color"
                          ) as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <Input
                        id="line-color"
                        type="color"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        className="border-2 h-10 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="copies" className="text-sm font-medium">
                  Copies
                </Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) =>
                    setCopies(Math.max(1, Number.parseInt(e.target.value) || 1))
                  }
                  className="border-2 focus:border-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBarcodeValue("");
                  setSelectedProduct("");
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!barcodeValue}
                  className="gap-2 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={handlePrint}
                  disabled={!barcodeValue}
                  className="gap-2 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Barcode Preview
              </CardTitle>
              <CardDescription>
                Live preview of your barcode design.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 min-h-[400px]">
                {barcodeValue ? (
                  <div
                    ref={barcodeRef}
                    className="flex items-center justify-center p-6 rounded-lg border-2 bg-white dark:bg-gray-900"
                    style={{ backgroundColor: backgroundColor }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground">
                    <Barcode className="h-16 w-16 opacity-50" />
                    <p className="text-sm font-medium">
                      Enter a barcode value to see preview
                    </p>
                  </div>
                )}
              </div>
              {barcodeValue && (
                <div className="flex justify-center pt-4 border-t">
                  <Button
                    onClick={handlePreviewPDF}
                    variant="outline"
                    className="gap-2 shadow-sm"
                  >
                    <FileText className="h-4 w-4" />
                    Preview PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
