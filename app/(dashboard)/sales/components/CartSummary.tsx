"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Percent, FileText, User, ArrowRight } from "lucide-react";

interface CartSummaryProps {
  cartSubtotal: number;
  discountValue: number;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  cartTotal: number;
  currencySymbol: string;
  cartLength: number;
  onDiscountClick: () => void;
  onNotesClick: () => void;
  onCustomerClick: () => void;
  onCheckoutClick: () => void;
}

export function CartSummary({
  cartSubtotal,
  discountValue,
  discountType,
  discountAmount,
  taxRate,
  taxAmount,
  cartTotal,
  currencySymbol,
  cartLength,
  onDiscountClick,
  onNotesClick,
  onCustomerClick,
  onCheckoutClick,
}: CartSummaryProps) {
  return (
    <div className="p-5 border-t bg-gradient-to-b from-background to-muted/20">
      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium text-foreground">
            {currencySymbol}
            {cartSubtotal.toFixed(2)}
          </span>
        </div>

        {discountValue > 0 && (
          <>
            <Separator className="my-2" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Discount{" "}
                {discountType === "percentage" ? `(${discountValue}%)` : ""}
              </span>
              <span className="text-destructive font-semibold">
                -{currencySymbol}
                {discountAmount.toFixed(2)}
              </span>
            </div>
          </>
        )}

        <Separator className="my-2" />

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Tax ({taxRate}%):</span>
          <span className="font-medium text-foreground">
            {currencySymbol}
            {taxAmount.toFixed(2)}
          </span>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="font-semibold text-base text-foreground">
            Total:
          </span>
          <span className="text-2xl font-bold text-primary">
            {currencySymbol}
            {cartTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          disabled={cartLength === 0}
          className="flex items-center justify-center gap-1.5 h-9"
          onClick={onDiscountClick}
        >
          <Percent className="h-3.5 w-3.5" />
          <span className="text-xs">Discount</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={cartLength === 0}
          className="flex items-center justify-center gap-1.5 h-9"
          onClick={onNotesClick}
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="text-xs">Notes</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={cartLength === 0}
          className="flex items-center justify-center gap-1.5 h-9"
          onClick={onCustomerClick}
        >
          <User className="h-3.5 w-3.5" />
          <span className="text-xs">Customer</span>
        </Button>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
        size="lg"
        disabled={cartLength === 0}
        onClick={onCheckoutClick}
      >
        <span>Complete Checkout</span>
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
