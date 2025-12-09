"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  type StockMovement,
  type Product,
} from "@/components/pos-data-provider";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { History } from "lucide-react";

interface StockMovementHistoryProps {
  movements: StockMovement[];
  products: Product[];
}

export function StockMovementHistory({
  movements,
  products,
}: StockMovementHistoryProps) {
  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const getMovementTypeBadge = (type: StockMovement["type"]) => {
    const variants: Record<
      StockMovement["type"],
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      adjustment: { label: "Adjustment", variant: "default" },
      sale: { label: "Sale", variant: "destructive" },
      purchase: { label: "Purchase", variant: "secondary" },
      return: { label: "Return", variant: "outline" },
      transfer: { label: "Transfer", variant: "outline" },
    };

    const config = variants[type] || variants.adjustment;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (movements.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No stock movements</EmptyTitle>
          <EmptyDescription>
            Stock movement history will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Previous</TableHead>
            <TableHead>New</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {format(new Date(movement.date), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>{getProductName(movement.productId)}</TableCell>
              <TableCell>{getMovementTypeBadge(movement.type)}</TableCell>
              <TableCell>
                <span
                  className={
                    movement.quantity > 0
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </span>
              </TableCell>
              <TableCell>{movement.previousStock}</TableCell>
              <TableCell className="font-semibold">
                {movement.newStock}
              </TableCell>
              <TableCell>{movement.reason || "-"}</TableCell>
              <TableCell className="text-muted-foreground">
                {movement.notes || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
