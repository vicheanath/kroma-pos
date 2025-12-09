"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  productsApi,
  categoriesApi,
  salesApi,
  stockMovementsApi,
  type Product as ProductType,
  type Category as CategoryType,
  type Sale as SaleType,
  type StockMovement as StockMovementType,
} from "@/lib/db";

export type Product = ProductType;
export type Category = CategoryType;
export type Sale = SaleType;
export type StockMovement = StockMovementType;

export type CartItem = {
  product: Product;
  quantity: number;
};

type PosDataContextType = {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  stockMovements: StockMovement[];
  addNewProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateExistingProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  addNewCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateExistingCategory: (category: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  recordSale: (sale: Omit<Sale, "id" | "date">) => Promise<Sale>;
  adjustStock: (
    productId: string,
    quantity: number,
    type: StockMovement["type"],
    reason?: string,
    notes?: string
  ) => Promise<void>;
  getStockMovements: (productId?: string) => StockMovement[];
  syncToCloud: () => Promise<void>;
  fetchData: () => Promise<void>;
};

const PosDataContext = createContext<PosDataContextType>({
  products: [],
  categories: [],
  sales: [],
  stockMovements: [],
  addNewProduct: async () => {},
  updateExistingProduct: async () => {},
  removeProduct: async () => {},
  addNewCategory: async () => {},
  updateExistingCategory: async () => {},
  removeCategory: async () => {},
  recordSale: async () => ({
    id: "",
    items: [],
    total: 0,
    paymentMethod: "",
    date: new Date(),
  }),
  adjustStock: async () => {},
  getStockMovements: () => [],
  syncToCloud: async () => {},
  fetchData: async () => {},
});

export function PosDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const { toast } = useToast();

  // Fetch all data
  const fetchData = async () => {
    try {
      const storedProducts = await productsApi.getAll();
      const storedCategories = await categoriesApi.getAll();
      const storedSales = await salesApi.getAll();
      const storedStockMovements = await stockMovementsApi.getAll();

      // Ensure state updates only after all data is fetched
      setProducts(storedProducts);
      setCategories(storedCategories);
      setSales(storedSales);
      setStockMovements(storedStockMovements);

      toast({
        title: "Data Loaded",
        description: "All data has been successfully loaded.",
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data from the database.",
        variant: "destructive",
      });
    }
  };

  // Initialize database
  useEffect(() => {
    fetchData();
  }, []);

  // Add a new product
  const addNewProduct = async (product: Omit<Product, "id">) => {
    try {
      const newProduct = { ...product, id: crypto.randomUUID() } as Product;
      await productsApi.add(newProduct);
      setProducts(await productsApi.getAll());
      toast({
        title: "Product Added",
        description: `${product.name} has been added to inventory`,
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  // Update an existing product
  const updateExistingProduct = async (product: Product) => {
    try {
      await productsApi.update(product);
      setProducts(await productsApi.getAll());
      toast({
        title: "Product Updated",
        description: `${product.name} has been updated`,
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  // Remove a product
  const removeProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(await productsApi.getAll());
      toast({
        title: "Product Removed",
        description: "Product has been removed from inventory",
      });
    } catch (error) {
      console.error("Failed to remove product:", error);
      toast({
        title: "Error",
        description: "Failed to remove product",
        variant: "destructive",
      });
    }
  };

  // Add a new category
  const addNewCategory = async (category: Omit<Category, "id">) => {
    try {
      const newCategory = { ...category, id: crypto.randomUUID() } as Category;

      await categoriesApi.add(newCategory);
      setCategories(await categoriesApi.getAll());
      toast({
        title: "Category Added",
        description: `${category.name} has been added`,
      });
    } catch (error) {
      console.error("Failed to add category:", error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  // Update an existing category
  const updateExistingCategory = async (category: Category) => {
    try {
      await categoriesApi.update(category);
      setCategories(await categoriesApi.getAll());
      toast({
        title: "Category Updated",
        description: `${category.name} has been updated`,
      });
    } catch (error) {
      console.error("Failed to update category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  // Remove a category
  const removeCategory = async (id: string) => {
    try {
      const productsInCategory = await productsApi.getByCategory(id);
      if (productsInCategory.length > 0) {
        toast({
          title: "Cannot Delete Category",
          description: `This category is used by ${productsInCategory.length} products. Please reassign or delete these products first.`,
          variant: "destructive",
        });
        return;
      }

      await categoriesApi.delete(id);
      setCategories(await categoriesApi.getAll());
      toast({
        title: "Category Removed",
        description: "Category has been removed",
      });
    } catch (error) {
      console.error("Failed to remove category:", error);
      toast({
        title: "Error",
        description: "Failed to remove category",
        variant: "destructive",
      });
    }
  };

  // Record a sale
  const recordSale = async (
    saleData: Omit<Sale, "id" | "date">
  ): Promise<Sale> => {
    try {
      const newSale: Sale = {
        ...saleData,
        id: crypto.randomUUID(),
        date: new Date(),
      };

      await salesApi.add(newSale);

      // Create stock movements for each item in the sale
      for (const item of saleData.items) {
        // Fetch the latest product data from database to ensure accurate stock
        const product = await productsApi.getById(item.productId);
        if (product) {
          const previousStock = product.stock;
          const newStock = Math.max(0, previousStock - item.quantity);

          // Update product stock
          await productsApi.update({
            ...product,
            stock: newStock,
          });

          // Create stock movement record
          const movement: StockMovement = {
            id: crypto.randomUUID(),
            productId: item.productId,
            type: "sale",
            quantity: -item.quantity, // Negative for removals
            previousStock,
            newStock,
            reason: "Sale",
            notes: `Sale ID: ${newSale.id}`,
            date: new Date(),
          };

          await stockMovementsApi.add(movement);
        }
      }

      // Refresh all data
      setProducts(await productsApi.getAll());
      setSales(await salesApi.getAll());
      setStockMovements(await stockMovementsApi.getAll());

      toast({
        title: "Sale Recorded",
        description: `Sale of $${newSale.total.toFixed(2)} has been recorded`,
      });

      return newSale;
    } catch (error) {
      console.error("Failed to record sale:", error);
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Adjust stock for a product
  const adjustStock = async (
    productId: string,
    quantity: number,
    type: StockMovement["type"] = "adjustment",
    reason?: string,
    notes?: string
  ): Promise<void> => {
    try {
      // Fetch the latest product data from database
      const product = await productsApi.getById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const previousStock = product.stock;
      // Calculate new stock (quantity can be positive or negative)
      const newStock = Math.max(0, previousStock + quantity);

      // Update product stock
      await productsApi.update({
        ...product,
        stock: newStock,
      });

      // Create stock movement record
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        productId,
        type,
        quantity,
        previousStock,
        newStock,
        reason: reason || "Manual adjustment",
        notes,
        date: new Date(),
      };

      await stockMovementsApi.add(movement);

      // Refresh data
      setProducts(await productsApi.getAll());
      setStockMovements(await stockMovementsApi.getAll());

      toast({
        title: "Stock Adjusted",
        description: `Stock for ${product.name} has been updated from ${previousStock} to ${newStock}`,
      });
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get stock movements for a product or all products
  const getStockMovements = (productId?: string): StockMovement[] => {
    if (productId) {
      return stockMovements.filter((m) => m.productId === productId);
    }
    return stockMovements;
  };

  // Sync to cloud
  const syncToCloud = async () => {
    // Placeholder for cloud sync logic
    toast({
      title: "Sync Complete",
      description: "All data has been synced to the cloud",
    });
  };

  return (
    <PosDataContext.Provider
      value={{
        products,
        categories,
        sales,
        stockMovements,
        addNewProduct,
        updateExistingProduct,
        removeProduct,
        addNewCategory,
        updateExistingCategory,
        removeCategory,
        recordSale,
        adjustStock,
        getStockMovements,
        syncToCloud,
        fetchData,
      }}
    >
      {children}
    </PosDataContext.Provider>
  );
}

export const usePosData = () => useContext(PosDataContext);
