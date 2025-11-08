"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface WriteReviewProps {
  productId: string;
  onReviewSubmitted?: (review: any) => void;
  onClose?: () => void;
}

export function WriteReview({
  productId,
  onReviewSubmitted,
  onClose,
}: WriteReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !comment.trim() || !name.trim() || !email.trim()) {
      setError("Please fill in all fields and select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      //   const response = await fetch("/api/reviews", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       productId,
      //       rating,
      //       comment,
      //       userName: name,
      //       userEmail: email,
      //     }),
      //   });

      //   if (!response.ok) throw new Error("Failed to submit review");

      //   const newReview = await response.json();
      //   onReviewSubmitted?.(newReview);
      setRating(0);
      setComment("");
      setName("");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">
            Rate this product
          </label>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoveredRating(i + 1)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={`${
                    i < (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-border"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
          />
        </div>

        {error && (
          <p className="text-destructive text-sm font-medium">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
}
