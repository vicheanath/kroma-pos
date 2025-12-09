"use client";

import { motion } from "framer-motion";
import { usePosData } from "@/components/pos-data-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BarChart3, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default function InventoryReportsPage() {
  const { products } = usePosData();

  const lowStockThreshold = 5;
  const lowStockProducts = products
    .filter((p) => p.stock > 0 && p.stock <= lowStockThreshold)
    .sort((a, b) => a.stock - b.stock);
  const outOfStockProducts = products
    .filter((p) => p.stock === 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalValue = products.reduce((sum, product) => {
    const cost = product.cost || 0;
    return sum + product.stock * cost;
  }, 0);

  const categoryValue = products.reduce((acc, product) => {
    const categoryName = product.category.name;
    const value = (product.cost || 0) * product.stock;
    acc[categoryName] = (acc[categoryName] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

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
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Inventory Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Analyze your inventory status and value
            </p>
          </div>
        </div>
      </motion.div>

      {/* Low Stock Report */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Report
            </CardTitle>
            <CardDescription>
              Products with stock levels below {lowStockThreshold} units
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <AlertTriangle className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No low stock items</EmptyTitle>
                  <EmptyDescription>
                    All products have adequate stock levels.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {product.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.stock}</Badge>
                        </TableCell>
                        <TableCell>${(product.cost || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          ${((product.cost || 0) * product.stock).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Out of Stock Report */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Out of Stock Report
            </CardTitle>
            <CardDescription>
              Products with zero stock that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {outOfStockProducts.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <XCircle className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No out of stock items</EmptyTitle>
                  <EmptyDescription>
                    All products have stock available.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outOfStockProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {product.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>${(product.cost || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stock Value Report */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Stock Value Report
            </CardTitle>
            <CardDescription>Total inventory value by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                <div className="text-sm text-muted-foreground">
                  Total Inventory Value
                </div>
                <div className="text-3xl font-bold text-primary">
                  ${totalValue.toFixed(2)}
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(categoryValue)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, value]) => (
                        <TableRow key={category} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {category}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${value.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {totalValue > 0
                              ? ((value / totalValue) * 100).toFixed(1)
                              : "0"}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
