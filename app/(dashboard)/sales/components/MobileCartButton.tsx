"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface MobileCartButtonProps {
  cartItemCount: number;
  cartTotal: number;
  currencySymbol: string;
  onClick: () => void;
}

export function MobileCartButton({
  cartItemCount,
  cartTotal,
  currencySymbol,
  onClick,
}: MobileCartButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg md:hidden touch-manipulation"
      size="icon"
    >
      <div className="relative flex items-center justify-center">
        <ShoppingCart className="h-6 w-6" />
        {cartItemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs font-semibold"
          >
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </Badge>
        )}
      </div>
      <span className="sr-only">Open cart</span>
    </Button>
  );
}
