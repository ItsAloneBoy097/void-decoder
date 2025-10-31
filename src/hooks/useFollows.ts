import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

type FollowTargetType = 'creator' | 'resource' | 'tag';

interface UseFollowsProps {
  targetId: string;
  targetType: FollowTargetType;
}

export function useFollows({ targetId, targetType }: UseFollowsProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    checkFollowStatus();
    fetchFollowerCount();
  }, [targetId, targetType, user]);

  const checkFollowStatus = async () => {
    if (!user || !targetId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .maybeSingle();

      if (!error) {
        setIsFollowing(!!data);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowerCount = async () => {
    if (!targetId) return;

    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', targetId)
        .eq('target_type', targetType);

      if (!error && count !== null) {
        setFollowerCount(count);
      }
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('target_id', targetId)
          .eq('target_type', targetType);

        if (!error) {
          setIsFollowing(false);
          setFollowerCount(prev => Math.max(0, prev - 1));
          toast({ title: "Unfollowed successfully" });
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: user.id,
            target_id: targetId,
            target_type: targetType
          });

        if (!error) {
          setIsFollowing(true);
          setFollowerCount(prev => prev + 1);
          toast({ title: "Following successfully" });
        } else if (error.code === '23505') {
          // Already following
          setIsFollowing(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    isFollowing,
    followerCount,
    loading,
    toggleFollow
  };
}
