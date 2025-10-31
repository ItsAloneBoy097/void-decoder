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

    const { resource_id, action_type, weight } = await req.json();

    if (!resource_id || !action_type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record activity
    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: user.id,
        resource_id,
        action_type,
        weight: weight || 1.0,
      });

    if (activityError) throw activityError;

    // Update trending metrics if applicable
    if (["view", "download", "like", "comment"].includes(action_type)) {
      await updateTrendingMetrics(supabase, resource_id, action_type);
    }

    return new Response(
      JSON.stringify({ success: true }),
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

async function updateTrendingMetrics(supabase: any, resourceId: string, actionType: string) {
  const field = actionType === "view" ? "views_24h" :
                actionType === "download" ? "downloads_24h" :
                actionType === "like" ? "likes_24h" :
                actionType === "comment" ? "comments_24h" : null;

  if (!field) return;

  // Upsert trending metrics
  const { data: existing } = await supabase
    .from("trending_metrics")
    .select("*")
    .eq("resource_id", resourceId)
    .single();

  if (existing) {
    await supabase
      .from("trending_metrics")
      .update({
        [field]: (existing[field] || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("resource_id", resourceId);
  } else {
    await supabase
      .from("trending_metrics")
      .insert({
        resource_id: resourceId,
        [field]: 1,
      });
  }

  // Calculate and update trending score
  const { data: metrics } = await supabase
    .from("trending_metrics")
    .select("*")
    .eq("resource_id", resourceId)
    .single();

  if (metrics) {
    const score = 
      (metrics.views_24h || 0) * 0.3 +
      (metrics.downloads_24h || 0) * 2.0 +
      (metrics.likes_24h || 0) * 1.5 +
      (metrics.comments_24h || 0) * 1.0;

    await supabase
      .from("trending_metrics")
      .update({ trending_score: score })
      .eq("resource_id", resourceId);
  }
}
