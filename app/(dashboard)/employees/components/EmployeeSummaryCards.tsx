"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import { type Employee, type Shift } from "@/components/pos-data-provider";

interface EmployeeSummaryCardsProps {
  employees: Employee[];
  shifts: Shift[];
}

export function EmployeeSummaryCards({
  employees,
  shifts,
}: EmployeeSummaryCardsProps) {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.isActive).length;
  const onShiftCount = shifts.filter((s) => s.status === "active").length;
  const inactiveEmployees = employees.filter((e) => !e.isActive).length;

  const cards = [
    {
      title: "Total Employees",
      value: totalEmployees.toString(),
      icon: Users,
      description: "All employees",
      className: "border-primary/20 bg-primary/5",
    },
    {
      title: "Active Employees",
      value: activeEmployees.toString(),
      icon: UserCheck,
      description: "Currently active",
      className: "border-green-500/20 bg-green-500/5",
    },
    {
      title: "On Shift",
      value: onShiftCount.toString(),
      icon: Clock,
      description: "Currently working",
      className: "border-blue-500/20 bg-blue-500/5",
    },
    {
      title: "Inactive",
      value: inactiveEmployees.toString(),
      icon: UserX,
      description: "Inactive employees",
      className: "border-gray-500/20 bg-gray-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`border-2 shadow-sm ${card.className}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
