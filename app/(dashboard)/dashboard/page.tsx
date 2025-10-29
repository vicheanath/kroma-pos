"use client"

import { usePosData } from "@/components/pos-data-provider"
import { useSubscription } from "@/components/subscription-provider"
import { useLicense } from "@/components/license-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DollarSign, Package, ShoppingCart, AlertTriangle, Tags, Crown, ArrowRight } from "lucide-react"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { motion } from "framer-motion"
import { ElectronReadyIndicator } from "@/components/electron-ready-indicator"
import Link from "next/link"

export default function DashboardPage() {
  const { products, sales, categories } = usePosData()
  const { tier, activeStore, canUseEnterpriseFeatures } = useSubscription()
  const { licenseInfo, licenseStatus } = useLicense()

  // Calculate total revenue
  const totalRevenue = sales.reduce((total, sale) => total + sale.total, 0)

  // Calculate total products
  const totalProducts = products.length

  // Calculate total sales
  const totalSales = sales.length

  // Calculate total categories
  const totalCategories = categories.length

  // Find low stock products (less than 5 items)
  const lowStockProducts = products.filter((product) => product.stock < 5)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <div className="space-y-6 overflow-hidden min-w-0">
      {/* License Status */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                  <Crown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</h3>
                    <ElectronReadyIndicator />
                  </div>
                  <p className="text-muted-foreground">
                    {licenseStatus === "valid" && "Your license is active and valid."}
                    {licenseStatus === "trial" && `Trial mode: ${licenseInfo?.trialDaysLeft} days remaining.`}
                    {licenseStatus === "expired" && "Your license has expired. Please renew."}
                    {licenseStatus === "invalid" && "Invalid license. Please activate a valid license."}
                    {(licenseStatus === "checking" || licenseStatus === "unknown") && "Checking license status..."}
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/settings/subscription">
                  {tier !== "enterprise" ? "Upgrade Now" : "Manage Subscription"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Store Info */}
      {activeStore && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{activeStore.name}</h3>
                  <p className="text-muted-foreground">{activeStore.address}</p>
                </div>
                {canUseEnterpriseFeatures && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings/stores">Manage Stores</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-w-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {totalProducts > 0
                  ? `${products.filter((p) => p.stock < 10).length} low stock items`
                  : "No products yet"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">
                {totalSales > 0
                  ? `${sales.filter((s) => new Date(s.date).toDateString() === new Date().toDateString()).length} today`
                  : "No sales yet"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                {totalCategories > 0 ? `${categories.length} total categories` : "No categories yet"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {lowStockProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
              {lowStockProducts.length} products are running low on stock. Please restock soon.
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
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length > 0 ? (
              <div className="space-y-4">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Sale #{sale.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleString()}</p>
                    </div>
                    <p className="font-medium">${sale.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingCart className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No sales recorded yet</EmptyTitle>
                  <EmptyDescription>
                    Start making sales to see them appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products
                  .sort((a, b) => b.stock - a.stock)
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category.name}</p>
                        </div>
                      </div>
                      <p className="font-medium">${product.price.toFixed(2)}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Package className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No products added yet</EmptyTitle>
                  <EmptyDescription>
                    Add products to see your top sellers here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
