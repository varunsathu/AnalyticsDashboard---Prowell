import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivateAccess() {
  const handleAuth = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-50 to-charcoal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-charcoal-200">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-4 bg-teal-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-teal-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-charcoal-900">
            Welcome to Your Productivity Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-charcoal-700">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Sign In Required</span>
          </div>
          
          <p className="text-charcoal-600 text-sm leading-relaxed">
            Access your personal productivity dashboard with task management, focus timers, 
            analytics, and journaling features. Sign in to get started.
          </p>
          
          <div className="pt-4 space-y-3">
            <Button 
              onClick={handleAuth}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              Sign In to Continue
            </Button>
            
            <p className="text-xs text-charcoal-500">
              Start tracking your productivity and achieving your goals today.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}