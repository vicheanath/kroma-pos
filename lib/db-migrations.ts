/**
 * Database Migration System
 *
 * This file manages database schema versions and migrations.
 * When adding a new version:
 * 1. Define the schema changes in SCHEMA_VERSIONS
 * 2. Add migration logic in MIGRATIONS if data transformation is needed
 * 3. Update CURRENT_VERSION constant
 */

import Dexie from "dexie";

// Current database version - increment when schema changes
export const CURRENT_VERSION = 5;

// Schema definitions for each version
// Each version includes ALL stores that should exist at that version
export const SCHEMA_VERSIONS: Record<number, Record<string, string>> = {
  1: {
    products:
      "id, name, price, category, categoryId, barcode, stock, description, sku, cost, taxable, taxRate, tags, attributes, variations",
    categories: "id, name, description, color, icon",
    sales:
      "id, items, total, subtotal, tax, discount, discountType, paymentMethod, date, customerName, customerEmail, customerPhone, notes, receiptNumber",
    discounts:
      "id, name, code, type, value, minOrderAmount, maxDiscount, startDate, endDate, isActive, appliesTo, categoryIds, productIds, usageLimit, usageCount",
    settings: "id",
  },
  2: {
    // Version 2: Added stockMovements table
    products:
      "id, name, price, category, categoryId, barcode, stock, description, sku, cost, taxable, taxRate, tags, attributes, variations",
    categories: "id, name, description, color, icon",
    sales:
      "id, items, total, subtotal, tax, discount, discountType, paymentMethod, date, customerName, customerEmail, customerPhone, notes, receiptNumber",
    discounts:
      "id, name, code, type, value, minOrderAmount, maxDiscount, startDate, endDate, isActive, appliesTo, categoryIds, productIds, usageLimit, usageCount",
    settings: "id",
    stockMovements:
      "id, productId, type, quantity, previousStock, newStock, date",
  },
  3: {
    // Version 3: Added employees, shifts, and closingReports tables
    products:
      "id, name, price, category, categoryId, barcode, stock, description, sku, cost, taxable, taxRate, tags, attributes, variations",
    categories: "id, name, description, color, icon",
    sales:
      "id, items, total, subtotal, tax, discount, discountType, paymentMethod, date, customerName, customerEmail, customerPhone, notes, receiptNumber",
    discounts:
      "id, name, code, type, value, minOrderAmount, maxDiscount, startDate, endDate, isActive, appliesTo, categoryIds, productIds, usageLimit, usageCount",
    settings: "id",
    stockMovements:
      "id, productId, type, quantity, previousStock, newStock, date",
    employees: "id, name, email, role, isActive, hireDate",
    shifts: "id, employeeId, startTime, endTime, status",
    closingReports: "id, shiftId, employeeId, date, createdAt",
  },
  4: {
    // Version 4: Added employeeId and shiftId to Sale type for better tracking
    products:
      "id, name, price, category, categoryId, barcode, stock, description, sku, cost, taxable, taxRate, tags, attributes, variations",
    categories: "id, name, description, color, icon",
    sales:
      "id, items, total, subtotal, tax, discount, discountType, paymentMethod, date, customerName, customerEmail, customerPhone, notes, receiptNumber, employeeId, shiftId",
    discounts:
      "id, name, code, type, value, minOrderAmount, maxDiscount, startDate, endDate, isActive, appliesTo, categoryIds, productIds, usageLimit, usageCount",
    settings: "id",
    stockMovements:
      "id, productId, type, quantity, previousStock, newStock, date",
    employees: "id, name, email, role, isActive, hireDate",
    shifts: "id, employeeId, startTime, endTime, status",
    closingReports: "id, shiftId, employeeId, date, createdAt",
  },
  5: {
    // Version 5: Added password field to Employee type for authentication
    products:
      "id, name, price, category, categoryId, barcode, stock, description, sku, cost, taxable, taxRate, tags, attributes, variations",
    categories: "id, name, description, color, icon",
    sales:
      "id, items, total, subtotal, tax, discount, discountType, paymentMethod, date, customerName, customerEmail, customerPhone, notes, receiptNumber, employeeId, shiftId",
    discounts:
      "id, name, code, type, value, minOrderAmount, maxDiscount, startDate, endDate, isActive, appliesTo, categoryIds, productIds, usageLimit, usageCount",
    settings: "id",
    stockMovements:
      "id, productId, type, quantity, previousStock, newStock, date",
    employees: "id, name, email, role, isActive, hireDate, password",
    shifts: "id, employeeId, startTime, endTime, status",
    closingReports: "id, shiftId, employeeId, date, createdAt",
  },
};

