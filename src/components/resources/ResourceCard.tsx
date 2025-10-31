import { Link } from "react-router-dom";
import { Download, Star, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  downloads: number;
  rating: number;
  views: number;
  author: string;
  version: string;
  featured?: boolean;
}

export function ResourceCard({
  id,
  title,
  description,
  image,
  category,
  downloads,
  rating,
  views,
  author,
  version,
  featured = false,
}: ResourceCardProps) {
  return (
    <TooltipProvider>
      <Link
        to={`/resource/${id}`}
        className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-glow hover:-translate-y-1 animate-fade-in"
      >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute left-3 top-3 z-10">
          <Badge className="bg-gradient-cyan text-primary-foreground font-semibold shadow-glow">
            Featured
          </Badge>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Category */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
            <span className="text-xs text-muted-foreground">{version}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-help">
                  <Download className="h-4 w-4" />
                  <span>{formatNumber(downloads)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{downloads.toLocaleString()} downloads</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-help">
                  <Eye className="h-4 w-4" />
                  <span>{formatNumber(views)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{views.toLocaleString()} views</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-primary hover:scale-110 transition-transform cursor-help">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{rating.toFixed(2)} / 5.0 rating</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="h-6 w-6 rounded-full bg-gradient-cyan" />
          <span className="text-sm text-muted-foreground">by {author}</span>
        </div>
      </div>
      </Link>
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
