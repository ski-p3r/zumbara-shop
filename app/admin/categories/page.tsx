"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Upload,
  ArrowLeft,
  ChevronRight,
  Check,
  FolderTree,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { uploadFile } from "@/utils/api/upload";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/utils/api/categories";
import { useRouter } from "next/navigation";

// Schema validation
const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().min(1, "Path is required").optional(),
  image: z.string().min(1, "Image URL is required"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Alert Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      path: "",
      image: "",
    },
  });

  const imageUrl = form.watch("image");

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
    setSelectedCategory(category);

    // Update the selected path
    const newPath = [...selectedPath, category];
    setSelectedPath(newPath);

    // Load children categories
    const childCategories = await fetchCategories(category.slug);
    setCategories(childCategories);
  };

  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      // Go back to root
      setSelectedCategory(null);
      setSelectedPath([]);
      await loadCategories();
    } else {
      // Go to specific level in the path
      const newPath = selectedPath.slice(0, index + 1);
      const targetCategory = newPath[newPath.length - 1];

      setSelectedPath(newPath);
      setSelectedCategory(targetCategory);

      // Load children of the target category
      const childCategories = await fetchCategories(targetCategory.slug);
      setCategories(childCategories);
    }
  };

  const handleEditCategory = (category: Category) => {
    setIsEditing(true);
    setShowForm(true);
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      path: category.path,
      image: category.image,
    });
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      // Reload current categories
      await loadCategories(selectedPath[selectedPath.length - 1]?.slug);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleNewCategory = () => {
    setIsEditing(false);
    setShowForm(true);
    setSelectedCategory(null);
    form.reset({
      name: "",
      path: selectedPath[selectedPath.length - 1]?.slug || "",
      image: "",
    });
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

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && selectedCategory) {
        await updateCategory(selectedCategory.id, {
          name: data.name,
          image: data.image,
          path: data.path || selectedCategory.path,
        });
      } else {
        await createCategory(data);
      }

      // Reset form and reload categories
      form.reset();
      setShowForm(false);
      setIsEditing(false);
      setSelectedCategory(null);
      await loadCategories(selectedPath[selectedPath.length - 1]?.slug);
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setSelectedCategory(null);
    form.reset();
  };

  // Calculate current nesting level
  const currentNestingLevel = selectedPath.length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600">Manage your product categories</p>
        </div>
        <Button onClick={handleNewCategory} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Structure</CardTitle>
            <CardDescription>
              Navigate through your category hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    <div key={category.id} className="flex items-center gap-1">
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

              {/* Categories Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
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
                      className="flex flex-col items-center group relative"
                    >
                      <div
                        className="flex flex-col items-center cursor-pointer group transition-all w-full"
                        onClick={() => handleCategoryClick(category)}
                      >
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-all">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
                            <ChevronRight className="h-3 w-3 text-white" />
                          </div>
                        </div>

                        <span className="mt-2 text-center text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </span>

                        {/* Debug info - shows in development */}
                        {process.env.NODE_ENV === "development" && (
                          <span className="text-xs text-gray-400 mt-1">
                            {category.path}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(category);
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && categories.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  {selectedPath.length === 0 ? (
                    <>
                      <FolderTree className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="font-medium">No categories found</p>
                      <p className="text-sm mt-1">
                        Create your first category to get started
                      </p>
                    </>
                  ) : (
                    <>
                      <Check className="h-12 w-12 mx-auto text-green-300 mb-2" />
                      <p className="font-medium">No subcategories</p>
                      <p className="text-sm mt-1">
                        "{selectedPath[selectedPath.length - 1]?.name}" has no
                        subcategories
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit Category" : "Create New Category"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update the category details below."
                  : "Add a new category to your store hierarchy."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="path"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Path</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="parent-slug"
                            {...field}
                            disabled={isEditing}
                          />
                        </FormControl>
                        <FormDescription>
                          The slug of the parent category. Leave empty for root
                          categories.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Image</FormLabel>
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
                                  alt="Category preview"
                                  className="w-32 h-32 object-cover rounded-lg border"
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

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isEditing ? "Update Category" : "Create Category"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category{" "}
              <span className="font-semibold text-red-600">
                {categoryToDelete?.name}
              </span>
              . This action cannot be undone and may affect products in this
              category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
