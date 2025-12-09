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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Checkout</DialogTitle>
          <DialogDescription>
            Review your order and select a payment method to complete the purchase.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {customerName || customerEmail || customerPhone ? (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Customer Information
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    onClose();
                    setTimeout(() => setIsCustomerDialogOpen(true), 100);
                  }}
                >
                  Edit
                </Button>
              </div>
              <div className="space-y-2">
              {customerName && (
                <div className="flex items-center text-sm">
                  <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span className="font-medium">{customerName}</span>
                </div>
              )}
              {customerEmail && (
                <div className="flex items-center text-sm">
                  <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span>{customerEmail}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span>{customerPhone}</span>
                  </div>
              )}
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-11"
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
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={paymentMethod === "credit" ? "default" : "outline"}
                className={`w-full h-16 flex-col gap-2 ${paymentMethod === "credit" ? "shadow-md" : ""}`}
                onClick={() => setPaymentMethod("credit")}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-medium">Card</span>
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className={`w-full h-16 flex-col gap-2 ${paymentMethod === "cash" ? "shadow-md" : ""}`}
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote className="h-5 w-5" />
                <span className="text-xs font-medium">Cash</span>
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "mobile" ? "default" : "outline"}
                className={`w-full h-16 flex-col gap-2 ${paymentMethod === "mobile" ? "shadow-md" : ""}`}
                onClick={() => setPaymentMethod("mobile")}
              >
                <Wallet className="h-5 w-5" />
                <span className="text-xs font-medium">Mobile</span>
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium text-foreground">
                {currencySymbol}
                {cartSubtotal.toFixed(2)}
              </span>
            </div>
            {discountValue > 0 && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Discount{" "}
                    {discountType === "percentage" ? `(${discountValue}%)` : ""}
                  </span>
                  <span className="text-destructive font-semibold">
                    -{currencySymbol}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%):</span>
              <span className="font-medium text-foreground">
                {currencySymbol}
                {taxAmount.toFixed(2)}
              </span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-semibold text-base text-foreground">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">
                {currencySymbol}
                {cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCheckout} className="flex-1 shadow-lg">
            Complete Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
