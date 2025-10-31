import { Link } from "react-router-dom";
import { Download, Star, Eye, X, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeedResource } from "@/hooks/useFeed";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { toast } from "@/hooks/use-toast";

interface FeedCardProps {
  resource: FeedResource;
  onDismiss?: (id: string) => void;
}

export function FeedCard({ resource, onDismiss }: FeedCardProps) {
  const { trackActivity, dismissResource } = useActivityTracker();

  const handleClick = () => {
    trackActivity(resource.id, 'view');
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.preventDefault();
    await dismissResource(resource.id);
    onDismiss?.(resource.id);
    toast({
      title: "Resource hidden",
      description: "This resource won't appear in your feed anymore",
    });
  };

  return (
    <TooltipProvider>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-glow hover:-translate-y-1 animate-fade-in">
        {/* Dismiss Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <X className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDismiss}>
              <X className="h-4 w-4 mr-2" />
              Not interested
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          to={`/resource/${resource.id}`}
          onClick={handleClick}
        >
          {/* Featured Badge */}
          {resource.featured && (
            <div className="absolute left-3 top-3 z-10">
              <Badge className="bg-gradient-cyan text-primary-foreground font-semibold shadow-glow">
                Featured
              </Badge>
            </div>
          )}

          {/* Recommendation Badge */}
          {resource.recommendation_reason && (
            <div className="absolute right-3 top-3 z-10">
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="gap-1">
                    <Info className="h-3 w-3" />
                    Recommended
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{resource.recommendation_reason}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Image - using placeholder for now */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {resource.type}
                </Badge>
                {resource.profiles?.verified && (
                  <Badge variant="default" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {resource.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-help">
                      <Download className="h-4 w-4" />
                      <span>{formatNumber(resource.total_downloads)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{resource.total_downloads.toLocaleString()} downloads</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-help">
                      <Eye className="h-4 w-4" />
                      <span>{formatNumber(resource.total_views)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{resource.total_views.toLocaleString()} views</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-primary hover:scale-110 transition-transform cursor-help">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{resource.average_rating.toFixed(1)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{resource.average_rating.toFixed(2)} / 5.0 rating</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <div className="h-6 w-6 rounded-full bg-gradient-cyan" />
              <span className="text-sm text-muted-foreground">
                by {resource.profiles?.username || 'Unknown'}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </TooltipProvider>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
