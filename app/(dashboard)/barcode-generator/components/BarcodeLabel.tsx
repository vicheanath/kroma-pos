"use client";

import { type Product } from "@/components/pos-data-provider";
import { type BarcodeTemplate } from "../utils/barcodeUtils";

interface BarcodeLabelProps {
  product: Product;
  index: number;
  template: BarcodeTemplate;
  barcodeType: string;
  currencySymbol?: string;
}

export function BarcodeLabel({
  product,
  index,
  template,
  barcodeType,
  currencySymbol = "$",
}: BarcodeLabelProps) {
  if (!product.barcode) return null;

  return (
    <div
      key={`${product.id}-${index}`}
      className="barcode-label bg-white border border-border flex flex-col items-center justify-center p-2"
      style={{
        width: `${template.width}px`,
        height: `${template.height}px`,
        padding: `${template.padding}px`,
        margin: `${template.margin}px`,
      }}
    >
      {template.showName && (
        <div
          className="text-center font-medium truncate w-full"
          style={{ fontSize: `${template.fontSize}pt` }}
        >
          {product.name}
        </div>
      )}

      <svg
        id={`barcode-${product.id}-${index}`}
        className="my-1"
        style={{
          width: `${template.width * 0.8}px`,
          height: `${template.height / 3}px`,
        }}
      ></svg>

      <div
        className="flex w-full justify-between"
        style={{ fontSize: `${template.fontSize}pt` }}
      >
        {template.showSku && product.sku && (
          <div className="text-muted-foreground">SKU: {product.sku}</div>
        )}
        {template.showPrice && (
          <div className="font-bold">
            {currencySymbol}
            {product.price.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
