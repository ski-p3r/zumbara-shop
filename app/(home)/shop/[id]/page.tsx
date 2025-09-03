"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/providers/language-provider";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { addItemToCart } from "@/utils/api/cart";
import { getProductById, canIReview, postReview } from "@/utils/api/product";

export default function ProductDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const productId: string = Array.isArray(params.id)
    ? params.id?.[0] ?? ""
    : params.id ?? "";
  const [product, setProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await getProductById(productId);
        setProduct(res.data);
        setSelectedVariant(res.data.variants[0]);
        try {
          const canReviewRes = await canIReview(productId);
          setCanReview(!!canReviewRes);
        } catch (err) {
          setCanReview(false);
        }
      } catch (err) {
        setPopup({ type: "error", message: t("productDetail.errorFetch") });
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId, t]);

  const handleAddToCart = async () => {
    if (!selectedVariant?.isAvailable) {
      toast.error(t("productDetail.errorVariantUnavailable"));
      return;
    }
    try {
      await addItemToCart(product.id, selectedVariant.id, 1);
      toast.success(t("productDetail.successAddToCart"));
    } catch (error) {
      toast.error(t("productDetail.errorAddToCart"));
    }
  };

  const handleSubmitReview = async () => {
    if (!canReview) return;
    if (reviewRating === 0) {
      toast.error(t("productDetail.errorNoRating"));
      return;
    }
    if (!reviewText.trim()) {
      toast.error(t("productDetail.errorNoReviewText"));
      return;
    }
    setReviewLoading(true);
    try {
      await postReview(productId, { rating: reviewRating, reviewText });
      toast.success(t("productDetail.successReview"));
      setReviewRating(0);
      setReviewText("");
      // Refresh product reviews
      const res = await getProductById(productId);
      setProduct(res.data);
    } catch (error) {
      toast.error(t("productDetail.errorSubmitReview"));
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-lg font-semibold">
          {t("productDetail.loading")}
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Popup */}
      {popup && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold ${
            popup.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {popup.message}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Product Images & Variant Selector */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <img
            src={selectedVariant.imageUrl}
            alt={product.name}
            className="w-full rounded-lg object-cover aspect-video border"
          />
          <Select
            value={selectedVariant.id}
            onValueChange={(id: string) => {
              const v = product.variants.find((v: any) => v.id === id);
              if (v) setSelectedVariant(v);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("product.selectVariant")} />
            </SelectTrigger>
            <SelectContent>
              {product.variants.map((variant: any) => (
                <SelectItem
                  key={variant.id}
                  value={variant.id}
                  disabled={!variant.isAvailable}
                >
                  {variant.variantName} - {variant.price} ETB{" "}
                  {!variant.isAvailable && `(${t("product.outOfStock")})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Product Info */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-2">{product.description}</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <=
                  (product.reviews.length
                    ? product.reviews.reduce(
                        (acc: number, r: any) => acc + r.rating,
                        0
                      ) / product.reviews.length
                    : 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted-foreground"
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">
              (
              {product.reviews.length
                ? (
                    product.reviews.reduce(
                      (acc: number, r: any) => acc + r.rating,
                      0
                    ) / product.reviews.length
                  ).toFixed(1)
                : "0"}
              )
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xl font-bold text-primary">
              {selectedVariant.price} ETB
            </span>
            {selectedVariant.isAvailable ? (
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                {t("product.inStock")}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                {t("product.outOfStock")}
              </Badge>
            )}
          </div>
          <Button
            className="gap-2 w-full mt-4"
            onClick={handleAddToCart}
            disabled={!selectedVariant.isAvailable}
          >
            <ShoppingCart className="h-4 w-4" />
            {t("product.addToCart")}
          </Button>
        </div>
      </div>
      {/* Review Creation */}
      {canReview && (
        <div className="mt-12 max-w-xl mx-auto bg-card rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-2">
            {t("productDetail.writeReview")}
          </h2>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant={reviewRating === star ? "default" : "outline"}
                size="icon"
                onClick={() => setReviewRating(star)}
                disabled={reviewLoading}
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= reviewRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted-foreground"
                  }`}
                />
              </Button>
            ))}
          </div>
          <textarea
            className="w-full rounded-lg border p-2 mb-3 text-sm"
            rows={4}
            placeholder={t("productDetail.reviewPlaceholder")}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            disabled={reviewLoading}
          />
          <Button
            className="w-full"
            onClick={handleSubmitReview}
            disabled={reviewLoading}
          >
            {reviewLoading
              ? t("productDetail.submitting")
              : t("productDetail.submitReview")}
          </Button>
        </div>
      )}
      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">
          {t("productDetail.customerReviews")}
        </h2>
        {product.reviews.length === 0 ? (
          <div className="text-muted-foreground">
            {t("productDetail.noReviews")}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {product.reviews.map((review: any) => (
              <Card key={review.id} className="p-4">
                <CardContent className="flex gap-4 items-center">
                  {review.customer.profileImage ? (
                    <img
                      src={review.customer.profileImage}
                      alt={review.customer.firstName}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20">
                      <span className="font-bold text-primary text-lg">
                        {review.customer.firstName?.[0] || ""}
                        {review.customer.lastName?.[0] || ""}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {review.customer.firstName} {review.customer.lastName}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {review.reviewText}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
