import Dexie from "dexie";
import {
  CURRENT_VERSION,
  SCHEMA_VERSIONS,
  getSchemaForVersion,
  runMigration,
  getMigrationDescription,
} from "./db-migrations";

// Define types
export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
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
  employeeId?: string;
  shiftId?: string;
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
  showBarcode: boolean;
};

export type DiscountType = "percentage" | "fixed";

export type Discount = {
  id: string;
  name: string;
  code?: string;
  type: DiscountType;
  value: number; // Percentage or fixed amount
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  appliesTo: "all" | "category" | "product" | "cart";
  categoryIds?: string[];
  productIds?: string[];
  usageLimit?: number;
  usageCount: number;
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

export type StockMovement = {
  id: string;
  productId: string;
  type: "adjustment" | "sale" | "purchase" | "return" | "transfer";
  quantity: number; // positive for additions, negative for removals
  previousStock: number;
  newStock: number;
  reason?: string;
  notes?: string;
  userId?: string;
  date: Date;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "cashier" | "staff";
  permissions?: string[];
  isActive: boolean;
  hireDate: Date;
  password?: string; // Hashed password for authentication
  notes?: string;
};

export type Shift = {
  id: string;
  employeeId: string;
  startTime: Date;
  endTime?: Date;
  status:
    | "scheduled"
    | "active"
    | "pending_completion"
    | "completed"
    | "cancelled";
  notes?: string;
};

export type ClosingReport = {
  id: string;
  shiftId: string;
  employeeId: string;
  date: Date;
  startCash: number;
  endCash: number;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  totalSales: number;
  totalTransactions: number;
  paymentMethods: Record<string, number>;
  salesByEmployee?: Record<string, number>;
  notes?: string;
  createdAt: Date;
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
  showBarcode: true,
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
  discounts!: Dexie.Table<Discount, string>;
  stockMovements!: Dexie.Table<StockMovement, string>;
  employees!: Dexie.Table<Employee, string>;
  shifts!: Dexie.Table<Shift, string>;
  closingReports!: Dexie.Table<ClosingReport, string>;

  constructor() {
    super("pos_system_db");

    // Dynamically define all versions from the migration system
    // This ensures consistency and makes it easier to add new versions
    for (let version = 1; version <= CURRENT_VERSION; version++) {
      const schema = getSchemaForVersion(version);
      const description = getMigrationDescription(version);

      if (version === 1) {
        // First version
        this.version(version).stores(schema);
      } else {
        // Subsequent versions with migration logic
        this.version(version)
          .stores(schema)
          .upgrade(async (tx) => {
            console.log(`Upgrading to version ${version}: ${description}`);
            await runMigration(version, tx);
          });
      }
    }

    // Map table properties to their respective tables
    this.products = this.table("products");
    this.categories = this.table("categories");
    this.sales = this.table("sales");
    this.settings = this.table("settings");
    this.discounts = this.table("discounts");
    this.stockMovements = this.table("stockMovements");
    this.employees = this.table("employees");
    this.shifts = this.table("shifts");
    this.closingReports = this.table("closingReports");
  }

  // Initialize with default settings if needed
  async initializeDefaults() {
    try {
      console.log("Initializing default settings...");

      // Check if tables exist and are accessible
      // Get expected tables from current schema version
      const expectedTables = Object.keys(getSchemaForVersion(CURRENT_VERSION));
      const versionMigratedTables = [
        "stockMovements", // Added in version 2
        "employees", // Added in version 3
        "shifts", // Added in version 3
        "closingReports", // Added in version 3
      ];

      for (const tableName of expectedTables) {
        try {
          // Try to access each table
          const count = await this.table(tableName).count();
          console.log(`Table ${tableName} exists with ${count} records`);
        } catch (error) {
          console.error(`Error accessing table ${tableName}:`, error);
          // Don't throw for version-migrated tables if they don't exist yet
          // (they might not exist if database is at an older version)
          if (!versionMigratedTables.includes(tableName)) {
            throw new Error(`Table ${tableName} is not accessible`);
          }
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

    // Open the database and wait for it to be ready
    await db.open();
    console.log("Database opened successfully");
    console.log(`Database version: ${db.verno} (expected: ${CURRENT_VERSION})`);

    // Verify version is correct
    if (db.verno !== CURRENT_VERSION) {
      if (db.verno < CURRENT_VERSION) {
        console.warn(
          `Database version ${db.verno} is older than current version ${CURRENT_VERSION}. Upgrade should have occurred.`
        );
      } else {
        console.warn(
          `Database version ${db.verno} is newer than current code version ${CURRENT_VERSION}. Code may need updating.`
        );
      }
    }

    // Wait for database to be fully ready (especially after version upgrades)
    // Check if database is open and latest tables are accessible
    const latestTables = Object.keys(getSchemaForVersion(CURRENT_VERSION));
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      if (db.isOpen()) {
        try {
          // Try to access a table that should exist in the current version
          // Use a table that exists in all versions (settings) first, then check version-specific tables
          await db.settings.count();

          // If we're at version 3+, check that new tables are accessible
          if (db.verno >= 3) {
            await db.employees.count();
          }

          console.log("Database tables are accessible");
          break;
        } catch (error: any) {
          // Table might not exist yet or upgrade in progress
          console.log(
            `Waiting for database tables... (retry ${
              retries + 1
            }/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, 200));
          retries++;
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }
    }

    // Verify database is open
    if (!db.isOpen()) {
      throw new Error("Database failed to open");
    }

    // Initialize default settings
    const defaultsInitialized = await db.initializeDefaults();
    if (!defaultsInitialized) {
      console.warn(
        "Failed to initialize default settings, but database is open"
      );
    }

    console.log("Database initialization complete");
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
export function getDB(): PosDatabase {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }
  // Ensure database is open
  if (db.isOpen() === false) {
    throw new Error(
      "Database is not open. Please wait for initialization to complete."
    );
  }
  return db;
}

// Products API with error handling
export const productsApi = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<Product[]> => {
    try {
      const db = getDB();
      const offset = (page - 1) * pageSize;

      const products = await db.products
        .offset(offset)
        .limit(pageSize)
        .toArray();

      const productsWithCategory = await Promise.all(
        products.map(async (product) => {
          const category = await db.categories.get(product.categoryId);
          return category ? { ...product, category } : product;
        })
      );

      return productsWithCategory as Product[];
    } catch (error) {
      console.error(
        "Error getting products with pagination and category:",
        error
      );
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

// Discounts API with error handling
export const discountsApi = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<Discount[]> => {
    try {
      const db = getDB();
      const offset = (page - 1) * pageSize;
      return await db.discounts.offset(offset).limit(pageSize).toArray();
    } catch (error) {
      console.error("Error fetching discounts:", error);
      return [];
    }
  },
  getById: async (id: string): Promise<Discount | undefined> => {
    try {
      const db = getDB();
      return await db.discounts.get(id);
    } catch (error) {
      console.error(`Error fetching discount by ID (${id}):`, error);
      return undefined;
    }
  },
  add: async (discount: Discount): Promise<string> => {
    try {
      const db = getDB();
      await db.discounts.add(discount);
      return discount.id;
    } catch (error) {
      console.error("Error adding discount:", error);
      throw error;
    }
  },
  update: async (discount: Discount): Promise<void> => {
    try {
      const db = getDB();
      await db.discounts.update(discount.id, discount);
    } catch (error) {
      console.error(`Error updating discount (${discount.id}):`, error);
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      const db = getDB();
      await db.discounts.delete(id);
    } catch (error) {
      console.error(`Error deleting discount (${id}):`, error);
      throw error;
    }
  },
  getByProduct: async (productId: string): Promise<Discount[]> => {
    try {
      const db = getDB();
      return await db.discounts
        .where("applicableProducts")
        .equals(productId)
        .toArray();
    } catch (error) {
      console.error(
        `Error fetching discounts for product (${productId}):`,
        error
      );
      return [];
    }
  },
  getByCategory: async (categoryId: string): Promise<Discount[]> => {
    try {
      const db = getDB();
      return await db.discounts
        .where("applicableCategories")
        .equals(categoryId)
        .toArray();
    } catch (error) {
      console.error(
        `Error fetching discounts for category (${categoryId}):`,
        error
      );
      return [];
    }
  },
  getActiveDiscounts: async (): Promise<Discount[]> => {
    try {
      const db = getDB();
      const now = new Date();
      return await db.discounts
        .filter((discount) => {
          const startDate = discount.startDate
            ? new Date(discount.startDate)
            : null;
          const endDate = discount.endDate ? new Date(discount.endDate) : null;
          return (
            (!startDate || now >= startDate) && (!endDate || now <= endDate)
          );
        })
        .toArray();
    } catch (error) {
      console.error("Error fetching active discounts:", error);
      return [];
    }
  },
  getActiveDiscountsByProduct: async (
    productId: string
  ): Promise<Discount[]> => {
    try {
      const db = getDB();
      const now = new Date();
      return await db.discounts
        .filter((discount) => {
          const startDate = discount.startDate
            ? new Date(discount.startDate)
            : null;
          const endDate = discount.endDate ? new Date(discount.endDate) : null;
          const isApplicable =
            !discount.productIds || discount.productIds.includes(productId);
          return (
            (!startDate || now >= startDate) &&
            (!endDate || now <= endDate) &&
            isApplicable
          );
        })
        .toArray();
    } catch (error) {
      console.error(
        `Error fetching active discounts for product (${productId}):`,
        error
      );
      return [];
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
  },
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
  version: number;
  expectedVersion: number;
  tables: Record<string, number>;
  error?: string;
}> {
  try {
    if (!db) {
      return {
        isHealthy: false,
        version: 0,
        expectedVersion: CURRENT_VERSION,
        tables: {},
        error: "Database not initialized",
      };
    }

    const expectedTables = Object.keys(getSchemaForVersion(CURRENT_VERSION));

    const tables: Record<string, number> = {};
    for (const tableName of expectedTables) {
      try {
        tables[tableName] = await db.table(tableName).count();
      } catch (error) {
        tables[tableName] = -1; // -1 indicates table doesn't exist or error
      }
    }

    return {
      isHealthy: db.verno === CURRENT_VERSION,
      version: db.verno,
      expectedVersion: CURRENT_VERSION,
      tables,
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      isHealthy: false,
      version: 0,
      expectedVersion: CURRENT_VERSION,
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

// Stock Movements API with error handling
export const stockMovementsApi = {
  getAll: async (): Promise<StockMovement[]> => {
    try {
      const db = getDB();
      const movements = await db.stockMovements.toArray();
      // Sort by date descending
      return movements.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("Error getting stock movements:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<StockMovement | undefined> => {
    try {
      const db = getDB();
      return await db.stockMovements.get(id);
    } catch (error) {
      console.error(`Error getting stock movement ${id}:`, error);
      return undefined;
    }
  },

  getByProductId: async (productId: string): Promise<StockMovement[]> => {
    try {
      const db = getDB();
      const movements = await db.stockMovements
        .where("productId")
        .equals(productId)
        .toArray();
      // Sort by date descending
      return movements.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error(
        `Error getting stock movements for product ${productId}:`,
        error
      );
      return [];
    }
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<StockMovement[]> => {
    try {
      const db = getDB();
      const movements = await db.stockMovements
        .where("date")
        .between(startDate, endDate, true, true)
        .toArray();
      // Sort by date descending
      return movements.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("Error getting stock movements by date range:", error);
      return [];
    }
  },

  getByType: async (type: StockMovement["type"]): Promise<StockMovement[]> => {
    try {
      const db = getDB();
      const movements = await db.stockMovements
        .where("type")
        .equals(type)
        .toArray();
      // Sort by date descending
      return movements.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error(`Error getting stock movements by type ${type}:`, error);
      return [];
    }
  },

  add: async (movement: StockMovement): Promise<string> => {
    try {
      const db = getDB();
      // Ensure date is a proper Date object
      if (!(movement.date instanceof Date)) {
        movement.date = new Date(movement.date);
      }
      await db.stockMovements.add(movement);
      return movement.id;
    } catch (error) {
      console.error("Error adding stock movement:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const db = getDB();
      await db.stockMovements.delete(id);
    } catch (error) {
      console.error(`Error deleting stock movement ${id}:`, error);
      throw error;
    }
  },
};

// Employees API with error handling
export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    try {
      const db = getDB();
      return await db.employees.toArray();
    } catch (error) {
      console.error("Error getting employees:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Employee | undefined> => {
    try {
      const db = getDB();
      return await db.employees.get(id);
    } catch (error) {
      console.error(`Error getting employee ${id}:`, error);
      return undefined;
    }
  },

  getActive: async (): Promise<Employee[]> => {
    try {
      const db = getDB();
      const allEmployees = await db.employees.toArray();
      return allEmployees.filter((e) => e.isActive === true);
    } catch (error) {
      console.error("Error getting active employees:", error);
      return [];
    }
  },

  getByRole: async (role: Employee["role"]): Promise<Employee[]> => {
    try {
      const db = getDB();
      return await db.employees.where("role").equals(role).toArray();
    } catch (error) {
      console.error(`Error getting employees by role ${role}:`, error);
      return [];
    }
  },

  add: async (employee: Employee): Promise<string> => {
    try {
      const db = getDB();
      await db.employees.add(employee);
      return employee.id;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    }
  },

  update: async (employee: Employee): Promise<void> => {
    try {
      const db = getDB();
      await db.employees.update(employee.id, employee);
    } catch (error) {
      console.error(`Error updating employee ${employee.id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const db = getDB();
      await db.employees.delete(id);
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },
};

// Shifts API with error handling
export const shiftsApi = {
  getAll: async (): Promise<Shift[]> => {
    try {
      const db = getDB();
      const shifts = await db.shifts.toArray();
      // Sort by startTime descending
      return shifts.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      console.error("Error getting shifts:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Shift | undefined> => {
    try {
      const db = getDB();
      return await db.shifts.get(id);
    } catch (error) {
      console.error(`Error getting shift ${id}:`, error);
      return undefined;
    }
  },

  getActiveShifts: async (): Promise<Shift[]> => {
    try {
      const db = getDB();
      return await db.shifts.where("status").equals("active").toArray();
    } catch (error) {
      console.error("Error getting active shifts:", error);
      return [];
    }
  },

  getByEmployeeId: async (employeeId: string): Promise<Shift[]> => {
    try {
      const db = getDB();
      const shifts = await db.shifts
        .where("employeeId")
        .equals(employeeId)
        .toArray();
      // Sort by startTime descending
      return shifts.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      console.error(`Error getting shifts for employee ${employeeId}:`, error);
      return [];
    }
  },

  getByDateRange: async (startDate: Date, endDate: Date): Promise<Shift[]> => {
    try {
      const db = getDB();
      const shifts = await db.shifts
        .where("startTime")
        .between(startDate, endDate, true, true)
        .toArray();
      // Sort by startTime descending
      return shifts.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      console.error("Error getting shifts by date range:", error);
      return [];
    }
  },

  add: async (shift: Shift): Promise<string> => {
    try {
      const db = getDB();
      // Ensure dates are proper Date objects
      if (!(shift.startTime instanceof Date)) {
        shift.startTime = new Date(shift.startTime);
      }
      if (shift.endTime && !(shift.endTime instanceof Date)) {
        shift.endTime = new Date(shift.endTime);
      }
      await db.shifts.add(shift);
      return shift.id;
    } catch (error) {
      console.error("Error adding shift:", error);
      throw error;
    }
  },

  update: async (shift: Shift): Promise<void> => {
    try {
      const db = getDB();
      // Ensure dates are proper Date objects
      if (!(shift.startTime instanceof Date)) {
        shift.startTime = new Date(shift.startTime);
      }
      if (shift.endTime && !(shift.endTime instanceof Date)) {
        shift.endTime = new Date(shift.endTime);
      }
      await db.shifts.update(shift.id, shift);
    } catch (error) {
      console.error(`Error updating shift ${shift.id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const db = getDB();
      await db.shifts.delete(id);
    } catch (error) {
      console.error(`Error deleting shift ${id}:`, error);
      throw error;
    }
  },
};

// Closing Reports API with error handling
export const closingReportsApi = {
  getAll: async (): Promise<ClosingReport[]> => {
    try {
      const db = getDB();
      const reports = await db.closingReports.toArray();
      // Sort by date descending
      return reports.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("Error getting closing reports:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<ClosingReport | undefined> => {
    try {
      const db = getDB();
      return await db.closingReports.get(id);
    } catch (error) {
      console.error(`Error getting closing report ${id}:`, error);
      return undefined;
    }
  },

  getByShiftId: async (shiftId: string): Promise<ClosingReport | undefined> => {
    try {
      const db = getDB();
      return await db.closingReports.where("shiftId").equals(shiftId).first();
    } catch (error) {
      console.error(
        `Error getting closing report for shift ${shiftId}:`,
        error
      );
      return undefined;
    }
  },

  getByEmployeeId: async (employeeId: string): Promise<ClosingReport[]> => {
    try {
      const db = getDB();
      const reports = await db.closingReports
        .where("employeeId")
        .equals(employeeId)
        .toArray();
      // Sort by date descending
      return reports.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error(
        `Error getting closing reports for employee ${employeeId}:`,
        error
      );
      return [];
    }
  },

  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<ClosingReport[]> => {
    try {
      const db = getDB();
      const reports = await db.closingReports
        .where("date")
        .between(startDate, endDate, true, true)
        .toArray();
      // Sort by date descending
      return reports.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("Error getting closing reports by date range:", error);
      return [];
    }
  },

  add: async (report: ClosingReport): Promise<string> => {
    try {
      const db = getDB();
      // Ensure dates are proper Date objects
      if (!(report.date instanceof Date)) {
        report.date = new Date(report.date);
      }
      if (!(report.createdAt instanceof Date)) {
        report.createdAt = new Date(report.createdAt);
      }
      await db.closingReports.add(report);
      return report.id;
    } catch (error) {
      console.error("Error adding closing report:", error);
      throw error;
    }
  },

  update: async (report: ClosingReport): Promise<void> => {
    try {
      const db = getDB();
      // Ensure dates are proper Date objects
      if (!(report.date instanceof Date)) {
        report.date = new Date(report.date);
      }
      if (!(report.createdAt instanceof Date)) {
        report.createdAt = new Date(report.createdAt);
      }
      await db.closingReports.update(report.id, report);
    } catch (error) {
      console.error(`Error updating closing report ${report.id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const db = getDB();
      await db.closingReports.delete(id);
    } catch (error) {
      console.error(`Error deleting closing report ${id}:`, error);
      throw error;
    }
  },
};

// Helper function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
