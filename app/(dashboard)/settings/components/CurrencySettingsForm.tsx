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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Save } from "lucide-react";

interface CurrencySettings {
  currencySymbol: string;
  currencyCode: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
}

interface CurrencyOption {
  symbol: string;
  code: string;
  name: string;
}

interface CurrencySettingsFormProps {
  settings: CurrencySettings;
  onSettingsChange: (settings: CurrencySettings) => void;
  onSave: () => void;
  currencyOptions: CurrencyOption[];
}

export function CurrencySettingsForm({
  settings,
  onSettingsChange,
  onSave,
  currencyOptions,
}: CurrencySettingsFormProps) {
  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Currency & Locale
        </CardTitle>
        <CardDescription>
          Configure currency and date/time formats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
              Currency
            </Label>
            <Select
              value={settings.currencyCode}
              onValueChange={(value) => {
                const currency = currencyOptions.find((c) => c.code === value);
                if (currency) {
                  onSettingsChange({
                    ...settings,
                    currencyCode: currency.code,
                    currencySymbol: currency.symbol,
                  });
                }
              }}
            >
              <SelectTrigger id="currency" className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Language
            </Label>
            <Select
              value={settings.language}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, language: value })
              }
            >
              <SelectTrigger id="language" className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="km">ភាសាខ្មែរ (Khmer)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-format" className="text-sm font-medium">
              Date Format
            </Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, dateFormat: value })
              }
            >
              <SelectTrigger id="date-format" className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-format" className="text-sm font-medium">
              Time Format
            </Label>
            <Select
              value={settings.timeFormat}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, timeFormat: value })
              }
            >
              <SelectTrigger id="time-format" className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
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
