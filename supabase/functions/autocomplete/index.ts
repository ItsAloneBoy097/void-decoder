import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '8');

    if (query.length < 2) {
      return new Response(
        JSON.stringify({ suggestions: { resources: [], tags: [], creators: [] } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Autocomplete request:', { query, limit });

    // Search resources with fuzzy matching
    const { data: resources } = await supabaseClient
      .from('resources')
      .select('id, title, type, slug')
      .eq('visibility', 'public')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('total_downloads', { ascending: false })
      .limit(limit);

    // Search tags
    const { data: tags } = await supabaseClient
      .from('tags')
      .select('name, slug, usage_count')
      .ilike('name', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(limit);

    // Search creators
    const { data: creators } = await supabaseClient
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .order('total_uploads', { ascending: false })
      .limit(limit);

    const response = {
      suggestions: {
        resources: resources || [],
        tags: (tags || []).map(t => ({ name: t.name, count: t.usage_count })),
        creators: creators || [],
      },
      took: Date.now(),
    };

    console.log('Autocomplete response:', {
      resources: response.suggestions.resources.length,
      tags: response.suggestions.tags.length,
      creators: response.suggestions.creators.length,
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
