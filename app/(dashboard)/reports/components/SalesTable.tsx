"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { BarChart, Printer } from "lucide-react";
import { format } from "date-fns";

interface SalesTableProps {
  sales: any[];
  isLoading: boolean;
  onPrintInvoice: (sale: any) => void;
}

export function SalesTable({
  sales,
  isLoading,
  onPrintInvoice,
}: SalesTableProps) {
  return (
    <Card className="mt-6 border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Sales Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Spinner className="h-6 w-6" />
                      <p className="text-sm text-muted-foreground">
                        Loading sales data...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {format(new Date(sale.date), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {sale.id.slice(0, 8)}
                      </code>
                    </TableCell>
                    <TableCell>
                      {sale.customerName || (
                        <span className="text-muted-foreground">
                          Walk-in Customer
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{sale.items.length} items</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {sale.paymentMethod === "credit"
                          ? "Credit Card"
                          : sale.paymentMethod === "cash"
                          ? "Cash"
                          : "Mobile Payment"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-lg">
                      ${sale.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPrintInvoice(sale)}
                        className="gap-2"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <BarChart className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No sales data available</EmptyTitle>
                        <EmptyDescription>
                          No sales data found for the selected period. Try
                          adjusting your date range or filters.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
