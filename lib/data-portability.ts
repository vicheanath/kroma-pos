import { type AppSettings, Category, Product, ReceiptSettings, Sale } from "./db"
type ExportData = {
  products: Product[]
  categories: Category[]
  sales: Sale[]
  receiptSettings: ReceiptSettings
  appSettings: AppSettings
  exportDate: string
  version: string
}

// Export all data from IndexedDB
export const exportAllData = async (): Promise<ExportData> => {
  try {
    const products = await getProducts()
    const categories = await getCategories()
    const sales = await getSales()
    const receiptSettings = await getReceiptSettings()
    const appSettings = await getAppSettings()

    return {
      products,
      categories,
      sales,
      receiptSettings,
      appSettings,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    throw new Error("Failed to export data")
  }
}

// Import data into IndexedDB
export const importAllData = async (data: ExportData | File): Promise<void> => {
  try {
    let importData: ExportData

    if (data instanceof File) {
      // If data is a File, read it as JSON
      const text = await data.text()
      importData = JSON.parse(text)
    } else {
      // Otherwise, use the data directly
      importData = data
    }

    // Validate the data
    if (!importData.products || !importData.categories || !importData.version) {
      throw new Error("Invalid import data format")
    }

    // Import products
    for (const product of importData.products) {
      await addProduct(product)
    }

    // Import categories
    for (const category of importData.categories) {
      await addCategory(category)
    }

    // Import sales
    for (const sale of importData.sales) {
      await addSale(sale)
    }

    // Import receipt settings
    if (importData.receiptSettings) {
      await saveReceiptSettings(importData.receiptSettings)
    }

    // Import app settings
    if (importData.appSettings) {
      await saveAppSettings(importData.appSettings)
    }
  } catch (error) {
    console.error("Error importing data:", error)
    throw new Error("Failed to import data")
  }
}
