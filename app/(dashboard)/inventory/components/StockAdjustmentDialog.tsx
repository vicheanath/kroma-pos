"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type Product,
  type StockMovement,
} from "@/components/pos-data-provider";
import { useToast } from "@/components/ui/use-toast";

interface StockAdjustmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onAdjust: (
    productId: string,
    quantity: number,
    type: StockMovement["type"],
    reason?: string,
    notes?: string
  ) => Promise<void>;
}

const ADJUSTMENT_REASONS = [
  "Restock",
  "Damage",
  "Return",
  "Theft",
  "Expired",
  "Count Correction",
  "Other",
];

export function StockAdjustmentDialog({
  isOpen,
  onOpenChange,
  product,
  onAdjust,
}: StockAdjustmentDialogProps) {
  const { toast } = useToast();
  const [adjustmentType, setAdjustmentType] = useState<
    "add" | "remove" | "set"
  >("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const handleSubmit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let finalQuantity: number;
      let movementType: StockMovement["type"] = "adjustment";

      if (adjustmentType === "set") {
        finalQuantity = parseFloat(quantity) - product.stock;
      } else if (adjustmentType === "add") {
        finalQuantity = parseFloat(quantity);
      } else {
        finalQuantity = -parseFloat(quantity);
      }

      await onAdjust(product.id, finalQuantity, movementType, reason, notes);

      // Reset form
      setQuantity("");
      setReason("");
      setNotes("");
      setAdjustmentType("add");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adjusting stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateNewStock = () => {
    if (!quantity || parseFloat(quantity) <= 0) return product.stock;

    const qty = parseFloat(quantity);
    if (adjustmentType === "set") {
      return qty;
    } else if (adjustmentType === "add") {
      return product.stock + qty;
    } else {
      return Math.max(0, product.stock - qty);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust the stock level for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <Input value={product.name} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Current Stock</Label>
            <Input
              value={product.stock.toString()}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select
              value={adjustmentType}
              onValueChange={(value) =>
                setAdjustmentType(value as "add" | "remove" | "set")
              }
            >
              <SelectTrigger className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Stock</SelectItem>
                <SelectItem value="remove">Remove Stock</SelectItem>
                <SelectItem value="set">Set Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Quantity {adjustmentType === "set" ? "(New Stock Level)" : ""}
            </Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="border-2 focus:border-primary"
            />
          </div>

          {quantity && parseFloat(quantity) > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="text-sm text-muted-foreground">
                New Stock Level:
              </div>
              <div className="text-lg font-semibold">
                {calculateNewStock()} units
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this adjustment"
              className="border-2 focus:border-primary min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setQuantity("");
              setReason("");
              setNotes("");
              setAdjustmentType("add");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adjusting..." : "Adjust Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
