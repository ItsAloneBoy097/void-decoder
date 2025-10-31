import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  link: string | null;
  icon: string | null;
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev =>
            prev.map(n => (n.id === payload.new.id ? payload.new as Notification : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read" });
  };

  const handleClearAll = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    setNotifications([]);
    toast({ title: "All notifications cleared" });
  };

  const filterNotifications = (type?: string) => {
    if (type === 'all') return notifications;
    if (type === 'mentions') return notifications.filter(n => n.category === 'mention');
    if (type === 'uploads') return notifications.filter(n => n.category === 'upload' || n.category === 'update');
    if (type === 'system') return notifications.filter(n => n.type === 'system');
    return notifications;
  };

  const filteredNotifications = filterNotifications(activeTab);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated with the latest activities
              </p>
            </div>
            <div className="flex gap-2">
              {notifications.some(n => !n.read) && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="outline" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mentions">Mentions</TabsTrigger>
              <TabsTrigger value="uploads">Uploads</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-primary/10">
                {loading ? (
                  <div className="divide-y divide-border/50">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
