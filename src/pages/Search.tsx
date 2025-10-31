import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBarEnhanced } from "@/components/search/SearchBarEnhanced";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { MobileFilterDrawer } from "@/components/search/MobileFilterDrawer";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { SortDropdown } from "@/components/search/SortDropdown";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceCardSkeleton } from "@/components/resources/ResourceCardSkeleton";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Filter, Grid, List } from "lucide-react";
import { SearchFilters, SortOption, SearchResponse } from "@/types/search";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    resourceTypes: [],
    minecraftVersions: [],
    tags: [],
    licenseTypes: [],
    visibility: [],
    minRating: 0,
    minDownloads: 0,
    verifiedOnly: false,
    premiumOnly: false,
  });

  const [sort, setSort] = useState<SortOption>('trending');
  const [page, setPage] = useState(1);
  const query = searchParams.get('q') || '';

  // Load filters from URL on mount
  useEffect(() => {
    const types = searchParams.get('types')?.split(',').filter(Boolean);
    const versions = searchParams.get('versions')?.split(',').filter(Boolean);
    const tag = searchParams.get('tag');
    
    setFilters(prev => ({
      ...prev,
      ...(types && { resourceTypes: types }),
      ...(versions && { minecraftVersions: versions }),
      ...(tag && { tags: [tag] }),
    }));
  }, []);

  // Perform search
  useEffect(() => {
    performSearch();
  }, [query, filters, sort, page]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-resources', {
        body: {
          query: query || undefined,
          filters,
          sort,
          page,
          limit: 24,
        },
      });

      if (error) throw error;
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      resourceTypes: [],
      minecraftVersions: [],
      tags: [],
      licenseTypes: [],
      visibility: [],
      minRating: 0,
      minDownloads: 0,
      verifiedOnly: false,
      premiumOnly: false,
    });
    setPage(1);
  };

  const hasActiveFilters = 
    (filters.resourceTypes?.length || 0) > 0 ||
    (filters.minecraftVersions?.length || 0) > 0 ||
    (filters.minRating || 0) > 0 ||
    (filters.minDownloads || 0) > 0 ||
    filters.verifiedOnly;

  const totalPages = searchResults ? Math.ceil(searchResults.total / 24) : 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header with Search */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container py-4 md:py-6">
            <SearchBarEnhanced onSearch={handleSearch} autoFocus />
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <FilterSidebar
                  filters={filters}
                  onChange={handleFiltersChange}
                  onReset={handleResetFilters}
                />
              </div>
            </aside>

            {/* Results */}
            <main className="flex-1 space-y-6">
              {/* Results Header */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowMobileFilters(true)}
                      className="lg:hidden"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                    
                    <div className="text-sm text-muted-foreground">
                      {isLoading ? (
                        'Searching...'
                      ) : searchResults ? (
                        <>
                          {searchResults.total.toLocaleString()} result{searchResults.total !== 1 ? 's' : ''}
                          {query && <> for <span className="text-foreground font-semibold">"{query}"</span></>}
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SortDropdown value={sort} onChange={setSort} />
                    
                    <div className="hidden md:flex items-center gap-1 border border-border/50 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                <ActiveFilters filters={filters} onChange={handleFiltersChange} />
              </div>

              {/* Results Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ResourceCardSkeleton key={i} />
                  ))}
                </div>
              ) : searchResults && searchResults.results.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchResults.results.map((resource: any) => (
                      <ResourceCard 
                        key={resource.id}
                        id={resource.slug || resource.id}
                        title={resource.title}
                        description={resource.description || ''}
                        image={resource.image_url || '/placeholder.svg'}
                        category={resource.type}
                        downloads={resource.total_downloads || 0}
                        rating={resource.average_rating || 0}
                        views={resource.total_views || 0}
                        author={resource.profiles?.username || 'Unknown'}
                        version={resource.minecraft_version || '1.21'}
                        featured={resource.featured}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center pt-8">
                      <Pagination>
                        <PaginationContent>
                          {page > 1 && (
                            <PaginationItem>
                              <PaginationPrevious onClick={() => setPage(page - 1)} />
                            </PaginationItem>
                          )}
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => setPage(pageNum)}
                                  isActive={pageNum === page}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}

                          {page < totalPages && (
                            <PaginationItem>
                              <PaginationNext onClick={() => setPage(page + 1)} />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <SearchEmptyState
                  query={query}
                  hasFilters={hasActiveFilters}
                  onClearFilters={handleResetFilters}
                />
              )}
            </main>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          open={showMobileFilters}
          onOpenChange={setShowMobileFilters}
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
          onApply={() => setShowMobileFilters(false)}
        />
      </div>
    </AppLayout>
  );
}
