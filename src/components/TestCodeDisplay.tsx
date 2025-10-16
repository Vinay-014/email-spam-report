import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Key } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TestCodeDisplayProps {
  testCode: string;
}

export const TestCodeDisplay = ({ testCode }: TestCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(testCode);
    setCopied(true);
    toast.success('Test code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-medium border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Your Test Code</CardTitle>
            <CardDescription>Include this code in your email subject or body</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary p-4 rounded-lg flex items-center justify-between gap-4">
          <code className="text-2xl font-bold text-primary tracking-wider">
            {testCode}
          </code>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
