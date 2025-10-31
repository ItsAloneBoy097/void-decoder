import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const feedType = url.searchParams.get("type") || "for-you";
    const page = parseInt(url.searchParams.get("page") || "0");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = page * limit;

    let resources = [];

    switch (feedType) {
      case "for-you":
        resources = await getPersonalizedFeed(supabase, user.id, limit, offset);
        break;
      case "trending":
        resources = await getTrendingFeed(supabase, limit, offset);
        break;
      case "following":
        resources = await getFollowingFeed(supabase, user.id, limit, offset);
        break;
      case "new":
        resources = await getNewFeed(supabase, limit, offset);
        break;
      case "top-rated":
        resources = await getTopRatedFeed(supabase, limit, offset);
        break;
      default:
        resources = await getPersonalizedFeed(supabase, user.id, limit, offset);
    }

    return new Response(
      JSON.stringify({
        resources,
        page,
        hasMore: resources.length === limit,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getPersonalizedFeed(supabase: any, userId: string, limit: number, offset: number) {
  // Get user interests
  const { data: interests } = await supabase
    .from("user_interests")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Get dismissed resources
  const { data: dismissed } = await supabase
    .from("dismissed_resources")
    .select("resource_id")
    .eq("user_id", userId);

  const dismissedIds = dismissed?.map((d: any) => d.resource_id) || [];

  // Get recommendations or generate them
  let { data: recommendations } = await supabase
    .from("recommendations")
    .select(`
      resource_id,
      score,
      reason,
      resources (
        id, title, slug, description, type, creator_id,
        average_rating, total_downloads, total_views, featured,
        created_at, published_at,
        profiles!resources_creator_id_fkey (username, avatar_url, verified)
      )
    `)
    .eq("user_id", userId)
    .not("resource_id", "in", `(${dismissedIds.join(",") || "null"})`)
    .order("score", { ascending: false })
    .range(offset, offset + limit - 1);

  // If no recommendations, generate based on interests
  if (!recommendations || recommendations.length === 0) {
    const { data: resources } = await supabase
      .from("resources")
      .select(`
        id, title, slug, description, type, creator_id,
        average_rating, total_downloads, total_views, featured,
        created_at, published_at,
        profiles!resources_creator_id_fkey (username, avatar_url, verified)
      `)
      .eq("visibility", "public")
      .not("id", "in", `(${dismissedIds.join(",") || "null"})`)
      .order("trending_score", { ascending: false })
      .range(offset, offset + limit - 1);

    return resources?.map((r: any) => ({
      ...r,
      reason: "Popular in community",
    })) || [];
  }

  return recommendations.map((r: any) => ({
    ...r.resources,
    recommendation_score: r.score,
    recommendation_reason: r.reason,
  }));
}

async function getTrendingFeed(supabase: any, limit: number, offset: number) {
  const { data } = await supabase
    .from("trending_metrics")
    .select(`
      resource_id,
      trending_score,
      resources (
        id, title, slug, description, type, creator_id,
        average_rating, total_downloads, total_views, featured,
        created_at, published_at,
        profiles!resources_creator_id_fkey (username, avatar_url, verified)
      )
    `)
    .order("trending_score", { ascending: false })
    .range(offset, offset + limit - 1);

  return data?.map((item: any) => ({
    ...item.resources,
    trending_score: item.trending_score,
  })) || [];
}

async function getFollowingFeed(supabase: any, userId: string, limit: number, offset: number) {
  const { data: follows } = await supabase
    .from("follows")
    .select("target_id")
    .eq("user_id", userId)
    .eq("target_type", "creator");

  const creatorIds = follows?.map((f: any) => f.target_id) || [];

  if (creatorIds.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("resources")
    .select(`
      id, title, slug, description, type, creator_id,
      average_rating, total_downloads, total_views, featured,
      created_at, published_at,
      profiles!resources_creator_id_fkey (username, avatar_url, verified)
    `)
    .in("creator_id", creatorIds)
    .eq("visibility", "public")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return data || [];
}

async function getNewFeed(supabase: any, limit: number, offset: number) {
  const { data } = await supabase
    .from("resources")
    .select(`
      id, title, slug, description, type, creator_id,
      average_rating, total_downloads, total_views, featured,
      created_at, published_at,
      profiles!resources_creator_id_fkey (username, avatar_url, verified)
    `)
    .eq("visibility", "public")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return data || [];
}

async function getTopRatedFeed(supabase: any, limit: number, offset: number) {
  const { data } = await supabase
    .from("resources")
    .select(`
      id, title, slug, description, type, creator_id,
      average_rating, total_downloads, total_views, featured,
      created_at, published_at,
      profiles!resources_creator_id_fkey (username, avatar_url, verified)
    `)
    .eq("visibility", "public")
    .gte("rating_count", 5)
    .order("average_rating", { ascending: false })
    .range(offset, offset + limit - 1);

  return data || [];
}
