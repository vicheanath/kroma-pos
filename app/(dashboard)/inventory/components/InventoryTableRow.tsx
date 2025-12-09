"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Package } from "lucide-react";
import { type Product } from "@/components/pos-data-provider";
import { motion } from "framer-motion";

interface InventoryTableRowProps {
  product: Product;
  onAdjust: (product: Product) => void;
  variants?: any;
}

export function InventoryTableRow({
  product,
  onAdjust,
  variants,
}: InventoryTableRowProps) {
  const getStockStatus = () => {
    if (product.stock === 0) {
      return { label: "Out of Stock", variant: "destructive" as const };
    } else if (product.stock <= 5) {
      return { label: "Low Stock", variant: "secondary" as const };
    }
    return { label: "In Stock", variant: "default" as const };
  };

  const stockStatus = getStockStatus();
  const inventoryValue = (product.cost || 0) * product.stock;

  return (
    <motion.tr
      variants={variants}
      className="hover:bg-muted/50 transition-colors"
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-10 h-10 rounded-md object-cover"
            />
          )}
          <div>
            <div className="font-semibold">{product.name}</div>
            {product.sku && (
              <div className="text-xs text-muted-foreground">
                SKU: {product.sku}
              </div>
            )}
            {product.barcode && (
              <div className="text-xs text-muted-foreground">
                Barcode: {product.barcode}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{product.category.name}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">{product.stock}</span>
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div className="font-medium">${(product.cost || 0).toFixed(2)}</div>
          <div className="text-muted-foreground">per unit</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-semibold text-lg">
          ${inventoryValue.toFixed(2)}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAdjust(product)}>
              <Package className="mr-2 h-4 w-4" />
              Adjust Stock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  );
}
