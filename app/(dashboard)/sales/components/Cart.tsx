"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type CartItem as CartItemType } from "@/components/pos-data-provider";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

interface CartProps {
  cart: CartItemType[];
  cartItemCount: number;
  cartSubtotal: number;
  discountValue: number;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  cartTotal: number;
  currencySymbol: string;
  onClearCart: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onDiscountClick: () => void;
  onNotesClick: () => void;
  onCustomerClick: () => void;
  onCheckoutClick: () => void;
  containerVariants: any;
  itemVariants: any;
  isMobile?: boolean;
  isTablet?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CartContent = ({
  cart,
  cartItemCount,
  cartSubtotal,
  discountValue,
  discountType,
  discountAmount,
  taxRate,
  taxAmount,
  cartTotal,
  currencySymbol,
  onClearCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onDiscountClick,
  onNotesClick,
  onCustomerClick,
  onCheckoutClick,
  containerVariants,
  itemVariants,
}: Omit<CartProps, "isMobile" | "isOpen" | "onOpenChange">) => {
  return (
    <div className="flex flex-col h-full overflow-hidden min-w-0">
      <div className="p-3 sm:p-4 md:p-5 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold flex items-center">
              Shopping Cart
            </h2>
            {cart.length > 0 && (
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>
        </div>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
            onClick={onClearCart}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <AnimatePresence mode="popLayout">
          {cart.length > 0 ? (
            <motion.div
              key="cart-items"
              className="divide-y divide-border"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {cart.map((item) => (
                <CartItem
                  key={item.product.id}
                  item={item}
                  currencySymbol={currencySymbol}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveFromCart}
                  variants={itemVariants}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[300px] p-6"
            >
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>Your cart is empty</EmptyTitle>
                  <EmptyDescription>
                    Add products by clicking on them or using the Quick Add
                    button
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0">
        <CartSummary
          cartSubtotal={cartSubtotal}
          discountValue={discountValue}
          discountType={discountType}
          discountAmount={discountAmount}
          taxRate={taxRate}
          taxAmount={taxAmount}
          cartTotal={cartTotal}
          currencySymbol={currencySymbol}
          cartLength={cart.length}
          onDiscountClick={onDiscountClick}
          onNotesClick={onNotesClick}
          onCustomerClick={onCustomerClick}
          onCheckoutClick={onCheckoutClick}
        />
      </div>
    </div>
  );
};

export function Cart({
  cart,
  cartItemCount,
  cartSubtotal,
  discountValue,
  discountType,
  discountAmount,
  taxRate,
  taxAmount,
  cartTotal,
  currencySymbol,
  onClearCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onDiscountClick,
  onNotesClick,
  onCustomerClick,
  onCheckoutClick,
  containerVariants,
  itemVariants,
  isMobile = false,
  isTablet = false,
  isOpen,
  onOpenChange,
}: CartProps) {
  const cartContent = (
    <CartContent
      cart={cart}
      cartItemCount={cartItemCount}
      cartSubtotal={cartSubtotal}
      discountValue={discountValue}
      discountType={discountType}
      discountAmount={discountAmount}
      taxRate={taxRate}
      taxAmount={taxAmount}
      cartTotal={cartTotal}
      currencySymbol={currencySymbol}
      onClearCart={onClearCart}
      onUpdateQuantity={onUpdateQuantity}
      onRemoveFromCart={onRemoveFromCart}
      onDiscountClick={onDiscountClick}
      onNotesClick={onNotesClick}
      onCustomerClick={onCustomerClick}
      onCheckoutClick={onCheckoutClick}
      containerVariants={containerVariants}
      itemVariants={itemVariants}
    />
  );

  // Mobile: Show as drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Shopping Cart</DrawerTitle>
          </DrawerHeader>
          {cartContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop/Tablet: Show as sidebar
  return (
    <div
      className={`w-full ${
        isTablet ? "md:w-80 md:max-w-80" : "md:w-96 md:max-w-96"
      } flex flex-col border rounded-lg bg-card shadow-lg flex-shrink-0 min-w-0 max-h-screen md:max-h-none`}
    >
      {cartContent}
    </div>
  );
}
