import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testId } = await req.json();

    if (!testId) {
      throw new Error('testId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get test details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      throw new Error('Test not found');
    }

    // Get user email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', test.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Get test results
    const { data: results, error: resultsError } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_id', testId);

    if (resultsError) {
      throw resultsError;
    }

    // Calculate result counts
    const inboxCount = results?.filter((r: any) => r.result_type === 'inbox').length || 0;
    const spamCount = results?.filter((r: any) => r.result_type === 'spam').length || 0;
    const promotionsCount = results?.filter((r: any) => r.result_type === 'promotions').length || 0;
    const notReceivedCount = results?.filter((r: any) => r.result_type === 'not_received').length || 0;

    // Generate email HTML
    const reportUrl = `${supabaseUrl.replace('https://', 'https://jovamxpapmluynyeoyhk.')}/report/${testId}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .score { font-size: 48px; font-weight: bold; margin: 20px 0; }
            .results { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .result-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dee2e6; }
            .result-item:last-child { border-bottom: none; }
            .badge { padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
            .badge-inbox { background: #d1fae5; color: #065f46; }
            .badge-spam { background: #fee2e2; color: #991b1b; }
            .badge-promotions { background: #fef3c7; color: #92400e; }
            .badge-not-received { background: #e5e7eb; color: #374151; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">Your Email Deliverability Report</h1>
            <div class="score">${test.deliverability_score}%</div>
            <p style="margin: 0; opacity: 0.9;">Test Code: ${test.test_code}</p>
          </div>

          <p>Your email deliverability test has been completed! Here's a summary of your results:</p>

          <div class="results">
            <div class="result-item">
              <span><strong>📥 Inbox</strong></span>
              <span class="badge badge-inbox">${inboxCount} inbox${inboxCount !== 1 ? 'es' : ''}</span>
            </div>
            <div class="result-item">
              <span><strong>🚫 Spam</strong></span>
              <span class="badge badge-spam">${spamCount} inbox${spamCount !== 1 ? 'es' : ''}</span>
            </div>
            <div class="result-item">
              <span><strong>📮 Promotions</strong></span>
              <span class="badge badge-promotions">${promotionsCount} inbox${promotionsCount !== 1 ? 'es' : ''}</span>
            </div>
            <div class="result-item">
              <span><strong>❌ Not Received</strong></span>
              <span class="badge badge-not-received">${notReceivedCount} inbox${notReceivedCount !== 1 ? 'es' : ''}</span>
            </div>
          </div>

          ${test.deliverability_score < 80 ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <strong>💡 Improvement Tips:</strong>
              <ul style="margin: 10px 0;">
                <li>Verify your domain's SPF, DKIM, and DMARC records</li>
                <li>Use a professional email service provider</li>
                <li>Avoid spam trigger words in your content</li>
                <li>Maintain a clean email list with engaged subscribers</li>
              </ul>
            </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${reportUrl}" class="cta-button">View Full Report</a>
          </div>

          <div class="footer">
            <p>This report will remain available in your dashboard for future reference.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Email Deliverability Tester</p>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const { data, error: resendError } = await resend.emails.send({
      from: 'Deliverability Report <onboarding@resend.dev>',
      to: [profile.email],
      subject: `Your Email Deliverability Report - ${test.deliverability_score}% Score`,
      html: emailHtml,
    });

    if (resendError) {
      console.error('Error sending email:', resendError);
      throw resendError;
    }

    console.log('Report email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-report-email:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
