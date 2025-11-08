"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Package,
  User,
} from "lucide-react";
import {
  getAllOrdersAdmin,
  OrderStatus,
  PaymentStatus,
  SortOrder,
  SortOrderType,
} from "@/utils/api/order";

interface OrderItem {
  quantity: number;
  price: number;
  product: {
    name: string;
    description: string;
    image: string;
    price: number;
    categorySlug: string;
  };
  variant: {
    name: string;
    price: number;
    image: string;
  } | null;
}

interface PaymentProof {
  id: string;
  imageUrl: string;
  note: string | null;
  approved: boolean | null;
  reviewedById: string | null;
  reviewedAt: string | null;
}

interface OrderUser {
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  id: string;
}

interface Order {
  id: string;
  userId: string;
  user: OrderUser;
  totalAmount: number;
  paymentStatus: keyof typeof PaymentStatus;
  status: keyof typeof OrderStatus;
  deliveryId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  paymentProofs: PaymentProof[];
}

interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrderType>(SortOrder.DESC);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const query: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (searchTerm) query.search = searchTerm;
      if (statusFilter !== "all") query.status = statusFilter;
      if (paymentStatusFilter !== "all")
        query.paymentStatus = paymentStatusFilter;

      const response: OrdersResponse = await getAllOrdersAdmin(query);
      setOrders(response.data);
      setPagination((prev) => ({
        ...prev,
        ...response.meta,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(
        sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
      );
    } else {
      setSortBy(column);
      setSortOrder(SortOrder.DESC);
    }
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePaymentStatusFilter = (value: string) => {
    setPaymentStatusFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setSortBy("createdAt");
    setSortOrder(SortOrder.DESC);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status: keyof typeof OrderStatus) => {
    const statusConfig = {
      PENDING: {
        variant: "secondary" as const,
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      DELIVERING: {
        variant: "default" as const,
        label: "Delivering",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      },
      DELIVERED: {
        variant: "default" as const,
        label: "Delivered",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      CANCELLED: {
        variant: "destructive" as const,
        label: "Cancelled",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      },
    };
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: keyof typeof PaymentStatus) => {
    const statusConfig = {
      PENDING: {
        variant: "secondary" as const,
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      APPROVED: {
        variant: "default" as const,
        label: "Approved",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      DECLINED: {
        variant: "destructive" as const,
        label: "Declined",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      },
    };
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortOrder === SortOrder.ASC ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getCustomerName = (user: OrderUser) => {
    return `${user.firstName} ${user.lastName}`;
  };

  const hasPaymentProof = (order: Order) => {
    return order.paymentProofs && order.paymentProofs.length > 0;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <Button onClick={() => fetchOrders()} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer name, phone, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DELIVERING">Delivering</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select
              value={paymentStatusFilter}
              onValueChange={handlePaymentStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="PENDING">Payment Pending</SelectItem>
                <SelectItem value="APPROVED">Payment Approved</SelectItem>
                <SelectItem value="DECLINED">Payment Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            Showing {orders.length} of {pagination.total} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer "
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-1">
                    Order ID
                    <SortIcon column="id" />
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead
                  className="cursor-pointer "
                  onClick={() => handleSort("totalAmount")}
                >
                  <div className="flex items-center gap-1">
                    Amount
                    <SortIcon column="totalAmount" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer "
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon column="status" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer "
                  onClick={() => handleSort("paymentStatus")}
                >
                  <div className="flex items-center gap-1">
                    Payment
                    <SortIcon column="paymentStatus" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer "
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon column="createdAt" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeletons
                Array.from({ length: pagination.limit }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No orders found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="">
                    <TableCell className="font-medium">
                      <div className="text-sm">#{order.id.slice(-8)}</div>
                      <div className="text-xs text-gray-500">
                        ...{order.id.slice(-4)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {order.user.image ? (
                            <img
                              src={order.user.image}
                              alt={getCustomerName(order.user)}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {getCustomerName(order.user)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user.phone}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="text-sm font-medium">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {order.items
                            .map((item) => item.product.name)
                            .join(", ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(order.status)}
                        {order.deliveryId && (
                          <Badge variant="outline" className="text-xs">
                            Assigned
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getPaymentStatusBadge(order.paymentStatus)}
                        {hasPaymentProof(order) && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-50 text-purple-700"
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Proof Uploaded
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/orders/${order.id}`)
                          }
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            /* Implement download */
                          }}
                          className="h-8 w-8 p-0"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {hasPaymentProof(order) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/orders/${order.id}?tab=payment`
                              )
                            }
                            className="h-8 w-8 p-0"
                            title="View Payment Proof"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      className={
                        pagination.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: pageNum,
                              }))
                            }
                            isActive={pagination.page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  {pagination.totalPages > 5 &&
                    pagination.page < pagination.totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(pagination.totalPages, prev.page + 1),
                        }))
                      }
                      className={
                        pagination.page === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              {/* Pagination Info */}
              <div className="text-center text-sm text-gray-500 mt-2">
                Page {pagination.page} of {pagination.totalPages} •{" "}
                {pagination.total} total orders
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
