"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePosData, type Product } from "@/components/pos-data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { InventorySummaryCards } from "./components/InventorySummaryCards";
import { InventoryFilters } from "./components/InventoryFilters";
import { InventoryTable } from "./components/InventoryTable";
import { StockAdjustmentDialog } from "./components/StockAdjustmentDialog";

export default function InventoryPage() {
  const { products, categories, adjustStock } = usePosData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.includes(searchQuery);

      const matchesCategory =
        filterCategory === "all" || product.categoryId === filterCategory;

      let matchesStockStatus = true;
      if (stockStatus === "in_stock") {
        matchesStockStatus = product.stock > 5;
      } else if (stockStatus === "low_stock") {
        matchesStockStatus = product.stock > 0 && product.stock <= 5;
      } else if (stockStatus === "out_of_stock") {
        matchesStockStatus = product.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStockStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "stock") {
        return a.stock - b.stock;
      } else if (sortBy === "category") {
        return a.category.name.localeCompare(b.category.name);
      } else if (sortBy === "value") {
        const valueA = (a.cost || 0) * a.stock;
        const valueB = (b.cost || 0) * b.stock;
        return valueA - valueB;
      }
      return 0;
    });

  const handleAdjust = (product: Product) => {
    setSelectedProduct(product);
    setIsAdjustDialogOpen(true);
  };

  const handleAdjustStock = async (
    productId: string,
    quantity: number,
    type: "adjustment" | "sale" | "purchase" | "return" | "transfer",
    reason?: string,
    notes?: string
  ) => {
    await adjustStock(productId, quantity, type, reason, notes);
  };

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
      className="space-y-6 overflow-hidden min-w-0"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Manage your inventory levels and stock movements
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants}>
        <InventorySummaryCards products={products} />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6">
            <InventoryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterCategory={filterCategory}
              onFilterCategoryChange={setFilterCategory}
              stockStatus={stockStatus}
              onStockStatusChange={setStockStatus}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              categories={categories}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Inventory Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Inventory Overview
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} of {products.length} products
              </p>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden min-w-0 p-0">
            <InventoryTable
              products={filteredProducts}
              onAdjust={handleAdjust}
              itemVariants={itemVariants}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        isOpen={isAdjustDialogOpen}
        onOpenChange={setIsAdjustDialogOpen}
        product={selectedProduct}
        onAdjust={handleAdjustStock}
      />
    </motion.div>
  );
}
