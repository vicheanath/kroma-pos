import Dexie from "dexie";

// Define types
export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryId: string;
  image: string;
  stock: number;
  barcode?: string;
  description?: string;
  sku?: string;
  cost?: number;
  taxable?: boolean;
  taxRate?: number;
  tags?: string[];
  attributes?: Record<string, string>;
  variations?: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
};

export type Sale = {
  id: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    product?: any;
  }>;
  total: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
  paymentMethod: string;
  date: Date;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  receiptNumber?: string;
};

export type ReceiptSettings = {
  id: string;
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeWebsite?: string;
  storeLogo?: string;
  logoSize: number;
  showLogo: boolean;
  taxRate: number;
  showTax: boolean;
  currency: string;
  currencySymbol: string;
  footerText?: string;
  headerText?: string;
  showDiscounts: boolean;
  showItemizedTax: boolean;
  printAutomatically: boolean;
  receiptWidth: number;
  fontSize: number;
  fontFamily: string;
  thankYouMessage?: string;
  returnPolicy?: string;
  receiptTemplate?: string;
};

export type AppSettings = {
  id: string;
  theme: "light" | "dark" | "system";
  language: string;
  defaultTaxRate: number;
  defaultDiscountRate: number;
  currencyCode: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  sidebarCollapsed?: boolean;
  receiptSettings?: ReceiptSettings;
};

// Default settings
export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  id: "receipt_settings",
  storeName: "My Store",
  storeAddress: "123 Main St, City, Country",
  storePhone: "+1 (555) 123-4567",
  storeEmail: "contact@mystore.com",
  storeWebsite: "www.mystore.com",
  showLogo: true,
  logoSize: 100,
  taxRate: 10,
  showTax: true,
  currency: "USD",
  currencySymbol: "$",
  footerText: "Thank you for your purchase!",
  headerText: "Receipt",
  showDiscounts: true,
  showItemizedTax: true,
  printAutomatically: false,
  receiptWidth: 300,
  fontSize: 12,
  fontFamily: "Arial",
  thankYouMessage: "Thank you for shopping with us!",
  returnPolicy: "Returns accepted within 30 days with receipt.",
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: "app_settings",
  theme: "system",
  language: "en",
  defaultTaxRate: 10,
  defaultDiscountRate: 0,
  currencyCode: "USD",
  currencySymbol: "$",
  dateFormat: "MM/dd/yyyy",
  timeFormat: "hh:mm a",
  sidebarCollapsed: false,
};

// Create Dexie database
class PosDatabase extends Dexie {
  // Define table properties
  products!: Dexie.Table<Product, string>;
  categories!: Dexie.Table<Category, string>;
  sales!: Dexie.Table<Sale, string>;
  settings!: Dexie.Table<AppSettings | ReceiptSettings, string>;

  constructor() {
    super("pos_system_db");

    // Define schema for all tables
    this.version(1).stores({
      products:
        "id, name, price, category, categoryId, barcode, stock, description, sku, cost, taxable, taxRate, tags, attributes, variations",
      categories: "id, name, description, color, icon",
      sales:
        "id, items, total, subtotal, tax, discount, discountType, paymentMethod, date, customerName, customerEmail, customerPhone, notes, receiptNumber",
      settings: "id",
    });

    // Map table properties to their respective tables
    this.products = this.table("products");
    this.categories = this.table("categories");
    this.sales = this.table("sales");
    this.settings = this.table("settings");
  }

  // Initialize with default settings if needed
  async initializeDefaults() {
    try {
      console.log("Initializing default settings...");

      // Check if tables exist and are accessible
      const tableNames = ["products", "categories", "sales", "settings"];
      for (const tableName of tableNames) {
        try {
          // Try to access each table
          const count = await this.table(tableName).count();
          console.log(`Table ${tableName} exists with ${count} records`);
        } catch (error) {
          console.error(`Error accessing table ${tableName}:`, error);
          throw new Error(`Table ${tableName} is not accessible`);
        }
      }

      // Check if receipt settings exist
      const receiptSettings = await this.settings.get("receipt_settings");
      if (!receiptSettings) {
        console.log("Adding default receipt settings");
        await this.settings.put(DEFAULT_RECEIPT_SETTINGS);
      } else {
        console.log("Receipt settings already exist");
      }

      // Check if app settings exist
      const appSettings = await this.settings.get("app_settings");
      if (!appSettings) {
        console.log("Adding default app settings");
        await this.settings.put(DEFAULT_APP_SETTINGS);
      } else {
        console.log("App settings already exist");
      }

      console.log("Default settings initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing default settings:", error);
      return false;
    }
  }
}

