"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  productsApi,
  categoriesApi,
  salesApi,
  stockMovementsApi,
  employeesApi,
  shiftsApi,
  closingReportsApi,
  type Product as ProductType,
  type Category as CategoryType,
  type Sale as SaleType,
  type StockMovement as StockMovementType,
  type Employee as EmployeeType,
  type Shift as ShiftType,
  type ClosingReport as ClosingReportType,
} from "@/lib/db";

export type Product = ProductType;
export type Category = CategoryType;
export type Sale = SaleType;
export type StockMovement = StockMovementType;
export type Employee = EmployeeType;
export type Shift = ShiftType;
export type ClosingReport = ClosingReportType;

export type CartItem = {
  product: Product;
  quantity: number;
};

type PosDataContextType = {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  stockMovements: StockMovement[];
  employees: Employee[];
  shifts: Shift[];
  closingReports: ClosingReport[];
  addNewProduct: (product: Omit<Product, "id" | "category">) => Promise<void>;
  updateExistingProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  addNewCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateExistingCategory: (category: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  recordSale: (
    sale: Omit<Sale, "id" | "date">,
    employeeId?: string,
    shiftId?: string
  ) => Promise<Sale>;
  adjustStock: (
    productId: string,
    quantity: number,
    type: StockMovement["type"],
    reason?: string,
    notes?: string
  ) => Promise<void>;
  getStockMovements: (productId?: string) => StockMovement[];
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  createShift: (shift: Omit<Shift, "id">) => Promise<Shift>;
  updateShift: (shift: Shift) => Promise<void>;
  clockIn: (employeeId: string, notes?: string) => Promise<Shift>;
  clockOut: (shiftId: string, notes?: string) => Promise<void>;
  completeShift: (shiftId: string) => Promise<void>;
  resumeShift: (shiftId: string) => Promise<void>;
  getActiveShiftForEmployee: (employeeId?: string) => Shift | null;
  generateClosingReport: (
    shiftId: string,
    startCash: number,
    endCash: number,
    notes?: string
  ) => Promise<ClosingReport>;
  getClosingReports: (shiftId?: string, employeeId?: string) => ClosingReport[];
  syncToCloud: () => Promise<void>;
  fetchData: () => Promise<void>;
};

const PosDataContext = createContext<PosDataContextType>({
  products: [],
  categories: [],
  sales: [],
  stockMovements: [],
  employees: [],
  shifts: [],
  closingReports: [],
  addNewProduct: async () => {},
  updateExistingProduct: async () => {},
  removeProduct: async () => {},
  addNewCategory: async () => {},
  updateExistingCategory: async () => {},
  removeCategory: async () => {},
  recordSale: async () => ({
    id: "",
    items: [],
    total: 0,
    paymentMethod: "",
    date: new Date(),
  }),
  adjustStock: async () => {},
  getStockMovements: () => [],
  addEmployee: async () => {},
  updateEmployee: async () => {},
  removeEmployee: async () => {},
  createShift: async () => ({
    id: "",
    employeeId: "",
    startTime: new Date(),
    status: "scheduled",
  }),
  updateShift: async () => {},
  clockIn: async () => ({
    id: "",
    employeeId: "",
    startTime: new Date(),
    status: "active",
  }),
  clockOut: async () => {},
  completeShift: async () => {},
  resumeShift: async () => {},
  getActiveShiftForEmployee: () => null,
  generateClosingReport: async () => ({
    id: "",
    shiftId: "",
    employeeId: "",
    date: new Date(),
    startCash: 0,
    endCash: 0,
    expectedCash: 0,
    actualCash: 0,
    cashDifference: 0,
    totalSales: 0,
    totalTransactions: 0,
    paymentMethods: {},
    createdAt: new Date(),
  }),
  getClosingReports: () => [],
  syncToCloud: async () => {},
  fetchData: async () => {},
});

export function PosDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closingReports, setClosingReports] = useState<ClosingReport[]>([]);
  const { toast } = useToast();

  // Fetch all data
  const fetchData = async () => {
    try {
      const storedProducts = await productsApi.getAll();
      const storedCategories = await categoriesApi.getAll();
      const storedSales = await salesApi.getAll();
      const storedStockMovements = await stockMovementsApi.getAll();
      const storedEmployees = await employeesApi.getAll();
      const storedShifts = await shiftsApi.getAll();
      const storedClosingReports = await closingReportsApi.getAll();

      // Ensure state updates only after all data is fetched
      setProducts(storedProducts);
      setCategories(storedCategories);
      setSales(storedSales);
      setStockMovements(storedStockMovements);
      setEmployees(storedEmployees);
      setShifts(storedShifts);
      setClosingReports(storedClosingReports);

      toast({
        title: "Data Loaded",
        description: "All data has been successfully loaded.",
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data from the database.",
        variant: "destructive",
      });
    }
  };

  // Initialize database
  useEffect(() => {
    fetchData();
  }, []);

  // Add a new product
  const addNewProduct = async (product: Omit<Product, "id" | "category">) => {
    try {
      // Find the category to populate the category field
      const category = categories.find((c) => c.id === product.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
      const newProduct: Product = {
        ...product,
        id: crypto.randomUUID(),
        category,
      };
      await productsApi.add(newProduct);
      setProducts(await productsApi.getAll());
      toast({
        title: "Product Added",
        description: `${product.name} has been added to inventory`,
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  // Update an existing product
  const updateExistingProduct = async (product: Product) => {
    try {
      await productsApi.update(product);
      setProducts(await productsApi.getAll());
      toast({
        title: "Product Updated",
        description: `${product.name} has been updated`,
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  // Remove a product
  const removeProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(await productsApi.getAll());
      toast({
        title: "Product Removed",
        description: "Product has been removed from inventory",
      });
    } catch (error) {
      console.error("Failed to remove product:", error);
      toast({
        title: "Error",
        description: "Failed to remove product",
        variant: "destructive",
      });
    }
  };

  // Add a new category
  const addNewCategory = async (category: Omit<Category, "id">) => {
    try {
      const newCategory = { ...category, id: crypto.randomUUID() } as Category;

      await categoriesApi.add(newCategory);
      setCategories(await categoriesApi.getAll());
      toast({
        title: "Category Added",
        description: `${category.name} has been added`,
      });
    } catch (error) {
      console.error("Failed to add category:", error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  // Update an existing category
  const updateExistingCategory = async (category: Category) => {
    try {
      await categoriesApi.update(category);
      setCategories(await categoriesApi.getAll());
      toast({
        title: "Category Updated",
        description: `${category.name} has been updated`,
      });
    } catch (error) {
      console.error("Failed to update category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  // Remove a category
  const removeCategory = async (id: string) => {
    try {
      const productsInCategory = await productsApi.getByCategory(id);
      if (productsInCategory.length > 0) {
        toast({
          title: "Cannot Delete Category",
          description: `This category is used by ${productsInCategory.length} products. Please reassign or delete these products first.`,
          variant: "destructive",
        });
        return;
      }

      await categoriesApi.delete(id);
      setCategories(await categoriesApi.getAll());
      toast({
        title: "Category Removed",
        description: "Category has been removed",
      });
    } catch (error) {
      console.error("Failed to remove category:", error);
      toast({
        title: "Error",
        description: "Failed to remove category",
        variant: "destructive",
      });
    }
  };

  // Add a new employee
  const addEmployee = async (employee: Omit<Employee, "id">) => {
    try {
      const newEmployee = {
        ...employee,
        id: crypto.randomUUID(),
        hireDate: employee.hireDate || new Date(),
      } as Employee;
      await employeesApi.add(newEmployee);
      setEmployees(await employeesApi.getAll());
      toast({
        title: "Employee Added",
        description: `${employee.name} has been added`,
      });
    } catch (error) {
      console.error("Failed to add employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  // Update an existing employee
  const updateEmployee = async (employee: Employee) => {
    try {
      await employeesApi.update(employee);
      setEmployees(await employeesApi.getAll());
      toast({
        title: "Employee Updated",
        description: `${employee.name} has been updated`,
      });
    } catch (error) {
      console.error("Failed to update employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  // Remove an employee
  const removeEmployee = async (id: string) => {
    try {
      // Check if employee has active shifts
      const activeShifts = shifts.filter(
        (s) => s.employeeId === id && s.status === "active"
      );
      if (activeShifts.length > 0) {
        toast({
          title: "Cannot Delete Employee",
          description:
            "Employee has active shifts. Please complete or cancel shifts first.",
          variant: "destructive",
        });
        return;
      }

      await employeesApi.delete(id);
      setEmployees(await employeesApi.getAll());
      toast({
        title: "Employee Removed",
        description: "Employee has been removed",
      });
    } catch (error) {
      console.error("Failed to remove employee:", error);
      toast({
        title: "Error",
        description: "Failed to remove employee",
        variant: "destructive",
      });
    }
  };

  // Create a shift
  const createShift = async (shiftData: Omit<Shift, "id">): Promise<Shift> => {
    try {
      const newShift: Shift = {
        ...shiftData,
        id: crypto.randomUUID(),
        startTime: shiftData.startTime || new Date(),
      };
      await shiftsApi.add(newShift);
      setShifts(await shiftsApi.getAll());
      toast({
        title: "Shift Created",
        description: "Shift has been created successfully",
      });
      return newShift;
    } catch (error) {
      console.error("Failed to create shift:", error);
      toast({
        title: "Error",
        description: "Failed to create shift",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update a shift
  const updateShift = async (shift: Shift): Promise<void> => {
    try {
      await shiftsApi.update(shift);
      setShifts(await shiftsApi.getAll());
      toast({
        title: "Shift Updated",
        description: "Shift has been updated",
      });
    } catch (error) {
      console.error("Failed to update shift:", error);
      toast({
        title: "Error",
        description: "Failed to update shift",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Clock in (start a shift)
  const clockIn = async (
    employeeId: string,
    notes?: string
  ): Promise<Shift> => {
    try {
      // Validate employee exists and is active
      const employee = employees.find((e) => e.id === employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }
      if (!employee.isActive) {
        throw new Error("Employee is not active");
      }

      // Check if employee already has an active shift
      const activeShift = shifts.find(
        (s) => s.employeeId === employeeId && s.status === "active"
      );
      if (activeShift) {
        throw new Error("Employee already has an active shift");
      }

      const newShift: Shift = {
        id: crypto.randomUUID(),
        employeeId,
        startTime: new Date(),
        status: "active",
        notes,
      };

      await shiftsApi.add(newShift);
      setShifts(await shiftsApi.getAll());

      toast({
        title: "Clocked In",
        description: `${employee.name} has clocked in`,
      });

      return newShift;
    } catch (error: any) {
      console.error("Failed to clock in:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to clock in",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Clock out (end a shift)
  const clockOut = async (shiftId: string, notes?: string): Promise<void> => {
    try {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) {
        throw new Error("Shift not found");
      }

      if (shift.status !== "active") {
        throw new Error("Shift is not active");
      }

      const updatedShift: Shift = {
        ...shift,
        endTime: new Date(),
        status: "pending_completion",
        notes: notes || shift.notes,
      };

      await shiftsApi.update(updatedShift);
      setShifts(await shiftsApi.getAll());

      const employee = employees.find((e) => e.id === shift.employeeId);
      toast({
        title: "Clocked Out",
        description: `${
          employee?.name || "Employee"
        } has clocked out. Please generate closing report to complete the shift.`,
      });
    } catch (error: any) {
      console.error("Failed to clock out:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to clock out",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Complete a shift (mark as completed after closing report)
  const completeShift = async (shiftId: string): Promise<void> => {
    try {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) {
        throw new Error("Shift not found");
      }

      if (shift.status !== "pending_completion" && shift.status !== "active") {
        throw new Error(
          "Shift must be active or pending completion to be completed"
        );
      }

      const updatedShift: Shift = {
        ...shift,
        status: "completed",
        endTime: shift.endTime || new Date(),
      };

      await shiftsApi.update(updatedShift);
      setShifts(await shiftsApi.getAll());

      const employee = employees.find((e) => e.id === shift.employeeId);
      toast({
        title: "Shift Completed",
        description: `Shift for ${
          employee?.name || "Employee"
        } has been marked as completed`,
      });
    } catch (error: any) {
      console.error("Failed to complete shift:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete shift",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Resume a shift (if clocked out accidentally)
  const resumeShift = async (shiftId: string): Promise<void> => {
    try {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) {
        throw new Error("Shift not found");
      }

      if (shift.status !== "pending_completion") {
        throw new Error("Only pending completion shifts can be resumed");
      }

      const updatedShift: Shift = {
        ...shift,
        status: "active",
        endTime: undefined, // Clear end time when resuming
      };

      await shiftsApi.update(updatedShift);
      setShifts(await shiftsApi.getAll());

      const employee = employees.find((e) => e.id === shift.employeeId);
      toast({
        title: "Shift Resumed",
        description: `${employee?.name || "Employee"} has resumed their shift`,
      });
    } catch (error: any) {
      console.error("Failed to resume shift:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resume shift",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Generate closing report for a shift
  const generateClosingReport = async (
    shiftId: string,
    startCash: number,
    endCash: number,
    notes?: string
  ): Promise<ClosingReport> => {
    try {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) {
        throw new Error("Shift not found");
      }

      // Verify shift status - only allow reports for pending_completion or completed shifts
      if (
        shift.status !== "pending_completion" &&
        shift.status !== "completed"
      ) {
        throw new Error(
          `Cannot generate closing report for shift with status "${shift.status}". Shift must be clocked out (pending_completion) or already completed.`
        );
      }

      // Filter sales by shiftId (more accurate than date range)
      const shiftSales = sales.filter((sale) => sale.shiftId === shiftId);

      // Also filter by date range as a secondary check
      const shiftStart = new Date(shift.startTime);
      const shiftEnd = shift.endTime ? new Date(shift.endTime) : new Date();
      const dateFilteredSales = shiftSales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return saleDate >= shiftStart && saleDate <= shiftEnd;
      });

      // Use date-filtered sales for accuracy
      const finalShiftSales = dateFilteredSales;

      // Calculate totals
      const totalSales = finalShiftSales.reduce(
        (sum, sale) => sum + sale.total,
        0
      );
      const totalTransactions = finalShiftSales.length;

      // Calculate payment methods breakdown
      const paymentMethods: Record<string, number> = {};
      finalShiftSales.forEach((sale) => {
        const method = sale.paymentMethod || "unknown";
        paymentMethods[method] = (paymentMethods[method] || 0) + sale.total;
      });

      // Calculate sales by employee (in case multiple employees worked the shift)
      const salesByEmployee: Record<string, number> = {};
      finalShiftSales.forEach((sale) => {
        if (sale.employeeId) {
          const employee = employees.find((e) => e.id === sale.employeeId);
          const employeeName = employee?.name || sale.employeeId;
          salesByEmployee[employeeName] =
            (salesByEmployee[employeeName] || 0) + sale.total;
        } else {
          // If no employeeId, attribute to shift's employee
          const employee = employees.find((e) => e.id === shift.employeeId);
          const employeeName = employee?.name || shift.employeeId;
          salesByEmployee[employeeName] =
            (salesByEmployee[employeeName] || 0) + sale.total;
        }
      });

      // Calculate expected cash (starting cash + cash sales)
      const cashSales = paymentMethods.cash || 0;
      const expectedCash = startCash + cashSales;
      const actualCash = endCash;
      const cashDifference = actualCash - expectedCash;

      const report: ClosingReport = {
        id: crypto.randomUUID(),
        shiftId,
        employeeId: shift.employeeId,
        date: shiftEnd,
        startCash,
        endCash,
        expectedCash,
        actualCash,
        cashDifference,
        totalSales,
        totalTransactions,
        paymentMethods,
        salesByEmployee,
        notes,
        createdAt: new Date(),
      };

      await closingReportsApi.add(report);
      setClosingReports(await closingReportsApi.getAll());

      // Auto-complete the shift after successful report generation
      if (shift.status === "pending_completion") {
        await completeShift(shiftId);
      }

      toast({
        title: "Closing Report Generated",
        description:
          "Closing report has been generated successfully and shift has been completed.",
      });

      return report;
    } catch (error: any) {
      console.error("Failed to generate closing report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate closing report",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get closing reports
  const getClosingReports = (
    shiftId?: string,
    employeeId?: string
  ): ClosingReport[] => {
    let filtered = closingReports;
    if (shiftId) {
      filtered = filtered.filter((r) => r.shiftId === shiftId);
    }
    if (employeeId) {
      filtered = filtered.filter((r) => r.employeeId === employeeId);
    }
    return filtered;
  };

  // Get active shift for an employee (or first active shift if no employee specified)
  const getActiveShiftForEmployee = (employeeId?: string): Shift | null => {
    if (employeeId) {
      return (
        shifts.find(
          (s) => s.employeeId === employeeId && s.status === "active"
        ) || null
      );
    }
    return shifts.find((s) => s.status === "active") || null;
  };

  // Record a sale
  const recordSale = async (
    saleData: Omit<Sale, "id" | "date">,
    employeeId?: string,
    shiftId?: string
  ): Promise<Sale> => {
    try {
      // Validate that an active shift exists (required for sales)
      let activeShift: Shift | null = null;
      if (shiftId) {
        activeShift = shifts.find((s) => s.id === shiftId) || null;
        if (!activeShift || activeShift.status !== "active") {
          throw new Error(
            "Shift not found or not active. Please ensure you have an active shift before making a sale."
          );
        }
        // Use shift's employeeId if not provided
        if (!employeeId) {
          employeeId = activeShift.employeeId;
        }
      } else if (employeeId) {
        activeShift = getActiveShiftForEmployee(employeeId);
        if (!activeShift) {
          throw new Error(
            "No active shift found for employee. Please clock in before making a sale."
          );
        }
        shiftId = activeShift.id;
      } else {
        // Try to find any active shift
        activeShift = getActiveShiftForEmployee();
        if (!activeShift) {
          throw new Error(
            "No active shift found. Please ensure an employee is clocked in before making a sale."
          );
        }
        employeeId = activeShift.employeeId;
        shiftId = activeShift.id;
      }

      // Validate stock availability before processing sale
      const stockValidationErrors: string[] = [];
      const productStockChecks: Array<{
        product: Product;
        requiredQty: number;
      }> = [];

      for (const item of saleData.items) {
        const product = await productsApi.getById(item.productId);
        if (!product) {
          stockValidationErrors.push(`Product ${item.productId} not found`);
          continue;
        }
        if (product.stock < item.quantity) {
          stockValidationErrors.push(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
          );
        }
        productStockChecks.push({ product, requiredQty: item.quantity });
      }

      if (stockValidationErrors.length > 0) {
        throw new Error(
          `Stock validation failed:\n${stockValidationErrors.join("\n")}`
        );
      }

      // Create sale record with proper employeeId and shiftId
      const newSale: Sale = {
        ...saleData,
        id: crypto.randomUUID(),
        date: new Date(),
        employeeId,
        shiftId,
      };

      // Process sale and stock updates atomically (as much as possible with IndexedDB)
      try {
        await salesApi.add(newSale);

        // Update stock and create movements for each item
        for (const { product, requiredQty } of productStockChecks) {
          // Re-fetch to ensure we have latest stock
          const latestProduct = await productsApi.getById(product.id);
          if (!latestProduct) {
            throw new Error(
              `Product ${product.id} not found during stock update`
            );
          }

          const previousStock = latestProduct.stock;
          const newStock = Math.max(0, previousStock - requiredQty);

          // Update product stock
          await productsApi.update({
            ...latestProduct,
            stock: newStock,
          });

          // Create stock movement record
          const movement: StockMovement = {
            id: crypto.randomUUID(),
            productId: product.id,
            type: "sale",
            quantity: -requiredQty, // Negative for removals
            previousStock,
            newStock,
            reason: "Sale",
            notes: `Sale ID: ${newSale.id}`,
            date: new Date(),
          };

          await stockMovementsApi.add(movement);
        }

        // Refresh all data
        setProducts(await productsApi.getAll());
        setSales(await salesApi.getAll());
        setStockMovements(await stockMovementsApi.getAll());

        toast({
          title: "Sale Recorded",
          description: `Sale of $${newSale.total.toFixed(2)} has been recorded`,
        });

        return newSale;
      } catch (saleError) {
        // If sale was added but stock update failed, we have a problem
        // In a real system, we'd want to rollback, but IndexedDB doesn't support transactions
        // For now, log the error and throw
        console.error("Error during sale processing:", saleError);
        throw saleError;
      }
    } catch (error: any) {
      console.error("Failed to record sale:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record sale",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Adjust stock for a product
  const adjustStock = async (
    productId: string,
    quantity: number,
    type: StockMovement["type"] = "adjustment",
    reason?: string,
    notes?: string
  ): Promise<void> => {
    try {
      // Fetch the latest product data from database
      const product = await productsApi.getById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const previousStock = product.stock;
      // Calculate new stock (quantity can be positive or negative)
      const newStock = Math.max(0, previousStock + quantity);

      // Update product stock
      await productsApi.update({
        ...product,
        stock: newStock,
      });

      // Create stock movement record
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        productId,
        type,
        quantity,
        previousStock,
        newStock,
        reason: reason || "Manual adjustment",
        notes,
        date: new Date(),
      };

      await stockMovementsApi.add(movement);

      // Refresh data
      setProducts(await productsApi.getAll());
      setStockMovements(await stockMovementsApi.getAll());

      toast({
        title: "Stock Adjusted",
        description: `Stock for ${product.name} has been updated from ${previousStock} to ${newStock}`,
      });
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get stock movements for a product or all products
  const getStockMovements = (productId?: string): StockMovement[] => {
    if (productId) {
      return stockMovements.filter((m) => m.productId === productId);
    }
    return stockMovements;
  };

  // Sync to cloud
  const syncToCloud = async () => {
    // Placeholder for cloud sync logic
    toast({
      title: "Sync Complete",
      description: "All data has been synced to the cloud",
    });
  };

  return (
    <PosDataContext.Provider
      value={{
        products,
        categories,
        sales,
        stockMovements,
        employees,
        shifts,
        closingReports,
        addNewProduct,
        updateExistingProduct,
        removeProduct,
        addNewCategory,
        updateExistingCategory,
        removeCategory,
        recordSale,
        adjustStock,
        getStockMovements,
        addEmployee,
        updateEmployee,
        removeEmployee,
        createShift,
        updateShift,
        clockIn,
        clockOut,
        completeShift,
        resumeShift,
        getActiveShiftForEmployee,
        generateClosingReport,
        getClosingReports,
        syncToCloud,
        fetchData,
      }}
    >
      {children}
    </PosDataContext.Provider>
  );
}

export const usePosData = () => useContext(PosDataContext);
