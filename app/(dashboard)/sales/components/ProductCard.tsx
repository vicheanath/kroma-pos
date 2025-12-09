"use client";

import { motion } from "framer-motion";
import { type Product } from "@/components/pos-data-provider";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onAddToCart: (product: Product) => void;
  onQuickAdd: (e: React.MouseEvent, product: Product) => void;
  variants?: any;
  isTablet?: boolean;
}

export function ProductCard({
  product,
  currencySymbol,
  onAddToCart,
  onQuickAdd,
  variants,
  isTablet = false,
}: ProductCardProps) {
  return (
    <motion.div variants={variants} className="h-full">
      <Card
        className="overflow-hidden h-full flex flex-col cursor-pointer active:scale-[0.98] hover:shadow-lg hover:border-primary/50 transition-all duration-200 border-border group touch-manipulation"
        onClick={() => onAddToCart(product)}
      >
        <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden relative">
          {product.image ? (
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 group-active:scale-100 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <Package className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-muted-foreground" />
          )}

          {product.stock <= 5 && (
            <Badge
              variant={product.stock === 0 ? "destructive" : "secondary"}
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 shadow-sm text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
            >
              {product.stock === 0 ? "Out" : `${product.stock} left`}
            </Badge>
          )}
        </div>

        <CardContent
          className={`${
            isTablet ? "p-3" : "p-2 sm:p-3 md:p-4"
          } flex-1 flex flex-col ${
            isTablet ? "gap-2" : "gap-1.5 sm:gap-2"
          } min-h-0`}
        >
          <div className="flex-1 min-h-0">
            <h3
              className={`font-semibold ${
                isTablet ? "text-sm" : "text-xs sm:text-sm"
              } leading-tight line-clamp-2 ${
                isTablet ? "mb-1.5" : "mb-1 sm:mb-1.5"
              }`}
            >
              {product.name}
            </h3>
            <p
              className={`${
                isTablet ? "text-xs" : "text-[10px] sm:text-xs"
              } text-muted-foreground ${
                isTablet ? "mb-2" : "mb-1 sm:mb-2"
              } line-clamp-1`}
            >
              {product.category?.name || "Uncategorized"}
            </p>
            {product.sku && (
              <p
                className={`${
                  isTablet ? "text-xs" : "text-[9px] sm:text-xs"
                } text-muted-foreground/70 line-clamp-1`}
              >
                SKU: {product.sku}
              </p>
            )}
          </div>
          <div
            className={`mt-auto ${
              isTablet ? "pt-2" : "pt-1.5 sm:pt-2"
            } border-t border-border`}
          >
            <p
              className={`${
                isTablet ? "text-lg" : "text-base sm:text-lg md:text-xl"
              } font-bold text-primary`}
            >
              {currencySymbol}
              {product.price.toFixed(2)}
            </p>
          </div>
        </CardContent>

        <CardFooter
          className={`${
            isTablet
              ? "p-3 pt-0 pb-3"
              : "p-2 sm:p-3 md:p-4 pt-0 pb-2 sm:pb-3 md:pb-4"
          }`}
        >
          <Button
            variant="default"
            size={isTablet ? "default" : "sm"}
            className={`flex-1 w-full ${isTablet ? "h-10" : "h-9 sm:h-10"} ${
              isTablet ? "text-sm" : "text-xs sm:text-sm"
            } font-medium touch-manipulation active:scale-95`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(e, product);
            }}
            disabled={product.stock === 0}
          >
            <Plus
              className={`${
                isTablet ? "h-4 w-4" : "h-3.5 w-3.5 sm:h-4 sm:w-4"
              } ${isTablet ? "mr-1.5" : "mr-1 sm:mr-1.5"}`}
            />
            <span className="hidden xs:inline">Quick Add</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
