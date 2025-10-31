import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useFeed, FeedType } from "@/hooks/useFeed";
import { FeedCard } from "@/components/feed/FeedCard";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Sparkles, TrendingUp, Users, Clock, Star } from "lucide-react";

export default function Feed() {
  const [feedType, setFeedType] = useState<FeedType>("for-you");
  const { resources, loading, error, hasMore, loadMore, refresh } = useFeed(feedType);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const filteredResources = resources.filter(r => !dismissedIds.includes(r.id));

  const tabs = [
    { value: "for-you", label: "For You", icon: Sparkles },
    { value: "trending", label: "Trending", icon: TrendingUp },
    { value: "following", label: "Following", icon: Users },
    { value: "new", label: "New", icon: Clock },
    { value: "top-rated", label: "Top Rated", icon: Star },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-br from-background to-card">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex items-center justify-between mb-6 animate-fade-in-down">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Your <span className="bg-gradient-cyan bg-clip-text text-transparent">Feed</span>
                </h1>
                <p className="text-muted-foreground">
                  Personalized content just for you
                </p>
              </div>
              <Button
                variant="glass"
                size="icon"
                onClick={refresh}
                disabled={loading}
                className="group"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={feedType} onValueChange={(v) => setFeedType(v as FeedType)} className="animate-fade-in">
              <TabsList className="w-full justify-start overflow-x-auto bg-card/50 backdrop-blur-sm">
                {tabs.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="gap-2 data-[state=active]:bg-gradient-cyan data-[state=active]:text-primary-foreground transition-all duration-300"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Feed Content */}
        <section className="container mx-auto px-4 md:px-6 py-8">
          {error && (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={refresh} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!error && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredResources.map((resource, i) => (
                  <div
                    key={resource.id}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <FeedCard resource={resource} onDismiss={handleDismiss} />
                  </div>
                ))}
                
                {loading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <FeedSkeleton key={`skeleton-${i}`} />
                  ))}
              </div>

              {!loading && filteredResources.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No content yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {feedType === "following"
                      ? "Follow creators to see their content here"
                      : "Check back later for personalized recommendations"}
                  </p>
                </div>
              )}

              {hasMore && !loading && filteredResources.length > 0 && (
                <div className="text-center mt-8 animate-fade-in">
                  <Button
                    onClick={loadMore}
                    variant="glow"
                    size="lg"
                    className="group"
                  >
                    Load More
                    <span className="inline-block group-hover:translate-x-1 transition-transform ml-2">
                      →
                    </span>
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
