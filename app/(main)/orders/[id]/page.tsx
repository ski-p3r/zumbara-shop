"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Hourglass,
  Truck,
  Clock,
  Loader,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSingleOrder, uploadPaymentProofToBackend } from "@/utils/api/order";
import { formatETB } from "@/utils/formatter";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/utils/api/upload";

export default function OrderDetailPage() {
  const { id } = useParams();

  type OrderStatus = "PENDING" | "DELIVERING" | "DELIVERED" | "CANCELLED";
  type PaymentStatus = "PENDING" | "APPROVED" | "DECLINED";

  interface Order {
    id: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    items: {
      id: string;
      quantity: number;
      product: {
        image: string;
        name: string;
        price: number;
      };
    }[];
    totalAmount: number;
    paymentProofs?: {
      id: string;
      imageUrl: string;
    }[];
  }

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadOrder = async () => {
    setLoading(true);
    const data = (await getSingleOrder(id as string)) as Order;
    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!order) return;
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const { url } = await uploadFile(e.target.files[0]);

    await uploadPaymentProofToBackend({ orderId: order.id, imageUrl: url });
    setUploading(false);
    loadOrder();
  };

  const statusColors = {
    PENDING: "text-yellow-500",
    DELIVERING: "text-blue-500",
    DELIVERED: "text-green-500",
    CANCELLED: "text-red-500",
  };

  const paymentColors = {
    PENDING: "text-yellow-500",
    APPROVED: "text-green-500",
    DECLINED: "text-red-500",
  };

  const statusIcon = {
    PENDING: Clock,
    DELIVERING: Truck,
    DELIVERED: CheckCircle,
    CANCELLED: XCircle,
  };
  const paymentIcon = {
    PENDING: Hourglass,
    APPROVED: CheckCircle,
    DECLINED: XCircle,
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!order)
    return <p className="p-6 text-center text-red-500">Order not found.</p>;

  const StatusIcon = statusIcon[order.status];
  const PayIcon = paymentIcon[order.paymentStatus];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>

      {/* STATUS SECTION */}
      <div className="p-4 border rounded-lg shadow-sm gap-2">
        <p className="flex items-center gap-2 text-sm font-medium mb-2">
          <StatusIcon className={statusColors[order.status]} />
          Status:
          <span className={statusColors[order.status]}>{order.status}</span>
        </p>

        <p className="flex items-center gap-2 text-sm font-medium">
          <PayIcon className={paymentColors[order.paymentStatus]} />
          Payment:
          <span className={paymentColors[order.paymentStatus]}>
            {order.paymentStatus}
          </span>
        </p>
      </div>

      {/* ITEMS */}
      <div className="border-t border-b shadow-sm divide-y">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex gap-4 p-4 items-center">
            <img
              src={item.product.image}
              className="rounded-md object-cover border aspect-square w-16 h-16"
              alt="item image"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{item.product.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-sm">
              {formatETB(item.product.price)}
            </p>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="text-right text-lg font-semibold">
        Total: {formatETB(order.totalAmount)}
      </div>

      {/* PAYMENT PROOFS DISPLAY */}
      {order.paymentProofs && order.paymentProofs.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Uploaded Payment Proofs</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {order.paymentProofs.map((proof) => (
              <div
                key={proof.id}
                className="relative group cursor-pointer"
                onClick={() => setPreviewImage(proof.imageUrl)}
              >
                <img
                  src={proof.imageUrl}
                  className="w-full h-32 object-cover rounded-md border"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <ZoomIn className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD PAYMENT PROOF */}
      {order.paymentStatus === "PENDING" && (
        <div>
          <p className="text-sm mb-2 font-medium">Upload Payment Proof</p>
          <Input type="file" onChange={handleUploadProof} />
          {uploading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Loader className="animate-spin" size={16} /> Uploading...
            </div>
          )}
        </div>
      )}

      {/* IMAGE PREVIEW OVERLAY */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
