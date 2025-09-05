"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { getCategories, createCategory } from "@/utils/api/category";
import { uploadFile } from "@/utils/api/upload"; // Import uploadFile function

export default function AddCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    parentId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Add state for file
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Optionally, create a preview URL for display
      setFormData({ ...formData, imageUrl: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    let imageUrl = formData.imageUrl;
    if (selectedFile) {
      try {
        const result = await uploadFile(selectedFile);
        imageUrl = result?.url || result?.response?.url;
        if (!imageUrl) {
          throw new Error("Failed to upload image");
        }
      } catch (err: any) {
        setError(err.message || "Failed to upload image.");
        setIsSubmitting(false);
        return;
      }
    }

    const categoryData = {
      name: formData.name,
      imageUrl: imageUrl || "",
      parentId: formData.parentId || undefined,
    };

    try {
      await createCategory(categoryData);
      router.push("/admin/categories");
    } catch (err: any) {
      setError(err.message || "Failed to create category.");
      console.error("Failed to create category:", err);
      alert("Failed to create category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error loading categories: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Add New Category
            </h1>
            <p className="text-muted-foreground">
              Create a new category for your products
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter category name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentCategory">Parent Category</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, parentId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Category Image</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <img
                        src={formData.imageUrl}
                        alt="Category preview"
                        className="w-32 h-32 rounded-lg object-cover border"
                      />
                    </div>
                  )}
                  {!formData.imageUrl && (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/categories">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Category"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
