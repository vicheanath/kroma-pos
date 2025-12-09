"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { initializeDatabase } from "@/lib/db";
import { seedEmployees } from "@/lib/seed-employees";
import { Button } from "@/components/ui/button";
import { AlertCircle, Database, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DatabaseInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeDb = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Initializing database...");
      const success = await initializeDatabase();

      if (success) {
        console.log("Database initialized successfully");
        // Wait a bit for database to be fully ready before seeding
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Seed test employees
        try {
          console.log("Starting employee seeding process...");
          await seedEmployees();
          console.log("✓ Test employees seeded successfully");
        } catch (seedError) {
          console.error("Failed to seed employees:", seedError);
          // Log detailed error for debugging
          if (seedError instanceof Error) {
            console.error(
              "Seed error details:",
              seedError.message,
              seedError.stack
            );
          }
          // Don't fail initialization if seeding fails - user can still use the app
          // But log it prominently
          console.warn(
            "⚠️ Employee seeding failed. You may need to manually add employees or reset the database."
          );
        }
        setIsInitialized(true);
      } else {
        throw new Error("Failed to initialize database");
      }
    } catch (err) {
      console.error("Error initializing database:", err);
      setError(err instanceof Error ? err.message : "Unknown database error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeDb();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Database className="h-12 w-12 animate-pulse text-primary" />
          <h2 className="text-2xl font-bold">Initializing Database</h2>
          <p className="text-muted-foreground">
            Please wait while we set up your POS system...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Error</AlertTitle>
            <AlertDescription>
              There was a problem initializing the database: {error}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={initializeDb}
              className="w-full"
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isLoading ? "Retrying..." : "Retry"}
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                try {
                  // Check if IndexedDB is available
                  if (typeof window !== "undefined" && "indexedDB" in window) {
                    // Request to delete the database
                    const request =
                      window.indexedDB.deleteDatabase("pos_system_db");

                    request.onsuccess = () => {
                      console.log("Database deleted successfully");
                      initializeDb();
                    };

                    request.onerror = () => {
                      console.error("Could not delete database");
                      setError("Failed to reset database");
                    };
                  }
                } catch (err) {
                  console.error("Error resetting database:", err);
                  setError("Failed to reset database");
                }
              }}
              className="w-full"
            >
              Reset Database
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-2xl font-bold">Database Not Ready</h2>
          <p className="text-muted-foreground">
            The database could not be initialized. Please try again.
          </p>
          <Button onClick={initializeDb} disabled={isLoading}>
            {isLoading ? "Initializing..." : "Initialize Database"}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
