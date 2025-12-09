"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DiscountForm } from "./DiscountForm";
import { type Discount } from "@/lib/db";

interface EditDiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  discount: Discount | null;
  onDiscountChange: (discount: Discount) => void;
  onSubmit: () => void;
}

export function EditDiscountDialog({
  isOpen,
  onClose,
  discount,
  onDiscountChange,
  onSubmit,
}: EditDiscountDialogProps) {
  if (!discount) return null;

  const formData = {
    name: discount.name,
    code: discount.code || "",
    type: discount.type,
    value: discount.value,
    isActive: discount.isActive,
    appliesTo: discount.appliesTo,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Discount</DialogTitle>
        </DialogHeader>
        <DiscountForm
          discount={formData}
          onChange={(data) => onDiscountChange({ ...discount, ...data })}
          showUsageCount={true}
          usageCount={discount.usageCount}
          usageLimit={discount.usageLimit}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
