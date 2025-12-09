"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { type Shift, type Employee } from "@/components/pos-data-provider";
import { format } from "date-fns";

interface ActiveShiftsCardProps {
  activeShifts: Shift[];
  employees: Employee[];
  onClockOut: (shiftId: string) => void;
}

export function ActiveShiftsCard({
  activeShifts,
  employees,
  onClockOut,
}: ActiveShiftsCardProps) {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  const getShiftDuration = (startTime: Date) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (activeShifts.length === 0) {
    return (
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Active Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No active shifts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Active Shifts ({activeShifts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeShifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {getEmployeeName(shift.employeeId)}
                  </span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Started:{" "}
                  {format(new Date(shift.startTime), "MMM dd, yyyy HH:mm")}
                </div>
                <div className="text-sm text-muted-foreground">
                  Duration: {getShiftDuration(shift.startTime)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClockOut(shift.id)}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Clock Out
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
