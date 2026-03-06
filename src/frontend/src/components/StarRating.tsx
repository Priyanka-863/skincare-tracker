import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  max?: number;
  className?: string;
}

export default function StarRating({
  value,
  max = 5,
  className = "",
}: StarRatingProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => `star-${i}`).map((key, i) => (
        <Star
          key={key}
          className={`w-3.5 h-3.5 ${
            i < value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}
