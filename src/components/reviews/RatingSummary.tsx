import { Star } from "lucide-react";
import { StarRating } from "./StarRating";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface RatingSummaryProps {
  averageRating: number;
  totalRatings: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  isLoading?: boolean;
}

export function RatingSummary({
  averageRating,
  totalRatings,
  ratingDistribution,
  isLoading = false,
}: RatingSummaryProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const distribution = ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card">
      <h3 className="text-lg font-semibold mb-4">Rating Summary</h3>

      {/* Average Rating */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold bg-gradient-cyan bg-clip-text text-transparent">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="sm" className="mt-1" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Based on {totalRatings.toLocaleString()} {totalRatings === 1 ? "rating" : "ratings"}
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars as keyof typeof distribution];
          const percentage = (count / total) * 100;

          return (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium">{stars}</span>
                <Star className="h-3 w-3 fill-primary text-primary" />
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
