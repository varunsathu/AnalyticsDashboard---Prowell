import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, Target, TrendingUp } from "lucide-react";

export default function StatsOverview() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-charcoal-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const focusTime = stats.focusTime || 0;
  const tasksCompleted = stats.tasksCompleted || 0;
  const totalTasks = stats.totalTasks || 0;
  const weeklyGoals = stats.weeklyGoals || 0;
  const totalWeeklyGoals = stats.totalWeeklyGoals || 15;
  const productivityScore = stats.productivityScore || 0;

  const focusProgress = Math.min(100, Math.round((focusTime / 240) * 100)); // 4h goal
  const taskProgress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
  const weeklyProgress = Math.min(100, Math.round((weeklyGoals / totalWeeklyGoals) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white border border-charcoal-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-charcoal-600 text-sm font-medium">Today's Focus</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-2">
                {formatTime(focusTime)}
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-charcoal-200 rounded-full h-2">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${focusProgress}%` }}
              />
            </div>
            <p className="text-xs text-charcoal-500 mt-2">{focusProgress}% of 4h goal</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-charcoal-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-charcoal-600 text-sm font-medium">Tasks Completed Today</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-2">
                {tasksCompleted}/{totalTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-charcoal-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${taskProgress}%` }}
              />
            </div>
            <p className="text-xs text-charcoal-500 mt-2">
              {taskProgress >= 80 ? "Excellent progress!" : 
               taskProgress >= 50 ? "Good progress today!" : 
               taskProgress > 0 ? "Keep going!" : "Ready to start?"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-charcoal-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-charcoal-600 text-sm font-medium">Weekly Goals</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-2">
                {weeklyGoals}/{totalWeeklyGoals}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-charcoal-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
            <p className="text-xs text-charcoal-500 mt-2">
              {weeklyProgress >= 80 ? "Crushing it this week!" : 
               weeklyProgress >= 50 ? "On track for this week" : 
               weeklyProgress > 0 ? "Building momentum" : "Week just started"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-charcoal-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-charcoal-600 text-sm font-medium">Productivity Score</p>
              <p className="text-3xl font-bold text-charcoal-900 mt-2">
                {productivityScore}%
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-charcoal-200 rounded-full h-2">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${productivityScore}%` }}
              />
            </div>
            <p className="text-xs text-charcoal-500 mt-2">
              {productivityScore >= 80 ? "Outstanding performance!" : 
               productivityScore >= 60 ? "Strong productivity!" : 
               productivityScore >= 40 ? "Room for improvement" : 
               productivityScore > 0 ? "Getting started" : "Ready to be productive!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
