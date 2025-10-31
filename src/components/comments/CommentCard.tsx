import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, ThumbsUp, Smile, Laugh, ThumbsDown, Flag, Edit, Trash2, Pin, Lock, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CommentForm } from './CommentForm';

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

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  isCreator: boolean;
  isModerator: boolean;
  onReply: (commentId: string, text: string) => Promise<void>;
  onEdit: (commentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReact: (commentId: string, emoji: string) => Promise<void>;
  onReport: (commentId: string, reason: string) => Promise<void>;
  onTogglePin?: (commentId: string) => Promise<void>;
  onToggleLock?: (commentId: string) => Promise<void>;
  onLoadReplies?: (commentId: string) => Promise<void>;
}

const reactionEmojis = [
  { emoji: '❤️', icon: Heart },
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '😮', icon: Smile },
  { emoji: '😂', icon: Laugh },
  { emoji: '👎', icon: ThumbsDown },
];

export function CommentCard({
  comment,
  currentUserId,
  isCreator,
  isModerator,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onReport,
  onTogglePin,
  onToggleLock,
  onLoadReplies,
}: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.text);

  const isOwner = currentUserId === comment.user_id;
  const canModerate = isModerator || isCreator;

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    await onReply(comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
    setShowReplies(true);
  };

  const handleEditSubmit = async () => {
    if (!editText.trim() || editText === comment.text) {
      setIsEditing(false);
      return;
    }
    await onEdit(comment.id, editText);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(comment.id);
    setShowDeleteDialog(false);
  };

  const handleToggleReplies = async () => {
    if (!showReplies && onLoadReplies && !comment.replies) {
      await onLoadReplies(comment.id);
    }
    setShowReplies(!showReplies);
  };

  const getUserReaction = (emoji: string) => {
    return comment.user_reactions?.some(r => r.emoji === emoji);
  };

  if (comment.deleted) {
    return (
      <div className="flex gap-3 opacity-50">
        <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
        <div className="flex-1 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground italic">This comment was removed</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${comment.pinned ? 'border-l-2 border-primary pl-3' : ''}`}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={comment.profiles.avatar_url || undefined} />
        <AvatarFallback>{comment.profiles.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{comment.profiles.username}</span>
            {comment.profiles.verified && (
              <Badge variant="secondary" className="h-5 text-xs">Verified</Badge>
            )}
            {comment.profiles.premium && (
              <Badge variant="default" className="h-5 text-xs bg-primary/20">Premium</Badge>
            )}
            {comment.pinned && (
              <Badge variant="outline" className="h-5 text-xs">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
            {comment.locked && (
              <Badge variant="outline" className="h-5 text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.edited && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>

          {currentUserId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {canModerate && (
                  <>
                    {isOwner && <DropdownMenuSeparator />}
                    {onTogglePin && (
                      <DropdownMenuItem onClick={() => onTogglePin(comment.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {comment.pinned ? 'Unpin' : 'Pin'} Comment
                      </DropdownMenuItem>
                    )}
                    {onToggleLock && (
                      <DropdownMenuItem onClick={() => onToggleLock(comment.id)}>
                        <Lock className="h-4 w-4 mr-2" />
                        {comment.locked ? 'Unlock' : 'Lock'} Thread
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {!isOwner && (
                  <>
                    {(isOwner || canModerate) && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={() => onReport(comment.id, 'inappropriate')}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <CommentForm
              value={editText}
              onChange={setEditText}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditing(false);
                setEditText(comment.text);
              }}
              placeholder="Edit your comment..."
              submitLabel="Save"
              isEditing
            />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {reactionEmojis.map(({ emoji, icon: Icon }) => {
            const hasReacted = getUserReaction(emoji);
            return (
              <Button
                key={emoji}
                variant={hasReacted ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 gap-1"
                onClick={() => currentUserId && onReact(comment.id, emoji)}
                disabled={!currentUserId}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs">{emoji}</span>
              </Button>
            );
          })}

          {currentUserId && !comment.locked && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs">Reply</span>
            </Button>
          )}

          {comment.reply_count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1"
              onClick={handleToggleReplies}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs">
                {showReplies ? 'Hide' : 'Show'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
              </span>
            </Button>
          )}
        </div>

        {isReplying && (
          <div className="mt-3 ml-4 pl-4 border-l-2 border-border">
            <CommentForm
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReplySubmit}
              onCancel={() => {
                setIsReplying(false);
                setReplyText('');
              }}
              placeholder="Write a reply..."
              submitLabel="Reply"
            />
          </div>
        )}

        {showReplies && comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 ml-4 pl-4 border-l-2 border-border">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                isCreator={isCreator}
                isModerator={isModerator}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReact={onReact}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
