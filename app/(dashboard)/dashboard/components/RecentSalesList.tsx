"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ShoppingCart } from "lucide-react";
import { type Sale } from "@/components/pos-data-provider";

interface RecentSalesListProps {
  sales: Sale[];
}

export function RecentSalesList({ sales }: RecentSalesListProps) {
  return (
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
                  <p className="text-sm font-medium">
                    Sale #{sale.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sale.date).toLocaleString()}
                  </p>
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
  );
}
