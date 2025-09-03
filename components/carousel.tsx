import React, { useRef, useEffect, useState } from "react";

export type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  bannerUrl: string;
};

interface CarouselProps {
  events: Event[];
}

export function Carousel({ events }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [events.length]);

  if (!events.length) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-full h-64 overflow-hidden rounded-lg shadow-lg">
        {events.map((event, i) => (
          <div
            key={event.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={i !== index}
          >
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="w-full h-full object-cover rounded-xl"
              style={{ filter: "brightness(0.7)" }}
            />
            <div className="absolute left-6 bottom-6 text-left max-w-[80%]">
              <h3 className="font-bold text-lg text-white mb-1 truncate">
                {event.title}
              </h3>
              <p className="text-sm text-gray-100 mb-1 line-clamp-2">
                {event.description}
              </p>
              <span className="text-xs text-gray-200">
                {new Date(event.startDate).toLocaleDateString()} -{" "}
                {new Date(event.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {events.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
            }`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
