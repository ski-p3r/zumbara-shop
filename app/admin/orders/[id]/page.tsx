"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Truck, Package } from "lucide-react";
import { toast } from "sonner";
import { getOrderDetail } from "@/utils/api/orders"; // Import the provided function

const statusSteps = [
  { key: "pending", label: "Pending", description: "Order received" },
  { key: "approved", label: "Approved", description: "Order confirmed" },
  { key: "procurement", label: "Procurement", description: "Items being prepared" },
  { key: "out-for-delivery", label: "Out for Delivery", description: "On the way" },
  { key: "delivered", label: "Delivered", description: "Order completed" },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function unwrapParams() {
      const unwrappedParams = await params;
      setOrderId(unwrappedParams.id);
    }

    unwrapParams();
  }, [params]);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;

      setLoading(true);
      try {
        const data = await getOrderDetail(orderId); // Use the provided function to fetch order details
        setOrder(data);
      } catch (error) {
        toast.error("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const currentStepIndex = statusSteps.findIndex((step) => step.key === order?.status);

  if (loading || !order) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-lg font-semibold">Loading order details...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className=" px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/admin/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Order {order.id}</h1>
              <p className="text-muted-foreground">Order details and tracking information</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/orders/${order.id}/invoice`}>
                <FileText className="mr-2 h-4 w-4" />
                View Invoice
              </Link>
            </Button>
            
          </div>
        </div>

        {/* Order Status Tracker */}
        {/* <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? "✓" : index + 1}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium">{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

        {/* Order Items */}
        <Card className="shadow-lg border-0 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.variant.imageUrl || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <span className="font-medium">{item.product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.variant.variantName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">${(item.price * item.quantity).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}