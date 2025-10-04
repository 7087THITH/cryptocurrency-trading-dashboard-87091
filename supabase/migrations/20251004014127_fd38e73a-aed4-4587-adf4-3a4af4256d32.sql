-- Step 1: User Roles System (skip enum creation as it exists)
-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Deny anonymous access to user_roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Deny anonymous access to user_roles"
  ON public.user_roles FOR SELECT
  TO anon
  USING (false);

-- Step 2: Update profiles RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own or admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

CREATE POLICY "Users can view own or admin can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Deny anonymous access to profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (false);

-- Step 5: Audit Logging System
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can read audit logs" ON public.audit_logs;

CREATE POLICY "Only admins can read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS profiles_audit_trigger ON public.profiles;

CREATE TRIGGER profiles_audit_trigger
  AFTER UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_changes();

-- Step 6: Backend Rate Limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  attempts integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(identifier, action)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits FOR ALL
  USING (true);