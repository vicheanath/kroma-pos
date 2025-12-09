"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { seedEmployees, TEST_EMPLOYEES } from "@/lib/seed-employees";
import { useToast } from "@/components/ui/use-toast";
import { Database, CheckCircle2, AlertCircle } from "lucide-react";

export function SeedEmployeesTool() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededCount, setSeededCount] = useState(0);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeededCount(0);

    try {
      await seedEmployees();
      setSeededCount(TEST_EMPLOYEES.length);
      toast({
        title: "Employees Seeded",
        description: `Successfully seeded ${TEST_EMPLOYEES.length} test employees`,
      });
    } catch (error: any) {
      console.error("Seed error:", error);
      toast({
        title: "Seeding Failed",
        description: error.message || "Failed to seed employees",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Seed Test Employees
        </CardTitle>
        <CardDescription>
          Manually seed test employees with all roles for authentication testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will add {TEST_EMPLOYEES.length} test employees if they don't
            already exist. Employees with matching emails will be skipped.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Test Employees:</div>
          <div className="space-y-1 text-sm">
            {TEST_EMPLOYEES.map((emp) => (
              <div
                key={emp.email}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div>
                  <span className="font-medium">{emp.name}</span>
                  <span className="text-muted-foreground ml-2">
                    ({emp.role})
                  </span>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {emp.email}
                </code>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSeed} disabled={isSeeding} className="w-full">
          {isSeeding ? (
            <>
              <Database className="mr-2 h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Seed Employees
            </>
          )}
        </Button>

        {seededCount > 0 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Successfully seeded {seededCount} employees. You can now log in
              with the test credentials.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
