"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Plus, Minus } from "lucide-react";
import {
  type BarcodeTemplate,
  BARCODE_TEMPLATES,
  BARCODE_TYPES,
} from "../utils/barcodeUtils";

interface BarcodeSettingsCardProps {
  selectedTemplate: BarcodeTemplate;
  onTemplateChange: (templateId: string) => void;
  barcodeType: string;
  onBarcodeTypeChange: (type: string) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  showPreview: boolean;
  onShowPreviewChange: (show: boolean) => void;
  selectedProductsCount: number;
  onClearSelection: () => void;
  onPrint: () => void;
}

export function BarcodeSettingsCard({
  selectedTemplate,
  onTemplateChange,
  barcodeType,
  onBarcodeTypeChange,
  quantity,
  onQuantityChange,
  showPreview,
  onShowPreviewChange,
  selectedProductsCount,
  onClearSelection,
  onPrint,
}: BarcodeSettingsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Barcode Settings</CardTitle>
        <CardDescription>
          Configure your barcode design and print settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template">Label Template</Label>
          <Select value={selectedTemplate.id} onValueChange={onTemplateChange}>
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
          <Select value={barcodeType} onValueChange={onBarcodeTypeChange}>
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                onQuantityChange(
                  Math.max(1, Number.parseInt(e.target.value) || 1)
                )
              }
              className="text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="preview"
            checked={showPreview}
            onCheckedChange={onShowPreviewChange}
          />
          <Label htmlFor="preview">Show Preview</Label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClearSelection}>
          Clear Selection
        </Button>
        <Button onClick={onPrint} disabled={selectedProductsCount === 0}>
          <Printer className="mr-2 h-4 w-4" />
          Print Barcodes
        </Button>
      </CardFooter>
    </Card>
  );
}
