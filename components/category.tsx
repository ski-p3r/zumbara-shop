import React from "react";

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
};

interface CategoryCarouselApiProps {
  apiCategories: ApiCategory[];
  onCategoryClick?: (categoryId: string) => void;
}

export function CategoryCarouselApi({
  apiCategories,
  onCategoryClick,
}: CategoryCarouselApiProps) {
  return (
    <div className="flex flex-row gap-2 md:gap-4 overflow-x-auto py-2">
      {apiCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryClick?.(cat.id)}
          className="mr-2.5 w-20 h-24 flex flex-col items-center justify-center focus:outline-none bg-transparent border-none"
          style={{ minWidth: 80 }}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              cat.imageUrl ? "bg-secondary" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            {cat.imageUrl ? (
              <img
                className="w-16 h-16 rounded-full object-cover"
                src={cat.imageUrl}
                alt={cat.name}
              />
            ) : (
              <span className="text-lg font-bold text-zinc-700 dark:text-zinc-200">
                {cat.name?.[0] || ""}
              </span>
            )}
          </div>
          <span className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 text-center truncate w-20">
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
}
