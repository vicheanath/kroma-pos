"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Percent, DollarSign } from "lucide-react";
import { type Discount, type DiscountType } from "@/lib/db";

type DiscountFormData = Omit<Discount, "id" | "usageCount">;

interface DiscountFormProps {
  discount: DiscountFormData;
  onChange: (discount: DiscountFormData) => void;
  showUsageCount?: boolean;
  usageCount?: number;
  usageLimit?: number;
}

export function DiscountForm({
  discount,
  onChange,
  showUsageCount = false,
  usageCount,
  usageLimit,
}: DiscountFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Discount Name</Label>
        <Input
          id="name"
          value={discount.name}
          onChange={(e) => onChange({ ...discount, name: e.target.value })}
          placeholder="Summer Sale"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Discount Code (Optional)</Label>
        <Input
          id="code"
          value={discount.code || ""}
          onChange={(e) => onChange({ ...discount, code: e.target.value })}
          placeholder="SUMMER25"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Discount Type</Label>
          <Select
            value={discount.type}
            onValueChange={(value: DiscountType) =>
              onChange({ ...discount, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">
            {discount.type === "percentage"
              ? "Percentage Value"
              : "Fixed Amount"}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {discount.type === "percentage" ? (
                <Percent className="h-4 w-4 text-muted-foreground" />
              ) : (
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Input
              id="value"
              type="number"
              value={discount.value || ""}
              onChange={(e) =>
                onChange({
                  ...discount,
                  value: Number.parseFloat(e.target.value) || 0,
                })
              }
              className="pl-9"
              placeholder={discount.type === "percentage" ? "25" : "10.00"}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appliesTo">Applies To</Label>
        <Select
          value={discount.appliesTo}
          onValueChange={(value: "all" | "category" | "product" | "cart") =>
            onChange({ ...discount, appliesTo: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select where discount applies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="cart">Cart Total</SelectItem>
            <SelectItem value="category">Specific Categories</SelectItem>
            <SelectItem value="product">Specific Products</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="isActive">Active</Label>
          <Switch
            id="isActive"
            checked={discount.isActive}
            onCheckedChange={(checked) =>
              onChange({ ...discount, isActive: checked })
            }
          />
        </div>
      </div>

      {showUsageCount && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Usage Count: {usageCount}
            {usageLimit && ` / ${usageLimit}`}
          </p>
        </div>
      )}
    </div>
  );
}
