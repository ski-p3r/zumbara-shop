// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  getDashboard,
  getSales,
  getOrderTrends,
  getPayments,
  getDeliveries,
} from "@/utils/api/analytics";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Format price in ETB
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Format number
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-ET").format(num);
};

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface SalesData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

interface OrderTrend {
  date: string;
  orderCount: number;
  revenue: number;
}

interface PaymentData {
  totalPaymentProofs: number;
  approvedPayments: number;
  pendingPayments: number;
  declinedPayments: number;
  approvalRate: number;
  averageReviewTimeMinutes: number;
}

interface DeliveryData {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  completionRate: number;
  averageDeliveryTimeHours: number;
  topDeliveryPersons: Array<{
    id: string;
    name: string;
    image: string;
    totalDeliveries: number;
    completedDeliveries: number;
  }>;
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [orderTrends, setOrderTrends] = useState<OrderTrend[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const from = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
      const to = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

      const [
        dashboardRes,
        salesRes,
        orderTrendsRes,
        paymentsRes,
        deliveriesRes,
      ] = await Promise.all([
        getDashboard(),
        getSales(from, to),
        getOrderTrends(from, to),
        getPayments(),
        getDeliveries(),
      ]);

      setDashboardData(dashboardRes);
      setSalesData(salesRes);
      setOrderTrends(orderTrendsRes);
      setPaymentData(paymentsRes);
      setDeliveryData(deliveriesRes);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
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
            <div className="text-2xl font-bold">
              {formatPrice(dashboardData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              from {dashboardData?.totalOrders || 0} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
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
              {formatNumber(dashboardData?.totalCustomers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.conversionRate || 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
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
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.totalOrders || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.pendingOrders || 0} pending,{" "}
              {dashboardData?.deliveredOrders || 0} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
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
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.totalProducts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.lowStockProducts || 0} low stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Revenue Trend Area Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={orderTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        format(new Date(value), "MMM dd")
                      }
                    />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip
                      formatter={(value: number) => [
                        formatPrice(value),
                        "Revenue",
                      ]}
                      labelFormatter={(label) =>
                        `Date: ${format(new Date(label), "MMM dd, yyyy")}`
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Trends Bar Chart */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Order Trends</CardTitle>
                <CardDescription>Daily order count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        format(new Date(value), "MMM dd")
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) =>
                        `Date: ${format(new Date(label), "MMM dd, yyyy")}`
                      }
                    />
                    <Bar
                      dataKey="orderCount"
                      fill="#82ca9d"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sales Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Sales:</span>
                  <span className="font-semibold">
                    {formatPrice(salesData?.totalSales || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-semibold">
                    {formatNumber(salesData?.totalOrders || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Order Value:</span>
                  <span className="font-semibold">
                    {formatPrice(salesData?.averageOrderValue || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={salesData?.paymentStatusBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {salesData?.paymentStatusBreakdown?.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentData?.totalPaymentProofs || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {paymentData?.approvedPayments || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {paymentData?.pendingPayments || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentData?.approvalRate || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Deliveries:</span>
                  <span className="font-semibold">
                    {deliveryData?.totalDeliveries || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-semibold text-green-600">
                    {deliveryData?.completedDeliveries || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-semibold text-yellow-600">
                    {deliveryData?.pendingDeliveries || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate:</span>
                  <span className="font-semibold">
                    {deliveryData?.completionRate || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Top Delivery Persons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveryData?.topDeliveryPersons?.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={person.image}
                          alt={person.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {person.completedDeliveries} completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {person.totalDeliveries} total
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(
                            (person.completedDeliveries /
                              person.totalDeliveries) *
                              100
                          )}
                          % success
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
