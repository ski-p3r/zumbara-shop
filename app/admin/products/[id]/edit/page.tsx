"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  ChevronRight,
  Check,
  FolderTree,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

import {
  getProductById,
  updateProduct,
  deleteVariantsByProduct,
  createVariant,
} from "@/utils/api/products";
import { uploadFile } from "@/utils/api/upload";
import { getCategories } from "@/utils/api/categories";

// ──────────────────────────────────────────────────────────────
// Validation Schema
// ──────────────────────────────────────────────────────────────
const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be >= 0"),
  stock: z.number().int().min(0, "Stock must be >= 0"),
  image: z.string().min(1, "Image is required"),
});

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().min(1, "Image URL is required"),
  categorySlug: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be >= 0"),
  stock: z.number().int().min(0, "Stock must be >= 0"),
  variants: z.array(variantSchema).optional(),
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

// ──────────────────────────────────────────────────────────────
export default function ProductEdit() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceInput, setPriceInput] = useState<string>("");

  // Variant Dialog
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [variantPriceInput, setVariantPriceInput] = useState<string>("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      categorySlug: "",
      price: 0,
      stock: 0,
      variants: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const imageUrl = form.watch("image");
  const priceValue = form.watch("price");

  // ──────────────────────────────────────────────────────────────
  // Load product
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const product = await getProductById(id);
        form.reset({
          name: product.name,
          description: product.description ?? "",
          image: product.image,
          categorySlug: product.categorySlug,
          price: product.price,
          stock: product.stock,
          variants: product.variants?.map((v: any) => ({
            id: v.id,
            name: v.name,
            price: v.price,
            stock: v.stock,
            image: v.image,
          })) ?? [],
        });
        setPriceInput(formatETB(product.price));
        await loadCategories();
        if (product.categorySlug) await buildCategoryPath(product.categorySlug);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (priceValue > 0) setPriceInput(formatETB(priceValue));
  }, [priceValue]);

  // ──────────────────────────────────────────────────────────────
  // Category Helpers
  // ──────────────────────────────────────────────────────────────
  const fetchCategories = async (parentSlug?: string) => {
    try {
      return await getCategories(parentSlug);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const loadCategories = async (parentSlug?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchCategories(parentSlug);
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  };

  const buildCategoryPath = async (targetSlug: string) => {
    const parts = targetSlug.split("/");
    let currentSlug = "";
    const path: Category[] = [];

    for (const part of parts) {
      currentSlug = currentSlug ? `${currentSlug}/${part}` : part;
      const cats = await fetchCategories(currentSlug);
      const found = cats.find((c: any) => c.slug === currentSlug);
      if (found) path.push(found);
    }

    if (path.length > 0) {
      setSelectedPath(path);
      setSelectedCategory(path[path.length - 1]);
      form.setValue("categorySlug", targetSlug);
      const children = await fetchCategories(targetSlug);
      setCategories(children);
    }
  };

  const handleCategoryClick = async (category: Category) => {
    if (selectedCategory?.slug === category.slug) return;
    setSelectedCategory(category);
    form.setValue("categorySlug", category.slug);
    const newPath = [
      ...selectedPath.slice(0, selectedPath.findIndex((c) => c.slug === category.slug) + 1),
      category,
    ];
    setSelectedPath(newPath);
    const children = await fetchCategories(category.slug);
    setCategories(children);
  };

  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      setSelectedCategory(null);
      setSelectedPath([]);
      form.setValue("categorySlug", "");
      await loadCategories();
    } else {
      const newPath = selectedPath.slice(0, index + 1);
      const target = newPath[newPath.length - 1];
      setSelectedPath(newPath);
      setSelectedCategory(target);
      form.setValue("categorySlug", target.slug);
      const children = await fetchCategories(target.slug);
      setCategories(children);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Price Helpers
  // ──────────────────────────────────────────────────────────────
  const formatETB = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    const parts = raw.split(".");
    if (parts.length > 2) return;
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      form.setValue("price", num);
      setPriceInput(formatETB(num));
    } else if (raw === "") {
      form.setValue("price", 0);
      setPriceInput("");
    }
  };

  const handlePriceBlur = () => {
    if (priceValue > 0) setPriceInput(formatETB(priceValue));
  };

  const handlePriceFocus = () => {
    if (priceValue > 0) setPriceInput(priceValue.toString());
  };

  // ──────────────────────────────────────────────────────────────
  // Image Upload – only updates the exact field you pass
  // ──────────────────────────────────────────────────────────────
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldPath: string // "image" | "variants.2.image"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      const url = res.url || res.data?.url || res.imageUrl;
      if (!url) throw new Error("No URL returned");

      // Update dialog form if uploading inside variant
      if (fieldPath.startsWith("variants")) {
        variantForm.setValue("image", url);
      } else {
        form.setValue("image", url, { shouldValidate: true });
      }

      // Keep main form in sync
      form.setValue(fieldPath as any, url, { shouldValidate: true });

      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Variant Dialog Form
  // ──────────────────────────────────────────────────────────────
  const variantForm = useForm<z.infer<typeof variantSchema>>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      image: "",
    },
  });

  const openVariantDialog = (index?: number) => {
    if (index !== undefined) {
      const variant = fields[index];
      variantForm.reset({
        name: variant.name,
        price: variant.price,
        stock: variant.stock,
        image: variant.image,
      });
      setVariantPriceInput(formatETB(variant.price));
      setEditingVariantIndex(index);
    } else {
      variantForm.reset();
      setVariantPriceInput("");
      setEditingVariantIndex(null);
    }
    setVariantDialogOpen(true);
  };

  const saveVariant = async () => {
  const data = variantForm.getValues();

  try {
    if (editingVariantIndex !== null) {
      // ── EDIT MODE ──
      // Just update the local field array (no API call yet)
      update(editingVariantIndex, data);
      toast.success("Variant updated locally");
    } else {
      // ── ADD MODE ──
      // Call createVariant immediately
      const created = await createVariant(id, {
        name: data.name,
        price: data.price,
        stock: data.stock,
        image: data.image,
      });

      // Append the returned variant (with server-generated ID)
      append({
        id: created.id, // assuming API returns { id, ... }
        name: created.name,
        price: created.price,
        stock: created.stock,
        image: created.image,
      });

      toast.success("Variant created");
    }
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Failed to save variant");
    return; // don't close dialog on error
  }

  setVariantDialogOpen(false);
};

  // ──────────────────────────────────────────────────────────────
  // Submit – product + variants via separate calls
  // ──────────────────────────────────────────────────────────────
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Update product
      const productPayload = {
        name: data.name,
        description: data.description,
        image: data.image,
        categorySlug: data.categorySlug,
        price: data.price,
        stock: data.stock,
      };
      await updateProduct(id, productPayload);

      // 2. Delete all existing variants
      await deleteVariantsByProduct(id);

      // 3. Create each variant
      if (data.variants && data.variants.length > 0) {
        for (const v of data.variants) {
          await createVariant(id, {
            name: v.name,
            price: v.price,
            stock: v.stock,
            image: v.image,
          });
        }
      }

      toast.success("Product & variants updated successfully");
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="p-6 space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Edit Product</CardTitle>
          </div>
          <CardDescription>Update product and its variants.</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={() => (
                    <FormItem>
                      <FormLabel>Base Price (ETB)</FormLabel>
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
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                        placeholder="Enter description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Tree */}
              <FormField
                control={form.control}
                name="categorySlug"
                render={() => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-gray-500" />
                            <h3 className="text-lg font-semibold">
                              {selectedPath.length > 0 ? "Subcategories" : "Main Categories"}
                            </h3>
                          </div>
                          {selectedPath.length > 0 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => handleBreadcrumbClick(-1)}>
                              <ArrowLeft className="h-4 w-4 mr-1" /> Root
                            </Button>
                          )}
                        </div>

                        {selectedPath.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap p-3 bg-secondary rounded-lg">
                            <span className="text-sm font-medium">Path:</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleBreadcrumbClick(-1)}>
                              Root
                            </Button>
                            {selectedPath.map((cat, i) => (
                              <div key={cat.id} className="flex items-center gap-1">
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleBreadcrumbClick(i)}>
                                  {cat.name}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedCategory && (
                          <div className="flex items-center gap-2 p-3 border rounded-lg">
                            <Badge variant="secondary" className="bg-green-900/20 text-green-500 border-green-500">
                              <Check className="h-3 w-3 mr-1" /> Selected
                            </Badge>
                            <span className="font-medium text-green-500">
                              {selectedPath.map((c) => c.name).join(" > ")}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {categories.map((cat) => (
                            <div
                              key={cat.id}
                              className={`flex flex-col items-center cursor-pointer group transition-all ${
                                selectedCategory?.id === cat.id ? "scale-105" : ""
                              }`}
                              onClick={() => handleCategoryClick(cat)}
                            >
                              <div
                                className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedCategory?.id === cat.id
                                    ? "border-green-500 shadow-md"
                                    : "border-gray-200 group-hover:border-blue-300"
                                }`}
                              >
                                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                                {selectedCategory?.id === cat.id && (
                                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                                <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
                                  <ChevronRight className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              <span
                                className={`mt-2 text-center text-sm font-medium transition-colors ${
                                  selectedCategory?.id === cat.id
                                    ? "text-green-600 font-semibold"
                                    : "text-gray-700 group-hover:text-blue-600"
                                }`}
                              >
                                {cat.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Image */}
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
                            onChange={(e) => handleFileUpload(e, "image")}
                            disabled={isUploading}
                          />
                          {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        )}
                        <Input placeholder="Or paste image URL" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stock */}
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Variants</h3>
                  <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => openVariantDialog()}>
                        <Plus className="h-4 w-4 mr-1" /> Add Variant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingVariantIndex !== null ? "Edit" : "Add"} Variant
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...variantForm}>
                        <form onSubmit={variantForm.handleSubmit(saveVariant)} className="space-y-4">
                          <FormField
                            control={variantForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Large, Red" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={variantForm.control}
                            name="price"
                            render={() => (
                              <FormItem>
                                <FormLabel>Price (ETB)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="text"
                                      value={variantPriceInput}
                                      onChange={(e) => {
                                        const raw = e.target.value.replace(/[^\d.]/g, "");
                                        const num = parseFloat(raw);
                                        if (!isNaN(num)) {
                                          variantForm.setValue("price", num);
                                          setVariantPriceInput(formatETB(num));
                                        } else if (raw === "") {
                                          variantForm.setValue("price", 0);
                                          setVariantPriceInput("");
                                        }
                                      }}
                                      onBlur={() => {
                                        const val = variantForm.getValues("price");
                                        if (val > 0) setVariantPriceInput(formatETB(val));
                                      }}
                                      onFocus={() => {
                                        const val = variantForm.getValues("price");
                                        if (val > 0) setVariantPriceInput(val.toString());
                                      }}
                                      className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                      ETB
                                    </span>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={variantForm.control}
                            name="stock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={variantForm.control}
                            name="image"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleFileUpload(
                                            e,
                                            `variants.${
                                              editingVariantIndex !== null
                                                ? editingVariantIndex
                                                : fields.length
                                            }.image`
                                          )
                                        }
                                        disabled={isUploading}
                                      />
                                      {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    </div>

                                    {field.value && (
                                      <img
                                        src={field.value}
                                        alt="Variant preview"
                                        className="w-20 h-20 object-cover rounded-lg border"
                                      />
                                    )}

                                    <Input
                                      placeholder="Or paste URL"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setVariantDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              {editingVariantIndex !== null ? "Update" : "Add"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {fields.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={field.image}
                              alt={field.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{field.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatETB(field.price)} • {field.stock} in stock
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openVariantDialog(index)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    No variants added yet.
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.watch("categorySlug")}
                  className="flex-1"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Product
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}