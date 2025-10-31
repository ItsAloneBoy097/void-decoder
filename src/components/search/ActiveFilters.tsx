import { SearchFilters } from "@/types/search";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  filters: Partial<SearchFilters>;
  onChange: (filters: Partial<SearchFilters>) => void;
}

export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const removeFilter = (key: keyof SearchFilters, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      const updated = (filters[key] as string[]).filter(v => v !== value);
      onChange({ ...filters, [key]: updated });
    } else {
      const updated = { ...filters };
      delete updated[key];
      onChange(updated);
    }
  };

  const hasActiveFilters = 
    (filters.resourceTypes?.length || 0) > 0 ||
    (filters.minecraftVersions?.length || 0) > 0 ||
    (filters.licenseTypes?.length || 0) > 0 ||
    (filters.minRating && filters.minRating > 0) ||
    (filters.minDownloads && filters.minDownloads > 0) ||
    filters.verifiedOnly;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.resourceTypes?.map(type => (
        <Badge key={type} variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
          {type.replace('_', ' ')}
          <button
            onClick={() => removeFilter('resourceTypes', type)}
            className="ml-1 hover:bg-background/20 rounded-sm p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {filters.minecraftVersions?.map(version => (
        <Badge key={version} variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
          MC {version}
          <button
            onClick={() => removeFilter('minecraftVersions', version)}
            className="ml-1 hover:bg-background/20 rounded-sm p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {filters.licenseTypes?.map(license => (
        <Badge key={license} variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
          {license.replace('_', ' ')}
          <button
            onClick={() => removeFilter('licenseTypes', license)}
            className="ml-1 hover:bg-background/20 rounded-sm p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {filters.minRating && filters.minRating > 0 && (
        <Badge variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
          {filters.minRating}★+
          <button
            onClick={() => removeFilter('minRating')}
            className="ml-1 hover:bg-background/20 rounded-sm p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.minDownloads && filters.minDownloads > 0 && (
        <Badge variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
          {filters.minDownloads}+ downloads
          <button
            onClick={() => removeFilter('minDownloads')}
            className="ml-1 hover:bg-background/20 rounded-sm p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.verifiedOnly && (
        <Badge variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
          Verified Only
          <button
            onClick={() => removeFilter('verifiedOnly')}
            className="ml-1 hover:bg-background/20 rounded-sm p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}
