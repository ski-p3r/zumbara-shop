import { ShoppingCart, Star } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useLanguage } from "@/providers/language-provider";
import { addItemToCart } from "@/utils/api/cart";
import { toast } from "sonner";
import Link from "next/link";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = star <= Math.floor(rating);
        const isHalf = !isFull && star - rating <= 0.5 && star - rating > 0;
        return (
          <Star
            key={star}
            className={`h-4 w-4 ${
              isFull
                ? "fill-yellow-400 text-yellow-400"
                : isHalf
                ? "fill-yellow-400 text-yellow-400 "
                : "fill-muted text-muted-foreground"
            }`}
            style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}
          />
        );
      })}
      <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
    </div>
  );
}

export function ProductCard({
  product,
  isListView,
}: {
  product: any;
  isListView: boolean;
}) {
  const { t } = useLanguage();
  const variant = product.variants[0];

  const handleAddToCart = async () => {
    try {
      await addItemToCart(product.id, variant.id, 1);
      toast.success(t("product.addToCartSuccess"));
    } catch (error) {
      toast.error(t("product.addToCartError"));
    }
  };

  if (isListView) {
    return (
      <Card className="overflow-hidden  ">
        <CardContent className="p-0">
          <div className="flex gap-6 ">
            <div className="flex-shrink-0">
              <img
                src={variant.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full rounded-lg object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-card-foreground mb-2 ">
                  <Link href={`/shop/${product.id}`}>{product.name}</Link>
                </h3>
                <p className="text-xs text-muted-foreground mb-3 text-balance">
                  {product.description}
                </p>
                <StarRating rating={product.rating} />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-primary">
                    {variant.price} ETB
                  </span>
                </div>
                <Button className="gap-2 text-xs" onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4" />
                  {t("product.addToCart")}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0 h-full flex flex-col justify-between">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="overflow-hidden">
          <img
            src={variant.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full object-cover aspect-video transition-transform duration-300 hover:scale-110"
            crossOrigin="anonymous"
          />
        </div>
        <div className="p-3 relative w-full flex-1 flex flex-col">
          <h3 className="font-semibold text-base mb-2 text-balance">
            <Link href={`/shop/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="text-xs text-muted-foreground mb-3 text-balance line-clamp-2">
            {product.description}
          </p>
          <StarRating rating={product.rating} />
          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-bold text-primary">
              {variant.price} ETB
            </span>
          </div>
        </div>
        <div className="p-3 pt-0">
          <Button
            className="gap-2 text-xs w-full mt-auto"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {t("product.addToCart")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
