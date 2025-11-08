"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCart } from "@/utils/api/cart";
import { getProductById } from "@/utils/api/products";
import { createOrder } from "@/utils/api/order";
import { formatETB } from "@/utils/formatter";

import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cartId = searchParams.get("cartId");
  const productId = searchParams.get("productId");
  const variantId = searchParams.get("variantId");

  const [loading, setLoading] = useState(true);
  const [checkoutItem, setCheckoutItem] = useState<any>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const placeOrder = async () => {
    try {
      setPlacingOrder(true);

      if (cartId) {
        const result = await createOrder({ cartId });
        router.push(`/orders/${result.id}`);
      } else {
        const result = await createOrder({
          productId: checkoutItem.product.id,
          variantId: checkoutItem.variant?.id,
          quantity: checkoutItem.quantity,
        });
        router.push(`/orders/${result.id}`);
      }
    } catch (err: any) {
      alert(err.message || "Order failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (cartId) {
          const data = await getCart();
          setCheckoutItem({
            type: "cart",
            items: data.items,
            total: data.items.reduce(
              (sum: number, item: any) =>
                sum +
                (item.variant ? item.variant.price : item.product.price) *
                  item.quantity,
              0
            ),
          });
        } else if (productId) {
          const product = await getProductById(productId);

          const variant = variantId
            ? product.variants.find((v: any) => v.id === variantId)
            : null;

          const price = variant ? variant.price : product.price;

          setCheckoutItem({
            type: "single",
            product,
            variant,
            quantity: 1,
            total: price,
          });
        }
      } catch {}
      setLoading(false);
    };

    loadData();
  }, [cartId, productId, variantId]);

  if (loading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      {/* ✅ Cart Summary */}
      {checkoutItem.type === "cart" &&
        checkoutItem.items.map((item: any) => {
          const price = item.variant ? item.variant.price : item.product.price;
          const total = price * item.quantity;

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 py-3 border-b"
            >
              <img
                src={item.product.image}
                width={70}
                height={70}
                alt=""
                className="rounded"
              />
              <div className="flex-1">
                <p>{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatETB(price)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatETB(total)}</p>
            </div>
          );
        })}

      {/* ✅ Single Product Summary */}
      {checkoutItem.type === "single" && (
        <div className="flex gap-4 border-b py-4">
          <img
            src={checkoutItem.product.image}
            width={90}
            height={90}
            alt=""
            className="rounded"
          />
          <div className="flex-1">
            <p>{checkoutItem.product.name}</p>
            {checkoutItem.variant && (
              <p className="text-sm text-muted-foreground">
                {checkoutItem.variant.name}
              </p>
            )}
            <p className="font-semibold mt-1">
              {formatETB(checkoutItem.total)}
            </p>
          </div>
        </div>
      )}

      {/* ✅ Total */}
      <div className="flex justify-between py-4 text-lg font-semibold">
        <span>Total</span>
        <span className="text-primary">{formatETB(checkoutItem.total)}</span>
      </div>

      {/* ✅ Place Order */}
      <Button
        className="w-full mt-6"
        disabled={placingOrder}
        onClick={placeOrder}
      >
        {placingOrder ? "Placing Order..." : "Place Order"}
      </Button>
    </div>
  );
}