// Migration functions for data transformations
// These run when upgrading from one version to another
export const MIGRATIONS: Record<number, (tx: any) => Promise<void> | void> = {
  2: async (tx) => {
    console.log("Running migration to version 2: Adding stockMovements table");
    // No data migration needed - new table is empty
  },
  3: async (tx) => {
    console.log(
      "Running migration to version 3: Adding employees, shifts, and closingReports tables"
    );
    // No data migration needed - new tables are empty
  },
  4: async (tx) => {
    console.log(
      "Running migration to version 4: Adding employeeId and shiftId to Sale type"
    );

    // Extract employeeId and shiftId from notes for existing sales
    const salesTable = tx.table("sales");
    const allSales = await salesTable.toArray();

    let updatedCount = 0;
    for (const sale of allSales) {
      if (!sale.employeeId && !sale.shiftId && sale.notes) {
        // Try to extract employeeId and shiftId from notes
        // Format: "Employee: <id> | Shift: <id>"
        const employeeMatch = sale.notes.match(/Employee:\s*([^\s|]+)/);
        const shiftMatch = sale.notes.match(/Shift:\s*([^\s|]+)/);

        const employeeId = employeeMatch ? employeeMatch[1] : undefined;
        const shiftId = shiftMatch ? shiftMatch[1] : undefined;

        if (employeeId || shiftId) {
          // Remove the employee/shift info from notes
          let cleanedNotes = sale.notes
            .replace(/Employee:\s*[^\s|]+\s*\|?\s*/g, "")
            .replace(/Shift:\s*[^\s|]+\s*\|?\s*/g, "")
            .replace(/\|\s*\|/g, "|")
            .replace(/^\|\s*|\s*\|$/g, "")
            .trim();

          if (cleanedNotes === "" || cleanedNotes === "|") {
            cleanedNotes = undefined;
          }

          await salesTable.update(sale.id, {
            employeeId,
            shiftId,
            notes: cleanedNotes || undefined,
          });
          updatedCount++;
        }
      }
    }

    console.log(
      `Migrated ${updatedCount} sales with employeeId/shiftId extracted from notes`
    );
  },
  5: async (tx) => {
    console.log(
      "Running migration to version 5: Adding password field to Employee type"
    );
    // No data migration needed - password field is optional
    // Seed data will be added separately
  },
};

/**
 * Get schema for a specific version
 */
export function getSchemaForVersion(version: number): Record<string, string> {
  const schema = SCHEMA_VERSIONS[version];
  if (!schema) {
    throw new Error(`Schema definition not found for version ${version}`);
  }
  return schema;
}

/**
 * Get the latest schema (current version)
 */
export function getLatestSchema(): Record<string, string> {
  return getSchemaForVersion(CURRENT_VERSION);
}

/**
 * Get all tables that should exist at a given version
 */
export function getTablesForVersion(version: number): string[] {
  return Object.keys(getSchemaForVersion(version));
}

/**
 * Check if a table exists in a schema version
 */
export function tableExistsInVersion(
  tableName: string,
  version: number
): boolean {
  const schema = getSchemaForVersion(version);
  return tableName in schema;
}

/**
 * Run migration for a specific version
 */
export async function runMigration(version: number, tx: any): Promise<void> {
  const migration = MIGRATIONS[version];
  if (migration) {
    console.log(`Executing migration for version ${version}...`);
    await migration(tx);
    console.log(`Migration to version ${version} completed`);
  } else {
    console.log(`No migration logic needed for version ${version}`);
  }
}

/**
 * Get migration description for a version
 */
export function getMigrationDescription(version: number): string {
  const descriptions: Record<number, string> = {
    1: "Initial schema with products, categories, sales, discounts, and settings",
    2: "Added stockMovements table for inventory tracking",
    3: "Added employees, shifts, and closingReports tables for employee management",
    4: "Added employeeId and shiftId fields to Sale type for better tracking and closing report accuracy",
    5: "Added password field to Employee type for authentication",
  };
  return descriptions[version] || `Migration to version ${version}`;
}
