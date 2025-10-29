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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Download, Calendar, Printer } from "lucide-react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { salesApi } from "@/lib/db";

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

            const dayRevenue = await await salesApi.getRevenueByDateRange(
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

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Date",
      "Transaction ID",
      "Customer",
      "Items",
      "Payment Method",
      "Amount",
    ];
    const csvRows = [headers];

    // Add data rows
    filteredSales.forEach((sale) => {
      const row = [
        format(new Date(sale.date), "yyyy-MM-dd HH:mm:ss"),
        sale.id,
        sale.customerName || "Walk-in Customer",
        sale.items.length.toString(),
        sale.paymentMethod === "credit"
          ? "Credit Card"
          : sale.paymentMethod === "cash"
          ? "Cash"
          : "Mobile Payment",
        sale.total.toFixed(2),
      ];
      csvRows.push(row);
    });

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_report_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Exported",
      description: "The sales report has been exported as CSV.",
    });
  };

  // Print report
  const printReport = () => {
    if (!reportRef.current) return;

    const printContent = reportRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print Error",
        description:
          "Could not open print window. Please check your browser settings.",
        variant: "destructive",
      });
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report - ${format(new Date(), "yyyy-MM-dd")}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 1000px;
              margin: 0 auto;
            }
            h1, h2 {
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
            .report-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .report-summary {
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Sales Report</h1>
          <div class="report-header">
            <div>
              <p><strong>Date:</strong> ${format(
                new Date(),
                "MMMM dd, yyyy"
              )}</p>
              <p><strong>Generated by:</strong> POS System</p>
            </div>
            <div>
              <p><strong>Total Sales:</strong> ${filteredSales.length}</p>
              <p><strong>Total Revenue:</strong> $${filteredSales
                .reduce((sum, sale) => sum + sale.total, 0)
                .toFixed(2)}</p>
            </div>
          </div>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    toast({
      title: "Report Printed",
      description: "The sales report has been sent to the printer.",
    });
  };

  // Add a function to handle printing individual invoices
  const printInvoice = (sale: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print Error",
        description:
          "Could not open print window. Please check your browser settings.",
        variant: "destructive",
      });
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${sale.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
            }
            h1, h2 {
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1>Invoice</h1>
          <p><strong>Transaction ID:</strong> ${sale.id}</p>
          <p><strong>Date:</strong> ${format(
            new Date(sale.date),
            "MMM dd, yyyy HH:mm"
          )}</p>
          <p><strong>Customer:</strong> ${
            sale.customerName || "Walk-in Customer"
          }</p>
          <h2>Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <p><strong>Total:</strong> $${sale.total.toFixed(2)}</p>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    toast({
      title: "Invoice Printed",
      description: `Invoice for transaction ${sale.id} has been sent to the printer.`,
    });
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

  // Custom tooltip component for charts
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm">{`Sales: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="space-y-6 overflow-hidden min-w-0"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-between"
      >
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
              <div className="flex items-center">
                <span className="mx-2">to</span>
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products &&
                products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories &&
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <Button variant="outline" onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </motion.div>

      <div ref={reportRef}>
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Spinner className="h-6 w-6" />
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              ) : revenueData.length === 0 ? (
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
                  <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#8884d8" />
                      <YAxis stroke="#8884d8" />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="rgb(34, 197, 94)" // Tailwind green-500
                        strokeWidth={3}
                        dot={{ r: 5, fill: "rgb(34, 197, 94)" }} // Tailwind green-500
                        activeDot={{ r: 8, fill: "rgb(22, 163, 74)" }} // Tailwind green-600
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Spinner className="h-6 w-6" />
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              ) : topProductsData.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BarChart className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No data available</EmptyTitle>
                    <EmptyDescription>
                      No top products data found for the selected date range.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topProductsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#8884d8" />
                      <YAxis stroke="#8884d8" />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="sales"
                        fill="rgb(239, 68, 68)" // Tailwind red-500
                        radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sales Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Spinner className="h-6 w-6" />
                          <p className="text-sm text-muted-foreground">
                            Loading sales data...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-gray-100">
                        <TableCell>
                          {format(new Date(sale.date), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{sale.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          {sale.customerName || "Walk-in Customer"}
                        </TableCell>
                        <TableCell>{sale.items.length} items</TableCell>
                        <TableCell>
                          {sale.paymentMethod === "credit"
                            ? "Credit Card"
                            : sale.paymentMethod === "cash"
                            ? "Cash"
                            : "Mobile Payment"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${sale.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printInvoice(sale)}
                          >
                            Print Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8">
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <BarChart className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyTitle>No sales data available</EmptyTitle>
                            <EmptyDescription>
                              No sales data found for the selected period. Try adjusting your date range or filters.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
