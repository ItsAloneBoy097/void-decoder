
-- Migration: 20251030064517

-- Migration: 20251030062822

-- Migration: 20251028073016

-- Migration: 20251028043709

-- Migration: 20251028042205
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('user', 'creator', 'moderator', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  premium BOOLEAN DEFAULT false,
  total_uploads INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  social_discord TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  social_github TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create followers table
CREATE TABLE public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

-- Enable RLS on followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Followers policies
CREATE POLICY "Anyone can view followers"
  ON public.followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON public.followers FOR DELETE
  USING (auth.uid() = follower_id);

-- Migration: 20251028043055
-- Create resource type enum
CREATE TYPE public.resource_type AS ENUM (
  'map', 'plugin', 'mod', 'modpack', 'resource_pack', 
  'texture_pack', 'shader', 'skin', 'schematic', 
  'datapack', 'world', 'seed', 'build', 'script', 'other'
);

-- Create license type enum
CREATE TYPE public.license_type AS ENUM (
  'mit', 'gpl', 'cc_by', 'cc_by_sa', 'cc0', 
  'apache', 'all_rights_reserved', 'custom'
);

-- Create visibility enum
CREATE TYPE public.resource_visibility AS ENUM (
  'draft', 'public', 'private', 'premium'
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type resource_type NOT NULL,
  license license_type DEFAULT 'all_rights_reserved',
  visibility resource_visibility DEFAULT 'draft',
  minecraft_version TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  featured BOOLEAN DEFAULT false,
  total_downloads INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "Public resources are viewable by everyone"
  ON public.resources FOR SELECT
  USING (visibility = 'public' OR auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own resources"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own resources"
  ON public.resources FOR DELETE
  USING (auth.uid() = creator_id);

-- Create resource_files table
CREATE TABLE public.resource_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  version_label TEXT NOT NULL DEFAULT '1.0.0',
  minecraft_version TEXT,
  changelog TEXT,
  download_count INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on resource_files
ALTER TABLE public.resource_files ENABLE ROW LEVEL SECURITY;

-- Resource files policies
CREATE POLICY "Anyone can view files of public resources"
  ON public.resource_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id 
      AND (visibility = 'public' OR creator_id = auth.uid())
    )
  );

CREATE POLICY "Creators can insert files for their resources"
  ON public.resource_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update files for their resources"
  ON public.resource_files FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can delete files for their resources"
  ON public.resource_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id AND creator_id = auth.uid()
    )
  );

-- Create resource_images table
CREATE TABLE public.resource_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('banner', 'cover', 'screenshot')),
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on resource_images
ALTER TABLE public.resource_images ENABLE ROW LEVEL SECURITY;

-- Resource images policies
CREATE POLICY "Anyone can view images of public resources"
  ON public.resource_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id 
      AND (visibility = 'public' OR creator_id = auth.uid())
    )
  );

CREATE POLICY "Creators can manage images for their resources"
  ON public.resource_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id AND creator_id = auth.uid()
    )
  );

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Tags policies
CREATE POLICY "Anyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create resource_tags junction table
CREATE TABLE public.resource_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id, tag_id)
);

-- Enable RLS on resource_tags
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;

-- Resource tags policies
CREATE POLICY "Anyone can view tags for public resources"
  ON public.resource_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id 
      AND (visibility = 'public' OR creator_id = auth.uid())
    )
  );

CREATE POLICY "Creators can manage tags for their resources"
  ON public.resource_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id AND creator_id = auth.uid()
    )
  );

-- Create dependencies table
CREATE TABLE public.dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  dependency_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id, dependency_id),
  CHECK (resource_id != dependency_id)
);

-- Enable RLS on dependencies
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;

-- Dependencies policies
CREATE POLICY "Anyone can view dependencies"
  ON public.dependencies FOR SELECT
  USING (true);

CREATE POLICY "Creators can manage dependencies for their resources"
  ON public.dependencies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.resources 
      WHERE id = resource_id AND creator_id = auth.uid()
    )
  );

