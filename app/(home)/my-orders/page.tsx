"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { getOrders } from "@/utils/api/orders";
import Link from "next/link";

export default function MyOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextLink, setNextLink] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    console.log(status);
    if (status.toLowerCase() === "pending") return "bg-[#6366f1] text-white";
    else if (status.toLowerCase() === "paid") return "bg-[#22c55e] text-white";
    return "bg-[#dc2626] text-white"; // Default to red for any other status
  };

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrders({ page });
        setOrders(data.items || []);
        setTotalPages(Math.ceil(data.total / data.limit));
        setNextLink(data.nextLink);
      } catch (err: any) {
        setError(
          err?.response?.data?.details?.message || t("myOrders.errorFetch")
        );
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [page, t]);

  return (
    <div className="bg-background w-full">
      <div className="w-full ">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {t("myOrders.title")}
            </h1>
            <div className="flex space-x-4">
              <div className="bg-card px-4 py-2 rounded-lg border border-border">
                <span className="text-sm text-muted-foreground">
                  {t("myOrders.total")}:{" "}
                </span>
                <span className="font-semibold text-foreground">
                  {orders.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-3">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-primary">
              {t("myOrders.loading")}
            </span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive/20">
              <span className="text-base font-semibold text-destructive">
                {error}
              </span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center p-8 bg-muted rounded-lg border border-border">
              <span className="text-lg font-semibold text-muted-foreground">
                {t("myOrders.noOrders")}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                        {t("myOrders.invoice")}
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                        {t("myOrders.date")}
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                        {t("myOrders.status")}
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                        {t("myOrders.items")}
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                        {t("myOrders.payment")}
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                        {t("myOrders.total")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any, index: number) => (
                      <tr
                        key={order.id}
                        className={`border-b border-border hover:bg-muted/30 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-background" : "bg-card"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <Link
                            href={`/my-orders/${order.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            <div className="font-semibold text-foreground">
                              #
                              {order.invoice?.invoiceNumber ||
                                t("myOrders.noInvoice")}
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              order.paymentStatus
                            )}`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full mr-2 bg-current opacity-75"></div>
                            {t(
                              `myOrders.paymentStatus.${order.paymentStatus.toLowerCase()}`
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-foreground">
                            {order.orderItems.length}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-foreground">
                            {t(
                              `myOrders.paymentMethod.${order.paymentMethod.toLowerCase()}`
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-bold text-primary text-lg">
                            {order.totalPrice} ETB
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 p-4 bg-card rounded-lg border border-border">
                <div className="text-sm text-muted-foreground">
                  {t("myOrders.showing")} {(page - 1) * 10 + 1} -{" "}
                  {Math.min(page * 10, orders.length)} {t("myOrders.of")}{" "}
                  {orders.length}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 font-medium"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    {t("myOrders.previous")}
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!nextLink || page === totalPages}
                    className="px-4 py-2 font-medium"
                  >
                    {t("myOrders.next")}
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
