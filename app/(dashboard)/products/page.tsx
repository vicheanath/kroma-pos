"use client";

import { useState } from "react";
import { usePosData, type Product } from "@/components/pos-data-provider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddProductDialog from "@/components/AddProductDialog";
import EditProductDialog from "@/components/EditProductDialog";
import DeleteProductDialog from "@/components/DeleteProductDialog";
import { ProductFilters } from "./components/ProductFilters";
import { LowStockAlert } from "./components/LowStockAlert";
import { ProductTable } from "./components/ProductTable";
import { Package } from "lucide-react";

export default function ProductsPage() {
  const {
    products,
    categories,
    addNewProduct,
    updateExistingProduct,
    removeProduct,
  } = usePosData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const handleAddProduct = (newProduct: Product) => {
    addNewProduct(newProduct);
    setIsAddDialogOpen(false);
    setCurrentProduct(null);
  };
  const handleEditProduct = (updatedProduct: Product) => {
    if (!currentProduct) return;
    updateExistingProduct(updatedProduct);
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.barcode?.includes(searchQuery);

      const matchesCategory =
        filterCategory === "all" || product.categoryId === filterCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        return a.price - b.price;
      } else if (sortBy === "stock") {
        return a.stock - b.stock;
      } else {
        return a.category.name.localeCompare(b.category.name);
      }
    });

  // Handle deleting a product
  const handleDeleteProduct = () => {
    if (!currentProduct) return;

    removeProduct(currentProduct.id);
    setIsDeleteDialogOpen(false);
    setCurrentProduct(null);
  };

  // Handle category change in edit mode
  const handleCategoryChange = (categoryId: string) => {
    if (!currentProduct) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (selectedCategory) {
      setCurrentProduct({
        ...currentProduct,
        categoryId,
        category: selectedCategory,
      });
    }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };
  return (
    <div className="space-y-6 overflow-hidden min-w-0">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and catalog
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-2 shadow-sm">
        <CardContent className="pt-6">
          <ProductFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            categories={categories}
            onAddProduct={() => setIsAddDialogOpen(true)}
          />
        </CardContent>
      </Card>

      <LowStockAlert products={products} />

      {/* Products Table */}
      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Product Inventory
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden min-w-0 p-0">
          <div className="rounded-md border">
            <ProductTable
              products={filteredProducts}
              searchQuery={searchQuery}
              filterCategory={filterCategory}
              onEdit={(product) => {
                setCurrentProduct(product);
                setIsEditDialogOpen(true);
              }}
              onDelete={(product) => {
                setCurrentProduct(product);
                setIsDeleteDialogOpen(true);
              }}
              itemVariants={itemVariants}
            />
          </div>
        </CardContent>
      </Card>

      <AddProductDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
        handleAddProduct={handleAddProduct}
      />

      <EditProductDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentProduct={currentProduct}
        setCurrentProduct={setCurrentProduct}
        categories={categories}
        handleEditProduct={handleEditProduct}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        currentProduct={currentProduct}
        handleDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}
