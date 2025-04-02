import { useState } from "react";
import { Star } from "lucide-react";

export default function RatingStars({
  rating = 0,
  max = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleMouseEnter = (index) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  return (
    <div className="flex">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating;

        return (
          <span
            key={index}
            className={`${interactive ? "cursor-pointer" : ""}`}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          >
            <Star
              className={`${starSizes[size]} ${
                isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </span>
        );
      })}
    </div>
  );
}
