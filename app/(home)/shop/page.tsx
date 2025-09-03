"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/utils/api/product";
import { useLanguage } from "@/providers/language-provider";
import { getCategories } from "@/utils/api/category";

export default function Shop() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("allCategories");
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryStack, setCategoryStack] = useState<string[]>([]);

  function buildCategoryTree(flatCategories: any[]): any[] {
    const categoryMap = new Map<string, any>();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    flatCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree structure
    flatCategories.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }

  function renderCategoryOptions(
    categories: any[],
    level = 0
  ): React.JSX.Element[] {
    const options: React.JSX.Element[] = [];

    categories.forEach((category) => {
      const indent = "  ".repeat(level);
      options.push(
        <SelectItem key={category.id} value={category.id}>
          {indent}
          {category.name}
        </SelectItem>
      );

      if (category.children && category.children.length > 0) {
        options.push(...renderCategoryOptions(category.children, level + 1));
      }
    });

    return options;
  }

  function getCurrentCategoryTree() {
    if (selectedCategory === "allCategories")
      return buildCategoryTree(categories);
    const selected = categories.find((cat) => cat.id === selectedCategory);
    if (!selected || !selected.children || selected.children.length === 0)
      return [];
    return buildCategoryTree(selected.children);
  }

  function handleCategoryChange(catId: string) {
    setSelectedCategory(catId);
    if (catId !== "allCategories") {
      setCategoryStack((prev) => [...prev, catId]);
    } else {
      setCategoryStack([]);
    }
    setPage(1);
  }

  function handleBackToParent() {
    setCategoryStack((prev) => {
      const newStack = prev.slice(0, -1);
      setSelectedCategory(
        newStack.length ? newStack[newStack.length - 1] : "allCategories"
      );
      return newStack;
    });
    setPage(1);
  }

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getCategories();
        const data = res.data;
        setCategories(data);
      } catch (err) {
        setError(t("shop.errorLoadingCategories"));
      }
    }
    fetchCategories();
  }, [t]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await getProducts({
          search,
          categoryId:
            selectedCategory === "allCategories" ? undefined : selectedCategory,
          page,
          limit,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          minRating: minRating ? Number(minRating) : undefined,
          maxRating: maxRating ? Number(maxRating) : undefined,
        });
        setProducts(res.data.items || []);
        setTotalPages(Math.ceil((res.data.total || 0) / limit));
      } catch (err) {
        setError(t("shop.errorLoadingProducts"));
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [
    search,
    selectedCategory,
    minPrice,
    maxPrice,
    minRating,
    maxRating,
    page,
    limit,
    t,
  ]);

  const categoryTree = buildCategoryTree(categories);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <aside className="w-full lg:w-80 flex-shrink-0 bg-card rounded-lg p-6 h-fit">
        <h2 className="font-bold text-lg mb-6">{t("shop.filters")}</h2>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">{t("shop.categories")}</h3>
          {selectedCategory !== "allCategories" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToParent}
              className="mb-2"
            >
              {t("shop.backToParent")}
            </Button>
          )}
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("shop.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allCategories">
                {t("shop.allCategories")}
              </SelectItem>
              {getCurrentCategoryTree().length === 0 ? (
                <SelectItem value="none" disabled>
                  {t("shop.noSubcategories")}
                </SelectItem>
              ) : (
                renderCategoryOptions(getCurrentCategoryTree())
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">{t("shop.priceRange")}</h3>
          <div className="flex gap-2">
            <Input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={t("shop.minPrice")}
              className="w-1/2"
            />
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={t("shop.maxPrice")}
              className="w-1/2"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">{t("shop.rating")}</h3>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              placeholder={t("shop.minRating")}
              className="w-1/2"
            />
            <Input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={maxRating}
              onChange={(e) => setMaxRating(e.target.value)}
              placeholder={t("shop.maxRating")}
              className="w-1/2"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Search Bar */}
        <div className="mb-6 flex gap-2 items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("shop.searchPlaceholder")}
            className="max-w-md"
          />
          <Button onClick={() => setPage(1)}>{t("shop.search")}</Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-500 font-semibold">{error}</div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              {t("shop.loading")}
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              {t("shop.noProducts")}
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isListView={false}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("shop.previous")}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("shop.page")}
              </span>
              <span className="font-semibold">{page}</span>
              <span className="text-sm text-muted-foreground">
                {t("shop.of")} {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t("shop.next")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
