"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface EmployeeFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterRole: string;
  onFilterRoleChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

export function EmployeeFilters({
  searchQuery,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search employees by name, email, phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-11 border-2 focus:border-primary transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterRole} onValueChange={onFilterRoleChange}>
          <SelectTrigger className="w-[180px] border-2">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="cashier">Cashier</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-[180px] border-2">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[180px] border-2">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="hireDate">Hire Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
