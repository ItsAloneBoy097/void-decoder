import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceCardSkeleton } from "@/components/resources/ResourceCardSkeleton";
import { TrendingUp, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { mockResources } from "@/data/mockData";

const trendingResources = mockResources;

export default function Trending() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-br from-background to-card">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-cyan bg-clip-text text-transparent">Trending</span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              Explore the most popular resources right now
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="mb-8 bg-card/50 backdrop-blur-sm border border-primary/10">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-0">
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)
                  : trendingResources.map((resource) => (
                      <ResourceCard key={resource.id} {...resource} />
                    ))}
              </div>
            </TabsContent>

            <TabsContent value="week" className="mt-0">
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)
                  : trendingResources.map((resource) => (
                      <ResourceCard key={`week-${resource.id}`} {...resource} />
                    ))}
              </div>
            </TabsContent>

            <TabsContent value="month" className="mt-0">
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)
                  : trendingResources.map((resource) => (
                      <ResourceCard key={`month-${resource.id}`} {...resource} />
                    ))}
              </div>
            </TabsContent>

            <TabsContent value="alltime" className="mt-0">
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)
                  : trendingResources.map((resource) => (
                      <ResourceCard key={`alltime-${resource.id}`} {...resource} />
                    ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