-- Create function to update resource updated_at
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT, creator_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug format
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  
  -- Check if slug exists and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.resources WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(file_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update file download count
  UPDATE public.resource_files
  SET download_count = download_count + 1
  WHERE id = file_id;
  
  -- Update resource total downloads
  UPDATE public.resources
  SET total_downloads = total_downloads + 1
  WHERE id = (SELECT resource_id FROM public.resource_files WHERE id = file_id);
END;
$$;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(res_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.resources
  SET total_views = total_views + 1
  WHERE id = res_id;
END;
$$;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('resource-files', 'resource-files', false),
  ('resource-images', 'resource-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resource-files bucket
CREATE POLICY "Authenticated users can upload resource files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resource-files');

CREATE POLICY "Users can view files they have access to"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resource-files' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.resources r
        WHERE r.visibility = 'public'
        AND r.id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Users can update their own resource files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resource-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resource files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resource-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for resource-images bucket (public)
CREATE POLICY "Anyone can view resource images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resource-images');

CREATE POLICY "Authenticated users can upload resource images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resource-images');

CREATE POLICY "Users can update their own resource images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resource-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resource images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resource-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for performance
CREATE INDEX idx_resources_creator ON public.resources(creator_id);
CREATE INDEX idx_resources_type ON public.resources(type);
CREATE INDEX idx_resources_visibility ON public.resources(visibility);
CREATE INDEX idx_resources_slug ON public.resources(slug);
CREATE INDEX idx_resource_files_resource ON public.resource_files(resource_id);
CREATE INDEX idx_resource_images_resource ON public.resource_images(resource_id);
CREATE INDEX idx_resource_tags_resource ON public.resource_tags(resource_id);
CREATE INDEX idx_resource_tags_tag ON public.resource_tags(tag_id);
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_dependencies_resource ON public.dependencies(resource_id);


-- Migration: 20251028044132
-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add search optimization columns
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS trending_score numeric DEFAULT 0;

-- Create search vector function
CREATE OR REPLACE FUNCTION public.generate_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') || setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trending score function
CREATE OR REPLACE FUNCTION public.update_trending_scores()
RETURNS void AS $$
BEGIN
  UPDATE public.resources SET trending_score = ((total_downloads * 2.0 + total_views * 0.5 + rating_count * 3.0) / GREATEST(EXTRACT(EPOCH FROM (NOW() - COALESCE(published_at, created_at))) / 86400, 1)) WHERE visibility = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes
CREATE INDEX IF NOT EXISTS resources_search_vector_idx ON public.resources USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS resources_title_trgm_idx ON public.resources USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS resources_type_idx ON public.resources (type);
CREATE INDEX IF NOT EXISTS resources_visibility_idx ON public.resources (visibility);
CREATE INDEX IF NOT EXISTS resources_minecraft_version_idx ON public.resources (minecraft_version);
CREATE INDEX IF NOT EXISTS resources_created_at_idx ON public.resources (created_at DESC);
CREATE INDEX IF NOT EXISTS resources_trending_idx ON public.resources (trending_score DESC);
CREATE INDEX IF NOT EXISTS resources_downloads_idx ON public.resources (total_downloads DESC);
CREATE INDEX IF NOT EXISTS resources_rating_idx ON public.resources (average_rating DESC);


-- Migration: 20251028073304
-- ============================================
-- RATINGS & REVIEWS SYSTEM
-- Minecraft Gallery - Premium Resource Platform
-- ============================================

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  score NUMERIC(2,1) NOT NULL CHECK (score >= 1.0 AND score <= 5.0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) >= 10 AND char_length(text) <= 5000),
  images TEXT[], -- Array of image URLs
  helpful_count INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT false,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Create review replies table (for creator responses)
CREATE TABLE public.review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) >= 1 AND char_length(text) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create review flags/reports table
CREATE TABLE public.review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'offensive', 'misleading', 'other')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(review_id, reporter_id)
);

-- Create review reactions table
CREATE TABLE public.review_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('thumbs_up', 'heart', 'surprised')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(review_id, user_id, reaction_type)
);

