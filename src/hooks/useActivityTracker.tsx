import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ActivityType = 'view' | 'download' | 'like' | 'rate' | 'comment' | 'dismiss';

export function useActivityTracker() {
  const { user, session } = useAuth();

  const trackActivity = useCallback(async (
    resourceId: string,
    actionType: ActivityType,
    weight: number = 1.0
  ) => {
    if (!user || !session) return;

    try {
      await supabase.functions.invoke('track-activity', {
        body: {
          resource_id: resourceId,
          action_type: actionType,
          weight,
        },
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user, session]);

  const dismissResource = useCallback(async (resourceId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('dismissed_resources')
        .insert({
          user_id: user.id,
          resource_id: resourceId,
        });

      await trackActivity(resourceId, 'dismiss');
    } catch (error) {
      console.error('Error dismissing resource:', error);
    }
  }, [user, trackActivity]);

  return {
    trackActivity,
    dismissResource,
  };
}
