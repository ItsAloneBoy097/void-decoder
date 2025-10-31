import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { type CategoryConfig } from '@/config/categories';

interface CategoryCardProps {
  category: CategoryConfig;
  resourceCount?: number;
}

export function CategoryCard({ category, resourceCount = 0 }: CategoryCardProps) {
  const navigate = useNavigate();
  const Icon = category.icon;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "bg-card/50 backdrop-blur-sm border-border/50",
        "hover:border-primary/50 hover:shadow-glow hover:scale-105"
      )}
      onClick={() => navigate(`/${category.slug}`)}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, hsl(${category.color} / 0.1) 0%, transparent 100%)`
        }}
      />

      <div className="relative p-6 space-y-4">
        {/* Icon and title */}
        <div className="flex items-start justify-between">
          <div 
            className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `hsl(${category.color} / 0.1)`,
              boxShadow: `0 0 20px hsl(${category.color} / 0.2)`
            }}
          >
            <Icon 
              className="h-8 w-8 transition-all duration-300" 
              style={{ color: `hsl(${category.color})` }}
            />
          </div>
          
          {resourceCount > 0 && (
            <Badge variant="secondary" className="font-mono">
              {resourceCount.toLocaleString()}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
            {category.label}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        </div>

        {/* Action */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full group-hover:bg-primary/10"
        >
          Browse {category.label}
          <span className="inline-block group-hover:translate-x-1 transition-transform ml-1">→</span>
        </Button>
      </div>
    </Card>
  );
}