// Create database instance
let db: PosDatabase | null = null;

// Check if IndexedDB is supported
function isIndexedDBSupported(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      "indexedDB" in window &&
      window.indexedDB !== null
    );
  } catch (e) {
    return false;
  }
}

// Initialize database with robust error handling
export async function initializeDatabase(): Promise<boolean> {
  if (!isIndexedDBSupported()) {
    console.error("IndexedDB is not supported in this browser");
    return false;
  }

  try {
    console.log("Initializing database...");

    // Create database instance if it doesn't exist
    if (!db) {
      db = new PosDatabase();

      // Add event listeners for database errors
      db.on("ready", () => console.log("Database is ready"));
    }

    // Open the database
    await db.open();
    console.log("Database opened successfully");

    // Initialize default settings
    const defaultsInitialized = await db.initializeDefaults();
    if (!defaultsInitialized) {
      console.warn(
        "Failed to initialize default settings, but database is open"
      );
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);

    // Try to handle specific error cases
    if (error instanceof Dexie.DexieError) {
      console.error("Dexie error type:", error.name);

      if (error.name === "VersionError") {
        console.error(
          "Database version conflict. Attempting to delete and recreate database..."
        );
        try {
          // Delete the database and try again
          await Dexie.delete("pos_system_db");
          console.log("Database deleted, attempting to recreate...");
          db = new PosDatabase();
          await db.open();
          await db.initializeDefaults();
          console.log("Database recreated successfully");
          return true;
        } catch (recreateError) {
          console.error("Failed to recreate database:", recreateError);
        }
      }
    }

    // Return false to indicate initialization failure
    return false;
  }
}

// Get database instance with safety checks
function getDB(): PosDatabase {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }
  return db;
}

