"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { type Product } from "@/components/pos-data-provider";

interface InventorySummaryCardsProps {
  products: Product[];
}

export function InventorySummaryCards({
  products,
}: InventorySummaryCardsProps) {
  const totalProducts = products.length;
  const lowStockThreshold = 5;
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= lowStockThreshold
  );
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const totalValue = products.reduce((sum, product) => {
    const cost = product.cost || 0;
    return sum + product.stock * cost;
  }, 0);

  const cards = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      description: "Products in inventory",
      className: "border-primary/20 bg-primary/5",
    },
    {
      title: "Low Stock",
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      description: `Products below ${lowStockThreshold} units`,
      className: "border-orange-500/20 bg-orange-500/5",
      variant: lowStockProducts.length > 0 ? "destructive" : undefined,
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts.length.toString(),
      icon: XCircle,
      description: "Products with zero stock",
      className: "border-red-500/20 bg-red-500/5",
      variant: outOfStockProducts.length > 0 ? "destructive" : undefined,
    },
    {
      title: "Total Value",
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      description: "Inventory value at cost",
      className: "border-green-500/20 bg-green-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`border-2 shadow-sm ${card.className}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
