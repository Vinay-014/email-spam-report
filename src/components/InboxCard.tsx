import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InboxCardProps {
  email: string;
  provider: string;
  displayName: string;
}

const providerColors = {
  gmail: 'bg-red-500/10 text-red-700 dark:text-red-400',
  outlook: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  yahoo: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  protonmail: 'bg-green-500/10 text-green-700 dark:text-green-400',
  aol: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
};

export const InboxCard = ({ email, provider, displayName }: InboxCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={handleCopy}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{displayName}</h3>
                <Badge 
                  variant="secondary" 
                  className={providerColors[provider as keyof typeof providerColors] || ''}
                >
                  {provider}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="shrink-0 p-2 hover:bg-secondary rounded-md transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
