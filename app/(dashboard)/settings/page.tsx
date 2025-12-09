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
import { useToast } from "@/components/ui/use-toast";
import { useReceiptSettings } from "@/components/receipt-settings-provider";
import { useTheme } from "next-themes";
import { settingsApi } from "@/lib/db";
import { GoogleDriveSync } from "@/components/google-drive-sync";
import { StoreSettingsForm } from "./components/StoreSettingsForm";
import { CurrencySettingsForm } from "./components/CurrencySettingsForm";
import { PrinterSettingsForm } from "./components/PrinterSettingsForm";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { ReceiptSettingsForm } from "./components/ReceiptSettingsForm";
import { NotificationSettingsForm } from "./components/NotificationSettingsForm";
import { SyncSettingsForm } from "./components/SyncSettingsForm";

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
            address:
              receiptSettings.storeAddress || "123 Main St, City, Country",
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
            currencySymbol:
              appSettingsData.currencySymbol || prev.currencySymbol,
            currencyCode: appSettingsData.currencyCode || prev.currencyCode,
            dateFormat: appSettingsData.dateFormat || prev.dateFormat,
            timeFormat: appSettingsData.timeFormat || prev.timeFormat,
            language: appSettingsData.language || prev.language,
          }));
          // Only set if properties exist (they may not be in AppSettings type)
          if ((appSettingsData as any).soundEnabled !== undefined) {
            setNotificationSettings((prev) => ({
              ...prev,
              soundEnabled:
                (appSettingsData as any).soundEnabled ?? prev.soundEnabled,
              lowStockAlert:
                (appSettingsData as any).lowStockAlert ?? prev.lowStockAlert,
              saleNotification:
                (appSettingsData as any).saleNotification ??
                prev.saleNotification,
              errorNotifications:
                (appSettingsData as any).errorNotifications ??
                prev.errorNotifications,
            }));
          }
          if ((appSettingsData as any).defaultPrinter !== undefined) {
            setPrinterSettings((prev) => ({
              ...prev,
              defaultPrinter:
                (appSettingsData as any).defaultPrinter || prev.defaultPrinter,
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your store settings and preferences.
            </p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6">
        <motion.div variants={itemVariants}>
          <Card className="border-2 shadow-sm">
            <CardContent className="pt-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1 bg-muted/50">
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="receipts"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Receipts
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="sync"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Sync
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </motion.div>

        <TabsContent value="general" className="space-y-6 mt-6">
          <motion.div variants={itemVariants}>
            <StoreSettingsForm
              settings={storeSettings}
              onSettingsChange={setStoreSettings}
              onSave={handleSaveStoreSettings}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CurrencySettingsForm
              settings={appSettings}
              onSettingsChange={setAppSettings}
              onSave={handleSaveAppSettings}
              currencyOptions={currencyOptions}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <PrinterSettingsForm
              settings={printerSettings}
              onSettingsChange={setPrinterSettings}
              onSave={handleSaveAppSettings}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <motion.div variants={itemVariants}>
            <AppearanceSettings onThemeChange={handleThemeChange} />
          </motion.div>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6 mt-6">
          <motion.div variants={itemVariants}>
            <ReceiptSettingsForm />
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <motion.div variants={itemVariants}>
            <NotificationSettingsForm
              settings={notificationSettings}
              onSettingsChange={setNotificationSettings}
              onSave={handleSaveAppSettings}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6 mt-6">
          <motion.div variants={itemVariants} className="space-y-6">
            <GoogleDriveSync />
            <SyncSettingsForm
              settings={syncSettings}
              onSettingsChange={setSyncSettings}
              onSave={handleSaveSyncSettings}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
