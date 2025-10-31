import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type FeedType = 'for-you' | 'trending' | 'following' | 'new' | 'top-rated';

export interface FeedResource {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  creator_id: string;
  average_rating: number;
  total_downloads: number;
  total_views: number;
  featured: boolean;
  created_at: string;
  published_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    verified: boolean;
  };
  recommendation_score?: number;
  recommendation_reason?: string;
  trending_score?: number;
}

export function useFeed(type: FeedType) {
  const { user, session } = useAuth();
  const [resources, setResources] = useState<FeedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async (pageNum: number = 0, refresh: boolean = false) => {
    if (!user || !session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('generate-feed', {
        body: { 
          type,
          page: pageNum,
          limit: 20
        },
      });

      if (functionError) throw functionError;

      if (refresh) {
        setResources(data.resources || []);
      } else {
        setResources(prev => [...prev, ...(data.resources || [])]);
      }
      
      setHasMore(data.hasMore || false);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error fetching feed:', err);
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(0, true);
  }, [type, user]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchFeed(page + 1, false);
    }
  };

  const refresh = () => {
    setResources([]);
    setPage(0);
    setHasMore(true);
    fetchFeed(0, true);
  };

  return {
    resources,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
