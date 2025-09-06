"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { getCart, updateCartItem, removeItemFromCart } from "@/utils/api/cart";
import Link from "next/link";
import { toast } from "sonner";

export default function CartPage() {
  const { t } = useLanguage();
  const [cart, setCart] = useState<any>({
    items: [],
    total: 0,
    numberOfItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [quantityLoading, setQuantityLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      try {
        const response = await getCart();
        console.log("cart", response);
        setCart(response);
      } catch (error) {
        toast.error(t("cart.errorFetchCart"));
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [t]);

  const handleQuantity = async (id: string, delta: number) => {
    const item = cart.items.find((item: any) => item.id === id);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      setItemToDelete(id);
      setDeleteConfirm(true);
      return;
    }
    setQuantityLoading(id);
    try {
      await updateCartItem(id, newQuantity);
      const updatedItems = cart.items.map((p: any) =>
        p.id === id
          ? { ...p, quantity: newQuantity, total: newQuantity * p.variantPrice }
          : { ...p, total: p.quantity * p.variantPrice }
      );
      const updatedTotal = updatedItems.reduce(
        (sum: number, p: any) => sum + p.total,
        0
      );
      const updatedNumberOfItems = updatedItems.reduce(
        (sum: number, p: any) => sum + p.quantity,
        0
      );
      setCart((prev: any) => ({
        ...prev,
        items: updatedItems,
        total: updatedTotal,
        numberOfItems: updatedNumberOfItems,
      }));
      toast.success(t("cart.quantityUpdated"));
    } catch (error) {
      toast.error(t("cart.errorUpdateQuantity"));
    } finally {
      setQuantityLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeItemFromCart(id);
      const updatedItems = cart.items
        .filter((p: any) => p.id !== id)
        .map((p: any) => ({ ...p, total: p.quantity * p.variantPrice }));
      const updatedTotal = updatedItems.reduce(
        (sum: number, p: any) => sum + p.total,
        0
      );
      const updatedNumberOfItems = updatedItems.reduce(
        (sum: number, p: any) => sum + p.quantity,
        0
      );
      setCart((prev: any) => ({
        ...prev,
        items: updatedItems,
        total: updatedTotal,
        numberOfItems: updatedNumberOfItems,
      }));
      toast.success(t("cart.itemRemoved"));
    } catch (error) {
      toast.error(t("cart.errorRemoveItem"));
    }
    setDeleteConfirm(false);
    setItemToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-lg font-semibold text-primary">
          {t("cart.loading")}
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{t("cart.title")}</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="text-5xl md:text-6xl mb-4">🛒</div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">{t("cart.empty")}</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            {t("cart.emptyDescription")}
          </p>
          <Link href="/shop">
            <Button size="lg" className="w-full sm:w-auto">{t("cart.continueShopping")}</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <Card key={item.id} className="overflow-hidden p-0">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.variantImage || "/placeholder.svg"}
                        alt={item.productName}
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base mb-1 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-base md:text-lg font-bold text-primary mb-2">
                        ETB {item.variantPrice}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 md:gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantity(item.id, -1)}
                          disabled={quantityLoading === item.id}
                          className="h-8 w-8 p-0"
                        >
                          -
                        </Button>
                        <span className="font-semibold text-sm md:text-base min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantity(item.id, 1)}
                          disabled={quantityLoading === item.id}
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete(item.id);
                            setDeleteConfirm(true);
                          }}
                          className="ml-2 md:ml-4 text-destructive hover:text-destructive text-sm md:text-base"
                        >
                          {t("cart.remove")}
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">
                        {t("cart.total")}
                      </p>
                      <p className="text-lg md:text-xl font-bold">ETB {item.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-0">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4">
                  {t("cart.orderSummary")}
                </h2>

                <div className="space-y-3 mb-4 md:mb-6">
                  <div className="flex justify-between text-sm md:text-base">
                    <span>
                      {t("cart.items")} ({cart.numberOfItems})
                    </span>
                    <span>ETB {cart.total}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span>{t("cart.shipping")}</span>
                    <span className="text-green-600">{t("cart.free")}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-base md:text-lg font-semibold">
                      <span>{t("cart.total")}</span>
                      <span>ETB {cart.total}</span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full mb-3" size="lg">
                    {t("cart.checkout")}
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    {t("cart.continueShopping")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm md:max-w-md mx-auto">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                {t("cart.confirmDelete")}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                {t("cart.confirmDeleteDescription")}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 text-sm md:text-base"
                >
                  {t("cart.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(itemToDelete)}
                  className="flex-1 text-sm md:text-base"
                >
                  {t("cart.delete")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}