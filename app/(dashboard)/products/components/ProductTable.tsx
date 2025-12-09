"use client";

import { AnimatePresence } from "framer-motion";
import { type Product } from "@/components/pos-data-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Package } from "lucide-react";
import { ProductTableRow } from "./ProductTableRow";

interface ProductTableProps {
  products: Product[];
  searchQuery: string;
  filterCategory: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  itemVariants: any;
}

export function ProductTable({
  products,
  searchQuery,
  filterCategory,
  onEdit,
  onDelete,
  itemVariants,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto min-w-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Product</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold">Stock</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  variants={itemVariants}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>No products found</EmptyTitle>
                      <EmptyDescription>
                        {searchQuery || filterCategory !== "all"
                          ? "Try adjusting your search or filter criteria."
                          : "Get started by adding your first product."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
