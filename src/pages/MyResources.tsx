import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadWizard } from '@/components/upload/UploadWizard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Upload, MoreVertical, Edit, Trash, Eye, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  title: string;
  type: string;
  visibility: string;
  total_downloads: number;
  total_views: number;
  created_at: string;
  updated_at: string;
}

export default function MyResources() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchResources();
  }, [user, navigate]);

  const fetchResources = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading resources",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setResources(data || []);
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting resource",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Resource deleted",
        description: "Your resource has been deleted successfully."
      });
      fetchResources();
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Resources</h1>
            <p className="text-muted-foreground mt-1">
              Manage your uploaded resources
            </p>
          </div>
          <Button variant="glow" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Resource
          </Button>
        </div>

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-primary/10">
            <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No resources yet</h3>
            <p className="text-muted-foreground mb-6">
              Start sharing your creations with the Minecraft community
            </p>
            <Button variant="glow" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Resource
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card
                key={resource.id}
                className="p-6 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="capitalize">
                    {resource.type.replace('_', ' ')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-primary/20">
                      <DropdownMenuItem onClick={() => navigate(`/resource/${resource.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/resource/${resource.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(resource.id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {resource.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {resource.total_downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {resource.total_views}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                  <Badge variant={resource.visibility === 'public' ? 'default' : 'outline'}>
                    {resource.visibility}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(resource.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Wizard */}
      <UploadWizard open={uploadOpen} onOpenChange={setUploadOpen} />
    </AppLayout>
  );
}
