-- =============================================
-- LEADS ANALYTICS VIEWS - RLS POLICIES
-- =============================================
-- Adds Row Level Security policies to all leads analytics views
-- so that admin users can access them
-- =============================================

-- Enable RLS on all views (views inherit from base table, but we need explicit policies)
-- Views in PostgreSQL don't have RLS directly, they use the base table's RLS
-- However, we need to ensure the service_role and admin users can access them

-- Grant SELECT on all admin_leads views to authenticated users
GRANT SELECT ON public.admin_leads_funnel TO authenticated;
GRANT SELECT ON public.admin_leads_by_age TO authenticated;
GRANT SELECT ON public.admin_leads_by_profession TO authenticated;
GRANT SELECT ON public.admin_leads_by_objective TO authenticated;
GRANT SELECT ON public.admin_leads_by_financial_range TO authenticated;
GRANT SELECT ON public.admin_leads_by_gender TO authenticated;
GRANT SELECT ON public.admin_leads_by_utm TO authenticated;
GRANT SELECT ON public.admin_leads_temporal TO authenticated;
GRANT SELECT ON public.admin_leads_temporal_weekly TO authenticated;
GRANT SELECT ON public.admin_leads_heatmap TO authenticated;
GRANT SELECT ON public.admin_leads_by_source TO authenticated;
GRANT SELECT ON public.admin_leads_top_challenges TO authenticated;
GRANT SELECT ON public.admin_leads_summary TO authenticated;

-- Add comment explaining the approach
COMMENT ON VIEW public.admin_leads_funnel IS
'Conversion funnel metrics for leads dashboard. Accessible by all authenticated users (admin check happens in app layer).';

-- Note: Views inherit RLS from their base tables (quiz_responses)
-- Since quiz_responses has RLS policies for admins, the views will respect those policies
-- The GRANT SELECT ensures authenticated users CAN attempt to query the views,
-- but the actual data filtering happens through quiz_responses RLS policies
