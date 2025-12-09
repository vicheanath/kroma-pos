"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { usePosData } from "@/components/pos-data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { salesApi } from "@/lib/db";
import { ReportFilters } from "./components/ReportFilters";
import { RevenueChart } from "./components/RevenueChart";
import { TopProductsChart } from "./components/TopProductsChart";
import { SalesTable } from "./components/SalesTable";
import { exportToCSV, printReport, printInvoice } from "./utils/exportUtils";

export default function ReportsPage() {
  const { sales, products, categories } = usePosData();
  const [dateRange, setDateRange] = useState("week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load data based on selected date range
  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      try {
        // Calculate date range
        const now = new Date();
        let start: Date;
        let end: Date = now;

        switch (dateRange) {
          case "day":
            start = subDays(now, 7); // Last 7 days
            break;
          case "week":
            start = startOfWeek(now);
            end = endOfWeek(now);
            break;
          case "month":
            start = startOfMonth(now);
            end = endOfMonth(now);
            break;
          case "custom":
            if (startDate && endDate) {
              start = new Date(startDate);
              end = new Date(endDate);
              end.setHours(23, 59, 59, 999); // End of the day
            } else {
              // Default to last 30 days if custom dates not set
              start = subDays(now, 30);
            }
            break;
          default:
            start = subDays(now, 30);
        }

        // Get sales for the date range
        const salesInRange = await salesApi.getByDateRange(start, end);
        setFilteredSales(salesInRange);

        // Get top selling products
        const topProducts = await salesApi.getTopSellingProducts(5);

        // Map product IDs to names
        const topProductsWithNames = await Promise.all(
          topProducts.map(async (item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              name: product ? product.name : "Unknown Product",
              sales: item.totalSold,
            };
          })
        );

        setTopProductsData(topProductsWithNames);

        // Generate revenue data based on date range
        const revenueChartData: any[] = [];

        if (dateRange === "day") {
          // Daily data for the last 7 days
          for (let i = 6; i >= 0; i--) {
            const date = subDays(now, i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const dayRevenue = await salesApi.getRevenueByDateRange(
              dayStart,
              dayEnd
            );

            revenueChartData.push({
              name: format(date, "EEE"),
              sales: dayRevenue,
            });
          }
        } else if (dateRange === "week") {
          // Weekly data
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const dayRevenue = await salesApi.getRevenueByDateRange(
              dayStart,
              dayEnd
            );

            revenueChartData.push({
              name: days[i],
              sales: dayRevenue,
            });
          }
        } else if (dateRange === "month") {
          // Monthly data - group by week
          for (let i = 0; i < 4; i++) {
            const weekStart = new Date(start);
            weekStart.setDate(start.getDate() + i * 7);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            if (weekEnd > end) {
              weekEnd.setTime(end.getTime());
            }

            const weekRevenue = await salesApi.getRevenueByDateRange(
              weekStart,
              weekEnd
            );

            revenueChartData.push({
              name: `Week ${i + 1}`,
              sales: weekRevenue,
            });
          }
        } else if (dateRange === "custom") {
          // Custom date range - calculate appropriate intervals
          const dayDiff = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (dayDiff <= 7) {
            // Show daily data if range is a week or less
            for (let i = 0; i < dayDiff; i++) {
              const date = new Date(start);
              date.setDate(start.getDate() + i);
              const dayStart = new Date(date.setHours(0, 0, 0, 0));
              const dayEnd = new Date(date.setHours(23, 59, 59, 999));

              const dayRevenue = await salesApi.getRevenueByDateRange(
                dayStart,
                dayEnd
              );

              revenueChartData.push({
                name: format(date, "MM/dd"),
                sales: dayRevenue,
              });
            }
          } else {
            // Show weekly data for longer ranges
            const weeks = Math.ceil(dayDiff / 7);
            for (let i = 0; i < weeks; i++) {
              const weekStart = new Date(start);
              weekStart.setDate(start.getDate() + i * 7);

              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);

              if (weekEnd > end) {
                weekEnd.setTime(end.getTime());
              }

              const weekRevenue = await salesApi.getRevenueByDateRange(
                weekStart,
                weekEnd
              );

              revenueChartData.push({
                name: `Week ${i + 1}`,
                sales: weekRevenue,
              });
            }
          }
        }

        setRevenueData(revenueChartData);
      } catch (error) {
        console.error("Error loading report data:", error);
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, [dateRange, startDate, endDate, products, toast]);

  const handleExportCSV = () => {
    exportToCSV(filteredSales, reportRef, toast);
  };

  const handlePrintReport = () => {
    printReport(reportRef, filteredSales, toast);
  };

  const handlePrintInvoice = (sale: any) => {
    printInvoice(sale, toast);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  // Calculate summary statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTransaction =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalItems = filteredSales.reduce(
    (sum, sale) => sum + sale.items.length,
    0
  );

  return (
    <motion.div
      className="space-y-6 overflow-hidden min-w-0"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Total sales</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Transaction
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageTransaction.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Total items</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ReportFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          productFilter={productFilter}
          onProductFilterChange={setProductFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          products={products}
          categories={categories}
          onExportCSV={handleExportCSV}
          onPrint={handlePrintReport}
        />
      </motion.div>

      <div ref={reportRef}>
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          <RevenueChart data={revenueData} isLoading={isLoading} />
          <TopProductsChart data={topProductsData} isLoading={isLoading} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <SalesTable
            sales={filteredSales}
            isLoading={isLoading}
            onPrintInvoice={handlePrintInvoice}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
