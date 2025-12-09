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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Employee, type Shift } from "@/components/pos-data-provider";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ShiftAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  onAssign: (shift: Omit<Shift, "id">) => Promise<void>;
}

export function ShiftAssignmentDialog({
  isOpen,
  onOpenChange,
  employees,
  onAssign,
}: ShiftAssignmentDialogProps) {
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState("");
  const [startTime, setStartTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAssign({
        employeeId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        status: "scheduled",
        notes: notes || undefined,
      });

      // Reset form
      setEmployeeId("");
      setStartTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setEndTime("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning shift:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Shift</DialogTitle>
          <DialogDescription>
            Schedule a shift for an employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Employee <span className="text-destructive">*</span>
            </Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter((e) => e.isActive)
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label>End Time (Optional)</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border-2 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this shift"
              className="border-2 focus:border-primary min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setEmployeeId("");
              setStartTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
              setEndTime("");
              setNotes("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2 shadow-sm">
            Assign Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
