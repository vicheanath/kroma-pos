"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  usePosData,
  type ClosingReport,
  type Shift,
} from "@/components/pos-data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClosingReportTable } from "./components/ClosingReportTable";
import { ClosingReportDialog } from "./components/ClosingReportDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format, subDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function ClosingReportsPage() {
  const { employees, shifts, closingReports, sales, generateClosingReport } =
    usePosData();
  const { toast } = useToast();
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"generate" | "view">("view");
  const [selectedReport, setSelectedReport] = useState<ClosingReport | null>(
    null
  );
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Get shifts that need closing reports (pending_completion or completed without reports)
  const shiftsNeedingReports = shifts.filter(
    (shift) =>
      (shift.status === "pending_completion" || shift.status === "completed") &&
      !closingReports.some((report) => report.shiftId === shift.id)
  );

  // Filter reports
  const filteredReports = closingReports.filter((report) => {
    const matchesEmployee =
      filterEmployee === "all" || report.employeeId === filterEmployee;

    let matchesDate = true;
    if (dateRange !== "all") {
      const days = parseInt(dateRange);
      const startDate = subDays(new Date(), days);
      matchesDate = new Date(report.date) >= startDate;
    }

    return matchesEmployee && matchesDate;
  });

  const handleGenerateReport = async (
    startCash: number,
    endCash: number,
    notes?: string
  ) => {
    if (!selectedShift) return;

    try {
      await generateClosingReport(selectedShift.id, startCash, endCash, notes);
      setIsDialogOpen(false);
      setSelectedShift(null);
    } catch (error) {
      console.error("Error generating closing report:", error);
    }
  };

  const handleViewReport = (report: ClosingReport) => {
    setSelectedReport(report);
    const shift = shifts.find((s) => s.id === report.shiftId);
    setSelectedShift(shift || null);
    setDialogMode("view");
    setIsDialogOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 overflow-hidden min-w-0"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Closing Reports
              </h1>
              <p className="text-muted-foreground mt-1">
                View and generate shift closing reports
              </p>
            </div>
          </div>
          {shiftsNeedingReports.length > 0 && (
            <Button
              onClick={() => {
                // Show shift selection for generating report
                if (shiftsNeedingReports.length === 1) {
                  const shift = shiftsNeedingReports[0];
                  // Validate shift status
                  if (
                    shift.status !== "pending_completion" &&
                    shift.status !== "completed"
                  ) {
                    toast({
                      title: "Invalid Shift Status",
                      description:
                        "Only shifts that are clocked out (pending completion) or completed can have closing reports generated.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setSelectedShift(shift);
                  setDialogMode("generate");
                  setIsDialogOpen(true);
                } else {
                  // TODO: Add shift selection dialog
                  const shift = shiftsNeedingReports[0];
                  if (
                    shift.status !== "pending_completion" &&
                    shift.status !== "completed"
                  ) {
                    return;
                  }
                  setSelectedShift(shift);
                  setDialogMode("generate");
                  setIsDialogOpen(true);
                }
              }}
              className="gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Generate Report
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select
                  value={filterEmployee}
                  onValueChange={setFilterEmployee}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reports Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Closing Reports
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredReports.length} reports
              </p>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden min-w-0 p-0">
            <ClosingReportTable
              reports={filteredReports}
              employees={employees}
              onView={handleViewReport}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog */}
      <ClosingReportDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        shift={selectedShift}
        report={selectedReport}
        employee={
          selectedShift
            ? employees.find((e) => e.id === selectedShift.employeeId) || null
            : selectedReport
            ? employees.find((e) => e.id === selectedReport.employeeId) || null
            : null
        }
        employees={employees}
        sales={sales}
        onGenerate={handleGenerateReport}
      />
    </motion.div>
  );
}
