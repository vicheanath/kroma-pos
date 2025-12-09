"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatabaseTools } from "./database-tools";
import { SeedEmployeesTool } from "./seed-employees";
import { Code, Database, Settings } from "lucide-react";

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState("database");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground">
          Advanced tools for system maintenance and troubleshooting.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <DatabaseTools />
          <SeedEmployeesTool />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Advanced system configuration options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>System settings tools will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>View and analyze system logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Log viewing tools will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
