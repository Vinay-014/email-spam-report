import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { InboxCard } from '@/components/InboxCard';
import { TestCodeDisplay } from '@/components/TestCodeDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut, History, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface TestInbox {
  id: string;
  email: string;
  provider: string;
  display_name: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [testInboxes, setTestInboxes] = useState<TestInbox[]>([]);
  const [testCode, setTestCode] = useState<string>('');
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchTestInboxes();
    checkActiveTest();
  }, [user, navigate]);

  const fetchTestInboxes = async () => {
    const { data, error } = await supabase
      .from('test_inboxes')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      toast.error('Failed to load test inboxes');
      console.error(error);
    } else {
      setTestInboxes(data || []);
    }
    setLoading(false);
  };

  const checkActiveTest = async () => {
    const { data } = await supabase
      .from('tests')
      .select('*')
      .eq('user_id', user?.id)
      .in('status', ['pending', 'checking'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setCurrentTestId(data.id);
      setTestCode(data.test_code);
      if (data.status === 'checking') {
        navigate(`/test/${data.id}`);
      }
    }
  };

  const generateTestCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreateTest = async () => {
    if (!user) return;

    setIsCreatingTest(true);
    const newTestCode = generateTestCode();

    const { data, error } = await supabase
      .from('tests')
      .insert({
        user_id: user.id,
        test_code: newTestCode,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create test');
      console.error(error);
    } else {
      setTestCode(newTestCode);
      setCurrentTestId(data.id);
      toast.success('Test created! Copy the code and include it in your email.');
    }

    setIsCreatingTest(false);
  };

  const handleStartTest = async () => {
    if (!currentTestId) return;

    setIsStartingTest(true);

    const { error } = await supabase
      .from('tests')
      .update({ 
        status: 'checking',
        started_at: new Date().toISOString(),
      })
      .eq('id', currentTestId);

    if (error) {
      toast.error('Failed to start test');
      console.error(error);
      setIsStartingTest(false);
    } else {
      toast.success('Test started! Checking inboxes...');
      navigate(`/test/${currentTestId}`);
    }
  };

  if (loading) {
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SpamCheck Pro
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Test Your Email Deliverability</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Send a test email to our inboxes and get a detailed report on where it lands.
              Results typically ready in under 5 minutes.
            </p>
          </div>

          {/* Test Code Section */}
          {testCode ? (
            <div className="space-y-6">
              <TestCodeDisplay testCode={testCode} />
              
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Instructions
                  </CardTitle>
                  <CardDescription>Follow these steps to complete your test</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Copy your test code</p>
                        <p className="text-sm text-muted-foreground">
                          Click the copy button above to copy your unique test code
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Send email to test inboxes</p>
                        <p className="text-sm text-muted-foreground">
                          Include the test code in your email's subject or body, then send to all test inboxes below
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Start the test</p>
                        <p className="text-sm text-muted-foreground">
                          Click "Start Test" below once you've sent the email
                        </p>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={handleStartTest}
                      disabled={isStartingTest}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {isStartingTest ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Start Test
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center">
              <Button
                onClick={handleCreateTest}
                disabled={isCreatingTest}
                size="lg"
                className="min-w-[200px]"
              >
                {isCreatingTest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create New Test
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Test Inboxes */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Test Inboxes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testInboxes.map((inbox) => (
                <InboxCard
                  key={inbox.id}
                  email={inbox.email}
                  provider={inbox.provider}
                  displayName={inbox.display_name}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
