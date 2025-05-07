import {
  type AppSettings,
  categoriesApi,
  Category,
  Product,
  productsApi,
  ReceiptSettings,
  Sale,
  salesApi,
  settingsApi,
} from "./db";
type ExportData = {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  appSettings: AppSettings;
  exportDate: string;
  version: string;
};

// Export all data from IndexedDB
export const exportAllData = async (): Promise<ExportData> => {
  try {
    const products = await productsApi.getAll();
    const categories = await categoriesApi.getAll();
    const sales = await salesApi.getAll();
    const appSettings = await settingsApi.getAppSettings();

    return {
      products,
      categories,
      sales,
      appSettings,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
  } catch (error) {
    console.error("Error exporting data:", error);
    throw new Error("Failed to export data");
  }
};

// Import data into IndexedDB
export const importAllData = async (data: ExportData | File): Promise<void> => {
  try {
    let importData: ExportData;

    if (data instanceof File) {
      // If data is a File, read it as JSON
      const text = await data.text();
      importData = JSON.parse(text);
    } else {
      // Otherwise, use the data directly
      importData = data;
    }

    // Validate the data
    if (
      !importData.products ||
      !importData.categories ||
      !importData.sales ||
      !importData.version
    ) {
      throw new Error("Invalid import data format");
    }

    // Import products
    for (const product of importData.products) {
      await productsApi.add(product);
    }

    // Import categories
    for (const category of importData.categories) {
      await categoriesApi.add(category);
    }

    // Import sales
    for (const sale of importData.sales) {
      await salesApi.add(sale);
    }

    // Import receipt settings (if present)
    if (importData.appSettings?.receiptSettings) {
      await settingsApi.saveReceiptSettings(
        importData.appSettings.receiptSettings
      );
    } else {
      console.warn("No receipt settings found in the imported data");
    }

    // Import app settings (if present)
    if (importData.appSettings) {
      await settingsApi.saveAppSettings(importData.appSettings);
    } else {
      console.warn("No app settings found in the imported data");
    }
  } catch (error) {
    console.error("Error importing data:", error);
    throw new Error("Failed to import data");
  }
};