-- Create review helpful votes table
CREATE TABLE public.review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_ratings_resource ON public.ratings(resource_id);
CREATE INDEX idx_ratings_user ON public.ratings(user_id);
CREATE INDEX idx_reviews_resource ON public.reviews(resource_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_helpful_count ON public.reviews(helpful_count DESC);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX idx_review_replies_review ON public.review_replies(review_id);
CREATE INDEX idx_review_flags_review ON public.review_flags(review_id);
CREATE INDEX idx_review_reactions_review ON public.review_reactions(review_id);
CREATE INDEX idx_review_helpful_review ON public.review_helpful(review_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_replies_updated_at
  BEFORE UPDATE ON public.review_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION: Update resource aggregate ratings
-- ============================================

CREATE OR REPLACE FUNCTION public.update_resource_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  res_id UUID;
BEGIN
  -- Determine which resource to update
  IF TG_OP = 'DELETE' THEN
    res_id := OLD.resource_id;
  ELSE
    res_id := NEW.resource_id;
  END IF;
  
  -- Update the resource's rating statistics
  UPDATE public.resources
  SET 
    average_rating = (
      SELECT COALESCE(AVG(score), 0)
      FROM public.ratings
      WHERE resource_id = res_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE resource_id = res_id
    )
  WHERE id = res_id;
  
  RETURN NULL;
END;
$$;

-- Trigger to update resource ratings on INSERT/UPDATE/DELETE
CREATE TRIGGER update_resource_rating_on_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_resource_rating_stats();

-- ============================================
-- FUNCTION: Update review helpful count
-- ============================================

CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rev_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    rev_id := OLD.review_id;
  ELSE
    rev_id := NEW.review_id;
  END IF;
  
  UPDATE public.reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM public.review_helpful
    WHERE review_id = rev_id
  )
  WHERE id = rev_id;
  
  RETURN NULL;
END;
$$;

-- Trigger to update helpful count
CREATE TRIGGER update_helpful_count_on_change
  AFTER INSERT OR DELETE ON public.review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_helpful_count();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

-- RATINGS POLICIES
CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings for resources"
  ON public.ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND auth.uid() IS NOT NULL
    AND auth.uid() != (SELECT creator_id FROM public.resources WHERE id = resource_id)
  );

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE
  USING (auth.uid() = user_id);

-- REVIEWS POLICIES
CREATE POLICY "Anyone can view non-hidden reviews"
  ON public.reviews FOR SELECT
  USING (hidden = false OR auth.uid() = user_id);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.ratings WHERE id = rating_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- REVIEW REPLIES POLICIES
CREATE POLICY "Anyone can view review replies"
  ON public.review_replies FOR SELECT
  USING (true);

CREATE POLICY "Resource creators can reply to reviews on their resources"
  ON public.review_replies FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() = (
      SELECT r.creator_id 
      FROM public.reviews rev
      JOIN public.resources r ON r.id = rev.resource_id
      WHERE rev.id = review_id
    )
  );

CREATE POLICY "Users can update their own replies"
  ON public.review_replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
  ON public.review_replies FOR DELETE
  USING (auth.uid() = user_id);

-- REVIEW FLAGS POLICIES
CREATE POLICY "Users can view their own flags"
  ON public.review_flags FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can flag reviews"
  ON public.review_flags FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND auth.uid() IS NOT NULL);

-- REVIEW REACTIONS POLICIES
CREATE POLICY "Anyone can view reactions"
  ON public.review_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON public.review_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove their own reactions"
  ON public.review_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- REVIEW HELPFUL POLICIES
CREATE POLICY "Anyone can view helpful votes"
  ON public.review_helpful FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can mark reviews helpful"
  ON public.review_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove their helpful votes"
  ON public.review_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- Migration: 20251028095737
-- Create comments table for threaded discussions
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) >= 3 AND char_length(text) <= 1500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  locked BOOLEAN DEFAULT false,
  reaction_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0
);

-- Create comment_reactions table
CREATE TABLE public.comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('❤️', '👍', '😮', '😂', '👎')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, emoji)
);

-- Create comment_reports table
CREATE TABLE public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, reporter_id)
);

-- Create indexes for performance
CREATE INDEX idx_comments_resource_id ON public.comments(resource_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX idx_comment_reports_status ON public.comment_reports(status);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Anyone can view non-deleted comments"
  ON public.comments FOR SELECT
  USING (deleted = false OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    auth.uid() IS NOT NULL AND
    (parent_id IS NULL OR EXISTS (
      SELECT 1 FROM public.comments 
      WHERE id = comments.parent_id AND locked = false
    ))
  );

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and moderators can delete comments"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'moderator') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for comment_reactions
CREATE POLICY "Anyone can view reactions"
  ON public.comment_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON public.comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove their own reactions"
  ON public.comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for comment_reports
CREATE POLICY "Moderators can view all reports"
  ON public.comment_reports FOR SELECT
  USING (
    public.has_role(auth.uid(), 'moderator') OR 
    public.has_role(auth.uid(), 'admin') OR
    auth.uid() = reporter_id
  );

CREATE POLICY "Authenticated users can report comments"
  ON public.comment_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Moderators can update report status"
  ON public.comment_reports FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'moderator') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Function to update comment reaction count
