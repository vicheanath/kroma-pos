import JsBarcode from "jsbarcode";
import { type Product } from "@/components/pos-data-provider";

export type BarcodeTemplate = {
  id: string;
  name: string;
  width: number;
  height: number;
  labelsPerRow: number;
  fontSize: number;
  showPrice: boolean;
  showName: boolean;
  showSku: boolean;
  margin: number;
  padding: number;
};

export const BARCODE_TEMPLATES: BarcodeTemplate[] = [
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
];

export const BARCODE_TYPES = [
  { id: "CODE128", name: "Code 128" },
  { id: "EAN13", name: "EAN-13" },
  { id: "EAN8", name: "EAN-8" },
  { id: "UPC", name: "UPC-A" },
  { id: "CODE39", name: "Code 39" },
];

export function generateBarcode(
  elementId: string,
  barcode: string,
  barcodeType: string,
  template: BarcodeTemplate
) {
  const element = document.getElementById(elementId);
  if (element) {
    JsBarcode(element, barcode, {
      format: barcodeType,
      width: 2,
      height: template.height / 3,
      fontSize: template.fontSize,
      displayValue: false,
    });
  }
}
