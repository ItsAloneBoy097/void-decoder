import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchEmptyStateProps {
  query: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function SearchEmptyState({ query, hasFilters, onClearFilters }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full p-8">
          <Search className="h-16 w-16 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-3">
        No resources found
      </h2>

      <p className="text-muted-foreground max-w-md mb-6">
        {query ? (
          <>
            We couldn't find any resources matching <span className="text-foreground font-semibold">"{query}"</span>
            {hasFilters && ' with your current filters'}
          </>
        ) : (
          <>
            Try adjusting your filters to see more results
          </>
        )}
      </p>

      {hasFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Clear all filters
        </Button>
      )}

      <div className="mt-8 text-sm text-muted-foreground">
        <p className="mb-2">Suggestions:</p>
        <ul className="space-y-1">
          <li>• Try different or more general keywords</li>
          <li>• Check your spelling</li>
          <li>• Remove some filters to broaden your search</li>
        </ul>
      </div>
    </div>
  );
}
