import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { type CategoryConfig } from '@/config/categories';

interface CategoryUploadStepProps {
  categories: CategoryConfig[];
  selectedCategory: CategoryConfig | null;
  onSelectCategory: (category: CategoryConfig) => void;
}

export function CategoryUploadStep({ categories, selectedCategory, onSelectCategory }: CategoryUploadStepProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Category</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose what type of resource you're uploading
        </p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="pl-10 bg-background/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory?.id === category.id;
          
          return (
            <Card
              key={category.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:scale-105",
                "bg-card/50 backdrop-blur-sm border-border/50",
                "flex flex-col items-center gap-3 text-center",
                isSelected && "border-primary shadow-glow"
              )}
              onClick={() => onSelectCategory(category)}
              style={isSelected ? {
                backgroundColor: `hsl(${category.color} / 0.1)`,
                borderColor: `hsl(${category.color})`
              } : undefined}
            >
              <Icon 
                className="h-8 w-8"
                style={{ 
                  color: isSelected ? `hsl(${category.color})` : undefined 
                }}
              />
              <span className={cn(
                "text-sm font-medium",
                isSelected && "text-primary"
              )}>
                {category.label}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
