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

interface SyncSettings {
  autoSync: boolean;
  syncInterval: string;
  syncOnStartup: boolean;
  syncOnShutdown: boolean;
}

interface SyncSettingsFormProps {
  settings: SyncSettings;
  onSettingsChange: (settings: SyncSettings) => void;
  onSave: () => void;
}

export function SyncSettingsForm({
  settings,
  onSettingsChange,
  onSave,
}: SyncSettingsFormProps) {
  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="h-5 w-5">☁️</span>
          Sync Settings
        </CardTitle>
        <CardDescription>
          Configure how your POS system syncs data with the cloud.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync" className="text-sm font-medium">
              Auto Sync
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically sync data with the cloud.
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={settings.autoSync}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, autoSync: checked })
            }
          />
        </div>

        {settings.autoSync && (
          <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
            <Label htmlFor="sync-interval" className="text-sm font-medium">
              Sync Interval (minutes)
            </Label>
            <Input
              id="sync-interval"
              type="number"
              min="1"
              value={settings.syncInterval}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  syncInterval: e.target.value,
                })
              }
              className="border-2 focus:border-primary"
              placeholder="15"
            />
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="sync-startup" className="text-sm font-medium">
              Sync on Startup
            </Label>
            <p className="text-sm text-muted-foreground">
              Sync data when the application starts.
            </p>
          </div>
          <Switch
            id="sync-startup"
            checked={settings.syncOnStartup}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, syncOnStartup: checked })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="sync-shutdown" className="text-sm font-medium">
              Sync on Shutdown
            </Label>
            <p className="text-sm text-muted-foreground">
              Sync data when the application closes.
            </p>
          </div>
          <Switch
            id="sync-shutdown"
            checked={settings.syncOnShutdown}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, syncOnShutdown: checked })
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
