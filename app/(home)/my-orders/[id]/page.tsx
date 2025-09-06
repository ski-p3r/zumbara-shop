"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { getOrderDetail } from "@/utils/api/orders";

export default function OrderDetailPage() {
  const params = useParams();
  const id: string = Array.isArray(params.id)
    ? params.id?.[0] ?? ""
    : params.id ?? "";
  const { t, isRTL } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    console.log(status);
    if (status.toLowerCase() === "pending") return "bg-[#6366f1] text-white";
    else if (status.toLowerCase() === "paid") return "bg-[#22c55e] text-white";
    return "bg-[#dc2626] text-white"; // Default to red for any other status
  };

  useEffect(() => {
    async function fetchOrder() {
      if (!id) {
        setError(t("orderDetail.errorInvalidId"));
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderDetail(id);
        setOrder(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.details?.message || t("orderDetail.errorFetch")
        );
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-primary">
            {t("orderDetail.loading")}
          </span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive/20 max-w-md">
          <span className="text-base font-semibold text-destructive">
            {error || t("orderDetail.noOrder")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full px-6 py-8">
        <div className="mb-8">
          <div className="flex  flex-col  space-y-5 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1
              className={`text-3xl font-bold text-foreground ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("orderDetail.title")} #
              {order.invoice?.invoiceNumber || t("orderDetail.noInvoice")}
            </h1>
            <div className="flex space-x-4">
              <div className="bg-card px-4 py-2 rounded-lg border border-border">
                <span className="text-sm text-muted-foreground">
                  {t("orderDetail.orderDate")}:{" "}
                </span>
                <span className="font-semibold text-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-lg shadow-sm border border-border">
              <CardContent className="p-6">
                <div
                  className={`flex justify-between items-center mb-6 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <h2 className="text-xl font-bold text-foreground">
                    {t("orderDetail.orderStatus")}
                  </h2>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusBadge(
                      order.paymentStatus
                    )}`}
                  >
                    {t(
                      `orderDetail.paymentStatus1.${order.paymentStatus.toLowerCase()}`
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      {t("orderDetail.placed")}
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      {t("orderDetail.payment")}
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {t(
                        `orderDetail.paymentMethod.${order.paymentMethod.toLowerCase()}`
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="overflow-hidden rounded-lg shadow-sm border border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                  {t("orderDetail.total")}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {order.totalPrice} ETB
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-8">
          <h2
            className={`text-xl font-bold text-foreground mb-4 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("orderDetail.orderItems")}
          </h2>

          <Card className="overflow-hidden rounded-lg shadow-sm border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                      {t("orderDetail.product")}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                      {t("orderDetail.variant")}
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground text-sm uppercase tracking-wide">
                      {t("orderDetail.quantity")}
                    </th>
                   
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item: any, index: number) => (
                    <tr
                      key={item.id}
                      className={`border-b border-border ${
                        index % 2 === 0 ? "bg-background" : "bg-card"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          {item.variant.imageUrl &&
                          item.variant.imageUrl !== "string" ? (
                            <div className="relative overflow-hidden rounded-lg shadow-sm">
                              <img
                                src={
                                  item.variant.imageUrl || "/placeholder.svg"
                                }
                                alt={item.product.name}
                                className="w-16 h-16 object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center border border-border/50">
                              <span className="text-xs font-medium text-muted-foreground">
                                {t("orderDetail.noImage")}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {item.product.name}
                            </h3>
                            {item.product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-accent/10 text-muted-foreground text-sm font-medium rounded border border-accent/20">
                          {item.variant.variantName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-semibold text-foreground text-lg">
                          {item.quantity}
                        </span>
                      </td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {order.invoice && (
          <Card className="overflow-hidden rounded-lg shadow-sm border border-border">
            <CardContent className="p-6">
              <h3
                className={`text-xl font-bold mb-6 text-foreground ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("orderDetail.invoiceDetails")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {t("orderDetail.invoiceNumber")}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {order.invoice.invoiceNumber}
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {t("orderDetail.paymentStatus")}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {t(
                      `orderDetail.paymentStatus1.${order.invoice.paymentStatus.toLowerCase()}`
                    )}
                  </div>
                </div>

                {order.invoice.pdfUrl && (
                  <div className="flex items-center justify-center">
                    <a
                      href={order.invoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {t("orderDetail.viewInvoice")}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
