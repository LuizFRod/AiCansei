"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 24,
};

function StarIcon({
  filled,
  half,
  size,
}: {
  filled: boolean;
  half: boolean;
  size: number;
}) {
  if (half) {
    return (
      <span className="relative inline-block" style={{ width: size, height: size }}>
        <Star
          size={size}
          className="absolute top-0 left-0 text-gray-300"
          strokeWidth={1.5}
        />
        <span className="absolute top-0 left-0 overflow-hidden" style={{ width: size / 2, height: size }}>
          <Star
            size={size}
            className="text-amber-400"
            fill="currentColor"
            strokeWidth={1.5}
          />
        </span>
      </span>
    );
  }

  return (
    <Star
      size={size}
      className={cn(
        filled ? "text-amber-400" : "text-gray-300"
      )}
      fill={filled ? "currentColor" : "none"}
      strokeWidth={1.5}
    />
  );
}

function StarRating({
  value,
  maxStars = 5,
  size = "md",
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;
  const starSize = sizeMap[size];

  function handleClick(starIndex: number) {
    if (!interactive || !onChange) return;
    onChange(starIndex);
  }

  function handleMouseEnter(starIndex: number) {
    if (!interactive) return;
    setHoverValue(starIndex);
  }

  function handleMouseLeave() {
    if (!interactive) return;
    setHoverValue(null);
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5",
        interactive && "cursor-pointer",
        className
      )}
      onMouseLeave={handleMouseLeave}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${value} de ${maxStars} estrelas`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        const filled = starIndex <= Math.floor(displayValue);
        const half = !filled && starIndex === Math.ceil(displayValue) && displayValue % 1 >= 0.5;

        return (
          <span
            key={i}
            className={cn(
              "inline-flex",
              interactive && "transition-transform hover:scale-110"
            )}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
          >
            <StarIcon filled={filled} half={half} size={starSize} />
          </span>
        );
      })}
    </div>
  );
}

export { StarRating };
export type { StarRatingProps };
