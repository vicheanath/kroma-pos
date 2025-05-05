"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { checkDatabaseHealth, resetDatabase } from "@/lib/db"
import { AlertTriangle, CheckCircle, Database, RefreshCw, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function DatabaseTools() {
  const [healthStatus, setHealthStatus] = useState<{
    isHealthy: boolean
    tables: Record<string, number>
    error?: string
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const { toast } = useToast()

  const handleCheckHealth = async () => {
    setIsChecking(true)
    try {
      const status = await checkDatabaseHealth()
      setHealthStatus(status)
    } catch (error) {
      console.error("Error checking database health:", error)
      toast({
        title: "Error",
        description: "Failed to check database health",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to reset the database? All data will be lost.")) {
      return
    }

    setIsResetting(true)
    try {
      const success = await resetDatabase()
      if (success) {
        toast({
          title: "Database Reset",
          description: "Database has been reset successfully. Please refresh the page.",
        })
        // Force reload after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast({
          title: "Reset Failed",
          description: "Failed to reset database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error resetting database:", error)
      toast({
        title: "Error",
        description: "An error occurred while resetting the database",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Tools
        </CardTitle>
        <CardDescription>Tools for managing and troubleshooting the database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthStatus && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Database Health:</h3>
              {healthStatus.isHealthy ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle className="mr-1 h-3 w-3" /> Healthy
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Unhealthy
                </Badge>
              )}
            </div>

            {healthStatus.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{healthStatus.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">Table Records:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(healthStatus.tables).map(([table, count]) => (
                  <div key={table} className="flex justify-between items-center rounded-md border p-2">
                    <span className="font-medium">{table}</span>
                    <Badge variant="secondary">{count} records</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Database Actions</h3>
          <p className="text-sm text-muted-foreground">
            Use these tools with caution. Resetting the database will delete all data.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCheckHealth} disabled={isChecking}>
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Health
            </>
          )}
        </Button>
        <Button variant="destructive" onClick={handleResetDatabase} disabled={isResetting}>
          {isResetting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Reset Database
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
