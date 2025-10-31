import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommentCard } from './CommentCard';
import { CommentListSkeleton } from './CommentSkeleton';

interface Comment {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
  edited: boolean;
  pinned: boolean;
  locked: boolean;
  deleted: boolean;
  reaction_count: number;
  reply_count: number;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    verified: boolean;
    premium: boolean;
  };
  user_reactions?: Array<{ emoji: string }>;
  replies?: Comment[];
}

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  currentUserId?: string;
  isCreator: boolean;
  isModerator: boolean;
  hasMore: boolean;
  onReply: (commentId: string, text: string) => Promise<void>;
  onEdit: (commentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReact: (commentId: string, emoji: string) => Promise<void>;
  onReport: (commentId: string, reason: string) => Promise<void>;
  onTogglePin?: (commentId: string) => Promise<void>;
  onToggleLock?: (commentId: string) => Promise<void>;
  onLoadReplies?: (commentId: string) => Promise<void>;
  onLoadMore?: () => void;
  onSortChange?: (sort: string) => void;
}

export function CommentList({
  comments,
  isLoading,
  currentUserId,
  isCreator,
  isModerator,
  hasMore,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onReport,
  onTogglePin,
  onToggleLock,
  onLoadReplies,
  onLoadMore,
  onSortChange,
}: CommentListProps) {
  const [sortBy, setSortBy] = useState('newest');

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    onSortChange?.(sort);
  };

  if (isLoading) {
    return <CommentListSkeleton />;
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  // Separate pinned and regular comments
  const pinnedComments = comments.filter(c => c.pinned);
  const regularComments = comments.filter(c => !c.pinned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        
        {onSortChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'most_liked' ? 'Most Liked' : 'Most Replies'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('most_liked')}>
                Most Liked
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('most_replies')}>
                Most Replies
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="space-y-6">
        {pinnedComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            isCreator={isCreator}
            isModerator={isModerator}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={onReact}
            onReport={onReport}
            onTogglePin={onTogglePin}
            onToggleLock={onToggleLock}
            onLoadReplies={onLoadReplies}
          />
        ))}

        {regularComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            isCreator={isCreator}
            isModerator={isModerator}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={onReact}
            onReport={onReport}
            onTogglePin={onTogglePin}
            onToggleLock={onToggleLock}
            onLoadReplies={onLoadReplies}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
}
