import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CategoryCard } from '@/components/category/CategoryCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Grid3x3, List } from 'lucide-react';
import { getAllCategories } from '@/config/categories';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const categories = getAllCategories();

  const filteredCategories = categories.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-b from-card/50 to-background">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Browse by
                <span className="block bg-gradient-cyan bg-clip-text text-transparent mt-2">
                  Category
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore {categories.length} different types of Minecraft resources
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto pt-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-sm">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
              </Badge>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6 animate-fade-in",
              viewMode === 'grid' 
                ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-3xl mx-auto"
            )}>
              {filteredCategories.map((category, i) => (
                <div 
                  key={category.id}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="animate-fade-in"
                >
                  <CategoryCard category={category} resourceCount={0} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
