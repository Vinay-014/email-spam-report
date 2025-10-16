import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface ReportSummaryProps {
  totalTests: number;
  inbox: number;
  spam: number;
  promotions: number;
  notReceived: number;
  deliverabilityScore: number;
}

export const ReportSummary = ({
  totalTests,
  inbox,
  spam,
  promotions,
  notReceived,
  deliverabilityScore,
}: ReportSummaryProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <Card className="shadow-large border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Deliverability Report</CardTitle>
            <CardDescription>Overall email performance summary</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(deliverabilityScore)}`}>
              {deliverabilityScore}%
            </div>
            <p className="text-sm text-muted-foreground">{getScoreLabel(deliverabilityScore)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Deliverability Score</span>
            <span className="text-sm text-muted-foreground">{inbox} of {totalTests} delivered</span>
          </div>
          <Progress value={deliverabilityScore} className="h-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Inbox</span>
            </div>
            <p className="text-2xl font-bold">{inbox}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Spam</span>
            </div>
            <p className="text-2xl font-bold">{spam}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">Promotions</span>
            </div>
            <p className="text-2xl font-bold">{promotions}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Not Received</span>
            </div>
            <p className="text-2xl font-bold">{notReceived}</p>
          </div>
        </div>

        {deliverabilityScore < 80 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex gap-2">
              <TrendingUp className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Improvement Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Verify your domain's SPF, DKIM, and DMARC records</li>
                  <li>• Warm up your email address before sending campaigns</li>
                  <li>• Avoid spam trigger words in subject lines</li>
                  <li>• Maintain a clean email list with engaged subscribers</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
