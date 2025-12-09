"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { type Product } from "@/components/pos-data-provider";
import { ProductCard } from "./ProductCard";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Package, BarChart } from "lucide-react";

interface ProductTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchResults: Product[];
  products: Product[];
  searchQuery: string;
  activeCategory: string;
  currencySymbol: string;
  onAddToCart: (product: Product) => void;
  onQuickAdd: (e: React.MouseEvent, product: Product) => void;
  containerVariants: any;
  itemVariants: any;
  isTablet?: boolean;
}

export function ProductTabs({
  activeTab,
  onTabChange,
  searchResults,
  products,
  searchQuery,
  activeCategory,
  currencySymbol,
  onAddToCart,
  onQuickAdd,
  containerVariants,
  itemVariants,
  isTablet = false,
}: ProductTabsProps) {
  return (
    <Tabs
      defaultValue="all"
      value={activeTab}
      onValueChange={onTabChange}
      className="flex-1 overflow-hidden flex flex-col min-h-0 bg-card rounded-lg border border-border shadow-sm"
    >
      <div className="px-4 pt-4 flex-shrink-0">
        <TabsList className="grid grid-cols-4 h-11 bg-muted/50">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Popular
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Recent
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Favorites
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="all"
        className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col"
      >
        <div
          className={`flex-1 overflow-auto ${
            isTablet ? "p-3" : "p-2 sm:p-3"
          } min-h-0`}
        >
          {searchResults.length > 0 ? (
            <motion.div
              className={`grid ${
                isTablet
                  ? "grid-cols-4 gap-3"
                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
              } w-full min-w-0`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {searchResults.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onAddToCart={onAddToCart}
                  onQuickAdd={onQuickAdd}
                  variants={itemVariants}
                  isTablet={isTablet}
                />
              ))}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No products found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || activeCategory !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : products.length === 0
                      ? "No products available. Add products to get started."
                      : "Loading products..."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent
        value="popular"
        className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden"
      >
        <div
          className={`flex-1 overflow-auto ${
            isTablet ? "p-3" : "p-2 sm:p-3"
          } min-h-0`}
        >
          <motion.div
            className={`grid ${
              isTablet
                ? "grid-cols-4 gap-3"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
            } w-full min-w-0`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {searchResults
              .slice()
              .sort((a, b) => b.stock - a.stock)
              .slice(0, 10)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onAddToCart={onAddToCart}
                  onQuickAdd={onQuickAdd}
                  variants={itemVariants}
                  isTablet={isTablet}
                />
              ))}
          </motion.div>
        </div>
      </TabsContent>

      <TabsContent
        value="recent"
        className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden"
      >
        <div
          className={`flex-1 overflow-auto ${
            isTablet ? "p-3" : "p-2 sm:p-3"
          } min-h-0`}
        >
          <motion.div
            className={`grid ${
              isTablet
                ? "grid-cols-4 gap-3"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
            } w-full min-w-0`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {searchResults
              .slice()
              .reverse()
              .slice(0, 10)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onAddToCart={onAddToCart}
                  onQuickAdd={onQuickAdd}
                  variants={itemVariants}
                  isTablet={isTablet}
                />
              ))}
          </motion.div>
        </div>
      </TabsContent>

      <TabsContent
        value="favorites"
        className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden"
      >
        <div className="flex-1 overflow-auto p-1 min-h-0">
          <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart className="h-12 w-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Favorites feature coming soon</EmptyTitle>
                <EmptyDescription>
                  You'll be able to mark products as favorites for quick access
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
