import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Volume2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationPreferences {
  in_app_enabled: boolean;
  email_enabled: boolean;
  sound_enabled: boolean;
  category_system: boolean;
  category_creator: boolean;
  category_community: boolean;
  category_moderation: boolean;
  event_new_upload: boolean;
  event_resource_update: boolean;
  event_comments: boolean;
  event_mentions: boolean;
  event_reviews: boolean;
  event_reactions: boolean;
  event_milestones: boolean;
  email_frequency: string;
  do_not_disturb_until: string | null;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    in_app_enabled: true,
    email_enabled: true,
    sound_enabled: false,
    category_system: true,
    category_creator: true,
    category_community: true,
    category_moderation: true,
    event_new_upload: true,
    event_resource_update: true,
    event_comments: true,
    event_mentions: true,
    event_reviews: true,
    event_reactions: false,
    event_milestones: true,
    email_frequency: 'instant',
    do_not_disturb_until: null
  });

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data as NotificationPreferences);
      } else {
        // Create default preferences
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: "Preferences saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const setDoNotDisturb = (hours: number) => {
    const dndUntil = new Date();
    dndUntil.setHours(dndUntil.getHours() + hours);
    updatePreference('do_not_disturb_until', dndUntil.toISOString());
  };

  const clearDoNotDisturb = () => {
    updatePreference('do_not_disturb_until', null);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
            <p className="text-muted-foreground">
              Manage how you receive notifications
            </p>
          </div>
          <Button onClick={savePreferences} disabled={saving} variant="glow">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">General</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications in the app
                  </p>
                </div>
                <Switch
                  checked={preferences.in_app_enabled}
                  onCheckedChange={(checked) => updatePreference('in_app_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for new notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.sound_enabled}
                  onCheckedChange={(checked) => updatePreference('sound_enabled', checked)}
                />
              </div>
            </div>
          </Card>

          {/* Email Settings */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Email Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={preferences.email_enabled}
                  onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
                />
              </div>

              {preferences.email_enabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Email Frequency</Label>
                    <Select
                      value={preferences.email_frequency}
                      onValueChange={(value) => updatePreference('email_frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Do Not Disturb */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Do Not Disturb</h2>
            </div>
            <div className="space-y-4">
              {preferences.do_not_disturb_until ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Active until {new Date(preferences.do_not_disturb_until).toLocaleString()}
                  </p>
                  <Button variant="outline" onClick={clearDoNotDisturb}>
                    Clear
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={() => setDoNotDisturb(1)}>
                    1 hour
                  </Button>
                  <Button variant="outline" onClick={() => setDoNotDisturb(4)}>
                    4 hours
                  </Button>
                  <Button variant="outline" onClick={() => setDoNotDisturb(8)}>
                    8 hours
                  </Button>
                  <Button variant="outline" onClick={() => setDoNotDisturb(24)}>
                    24 hours
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Categories */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <h2 className="text-xl font-semibold mb-4">Notification Categories</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System</Label>
                  <p className="text-sm text-muted-foreground">
                    Platform announcements and updates
                  </p>
                </div>
                <Switch
                  checked={preferences.category_system}
                  onCheckedChange={(checked) => updatePreference('category_system', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Creator Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    New uploads and resource updates
                  </p>
                </div>
                <Switch
                  checked={preferences.category_creator}
                  onCheckedChange={(checked) => updatePreference('category_creator', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Community</Label>
                  <p className="text-sm text-muted-foreground">
                    Comments, replies, and mentions
                  </p>
                </div>
                <Switch
                  checked={preferences.category_community}
                  onCheckedChange={(checked) => updatePreference('category_community', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Warnings and moderation actions
                  </p>
                </div>
                <Switch
                  checked={preferences.category_moderation}
                  onCheckedChange={(checked) => updatePreference('category_moderation', checked)}
                />
              </div>
            </div>
          </Card>

          {/* Event Types */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <h2 className="text-xl font-semibold mb-4">Event Types</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>New Uploads from Followed Creators</Label>
                <Switch
                  checked={preferences.event_new_upload}
                  onCheckedChange={(checked) => updatePreference('event_new_upload', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label>Resource Updates</Label>
                <Switch
                  checked={preferences.event_resource_update}
                  onCheckedChange={(checked) => updatePreference('event_resource_update', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label>Comments & Replies</Label>
                <Switch
                  checked={preferences.event_comments}
                  onCheckedChange={(checked) => updatePreference('event_comments', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label>Mentions</Label>
                <Switch
                  checked={preferences.event_mentions}
                  onCheckedChange={(checked) => updatePreference('event_mentions', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label>Reviews</Label>
                <Switch
                  checked={preferences.event_reviews}
                  onCheckedChange={(checked) => updatePreference('event_reviews', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label>Reactions</Label>
                <Switch
                  checked={preferences.event_reactions}
                  onCheckedChange={(checked) => updatePreference('event_reactions', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label>Milestones & Achievements</Label>
                <Switch
                  checked={preferences.event_milestones}
                  onCheckedChange={(checked) => updatePreference('event_milestones', checked)}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={savePreferences} disabled={saving} variant="glow" size="lg">
            {saving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
