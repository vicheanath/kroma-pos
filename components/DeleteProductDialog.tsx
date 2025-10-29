"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Package } from "lucide-react";
import { Product } from "@/lib/db";

interface DeleteProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentProduct: Product | null;
  handleDeleteProduct: () => void;
}

export default function DeleteProductDialog({
  isOpen,
  onOpenChange,
  currentProduct,
  handleDeleteProduct,
}: DeleteProductDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {currentProduct && (
          <div className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                {currentProduct.image ? (
                  <img
                    src={currentProduct.image || "/placeholder.svg"}
                    alt={currentProduct.name}
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{currentProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  {typeof currentProduct.category === 'object' 
                    ? currentProduct.category?.name 
                    : currentProduct.category}
                </p>
              </div>
            </div>
            <p className="text-sm mt-2">
              Price: ${currentProduct.price.toFixed(2)}
            </p>
            <p className="text-sm">Stock: {currentProduct.stock}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteProduct}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
