import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  discountType: "percentage" | "fixed";
  setDiscountType: (type: "percentage" | "fixed") => void;
  discountValue: number;
  setDiscountValue: (value: number) => void;
  discountAmount: number;
  cartTotal: number;
  currencySymbol: string;
  applyDiscount: () => void;
}

export default function DiscountDialog({
  isOpen,
  onClose,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  discountAmount,
  cartTotal,
  currencySymbol,
  applyDiscount,
}: DiscountDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
          <DialogDescription>
            Add a discount to the current sale.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="discount-type">Discount Type</Label>
              <Tabs
                defaultValue={discountType}
                className="w-full"
                onValueChange={(value) =>
                  setDiscountType(value as "percentage" | "fixed")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="percentage">Percentage (%)</TabsTrigger>
                  <TabsTrigger value="fixed">Fixed Amount</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discount-value">
              {discountType === "percentage"
                ? "Discount Percentage"
                : "Discount Amount"}
            </Label>
            <Input
              id="discount-value"
              type="number"
              min="0"
              max={discountType === "percentage" ? "100" : undefined}
              value={discountValue}
              onChange={(e) =>
                setDiscountValue(Number.parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Discount Amount:</span>
              <span>
                {currencySymbol}
                {discountAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-medium mt-2">
              <span>New Total:</span>
              <span>
                {currencySymbol}
                {cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={applyDiscount}>Apply Discount</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
