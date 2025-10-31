import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Download, Eye, Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { type CategoryConfig } from '@/config/categories';
import { type CategoryResource } from '@/types/category';
import { formatDistanceToNow } from 'date-fns';

interface CategoryResourceCardProps {
  resource: CategoryResource;
  category: CategoryConfig;
  author?: { username: string; avatar_url?: string };
}

export function CategoryResourceCard({ resource, category, author }: CategoryResourceCardProps) {
  const navigate = useNavigate();
  const Icon = category.icon;

  const renderMetadata = () => {
    return category.metadataDisplay.map((field) => {
      const value = resource.category_metadata[field];
      if (!value) return null;

      return (
        <Badge key={field} variant="outline" className="text-xs">
          {Array.isArray(value) ? value.join(', ') : String(value)}
        </Badge>
      );
    });
  };

  // Layout variations based on category
  const isWideLayout = category.cardLayout === 'wide';
  const isGalleryLayout = category.cardLayout === 'gallery';
  const isCompactLayout = category.cardLayout === 'compact';

  if (isCompactLayout) {
    return (
      <Card
        className="group cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300"
        onClick={() => navigate(`/${category.slug}/${resource.slug}`)}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `hsl(${category.color} / 0.1)` }}
            >
              <Icon className="h-5 w-5" style={{ color: `hsl(${category.color})` }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {resource.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {(resource.downloads || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {(resource.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  if (isGalleryLayout) {
    return (
      <Card
        className="group cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300"
        onClick={() => navigate(`/${category.slug}/${resource.slug}`)}
      >
        {/* Square image */}
        <div className="aspect-square relative overflow-hidden bg-muted">
          {resource.cover_image_url ? (
            <img
              src={resource.cover_image_url}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          {resource.featured && (
            <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm">
              Featured
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {resource.title}
          </h3>

          <div className="flex flex-wrap gap-1">
            {renderMetadata()}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {(resource.downloads || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {(resource.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // Standard or Wide layout
  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300",
        isWideLayout && "md:col-span-2"
      )}
      onClick={() => navigate(`/${category.slug}/${resource.slug}`)}
    >
      <div className={cn("flex", isWideLayout ? "flex-row" : "flex-col")}>
        {/* Image */}
        <div className={cn(
          "relative overflow-hidden bg-muted",
          isWideLayout ? "w-2/5" : "aspect-video"
        )}>
          {resource.cover_image_url ? (
            <img
              src={resource.cover_image_url}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          {resource.featured && (
            <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
              Featured
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className={cn("p-4 space-y-3", isWideLayout && "w-3/5")}>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <Badge variant="outline" className="flex-shrink-0">
                {resource.minecraft_version}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {resource.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {renderMetadata()}
            {resource.minecraft_editions?.map((edition) => (
              <Badge key={edition} variant="secondary" className="text-xs capitalize">
                {edition}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              {author && (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={author.avatar_url} />
                    <AvatarFallback>{author.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{author.username}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {(resource.downloads || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {(resource.views || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {(resource.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
