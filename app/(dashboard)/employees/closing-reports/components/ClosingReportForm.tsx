"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calculator } from "lucide-react";
import { type Shift, type Sale } from "@/components/pos-data-provider";
import { format } from "date-fns";

interface ClosingReportFormProps {
  shift: Shift;
  sales: Sale[];
  employees: Array<{ id: string; name: string }>;
  onGenerate: (
    startCash: number,
    endCash: number,
    notes?: string
  ) => Promise<void>;
  onCancel: () => void;
}

export function ClosingReportForm({
  shift,
  sales,
  employees,
  onGenerate,
  onCancel,
}: ClosingReportFormProps) {
  const [startCash, setStartCash] = useState("");
  const [endCash, setEndCash] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate sales during shift - filter by shiftId for accuracy
  const shiftStart = new Date(shift.startTime);
  const shiftEnd = shift.endTime ? new Date(shift.endTime) : new Date();
  const shiftSales = sales.filter((sale) => {
    // First check if sale belongs to this shift
    if (sale.shiftId === shift.id) {
      // Also verify date range as secondary check
      const saleDate = new Date(sale.date);
      return saleDate >= shiftStart && saleDate <= shiftEnd;
    }
    return false;
  });

  const totalSales = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = shiftSales.length;
  const cashSales =
    shiftSales
      .filter((s) => s.paymentMethod === "cash")
      .reduce((sum, sale) => sum + sale.total, 0) || 0;

  // Calculate sales by employee
  const salesByEmployee: Record<string, number> = {};
  shiftSales.forEach((sale) => {
    if (sale.employeeId) {
      // We'll need to get employee name from parent component
      salesByEmployee[sale.employeeId] =
        (salesByEmployee[sale.employeeId] || 0) + sale.total;
    }
  });

  const expectedCash = parseFloat(startCash) + cashSales;
  const actualCash = parseFloat(endCash) || 0;
  const cashDifference = actualCash - expectedCash;

  const handleSubmit = async () => {
    if (!startCash || !endCash) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onGenerate(
        parseFloat(startCash),
        parseFloat(endCash),
        notes || undefined
      );
    } catch (error) {
      console.error("Error generating closing report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Generate Closing Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shift Summary */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="text-sm font-semibold mb-2">Shift Summary</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Start:</span>{" "}
              {format(new Date(shift.startTime), "MMM dd, yyyy HH:mm")}
            </div>
            <div>
              <span className="text-muted-foreground">End:</span>{" "}
              {shift.endTime
                ? format(new Date(shift.endTime), "MMM dd, yyyy HH:mm")
                : "-"}
            </div>
            <div>
              <span className="text-muted-foreground">Total Sales:</span>{" "}
              <span className="font-semibold">${totalSales.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Transactions:</span>{" "}
              <span className="font-semibold">{totalTransactions}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cash Sales:</span>{" "}
              <span className="font-semibold">${cashSales.toFixed(2)}</span>
            </div>
          </div>
          {/* Sales by Employee Breakdown */}
          {Object.keys(salesByEmployee).length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm font-semibold mb-2">
                Sales by Employee
              </div>
              <div className="space-y-1">
                {Object.entries(salesByEmployee).map(([employeeId, amount]) => {
                  const employee = employees.find((e) => e.id === employeeId);
                  return (
                    <div
                      key={employeeId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {employee?.name || employeeId}:
                      </span>
                      <span className="font-semibold">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Cash Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Starting Cash <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={startCash}
              onChange={(e) => setStartCash(e.target.value)}
              placeholder="0.00"
              className="border-2 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Ending Cash <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={endCash}
              onChange={(e) => setEndCash(e.target.value)}
              placeholder="0.00"
              className="border-2 focus:border-primary"
            />
          </div>
        </div>

        {/* Expected Cash Calculation */}
        {startCash && (
          <div className="p-3 rounded-lg bg-primary/5 border-2 border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">
              Expected Cash
            </div>
            <div className="text-lg font-semibold text-primary">
              ${expectedCash.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Starting Cash (${parseFloat(startCash || "0").toFixed(2)}) + Cash
              Sales (${cashSales.toFixed(2)})
            </div>
          </div>
        )}

        {/* Cash Difference Alert */}
        {startCash && endCash && Math.abs(cashDifference) > 0.01 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Cash difference detected:{" "}
              <span className="font-semibold">
                {cashDifference >= 0 ? "+" : ""}${cashDifference.toFixed(2)}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this closing report"
            className="border-2 focus:border-primary min-h-[80px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!startCash || !endCash || isSubmitting}
            className="gap-2 shadow-sm"
          >
            {isSubmitting ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
