import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ReportSummary } from '@/components/ReportSummary';
import { ResultCard } from '@/components/ResultCard';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const Report = () => {
  const { testId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testInboxes, setTestInboxes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [deliverabilityScore, setDeliverabilityScore] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [testId, user, navigate]);

  const fetchData = async () => {
    const [inboxesRes, resultsRes] = await Promise.all([
      supabase.from('test_inboxes').select('*').eq('is_active', true),
      supabase.from('test_results').select('*').eq('test_id', testId),
    ]);

    if (inboxesRes.data) setTestInboxes(inboxesRes.data);
    if (resultsRes.data) {
      setResults(resultsRes.data);
      const inbox = resultsRes.data.filter((r: any) => r.result_type === 'inbox').length;
      setDeliverabilityScore(Math.round((inbox / inboxesRes.data!.length) * 100));
    }
    setLoading(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Report link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const inbox = results.filter((r) => r.result_type === 'inbox').length;
  const spam = results.filter((r) => r.result_type === 'spam').length;
  const promotions = results.filter((r) => r.result_type === 'promotions').length;
  const notReceived = testInboxes.length - results.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Deliverability Report</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <ReportSummary
            totalTests={testInboxes.length}
            inbox={inbox}
            spam={spam}
            promotions={promotions}
            notReceived={notReceived}
            deliverabilityScore={deliverabilityScore}
          />

          <div>
            <h2 className="text-xl font-bold mb-4">Detailed Results</h2>
            <div className="grid gap-4">
              {testInboxes.map((inbox) => {
                const result = results.find((r) => r.inbox_email === inbox.email);
                return (
                  <ResultCard
                    key={inbox.id}
                    email={inbox.email}
                    provider={inbox.provider}
                    displayName={inbox.display_name}
                    resultType={result?.result_type || 'not_received'}
                    detectedAt={result?.detected_at}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Report;
