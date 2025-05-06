"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, Download, Share2 } from "lucide-react";
import { format } from "date-fns";
import type { Sale } from "./pos-data-provider";
import { useToast } from "@/components/ui/use-toast";
import {
  ReceiptSettingsProvider,
  useReceiptSettings,
} from "@/components/receipt-settings-provider";
interface InvoicePrintProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoicePrint({ sale, isOpen, onClose }: InvoicePrintProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { settings } = useReceiptSettings();
  const [receiptNumber, setReceiptNumber] = useState("");

  useEffect(() => {
    // Generate a receipt number based on the sale ID and date
    if (sale) {
      const dateStr = format(new Date(sale.date), "yyMMdd");
      const shortId = sale.id.slice(0, 4);
      setReceiptNumber(`${dateStr}-${shortId}`);
    }
  }, [sale]);

  // Auto-print if settings specify
  useEffect(() => {
    if (isOpen && settings?.printAutomatically) {
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [isOpen, settings?.printAutomatically]);

  const handlePrint = () => {
    const printContent = invoiceRef.current?.outerHTML; // Ensure outerHTML is used to capture the full receipt content
    if (!printContent) {
      toast({
        title: "Print Error",
        description: "No content available to print.",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print Error",
        description:
          "Could not open print window. Please check your browser settings.",
        variant: "destructive",
      });
      return;
    }

    const {
      fontFamily = "Arial",
      fontSize = 12,
      receiptWidth = 300,
    } = settings || {};

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${receiptNumber}</title>
          <style>
            body {
              font-family: ${fontFamily}, sans-serif;
              font-size: ${fontSize}px;
              width: ${receiptWidth}px;
              margin: 0 auto;
              padding: 20px;
            }
            .receipt-header, .receipt-footer {
              text-align: center;
            }
            .receipt-items {
              width: 100%;
              border-collapse: collapse;
            }
            .receipt-items th, .receipt-items td {
              padding: 5px;
              text-align: left;
            }
            .receipt-items th:last-child, .receipt-items td:last-child {
              text-align: right;
            }
            .receipt-total {
              margin-top: 10px;
              border-top: 1px dashed #000;
              padding-top: 5px;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              @page {
                size: ${receiptWidth}px auto;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast({
      title: "Receipt Printed",
      description: "The receipt has been sent to the printer.",
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Download Started",
      description: "Your receipt PDF is being prepared for download.",
    });

    // In a real implementation, this would use a library like jsPDF to generate a PDF
    setTimeout(() => {
      toast({
        title: "Feature Coming Soon",
        description:
          "PDF download functionality will be available in the next update.",
      });
    }, 1000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt #${receiptNumber}`,
          text: `Receipt for purchase on ${format(
            new Date(sale.date),
            "MMM dd, yyyy"
          )}`,
          // In a real implementation, this would be a URL to a shareable receipt
          url: window.location.href,
        });
        toast({
          title: "Receipt Shared",
          description: "The receipt has been shared successfully.",
        });
      } catch (error) {
        console.error("Error sharing:", error);
        toast({
          title: "Share Failed",
          description: "Failed to share the receipt.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Share Not Supported",
        description: "Your browser does not support the Web Share API.",
        variant: "destructive",
      });
    }
  };

  const renderOriginalTable = () => {
    const subtotal = sale.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const taxRate = settings?.taxRate || 10;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    return (
      <div className="p-4 border rounded-lg bg-white shadow-md">
        <h3 className="text-lg font-bold mb-4">Original Receipt Table</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.product.name}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">
                  {settings?.currencySymbol || "$"}
                  {item.product.price.toFixed(2)}
                </td>
                <td className="text-right py-2">
                  {settings?.currencySymbol || "$"}
                  {(item.product.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              {settings?.currencySymbol || "$"}
              {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({taxRate}%):</span>
            <span>
              {settings?.currencySymbol || "$"}
              {tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>
              {settings?.currencySymbol || "$"}
              {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderReceiptPreview = () => {
    const {
      fontFamily = "Arial",
      fontSize = 12,
      receiptWidth = 300,
      storeName = "My Store",
      storeAddress,
      storePhone,
      storeEmail,
      storeWebsite,
      storeLogo,
      showLogo = true,
      thankYouMessage,
      returnPolicy,
      footerText,
      headerText,
      showTax = true,
      taxRate = 10,
      currencySymbol = "$",
    } = settings || {};

    const subtotal = sale.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const tax = showTax ? subtotal * (taxRate / 100) : 0;
    const total = subtotal + tax;

    return (
      <div
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          width: `${receiptWidth}px`,
          margin: "0 auto",
        }}
        className="p-4 border rounded-lg bg-white shadow-md"
      >
        <div className="receipt-header text-center">
          {showLogo && storeLogo && (
            <img
              src={storeLogo || "/placeholder.svg"}
              alt="Store Logo"
              className="receipt-logo mb-2"
              style={{ maxWidth: "100px", maxHeight: "100px" }}
            />
          )}
          <h2 className="text-2xl font-bold">{storeName}</h2>
          {storeAddress && <p>{storeAddress}</p>}
          {storePhone && <p>Phone: {storePhone}</p>}
          {storeEmail && <p>Email: {storeEmail}</p>}
          {storeWebsite && <p>Web: {storeWebsite}</p>}
          {headerText && <p>{headerText}</p>}
        </div>

        <div className="receipt-info my-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium">Receipt #: {receiptNumber}</p>
              <p>Date: {format(new Date(sale.date), "MMM dd, yyyy")}</p>
              <p>Time: {format(new Date(sale.date), "hh:mm a")}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Customer:</p>
              <p>{sale.customerName || "Walk-in Customer"}</p>
              <p>
                Payment Method:{" "}
                {sale.paymentMethod === "credit"
                  ? "Credit Card"
                  : sale.paymentMethod === "cash"
                  ? "Cash"
                  : "Mobile Payment"}
              </p>
            </div>
          </div>
        </div>

        <div className="my-4 border-t border-b py-2">
          <table className="receipt-items w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index} className="border-b border-dashed">
                  <td className="py-2">{item.product.name}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">
                    {currencySymbol}
                    {item.product.price.toFixed(2)}
                  </td>
                  <td className="text-right py-2">
                    {currencySymbol}
                    {(item.product.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-total text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              {currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>

          {showTax && (
            <div className="flex justify-between">
              <span>Tax ({taxRate}%):</span>
              <span>
                {currencySymbol}
                {tax.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold text-base pt-1">
            <span>Total:</span>
            <span>
              {currencySymbol}
              {total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="receipt-footer text-center text-sm mt-8">
          {thankYouMessage && <p>{thankYouMessage}</p>}
          {returnPolicy && <p className="text-xs mt-1">{returnPolicy}</p>}
          {footerText && <p className="text-xs mt-2">{footerText}</p>}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Receipt #{receiptNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 mt-4">
          {/* Left Side: Original Receipt Table */}
          <div className="flex-1 overflow-auto">{renderOriginalTable()}</div>

          {/* Right Side: Receipt Preview */}
          <div className="flex-1 overflow-auto">{renderReceiptPreview()}</div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
