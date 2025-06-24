import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, GraduationCap, Coffee } from "lucide-react";

const activityIcons = {
  development: Github,
  learning: GraduationCap,
  entertainment: Coffee,
};

const activityColors = {
  development: { bg: "bg-blue-500", text: "text-blue-600" },
  learning: { bg: "bg-emerald-500", text: "text-emerald-600" },
  entertainment: { bg: "bg-amber-500", text: "text-amber-600" },
};

export default function ActivityTracker() {
  const { data: stats } = useQuery({
    queryKey: ["/api/activities/stats"],
  });

  const mockActivities = [
    {
      category: "development",
      title: "Development",
      description: "GitHub, Stack Overflow, Documentation",
      duration: 138, // 2h 18m
      percentage: 45,
    },
    {
      category: "learning",
      title: "Learning",
      description: "YouTube, Coursera, Medium articles",
      duration: 92, // 1h 32m
      percentage: 30,
    },
    {
      category: "entertainment",
      title: "Social & Entertainment",
      description: "Twitter, Reddit, Netflix",
      duration: 45,
      percentage: 15,
    },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-charcoal-900">Activity Tracking</CardTitle>
          <div className="flex items-center space-x-2">
            <Button size="sm" className="bg-teal-100 text-teal-700">
              Today
            </Button>
            <Button size="sm" variant="ghost" className="text-charcoal-600">
              Week
            </Button>
            <Button size="sm" variant="ghost" className="text-charcoal-600">
              Month
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Browser Activity */}
        <div className="mb-6">
          <h3 className="font-semibold text-charcoal-900 mb-4">Browser Activity</h3>
          <div className="space-y-3">
            {mockActivities.map((activity) => {
              const IconComponent = activityIcons[activity.category as keyof typeof activityIcons];
              const colors = activityColors[activity.category as keyof typeof activityColors];
              
              return (
                <div key={activity.category} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900">{activity.title}</p>
                      <p className="text-sm text-charcoal-600">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal-900">{formatTime(activity.duration)}</p>
                    <p className="text-xs text-charcoal-500">{activity.percentage}% of day</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Tracking Chart */}
        <div className="mb-6">
          <h3 className="font-semibold text-charcoal-900 mb-4">Daily Time Distribution</h3>
          <div className="h-64 bg-charcoal-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-charcoal-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                <div className="w-8 h-8 bg-charcoal-400 rounded-full" />
              </div>
              <p className="text-charcoal-600">Interactive pie chart showing time distribution across categories</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
