"use client";

import { useState, useCallback } from "react";
import { getRating, setRating as setRatingLib } from "@/lib/ratings";

interface StarRatingProps {
  trackId: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

export default function StarRating({
  trackId,
  size = "md",
  readOnly = false,
}: StarRatingProps) {
  const [rating, setRating] = useState(() => {
    if (typeof window === "undefined") return 0;
    return getRating(trackId);
  });
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = useCallback((star: number) => {
    if (readOnly) return;
    setRating((prev) => {
      const newRating = star === prev ? 0 : star;
      setRatingLib(trackId, newRating);
      return newRating;
    });
  }, [readOnly, trackId]);

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const starSize = sizeClasses[size];
  const activeRating = hoverRating || rating;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="group"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          disabled={readOnly}
          className={`transition-all ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <svg
            className={`${starSize} transition-colors ${
              star <= activeRating
                ? "text-yellow-400 fill-yellow-400"
                : "text-foreground/20 fill-foreground/10"
            }`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
