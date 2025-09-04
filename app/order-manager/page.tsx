"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Package,
  AlertTriangle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { getOutOfStockProducts, restockProduct } from "@/utils/api/product";
import { toast } from "sonner";
import { getCategories } from "@/utils/api/category";

interface Product {
  id: string;
  productId: string;
  variantName: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  procurementTime: string | null;
  imageUrl: string;
  product: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    description: string;
  };
}

interface ApiResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  nextLink: string | null;
}

export default function OutOfStockManagerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [procurementTime, setProcurementTime] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current filters from URL
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "20");

  // Local filter states
  const [searchInput, setSearchInput] = useState(search);
  const [categoryFilter, setCategoryFilter] = useState(categoryId);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        categoryId: categoryId || undefined,
        page,
        limit,
        minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
      };

      const response: ApiResponse = await getOutOfStockProducts(params);
      const data = await getCategories();
      setCategories(data.data);
      setProducts(response.items);
      setTotal(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      toast.error("Error fetching out-of-stock products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const updateURL = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (Object.keys(newParams).some((key) => key !== "page")) {
      params.set("page", "1");
    }

    router.push(`/order-manager?${params.toString()}`);
  };

  const handleSearch = () => {
    updateURL({
      search: searchInput,
      categoryId: categoryFilter,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
  };

  const handleRestock = async () => {
    if (!selectedProduct || !restockQuantity) return;

    try {
      await restockProduct(
        selectedProduct.id,
        Number.parseInt(restockQuantity)
      );

      toast.success("Product restocked successfully");

      setRestockDialogOpen(false);
      setSelectedProduct(null);
      setRestockQuantity("");
      setProcurementTime("");
      fetchProducts();
    } catch (error) {
      toast.error("Error restocking product");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">
            Out of Stock Manager
          </h1>
          <p className="text-muted-foreground">
            Manage products that are currently out of stock
          </p>
        </div>
        <Badge variant="destructive" className="text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {total} items out of stock
        </Badge>
      </div>

      {/* Filters */}
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2">
                Search Products
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="mb-2">
                Category
              </Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="">All categories</SelectItem> */}
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="minPrice" className="mb-2">
                Min Price
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="maxPrice" className="mb-2">
                Max Price
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse p-0">
              <CardContent className="p-2 md:p-4">
                <div className="bg-muted h-32 md:h-48 rounded-md mb-2 md:mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-muted h-3 md:h-4 rounded w-3/4"></div>
                  <div className="bg-muted h-3 md:h-4 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="">
          <CardContent className="flex flex-col items-center justify-center  ">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No out-of-stock products found
            </h3>
            <p className="text-muted-foreground text-center">
              All products are currently in stock or no products match your
              filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden p-0">
              <div className="aspect-video relative">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.product.name}
                  className="w-full h-full object-cover aspect-video"
                />
                <Badge
                  variant="destructive"
                  className="absolute top-1 right-1 text-xs md:top-2 md:right-2 md:text-sm"
                >
                  Out of Stock
                </Badge>
              </div>
              <CardContent className="p-2 md:p-4">
                <h3 className="font-semibold text-sm md:text-lg mb-1 text-balance line-clamp-2">
                  {product.product.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 line-clamp-1">
                  {product.variantName}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-1 md:line-clamp-2 hidden md:block">
                  {product.product.description}
                </p>

                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <span className="text-sm md:text-lg font-bold">
                    ETB {product.price}
                  </span>
                  <Badge variant="outline" className="text-xs md:text-sm">
                    Stock: {product.stockQuantity}
                  </Badge>
                </div>

                <Button
                  onClick={() => {
                    setSelectedProduct(product);
                    setRestockDialogOpen(true);
                  }}
                  className="w-full text-xs md:text-sm"
                  size="sm"
                >
                  <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Restock
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => updateURL({ page: (currentPage - 1).toString() })}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({total} total items)
          </span>

          <Button
            variant="outline"
            onClick={() => updateURL({ page: (currentPage + 1).toString() })}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">
                  {selectedProduct.product.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.variantName}
                </p>
              </div>

              <div>
                <Label htmlFor="quantity">Restock Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  placeholder="Enter quantity to add"
                />
              </div>

              <div>
                <Label htmlFor="procurement">Procurement Time (Optional)</Label>
                <Textarea
                  id="procurement"
                  value={procurementTime}
                  onChange={(e) => setProcurementTime(e.target.value)}
                  placeholder="Expected delivery time or procurement notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRestock} disabled={!restockQuantity}>
                  Confirm Restock
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRestockDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
