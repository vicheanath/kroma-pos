"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, User } from "lucide-react";
import { type Employee } from "@/components/pos-data-provider";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface EmployeeTableRowProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  variants?: any;
}

export function EmployeeTableRow({
  employee,
  onEdit,
  onDelete,
  variants,
}: EmployeeTableRowProps) {
  const getRoleBadge = (role: Employee["role"]) => {
    const variants: Record<
      Employee["role"],
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      admin: { label: "Admin", variant: "destructive" },
      manager: { label: "Manager", variant: "default" },
      cashier: { label: "Cashier", variant: "secondary" },
      staff: { label: "Staff", variant: "outline" },
    };

    const config = variants[role] || variants.staff;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <motion.tr
      variants={variants}
      className="hover:bg-muted/50 transition-colors"
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold">{employee.name}</div>
            <div className="text-xs text-muted-foreground">
              {employee.email}
            </div>
            {employee.phone && (
              <div className="text-xs text-muted-foreground">
                {employee.phone}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{getRoleBadge(employee.role)}</TableCell>
      <TableCell>
        <Badge variant={employee.isActive ? "default" : "secondary"}>
          {employee.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {format(new Date(employee.hireDate), "MMM dd, yyyy")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(employee)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  );
}
