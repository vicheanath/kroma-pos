"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { Category, Product } from "@/lib/db";

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentProduct: Product | null;
  setCurrentProduct: (product: Product | null) => void;
  categories: Category[];
  handleEditProduct: () => void;
}

export default function EditProductDialog({
  isOpen,
  onOpenChange,
  currentProduct,
  setCurrentProduct,
  categories,
  handleEditProduct,
}: EditProductDialogProps) {
  const handleCategoryChange = (categoryId: string) => {
    if (!currentProduct) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (selectedCategory) {
      setCurrentProduct({
        ...currentProduct,
        categoryId,
        category: selectedCategory.name,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details.</DialogDescription>
        </DialogHeader>

        {currentProduct && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Product name"
                value={currentProduct.name}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  placeholder="0.00"
                  value={currentProduct.price}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      price: Number.parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  placeholder="0"
                  value={currentProduct.stock}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      stock: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={currentProduct.categoryId}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-barcode">Barcode (Optional)</Label>
              <Input
                id="edit-barcode"
                placeholder="Barcode"
                value={currentProduct.barcode || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    barcode: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Product description"
                value={currentProduct.description || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <ImageUpload
              value={currentProduct.image}
              onChange={(value) =>
                setCurrentProduct({ ...currentProduct, image: value })
              }
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditProduct}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
