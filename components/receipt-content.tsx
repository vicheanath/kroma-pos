import React, { forwardRef } from "react";
import Barcode from "react-barcode";

interface ReceiptContentProps {
  data: {
    showLogo: boolean;
    storeLogo?: string;
    storeName: string;
    fontSize: number;
    headerText?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    storeWebsite?: string;
    currencySymbol: string;
    showTax: boolean;
    taxRate: number;
    thankYouMessage?: string;
    returnPolicy?: string;
    footerText?: string;
    showBarcode: boolean;
  };
  item: {
    name: string;
    quantity: number;
    price: number;
  }[];
  receiptId: string;
  subtotal: number;
  tax: number;
  total: number;
}

export const ReceiptContent = forwardRef<HTMLDivElement, ReceiptContentProps>(
  ({ data, item, subtotal, tax, total, receiptId }, ref) => {
    return (
      <>
        <div ref={ref}>
          <div className="receipt-header">
            {data.showLogo && data.storeLogo && (
              <img
                src={data.storeLogo || "/placeholder.svg"}
                alt="Store Logo"
                className="receipt-logo mb-2"
              />
            )}
            <h1
              className="text-center font-bold"
              style={{ fontSize: `${data.fontSize + 4}px` }}
            >
              {data.storeName}
            </h1>
            {data.headerText && (
              <p className="text-center">{data.headerText}</p>
            )}
            {data.storeAddress && (
              <p className="text-center text-sm">{data.storeAddress}</p>
            )}
            {data.storePhone && (
              <p className="text-center text-sm">Phone: {data.storePhone}</p>
            )}
            {data.storeEmail && (
              <p className="text-center text-sm">Email: {data.storeEmail}</p>
            )}
            {data.storeWebsite && (
              <p className="text-center text-sm">Web: {data.storeWebsite}</p>
            )}
          </div>

          <div className="receipt-info my-2 text-sm">
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span>{receiptId}</span>
            </div>
          </div>

          <div
            className="my-2"
            style={{
              borderTop: "1px dashed #000",
              borderBottom: "1px dashed #000",
            }}
          >
            <table className="receipt-items w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {item.map((item, index) => (
                  <tr key={index}>
                    <td className="text-left">{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">
                      {data.currencySymbol}
                      {item.price.toFixed(2)}
                    </td>
                    <td className="text-right">
                      {data.currencySymbol}
                      {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="receipt-total text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>
                {data.currencySymbol}
                {subtotal.toFixed(2)}
              </span>
            </div>
            {data.showTax && (
              <div className="flex justify-between">
                <span>Tax ({data.taxRate}%):</span>
                <span>
                  {data.currencySymbol}
                  {tax.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-1">
              <span>Total:</span>
              <span>
                {data.currencySymbol}
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="receipt-payment text-sm mt-4">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span>Credit Card</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span>
                {data.currencySymbol}
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="receipt-footer mt-4 text-center text-sm">
            {data.thankYouMessage && <p>{data.thankYouMessage}</p>}
            {data.returnPolicy && (
              <p className="text-xs mt-1">{data.returnPolicy}</p>
            )}
            {data.footerText && (
              <p className="text-xs mt-2">{data.footerText}</p>
            )}
          </div>
          <div className="mt-2 flex justify-center">
            {data.showBarcode && (
              <Barcode
                value={receiptId}
                width={1}
                height={50}
                fontSize={12}
              />
            )}
          </div>
        </div>
      </>
    );
  }
);

ReceiptContent.displayName = "ReceiptContent";
