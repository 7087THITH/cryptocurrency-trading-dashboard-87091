-- Create a function to execute SQL queries (read-only)
CREATE OR REPLACE FUNCTION public.execute_sql(query_text text)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow SELECT queries for safety
  IF query_text !~* '^\s*SELECT' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  
  RETURN QUERY EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query_text);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;