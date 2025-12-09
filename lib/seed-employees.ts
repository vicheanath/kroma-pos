/**
 * Seed test employees with all roles for authentication testing
 */

import { getDB, employeesApi, initializeDatabase } from "./db";
import { hashPassword } from "./auth-utils";
import type { Employee } from "./db";

export const TEST_EMPLOYEES = [
  {
    name: "Admin User",
    email: "admin@pos.test",
    password: "admin123",
    role: "admin" as const,
    phone: "+1234567890",
    isActive: true,
    hireDate: new Date("2024-01-01"),
    notes: "Test admin account",
  },
  {
    name: "Manager User",
    email: "manager@pos.test",
    password: "manager123",
    role: "manager" as const,
    phone: "+1234567891",
    isActive: true,
    hireDate: new Date("2024-01-02"),
    notes: "Test manager account",
  },
  {
    name: "Cashier User",
    email: "cashier@pos.test",
    password: "cashier123",
    role: "cashier" as const,
    phone: "+1234567892",
    isActive: true,
    hireDate: new Date("2024-01-03"),
    notes: "Test cashier account",
  },
  {
    name: "Staff User",
    email: "staff@pos.test",
    password: "staff123",
    role: "staff" as const,
    phone: "+1234567893",
    isActive: true,
    hireDate: new Date("2024-01-04"),
    notes: "Test staff account",
  },
];

/**
 * Seed test employees into the database
 * This will only add employees if they don't already exist
 */
export async function seedEmployees(): Promise<void> {
  try {
    console.log("Starting employee seeding...");

    // Try to get DB first - if it fails, initialize
    let db;
    try {
      db = getDB();
      if (!db || !db.isOpen()) {
        throw new Error("Database not open");
      }
    } catch (error) {
      console.log("Database not ready, initializing...");
      const initialized = await initializeDatabase();
      if (!initialized) {
        throw new Error("Database initialization failed");
      }
      // Wait a bit to ensure database is fully ready
      await new Promise((resolve) => setTimeout(resolve, 1000));
      db = getDB();
      if (!db || !db.isOpen()) {
        throw new Error("Database is not open after initialization");
      }
    }

    console.log("Database is ready, fetching existing employees...");

    // Get existing employees
    let existingEmployees: Employee[] = [];
    try {
      existingEmployees = await employeesApi.getAll();
      console.log(`Found ${existingEmployees.length} existing employees`);
    } catch (error) {
      console.error("Error fetching existing employees:", error);
      // Continue anyway - might be first time
    }

    let seededCount = 0;
    let skippedCount = 0;

    // Hash passwords and create employees
    for (const testEmployee of TEST_EMPLOYEES) {
      try {
        // Check if employee already exists
        const exists = existingEmployees.some(
          (e) => e.email === testEmployee.email
        );

        if (exists) {
          console.log(
            `Employee ${testEmployee.email} already exists, skipping`
          );
          skippedCount++;
          continue;
        }

        console.log(`Seeding employee: ${testEmployee.email}...`);

        // Hash password
        const hashedPassword = await hashPassword(testEmployee.password);
        console.log(`Password hashed for ${testEmployee.email}`);

        // Create employee with ID
        const employee: Employee = {
          id: crypto.randomUUID(),
          name: testEmployee.name,
          email: testEmployee.email,
          phone: testEmployee.phone,
          role: testEmployee.role,
          isActive: testEmployee.isActive,
          hireDate: testEmployee.hireDate,
          password: hashedPassword,
          notes: testEmployee.notes,
        };

        await employeesApi.add(employee);
        seededCount++;
        console.log(
          `✓ Seeded employee: ${testEmployee.email} (${testEmployee.role})`
        );
      } catch (employeeError) {
        console.error(
          `Failed to seed employee ${testEmployee.email}:`,
          employeeError
        );
        // Continue with next employee
      }
    }

    console.log(
      `Employee seeding completed: ${seededCount} added, ${skippedCount} skipped`
    );
  } catch (error) {
    console.error("Failed to seed employees:", error);
    // Re-throw so caller knows it failed
    throw error;
  }
}
