import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Calendar, Clock, Target, TrendingUp, Volume2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-slate-600 bg-clip-text text-transparent">
              ProductiveMind
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Transform your productivity with intelligent activity tracking, focus management, and personalized insights.
          </p>
          <div className="mt-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started
            </Button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Smart Activity Tracking</CardTitle>
              <CardDescription>
                Automatically categorize your browser activities and track time spent on different tasks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Focus Mode</CardTitle>
              <CardDescription>
                Smart Pomodoro timer that activates automatically when you're in deep work mode.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Universal Health Integration</CardTitle>
              <CardDescription>
                Connect with Apple Watch, Android watches, Fitbit, smart glasses, and smart rings for comprehensive wellness tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-lg">Task Management</CardTitle>
              <CardDescription>
                Organize tasks by priority, track time estimates, and monitor completion rates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-lg">Weekly Reports</CardTitle>
              <CardDescription>
                Get personalized productivity insights and actionable recommendations each week.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader>
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-3">
                <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-lg">Smart Notes</CardTitle>
              <CardDescription>
                Capture ideas with voice-to-text, organize with tags, and search intelligently.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader>
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-3">
                <Volume2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle className="text-lg">Ambient Soundscapes</CardTitle>
              <CardDescription>
                Adaptive background audio with rain, ocean, forest sounds, and instrumental music to enhance focus.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-r from-teal-500/10 to-slate-500/10 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to boost your productivity?</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Join thousands of users who have transformed their daily workflow with intelligent productivity tracking and insights.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-teal-200 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-900/20"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}