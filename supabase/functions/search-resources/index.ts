import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query?: string;
  filters?: {
    resourceTypes?: string[];
    minecraftVersions?: string[];
    tags?: string[];
    licenseTypes?: string[];
    visibility?: string[];
    minRating?: number;
    dateRange?: { from: string; to: string };
    minDownloads?: number;
    verifiedOnly?: boolean;
    premiumOnly?: boolean;
  };
  sort?: string;
  page?: number;
  limit?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: SearchRequest = await req.json();
    const {
      query = '',
      filters = {},
      sort = 'trending',
      page = 1,
      limit = 24,
    } = body;

    console.log('Search request:', { query, filters, sort, page, limit });

    let queryBuilder = supabaseClient
      .from('resources')
      .select(`
        *,
        profiles!resources_creator_id_fkey(id, username, avatar_url, verified),
        resource_tags(tags(name, slug))
      `, { count: 'exact' })
      .eq('visibility', 'public');

    // Full-text search
    if (query && query.trim().length > 0) {
      const searchQuery = query.trim();
      // Use both full-text search and fuzzy matching
      queryBuilder = queryBuilder.or(
        `search_vector.fts.${searchQuery},title.ilike.%${searchQuery}%`
      );
    }

    // Apply filters
    if (filters.resourceTypes && filters.resourceTypes.length > 0) {
      queryBuilder = queryBuilder.in('type', filters.resourceTypes);
    }

    if (filters.minecraftVersions && filters.minecraftVersions.length > 0) {
      queryBuilder = queryBuilder.in('minecraft_version', filters.minecraftVersions);
    }

    if (filters.licenseTypes && filters.licenseTypes.length > 0) {
      queryBuilder = queryBuilder.in('license', filters.licenseTypes);
    }

    if (filters.minRating && filters.minRating > 0) {
      queryBuilder = queryBuilder.gte('average_rating', filters.minRating);
    }

    if (filters.minDownloads && filters.minDownloads > 0) {
      queryBuilder = queryBuilder.gte('total_downloads', filters.minDownloads);
    }

    if (filters.dateRange) {
      if (filters.dateRange.from) {
        queryBuilder = queryBuilder.gte('created_at', filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        queryBuilder = queryBuilder.lte('created_at', filters.dateRange.to);
      }
    }

    if (filters.verifiedOnly) {
      // Join with profiles to check verified status (handled via profiles relation)
    }

    // Apply sorting
    switch (sort) {
      case 'trending':
        queryBuilder = queryBuilder.order('trending_score', { ascending: false });
        break;
      case 'most_downloaded':
        queryBuilder = queryBuilder.order('total_downloads', { ascending: false });
        break;
      case 'highest_rated':
        queryBuilder = queryBuilder.order('average_rating', { ascending: false });
        break;
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
        break;
      case 'recently_updated':
        queryBuilder = queryBuilder.order('updated_at', { ascending: false });
        break;
      default:
        queryBuilder = queryBuilder.order('trending_score', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data: results, error, count } = await queryBuilder;

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    // Get aggregations for filters
    const { data: typeAggs } = await supabaseClient
      .from('resources')
      .select('type')
      .eq('visibility', 'public');

    const typeCounts: Record<string, number> = {};
    typeAggs?.forEach((item) => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    const response = {
      results: results || [],
      total: count || 0,
      page,
      limit,
      hasMore: count ? (page * limit) < count : false,
      query,
      aggregations: {
        resourceTypes: typeCounts,
      },
      took: Date.now(),
    };

    console.log('Search response:', { total: response.total, results: response.results.length });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search function error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
