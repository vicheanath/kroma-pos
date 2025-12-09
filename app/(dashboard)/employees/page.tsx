"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePosData, type Employee } from "@/components/pos-data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeSummaryCards } from "./components/EmployeeSummaryCards";
import { EmployeeFilters } from "./components/EmployeeFilters";
import { EmployeeTable } from "./components/EmployeeTable";
import { AddEmployeeDialog } from "./components/AddEmployeeDialog";
import { EditEmployeeDialog } from "./components/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "./components/DeleteEmployeeDialog";

export default function EmployeesPage() {
  const { employees, shifts, addEmployee, updateEmployee, removeEmployee } =
    usePosData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Filter and sort employees
  const filteredEmployees = employees
    .filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = filterRole === "all" || employee.role === filterRole;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && employee.isActive) ||
        (filterStatus === "inactive" && !employee.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "role") {
        return a.role.localeCompare(b.role);
      } else if (sortBy === "hireDate") {
        return new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime();
      }
      return 0;
    });

  const handleAddEmployee = async (employee: Omit<Employee, "id">) => {
    await addEmployee(employee);
  };

  const handleEditEmployee = async (employee: Employee) => {
    await updateEmployee(employee);
    setIsEditDialogOpen(false);
    setCurrentEmployee(null);
  };

  const handleDeleteEmployee = () => {
    if (!currentEmployee) return;
    removeEmployee(currentEmployee.id);
    setIsDeleteDialogOpen(false);
    setCurrentEmployee(null);
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
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
              <p className="text-muted-foreground mt-1">
                Manage your employees and their information
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants}>
        <EmployeeSummaryCards employees={employees} shifts={shifts} />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6">
            <EmployeeFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterRole={filterRole}
              onFilterRoleChange={setFilterRole}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Employees Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Employee List
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredEmployees.length} of {employees.length} employees
              </p>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden min-w-0 p-0">
            <EmployeeTable
              employees={filteredEmployees}
              onEdit={(employee) => {
                setCurrentEmployee(employee);
                setIsEditDialogOpen(true);
              }}
              onDelete={(employee) => {
                setCurrentEmployee(employee);
                setIsDeleteDialogOpen(true);
              }}
              itemVariants={itemVariants}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <AddEmployeeDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddEmployee}
      />

      <EditEmployeeDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        employee={currentEmployee}
        onUpdate={handleEditEmployee}
      />

      <DeleteEmployeeDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={currentEmployee}
        onDelete={handleDeleteEmployee}
      />
    </motion.div>
  );
}
