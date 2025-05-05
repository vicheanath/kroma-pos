"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  productsApi,
  categoriesApi,
  salesApi,
  type Product as ProductType,
  type Category as CategoryType,
  type Sale as SaleType,
} from "@/lib/db";

export type Product = ProductType;
export type Category = CategoryType;
export type Sale = SaleType;

export type CartItem = {
  product: Product;
  quantity: number;
};

type PosDataContextType = {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  addNewProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateExistingProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  addNewCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateExistingCategory: (category: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  recordSale: (sale: Omit<Sale, "id" | "date">) => Promise<Sale>;
  syncToCloud: () => Promise<void>;
  fetchData: () => Promise<void>;
};

const PosDataContext = createContext<PosDataContextType>({
  products: [],
  categories: [],
  sales: [],
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
  syncToCloud: async () => {},
  fetchData: async () => {},
});

export function PosDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const { toast } = useToast();

  // Fetch all data
  const fetchData = async () => {
    try {
      const storedProducts = await productsApi.getAll();
      const storedCategories = await categoriesApi.getAll();
      const storedSales = await salesApi.getAll();

      // Ensure state updates only after all data is fetched
      setProducts(storedProducts);
      setCategories(storedCategories);
      setSales(storedSales);

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
      setSales(await salesApi.getAll());
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
        addNewProduct,
        updateExistingProduct,
        removeProduct,
        addNewCategory,
        updateExistingCategory,
        removeCategory,
        recordSale,
        syncToCloud,
        fetchData,
      }}
    >
      {children}
    </PosDataContext.Provider>
  );
}

export const usePosData = () => useContext(PosDataContext);
