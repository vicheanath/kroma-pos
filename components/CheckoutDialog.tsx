import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Banknote, Wallet, Mail, Phone } from "lucide-react";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  setIsCustomerDialogOpen: (isOpen: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  cartSubtotal: number;
  discountValue: number;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  cartTotal: number;
  currencySymbol: string;
  handleCheckout: () => void;
}

export default function CheckoutDialog({
  isOpen,
  onClose,
  customerName,
  customerEmail,
  customerPhone,
  setIsCustomerDialogOpen,
  paymentMethod,
  setPaymentMethod,
  cartSubtotal,
  discountValue,
  discountType,
  discountAmount,
  taxRate,
  taxAmount,
  cartTotal,
  currencySymbol,
  handleCheckout,
}: CheckoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Complete your purchase by selecting a payment method.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {customerName || customerEmail || customerPhone ? (
            <div className="bg-muted p-4 rounded-lg border">
              <h4 className="text-sm font-semibold mb-3">Customer Information</h4>
              <div className="space-y-2">
              {customerName && (
                <div className="flex items-center text-sm">
                  <User className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span>{customerName}</span>
                </div>
              )}
              {customerEmail && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{customerEmail}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{customerPhone}</span>
                  </div>
              )}
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onClose();
                setTimeout(() => setIsCustomerDialogOpen(true), 100);
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Add Customer Information
            </Button>
          )}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={paymentMethod === "credit" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setPaymentMethod("credit")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Card
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Cash
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "mobile" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setPaymentMethod("mobile")}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Mobile
              </Button>
            </div>
          </div>
          <Separator />
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                {currencySymbol}
                {cartSubtotal.toFixed(2)}
              </span>
            </div>
            {discountValue > 0 && (
              <>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Discount{" "}
                    {discountType === "percentage" ? `(${discountValue}%)` : ""}:
                  </span>
                  <span className="text-destructive font-medium">
                    -{currencySymbol}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%):</span>
              <span className="font-medium">
                {currencySymbol}
                {taxAmount.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-base">Total Amount:</span>
              <span className="text-xl font-bold">
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
          <Button onClick={handleCheckout}>Complete Purchase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
