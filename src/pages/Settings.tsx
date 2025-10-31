import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    social_github: '',
    social_twitter: '',
    social_youtube: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setFormData({
          username: data.username || '',
          bio: data.bio || '',
          social_github: data.social_github || '',
          social_twitter: data.social_twitter || '',
          social_youtube: data.social_youtube || ''
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        bio: formData.bio,
        social_github: formData.social_github || null,
        social_twitter: formData.social_twitter || null,
        social_youtube: formData.social_youtube || null
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully."
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Card className="p-6 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  minLength={3}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  className="bg-background/50 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <h2 className="text-xl font-semibold mb-4">Social Links</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  type="url"
                  value={formData.social_github}
                  onChange={(e) => setFormData({ ...formData, social_github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  type="url"
                  value={formData.social_twitter}
                  onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                  placeholder="https://twitter.com/username"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={formData.social_youtube}
                  onChange={(e) => setFormData({ ...formData, social_youtube: e.target.value })}
                  placeholder="https://youtube.com/@username"
                  className="bg-background/50"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>

            <Button type="submit" variant="glow" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>

        <Separator className="my-8" />

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-destructive/20">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These actions are irreversible. Please be careful.
          </p>
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            Delete Account
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
