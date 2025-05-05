"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

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
                  {currentProduct.category}
                </p>
              </div>
            </div>
            <p className="text-sm mt-2">
              Price: ${currentProduct.price.toFixed(2)}
            </p>
            <p className="text-sm">Stock: {currentProduct.stock}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteProduct}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
