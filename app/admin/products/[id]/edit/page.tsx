"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Toaster, toast } from "sonner";
import { getProductById, editProduct } from "@/utils/api/product";
import { getCategories } from "@/utils/api/category"; // Import the getCategories function

interface UpdateProductDto {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const productId = Array.isArray(id) ? id[0] : id;

  const [formData, setFormData] = useState<UpdateProductDto>({
    name: "",
    description: "",
    categoryId: "",
    basePrice: 0,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProductAndCategories() {
      if (!productId) return;
      setIsLoading(true);
      try {
        // Fetch product details
        const productResponse = await getProductById(productId);
        const product = productResponse.data;

        // Fetch categories
        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse.data);

        // Set form data
        setFormData({
          name: product.name || "",
          description: product.description || "",
          categoryId: product.categoryId || "",
          basePrice: product.basePrice || 0,
        });
      } catch (error) {
        toast.error("Failed to load product or categories.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductAndCategories();
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "basePrice" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Product ID is missing");
      return;
    }
    setIsSaving(true);
    try {
      await editProduct(productId, formData);
      toast.success("Product updated successfully");
      router.back();
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-center py-20">Loading...</p>;
  }

  return (
    <div className=" min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Toaster position="top-right" richColors />
      <div className="max-w-7xl  px-6 py-8"> {/* Adjusted width */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Price ($)</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}