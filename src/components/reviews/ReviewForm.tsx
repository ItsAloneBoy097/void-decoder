import { useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  resourceId: string;
  existingRating?: number;
  existingReview?: string;
  existingImages?: string[];
  onSubmit: (data: {
    rating: number;
    text: string;
    images: string[];
  }) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({
  resourceId,
  existingRating = 0,
  existingReview = "",
  existingImages = [],
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(existingRating);
  const [reviewText, setReviewText] = useState(existingReview);
  const [images, setImages] = useState<string[]>(existingImages);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (reviewText.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please write at least 10 characters for your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        text: reviewText.trim(),
        images,
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form
      setRating(0);
      setReviewText("");
      setImages([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="space-y-2">
          <Label htmlFor="rating">Your Rating *</Label>
          <div className="flex items-center gap-4">
            <StarRating
              rating={rating}
              interactive
              onChange={setRating}
              size="lg"
              showValue
            />
            {rating > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRating(0)}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <Label htmlFor="review-text">Your Review *</Label>
          <Textarea
            id="review-text"
            placeholder="Share your experience with this resource... (minimum 10 characters)"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={6}
            maxLength={5000}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {reviewText.length} / 5000 characters
          </p>
        </div>

        {/* Image Upload (Optional) */}
        <div className="space-y-2">
          <Label>Screenshots (Optional)</Label>
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                <img src={image} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors flex items-center justify-center cursor-pointer"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Add up to 5 screenshots to support your review
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="glow"
            disabled={isSubmitting || rating === 0}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : existingRating > 0 ? "Update Review" : "Submit Review"}
          </Button>
          {onCancel && (
            <Button type="button" variant="glass" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
