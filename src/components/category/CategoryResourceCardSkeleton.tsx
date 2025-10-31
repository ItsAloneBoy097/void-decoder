import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CategoryResourceCardSkeletonProps {
  layout?: 'standard' | 'compact' | 'wide' | 'gallery';
}

export function CategoryResourceCardSkeleton({ layout = 'standard' }: CategoryResourceCardSkeletonProps) {
  if (layout === 'compact') {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </Card>
    );
  }

  if (layout === 'gallery') {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </Card>
    );
  }

  const isWide = layout === 'wide';

  return (
    <Card className={cn(
      "bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden",
      isWide && "md:col-span-2"
    )}>
      <div className={cn("flex", isWide ? "flex-row" : "flex-col")}>
        <Skeleton className={cn(
          isWide ? "w-2/5 h-48" : "aspect-video w-full"
        )} />
        
        <div className={cn("p-4 space-y-3", isWide && "w-3/5")}>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
