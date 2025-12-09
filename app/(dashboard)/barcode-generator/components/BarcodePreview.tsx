"use client";

import { useEffect } from "react";
import { type Product } from "@/components/pos-data-provider";
import { type BarcodeTemplate, generateBarcode } from "../utils/barcodeUtils";
import { BarcodeLabel } from "./BarcodeLabel";

interface BarcodePreviewProps {
  selectedProducts: string[];
  products: Product[];
  template: BarcodeTemplate;
  barcodeType: string;
  currencySymbol?: string;
}

export function BarcodePreview({
  selectedProducts,
  products,
  template,
  barcodeType,
  currencySymbol = "$",
}: BarcodePreviewProps) {
  // Generate barcodes after rendering
  useEffect(() => {
    selectedProducts.slice(0, 6).forEach((productId, index) => {
      const product = products.find((p) => p.id === productId);
      if (product && product.barcode) {
        generateBarcode(
          `barcode-${product.id}-${index}`,
          product.barcode,
          barcodeType,
          template
        );
      }
    });
  }, [selectedProducts, products, barcodeType, template]);

  if (!products || products.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No products available</div>
    );
  }

  const validProductIds = selectedProducts.filter((id) => {
    const product = products.find((p) => p.id === id);
    return product && product.barcode;
  });

  if (validProductIds.length === 0) {
    return (
      <div className="text-muted-foreground p-4">
        No products with barcodes selected
      </div>
    );
  }

  const previewItems = validProductIds.slice(0, 6).map((productId, index) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;
    return (
      <BarcodeLabel
        key={`${productId}-${index}`}
        product={product}
        index={index}
        template={template}
        barcodeType={barcodeType}
        currencySymbol={currencySymbol}
      />
    );
  });

  return (
    <>
      {previewItems}
      {validProductIds.length > 6 && (
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          +{validProductIds.length - 6} more
        </div>
      )}
    </>
  );
}
