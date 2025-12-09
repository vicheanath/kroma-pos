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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { useReceiptSettings } from "@/components/receipt-settings-provider";

export function ReceiptSettingsForm() {
  const { settings, updateSettings } = useReceiptSettings();

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="h-5 w-5">🧾</span>
          Receipt Settings
        </CardTitle>
        <CardDescription>
          Customize how receipts are generated and printed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="show-logo" className="text-sm font-medium">
              Show Store Logo
            </Label>
            <p className="text-sm text-muted-foreground">
              Display your store logo at the top of receipts.
            </p>
          </div>
          <Switch
            id="show-logo"
            checked={settings.showLogo}
            onCheckedChange={(checked) => updateSettings({ showLogo: checked })}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="show-tax" className="text-sm font-medium">
              Show Tax Details
            </Label>
            <p className="text-sm text-muted-foreground">
              Display tax breakdown on receipts.
            </p>
          </div>
          <Switch
            id="show-tax"
            checked={settings.showTax}
            onCheckedChange={(checked) => updateSettings({ showTax: checked })}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="custom-message" className="text-sm font-medium">
              Add Custom Message
            </Label>
            <p className="text-sm text-muted-foreground">
              Include a custom message at the bottom of receipts.
            </p>
          </div>
          <Switch
            id="custom-message"
            checked={!!settings.thankYouMessage}
            onCheckedChange={(checked) =>
              updateSettings({
                thankYouMessage: checked ? "Thank you for your purchase!" : "",
              })
            }
          />
        </div>

        {settings.thankYouMessage && (
          <div className="space-y-2">
            <Label htmlFor="message-text" className="text-sm font-medium">
              Custom Message
            </Label>
            <Input
              id="message-text"
              value={settings.thankYouMessage}
              onChange={(e) =>
                updateSettings({ thankYouMessage: e.target.value })
              }
              className="border-2 focus:border-primary"
              placeholder="Enter custom message"
            />
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="print-auto" className="text-sm font-medium">
              Print Automatically
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically print receipt after each sale.
            </p>
          </div>
          <Switch
            id="print-auto"
            checked={settings.printAutomatically}
            onCheckedChange={(checked) =>
              updateSettings({ printAutomatically: checked })
            }
          />
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50">
        <Button
          onClick={() => updateSettings(settings)}
          className="gap-2 shadow-sm"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
