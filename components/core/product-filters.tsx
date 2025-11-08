"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X, ArrowLeft } from "lucide-react";
import { getCategories } from "@/utils/api/categories";

export interface FilterState {
  search: string;
  categories: string[];
  priceRange: [number, number];
  rating: number;
  sort: "NEWEST" | "OLDEST" | "PRICE_ASC" | "PRICE_DESC";
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
  isOpen?: boolean;
  currentFilters?: FilterState;
}

export const ProductFilters = ({
  onFilterChange,
  onClose,
  isOpen = true,
  currentFilters,
}: ProductFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>(
    currentFilters || {
      search: "",
      categories: [],
      priceRange: [0, 10000],
      rating: 0,
      sort: "NEWEST",
    }
  );

  const [categories, setCategories] = useState<any[]>([]);
  const [currentCategories, setCurrentCategories] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch root categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        setCategories(data || []);
        setCurrentCategories(data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = async (category: any) => {
    try {
      setLoadingCategories(true);
      const subCategories = await getCategories(category.slug);
      if (subCategories && subCategories.length > 0) {
        setCurrentCategories(subCategories);
        setCurrentPath(category.slug);
        setSelectedCategoryName(category.name);
      }
      // Select the category
      const newCategories = [category.slug];
      const newFilters = { ...filters, categories: newCategories };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } catch (error) {
      console.error("Failed to load subcategories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubcategoryClick = (subcategory: any) => {
    const newCategories = [subcategory.slug];
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBackCategory = async () => {
    if (!currentPath) return;
    try {
      setLoadingCategories(true);
      const rootCategories = await getCategories();
      setCurrentCategories(rootCategories || []);
      setCurrentPath(null);
      setSelectedCategoryName(null);
      // Clear category filter when going back
      const newFilters = { ...filters, categories: [] };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } catch (error) {
      console.error("Failed to go back:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handlePriceChange = (value: [number, number]) => {
    const newFilters = { ...filters, priceRange: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (
    sort: "NEWEST" | "OLDEST" | "PRICE_ASC" | "PRICE_DESC"
  ) => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: "",
      categories: [],
      priceRange: [0, 10000],
      rating: 0,
      sort: "NEWEST",
    };
    setFilters(resetFilters);
    setCurrentCategories(categories);
    setCurrentPath(null);
    setSelectedCategoryName(null);
    onFilterChange(resetFilters);
  };

  return (
    <div className="w-full md:w-72 bg-white dark:bg-zinc-900 rounded-lg p-6 border border-border">
      {/* Header with close button for mobile */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Filters</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-muted rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {/* Sort */}
        <AccordionItem value="sort" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Sort By
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-3">
            {[
              { value: "NEWEST", label: "Newest" },
              { value: "OLDEST", label: "Oldest" },
              { value: "PRICE_ASC", label: "Price: Low to High" },
              { value: "PRICE_DESC", label: "Price: High to Low" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={filters.sort === option.value}
                  onChange={() =>
                    handleSortChange(
                      option.value as
                        | "NEWEST"
                        | "OLDEST"
                        | "PRICE_ASC"
                        | "PRICE_DESC"
                    )
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <div className="space-y-4">
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                min={0}
                max={10000}
                step={100}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ETB {filters.priceRange[0]}
                </span>
                <span className="text-muted-foreground">
                  ETB {filters.priceRange[1]}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating */}
        <AccordionItem value="rating" className="border-b border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Rating
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">
                  {rating} Star{rating !== 1 ? "s" : ""} & Up
                </span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={0}
                checked={filters.rating === 0}
                onChange={() => handleRatingChange(0)}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">All Ratings</span>
            </label>
          </AccordionContent>
        </AccordionItem>

        {currentCategories && currentCategories.length > 0 && (
          <AccordionItem value="categories" className="border-b border-border">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              {currentPath ? `${selectedCategoryName}` : "Categories"}
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3">
              {currentPath && (
                <button
                  onClick={handleBackCategory}
                  disabled={loadingCategories}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-3 disabled:opacity-50"
                >
                  <ArrowLeft size={16} />
                  Back to Categories
                </button>
              )}
              {loadingCategories ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                currentCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      currentPath
                        ? handleSubcategoryClick(category)
                        : handleCategoryClick(category)
                    }
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      filters.categories.includes(category.slug)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Reset Button */}
      <Button
        variant="outline"
        className="w-full mt-6 bg-transparent"
        onClick={handleReset}
      >
        Reset Filters
      </Button>
    </div>
  );
};
