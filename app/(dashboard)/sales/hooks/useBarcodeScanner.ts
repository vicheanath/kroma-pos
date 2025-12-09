"use client";

import { useState, useEffect, useRef } from "react";
import { type Product, type CartItem } from "@/components/pos-data-provider";
import { useToast } from "@/components/ui/use-toast";

interface UseBarcodeScannerProps {
  products: Product[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export function useBarcodeScanner({
  products,
  cart,
  setCart,
}: UseBarcodeScannerProps) {
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBarcodeInput = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Check if Enter is pressed (barcode scanners often send Enter after the code)
      if (e.key === "Enter" && barcodeBuffer.length > 0) {
        e.preventDefault();
        const trimmedBarcode = barcodeBuffer.trim();
        const product = products.find((p) => p.barcode === trimmedBarcode);
        if (product) {
          // Add to cart directly
          setCart((prevCart) => {
            const existingItem = prevCart.find(
              (item) => item.product.id === product.id
            );

            if (existingItem) {
              if (existingItem.quantity + 1 > product.stock) {
                toast({
                  title: "Stock Limit Reached",
                  description: `Only ${product.stock} units available.`,
                  variant: "destructive",
                });
                return prevCart;
              }
              return prevCart.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              );
            } else {
              return [...prevCart, { product, quantity: 1 }];
            }
          });
          toast({
            title: "Product Scanned",
            description: `${product.name} added to cart.`,
          });
        } else {
          toast({
            title: "Barcode Not Found",
            description: `No product found with barcode: ${trimmedBarcode}`,
            variant: "destructive",
          });
        }
        setBarcodeBuffer("");
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
          barcodeTimeoutRef.current = null;
        }
        return;
      }

      // Accumulate characters (barcode scanners input very quickly)
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setBarcodeBuffer((prev) => prev + e.key);

        // Clear buffer after 100ms of no input (barcode scanners are very fast)
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
        }
        barcodeTimeoutRef.current = setTimeout(() => {
          setBarcodeBuffer("");
        }, 100);
      }
    };

    window.addEventListener("keydown", handleBarcodeInput);
    return () => {
      window.removeEventListener("keydown", handleBarcodeInput);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcodeBuffer, products, toast]);
}
