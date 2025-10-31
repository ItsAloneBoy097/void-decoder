import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceCardSkeleton } from "@/components/resources/ResourceCardSkeleton";
import { SearchBarEnhanced } from "@/components/search/SearchBarEnhanced";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { MobileFilterDrawer } from "@/components/search/MobileFilterDrawer";
import { SortDropdown } from "@/components/search/SortDropdown";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { SearchFilters, SortOption } from "@/types/search";

import { mockResources } from "@/data/mockData";

export default function Explore() {
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<Partial<SearchFilters>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleApplyFilters = () => {
    setMobileFilterOpen(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-br from-background to-card">
          <div className="container mx-auto px-4 md:px-6 py-8 animate-fade-in-down">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Explore <span className="bg-gradient-cyan bg-clip-text text-transparent">Resources</span>
            </h1>
            <p className="text-muted-foreground animate-fade-in">
              Discover amazing Minecraft resources from the community
            </p>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="border-b border-border bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-6 py-4 animate-scale-in">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <SearchBarEnhanced />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="glass"
                  className="flex-1 md:flex-initial lg:hidden group"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  Filters
                </Button>
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex gap-6">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar 
                filters={filters} 
                onChange={setFilters} 
                onReset={handleResetFilters} 
              />
            </aside>

            {/* Resources Grid */}
            <div className="flex-1">
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {isLoading
                  ? Array.from({ length: 9 }).map((_, i) => <ResourceCardSkeleton key={i} />)
                  : mockResources.map((resource, i) => (
                      <div key={resource.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in">
                        <ResourceCard {...resource} />
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer 
        open={mobileFilterOpen} 
        onOpenChange={setMobileFilterOpen}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
      />
    </AppLayout>
  );
}
