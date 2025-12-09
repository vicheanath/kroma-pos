"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { BarChart } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";

interface RevenueChartProps {
  data: any[];
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Revenue Over Time
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Spinner className="h-6 w-6" />
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        ) : data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No data available</EmptyTitle>
              <EmptyDescription>
                No revenue data found for the selected date range.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis stroke="#8884d8" />
              <RechartsTooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="rgb(34, 197, 94)"
                strokeWidth={3}
                dot={{ r: 5, fill: "rgb(34, 197, 94)" }}
                activeDot={{ r: 8, fill: "rgb(22, 163, 74)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
