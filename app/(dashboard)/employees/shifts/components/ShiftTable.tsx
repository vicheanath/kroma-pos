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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Clock } from "lucide-react";
import { type Shift, type Employee } from "@/components/pos-data-provider";
import { format } from "date-fns";

interface ShiftTableProps {
  shifts: Shift[];
  employees: Employee[];
}

export function ShiftTable({ shifts, employees }: ShiftTableProps) {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  const getStatusBadge = (status: Shift["status"]) => {
    const variants: Record<
      Shift["status"],
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      scheduled: { label: "Scheduled", variant: "outline" },
      active: { label: "Active", variant: "default" },
      pending_completion: { label: "Pending Report", variant: "secondary" },
      completed: { label: "Completed", variant: "secondary" },
      cancelled: { label: "Cancelled", variant: "destructive" },
    };

    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getShiftDuration = (startTime: Date, endTime?: Date) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (shifts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Clock className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No shifts found</EmptyTitle>
          <EmptyDescription>
            No shifts match your current filters.
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
            <TableHead>Employee</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => (
            <TableRow key={shift.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {getEmployeeName(shift.employeeId)}
              </TableCell>
              <TableCell>
                {format(new Date(shift.startTime), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                {shift.endTime
                  ? format(new Date(shift.endTime), "MMM dd, yyyy HH:mm")
                  : "-"}
              </TableCell>
              <TableCell>
                {getShiftDuration(shift.startTime, shift.endTime)}
              </TableCell>
              <TableCell>{getStatusBadge(shift.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
