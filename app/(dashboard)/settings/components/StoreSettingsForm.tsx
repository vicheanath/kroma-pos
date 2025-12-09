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
import { Save } from "lucide-react";

interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: string;
}

interface StoreSettingsFormProps {
  settings: StoreSettings;
  onSettingsChange: (settings: StoreSettings) => void;
  onSave: () => void;
}

export function StoreSettingsForm({
  settings,
  onSettingsChange,
  onSave,
}: StoreSettingsFormProps) {
  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="h-5 w-5">🏪</span>
          Store Information
        </CardTitle>
        <CardDescription>
          Update your store details that will appear on receipts and reports.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="store-name" className="text-sm font-medium">
            Store Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="store-name"
            value={settings.name}
            onChange={(e) =>
              onSettingsChange({ ...settings, name: e.target.value })
            }
            className="border-2 focus:border-primary"
            placeholder="Enter store name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-address" className="text-sm font-medium">
            Address
          </Label>
          <Input
            id="store-address"
            value={settings.address}
            onChange={(e) =>
              onSettingsChange({ ...settings, address: e.target.value })
            }
            className="border-2 focus:border-primary"
            placeholder="Enter store address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="store-phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="store-phone"
              value={settings.phone}
              onChange={(e) =>
                onSettingsChange({ ...settings, phone: e.target.value })
              }
              className="border-2 focus:border-primary"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="store-email"
              type="email"
              value={settings.email}
              onChange={(e) =>
                onSettingsChange({ ...settings, email: e.target.value })
              }
              className="border-2 focus:border-primary"
              placeholder="contact@store.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-rate" className="text-sm font-medium">
            Default Tax Rate (%)
          </Label>
          <Input
            id="tax-rate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={settings.taxRate}
            onChange={(e) =>
              onSettingsChange({ ...settings, taxRate: e.target.value })
            }
            className="border-2 focus:border-primary"
            placeholder="7.5"
          />
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
