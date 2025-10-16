-- Create enum for test status
CREATE TYPE test_status AS ENUM ('pending', 'checking', 'completed', 'failed');

-- Create enum for result type
CREATE TYPE result_type AS ENUM ('inbox', 'spam', 'promotions', 'not_received');

-- Create enum for email provider
CREATE TYPE email_provider AS ENUM ('gmail', 'outlook', 'yahoo', 'protonmail', 'aol');

-- Create profiles table for user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create test_inboxes table (our managed test email accounts)
CREATE TABLE test_inboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  provider email_provider NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  test_code TEXT NOT NULL UNIQUE,
  status test_status DEFAULT 'pending',
  report_url TEXT,
  deliverability_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create test_results table
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  inbox_email TEXT NOT NULL,
  provider email_provider NOT NULL,
  result_type result_type DEFAULT 'not_received',
  detected_at TIMESTAMPTZ,
  email_subject TEXT,
  email_from TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Test inboxes policies (publicly readable, admin only write)
CREATE POLICY "Anyone can view active test inboxes"
  ON test_inboxes FOR SELECT
  USING (is_active = true);

-- Tests policies
CREATE POLICY "Users can view own tests"
  ON tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tests"
  ON tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tests"
  ON tests FOR UPDATE
  USING (auth.uid() = user_id);

-- Test results policies
CREATE POLICY "Users can view results of own tests"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_results.test_id
      AND tests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert results for own tests"
  ON test_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_results.test_id
      AND tests.user_id = auth.uid()
    )
  );

-- Create function to update profile updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default test inboxes
INSERT INTO test_inboxes (email, provider, display_name) VALUES
  ('test1@spamcheck-gmail.com', 'gmail', 'Gmail Test Inbox'),
  ('test2@spamcheck-outlook.com', 'outlook', 'Outlook Test Inbox'),
  ('test3@spamcheck-yahoo.com', 'yahoo', 'Yahoo Test Inbox'),
  ('test4@spamcheck-proton.com', 'protonmail', 'ProtonMail Test Inbox'),
  ('test5@spamcheck-aol.com', 'aol', 'AOL Test Inbox');

-- Enable realtime for tests and test_results
ALTER PUBLICATION supabase_realtime ADD TABLE tests;
ALTER PUBLICATION supabase_realtime ADD TABLE test_results;