"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useReceiptSettings } from "@/components/receipt-settings-provider";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { settings: receiptSettings, updateSettings: updateReceiptSettings } =
    useReceiptSettings();

  const [storeSettings, setStoreSettings] = useState({
    name: "My Store",
    address: "123 Main St, City, Country",
    phone: "+1 (555) 123-4567",
    email: "contact@mystore.com",
    taxRate: "7.5",
  });

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: "15",
    syncOnStartup: true,
    syncOnShutdown: true,
  });

  // Load store settings from receipt settings
  useEffect(() => {
    if (receiptSettings) {
      setStoreSettings({
        name: receiptSettings.storeName || "My Store",
        address: receiptSettings.storeAddress || "123 Main St, City, Country",
        phone: receiptSettings.storePhone || "+1 (555) 123-4567",
        email: receiptSettings.storeEmail || "contact@mystore.com",
        taxRate: receiptSettings.taxRate?.toString() || "7.5",
      });
    }
  }, [receiptSettings]);

  const handleSaveStoreSettings = async () => {
    try {
      await updateReceiptSettings({
        storeName: storeSettings.name,
        storeAddress: storeSettings.address,
        storePhone: storeSettings.phone,
        storeEmail: storeSettings.email,
        taxRate: Number.parseFloat(storeSettings.taxRate),
      });

      toast({
        title: "Store Settings Saved",
        description: "Your store settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save store settings:", error);
      toast({
        title: "Error",
        description: "Failed to save store settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveReceiptSettings = async () => {
    try {
      await updateReceiptSettings(receiptSettings);

      toast({
        title: "Receipt Settings Saved",
        description: "Your receipt settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save receipt settings:", error);
      toast({
        title: "Error",
        description: "Failed to save receipt settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveSyncSettings = () => {
    toast({
      title: "Sync Settings Saved",
      description: "Your sync settings have been saved successfully.",
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences.
        </p>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6">
        <motion.div variants={itemVariants}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="general">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Update your store details that will appear on receipts and
                  reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input
                    id="store-name"
                    value={storeSettings.name}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-address">Address</Label>
                  <Input
                    id="store-address"
                    value={storeSettings.address}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Phone Number</Label>
                    <Input
                      id="store-phone"
                      value={storeSettings.phone}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-email">Email</Label>
                    <Input
                      id="store-email"
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={storeSettings.taxRate}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        taxRate: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveStoreSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your POS system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme-select">Theme</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full">
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                          Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                          Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                          System
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="receipts">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Receipt Settings</CardTitle>
                <CardDescription>
                  Customize how receipts are generated and printed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-logo">Show Store Logo</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your store logo at the top of receipts.
                    </p>
                  </div>
                  <Switch
                    id="show-logo"
                    checked={receiptSettings.showLogo}
                    onCheckedChange={(checked) =>
                      updateReceiptSettings({ showLogo: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-tax">Show Tax Details</Label>
                    <p className="text-sm text-muted-foreground">
                      Display tax breakdown on receipts.
                    </p>
                  </div>
                  <Switch
                    id="show-tax"
                    checked={receiptSettings.showTax}
                    onCheckedChange={(checked) =>
                      updateReceiptSettings({ showTax: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="custom-message">Add Custom Message</Label>
                    <p className="text-sm text-muted-foreground">
                      Include a custom message at the bottom of receipts.
                    </p>
                  </div>
                  <Switch
                    id="custom-message"
                    checked={!!receiptSettings.thankYouMessage}
                    onCheckedChange={(checked) =>
                      updateReceiptSettings({
                        thankYouMessage: checked
                          ? "Thank you for your purchase!"
                          : "",
                      })
                    }
                  />
                </div>

                {receiptSettings.thankYouMessage && (
                  <div className="space-y-2">
                    <Label htmlFor="message-text">Custom Message</Label>
                    <Input
                      id="message-text"
                      value={receiptSettings.thankYouMessage}
                      onChange={(e) =>
                        updateReceiptSettings({
                          thankYouMessage: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="print-auto">Print Automatically</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically print receipt after each sale.
                    </p>
                  </div>
                  <Switch
                    id="print-auto"
                    checked={receiptSettings.printAutomatically}
                    onCheckedChange={(checked) =>
                      updateReceiptSettings({ printAutomatically: checked })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveReceiptSettings}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="sync">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
                <CardDescription>
                  Configure how your POS system syncs data with the cloud.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-sync">Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data with the cloud.
                    </p>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={syncSettings.autoSync}
                    onCheckedChange={(checked) =>
                      setSyncSettings({ ...syncSettings, autoSync: checked })
                    }
                  />
                </div>

                {syncSettings.autoSync && (
                  <div className="space-y-2">
                    <Label htmlFor="sync-interval">
                      Sync Interval (minutes)
                    </Label>
                    <Input
                      id="sync-interval"
                      type="number"
                      value={syncSettings.syncInterval}
                      onChange={(e) =>
                        setSyncSettings({
                          ...syncSettings,
                          syncInterval: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sync-startup">Sync on Startup</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync data when the application starts.
                    </p>
                  </div>
                  <Switch
                    id="sync-startup"
                    checked={syncSettings.syncOnStartup}
                    onCheckedChange={(checked) =>
                      setSyncSettings({
                        ...syncSettings,
                        syncOnStartup: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sync-shutdown">Sync on Shutdown</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync data when the application closes.
                    </p>
                  </div>
                  <Switch
                    id="sync-shutdown"
                    checked={syncSettings.syncOnShutdown}
                    onCheckedChange={(checked) =>
                      setSyncSettings({
                        ...syncSettings,
                        syncOnShutdown: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSyncSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
