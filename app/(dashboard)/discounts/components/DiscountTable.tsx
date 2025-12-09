"use client";

import { type Discount } from "@/lib/db";
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
import { Tag } from "lucide-react";
import { DiscountTableRow } from "./DiscountTableRow";

interface DiscountTableProps {
  discounts: Discount[];
  onEdit: (discount: Discount) => void;
  onDelete: (id: string) => void;
}

export function DiscountTable({
  discounts,
  onEdit,
  onDelete,
}: DiscountTableProps) {
  return (
    <div className="overflow-x-auto min-w-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Applies To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.length > 0 ? (
            discounts.map((discount) => (
              <DiscountTableRow
                key={discount.id}
                discount={discount}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-8">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Tag className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No discounts found</EmptyTitle>
                    <EmptyDescription>
                      Create your first discount to start offering promotions to
                      customers.
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
