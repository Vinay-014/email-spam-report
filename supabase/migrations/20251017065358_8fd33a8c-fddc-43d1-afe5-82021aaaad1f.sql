-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Fix the search_path warning for the calculate_deliverability_score function
CREATE OR REPLACE FUNCTION calculate_deliverability_score(test_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inbox_count INTEGER;
  total_count INTEGER;
  score INTEGER;
BEGIN
  -- Count emails in inbox
  SELECT COUNT(*) INTO inbox_count
  FROM test_results
  WHERE test_id = test_uuid AND result_type = 'inbox';
  
  -- Count total results
  SELECT COUNT(*) INTO total_count
  FROM test_results
  WHERE test_id = test_uuid;
  
  -- Calculate percentage score
  IF total_count = 0 THEN
    RETURN 0;
  END IF;
  
  score := ROUND((inbox_count::DECIMAL / total_count::DECIMAL) * 100);
  RETURN score;
END;
$$;

-- Schedule the check-test-emails function to run every 30 seconds
SELECT cron.schedule(
  'check-test-emails-job',
  '*/30 * * * * *', -- Every 30 seconds (cron syntax with seconds)
  $$
  SELECT
    net.http_post(
      url := 'https://jovamxpapmluynyeoyhk.supabase.co/functions/v1/check-test-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdmFteHBhcG1sdXlueWVveWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTc2OTIsImV4cCI6MjA3NjEzMzY5Mn0.ksmN4CB1KVmC3pBd_ojXvVfDSi_Eb9_SUMj13C_35U8"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);