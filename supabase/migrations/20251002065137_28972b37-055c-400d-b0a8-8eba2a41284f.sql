-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
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

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Update historical_exchange_rates policies
DROP POLICY IF EXISTS "Allow public read access to exchange rates" ON historical_exchange_rates;
DROP POLICY IF EXISTS "Allow service role insert to exchange rates" ON historical_exchange_rates;

CREATE POLICY "Public can read exchange rates"
  ON historical_exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert exchange rates"
  ON historical_exchange_rates FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update historical_lme_prices policies
DROP POLICY IF EXISTS "Allow public read access to LME prices" ON historical_lme_prices;
DROP POLICY IF EXISTS "Allow service role insert to LME prices" ON historical_lme_prices;

CREATE POLICY "Public can read LME prices"
  ON historical_lme_prices FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert LME prices"
  ON historical_lme_prices FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update historical_shfe_prices policies
DROP POLICY IF EXISTS "Allow public read access to SHFE prices" ON historical_shfe_prices;
DROP POLICY IF EXISTS "Allow service role insert to SHFE prices" ON historical_shfe_prices;

CREATE POLICY "Public can read SHFE prices"
  ON historical_shfe_prices FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert SHFE prices"
  ON historical_shfe_prices FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();