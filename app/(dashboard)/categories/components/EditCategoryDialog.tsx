"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CategoryForm, type CategoryFormValues } from "./CategoryForm";
import { type Category } from "@/components/pos-data-provider";

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (data: CategoryFormValues) => void;
}

export function EditCategoryDialog({
  isOpen,
  onClose,
  category,
  onSubmit,
}: EditCategoryDialogProps) {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update the category details.</DialogDescription>
        </DialogHeader>
        <CategoryForm
          defaultValues={category}
          onSubmit={(data) => {
            onSubmit(data);
            onClose();
          }}
          onCancel={onClose}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
