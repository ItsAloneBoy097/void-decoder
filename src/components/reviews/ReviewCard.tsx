import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, Heart, Smile, Flag, Reply, MoreVertical } from "lucide-react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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

interface ReviewCardProps {
  review: Review;
  isCreator?: boolean;
  currentUserId?: string;
  onReact?: (reviewId: string, reactionType: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  onFlag?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  isCreator = false,
  currentUserId,
  onReact,
  onMarkHelpful,
  onReply,
  onFlag,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isOwnReview = currentUserId === review.user.username; // Simplified check

  const reactions = [
    { type: "thumbs_up", icon: ThumbsUp, label: "👍" },
    { type: "heart", icon: Heart, label: "❤️" },
    { type: "surprised", icon: Smile, label: "😮" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <div className="h-full w-full rounded-full bg-gradient-cyan" />
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.user.username}</span>
              {review.user.verified && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  ✓
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnReview && (
              <>
                <DropdownMenuItem onClick={() => onEdit?.(review.id)}>
                  Edit Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(review.id)}>
                  Delete Review
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onFlag?.(review.id)}>
              <Flag className="h-4 w-4 mr-2" />
              Report Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Review Text */}
      <div className="prose prose-invert max-w-none mb-4">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {review.text}
        </p>
      </div>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {review.images.map((image, index) => (
            <div
              key={index}
              className="aspect-video rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => {
                setSelectedImage(image);
                setImageModalOpen(true);
              }}
            >
              <img
                src={image}
                alt={`Review image ${index + 1}`}
                className="h-full w-full object-cover transition-transform hover:scale-110"
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-xs",
            review.user_marked_helpful && "text-primary"
          )}
          onClick={() => onMarkHelpful?.(review.id)}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
        </Button>

        {reactions.map(({ type, icon: Icon }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs",
              review.user_reaction === type && "text-primary"
            )}
            onClick={() => onReact?.(review.id, type)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        {isCreator && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs ml-auto"
            onClick={() => onReply?.(review.id)}
          >
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </Button>
        )}
      </div>

      {/* Replies */}
      {review.replies && review.replies.length > 0 && (
        <div className="mt-4 pl-6 border-l-2 border-primary/30 space-y-4">
          {review.replies.map((reply) => (
            <div key={reply.id} className="rounded-lg bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <div className="h-full w-full rounded-full bg-gradient-cyan" />
                </Avatar>
                <span className="text-sm font-medium">{reply.user.username}</span>
                <Badge variant="secondary" className="text-xs">
                  Creator
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{reply.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
