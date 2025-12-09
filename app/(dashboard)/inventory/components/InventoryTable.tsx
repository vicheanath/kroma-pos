"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import { Package } from "lucide-react";
import { InventoryTableRow } from "./InventoryTableRow";
import { type Product } from "@/components/pos-data-provider";
import { AnimatePresence } from "framer-motion";

interface InventoryTableProps {
  products: Product[];
  onAdjust: (product: Product) => void;
  itemVariants?: any;
}

export function InventoryTable({
  products,
  onAdjust,
  itemVariants,
}: InventoryTableProps) {
  if (products.length === 0) {
    return (
      <Empty
        icon={Package}
        title="No products found"
        description="No products match your current filters."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <InventoryTableRow
                key={product.id}
                product={product}
                onAdjust={onAdjust}
                variants={itemVariants}
              />
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
