import { useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  text: string;
  images?: string[];
  helpful_count: number;
  created_at: string;
  user: {
    username: string;
    avatar_url?: string;
    verified?: boolean;
  };
  replies?: Array<{
    id: string;
    text: string;
    created_at: string;
    user: {
      username: string;
      avatar_url?: string;
    };
  }>;
  user_reaction?: string | null;
  user_marked_helpful?: boolean;
}

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
  isCreator?: boolean;
  currentUserId?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onReact?: (reviewId: string, reactionType: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  onFlag?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  onSortChange?: (sort: string) => void;
}

export function ReviewList({
  reviews,
  isLoading = false,
  isCreator = false,
  currentUserId,
  hasMore = false,
  onLoadMore,
  onReact,
  onMarkHelpful,
  onReply,
  onFlag,
  onEdit,
  onDelete,
  onSortChange,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState("most_helpful");

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-20 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-12 shadow-card text-center">
        <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </h3>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="most_helpful">Most Helpful</SelectItem>
            <SelectItem value="highest_rated">Highest Rated</SelectItem>
            <SelectItem value="lowest_rated">Lowest Rated</SelectItem>
            <SelectItem value="most_recent">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Review Cards */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isCreator={isCreator}
            currentUserId={currentUserId}
            onReact={onReact}
            onMarkHelpful={onMarkHelpful}
            onReply={onReply}
            onFlag={onFlag}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="glass"
            onClick={onLoadMore}
            className="min-w-[200px]"
          >
            Load More Reviews
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
