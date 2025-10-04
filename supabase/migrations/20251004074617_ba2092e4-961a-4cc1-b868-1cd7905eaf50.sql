-- Phase 1: Fix Critical Security Issues

-- 1. Fix rate_limits table RLS policies
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Create more restrictive policies
-- Only allow service role to manage rate limits (this will work from edge functions with service role key)
CREATE POLICY "Service role full access to rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can only read their own rate limit records
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (identifier = auth.uid()::text OR identifier = auth.email());

-- 2. Create initial admin user
-- First, we need to check if the user exists in the profiles table
-- The email thitichot@dit.daikin.co.jp should be used
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID from profiles table
  SELECT id INTO admin_user_id
  FROM public.profiles
  WHERE email = 'thitichot@dit.daikin.co.jp'
  LIMIT 1;

  -- If user exists, add admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role granted to user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User with email thitichot@dit.daikin.co.jp not found. Please create this user first, then run: INSERT INTO public.user_roles (user_id, role) SELECT id, ''admin''::app_role FROM public.profiles WHERE email = ''thitichot@dit.daikin.co.jp'';';
  END IF;
END $$;