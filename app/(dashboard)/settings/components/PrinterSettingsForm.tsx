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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Save } from "lucide-react";

interface PrinterSettings {
  defaultPrinter: string;
  paperSize: string;
  copies: number;
}

interface PrinterSettingsFormProps {
  settings: PrinterSettings;
  onSettingsChange: (settings: PrinterSettings) => void;
  onSave: () => void;
}

export function PrinterSettingsForm({
  settings,
  onSettingsChange,
  onSave,
}: PrinterSettingsFormProps) {
  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Printer className="h-5 w-5 text-primary" />
          Printer Settings
        </CardTitle>
        <CardDescription>
          Configure default printer and printing options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="default-printer" className="text-sm font-medium">
            Default Printer
          </Label>
          <Input
            id="default-printer"
            placeholder="Select or enter printer name"
            value={settings.defaultPrinter}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                defaultPrinter: e.target.value,
              })
            }
            className="border-2 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paper-size" className="text-sm font-medium">
              Paper Size
            </Label>
            <Select
              value={settings.paperSize}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, paperSize: value })
              }
            >
              <SelectTrigger id="paper-size" className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80mm">80mm (Receipt)</SelectItem>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="copies" className="text-sm font-medium">
              Default Copies
            </Label>
            <Input
              id="copies"
              type="number"
              min="1"
              max="10"
              value={settings.copies}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  copies: parseInt(e.target.value) || 1,
                })
              }
              className="border-2 focus:border-primary"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50">
        <Button onClick={onSave} className="gap-2 shadow-sm">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
