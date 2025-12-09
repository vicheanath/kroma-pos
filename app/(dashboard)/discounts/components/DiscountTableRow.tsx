"use client";

import { type Discount } from "@/lib/db";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent, DollarSign, Edit, Trash2 } from "lucide-react";

interface DiscountTableRowProps {
  discount: Discount;
  onEdit: (discount: Discount) => void;
  onDelete: (id: string) => void;
}

export function DiscountTableRow({
  discount,
  onEdit,
  onDelete,
}: DiscountTableRowProps) {
  const formatDiscountValue = (discount: Discount) => {
    return discount.type === "percentage"
      ? `${discount.value}%`
      : `$${discount.value.toFixed(2)}`;
  };

  return (
    <TableRow key={discount.id}>
      <TableCell className="font-medium">{discount.name}</TableCell>
      <TableCell>{discount.code || "-"}</TableCell>
      <TableCell>
        <div className="flex items-center">
          {discount.type === "percentage" ? (
            <Percent className="mr-1 h-4 w-4 text-muted-foreground" />
          ) : (
            <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
          )}
          {formatDiscountValue(discount)}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {discount.appliesTo === "all"
            ? "All Products"
            : discount.appliesTo === "cart"
            ? "Cart Total"
            : discount.appliesTo === "category"
            ? "Categories"
            : "Specific Products"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={discount.isActive ? "default" : "secondary"}>
          {discount.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(discount)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(discount.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
