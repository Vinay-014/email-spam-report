import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { TestProgress } from '@/components/TestProgress';
import { ResultCard } from '@/components/ResultCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Test {
  id: string;
  test_code: string;
  status: 'pending' | 'checking' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
}

interface TestResult {
  id: string;
  inbox_email: string;
  provider: string;
  result_type: 'inbox' | 'spam' | 'promotions' | 'not_received';
  detected_at: string | null;
}

interface TestInbox {
  id: string;
  email: string;
  provider: string;
  display_name: string;
}

const TestView = () => {
  const { testId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testInboxes, setTestInboxes] = useState<TestInbox[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchTest();
    fetchTestInboxes();

    // Set up realtime subscription for test updates
    const testChannel = supabase
      .channel(`test-${testId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tests',
          filter: `id=eq.${testId}`,
        },
        (payload) => {
          const newTest = payload.new as Test;
          setTest(newTest);
          if (newTest.status === 'completed') {
            toast.success('Test completed!');
          }
        }
      )
      .subscribe();

    // Set up realtime subscription for results
    const resultsChannel = supabase
      .channel(`results-${testId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_results',
          filter: `test_id=eq.${testId}`,
        },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      testChannel.unsubscribe();
      resultsChannel.unsubscribe();
    };
  }, [testId, user, navigate]);

  const fetchTest = async () => {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (error) {
      toast.error('Failed to load test');
      console.error(error);
      navigate('/dashboard');
    } else {
      setTest(data);
      fetchResults();
    }
    setLoading(false);
  };

  const fetchResults = async () => {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_id', testId)
      .order('created_at');

    if (!error && data) {
      setResults(data);
    }
  };

  const fetchTestInboxes = async () => {
    const { data } = await supabase
      .from('test_inboxes')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (data) {
      setTestInboxes(data);
    }
  };

  const getInboxDisplayName = (email: string) => {
    const inbox = testInboxes.find((i) => i.email === email);
    return inbox?.display_name || email;
  };

  const getResultForInbox = (email: string) => {
    return results.find((r) => r.inbox_email === email);
  };

  if (loading || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">Test #{test.test_code}</h1>
              <p className="text-sm text-muted-foreground">
                {test.status === 'checking' && 'Test in progress...'}
                {test.status === 'completed' && 'Test completed'}
                {test.status === 'pending' && 'Test pending'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress */}
          <TestProgress status={test.status} startedAt={test.started_at || undefined} />

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Test Results</h2>
              {test.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/report/${testId}`)}
                >
                  View Full Report
                </Button>
              )}
            </div>

            {testInboxes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading test inboxes...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {testInboxes.map((inbox) => {
                  const result = getResultForInbox(inbox.email);
                  return (
                    <ResultCard
                      key={inbox.id}
                      email={inbox.email}
                      provider={inbox.provider}
                      displayName={inbox.display_name}
                      resultType={result?.result_type || 'not_received'}
                      detectedAt={result?.detected_at || undefined}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          {test.status === 'completed' && (
            <div className="flex justify-center gap-4">
              <Button onClick={() => navigate('/dashboard')}>
                Run New Test
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/history')}
              >
                View History
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TestView;
