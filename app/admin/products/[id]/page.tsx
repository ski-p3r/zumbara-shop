"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter for navigation
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
import { ShoppingCart, Plus, Edit } from "lucide-react"; // Import Edit icon
import { toast } from "sonner";
import { addItemToCart } from "@/utils/api/cart";
import { getProductById } from "@/utils/api/product";

import { addVariant } from "@/utils/api/variant"; // Updated import path for addVariant
import { getUserFromCookie } from "@/utils/store";

export default function ProductDetailPage() {
  const { t } = useLanguage();
  const router = useRouter(); // Initialize useRouter for navigation
  const params = useParams();
  const productId: string = Array.isArray(params.id)
    ? params.id?.[0] ?? ""
    : params.id ?? "";
  const [product, setProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false); // State to check if the user is MASTER_ADMIN
  const [variantData, setVariantData] = useState({
    variantName: "",
    price: 0,
    stockQuantity: 0,
    isAvailable: true,
    procurementTime: "",
    imageUrl: "",
  });

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await getProductById(productId);
        setProduct(res.data);
        setSelectedVariant(res.data.variants[0]);

        // Check if the user is MASTER_ADMIN
        const user = await getUserFromCookie();
        setIsMasterAdmin(user?.role === "MASTER_ADMIN");
      } catch (err) {
        toast.error(t("productDetail.errorFetch"));
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

  const handleAddVariant = async () => {
    if (!variantData.variantName || variantData.price <= 0 || variantData.stockQuantity <= 0) {
      toast.error("Please fill in all required fields for the variant.");
      return;
    }

    try {
      await addVariant({
        productId,
        ...variantData,
      });
      toast.success("Variant added successfully!");
      setVariantData({
        variantName: "",
        price: 0,
        stockQuantity: 0,
        isAvailable: true,
        procurementTime: "",
        imageUrl: "",
      });

      // Refresh product data to include the new variant
      const res = await getProductById(productId);
      setProduct(res.data);
    } catch (error) {
      toast.error("Failed to add variant. Please try again.");
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
      <div className="flex flex-col md:flex-row gap-10">
        {/* Product Images & Variant Selector */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <img
            src={selectedVariant?.imageUrl}
            alt={product.name}
            className="w-full rounded-lg object-cover aspect-video border"
          />
          <Select
            value={selectedVariant?.id}
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
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xl font-bold text-primary">
              {selectedVariant?.price} ETB
            </span>
            {selectedVariant?.isAvailable ? (
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
          {isMasterAdmin ? (
            <div className="flex flex-col gap-4 mt-4">
              <h2 className="text-lg font-bold">Add Variant</h2>
              {/* Variant Form */}
              <label className="text-sm font-medium text-muted-foreground">
                Variant Name
              </label>
              <input
                type="text"
                placeholder="Enter variant name (e.g., Size M, Color Red)"
                value={variantData.variantName}
                onChange={(e) =>
                  setVariantData({ ...variantData, variantName: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <label className="text-sm font-medium text-muted-foreground">
                Price (ETB)
              </label>
              <input
                type="number"
                placeholder="Enter price (e.g., 100)"
                value={variantData.price}
                onChange={(e) =>
                  setVariantData({ ...variantData, price: Number(e.target.value) })
                }
                className="border rounded-lg p-2"
              />
              <label className="text-sm font-medium text-muted-foreground">
                Stock Quantity
              </label>
              <input
                type="number"
                placeholder="Enter stock quantity (e.g., 50)"
                value={variantData.stockQuantity}
                onChange={(e) =>
                  setVariantData({
                    ...variantData,
                    stockQuantity: Number(e.target.value),
                  })
                }
                className="border rounded-lg p-2"
              />
              <label className="text-sm font-medium text-muted-foreground">
                Procurement Time
              </label>
              <input
                type="text"
                placeholder="Enter procurement time (e.g., 2 days)"
                value={variantData.procurementTime}
                onChange={(e) =>
                  setVariantData({
                    ...variantData,
                    procurementTime: e.target.value,
                  })
                }
                className="border rounded-lg p-2"
              />
              <label className="text-sm font-medium text-muted-foreground">
                Image URL
              </label>
              <input
                type="text"
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                value={variantData.imageUrl}
                onChange={(e) =>
                  setVariantData({ ...variantData, imageUrl: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <Button className="w-full" onClick={handleAddVariant}>
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>
              {/* Edit Product Button */}
              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => router.push(`/admin/products/${productId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </div>
          ) : (
            <Button
              className="gap-2 w-full mt-4"
              onClick={handleAddToCart}
              disabled={!selectedVariant?.isAvailable}
            >
              <ShoppingCart className="h-4 w-4" />
              {t("product.addToCart")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}