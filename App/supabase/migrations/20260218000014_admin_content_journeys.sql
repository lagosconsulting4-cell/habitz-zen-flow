-- Extend admin_content_stats to include journey counts
CREATE OR REPLACE VIEW public.admin_content_stats AS
SELECT
  (SELECT COUNT(*) FROM public.meditations) AS total_meditations,
  (SELECT COUNT(*) FROM public.quotes) AS total_quotes,
  (SELECT COUNT(*) FROM public.tips) AS total_tips,
  (SELECT COUNT(*) FROM public.books) AS total_books,
  (SELECT COUNT(*) FROM public.guided_days) AS total_guided_days,
  (SELECT COUNT(*) FROM public.journeys) AS total_journeys,
  (SELECT COUNT(*) FROM public.journey_days) AS total_journey_days,
  (SELECT COUNT(*) FROM public.journey_habit_templates) AS total_journey_habits;
