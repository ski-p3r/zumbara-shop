"use client";

import {
  Star,
  StarHalf,
  Star as StarOutline,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { addToCart } from "@/utils/api/cart";
import { toast } from "sonner";

export type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  image?: string;
  averageRating?: number;
  category?: string;
  description?: string;
  discountPrice?: number;
};

export const ProductCard = ({
  id,
  title,
  price,
  image,
  averageRating = 0,
  category,
  description,
  discountPrice,
}: ProductCardProps) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
  }).format(discountPrice || price);

  const originalPrice = discountPrice
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "ETB",
      }).format(price)
    : null;

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: id, quantity: 1 });
      toast.success("Product added to cart");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart"
      );
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
      {/* IMAGE */}
      <Link href={`/shop/${id}`} className="no-underline">
        <div className="relative w-full h-44 overflow-hidden group">
          <img
            src={image || "https://via.placeholder.com/150"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* CONTENT */}
        <div className="p-4 flex flex-col flex-1 text-left justify-start">
          {/* TITLE */}
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 truncate text-left">
            {title}
          </h2>

          {/* CATEGORY */}
          {category && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-left">
              {category}
            </p>
          )}

          {/* PRICE */}
          <div className="flex items-center gap-2 mt-1 text-left">
            <p
              className={`text-sm font-bold ${
                discountPrice
                  ? "text-red-600"
                  : "text-zinc-800 dark:text-zinc-100"
              }`}
            >
              {formattedPrice}
            </p>
            {originalPrice && (
              <p className="text-xs text-gray-400 line-through">
                {originalPrice}
              </p>
            )}
          </div>

          {/* ⭐ averageRating */}
          <div className="flex items-center gap-1 mt-2 text-left">
            {Array.from({ length: fullStars }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
            {hasHalfStar && (
              <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            )}
            {Array.from({ length: emptyStars }).map((_, i) => (
              <StarOutline key={i} className="w-4 h-4 text-gray-300" />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              {averageRating.toFixed(1)}
            </span>
          </div>

          {/* DESCRIPTION */}
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 text-left">
              {description}
            </p>
          )}
        </div>
      </Link>
      {/* BUTTON */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          variant="default"
          className="w-full flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};
