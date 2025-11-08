"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/utils/api/categories";

export interface Category {
  id: string;
  name: string;
  slug: string;
  path?: string;
  image: string;
}

interface CategoryListProps {
  categories: Category[];
  loading?: boolean;
  onCategorySelect?: (slug: string) => void;
  onBack?: () => void;
}

export function CategoryList({
  categories,
  loading,
  onCategorySelect,
  onBack,
}: CategoryListProps) {
  const [currentCategories, setCurrentCategories] =
    useState<Category[]>(categories);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);

  // Sync state when prop changes
  useEffect(() => {
    setCurrentCategories(categories);
    setCurrentPath(null);
  }, [categories]);

  const handleCategoryClick = async (cat: Category) => {
    try {
      setLoadingSub(true);
      const sub = await getCategories(cat.path);
      if (sub.length > 0) {
        setCurrentCategories(sub);
        setCurrentPath(cat.path ?? null);
      }
      onCategorySelect?.(cat.slug);
    } catch (err) {
      console.error("❌ Failed to load subcategories:", err);
    } finally {
      setLoadingSub(false);
    }
  };

  const handleBack = async () => {
    if (!currentPath) return;
    setLoadingSub(true);

    const newPath = currentPath.includes("/")
      ? currentPath.split("/").slice(0, -1).join("/")
      : null;

    try {
      const res = await getCategories(newPath ?? undefined);
      setCurrentCategories(res);
      setCurrentPath(newPath);
      if (!newPath) onBack?.();
    } catch (err) {
      console.error("❌ Failed to go back:", err);
    } finally {
      setLoadingSub(false);
    }
  };

  const showSkeleton = loading || loadingSub;

  return (
    <div className="mt-3">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        {currentPath && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentPath ? "Subcategories" : "Categories"}
        </h2>
      </div>

      {/* Category list */}
      {showSkeleton ? (
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-full" />
          ))}
        </div>
      ) : (
        <div
          key={currentPath ?? "root"}
          className="flex gap-4 overflow-x-auto pb-2 cursor-pointer"
        >
          {currentCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="flex flex-col items-center"
            >
              <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-200 shadow-sm dark:border-gray-700">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="mt-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
