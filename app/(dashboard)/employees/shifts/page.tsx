"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  usePosData,
  type Shift,
  type Employee,
} from "@/components/pos-data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveShiftsCard } from "./components/ActiveShiftsCard";
import { ShiftTable } from "./components/ShiftTable";
import { ShiftAssignmentDialog } from "./components/ShiftAssignmentDialog";
import { ClockInOutDialog } from "./components/ClockInOutDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format, subDays } from "date-fns";

export default function ShiftsPage() {
  const { employees, shifts, createShift, clockIn, clockOut, updateShift } =
    usePosData();
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("7");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false);
  const [isClockOutDialogOpen, setIsClockOutDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const activeShifts = shifts.filter((s) => s.status === "active");

  // Filter shifts
  const filteredShifts = shifts.filter((shift) => {
    const matchesEmployee =
      filterEmployee === "all" || shift.employeeId === filterEmployee;
    const matchesStatus =
      filterStatus === "all" || shift.status === filterStatus;

    let matchesDate = true;
    if (dateRange !== "all") {
      const days = parseInt(dateRange);
      const startDate = subDays(new Date(), days);
      matchesDate = new Date(shift.startTime) >= startDate;
    }

    return matchesEmployee && matchesStatus && matchesDate;
  });

  const handleClockIn = async (employeeId: string, notes?: string) => {
    await clockIn(employeeId, notes);
  };

  const handleClockOut = async (shiftId: string, notes?: string) => {
    await clockOut(shiftId, notes);
  };

  const handleAssignShift = async (shiftData: Omit<Shift, "id">) => {
    await createShift(shiftData);
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
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
              <p className="text-muted-foreground mt-1">
                Manage employee shifts and attendance
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(true)}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Assign Shift
            </Button>
            <Button
              onClick={() => {
                // If only one active employee, auto-select; otherwise show selection
                const activeEmployees = employees.filter((e) => e.isActive);
                if (activeEmployees.length === 1) {
                  setSelectedEmployee(activeEmployees[0]);
                  setIsClockInDialogOpen(true);
                } else {
                  // For now, just open dialog - in future could add employee selection
                  setIsClockInDialogOpen(true);
                }
              }}
              className="gap-2 shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              Clock In
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Active Shifts */}
      <motion.div variants={itemVariants}>
        <ActiveShiftsCard
          activeShifts={activeShifts}
          employees={employees}
          onClockOut={(shiftId) => {
            const shift = shifts.find((s) => s.id === shiftId);
            if (shift) {
              const employee = employees.find((e) => e.id === shift.employeeId);
              setSelectedEmployee(employee || null);
              setSelectedShift(shift);
              setIsClockOutDialogOpen(true);
            }
          }}
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending_completion">
                      Pending Report
                    </SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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

      {/* Shifts Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Shift History
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredShifts.length} shifts
              </p>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden min-w-0 p-0">
            <ShiftTable shifts={filteredShifts} employees={employees} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <ShiftAssignmentDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        employees={employees}
        onAssign={handleAssignShift}
      />

      <ClockInOutDialog
        isOpen={isClockInDialogOpen}
        onOpenChange={setIsClockInDialogOpen}
        employee={selectedEmployee}
        employees={employees}
        isClockIn={true}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
      />

      <ClockInOutDialog
        isOpen={isClockOutDialogOpen}
        onOpenChange={setIsClockOutDialogOpen}
        employee={selectedEmployee}
        isClockIn={false}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        shiftId={selectedShift?.id}
      />
    </motion.div>
  );
}
