"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type ClosingReport,
  type Employee,
  type Shift,
} from "@/components/pos-data-provider";
import { format } from "date-fns";
import {
  DollarSign,
  Receipt,
  CreditCard,
  Banknote,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface ClosingReportDetailsProps {
  report: ClosingReport;
  employee: Employee | null;
  shift: Shift | null;
}

export function ClosingReportDetails({
  report,
  employee,
  shift,
}: ClosingReportDetailsProps) {
  const averageTransaction =
    report.totalTransactions > 0
      ? report.totalSales / report.totalTransactions
      : 0;

  const hasCashDifference = Math.abs(report.cashDifference) > 0.01;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Closing Report Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Employee</div>
              <div className="font-semibold">{employee?.name || "Unknown"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-semibold">
                {format(new Date(report.date), "MMM dd, yyyy")}
              </div>
            </div>
            {shift && (
              <>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Shift Start
                  </div>
                  <div className="font-semibold">
                    {format(new Date(shift.startTime), "MMM dd, yyyy HH:mm")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Shift End</div>
                  <div className="font-semibold">
                    {shift.endTime
                      ? format(new Date(shift.endTime), "MMM dd, yyyy HH:mm")
                      : "-"}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales Summary */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Sales Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
              <div className="text-sm text-muted-foreground">Total Sales</div>
              <div className="text-2xl font-bold text-primary">
                ${report.totalSales.toFixed(2)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/5 border-2 border-blue-500/20">
              <div className="text-sm text-muted-foreground">Transactions</div>
              <div className="text-2xl font-bold text-blue-600">
                {report.totalTransactions}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-500/5 border-2 border-green-500/20">
              <div className="text-sm text-muted-foreground">Average</div>
              <div className="text-2xl font-bold text-green-600">
                ${averageTransaction.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(report.paymentMethods).map(([method, amount]) => (
              <div
                key={method}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {method === "cash" ? (
                    <Banknote className="h-4 w-4 text-green-600" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-medium capitalize">{method}</span>
                </div>
                <span className="font-semibold text-lg">
                  ${amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales by Employee */}
      {report.salesByEmployee &&
        Object.keys(report.salesByEmployee).length > 0 && (
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Sales by Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(report.salesByEmployee).map(
                  ([employeeName, amount]) => (
                    <div
                      key={employeeName}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <span className="font-medium">{employeeName}</span>
                      <span className="font-semibold text-lg">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Cash Reconciliation */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Cash Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-muted/50">
              <div className="text-sm text-muted-foreground">Starting Cash</div>
              <div className="text-xl font-semibold">
                ${report.startCash.toFixed(2)}
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/50">
              <div className="text-sm text-muted-foreground">Ending Cash</div>
              <div className="text-xl font-semibold">
                ${report.endCash.toFixed(2)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="text-sm text-muted-foreground">Expected Cash</div>
              <div className="text-lg font-semibold">
                ${report.expectedCash.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="text-sm text-muted-foreground">Actual Cash</div>
              <div className="text-lg font-semibold">
                ${report.actualCash.toFixed(2)}
              </div>
            </div>
          </div>

          <Separator />

          <div
            className={`p-4 rounded-lg border-2 ${
              hasCashDifference
                ? "bg-destructive/5 border-destructive/20"
                : "bg-green-500/5 border-green-500/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasCashDifference ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <div className="text-sm text-muted-foreground">
                    Cash Difference
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      hasCashDifference ? "text-destructive" : "text-green-600"
                    }`}
                  >
                    {report.cashDifference >= 0 ? "+" : ""}$
                    {report.cashDifference.toFixed(2)}
                  </div>
                </div>
              </div>
              <Badge
                variant={hasCashDifference ? "destructive" : "default"}
                className="text-sm"
              >
                {hasCashDifference ? "Discrepancy" : "Balanced"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {report.notes && (
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
