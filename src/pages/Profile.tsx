import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Star, Upload, Users, Settings, UserPlus, UserMinus, Github, Twitter, Youtube } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  verified: boolean;
  premium: boolean;
  total_uploads: number;
  total_downloads: number;
  total_followers: number;
  average_rating: number;
  social_discord: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
  social_github: string | null;
  created_at: string;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!data) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(data);

      // Check if following
      if (user && !isOwnProfile) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('user_id', user.id)
          .eq('target_id', id)
          .eq('target_type', 'creator')
          .maybeSingle();

        setIsFollowing(!!followData);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id, user, isOwnProfile]);

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow creators",
        variant: "destructive"
      });
      return;
    }

    setFollowLoading(true);

    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', id)
        .eq('target_type', 'creator');

      if (!error) {
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, total_followers: prev.total_followers - 1 } : null);
        toast({ title: "Unfollowed successfully" });
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ 
          user_id: user.id, 
          target_id: id,
          target_type: 'creator'
        });

      if (!error) {
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, total_followers: prev.total_followers + 1 } : null);
        toast({ title: "Following successfully" });
        
        // Create notification for the followed user
        if (id && profile) {
          await supabase.rpc('create_notification', {
            p_user_id: id,
            p_type: 'community',
            p_category: 'new_follower',
            p_title: 'New Follower',
            p_message: `${user.email?.split('@')[0]} started following you`,
            p_link: `/profile/${user.id}`,
            p_icon: 'UserPlus'
          });
        }
      }
    }

    setFollowLoading(false);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Profile not found</h2>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Banner */}
      <div 
        className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5 bg-cover bg-center"
        style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 md:-mt-20 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-glow">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
            <AvatarFallback className="text-3xl bg-gradient-cyan">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{profile.username}</h1>
                {profile.verified && (
                  <Badge variant="default" className="bg-primary">Verified</Badge>
                )}
                {profile.premium && (
                  <Badge variant="default" className="bg-gradient-cyan">Premium</Badge>
                )}
              </div>
              {profile.bio && (
                <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {profile.social_github && (
                  <a href={profile.social_github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {profile.social_twitter && (
                  <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {profile.social_youtube && (
                  <a href={profile.social_youtube} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="glow" onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  variant={isFollowing ? "outline" : "glow"}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Stats & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Uploads
                  </span>
                  <span className="font-semibold">{profile.total_uploads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Downloads
                  </span>
                  <span className="font-semibold">{profile.total_downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Followers
                  </span>
                  <span className="font-semibold">{profile.total_followers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Avg Rating
                  </span>
                  <span className="font-semibold">{profile.average_rating.toFixed(1)} ⭐</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
              <h3 className="font-semibold mb-2">Member Since</h3>
              <p className="text-muted-foreground">
                {new Date(profile.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </Card>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Uploads</h2>
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No resources uploaded yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
