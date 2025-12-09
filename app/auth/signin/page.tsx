"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogIn, Mail, Lock, AlertCircle, Copy, Check } from "lucide-react";
import { TEST_EMPLOYEES } from "@/lib/seed-employees";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    // Clear error when inputs change
    if (error) {
      setError("");
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // First, validate credentials client-side using IndexedDB
      const { employeesApi } = await import("@/lib/db");
      const { verifyPassword } = await import("@/lib/auth-utils");

      const employees = await employeesApi.getAll();
      const employee = employees.find((e) => e.email === email && e.isActive);

      if (!employee || !employee.password) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      const isValid = await verifyPassword(password, employee.password);

      if (!isValid) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // If credentials are valid, create a session using NextAuth
      // We'll pass the employee data to NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        // Pass employee data so NextAuth doesn't need to access IndexedDB
        employeeId: employee.id,
        employeeRole: employee.role,
        employeeName: employee.name,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        {/* Login Form */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the POS system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Test Credentials
            </CardTitle>
            <CardDescription>
              Use these credentials to test different user roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TEST_EMPLOYEES.map((employee, index) => (
                <div
                  key={employee.email}
                  className="p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{employee.name}</span>
                        <Badge
                          variant={
                            employee.role === "admin"
                              ? "destructive"
                              : employee.role === "manager"
                              ? "default"
                              : employee.role === "cashier"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {employee.role}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Email:</span>
                          <code className="text-xs bg-background px-2 py-1 rounded">
                            {employee.email}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              copyToClipboard(employee.email, index * 2)
                            }
                          >
                            {copiedIndex === index * 2 ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            Password:
                          </span>
                          <code className="text-xs bg-background px-2 py-1 rounded">
                            {employee.password}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              copyToClipboard(employee.password, index * 2 + 1)
                            }
                          >
                            {copiedIndex === index * 2 + 1 ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail(employee.email);
                        setPassword(employee.password);
                      }}
                      className="shrink-0"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                These are test accounts. Make sure to seed the database first by
                running the seed function.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
