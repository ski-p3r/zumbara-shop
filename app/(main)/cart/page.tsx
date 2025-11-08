"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  incrementCartItem,
  decrementCartItem,
  deleteCartItem,
  getCart,
} from "@/utils/api/cart";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { formatETB } from "@/utils/formatter";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
  variant?: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
      console.error("[v0] Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (itemId: string, currentQuantity: number) => {
    try {
      await incrementCartItem(itemId, currentQuantity);
      await fetchCart();
    } catch (err) {
      console.error("[v0] Increment error:", err);
    }
  };

  const handleDecrement = async (itemId: string, currentQuantity: number) => {
    try {
      await decrementCartItem(itemId, currentQuantity);
      await fetchCart();
    } catch (err) {
      console.error("[v0] Decrement error:", err);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await deleteCartItem(itemId);
      await fetchCart();
    } catch (err) {
      console.error("[v0] Remove error:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-background px-6 py-12 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Your Cart</h1>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-destructive">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const isEmpty = cartItems.length === 0;

  const getItemPrice = (item: CartItem) =>
    item.variant?.price ?? item.product.price;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    const checkoutUrl = `/checkout?type=cart&cartId=${cart?.id}`;
    router.push(checkoutUrl);
  };

  return (
    <div className="w-full bg-background">
      <div className="py-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 pb-8 border-b border-border">
            <h1 className="text-5xl font-bold text-foreground mb-2">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground">
              {isEmpty
                ? "Your cart is empty"
                : `${cartItems.length} item${
                    cartItems.length !== 1 ? "s" : ""
                  } in cart`}
            </p>
          </div>

          {isEmpty ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Start shopping to add items to your cart
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="pb-6 border-b border-border flex gap-6 items-start"
                  >
                    {/* Image */}
                    <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={
                          item.variant?.image ||
                          item.product.image ||
                          "/placeholder.svg"
                        }
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.variant?.name}
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {formatETB(getItemPrice(item) * item.quantity)}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-muted rounded-lg px-2 py-1">
                        <button
                          onClick={() =>
                            handleDecrement(item.id, item.quantity)
                          }
                          className="p-1 hover:bg-background rounded transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleIncrement(item.id, item.quantity)
                          }
                          className="p-1 hover:bg-background rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  <div className="space-y-4">
                    <div className="pb-4 border-b border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Order Summary
                      </h3>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">
                        {formatETB(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span className="font-medium text-foreground">
                        {formatETB(tax)}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {formatETB(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Proceed to Checkout
                  </button>

                  <Link
                    href="/shop"
                    className="block text-center py-3 border border-border text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
