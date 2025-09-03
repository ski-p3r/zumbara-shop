"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Import Dialog components
import { Search, Plus, MoreHorizontal, Edit, Trash2, Folder } from "lucide-react";
import { getCategories, deleteCategory } from "@/utils/api/category"; // Import functions
import { Toaster, toast } from "sonner"; // Import Toaster and toast

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null); // State for category to delete

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCategories(); // Use getCategories from category.ts
        setCategories(response.data); // Assuming response.data contains the categories
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Open delete confirmation dialog
  const openDeleteDialog = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDialogOpen(true);
  };

  // Handle delete category
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete); // Use deleteCategory from category.ts
      setCategories((prev) => prev.filter((category) => category.id !== categoryToDelete)); // Remove from state
      toast.success("Category deleted successfully!"); // Show success message
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      toast.error("Failed to delete category. Please try again."); // Show error message
    } finally {
      setIsDialogOpen(false); // Close dialog
      setCategoryToDelete(null); // Reset category to delete
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error loading categories: {error}</div>;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Toaster position="top-right" richColors /> {/* Add Toaster */}
      <div className="px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Category Management</h1>
            <p className="text-muted-foreground">Organize your products with categories</p>
          </div>
          <Button asChild>
            <Link href="categories/addCategory" >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Folder className="h-4 w-4" />
                      <img
                        src={category.imageUrl || "/placeholder.svg"}
                        alt={category.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.parentId ? `Parent ID: ${category.parentId}` : "Top-level category"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/categories/${category.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(category.id)} // Open delete dialog
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}