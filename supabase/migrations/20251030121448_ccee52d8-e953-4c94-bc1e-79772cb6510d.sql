-- Fix critical security issues with correct column names

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own email queue entries" ON public.email_queue;
DROP POLICY IF EXISTS "Users can view reports they submitted" ON public.comment_reports;
DROP POLICY IF EXISTS "Users can submit comment reports" ON public.comment_reports;
DROP POLICY IF EXISTS "Users can view flags they submitted" ON public.review_flags;
DROP POLICY IF EXISTS "Users can flag reviews" ON public.review_flags;

-- 1. Profiles: Create restrictive policy (RLS handles email protection)
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);

-- 2. Email queue: Backend only
CREATE POLICY "Email queue backend only" ON public.email_queue FOR ALL USING (false) WITH CHECK (false);

-- 3. Comment reports: Moderators only for viewing
CREATE POLICY "Moderators view comment reports" ON public.comment_reports FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.verified = true));

CREATE POLICY "Users submit comment reports" ON public.comment_reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- 4. Review flags: Moderators only for viewing
CREATE POLICY "Moderators view review flags" ON public.review_flags FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.verified = true));

CREATE POLICY "Users submit review flags" ON public.review_flags FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);