import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useFollows } from "@/hooks/useFollows";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetId: string;
  targetType: 'creator' | 'resource' | 'tag';
  variant?: 'default' | 'outline' | 'glow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showCount?: boolean;
}

export function FollowButton({
  targetId,
  targetType,
  variant = 'glow',
  size = 'default',
  className,
  showIcon = true,
  showCount = false
}: FollowButtonProps) {
  const { isFollowing, followerCount, loading, toggleFollow } = useFollows({
    targetId,
    targetType
  });

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={toggleFollow}
      className={cn(
        "transition-all duration-200",
        isFollowing && "hover:border-destructive hover:text-destructive",
        className
      )}
    >
      {showIcon && (
        isFollowing ? (
          <UserMinus className="h-4 w-4 mr-2" />
        ) : (
          <UserPlus className="h-4 w-4 mr-2" />
        )
      )}
      {isFollowing ? 'Unfollow' : 'Follow'}
      {showCount && followerCount > 0 && (
        <span className="ml-2 text-xs opacity-70">
          ({followerCount})
        </span>
      )}
    </Button>
  );
}
