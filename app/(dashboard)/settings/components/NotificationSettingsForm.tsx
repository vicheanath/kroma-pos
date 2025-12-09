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
import { Switch } from "@/components/ui/switch";
import { Bell, Volume2, VolumeX, Save } from "lucide-react";

interface NotificationSettings {
  soundEnabled: boolean;
  lowStockAlert: boolean;
  saleNotification: boolean;
  errorNotifications: boolean;
}

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  onSave: () => void;
}

export function NotificationSettingsForm({
  settings,
  onSettingsChange,
  onSave,
}: NotificationSettingsFormProps) {
  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure notifications and sound preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label
              htmlFor="sound-enabled"
              className="flex items-center gap-2 text-sm font-medium"
            >
              {settings.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              Sound Effects
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable sound effects for actions and notifications.
            </p>
          </div>
          <Switch
            id="sound-enabled"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, soundEnabled: checked })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="low-stock-alert" className="text-sm font-medium">
              Low Stock Alerts
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when products are running low on stock.
            </p>
          </div>
          <Switch
            id="low-stock-alert"
            checked={settings.lowStockAlert}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, lowStockAlert: checked })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="sale-notification" className="text-sm font-medium">
              Sale Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Show notifications when a sale is completed.
            </p>
          </div>
          <Switch
            id="sale-notification"
            checked={settings.saleNotification}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, saleNotification: checked })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label
              htmlFor="error-notifications"
              className="text-sm font-medium"
            >
              Error Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Show notifications for errors and warnings.
            </p>
          </div>
          <Switch
            id="error-notifications"
            checked={settings.errorNotifications}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, errorNotifications: checked })
            }
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
