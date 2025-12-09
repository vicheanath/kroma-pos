# Database Migration Guide

This document explains how to manage database schema changes and migrations in the POS system.

## Overview

The database migration system is centralized in `lib/db-migrations.ts`. This file manages:

- Schema definitions for each version
- Migration functions for data transformations
- Version tracking and validation

## Adding a New Database Version

When you need to make schema changes (add tables, modify indexes, etc.):

### Step 1: Update `CURRENT_VERSION`

In `lib/db-migrations.ts`, increment the `CURRENT_VERSION` constant:

```typescript
export const CURRENT_VERSION = 4; // Increment from 3 to 4
```

### Step 2: Add Schema Definition

Add a new entry to `SCHEMA_VERSIONS` with ALL tables that should exist at this version:

```typescript
4: {
  // Include ALL tables from previous versions
  products: "id, name, price, ...",
  categories: "id, name, ...",
  // ... all previous tables ...

  // Add new tables or modify existing ones
  newTable: "id, field1, field2, ...",
},
```

**Important**: In Dexie, each version must include ALL stores from previous versions. If you omit a table, it will be deleted!

### Step 3: Add Migration Function (if needed)

If you need to transform existing data, add a migration function:

```typescript
export const MIGRATIONS: Record<number, (tx: any) => Promise<void> | void> = {
  // ... existing migrations ...
  4: async (tx) => {
    console.log("Running migration to version 4: ...");

    // Example: Transform existing data
    // const products = await tx.table('products').toArray();
    // for (const product of products) {
    //   // Transform product data
    //   await tx.table('products').update(product.id, transformedData);
    // }
  },
};
```

### Step 4: Add Migration Description

Update the `getMigrationDescription` function:

```typescript
export function getMigrationDescription(version: number): string {
  const descriptions: Record<number, string> = {
    // ... existing descriptions ...
    4: "Added newTable for new feature",
  };
  return descriptions[version] || `Migration to version ${version}`;
}
```

### Step 5: Update Type Definitions

If you added new tables, update the TypeScript types in `lib/db.ts`:

```typescript
export type NewTable = {
  id: string;
  field1: string;
  // ... other fields
};
```

And add the table property to the `PosDatabase` class:

```typescript
class PosDatabase extends Dexie {
  // ... existing tables ...
  newTable!: Dexie.Table<NewTable, string>;

  constructor() {
    // ... existing code ...
    this.newTable = this.table("newTable");
  }
}
```

## Common Migration Scenarios

### Adding a New Table

1. Increment `CURRENT_VERSION`
2. Add the new table to `SCHEMA_VERSIONS` (include all previous tables)
3. Add migration function (usually empty if no data transformation needed)
4. Update TypeScript types and table mappings

### Adding a Field to an Existing Table

**Note**: Dexie doesn't require schema changes for adding fields to existing objects. The new field will automatically be stored. However, if you need to:

- Add an index on the new field
- Set default values for existing records

Then you need a migration:

```typescript
4: async (tx) => {
  // Add default value to existing records
  const products = await tx.table('products').toArray();
  for (const product of products) {
    if (!product.newField) {
      await tx.table('products').update(product.id, {
        newField: 'defaultValue'
      });
    }
  }
},
```

### Removing a Table

1. Increment `CURRENT_VERSION`
2. In `SCHEMA_VERSIONS`, omit the table (it will be deleted)
3. Add migration to export/backup data if needed
4. Remove TypeScript types and table mappings

### Modifying Indexes

Update the schema string in `SCHEMA_VERSIONS`:

```typescript
// Before: products: "id, name, price"
// After:  products: "id, name, price, newIndex"
```

## Testing Migrations

1. **Test on a fresh database**: Create a new database and verify it starts at the latest version
2. **Test upgrades**: Start with an older version database and verify it upgrades correctly
3. **Test data integrity**: Verify that existing data is preserved during upgrades

## Rollback Strategy

Dexie doesn't support automatic rollbacks. If a migration fails:

1. The database will remain at the previous version
2. Fix the migration code
3. Users will need to refresh and the migration will retry

For production, consider:

- Backing up data before major migrations
- Testing migrations thoroughly
- Providing a way to export/import data

## Best Practices

1. **Always include all tables** in each version's schema
2. **Keep migrations idempotent** when possible
3. **Test migrations** on sample data
4. **Document changes** in migration descriptions
5. **Increment version** even for small changes to track history
6. **Use transactions** in migrations for data consistency

## Current Schema Versions

- **Version 1**: Initial schema (products, categories, sales, discounts, settings)
- **Version 2**: Added stockMovements table
- **Version 3**: Added employees, shifts, and closingReports tables