CREATE OR REPLACE FUNCTION public.update_comment_reaction_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comm_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    comm_id := OLD.comment_id;
  ELSE
    comm_id := NEW.comment_id;
  END IF;
  
  UPDATE public.comments
  SET reaction_count = (
    SELECT COUNT(*)
    FROM public.comment_reactions
    WHERE comment_id = comm_id
  )
  WHERE id = comm_id;
  
  RETURN NULL;
END;
$$;

-- Function to update comment reply count
CREATE OR REPLACE FUNCTION public.update_comment_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  par_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    par_id := OLD.parent_id;
  ELSE
    par_id := NEW.parent_id;
  END IF;
  
  IF par_id IS NOT NULL THEN
    UPDATE public.comments
    SET reply_count = (
      SELECT COUNT(*)
      FROM public.comments
      WHERE parent_id = par_id AND deleted = false
    )
    WHERE id = par_id;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER update_comment_reaction_count_trigger
  AFTER INSERT OR DELETE ON public.comment_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_reaction_count();

CREATE TRIGGER update_comment_reply_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_reply_count();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251029040710
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('system', 'creator', 'community', 'moderation')),
  category TEXT NOT NULL CHECK (category IN ('upload', 'update', 'comment', 'reply', 'mention', 'reaction', 'follow', 'badge', 'announcement', 'warning')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  icon TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  email_frequency TEXT DEFAULT 'instant' CHECK (email_frequency IN ('instant', 'daily', 'weekly', 'never')),
  sound_enabled BOOLEAN DEFAULT FALSE,
  category_system BOOLEAN DEFAULT TRUE,
  category_creator BOOLEAN DEFAULT TRUE,
  category_community BOOLEAN DEFAULT TRUE,
  category_moderation BOOLEAN DEFAULT TRUE,
  do_not_disturb_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update notification_preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_category TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
  user_prefs RECORD;
BEGIN
  -- Check user preferences
  SELECT * INTO user_prefs
  FROM public.notification_preferences
  WHERE user_id = p_user_id;
  
  -- If preferences don't exist, create default
  IF user_prefs IS NULL THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id);
    
    SELECT * INTO user_prefs
    FROM public.notification_preferences
    WHERE user_id = p_user_id;
  END IF;
  
  -- Check if in-app notifications are enabled and not in DND
  IF user_prefs.in_app_enabled = TRUE AND 
     (user_prefs.do_not_disturb_until IS NULL OR user_prefs.do_not_disturb_until < NOW()) THEN
    
    -- Check category preferences
    IF (p_type = 'system' AND user_prefs.category_system = TRUE) OR
       (p_type = 'creator' AND user_prefs.category_creator = TRUE) OR
       (p_type = 'community' AND user_prefs.category_community = TRUE) OR
       (p_type = 'moderation' AND user_prefs.category_moderation = TRUE) THEN
      
      INSERT INTO public.notifications (user_id, type, category, title, message, link, icon)
      VALUES (p_user_id, p_type, p_category, p_title, p_message, p_link, p_icon)
      RETURNING id INTO notification_id;
    END IF;
  END IF;
  
  RETURN notification_id;
END;
$$;


-- Migration: 20251030063244
-- ============================================================================
-- FOLLOW SYSTEM ENHANCEMENTS
-- ============================================================================

-- Create enum for follow target types
CREATE TYPE follow_target_type AS ENUM ('creator', 'resource', 'tag');

-- Drop existing followers table and recreate with enhanced structure
DROP TABLE IF EXISTS public.followers CASCADE;

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type follow_target_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- Create indexes for performance
CREATE INDEX idx_follows_user_id ON public.follows(user_id);
CREATE INDEX idx_follows_target ON public.follows(target_id, target_type);
CREATE INDEX idx_follows_created_at ON public.follows(created_at DESC);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Users can view all follows"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow targets"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATION ENHANCEMENTS
-- ============================================================================

-- Create enum for notification events
CREATE TYPE notification_event AS ENUM (
  'new_upload',
  'resource_update',
  'new_comment',
  'comment_reply',
  'mention',
  'new_review',
  'review_reply',
  'reaction',
  'milestone',
  'system_announcement',
  'moderation_action',
  'tag_match'
);

-- Enhance notifications table
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS event notification_event,
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resource_id UUID,
  ADD COLUMN IF NOT EXISTS grouped BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_key TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_event ON public.notifications(event);
