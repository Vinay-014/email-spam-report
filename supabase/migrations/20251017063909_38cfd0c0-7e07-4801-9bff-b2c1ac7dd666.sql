-- Fix the stuck test by marking it as failed
UPDATE tests 
SET status = 'failed', 
    completed_at = NOW() 
WHERE test_code = '4DDPTERC' AND status = 'checking';

-- Create a function to calculate deliverability score
CREATE OR REPLACE FUNCTION calculate_deliverability_score(test_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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