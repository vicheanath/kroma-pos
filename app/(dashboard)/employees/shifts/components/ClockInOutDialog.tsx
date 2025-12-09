"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type Employee } from "@/components/pos-data-provider";
import { useToast } from "@/components/ui/use-toast";
import { Clock, LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClockInOutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  employees?: Employee[];
  isClockIn: boolean;
  onClockIn: (employeeId: string, notes?: string) => Promise<void>;
  onClockOut: (shiftId: string, notes?: string) => Promise<void>;
  shiftId?: string;
}

export function ClockInOutDialog({
  isOpen,
  onOpenChange,
  employee,
  employees = [],
  isClockIn,
  onClockIn,
  onClockOut,
  shiftId,
}: ClockInOutDialogProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    employee?.id || ""
  );

  // For clock in, allow employee selection if not provided
  const activeEmployees = employees.filter((e) => e.isActive);
  const selectedEmployee =
    employee ||
    activeEmployees.find((e) => e.id === selectedEmployeeId) ||
    null;

  if (isClockIn && !selectedEmployee && activeEmployees.length === 0) {
    return null;
  }

  if (!isClockIn && !employee) return null;

  const handleSubmit = async () => {
    if (isClockIn && !selectedEmployeeId) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isClockIn) {
        await onClockIn(selectedEmployeeId || employee?.id || "", notes);
      } else {
        if (!shiftId) {
          toast({
            title: "Error",
            description: "Shift ID is required",
            variant: "destructive",
          });
          return;
        }
        await onClockOut(shiftId, notes);
      }
      setNotes("");
      setSelectedEmployeeId("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Operation failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isClockIn ? (
              <Clock className="h-5 w-5 text-primary" />
            ) : (
              <LogOut className="h-5 w-5 text-primary" />
            )}
            {isClockIn ? "Clock In" : "Clock Out"}
          </DialogTitle>
          <DialogDescription>
            {isClockIn
              ? `Clock in ${
                  selectedEmployee?.name || employee?.name || "employee"
                } for their shift`
              : `Clock out ${employee?.name || "employee"} from their shift`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isClockIn && activeEmployees.length > 1 ? (
            <div className="space-y-2">
              <Label>
                Employee <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="text-sm text-muted-foreground">Employee</div>
              <div className="font-semibold">
                {selectedEmployee?.name || employee?.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedEmployee?.email || employee?.email}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this clock in/out"
              className="border-2 focus:border-primary min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setNotes("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 shadow-sm"
          >
            {isClockIn ? (
              <>
                <Clock className="h-4 w-4" />
                {isSubmitting ? "Clocking In..." : "Clock In"}
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                {isSubmitting ? "Clocking Out..." : "Clock Out"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
