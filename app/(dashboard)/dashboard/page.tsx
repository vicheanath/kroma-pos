"use client";

import { usePosData } from "@/components/pos-data-provider";
import { useSubscription } from "@/components/subscription-provider";
import { useLicense } from "@/components/license-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "./components/StatsCard";
import { LicenseStatusCard } from "./components/LicenseStatusCard";
import { StoreInfoCard } from "./components/StoreInfoCard";
import { RecentSalesList } from "./components/RecentSalesList";
import { TopProductsList } from "./components/TopProductsList";
import { DollarSign, Package, ShoppingCart, Tags } from "lucide-react";

export default function DashboardPage() {
  const { products, sales, categories } = usePosData();
  const { tier, activeStore, canUseEnterpriseFeatures } = useSubscription();
  const { licenseInfo, licenseStatus } = useLicense();

  // Calculate total revenue
  const totalRevenue = sales.reduce((total, sale) => total + sale.total, 0);

  // Calculate total products
  const totalProducts = products.length;

  // Calculate total sales
  const totalSales = sales.length;

  // Calculate total categories
  const totalCategories = categories.length;

  // Find low stock products (less than 5 items)
  const lowStockProducts = products.filter((product) => product.stock < 5);

  // Animation variants
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
    <div className="space-y-6 overflow-hidden min-w-0">
      <LicenseStatusCard
        tier={tier}
        licenseStatus={licenseStatus}
        licenseInfo={licenseInfo}
      />

      <StoreInfoCard
        activeStore={activeStore}
        canUseEnterpriseFeatures={canUseEnterpriseFeatures}
      />

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-w-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          description="+20.1% from last month"
          icon={DollarSign}
          variants={itemVariants}
        />
        <StatsCard
          title="Products"
          value={totalProducts}
          description={
            totalProducts > 0
              ? `${products.filter((p) => p.stock < 10).length} low stock items`
              : "No products yet"
          }
          icon={Package}
          variants={itemVariants}
        />
        <StatsCard
          title="Sales"
          value={totalSales}
          description={
            totalSales > 0
              ? `${
                  sales.filter(
                    (s) =>
                      new Date(s.date).toDateString() ===
                      new Date().toDateString()
                  ).length
                } today`
              : "No sales yet"
          }
          icon={ShoppingCart}
          variants={itemVariants}
        />
        <StatsCard
          title="Categories"
          value={totalCategories}
          description={
            totalCategories > 0
              ? `${categories.length} total categories`
              : "No categories yet"
          }
          icon={Tags}
          variants={itemVariants}
        />
      </motion.div>

      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
              {lowStockProducts.length} products are running low on stock.
              Please restock soon.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2 min-w-0"
      >
        <RecentSalesList sales={sales} />
        <TopProductsList products={products} />
      </motion.div>
    </div>
  );
}