CREATE INDEX IF NOT EXISTS idx_notifications_group_key ON public.notifications(group_key) WHERE group_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read, created_at DESC);

-- ============================================================================
-- NOTIFICATION PREFERENCES ENHANCEMENTS
-- ============================================================================

-- Add per-event preferences
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS event_new_upload BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS event_resource_update BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS event_comments BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS event_mentions BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS event_reviews BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS event_reactions BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_milestones BOOLEAN DEFAULT true;

-- ============================================================================
-- EMAIL QUEUE FOR BATCH NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_ids UUID[] NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_queue_status ON public.email_queue(status, scheduled_at);
CREATE INDEX idx_email_queue_user ON public.email_queue(user_id);

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email queue"
  ON public.email_queue FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get follower count for a target
CREATE OR REPLACE FUNCTION get_follower_count(
  p_target_id UUID,
  p_target_type follow_target_type
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE target_id = p_target_id AND target_type = p_target_type;
$$;

-- Function to check if user follows target
CREATE OR REPLACE FUNCTION is_following(
  p_user_id UUID,
  p_target_id UUID,
  p_target_type follow_target_type
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.follows
    WHERE user_id = p_user_id 
      AND target_id = p_target_id 
      AND target_type = p_target_type
  );
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.notifications
  WHERE user_id = p_user_id AND read = false;
$$;

-- ============================================================================
-- NOTIFICATION TRIGGER FUNCTIONS
-- ============================================================================

-- Trigger: Notify followers when creator uploads new resource
CREATE OR REPLACE FUNCTION notify_followers_on_new_resource()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_record RECORD;
  resource_title TEXT;
  creator_name TEXT;
BEGIN
  -- Only proceed if resource is published
  IF NEW.visibility = 'public' AND NEW.published_at IS NOT NULL THEN
    -- Get resource title and creator name
    SELECT NEW.title, p.username
    INTO resource_title, creator_name
    FROM profiles p
    WHERE p.id = NEW.creator_id;

    -- Notify all followers of this creator
    FOR follower_record IN
      SELECT user_id
      FROM follows
      WHERE target_id = NEW.creator_id 
        AND target_type = 'creator'
    LOOP
      PERFORM create_notification(
        follower_record.user_id,
        'creator',
        'new_upload',
        'New Upload from ' || creator_name,
        creator_name || ' just uploaded: ' || resource_title,
        '/resource/' || NEW.id::text,
        'Upload'
      );
    END LOOP;

    -- Notify followers of matching tags
    FOR follower_record IN
      SELECT DISTINCT f.user_id
      FROM follows f
      INNER JOIN resource_tags rt ON rt.tag_id = f.target_id
      WHERE rt.resource_id = NEW.id 
        AND f.target_type = 'tag'
        AND f.user_id != NEW.creator_id
    LOOP
      PERFORM create_notification(
        follower_record.user_id,
        'community',
        'tag_match',
        'New resource matches your interests',
        'A new ' || NEW.type || ' was uploaded: ' || resource_title,
        '/resource/' || NEW.id::text,
        'Sparkles'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_followers_on_new_resource ON public.resources;
CREATE TRIGGER trigger_notify_followers_on_new_resource
  AFTER INSERT ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_on_new_resource();

-- Trigger: Notify followers when resource is updated
CREATE OR REPLACE FUNCTION notify_followers_on_resource_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_record RECORD;
  resource_title TEXT;
BEGIN
  -- Only if published and meaningful update
  IF NEW.visibility = 'public' AND (
    OLD.title != NEW.title OR
    OLD.description != NEW.description OR
    OLD.updated_at != NEW.updated_at
  ) THEN
    SELECT NEW.title INTO resource_title;

    -- Notify resource followers
    FOR follower_record IN
      SELECT user_id
      FROM follows
      WHERE target_id = NEW.id 
        AND target_type = 'resource'
    LOOP
      PERFORM create_notification(
        follower_record.user_id,
        'creator',
        'resource_update',
        'Resource Updated',
        resource_title || ' has been updated',
        '/resource/' || NEW.id::text,
        'RefreshCw'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_followers_on_resource_update ON public.resources;
CREATE TRIGGER trigger_notify_followers_on_resource_update
  AFTER UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_on_resource_update();

-- Trigger: Notify on comment reply
CREATE OR REPLACE FUNCTION notify_on_comment_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_user_id UUID;
  replier_name TEXT;
  resource_title TEXT;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Get parent comment author
    SELECT c.user_id, p.username, r.title
    INTO parent_user_id, replier_name, resource_title
    FROM comments c
    INNER JOIN profiles p ON p.id = NEW.user_id
    INNER JOIN resources r ON r.id = NEW.resource_id
    WHERE c.id = NEW.parent_id;

    -- Notify parent comment author
    IF parent_user_id != NEW.user_id THEN
      PERFORM create_notification(
        parent_user_id,
        'community',
        'comment_reply',
        replier_name || ' replied to your comment',
        'On: ' || resource_title,
        '/resource/' || NEW.resource_id::text,
        'MessageCircle'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_comment_reply ON public.comments;
CREATE TRIGGER trigger_notify_on_comment_reply
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment_reply();

-- Trigger: Notify resource creator on new comment
CREATE OR REPLACE FUNCTION notify_creator_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_id UUID;
  commenter_name TEXT;
  resource_title TEXT;
BEGIN
  -- Only for top-level comments
  IF NEW.parent_id IS NULL THEN
    SELECT r.creator_id, p.username, r.title
    INTO creator_id, commenter_name, resource_title
    FROM resources r
    INNER JOIN profiles p ON p.id = NEW.user_id
    WHERE r.id = NEW.resource_id;

    -- Notify creator if they didn't comment themselves
    IF creator_id != NEW.user_id THEN
      PERFORM create_notification(
        creator_id,
        'community',
        'new_comment',
        commenter_name || ' commented on your resource',
        'On: ' || resource_title,
        '/resource/' || NEW.resource_id::text,
        'MessageSquare'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_creator_on_comment ON public.comments;
CREATE TRIGGER trigger_notify_creator_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_creator_on_comment();

-- Trigger: Notify on new review
CREATE OR REPLACE FUNCTION notify_creator_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_id UUID;
  reviewer_name TEXT;
  resource_title TEXT;
  rating_score NUMERIC;
BEGIN
  SELECT r.creator_id, p.username, r.title, rat.score
  INTO creator_id, reviewer_name, resource_title, rating_score
  FROM resources r
  INNER JOIN profiles p ON p.id = NEW.user_id
  INNER JOIN ratings rat ON rat.id = NEW.rating_id
  WHERE r.id = NEW.resource_id;

  IF creator_id != NEW.user_id THEN
    PERFORM create_notification(
      creator_id,
      'community',
      'new_review',
      reviewer_name || ' reviewed your resource',
      resource_title || ' - ' || rating_score || ' stars',
      '/resource/' || NEW.resource_id::text,
      'Star'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_creator_on_review ON public.reviews;
CREATE TRIGGER trigger_notify_creator_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_creator_on_review();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- Migration: 20251030065128
-- Trigger types regeneration
-- Add a comment to trigger types file update
COMMENT ON TABLE public.resources IS 'Main resources table for Minecraft Gallery';


-- Migration: 20251030065254
-- Move pg_trgm extension from public to extensions schema
-- This fixes the "Extension in Public" security warning

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Grant usage on extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;


-- Migration: 20251030065714
-- Fix foreign key relationships for comments and reviews tables
-- These tables reference user_id but need proper foreign keys to auth.users

-- Add foreign key for comments.user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'comments_user_id_fkey'
  ) THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for comments.resource_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'comments_resource_id_fkey'
  ) THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT comments_resource_id_fkey 
    FOREIGN KEY (resource_id) 
    REFERENCES public.resources(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for reviews.user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reviews_user_id_fkey'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for review_replies.user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'review_replies_user_id_fkey'
  ) THEN
    ALTER TABLE public.review_replies
    ADD CONSTRAINT review_replies_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for comment_reactions.user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'comment_reactions_user_id_fkey'
  ) THEN
    ALTER TABLE public.comment_reactions
    ADD CONSTRAINT comment_reactions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for comment_reactions.comment_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'comment_reactions_comment_id_fkey'
  ) THEN
    ALTER TABLE public.comment_reactions
    ADD CONSTRAINT comment_reactions_comment_id_fkey 
    FOREIGN KEY (comment_id) 
    REFERENCES public.comments(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for ratings.user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ratings_user_id_fkey'
  ) THEN
    ALTER TABLE public.ratings
    ADD CONSTRAINT ratings_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for ratings.resource_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ratings_resource_id_fkey'
  ) THEN
    ALTER TABLE public.ratings
    ADD CONSTRAINT ratings_resource_id_fkey 
    FOREIGN KEY (resource_id) 
    REFERENCES public.resources(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

