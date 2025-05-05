import {
  initializeDatabase,
  productsApi,
  categoriesApi,
  salesApi,
  settingsApi,
  Product,
  Category,
  Sale,
  ReceiptSettings,
  AppSettings,
  DEFAULT_RECEIPT_SETTINGS,
  DEFAULT_APP_SETTINGS,
} from "./db";

// Ensure database is initialized
export const ensureDatabaseInitialized = async (): Promise<void> => {
  const initialized = await initializeDatabase();
  if (!initialized) {
    throw new Error("Failed to initialize database");
  }
};

// Get all products
export const getProducts = (): Promise<Product[]> => {
  return productsApi.getAll();
};

// Add a product
export const addProduct = (product: Product): Promise<void> => {
  return productsApi.add(product).then(() => {});
};

// Update a product
export const updateProduct = (product: Product): Promise<void> => {
  return productsApi.update(product);
};

// Delete a product
export const deleteProduct = (id: string): Promise<void> => {
  return productsApi.delete(id);
};

// Get all categories
export const getCategories = (): Promise<Category[]> => {
  return categoriesApi.getAll();
};

// Add a category
export const addCategory = (category: Category): Promise<void> => {
  return categoriesApi.add(category).then(() => {});
};

// Update a category
export const updateCategory = (category: Category): Promise<void> => {
  return categoriesApi.update(category);
};

// Delete a category
export const deleteCategory = (id: string): Promise<void> => {
  return categoriesApi.delete(id);
};

// Get all sales
export const getSales = (): Promise<Sale[]> => {
  return salesApi.getAll();
};

// Add a sale
export const addSale = (sale: Sale): Promise<void> => {
  return salesApi.add(sale).then(() => {});
};

// Get sales by date range
export const getSalesByDateRange = (
  startDate: Date,
  endDate: Date
): Promise<Sale[]> => {
  return salesApi.getByDateRange(startDate, endDate);
};

// Get top selling products
export const getTopSellingProducts = (
  limit = 5
): Promise<{ productId: string; totalSold: number }[]> => {
  return salesApi.getTopSellingProducts(limit);
};

// Get total revenue
export const getTotalRevenue = (): Promise<number> => {
  return salesApi.getTotalRevenue();
};

// Get receipt settings
export const getReceiptSettings = (): Promise<ReceiptSettings> => {
  return settingsApi.getReceiptSettings();
};

// Save receipt settings
export const saveReceiptSettings = (
  settings: ReceiptSettings
): Promise<void> => {
  return settingsApi.saveReceiptSettings(settings);
};

// Get app settings
export const getAppSettings = (): Promise<AppSettings> => {
  return settingsApi.getAppSettings();
};

// Save app settings
export const saveAppSettings = (settings: AppSettings): Promise<void> => {
  return settingsApi.saveAppSettings(settings);
};
