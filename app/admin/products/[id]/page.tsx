// app/admin/products/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";

import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/utils/api/products";

interface Variant {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  categorySlug: string;
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
  averageRating: number;
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  
  // --- Alert Dialog State ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ------------------------------------------------------------
  // Load product
  // ------------------------------------------------------------
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  const formatETB = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleEdit = () => {
    router.push(`/admin/products/${id}/edit`);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteProduct(id);
      router.replace("/admin/products");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // ------------------------------------------------------------
  // Star rating (same as list page)
  // ------------------------------------------------------------
  const StarRating = ({ rating }: { rating: number }) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        {[...Array(full)].map((_, i) => (
          <svg
            key={`f-${i}`}
            className="w-4 h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {half && (
          <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${rating}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#half-${rating})`}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        )}
        {[...Array(empty)].map((_, i) => (
          <svg
            key={`e-${i}`}
            className="w-4 h-4 text-muted-foreground fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-lg text-muted-foreground">Product not found.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={openDeleteDialog}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Delete
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          {/* Image + Click-to-zoom */}
          <div className="space-y-4">
            <div
              className="relative rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setImageOpen(true)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white font-medium">Click to enlarge</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <p className="mt-1">{product.description || "-"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Price
                </h3>
                <p className="mt-1 font-semibold text-lg">
                  {formatETB(product.price)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Stock
                </h3>
                <Badge
                  variant={
                    product.stock > 10
                      ? "default"
                      : product.stock > 0
                      ? "secondary"
                      : "destructive"
                  }
                  className="mt-1"
                >
                  {product.stock} units
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Category
                </h3>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {product.categorySlug.replace(/-/g, " ")}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Rating
                </h3>
                <StarRating rating={product.averageRating} />
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Created
                </h3>
                <p className="mt-1">{formatDate(product.createdAt)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Updated
                </h3>
                <p className="mt-1">{formatDate(product.updatedAt)}</p>
              </div>
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Variants ({product.variants.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {product.variants.map((v) => (
                    <Card key={v.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.image}
                            alt={v.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{v.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatETB(v.price)} • {v.stock} in stock
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full-screen image dialog */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-4">
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[75vh] w-auto object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product <strong>"{product.name}"</strong> and all its variants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}