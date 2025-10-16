import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Mail } from 'lucide-react';

interface ResultCardProps {
  email: string;
  provider: string;
  displayName: string;
  resultType: 'inbox' | 'spam' | 'promotions' | 'not_received';
  detectedAt?: string;
}

const resultConfig = {
  inbox: {
    icon: CheckCircle2,
    label: 'Inbox',
    className: 'bg-success/10 text-success border-success/20',
    iconClass: 'text-success',
  },
  spam: {
    icon: XCircle,
    label: 'Spam',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    iconClass: 'text-destructive',
  },
  promotions: {
    icon: AlertTriangle,
    label: 'Promotions',
    className: 'bg-warning/10 text-warning border-warning/20',
    iconClass: 'text-warning',
  },
  not_received: {
    icon: XCircle,
    label: 'Not Received',
    className: 'bg-muted text-muted-foreground border-border',
    iconClass: 'text-muted-foreground',
  },
};

export const ResultCard = ({ email, provider, displayName, resultType, detectedAt }: ResultCardProps) => {
  const config = resultConfig[resultType];
  const Icon = config.icon;

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{displayName}</h3>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
              {detectedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Detected {new Date(detectedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${config.className} flex items-center gap-1.5 shrink-0`}>
            <Icon className={`h-3.5 w-3.5 ${config.iconClass}`} />
            {config.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
