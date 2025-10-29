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
import { settingsApi } from "@/lib/db";
import { GoogleDriveSync } from "@/components/google-drive-sync";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Printer,
  Bell,
  Globe,
  DollarSign,
  Calendar,
  Save,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings: receiptSettings, updateSettings: updateReceiptSettings } =
    useReceiptSettings();

  const [storeSettings, setStoreSettings] = useState({
    name: "My Store",
    address: "123 Main St, City, Country",
    phone: "+1 (555) 123-4567",
    email: "contact@mystore.com",
    taxRate: "7.5",
  });

  const [appSettings, setAppSettings] = useState({
    currencySymbol: "$",
    currencyCode: "USD",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    language: "en",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    soundEnabled: true,
    lowStockAlert: true,
    saleNotification: true,
    errorNotifications: true,
  });

  const [printerSettings, setPrinterSettings] = useState({
    defaultPrinter: "",
    paperSize: "80mm",
    copies: 1,
  });

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: "15",
    syncOnStartup: true,
    syncOnShutdown: true,
  });

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load receipt settings
        if (receiptSettings) {
          setStoreSettings({
            name: receiptSettings.storeName || "My Store",
            address: receiptSettings.storeAddress || "123 Main St, City, Country",
            phone: receiptSettings.storePhone || "+1 (555) 123-4567",
            email: receiptSettings.storeEmail || "contact@mystore.com",
            taxRate: receiptSettings.taxRate?.toString() || "7.5",
          });
          setAppSettings((prev) => ({
            ...prev,
            currencySymbol: receiptSettings.currencySymbol || "$",
          }));
        }

        // Load app settings
        const appSettingsData = await settingsApi.getAppSettings();
        if (appSettingsData) {
          setAppSettings((prev) => ({
            ...prev,
            currencySymbol: appSettingsData.currencySymbol || prev.currencySymbol,
            currencyCode: appSettingsData.currencyCode || prev.currencyCode,
            dateFormat: appSettingsData.dateFormat || prev.dateFormat,
            timeFormat: appSettingsData.timeFormat || prev.timeFormat,
            language: appSettingsData.language || prev.language,
          }));
          // Only set if properties exist (they may not be in AppSettings type)
          if ((appSettingsData as any).soundEnabled !== undefined) {
            setNotificationSettings((prev) => ({
              ...prev,
              soundEnabled: (appSettingsData as any).soundEnabled ?? prev.soundEnabled,
              lowStockAlert: (appSettingsData as any).lowStockAlert ?? prev.lowStockAlert,
              saleNotification: (appSettingsData as any).saleNotification ?? prev.saleNotification,
              errorNotifications: (appSettingsData as any).errorNotifications ?? prev.errorNotifications,
            }));
          }
          if ((appSettingsData as any).defaultPrinter !== undefined) {
            setPrinterSettings((prev) => ({
              ...prev,
              defaultPrinter: (appSettingsData as any).defaultPrinter || prev.defaultPrinter,
              paperSize: (appSettingsData as any).paperSize || prev.paperSize,
              copies: (appSettingsData as any).copies || prev.copies,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, [receiptSettings]);

  const handleSaveStoreSettings = async () => {
    try {
      await updateReceiptSettings({
        storeName: storeSettings.name,
        storeAddress: storeSettings.address,
        storePhone: storeSettings.phone,
        storeEmail: storeSettings.email,
        taxRate: Number.parseFloat(storeSettings.taxRate),
        currencySymbol: appSettings.currencySymbol,
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

  const handleSaveAppSettings = async () => {
    try {
      await settingsApi.saveAppSettings({
        ...appSettings,
        ...notificationSettings,
        ...printerSettings,
      } as any);

      toast({
        title: "App Settings Saved",
        description: "Your application settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save app settings:", error);
      toast({
        title: "Error",
        description: "Failed to save app settings",
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
    // TODO: Implement sync settings persistence
    toast({
      title: "Sync Settings Saved",
      description: "Your sync settings have been saved successfully.",
    });
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    try {
      await settingsApi.updateTheme(newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
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

  const currencyOptions = [
    { symbol: "$", code: "USD", name: "US Dollar" },
    { symbol: "€", code: "EUR", name: "Euro" },
    { symbol: "£", code: "GBP", name: "British Pound" },
    { symbol: "¥", code: "JPY", name: "Japanese Yen" },
    { symbol: "₽", code: "RUB", name: "Russian Ruble" },
    { symbol: "₹", code: "INR", name: "Indian Rupee" },
    { symbol: "₩", code: "KRW", name: "South Korean Won" },
    { symbol: "₪", code: "ILS", name: "Israeli Shekel" },
    { symbol: "₨", code: "PKR", name: "Pakistani Rupee" },
    { symbol: "₦", code: "NGN", name: "Nigerian Naira" },
    { symbol: "R", code: "ZAR", name: "South African Rand" },
    { symbol: "R$", code: "BRL", name: "Brazilian Real" },
    { symbol: "₡", code: "CRC", name: "Costa Rican Colón" },
    { symbol: "₱", code: "PHP", name: "Philippine Peso" },
    { symbol: "KHR", code: "KHR", name: "Cambodian Riel" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 overflow-hidden min-w-0"
    >
      <motion.div variants={itemVariants} className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences.
        </p>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6">
        <motion.div variants={itemVariants}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-2xl overflow-x-auto">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="general" className="space-y-6">
          {/* Store Information */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
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
                    step="0.1"
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
                <Button onClick={handleSaveStoreSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Currency & Locale */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency & Locale
                </CardTitle>
                <CardDescription>
                  Configure currency and date/time formats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={appSettings.currencyCode}
                      onValueChange={(value) => {
                        const currency = currencyOptions.find((c) => c.code === value);
                        if (currency) {
                          setAppSettings({
                            ...appSettings,
                            currencyCode: currency.code,
                            currencySymbol: currency.symbol,
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="currency">
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
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={appSettings.language}
                      onValueChange={(value) =>
                        setAppSettings({ ...appSettings, language: value })
                      }
                    >
                      <SelectTrigger id="language">
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
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select
                      value={appSettings.dateFormat}
                      onValueChange={(value) =>
                        setAppSettings({ ...appSettings, dateFormat: value })
                      }
                    >
                      <SelectTrigger id="date-format">
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
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select
                      value={appSettings.timeFormat}
                      onValueChange={(value) =>
                        setAppSettings({ ...appSettings, timeFormat: value })
                      }
                    >
                      <SelectTrigger id="time-format">
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
              <CardFooter>
                <Button onClick={handleSaveAppSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Printer Settings */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Printer Settings
                </CardTitle>
                <CardDescription>
                  Configure default printer and printing options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-printer">Default Printer</Label>
                  <Input
                    id="default-printer"
                    placeholder="Select or enter printer name"
                    value={printerSettings.defaultPrinter}
                    onChange={(e) =>
                      setPrinterSettings({
                        ...printerSettings,
                        defaultPrinter: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paper-size">Paper Size</Label>
                    <Select
                      value={printerSettings.paperSize}
                      onValueChange={(value) =>
                        setPrinterSettings({
                          ...printerSettings,
                          paperSize: value,
                        })
                      }
                    >
                      <SelectTrigger id="paper-size">
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
                    <Label htmlFor="copies">Default Copies</Label>
                    <Input
                      id="copies"
                      type="number"
                      min="1"
                      max="10"
                      value={printerSettings.copies}
                      onChange={(e) =>
                        setPrinterSettings({
                          ...printerSettings,
                          copies: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAppSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your POS system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleThemeChange("light")}
                        className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                          theme === "light"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Sun className={`h-8 w-8 mb-2 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="font-medium">Light</span>
                        {theme === "light" && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => handleThemeChange("dark")}
                        className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                          theme === "dark"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Moon className={`h-8 w-8 mb-2 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="font-medium">Dark</span>
                        {theme === "dark" && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => handleThemeChange("system")}
                        className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                          theme === "system"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Monitor className={`h-8 w-8 mb-2 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="font-medium">System</span>
                        {theme === "system" && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current theme: <span className="font-medium capitalize">{resolvedTheme || theme}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
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
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure notifications and sound preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-enabled" className="flex items-center gap-2">
                      {notificationSettings.soundEnabled ? (
                        <Volume2 className="h-4 w-4" />
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
                    checked={notificationSettings.soundEnabled}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        soundEnabled: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="low-stock-alert">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when products are running low on stock.
                    </p>
                  </div>
                  <Switch
                    id="low-stock-alert"
                    checked={notificationSettings.lowStockAlert}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        lowStockAlert: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sale-notification">Sale Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications when a sale is completed.
                    </p>
                  </div>
                  <Switch
                    id="sale-notification"
                    checked={notificationSettings.saleNotification}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        saleNotification: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="error-notifications">Error Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications for errors and warnings.
                    </p>
                  </div>
                  <Switch
                    id="error-notifications"
                    checked={notificationSettings.errorNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        errorNotifications: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAppSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-6">
            <GoogleDriveSync />
            
            <Card className="overflow-hidden">
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
                      min="1"
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
                <Button onClick={handleSaveSyncSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}