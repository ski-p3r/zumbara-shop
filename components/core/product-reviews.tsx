"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { WriteReview } from "./write-review";

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    firstName: string;
    lastName: string;
    image: string;
  };
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  productId?: string;
}

export function ProductReviews({
  reviews,
  averageRating,
  productId,
}: ProductReviewsProps) {
  const [allReviews, setAllReviews] = useState(reviews);

  const handleReviewSubmitted = (newReview: any) => {
    setAllReviews([newReview, ...allReviews]);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-4xl font-light mb-2">Customer Reviews</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={20}
                className={`${
                  i < Math.round(averageRating)
                    ? "fill-primary text-primary"
                    : "text-border"
                }`}
              />
            ))}
          </div>
          <span className="text-lg text-muted-foreground">
            {averageRating.toFixed(1)} out of 5
          </span>
          <span className="text-lg text-muted-foreground">
            ({allReviews.length}{" "}
            {allReviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      {productId && (
        <div className="mb-12 p-6 border border-border rounded-lg bg-background">
          <h3 className="text-2xl font-light mb-6">Write a Review</h3>
          <WriteReview
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}

      <div className="space-y-6">
        {allReviews.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div>
            <h3 className="text-2xl font-light mb-6">All Reviews</h3>
            <div className="space-y-6">
              {allReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-border pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <img
                      src={
                        review.user.image ||
                        "/placeholder.svg?height=40&width=40"
                      }
                      alt={`${review.user.firstName} ${review.user.lastName}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {review.user.firstName} {review.user.lastName}
                        </h4>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-border"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
