import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { CommentListSkeleton } from './CommentSkeleton';

interface CommentSectionProps {
  resourceId: string;
  creatorId: string;
}

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
  parent_id: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
    verified: boolean;
    premium: boolean;
  };
  user_reactions?: Array<{ emoji: string }>;
  replies?: Comment[];
}

export function CommentSection({ resourceId, creatorId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [userRole, setUserRole] = useState<string | null>(null);

  const isCreator = user?.id === creatorId;
  const isModerator = userRole === 'moderator' || userRole === 'admin';

  useEffect(() => {
    if (user) {
      loadUserRole();
    }
    loadComments();
  }, [resourceId, user, sortBy]);

  const loadUserRole = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserRole(data.role);
    }
  };

  const loadComments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey (
            username,
            avatar_url,
            verified,
            premium
          )
        `)
        .eq('resource_id', resourceId)
        .is('parent_id', null)
        .eq('deleted', false);

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_liked':
          query = query.order('reaction_count', { ascending: false });
          break;
        case 'most_replies':
          query = query.order('reply_count', { ascending: false });
          break;
        default:
          query = query.order('pinned', { ascending: false }).order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Load user reactions if logged in
      if (user && data) {
        const commentIds = data.map(c => c.id);
        const { data: reactions } = await supabase
          .from('comment_reactions')
          .select('comment_id, emoji')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const commentsWithReactions = data.map(comment => ({
          ...comment,
          user_reactions: reactions?.filter(r => r.comment_id === comment.id) || []
        }));

        setComments(commentsWithReactions as any);
      } else {
        setComments(data as any || []);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading comments',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadReplies = async (commentId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey (
            username,
            avatar_url,
            verified,
            premium
          )
        `)
        .eq('parent_id', commentId)
        .eq('deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Load user reactions for replies
      if (user && data) {
        const replyIds = data.map(r => r.id);
        const { data: reactions } = await supabase
          .from('comment_reactions')
          .select('comment_id, emoji')
          .eq('user_id', user.id)
          .in('comment_id', replyIds);

        const repliesWithReactions = data.map(reply => ({
          ...reply,
          user_reactions: reactions?.filter(r => r.comment_id === reply.id) || []
        }));

        setComments(prev =>
          prev.map(c =>
            c.id === commentId ? { ...c, replies: repliesWithReactions as any } : c
          )
        );
      } else {
        setComments(prev =>
          prev.map(c =>
            c.id === commentId ? { ...c, replies: data as any } : c
          )
        );
      }
    } catch (error: any) {
      toast({
        title: 'Error loading replies',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handlePostComment = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to post a comment',
        variant: 'destructive'
      });
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          resource_id: resourceId,
          user_id: user.id,
          text: commentText.trim(),
          parent_id: null
        });

      if (error) throw error;

      // Create notification for resource creator
      if (creatorId !== user.id) {
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
            p_title: 'New Comment',
            p_message: `Someone commented on ${resource.title}`,
            p_link: `/resource/${resourceId}`,
            p_icon: 'message-circle'
          });
        }
      }

      toast({
        title: 'Comment posted',
        description: 'Your comment has been published'
      });

      setCommentText('');
      loadComments();
    } catch (error: any) {
      toast({
        title: 'Error posting comment',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, text: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          resource_id: resourceId,
          user_id: user.id,
          parent_id: parentId,
          text: text.trim()
        });

      if (error) throw error;

      // Notify parent comment author
      const parentComment = comments.find(c => c.id === parentId);
      if (parentComment && parentComment.user_id !== user.id) {
        await supabase.rpc('create_notification', {
          p_user_id: parentComment.user_id,
          p_type: 'community',
          p_category: 'reply',
          p_title: 'New Reply',
          p_message: 'Someone replied to your comment',
          p_link: `/resource/${resourceId}`,
          p_icon: 'message-circle'
        });
      }

      toast({
        title: 'Reply posted',
        description: 'Your reply has been published'
      });

      loadComments();
      loadReplies(parentId);
    } catch (error: any) {
      toast({
        title: 'Error posting reply',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = async (commentId: string, text: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          text: text.trim(),
          edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Comment updated',
        description: 'Your changes have been saved'
      });

      loadComments();
    } catch (error: any) {
      toast({
        title: 'Error updating comment',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ deleted: true })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Comment deleted',
        description: 'Your comment has been removed'
      });

      loadComments();
    } catch (error: any) {
      toast({
        title: 'Error deleting comment',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleReact = async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this emoji
      const { data: existing } = await supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            emoji
          });

        if (error) throw error;
      }

      loadComments();
    } catch (error: any) {
      toast({
        title: 'Error reacting to comment',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleReport = async (commentId: string, reason: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason
        });

      if (error) throw error;

      toast({
        title: 'Comment reported',
        description: 'Thank you for helping keep our community safe'
      });
    } catch (error: any) {
      toast({
        title: 'Error reporting comment',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleTogglePin = async (commentId: string) => {
    if (!isCreator && !isModerator) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      const { error } = await supabase
        .from('comments')
        .update({ pinned: !comment?.pinned })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: comment?.pinned ? 'Comment unpinned' : 'Comment pinned',
        description: comment?.pinned ? 'Comment is no longer pinned' : 'Comment has been pinned to the top'
      });

      loadComments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleToggleLock = async (commentId: string) => {
    if (!isCreator && !isModerator) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      const { error } = await supabase
        .from('comments')
        .update({ locked: !comment?.locked })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: comment?.locked ? 'Thread unlocked' : 'Thread locked',
        description: comment?.locked ? 'Replies are now allowed' : 'No more replies can be added'
      });

      loadComments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Comments</h2>
      </div>

      {user ? (
        <div className="mb-6">
          <CommentForm
            value={commentText}
            onChange={setCommentText}
            onSubmit={handlePostComment}
            placeholder="Share your thoughts..."
            submitLabel="Post Comment"
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Sign in to join the discussion
          </p>
          <Button size="sm">Sign In</Button>
        </div>
      )}

      <Separator className="my-6" />

      {isLoading ? (
        <CommentListSkeleton />
      ) : (
        <CommentList
          comments={comments}
          isLoading={isLoading}
          currentUserId={user?.id}
          isCreator={isCreator}
          isModerator={isModerator}
          hasMore={false}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReact={handleReact}
          onReport={handleReport}
          onTogglePin={handleTogglePin}
          onToggleLock={handleToggleLock}
          onLoadReplies={loadReplies}
          onSortChange={setSortBy}
        />
      )}
    </Card>
  );
}
