import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceCardSkeleton } from "@/components/resources/ResourceCardSkeleton";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, Clock, Zap, Rocket } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

import { mockResources } from "@/data/mockData";

const featuredResources = mockResources.filter(r => r.featured).slice(0, 3);
const trendingResources = mockResources.slice(3);

export default function Index() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative border-b border-border overflow-hidden">
  <div className="absolute inset-0">
    <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
    <div className="absolute inset-0 bg-gradient-cyan-glow opacity-20 animate-pulse" />
  </div>
  <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative">
    <div className="mx-auto max-w-4xl text-center space-y-4 md:space-y-6">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight animate-fade-in-down">
        Discover Amazing
        <span className="block bg-gradient-cyan bg-clip-text text-transparent mt-2">
          Minecraft Resources
        </span>
      </h1>
      <p className="text-base md:text-xl text-muted-foreground px-4 animate-fade-in">
        Explore thousands of maps, mods, plugins, shaders, and more from the community
      </p>
      <div className="flex justify-center pt-4 animate-scale-in">
        <SearchBar />
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-4 px-4 animate-fade-in-up">
        <Button 
          variant="glow" 
          size="lg" 
          className="w-full sm:w-auto group"
          onClick={() => navigate('/explore')}
        >
          <Rocket className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-y-[-2px] transition-transform" />
          Explore Now
        </Button>
        <Button 
          variant="glass" 
          size="lg" 
          className="w-full sm:w-auto group"
          onClick={() => navigate('/upload')}
        >
          <Zap className="h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
          Upload Resource
        </Button>
      </div>
    </div>
  </div>
</section>

        {/* Featured Resources */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-6 md:mb-8 flex items-center justify-between animate-slide-in-right">
            <div className="flex items-center gap-2 md:gap-3">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary animate-bounce-subtle" />
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text">Featured Resources</h2>
            </div>
          </div>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <ResourceCardSkeleton key={i} />)
              : featuredResources.map((resource, i) => (
                  <div key={resource.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in">
                    <ResourceCard {...resource} />
                  </div>
                ))}
          </div>
        </section>

        {/* Trending Resources */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-6 md:mb-8 flex items-center justify-between animate-slide-in-right">
            <div className="flex items-center gap-2 md:gap-3">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary animate-bounce-subtle" />
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text">Trending Now</h2>
            </div>
            <Button 
              variant="ghost" 
              className="text-sm md:text-base group"
              onClick={() => navigate('/trending')}
            >
              View All
              <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </div>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ResourceCardSkeleton key={i} />)
              : trendingResources.map((resource, i) => (
                  <div key={resource.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in">
                    <ResourceCard {...resource} />
                  </div>
                ))}
          </div>
        </section>

        {/* Recent Uploads */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-6 md:mb-8 flex items-center justify-between animate-slide-in-right">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary animate-bounce-subtle" />
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text">Recently Added</h2>
            </div>
            <Button 
              variant="ghost" 
              className="text-sm md:text-base group"
              onClick={() => navigate('/explore')}
            >
              View All
              <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </div>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ResourceCardSkeleton key={i} />)
              : trendingResources.slice(0, 4).map((resource, i) => (
                  <div key={`recent-${resource.id}`} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in">
                    <ResourceCard {...resource} />
                  </div>
                ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
