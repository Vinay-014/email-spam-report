import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, Clock, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Test Email Deliverability in Minutes
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Send test emails to multiple inboxes and get instant reports on spam detection, inbox placement, and deliverability scores.
          </p>

          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="bg-white text-primary hover:bg-white/90">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="border-white text-white hover:bg-white/10">
              Sign In
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <Clock className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Fast Results</h3>
              <p className="text-white/80 text-sm">Get complete reports in under 5 minutes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <Mail className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">5 Test Inboxes</h3>
              <p className="text-white/80 text-sm">Test across Gmail, Outlook, Yahoo & more</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <CheckCircle2 className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Detailed Reports</h3>
              <p className="text-white/80 text-sm">Know exactly where your emails land</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
