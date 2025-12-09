"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { FileText, Eye } from "lucide-react";
import {
  type ClosingReport,
  type Employee,
} from "@/components/pos-data-provider";
import { format } from "date-fns";

interface ClosingReportTableProps {
  reports: ClosingReport[];
  employees: Employee[];
  onView: (report: ClosingReport) => void;
}

export function ClosingReportTable({
  reports,
  employees,
  onView,
}: ClosingReportTableProps) {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  if (reports.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No closing reports</EmptyTitle>
          <EmptyDescription>
            Closing reports will appear here after shifts are completed.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Total Sales</TableHead>
            <TableHead>Transactions</TableHead>
            <TableHead>Cash Difference</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {format(new Date(report.date), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>{getEmployeeName(report.employeeId)}</TableCell>
              <TableCell className="font-semibold">
                ${report.totalSales.toFixed(2)}
              </TableCell>
              <TableCell>{report.totalTransactions}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    report.cashDifference === 0
                      ? "default"
                      : report.cashDifference > 0
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {report.cashDifference >= 0 ? "+" : ""}$
                  {report.cashDifference.toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(report)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
