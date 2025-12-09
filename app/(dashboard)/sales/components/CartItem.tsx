"use client";

import { motion } from "framer-motion";
import { type CartItem as CartItemType } from "@/components/pos-data-provider";
import { Button } from "@/components/ui/button";
import { Package, Plus, Minus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
  currencySymbol: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  variants?: any;
}

export function CartItem({
  item,
  currencySymbol,
  onUpdateQuantity,
  onRemove,
  variants,
}: CartItemProps) {
  return (
    <motion.div
      key={item.product.id}
      layout
      variants={variants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="flex items-center gap-2.5 p-2.5 hover:bg-muted/50 active:bg-muted transition-colors group touch-manipulation"
    >
      <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden border border-border">
        {item.product.image ? (
          <img
            src={item.product.image || "/placeholder.svg"}
            alt={item.product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm leading-tight truncate">
              {item.product.name}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              ×{item.quantity}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {currencySymbol}
              {item.product.price.toFixed(2)}
            </p>
            <span className="text-muted-foreground">•</span>
            <p className="text-sm font-semibold text-foreground">
              {currencySymbol}
              {(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md touch-manipulation active:scale-95"
            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md touch-manipulation active:scale-95"
            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-destructive opacity-70 group-hover:opacity-100 transition-opacity touch-manipulation"
            onClick={() => onRemove(item.product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
