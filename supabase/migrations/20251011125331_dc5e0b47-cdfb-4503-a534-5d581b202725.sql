-- Add admin role check to execute_sql function
-- This prevents unauthorized users from querying any database table

DROP FUNCTION IF EXISTS public.execute_sql(text);

CREATE OR REPLACE FUNCTION public.execute_sql(query_text text)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Verify user has admin role
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Only allow SELECT queries for safety
  IF query_text !~* '^\s*SELECT' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  
  -- Log the query execution for audit purposes
  INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
  VALUES (
    auth.uid(),
    'SQL_QUERY',
    'execute_sql',
    NULL,
    jsonb_build_object('query', query_text, 'timestamp', now())
  );
  
  RETURN QUERY EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query_text);
END;
$$;

COMMENT ON FUNCTION public.execute_sql IS 'Execute SELECT queries with admin-only access and audit logging';