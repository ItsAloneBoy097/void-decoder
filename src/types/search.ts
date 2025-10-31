export interface SearchFilters {
  resourceTypes: string[];
  minecraftVersions: string[];
  tags: string[];
  licenseTypes: string[];
  visibility: string[];
  minRating: number;
  dateRange?: { from: Date | null; to: Date | null };
  minDownloads: number;
  verifiedOnly: boolean;
  premiumOnly: boolean;
}

export type SortOption = 
  | 'relevance'
  | 'trending'
  | 'most_downloaded'
  | 'highest_rated'
  | 'newest'
  | 'recently_updated';

export interface SearchRequest {
  query?: string;
  filters: Partial<SearchFilters>;
  sort: SortOption;
  page: number;
  limit: number;
}

export interface SearchResponse {
  results: any[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  query: string;
  aggregations: {
    resourceTypes: Record<string, number>;
  };
  took: number;
}

export interface AutocompleteSuggestion {
  resources: Array<{ id: string; title: string; type: string; slug: string }>;
  tags: Array<{ name: string; count: number }>;
  creators: Array<{ id: string; username: string; avatar_url: string }>;
}
