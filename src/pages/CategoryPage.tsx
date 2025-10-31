import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CategoryResourceCard } from '@/components/category/CategoryResourceCard';
import { CategoryResourceCardSkeleton } from '@/components/category/CategoryResourceCardSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategoryBySlug, MINECRAFT_EDITIONS } from '@/config/categories';
import { Filter, Search, SlidersHorizontal, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const category = slug ? getCategoryBySlug(slug) : undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEdition, setSelectedEdition] = useState<string>('all');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [slug]);

  if (!category) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/categories')}>
            Browse All Categories
          </Button>
        </div>
      </AppLayout>
    );
  }

  const Icon = category.icon;

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <section 
          className="border-b border-border relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(${category.color} / 0.1) 0%, transparent 100%)`
          }}
        >
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 relative">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: `hsl(${category.color} / 0.15)`,
                    boxShadow: `0 0 30px hsl(${category.color} / 0.3)`
                  }}
                >
                  <Icon 
                    className="h-12 w-12" 
                    style={{ color: `hsl(${category.color})` }}
                  />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">{category.label}</h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="glow"
                  onClick={() => navigate('/upload', { state: { categoryId: category.id } })}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {category.label.replace(/s$/, '')}
                </Button>
                <Badge variant="secondary" className="text-sm py-2 px-4">
                  0 resources
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-card/30 sticky top-0 z-10 backdrop-blur-xl">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${category.label.toLowerCase()}...`}
                  className="pl-10 bg-background/50"
                />
              </div>

              {/* Edition Filter */}
              {category.supportsEditions && (
                <Select value={selectedEdition} onValueChange={setSelectedEdition}>
                  <SelectTrigger className="w-full md:w-48 bg-background/50">
                    <SelectValue placeholder="Edition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Editions</SelectItem>
                    {MINECRAFT_EDITIONS.map((edition) => (
                      <SelectItem key={edition.id} value={edition.id}>
                        {edition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 bg-background/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="md:flex-shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          {isLoading ? (
            <div className={cn(
              "grid gap-6",
              category.cardLayout === 'wide' 
                ? "lg:grid-cols-2"
                : category.cardLayout === 'compact'
                ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "sm:grid-cols-2 lg:grid-cols-3"
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <CategoryResourceCardSkeleton key={i} layout={category.cardLayout} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No resources yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to upload a {category.label.toLowerCase().replace(/s$/, '')}!
              </p>
              <Button 
                variant="glow"
                onClick={() => navigate('/upload', { state: { categoryId: category.id } })}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Now
              </Button>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
