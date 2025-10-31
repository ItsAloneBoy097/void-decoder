import { useState, useEffect } from "react";
import { RatingSummary } from "./RatingSummary";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

interface ReviewSectionProps {
  resourceId: string;
  creatorId: string;
  currentUserId?: string;
}

export function ReviewSection({
  resourceId,
  creatorId,
  currentUserId,
}: ReviewSectionProps) {
  const { toast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState<any>(null);
  const [ratingSummary, setRatingSummary] = useState<any>(null);

  const isCreator = currentUserId === creatorId;

  useEffect(() => {
    loadReviews();
    loadRatingSummary();
    if (currentUserId) {
      loadUserRating();
    }
  }, [resourceId, currentUserId]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          user:user_id (username, avatar_url),
          replies:review_replies (
            *,
            user:user_id (username, avatar_url)
          )
        `)
        .eq("resource_id", resourceId)
        .eq("hidden", false)
        .order("helpful_count", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRatingSummary = async () => {
    try {
      const { data: resource } = await supabase
        .from("resources")
        .select("average_rating, rating_count")
        .eq("id", resourceId)
        .single();

      if (resource) {
        setRatingSummary({
          averageRating: resource.average_rating || 0,
          totalRatings: resource.rating_count || 0,
        });
      }
    } catch (error) {
      console.error("Error loading rating summary:", error);
    }
  };

  const loadUserRating = async () => {
    if (!currentUserId) return;

    try {
      const { data } = await supabase
        .from("ratings")
        .select("*")
        .eq("resource_id", resourceId)
        .eq("user_id", currentUserId)
        .maybeSingle();

      setUserRating(data);
    } catch (error) {
      console.error("Error loading user rating:", error);
    }
  };

  const handleSubmitReview = async (reviewData: {
    rating: number;
    text: string;
    images: string[];
  }) => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, create or update rating
      const { data: ratingData, error: ratingError } = await supabase
        .from("ratings")
        .upsert({
          user_id: currentUserId,
          resource_id: resourceId,
          score: reviewData.rating,
        })
        .select()
        .single();

      if (ratingError) throw ratingError;

      // Then create or update review
      const { error: reviewError } = await supabase
        .from("reviews")
        .upsert({
          rating_id: ratingData.id,
          user_id: currentUserId,
          resource_id: resourceId,
          text: reviewData.text,
          images: reviewData.images,
        });

      if (reviewError) throw reviewError;

      // Create notification for resource creator
      if (creatorId !== currentUserId) {
        const { data: resource } = await supabase
          .from('resources')
          .select('title')
          .eq('id', resourceId)
          .single();

        if (resource) {
          await supabase.rpc('create_notification', {
            p_user_id: creatorId,
            p_type: 'community',
            p_category: 'comment',
            p_title: 'New Review',
            p_message: `Someone reviewed ${resource.title} with ${reviewData.rating} stars`,
            p_link: `/resource/${resourceId}`,
            p_icon: 'star'
          });
        }
      }

      // Reload data
      await loadReviews();
      await loadRatingSummary();
      await loadUserRating();
      setShowReviewForm(false);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to mark reviews as helpful.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("review_helpful")
        .upsert({
          review_id: reviewId,
          user_id: currentUserId,
        });

      if (error) throw error;
      await loadReviews();
    } catch (error) {
      console.error("Error marking review helpful:", error);
    }
  };

  const handleReact = async (reviewId: string, reactionType: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from("review_reactions")
        .upsert({
          review_id: reviewId,
          user_id: currentUserId,
          reaction_type: reactionType,
        });

      if (error) throw error;
      await loadReviews();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      {ratingSummary && (
        <RatingSummary
          averageRating={ratingSummary.averageRating}
          totalRatings={ratingSummary.totalRatings}
          isLoading={!ratingSummary}
        />
      )}

      {/* Review Form Toggle */}
      {!isCreator && currentUserId && !showReviewForm && (
        <Button
          variant="glow"
          onClick={() => setShowReviewForm(true)}
          className="w-full"
        >
          <Star className="h-5 w-5 mr-2" />
          {userRating ? "Update Your Review" : "Write a Review"}
        </Button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          resourceId={resourceId}
          existingRating={userRating?.score || 0}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Review List */}
      <ReviewList
        reviews={reviews}
        isLoading={isLoading}
        isCreator={isCreator}
        currentUserId={currentUserId}
        onMarkHelpful={handleMarkHelpful}
        onReact={handleReact}
      />
    </div>
  );
}
