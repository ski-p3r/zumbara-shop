"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { getCart } from "@/utils/api/cart";
import { toast } from "sonner";
import Link from "next/link";
import { Check, CreditCard, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  chapaPayOrder,
  checkPaymentStatus,
  createOrder,
} from "@/utils/api/checkout";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const [cart, setCart] = useState<any>({
    items: [],
    total: 0,
    numberOfItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"Chapa" | "COD" | null>(
    null
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      try {
        const response = await getCart();
        setCart(response);
      } catch (error) {
        toast.error(t("checkout.errorFetchCart"));
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [t]);

  // Reusable function to check payment status
  const verifyPaymentStatus = async () => {
    if (!invoiceNumber || !orderId) return;
    setIsLoading(true);
    try {
      const paymentStatus = await checkPaymentStatus(invoiceNumber);
      if (paymentStatus.status === "succeeded") {
        toast.success(t("checkout.paymentSuccess"));
        setPaymentMethod(null);
        router.push("/my-orders");
      } else if (paymentStatus.status === "failed") {
        toast.error(t("checkout.paymentFailed"));
      } else {
        toast.info(t("checkout.paymentPending"));
        setPaymentMethod(null);
        router.push("/my-orders");
      }
    } catch (error) {
      toast.error(t("checkout.errorVerifyPayment"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle finish payment
  const handleFinishPayment = async () => {
    if (!paymentMethod) {
      toast.error(t("checkout.errorNoPaymentMethod"));
      return;
    }
    setIsLoading(true);
    try {
      const order = await createOrder(cart.id, paymentMethod);
      setOrderId(order.id);
      if (paymentMethod === "Chapa") {
        const paymentInit: any = await chapaPayOrder(order.id);
        setPaymentUrl(paymentInit.paymentUrl);
        setInvoiceNumber(order.id);
        window.open(paymentInit.paymentUrl, "_blank");
        toast.info(t("checkout.chapaOpened"));
      } else if (paymentMethod === "COD") {
        toast.success(t("checkout.paymentPendingCOD"));
        setPaymentMethod(null);
        router.push("/my-orders");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(t("checkout.errorInvalidDetails"));
      } else {
        toast.error(t("checkout.errorProcessPayment"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-lg font-semibold text-primary">
          {t("checkout.loading")}
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t("checkout.title")}</h1>
      {cart.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold mb-4">
            {t("checkout.emptyCart")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("checkout.emptyDescription")}
          </p>
          <Link href="/shop">
            <Button size="lg">{t("checkout.continueShopping")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <Card key={item.id} className="overflow-hidden p-0 py-3">
                <CardContent className="p-6 py-0">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.variantImage || "/placeholder.svg"}
                        alt={item.productName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-lg font-bold text-primary mb-2">
                        ETB {item.variantPrice}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {t("checkout.quantity")}: {item.quantity}
                        </span>
                        <span className="ml-2 text-xs font-semibold bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded-full">
                          {t("checkout.subtotal")}:{" "}
                          {item.quantity * item.variantPrice} ETB
                        </span>
                      </div>
                    </div>
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("checkout.total")}
                      </p>
                      <p className="text-xl font-bold">
                        ETB {item.quantity * item.variantPrice}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-0">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {t("checkout.orderSummary")}
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>
                      {t("checkout.items")} ({cart.numberOfItems})
                    </span>
                    <span>ETB {cart.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("checkout.shipping")}</span>
                    <span className="text-green-600">{t("checkout.free")}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t("checkout.total")}</span>
                      <span>ETB {cart.total}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="block text-base font-semibold mb-2">
                    {t("checkout.selectPaymentMethod")}
                  </span>
                  <div className="flex flex-col gap-3">
                    <div
                      className={`flex-row flex items-center p-2 px-3 rounded-lg cursor-pointer transition-all border ${
                        paymentMethod === "Chapa"
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-white dark:bg-zinc-900"
                      }`}
                      onClick={() => setPaymentMethod("Chapa")}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === "Chapa"
                            ? "border-green-500 bg-green-500"
                            : "border-zinc-400 bg-white dark:bg-zinc-900"
                        }`}
                      >
                        {paymentMethod === "Chapa" && (
                          <Check size={14} color="white" />
                        )}
                      </div>
                      <span className="text-base text-zinc-900 dark:text-zinc-100">
                        {t("checkout.chapa")}
                      </span>
                    </div>
                    <div
                      className={`flex-row flex items-center p-2 px-3 rounded-lg cursor-pointer transition-all border ${
                        paymentMethod === "COD"
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-white dark:bg-zinc-900"
                      }`}
                      onClick={() => setPaymentMethod("COD")}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === "COD"
                            ? "border-green-500 bg-green-500"
                            : "border-zinc-400 bg-white dark:bg-zinc-900"
                        }`}
                      >
                        {paymentMethod === "COD" && (
                          <Check size={14} color="white" />
                        )}
                      </div>
                      <span className="text-base text-zinc-900 dark:text-zinc-100">
                        {t("checkout.cashOnDelivery")}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mb-3 text-[16px] font-bold py-4"
                  //   size="lg"
                  onClick={handleFinishPayment}
                  disabled={checkoutLoading}
                >
                  {t("checkout.finishPayment")}
                </Button>
                <Link href="/shop">
                  <Button variant="outline" className="w-full bg-transparent">
                    {t("checkout.continueShopping")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Chapa Payment WebView Modal */}
      {paymentUrl && paymentMethod === "Chapa" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 w-full max-w-md shadow-2xl flex flex-col items-center">
            <span className="text-lg font-semibold text-primary mb-4">
              {t("checkout.chapaPrompt")}
            </span>
            <Button
              className="w-full mb-2 text-base font-bold py-3"
              onClick={verifyPaymentStatus}
              disabled={isLoading}
            >
              {isLoading
                ? t("checkout.verifying")
                : t("checkout.verifyPayment")}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setPaymentUrl(null);
                setPaymentMethod(null);
              }}
            >
              {t("checkout.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
