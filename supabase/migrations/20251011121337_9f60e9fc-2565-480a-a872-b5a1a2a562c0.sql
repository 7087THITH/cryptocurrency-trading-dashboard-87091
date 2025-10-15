-- Move pg_net extension from public schema to extensions schema
-- This addresses the "Extension in Public" security warning

-- Drop the extension from public schema if it exists there
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Install pg_net in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Recreate cron jobs with updated schema reference
-- Note: The cron jobs will need to reference extensions.http_post instead of net.http_post