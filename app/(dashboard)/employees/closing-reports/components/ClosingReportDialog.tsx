"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClosingReportDetails } from "./ClosingReportDetails";
import { ClosingReportForm } from "./ClosingReportForm";
import {
  type ClosingReport,
  type Shift,
  type Employee,
  type Sale,
} from "@/components/pos-data-provider";

interface ClosingReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "generate" | "view";
  shift: Shift | null;
  report: ClosingReport | null;
  employee: Employee | null;
  employees: Employee[];
  sales: Sale[];
  onGenerate: (
    startCash: number,
    endCash: number,
    notes?: string
  ) => Promise<void>;
}

export function ClosingReportDialog({
  isOpen,
  onOpenChange,
  mode,
  shift,
  report,
  employee,
  employees,
  sales,
  onGenerate,
}: ClosingReportDialogProps) {
  if (mode === "generate" && !shift) return null;
  if (mode === "view" && !report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "generate" ? "Generate Closing Report" : "Closing Report"}
          </DialogTitle>
          <DialogDescription>
            {mode === "generate"
              ? "Generate a closing report for the completed shift"
              : "View detailed closing report information"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="pr-4">
            {mode === "generate" && shift ? (
              <ClosingReportForm
                shift={shift}
                sales={sales}
                employees={employees}
                onGenerate={onGenerate}
                onCancel={() => onOpenChange(false)}
              />
            ) : mode === "view" && report ? (
              <ClosingReportDetails
                report={report}
                employee={employee}
                shift={shift}
              />
            ) : null}
          </div>
        </ScrollArea>

        {mode === "view" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
