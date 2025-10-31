import { Skeleton } from "@/components/ui/skeleton";

export function ResourceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image Skeleton */}
      <div className="relative h-64 md:h-96 lg:h-[500px] w-full">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Meta */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-32" />
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Gallery */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video w-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Download Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Author Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-3">
                <Skeleton className="h-6 w-32" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
