"use client";

import { AnimatePresence } from "framer-motion";
import { type Category } from "@/components/pos-data-provider";
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
import { Tags } from "lucide-react";
import { CategoryTableRow } from "./CategoryTableRow";

interface CategoryTableProps {
  categories: Category[];
  searchQuery: string;
  getProductCount: (categoryId: string) => number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  itemVariants: any;
}

export function CategoryTable({
  categories,
  searchQuery,
  getProductCount,
  onEdit,
  onDelete,
  itemVariants,
}: CategoryTableProps) {
  return (
    <div className="overflow-x-auto min-w-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {categories.map((category) => (
              <CategoryTableRow
                key={category.id}
                category={category}
                productCount={getProductCount(category.id)}
                onEdit={onEdit}
                onDelete={onDelete}
                variants={itemVariants}
              />
            ))}
          </AnimatePresence>

          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Tags className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No categories found</EmptyTitle>
                    <EmptyDescription>
                      {searchQuery
                        ? "Try adjusting your search criteria."
                        : "Get started by adding your first category."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
