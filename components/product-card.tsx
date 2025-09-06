"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Star, Trash2 } from "lucide-react"; // Import Trash2 icon
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"; // Import shadcn dialog components
import { useLanguage } from "@/providers/language-provider";
import { addItemToCart } from "@/utils/api/cart";
import { deleteProduct } from "@/utils/api/product"; // Import deleteProduct function
import { toast } from "sonner";
import Link from "next/link";
import { getUserFromCookie } from "@/utils/store";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null); // State to store user data
  const [isDeleting, setIsDeleting] = useState(false); // State for delete operation

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserFromCookie();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleAddToCart = async () => {
    try {
      await addItemToCart(product.id, variant.id, 1);
      toast.success(t("product.addToCartSuccess"));
    } catch (error) {
      toast.error(t("product.addToCartError"));
    }
  };

  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success("Product deleted successfully");
      setIsDialogOpen(false); // Close dialog on success
      router.refresh(); // Refresh page to remove deleted product
    } catch (error) {
      toast.error("Failed to delete product");
      setIsDialogOpen(false); // Close dialog on error
    } finally {
      setIsDeleting(false);
    }
  };

  if (isListView) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex gap-6">
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
                <h3 className="text-base font-semibold text-card-foreground mb-2">
                  {user ? (
                    user.role === "CUSTOMER" ? (
                      <Link href={`/shop/${product.id}`}>{product.name}</Link>
                    ) : (
                      <Link href={`/admin/products/${product.id}`}>
                        {product.name}
                      </Link>
                    )
                  ) : (
                    <Link href={`/shop/${product.id}`}>{product.name}</Link>
                  )}
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
                {(!user || user.role === "CUSTOMER") && (
                  <Button className="gap-2 text-xs" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4" />
                    {t("product.addToCart")}
                  </Button>
                )}
                {user?.role === "MASTER_ADMIN" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                      </DialogHeader>
                      <p>Are you sure you want to delete this product?</p>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {}}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteProduct}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
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
            src={variant?.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full object-cover aspect-video transition-transform duration-300 hover:scale-110"
            crossOrigin="anonymous"
          />
        </div>
        <div className="p-3 relative w-full flex-1 flex flex-col">
          <h3 className="text-base font-semibold text-card-foreground mb-2">
            {user ? (
              user.role === "CUSTOMER" ? (
                <Link href={`/shop/${product.id}`}>{product.name}</Link>
              ) : (
                <Link href={`/admin/products/${product.id}`}>
                  {product.name}
                </Link>
              )
            ) : (
              <Link href={`/shop/${product.id}`}>{product.name}</Link>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 text-balance line-clamp-2">
            {product.description}
          </p>
          <StarRating rating={product.rating} />
          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-bold text-primary">
              {variant?.price} ETB
            </span>
          </div>
        </div>
        <div className="p-3 pt-0 w-full">
          {(!user || user.role === "CUSTOMER") && (
            <Button className="gap-2 text-xs w-full" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
              {t("product.addToCart")}
            </Button>
          )}
          {user?.role === "MASTER_ADMIN" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2 text-xs w-full">
                  <Trash2 className="h-4 w-4" />
                  Delete Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete this product?</p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteProduct}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}