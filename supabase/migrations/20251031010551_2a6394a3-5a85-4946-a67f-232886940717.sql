-- Create user_interests table to track user preferences
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  followed_creators UUID[] DEFAULT ARRAY[]::UUID[],
  preferred_resource_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_activity table to track interactions
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'download', 'like', 'rate', 'comment', 'dismiss')),
  weight NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_activity for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_resource_id ON public.user_activity(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);

-- Create recommendations table to cache computed recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_score ON public.recommendations(user_id, score DESC);

-- Create trending_metrics table for real-time popularity tracking
CREATE TABLE IF NOT EXISTS public.trending_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  views_24h INTEGER DEFAULT 0,
  downloads_24h INTEGER DEFAULT 0,
  likes_24h INTEGER DEFAULT 0,
  comments_24h INTEGER DEFAULT 0,
  trending_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(resource_id)
);

CREATE INDEX IF NOT EXISTS idx_trending_metrics_score ON public.trending_metrics(trending_score DESC);

-- Create dismissed_resources table to filter out unwanted content
CREATE TABLE IF NOT EXISTS public.dismissed_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dismissed_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_interests
CREATE POLICY "Users can view their own interests"
  ON public.user_interests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interests"
  ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests"
  ON public.user_interests FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendations"
  ON public.recommendations FOR ALL
  USING (true);

-- RLS Policies for trending_metrics
CREATE POLICY "Anyone can view trending metrics"
  ON public.trending_metrics FOR SELECT
  USING (true);

CREATE POLICY "System can manage trending metrics"
  ON public.trending_metrics FOR ALL
  USING (true);

-- RLS Policies for dismissed_resources
CREATE POLICY "Users can view their dismissed resources"
  ON public.dismissed_resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss resources"
  ON public.dismissed_resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can un-dismiss resources"
  ON public.dismissed_resources FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update user interests based on activity
CREATE OR REPLACE FUNCTION update_user_interests()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_interests when user follows or rates resources
  INSERT INTO public.user_interests (user_id, updated_at)
  VALUES (NEW.user_id, now())
  ON CONFLICT (user_id) DO UPDATE
  SET updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update interests on activity
CREATE TRIGGER on_user_activity_update_interests
  AFTER INSERT ON public.user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_interests();

-- Function to update trending scores
CREATE OR REPLACE FUNCTION calculate_trending_score(resource_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC;
BEGIN
  SELECT 
    (COALESCE(views_24h, 0) * 0.3) +
    (COALESCE(downloads_24h, 0) * 2.0) +
    (COALESCE(likes_24h, 0) * 1.5) +
    (COALESCE(comments_24h, 0) * 1.0)
  INTO score
  FROM public.trending_metrics
  WHERE resource_id = resource_id_param;
  
  RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql;