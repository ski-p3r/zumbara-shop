"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Eye, MoreHorizontal, FileText, Truck, DollarSign } from "lucide-react";
import { getAllOrders } from "@/utils/api/orders";

const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllOrders({ page: 1, limit: 20 });
        console.log("Orders fetched:", data);
        setOrders(data.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.toLowerCase().trim();
    const orderNumber = order.invoice?.invoiceNumber?.toLowerCase() || '';
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      orderNumber.includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm) || false;
    const matchesPaymentStatus = paymentStatusFilter === "all" || order.paymentStatus.toLowerCase() === paymentStatusFilter;
    return matchesSearch && matchesPaymentStatus;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const pendingOrders = orders.filter((order) => order.paymentStatus.toLowerCase() === "pending").length;
  const deliveredOrders = orders.filter((order) => order.paymentStatus.toLowerCase() === "paid").length;

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error loading orders: {error}</div>;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
                <Truck className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">{deliveredOrders}</p>
                </div>
                <Badge className="h-8 w-8 rounded-full flex items-center justify-center">✓</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, or phone..."
                  className="pl-10 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.invoice?.invoiceNumber || `N/A-${order.id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>{`${order.customer?.firstName || 'Unknown'} ${order.customer?.lastName || ''}`}</TableCell>
                      <TableCell>{order.customer?.phone || 'N/A'}</TableCell>
                      <TableCell className="font-medium">${order.totalPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                      <Link className="flex items-center" href={`orders/${order.id}`}>
                                <Eye className="mr-1 h-4 w-4" />
                                View Details
                              </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}