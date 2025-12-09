"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Users } from "lucide-react";
import { EmployeeTableRow } from "./EmployeeTableRow";
import { type Employee } from "@/components/pos-data-provider";
import { AnimatePresence } from "framer-motion";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  itemVariants?: any;
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  itemVariants,
}: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No employees found</EmptyTitle>
          <EmptyDescription>
            No employees match your current filters.
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
            <TableHead className="w-[300px]">Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {employees.map((employee) => (
              <EmployeeTableRow
                key={employee.id}
                employee={employee}
                onEdit={onEdit}
                onDelete={onDelete}
                variants={itemVariants}
              />
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