// Products API with error handling
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    try {
      const db = getDB();
      return await db.products.toArray();
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Product | undefined> => {
    try {
      const db = getDB();
      return await db.products.get(id);
    } catch (error) {
      console.error(`Error getting product ${id}:`, error);
      return undefined;
    }
  },

  add: async (product: Product): Promise<string> => {
    try {
      const db = getDB();
      console.log("Adding product:", product); // Debug log
      await db.products.add(product);
      console.log("Product added successfully:", product.id); // Debug log
      return product.id;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  update: async (product: Product): Promise<void> => {
    try {
      const db = getDB();
      console.log("Updating product:", product); // Debug log
      const updated = await db.products.update(product.id, product);
      if (updated) {
        console.log("Product updated successfully:", product.id); // Debug log
      } else {
        console.warn("No product found to update with ID:", product.id); // Debug log
      }
    } catch (error) {
      console.error(`Error updating product ${product.id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const db = getDB();
      await db.products.delete(id);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  getByCategory: async (categoryId: string): Promise<Product[]> => {
    try {
      const db = getDB();
      return await db.products.where("categoryId").equals(categoryId).toArray();
    } catch (error) {
      console.error(
        `Error getting products for category ${categoryId}:`,
        error
      );
      return [];
    }
  },
};

// Categories API with error handling
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    try {
      const db = getDB();
      return await db.categories.toArray();
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Category | undefined> => {
    try {
      const db = getDB();
      return await db.categories.get(id);
    } catch (error) {
      console.error(`Error getting category ${id}:`, error);
      return undefined;
    }
  },

  add: async (category: Category): Promise<string> => {
    try {
      const db = getDB();
      await db.categories.add(category);
      return category.id;
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  },

  update: async (category: Category): Promise<void> => {
    try {
      const db = getDB();
      await db.categories.update(category.id, category);
    } catch (error) {
      console.error(`Error updating category ${category.id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const db = getDB();
      await db.categories.delete(id);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  },
};

// Sales API with error handling
export const salesApi = {
  getAll: async (): Promise<Sale[]> => {
    try {
      const db = getDB();
      return await db.sales.toArray();
    } catch (error) {
      console.error("Error getting sales:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Sale | undefined> => {
    try {
      const db = getDB();
      return await db.sales.get(id);
    } catch (error) {
      console.error(`Error getting sale ${id}:`, error);
      return undefined;
    }
  },

  add: async (sale: Sale): Promise<string> => {
    try {
      const db = getDB();
      // Ensure date is a proper Date object
      if (!(sale.date instanceof Date)) {
        sale.date = new Date(sale.date);
      }
      await db.sales.add(sale);
      return sale.id;
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  },

  getByDateRange: async (startDate: Date, endDate: Date): Promise<Sale[]> => {
    try {
      const db = getDB();
      return await db.sales
        .where("date")
        .between(startDate, endDate, true, true)
        .toArray();
    } catch (error) {
      console.error(`Error getting sales by date range:`, error);
      return [];
    }
  },

  getTopSellingProducts: async (
    limit = 5
  ): Promise<{ productId: string; totalSold: number }[]> => {
    try {
      const db = getDB();
      const sales = await db.sales.toArray();
      const productCounts: Record<string, number> = {};

      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          if (productCounts[item.productId]) {
            productCounts[item.productId] += item.quantity;
          } else {
            productCounts[item.productId] = item.quantity;
          }
        });
      });

      return Object.entries(productCounts)
        .map(([productId, totalSold]) => ({ productId, totalSold }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting top selling products:", error);
      return [];
    }
  },

  getTotalRevenue: async (): Promise<number> => {
    try {
      const db = getDB();
      const sales = await db.sales.toArray();
      return sales.reduce((sum, sale) => sum + sale.total, 0);
    } catch (error) {
      console.error("Error getting total revenue:", error);
      return 0;
    }
  },
  getRevenueByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<number> => {
    try {
      const db = getDB();
      const sales = await db.sales
        .where("date")
        .between(startDate, endDate, true, true)
        .toArray();
      return sales.reduce((sum, sale) => sum + sale.total, 0);
    } catch (error) {
      console.error("Error getting revenue by date range:", error);
      return 0;
    }
  }
};

// Settings API with error handling
export const settingsApi = {
  getReceiptSettings: async (): Promise<ReceiptSettings> => {
    try {
      const db = getDB();
      const settings = (await db.settings.get("receipt_settings")) as
        | ReceiptSettings
        | undefined;
      return settings || DEFAULT_RECEIPT_SETTINGS;
    } catch (error) {
      console.error("Error getting receipt settings:", error);
      return DEFAULT_RECEIPT_SETTINGS;
    }
  },

  saveReceiptSettings: async (
    settings: Partial<ReceiptSettings>
  ): Promise<void> => {
    try {
      const db = getDB();
      const currentSettings = await settingsApi.getReceiptSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await db.settings.put(updatedSettings);
    } catch (error) {
      console.error("Error saving receipt settings:", error);
      throw error;
    }
  },

  getAppSettings: async (): Promise<AppSettings> => {
    try {
      const db = getDB();
      const settings = (await db.settings.get("app_settings")) as
        | AppSettings
        | undefined;
      return settings || DEFAULT_APP_SETTINGS;
    } catch (error) {
      console.error("Error getting app settings:", error);
      return DEFAULT_APP_SETTINGS;
    }
  },

  saveAppSettings: async (settings: Partial<AppSettings>): Promise<void> => {
    try {
      const db = getDB();
      const currentSettings = await settingsApi.getAppSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await db.settings.put(updatedSettings);
    } catch (error) {
      console.error("Error saving app settings:", error);
      throw error;
    }
  },

  updateTheme: async (theme: "light" | "dark" | "system"): Promise<void> => {
    try {
      await settingsApi.saveAppSettings({ theme });
    } catch (error) {
      console.error("Error updating theme:", error);
      throw error;
    }
  },

  updateSidebarCollapsed: async (collapsed: boolean): Promise<void> => {
    try {
      await settingsApi.saveAppSettings({ sidebarCollapsed: collapsed });
    } catch (error) {
      console.error("Error updating sidebar state:", error);
      throw error;
    }
  },
};

// Helper function to check database health
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  tables: Record<string, number>;
  error?: string;
}> {
  try {
    if (!db) {
      return {
        isHealthy: false,
        tables: {},
        error: "Database not initialized",
      };
    }

    const tables = {
      products: await db.products.count(),
      categories: await db.categories.count(),
      sales: await db.sales.count(),
      settings: await db.settings.count(),
    };

    return {
      isHealthy: true,
      tables,
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      isHealthy: false,
      tables: {},
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Helper function to reset database (for troubleshooting)
export async function resetDatabase(): Promise<boolean> {
  try {
    if (db) {
      db.close();
    }

    await Dexie.delete("pos_system_db");
    console.log("Database deleted successfully");

    // Reinitialize
    db = new PosDatabase();
    await db.open();
    await db.initializeDefaults();

    return true;
  } catch (error) {
    console.error("Failed to reset database:", error);
    return false;
  }
}

// Helper function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
