"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getOrders } from "@/utils/api/order";
import { formatETB } from "@/utils/formatter";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Hourglass,
} from "lucide-react";

type OrderStatus = "PENDING" | "DELIVERING" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "APPROVED" | "DECLINED";

const STATUS_TABS: { key: OrderStatus; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "DELIVERING", label: "Delivering" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState<OrderStatus | undefined>(
    undefined
  );
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | undefined>(
    undefined
  );

  const [loading, setLoading] = useState(false);

  const statusColors: Record<OrderStatus, string> = {
    PENDING: "text-yellow-500",
    DELIVERING: "text-blue-500",
    DELIVERED: "text-green-600",
    CANCELLED: "text-red-600",
  };

  const paymentColors: Record<PaymentStatus, string> = {
    PENDING: "text-yellow-500",
    APPROVED: "text-green-600",
    DECLINED: "text-red-600",
  };

  const getStatusIcon = (status: OrderStatus) => {
    const map = {
      PENDING: Clock,
      DELIVERING: Truck,
      DELIVERED: CheckCircle,
      CANCELLED: XCircle,
    };
    const IconEl = map[status];
    return <IconEl className={`w-4 h-4 ${statusColors[status]}`} />;
  };

  const getPaymentIcon = (status: PaymentStatus) => {
    const map = {
      PENDING: Hourglass,
      APPROVED: CheckCircle,
      DECLINED: XCircle,
    };
    const IconEl = map[status];
    return <IconEl className={`w-4 h-4 ${paymentColors[status]}`} />;
  };

  const fetchOrders = async (reset = false) => {
    if (loading) return;
    setLoading(true);

    const params: any = {
      page: reset ? 1 : page,
      limit: 10,
      search,
      status: filterStatus,
      paymentStatus: filterPayment,
    };

    try {
      const res = await getOrders(params);

      if (reset) {
        setOrders(res.data);
        setPage(2);
      } else {
        setOrders((prev) => [...prev, ...res.data]);
        setPage((prev) => prev + 1);
      }

      setTotalPages(res.meta.totalPages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchOrders(true), 300);
    return () => clearTimeout(delay);
  }, [search, filterStatus, filterPayment]);

  useEffect(() => {
    fetchOrders(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      {/* ✅ Search */}
      <div className="relative mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="pl-9"
        />
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
      </div>

      {/* ✅ Status Filter Tabs */}
      <div className="flex justify-between border-b pb-2 mb-4">
        {STATUS_TABS.map((tab) => {
          const active = filterStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(active ? undefined : tab.key)}
              className={`text-sm ${
                active ? "font-semibold text-primary" : "text-gray-500"
              }`}
            >
              {tab.label}
              {active && (
                <div className="h-[2px] bg-primary mt-1 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ✅ Order List */}
      <div className="space-y-4">
        {orders.map((item: any) => {
          const first = item.items[0]?.product;
          const status = item.status as OrderStatus;
          const paymentStatus = item.paymentStatus as PaymentStatus;

          return (
            <div
              key={item.id}
              onClick={() => router.push(`/orders/${item.id}`)}
              className="flex items-center border-b pb-3 cursor-pointer hover:bg-muted/30 rounded-md p-2"
            >
              <img
                src={first?.image}
                className="w-14 h-14 rounded-md mr-3 object-cover"
                alt=""
              />

              <div className="flex-1">
                <p className="text-sm font-medium">#{item.id.slice(0, 6)}</p>
                <p className="text-xs text-muted-foreground">{first?.name}</p>

                <div className="flex gap-4 mt-1 text-xs">
                  <span className="flex items-center gap-1">
                    {getStatusIcon(status)}
                    <span className={statusColors[status]}>{status}</span>
                  </span>

                  <span className="flex items-center gap-1">
                    {getPaymentIcon(paymentStatus)}
                    <span className={paymentColors[paymentStatus]}>
                      {paymentStatus}
                    </span>
                  </span>
                </div>
              </div>

              <p className="font-semibold">{formatETB(item.totalAmount)}</p>
            </div>
          );
        })}
      </div>

      {/* ✅ Load More */}
      {page <= totalPages && (
        <Button
          onClick={() => fetchOrders()}
          disabled={loading}
          className="w-full mt-6"
        >
          {loading ? "Loading..." : "Load More"}
        </Button>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No orders found.</p>
      )}
    </div>
  );
}
