"use client";

import { getPromotions } from "@/utils/api/promotions";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

interface Promotion {
  id: string;
  title: string;
  image: string;
  description: string;
  expiresAt: string;
  startedAt: string;
  updatedAt: string;
}

export const PromotionSection = () => {
  const [current, setCurrent] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const gap = 16;

  // Fetch promotions on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        // await new Promise((resolve) => setTimeout(resolve, 4000));
        const res = await getPromotions({ active: "true" });
        setPromotions(res);
      } catch (err) {
        console.error("Failed to fetch promotions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  // Slide interval
  useEffect(() => {
    if (promotions.length === 0) return;

    const interval = setInterval(() => {
      setIsSliding(true);
      setCurrent((prev) => (prev + 1) % promotions.length);
      setTimeout(() => setIsSliding(false), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [promotions]);

  return (
    <div className="w-full relative rounded-2xl">
      {/* Slider */}
      <div
        className={`overflow-hidden ${
          !isSliding && promotions.length > 0 ? "h-56" : ""
        } rounded-2xl shadow-lg`}
      >
        {loading ? (
          <Skeleton className="w-full h-56 rounded-2xl " />
        ) : (
          <div
            className="flex transition-transform duration-500 h-full"
            style={{
              gap: isSliding ? `${gap}px` : "0px",
              transform: `translateX(-${
                current *
                (100 + (isSliding ? (gap / window.innerWidth) * 100 : 0))
              }%)`,
            }}
          >
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="flex-shrink-0 w-full h-56 relative rounded-2xl overflow-hidden"
              >
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex flex-col justify-start items-start text-white max-w-[80%]">
                  <h3 className="font-bold text-lg">{promo.title}</h3>
                  <p className="text-sm mt-1">{promo.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex justify-center mt-3 gap-2">
          {promotions.map((_, index) => (
            <span
              key={index}
              onClick={() => {
                setIsSliding(true);
                setCurrent(index);
                setTimeout(() => setIsSliding(false), 500);
              }}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                index === current
                  ? "bg-primary w-6"
                  : "bg-secondary-foreground/30 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
