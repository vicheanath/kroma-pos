"use client";

import { useState, useRef, useEffect } from "react";
import { usePosData } from "@/components/pos-data-provider";
import { useToast } from "@/components/ui/use-toast";
import JsBarcode from "jsbarcode";
import { BARCODE_TEMPLATES, type BarcodeTemplate } from "./utils/barcodeUtils";
import { BarcodeSettingsCard } from "./components/BarcodeSettingsCard";
import { CustomTemplateCard } from "./components/CustomTemplateCard";
import { ProductSelectionTable } from "./components/ProductSelectionTable";
import { BarcodeLabel } from "./components/BarcodeLabel";

export default function BarcodeDesignerPage() {
  const { toast } = useToast();
  const { products } = usePosData();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<BarcodeTemplate>(
    BARCODE_TEMPLATES[1]
  );
  const [customTemplate, setCustomTemplate] = useState<BarcodeTemplate>(
    BARCODE_TEMPLATES[3]
  );
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [showPreview, setShowPreview] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  // Generate barcodes after rendering (for preview)
  useEffect(() => {
    selectedProducts.slice(0, 6).forEach((productId, index) => {
      const product = products.find((p) => p.id === productId);
      if (product && product.barcode) {
        const barcodeElement = document.getElementById(
          `barcode-${product.id}-${index}`
        );
        if (barcodeElement) {
          JsBarcode(barcodeElement, product.barcode, {
            format: barcodeType,
            width: 2,
            height: getActiveTemplate().height / 3,
            fontSize: getActiveTemplate().fontSize,
            displayValue: false,
          });
        }
      }
    });
  }, [
    selectedProducts,
    products,
    barcodeType,
    selectedTemplate,
    customTemplate,
  ]);

  // Generate barcodes for print area
  useEffect(() => {
    if (!printRef.current) return;

    const validProductIds = selectedProducts.filter((id) => {
      const product = products.find((p) => p.id === id);
      return product && product.barcode;
    });

    validProductIds.forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      if (product && product.barcode) {
        for (let i = 0; i < quantity; i++) {
          const elementId = `barcode-${product.id}-${i}`;
          const element = document.getElementById(elementId);
          if (element) {
            JsBarcode(element, product.barcode, {
              format: barcodeType,
              width: 2,
              height: getActiveTemplate().height / 3,
              fontSize: getActiveTemplate().fontSize,
              displayValue: false,
            });
          }
        }
      }
    });
  }, [
    selectedProducts,
    products,
    barcodeType,
    quantity,
    selectedTemplate,
    customTemplate,
  ]);

  // Get the active template (either selected or custom)
  const getActiveTemplate = (): BarcodeTemplate => {
    return selectedTemplate.id === "custom" ? customTemplate : selectedTemplate;
  };

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    const template = BARCODE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  // Handle print button click
  const handlePrint = () => {
    if (printRef.current) {
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

        // Get the print content
        const printContent = printRef.current.innerHTML;

        // Write the content to the new window
        printWindow.document.open();
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
        `);
        printWindow.document.close();

        toast({
          title: "Barcodes sent to printer",
          description: `Printing ${
            selectedProducts.length * quantity
          } barcodes`,
        });
      } catch (error) {
        console.error("Print error:", error);
        toast({
          title: "Print Error",
          description:
            "There was an error while trying to print. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Render print barcodes
  const renderPrintBarcodes = () => {
    const validProductIds = selectedProducts.filter((id) => {
      const product = products.find((p) => p.id === id);
      return product && product.barcode;
    });

    if (validProductIds.length === 0) {
      return null;
    }

    const template = getActiveTemplate();
    const printItems: React.ReactNode[] = [];
    for (
      let productIndex = 0;
      productIndex < validProductIds.length;
      productIndex++
    ) {
      const productId = validProductIds[productIndex];
      const product = products.find((p) => p.id === productId);
      if (!product) continue;
      for (let i = 0; i < quantity; i++) {
        printItems.push(
          <BarcodeLabel
            key={`${productId}-${i}`}
            product={product}
            index={i}
            template={template}
            barcodeType={barcodeType}
          />
        );
      }
    }

    return printItems;
  };

  return (
    <div className="space-y-6 overflow-hidden min-w-0">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">Barcode Designer</h1>
        <p className="text-muted-foreground">
          Create and print barcodes for your products.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
        <div className="md:col-span-1 space-y-6 min-w-0">
          <BarcodeSettingsCard
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            barcodeType={barcodeType}
            onBarcodeTypeChange={setBarcodeType}
            quantity={quantity}
            onQuantityChange={setQuantity}
            showPreview={showPreview}
            onShowPreviewChange={setShowPreview}
            selectedProductsCount={selectedProducts.length}
            onClearSelection={() => setSelectedProducts([])}
            onPrint={handlePrint}
          />

          {selectedTemplate.id === "custom" && (
            <CustomTemplateCard
              template={customTemplate}
              onTemplateChange={setCustomTemplate}
              onReset={() => setCustomTemplate(BARCODE_TEMPLATES[3])}
            />
          )}
        </div>

        <div className="md:col-span-2 min-w-0">
          <ProductSelectionTable
            products={products}
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            onSelectAll={handleSelectAll}
            showPreview={showPreview}
            template={getActiveTemplate()}
            barcodeType={barcodeType}
            onPrint={handlePrint}
          />
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
                getActiveTemplate().margin *
                  2 *
                  getActiveTemplate().labelsPerRow
              }px`,
            }}
          >
            {renderPrintBarcodes()}
          </div>
        </div>
      </div>
    </div>
  );
}
