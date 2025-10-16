import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TestProgressProps {
  status: 'pending' | 'checking' | 'completed' | 'failed';
  startedAt?: string;
}

export const TestProgress = ({ status, startedAt }: TestProgressProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'checking' && startedAt) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
        setElapsedTime(elapsed);
        // Progress simulation (0-90% over 5 minutes)
        const newProgress = Math.min(90, (elapsed / 300) * 90);
        setProgress(newProgress);
      }, 1000);

      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setProgress(100);
    }
  }, [status, startedAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Waiting to start test...';
      case 'checking':
        return 'Checking inboxes for your email...';
      case 'completed':
        return 'Test completed successfully!';
      case 'failed':
        return 'Test failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <div className="flex items-center gap-2">
          {status === 'checking' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {status !== 'checking' && <Clock className="h-5 w-5 text-primary" />}
          <div>
            <CardTitle className="text-lg">Test Progress</CardTitle>
            <CardDescription>{getStatusMessage()}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {status === 'checking' ? `${formatTime(elapsedTime)} elapsed` : ''}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Typical test duration: 2-5 minutes</p>
          <p>• Checking all {5} test inboxes</p>
          <p>• Results update in real-time</p>
        </div>
      </CardContent>
    </Card>
  );
};
