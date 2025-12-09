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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RefreshCw } from "lucide-react";
import { type BarcodeTemplate, BARCODE_TEMPLATES } from "../utils/barcodeUtils";

interface CustomTemplateCardProps {
  template: BarcodeTemplate;
  onTemplateChange: (template: BarcodeTemplate) => void;
  onReset: () => void;
}

export function CustomTemplateCard({
  template,
  onTemplateChange,
  onReset,
}: CustomTemplateCardProps) {
  return (
    <Card className="overflow-hidden">
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
              value={template.width}
              onChange={(e) =>
                onTemplateChange({
                  ...template,
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
              value={template.height}
              onChange={(e) =>
                onTemplateChange({
                  ...template,
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
            value={template.labelsPerRow}
            onChange={(e) =>
              onTemplateChange({
                ...template,
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
            value={[template.fontSize]}
            onValueChange={([value]) =>
              onTemplateChange({ ...template, fontSize: value })
            }
          />
          <div className="text-center text-sm text-muted-foreground">
            {template.fontSize}pt
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="margin">Margin (px)</Label>
            <Input
              id="margin"
              type="number"
              min="0"
              value={template.margin}
              onChange={(e) =>
                onTemplateChange({
                  ...template,
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
              value={template.padding}
              onChange={(e) =>
                onTemplateChange({
                  ...template,
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
              checked={template.showName}
              onCheckedChange={(checked) =>
                onTemplateChange({ ...template, showName: checked })
              }
            />
            <Label htmlFor="show-name">Show Product Name</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-price"
              checked={template.showPrice}
              onCheckedChange={(checked) =>
                onTemplateChange({ ...template, showPrice: checked })
              }
            />
            <Label htmlFor="show-price">Show Price</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-sku"
              checked={template.showSku}
              onCheckedChange={(checked) =>
                onTemplateChange({ ...template, showSku: checked })
              }
            />
            <Label htmlFor="show-sku">Show SKU</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
      </CardFooter>
    </Card>
  );
}
