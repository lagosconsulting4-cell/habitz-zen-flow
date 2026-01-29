-- =============================================
-- LEADS SEARCH RPC - Optimized Search Function
-- =============================================
-- Creates an optimized RPC function for searching leads
-- with full-text search, filters, sorting, and pagination
-- in a single database call for better performance.
-- =============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.search_leads(
  search_query text,
  status_filter text,
  source_filter text,
  page_num integer,
  page_size integer,
  sort_column text,
  sort_direction text
);

-- Create optimized search function
CREATE OR REPLACE FUNCTION public.search_leads(
  search_query text DEFAULT NULL,
  status_filter text DEFAULT NULL,
  source_filter text DEFAULT NULL,
  page_num integer DEFAULT 1,
  page_size integer DEFAULT 25,
  sort_column text DEFAULT 'created_at',
  sort_direction text DEFAULT 'desc'
)
RETURNS TABLE(
  -- Lead data
  id uuid,
  name text,
  email text,
  phone text,
  age_range text,
  profession text,
  work_schedule text,
  gender text,
  financial_range text,
  energy_peak text,
  time_available text,
  objective text,
  consistency_feeling text,
  projected_feeling text,
  years_promising text,
  follow_up_status text,
  notes text,
  tags text[],
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  converted_to_customer boolean,
  assigned_to uuid,
  created_at timestamptz,
  updated_at timestamptz,
  -- Pagination metadata
  total_count bigint,
  total_pages integer,
  current_page integer
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  offset_value integer;
  total_records bigint;
  total_pages_count integer;
  base_query text;
  where_conditions text[];
  where_clause text;
  order_clause text;
BEGIN
  -- Calculate offset
  offset_value := (page_num - 1) * page_size;

  -- Build WHERE conditions dynamically
  where_conditions := ARRAY[]::text[];

  -- Full-text search on name, email, phone
  IF search_query IS NOT NULL AND search_query != '' THEN
    where_conditions := array_append(
      where_conditions,
      format('(
        name ILIKE %L OR
        email ILIKE %L OR
        phone ILIKE %L
      )', '%' || search_query || '%', '%' || search_query || '%', '%' || search_query || '%')
    );
  END IF;

  -- Status filter
  IF status_filter IS NOT NULL AND status_filter != '' AND status_filter != 'all' THEN
    where_conditions := array_append(
      where_conditions,
      format('follow_up_status = %L', status_filter)
    );
  END IF;

  -- Source filter
  IF source_filter IS NOT NULL AND source_filter != '' AND source_filter != 'all' THEN
    where_conditions := array_append(
      where_conditions,
      format('source = %L', source_filter)
    );
  END IF;

  -- Combine WHERE conditions
  IF array_length(where_conditions, 1) > 0 THEN
    where_clause := 'WHERE ' || array_to_string(where_conditions, ' AND ');
  ELSE
    where_clause := '';
  END IF;

  -- Build ORDER BY clause with validation
  IF sort_column IN ('name', 'email', 'phone', 'follow_up_status', 'objective', 'created_at', 'updated_at') THEN
    IF sort_direction IN ('asc', 'desc') THEN
      order_clause := format('ORDER BY %I %s', sort_column, sort_direction);
    ELSE
      order_clause := format('ORDER BY %I desc', sort_column);
    END IF;
  ELSE
    order_clause := 'ORDER BY created_at desc';
  END IF;

  -- Get total count
  base_query := format('SELECT COUNT(*) FROM quiz_responses %s', where_clause);
  EXECUTE base_query INTO total_records;

  -- Calculate total pages
  total_pages_count := CEIL(total_records::numeric / page_size);

  -- Return paginated results with metadata
  RETURN QUERY EXECUTE format('
    SELECT
      qr.id,
      qr.name,
      qr.email,
      qr.phone,
      qr.age_range,
      qr.profession,
      qr.work_schedule,
      qr.gender,
      qr.financial_range,
      qr.energy_peak,
      qr.time_available,
      qr.objective,
      qr.consistency_feeling,
      qr.projected_feeling,
      qr.years_promising,
      qr.follow_up_status,
      qr.notes,
      qr.tags,
      qr.source,
      qr.utm_source,
      qr.utm_medium,
      qr.utm_campaign,
      qr.converted_to_customer,
      qr.assigned_to,
      qr.created_at,
      qr.updated_at,
      %L::bigint as total_count,
      %L::integer as total_pages,
      %L::integer as current_page
    FROM quiz_responses qr
    %s
    %s
    LIMIT %L OFFSET %L
  ',
    total_records,
    total_pages_count,
    page_num,
    where_clause,
    order_clause,
    page_size,
    offset_value
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_leads TO authenticated;

-- Create index for full-text search performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_search
ON quiz_responses USING gin(
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(email, '') || ' ' ||
    coalesce(phone, '')
  )
);

-- Create index for common filter columns
CREATE INDEX IF NOT EXISTS idx_quiz_responses_follow_up_status
ON quiz_responses(follow_up_status);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_source
ON quiz_responses(source);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at_desc
ON quiz_responses(created_at DESC);

-- Add comment
COMMENT ON FUNCTION public.search_leads IS
'Optimized search function for leads with full-text search, filters, sorting, and pagination.
Returns leads with total count and pagination metadata in a single query.
Used by admin dashboard for efficient lead searching and filtering.';
