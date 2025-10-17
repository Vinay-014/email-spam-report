import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestInbox {
  id: string;
  email: string;
  provider: string;
  display_name: string;
}

interface Test {
  id: string;
  test_code: string;
  user_id: string;
  started_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting email check cycle...');

    // Get all active checking tests
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('*')
      .eq('status', 'checking');

    if (testsError) {
      console.error('Error fetching tests:', testsError);
      throw testsError;
    }

    if (!tests || tests.length === 0) {
      console.log('No active tests to check');
      return new Response(
        JSON.stringify({ message: 'No active tests' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tests.length} active test(s)`);

    // Get all active test inboxes
    const { data: inboxes, error: inboxesError } = await supabase
      .from('test_inboxes')
      .select('*')
      .eq('is_active', true);

    if (inboxesError) {
      console.error('Error fetching inboxes:', inboxesError);
      throw inboxesError;
    }

    // Process each test
    for (const test of tests as Test[]) {
      await processTest(supabase, test, inboxes as TestInbox[]);
    }

    return new Response(
      JSON.stringify({ message: 'Check completed', testsProcessed: tests.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-test-emails:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processTest(supabase: any, test: Test, inboxes: TestInbox[]) {
  console.log(`Processing test ${test.test_code}`);

  const startedAt = new Date(test.started_at);
  const now = new Date();
  const elapsedMinutes = (now.getTime() - startedAt.getTime()) / (1000 * 60);

  // Check if test should be completed (after 5 minutes)
  if (elapsedMinutes >= 5) {
    await completeTest(supabase, test.id);
    return;
  }

  // Simulate email checking with progressive results
  // In production, this would call real email provider APIs
  for (const inbox of inboxes) {
    await checkInbox(supabase, test, inbox, elapsedMinutes);
  }
}

async function checkInbox(
  supabase: any,
  test: Test,
  inbox: TestInbox,
  elapsedMinutes: number
) {
  // Check if result already exists
  const { data: existing } = await supabase
    .from('test_results')
    .select('*')
    .eq('test_id', test.id)
    .eq('inbox_email', inbox.email)
    .single();

  if (existing) {
    // Result already recorded
    return;
  }

  // Simulate progressive email detection
  // Results appear gradually over time (realistic simulation)
  const shouldDetect = Math.random() < (elapsedMinutes / 5) * 0.7; // 70% chance by end

  if (!shouldDetect) {
    console.log(`Email not yet detected in ${inbox.email}`);
    return;
  }

  // Simulate realistic deliverability distribution
  const rand = Math.random();
  let resultType: 'inbox' | 'spam' | 'promotions' | 'not_received';
  
  if (rand < 0.6) {
    resultType = 'inbox'; // 60% inbox
  } else if (rand < 0.75) {
    resultType = 'promotions'; // 15% promotions
  } else if (rand < 0.85) {
    resultType = 'spam'; // 10% spam
  } else {
    resultType = 'not_received'; // 15% not received
  }

  // Insert result
  const { error: insertError } = await supabase
    .from('test_results')
    .insert({
      test_id: test.id,
      inbox_email: inbox.email,
      provider: inbox.provider,
      result_type: resultType,
      detected_at: resultType !== 'not_received' ? new Date().toISOString() : null,
      email_subject: `Test Email - ${test.test_code}`,
      email_from: 'test@example.com'
    });

  if (insertError) {
    console.error(`Error inserting result for ${inbox.email}:`, insertError);
  } else {
    console.log(`Recorded ${resultType} for ${inbox.email}`);
  }
}

async function completeTest(supabase: any, testId: string) {
  console.log(`Completing test ${testId}`);

  // Calculate deliverability score using the database function
  const { data: scoreData, error: scoreError } = await supabase
    .rpc('calculate_deliverability_score', { test_uuid: testId });

  if (scoreError) {
    console.error('Error calculating score:', scoreError);
  }

  const deliverabilityScore = scoreData || 0;

  // Mark any inboxes without results as "not_received"
  const { data: inboxes } = await supabase
    .from('test_inboxes')
    .select('*')
    .eq('is_active', true);

  const { data: existingResults } = await supabase
    .from('test_results')
    .select('inbox_email')
    .eq('test_id', testId);

  const existingEmails = new Set(existingResults?.map((r: any) => r.inbox_email) || []);

  for (const inbox of inboxes || []) {
    if (!existingEmails.has(inbox.email)) {
      await supabase.from('test_results').insert({
        test_id: testId,
        inbox_email: inbox.email,
        provider: inbox.provider,
        result_type: 'not_received',
        detected_at: null
      });
    }
  }

  // Update test status
  const { error: updateError } = await supabase
    .from('tests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      deliverability_score: deliverabilityScore
    })
    .eq('id', testId);

  if (updateError) {
    console.error('Error completing test:', updateError);
  } else {
    console.log(`Test ${testId} completed with score ${deliverabilityScore}%`);
    
    // Trigger report email
    await supabase.functions.invoke('send-report-email', {
      body: { testId }
    });
  }
}
