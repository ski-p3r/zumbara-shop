"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Upload,
  ArrowLeft,
  ChevronRight,
  Check,
  FolderTree,
} from "lucide-react";
import { uploadFile } from "@/utils/api/upload";
import { createProduct } from "@/utils/api/products";
import { getCategories } from "@/utils/api/categories";
import { useRouter } from "next/navigation";

// Schema validation
const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().min(1, "Image URL is required"),
  categorySlug: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// ETB currency formatter
const formatETB = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function ProductCreate() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceInput, setPriceInput] = useState<string>("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      categorySlug: "",
      price: 0,
      stock: 0,
    },
  });

  const imageUrl = form.watch("image");
  const priceValue = form.watch("price");

  // Update price input when form value changes
  useEffect(() => {
    if (priceValue > 0) {
      setPriceInput(formatETB(priceValue));
    }
  }, [priceValue]);

  const fetchCategories = async (parentSlug?: string) => {
    try {
      const categories = await getCategories(parentSlug);
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  // Load root categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (parentSlug?: string) => {
    setIsLoading(true);
    try {
      const categoriesData = await fetchCategories(parentSlug);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = async (category: Category) => {
    // Immediately select the category
    if (selectedCategory?.slug === category.slug) return; // Already selected
    setSelectedCategory(category);
    form.setValue("categorySlug", category.slug);

    // Update the selected path
    const newPath = [...selectedPath, category];
    setSelectedPath(newPath);

    // Check if this category has children and load them
    const childCategories = await fetchCategories(category.path);

    if (childCategories && childCategories.length > 0) {
      // Has children, load them for further navigation
      setCategories(childCategories);
    }
  };

  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      // Go back to root
      setSelectedCategory(null);
      setSelectedPath([]);
      form.setValue("categorySlug", "");
      await loadCategories();
    } else {
      // Go to specific level in the path
      const newPath = selectedPath.slice(0, index + 1);
      const targetCategory = newPath[newPath.length - 1];

      setSelectedPath(newPath);
      setSelectedCategory(targetCategory);
      form.setValue("categorySlug", targetCategory.slug);

      // Load children of the target category
      const childCategories = await fetchCategories(targetCategory.slug);
      setCategories(childCategories);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input
    if (value === "") {
      setPriceInput("");
      form.setValue("price", 0);
      return;
    }

    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, "");

    // Ensure only one decimal point
    const parts = cleanValue.split(".");
    if (parts.length > 2) return; // Invalid input

    // Parse the numeric value
    const numericValue = parseFloat(cleanValue);

    if (!isNaN(numericValue)) {
      // Update form value (numeric)
      form.setValue("price", numericValue);

      // Update display value (formatted)
      setPriceInput(formatETB(numericValue));
    }
  };

  const handlePriceBlur = () => {
    // Format the price on blur
    if (priceValue > 0) {
      setPriceInput(formatETB(priceValue));
    }
  };

  const handlePriceFocus = () => {
    // Show raw number when focused for editing
    if (priceValue > 0) {
      setPriceInput(priceValue.toString());
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadResult = await uploadFile(file);
      const imageUrl =
        uploadResult.url || uploadResult.data?.url || uploadResult.imageUrl;

      if (imageUrl) {
        form.setValue("image", imageUrl);
      } else {
        console.error("No image URL in response:", uploadResult);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);

      // Redirect to admin/products page after successful creation
      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate current nesting level
  const currentNestingLevel = selectedPath.length;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>
            Add a new product to your store. Fill in the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (ETB)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="0.00"
                            value={priceInput}
                            onChange={handlePriceChange}
                            onBlur={handlePriceBlur}
                            onFocus={handlePriceFocus}
                            className="pr-8"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                            ETB
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {priceValue > 0 && (
                          <span className="text-green-600 font-medium">
                            Display: {formatETB(priceValue)}
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Selection */}
              <FormField
                control={form.control}
                name="categorySlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Navigation Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-gray-500" />
                            <h3 className="text-lg font-semibold">
                              {selectedPath.length > 0
                                ? "Subcategories"
                                : "Main Categories"}
                            </h3>
                            {currentNestingLevel > 0 && (
                              <Badge variant="outline" className="ml-2">
                                Level {currentNestingLevel + 1}
                              </Badge>
                            )}
                          </div>

                          {selectedPath.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleBreadcrumbClick(-1)}
                              className="flex items-center gap-1"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              Back to Root
                            </Button>
                          )}
                        </div>

                        {/* Breadcrumb Navigation */}
                        {selectedPath.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap p-3 bg-secondary rounded-lg">
                            <span className="text-sm text-secondary-foreground font-medium">
                              Path:
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBreadcrumbClick(-1)}
                              className="text-secondary-foreground hover:text-secondary-foreground/80"
                            >
                              Root
                            </Button>

                            {selectedPath.map((category, index) => (
                              <div
                                key={category.id}
                                className="flex items-center gap-1"
                              >
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBreadcrumbClick(index)}
                                  className="text-secondary-foreground hover:text-secondary-foreground/80"
                                >
                                  {category.name}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Selected Category Display */}
                        {selectedCategory && (
                          <div className="flex items-center gap-2 p-3 border rounded-lg ">
                            <Badge
                              variant="secondary"
                              className="bg-green-900/20 text-green-500 border-green-500"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                            <span className="font-medium text-green-500">
                              {selectedPath.map((cat) => cat.name).join(" > ")}
                            </span>
                            <Badge variant="outline" className="ml-auto">
                              {categories.length > 0
                                ? `${categories.length} subcategories available`
                                : "Final selection"}
                            </Badge>
                          </div>
                        )}

                        {/* Categories Grid */}
                        {isLoading ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div
                                key={i}
                                className="flex flex-col items-center"
                              >
                                <Skeleton className="h-20 w-20 rounded-lg" />
                                <Skeleton className="mt-2 h-4 w-16" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map((category) => (
                              <div
                                key={category.id}
                                className={`flex flex-col items-center cursor-pointer group transition-all ${
                                  selectedCategory?.id === category.id
                                    ? "transform scale-105"
                                    : ""
                                }`}
                                onClick={() => handleCategoryClick(category)}
                              >
                                <div
                                  className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                                    selectedCategory?.id === category.id
                                      ? "border-green-500 shadow-md"
                                      : "border-gray-200 group-hover:border-blue-300"
                                  }`}
                                >
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                  />

                                  {/* Selection Checkmark */}
                                  {selectedCategory?.id === category.id && (
                                    <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  )}

                                  {/* Nested indicator - always show chevron since we don't know if it has children until we click */}
                                  <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
                                    <ChevronRight className="h-3 w-3 text-white" />
                                  </div>
                                </div>

                                <span
                                  className={`mt-2 text-center text-sm font-medium transition-colors ${
                                    selectedCategory?.id === category.id
                                      ? "text-green-600 font-semibold"
                                      : "text-gray-700 group-hover:text-blue-600"
                                  }`}
                                >
                                  {category.name}
                                </span>

                                {/* Debug info - shows in development */}
                                {process.env.NODE_ENV === "development" && (
                                  <span className="text-xs text-gray-400 mt-1">
                                    {category.path}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Empty State with different messages */}
                        {!isLoading && categories.length === 0 && (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                            {selectedPath.length === 0 ? (
                              <>
                                <FolderTree className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                <p className="font-medium">
                                  No categories found
                                </p>
                                <p className="text-sm mt-1">
                                  Please check your category setup
                                </p>
                              </>
                            ) : (
                              <>
                                <Check className="h-12 w-12 mx-auto text-green-300 mb-2" />
                                <p className="font-medium">
                                  No more subcategories
                                </p>
                                <p className="text-sm mt-1">
                                  "{selectedCategory?.name}" is selected and has
                                  no further subcategories
                                </p>
                                <p className="text-xs mt-2 text-gray-400">
                                  This is a valid final selection for your
                                  product
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                          {isUploading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>

                        {/* Image Preview */}
                        {imageUrl && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">
                              Image Preview:
                            </p>
                            <img
                              src={imageUrl}
                              alt="Product preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  imageUrl
                                );
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        )}

                        <Input
                          placeholder="Or enter image URL directly"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/products")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.watch("categorySlug")}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Product
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
