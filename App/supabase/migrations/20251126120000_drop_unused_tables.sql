-- Migration: Drop unused tables
-- Tables confirmed as not being used in the codebase
-- Approved for deletion by user on 2025-11-26

-- Drop tables that have no references in the application code
DROP TABLE IF EXISTS tdah_archetypes CASCADE;
DROP TABLE IF EXISTS legacy_analysis_summaries CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
