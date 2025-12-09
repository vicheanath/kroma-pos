"use client";

import { motion } from "framer-motion";
import { type Product } from "@/components/pos-data-provider";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, MoreVertical, Edit, Trash2 } from "lucide-react";

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  variants?: any;
}

export function ProductTableRow({
  product,
  onEdit,
  onDelete,
  variants,
}: ProductTableRowProps) {
  return (
    <motion.tr
      variants={variants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, height: 0 }}
      className="hover:bg-muted/50 transition-colors"
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border flex-shrink-0">
            {product.image ? (
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{product.name}</p>
            {product.barcode && (
              <p className="text-xs text-muted-foreground truncate">
                {product.barcode}
              </p>
            )}
            {product.sku && (
              <p className="text-xs text-muted-foreground truncate">
                SKU: {product.sku}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {product.category.name}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-semibold text-lg">
          ${product.price.toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              product.stock === 0
                ? "text-destructive"
                : product.stock <= 5
                ? "text-orange-500"
                : "text-green-600"
            }`}
          >
            {product.stock}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-muted-foreground">(Low)</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(product)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  );
}
