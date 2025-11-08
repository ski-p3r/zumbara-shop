// app/shop/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import {
  ProductFilters,
  type FilterState,
} from "@/components/core/product-filters";
import { ProductsGrid } from "@/components/core/products-grid";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { getProducts } from "@/utils/api/products";
import { useRouter, useSearchParams } from "next/navigation";

// THIS IS THE MAGIC LINE — FIXES THE ERROR WITHOUT ANY CONFIG
export const dynamic = "force-dynamic";

// Inner component that uses useSearchParams()
function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    categories: searchParams.get("category")
      ? [searchParams.get("category")!]
      : [],
    priceRange: [
      Number.parseInt(searchParams.get("minPrice") || "0"),
      Number.parseInt(searchParams.get("maxPrice") || "10000"),
    ] as [number, number],
    rating: Number.parseInt(searchParams.get("rating") || "0"),
    sort: (searchParams.get("sort") || "NEWEST") as
      | "NEWEST"
      | "OLDEST"
      | "PRICE_ASC"
      | "PRICE_DESC",
  });

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.categories.length > 0)
      params.set("category", newFilters.categories[0]);
    if (newFilters.priceRange[0] !== 0)
      params.set("minPrice", newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] !== 10000)
      params.set("maxPrice", newFilters.priceRange[1].toString());
    if (newFilters.rating > 0)
      params.set("rating", newFilters.rating.toString());
    if (newFilters.sort !== "NEWEST") params.set("sort", newFilters.sort);
    router.push(`/shop?${params.toString()}`);
  };

  const PAGE_SIZE = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setCurrentPage(1);
      try {
        const data = await getProducts({
          search: filters.search || undefined,
          categorySlug:
            filters.categories.length > 0 ? filters.categories[0] : undefined,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          minRating: filters.rating > 0 ? filters.rating : undefined,
          sort: filters.sort,
          page: 1,
          pageSize: PAGE_SIZE,
        });
        setProducts(data?.data || []);
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const data = await getProducts({
        search: filters.search || undefined,
        categorySlug:
          filters.categories.length > 0 ? filters.categories[0] : undefined,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        minRating: filters.rating > 0 ? filters.rating : undefined,
        sort: filters.sort,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setProducts((prev) => [...prev, ...(data?.data || [])]);
      setCurrentPage(nextPage);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load more products:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateURL(newFilters);
    setShowFilters(false);
  };

  const handleSearchSubmit = () => {
    const newFilters = { ...filters, search: searchInput };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const hasMore = currentPage < totalPages;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Products
          </h1>
          <p className="text-muted-foreground">
            Browse our collection of quality products
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-14">
          <div className="md:hidden">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <>
                  <X className="w-4 h-4" /> Close Filters
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4" /> Show Filters
                </>
              )}
            </Button>
          </div>

          {(showFilters || isDesktop) && (
            <div className="w-full md:w-64 md:sticky md:top-8 md:h-fit">
              <ProductFilters
                onFilterChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
                isOpen={showFilters}
                currentFilters={filters}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <ProductsGrid
              products={products}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// THIS WRAPS IT — NO EXTRA FILE, NO CONFIG
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center">
          Loading shop...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
