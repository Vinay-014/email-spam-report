import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Clock, TrendingUp } from 'lucide-react';

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchHistory();
  }, [user, navigate]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('tests')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setTests(data);
    setLoading(false);
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Test History</h1>

          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => navigate(`/report/${test.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Test #{test.test_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(test.created_at).toLocaleDateString()} at {new Date(test.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {test.deliverability_score && (
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <span className="font-bold">{test.deliverability_score}%</span>
                          </div>
                        </div>
                      )}
                      <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {tests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No tests yet. Create your first test!</p>
                  <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                    Create Test
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
