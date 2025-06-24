import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, GraduationCap, Coffee, Globe, Users, TrendingUp } from "lucide-react";

const activityIcons = {
  development: Github,
  learning: GraduationCap,
  entertainment: Coffee,
  social: Users,
  productivity: Globe,
};

const activityColors = {
  development: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
  learning: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" },
  entertainment: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
  social: { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50" },
  productivity: { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-50" },
};

export default function ActivityTracker() {
  const { data: browserStats } = useQuery({
    queryKey: ["/api/browser-activities/stats"],
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!browserStats) {
    return (
      <Card className="bg-white border border-charcoal-200">
        <CardHeader className="border-b border-charcoal-200">
          <CardTitle className="text-xl font-bold text-charcoal-900">Browser Activity Tracking</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-charcoal-100 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.entries(browserStats.categoryStats || {});
  const totalTimeFormatted = formatTime(browserStats.totalTime || 0);

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-charcoal-900">Browser Activity Tracking</CardTitle>
            <p className="text-sm text-charcoal-600 mt-1">
              Total screen time: {totalTimeFormatted} • Productivity Score: {browserStats.productivityScore || 0}%
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-teal-100 text-teal-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              {browserStats.productivityScore || 0}% productive
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Browser Categories */}
        <div className="mb-6">
          <h3 className="font-semibold text-charcoal-900 mb-4">Time by Category</h3>
          <div className="space-y-3">
            {categories.length > 0 ? categories.map(([category, stats]) => {
              const IconComponent = activityIcons[category as keyof typeof activityIcons] || Globe;
              const colors = activityColors[category as keyof typeof activityColors] || activityColors.productivity;
              
              return (
                <div key={category} className={`flex items-center justify-between p-4 ${colors.light} rounded-lg border border-charcoal-200`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900 capitalize">{category}</p>
                      <p className="text-sm text-charcoal-600">{stats.count} sites visited</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal-900">{formatTime(stats.duration)}</p>
                    <p className="text-xs text-charcoal-500">{stats.percentage}% of total</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-charcoal-500">
                No browser activity tracked today
              </div>
            )}
          </div>
        </div>

        {/* Top Domains */}
        {browserStats.topDomains && browserStats.topDomains.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-charcoal-900 mb-4">Top Websites</h3>
            <div className="space-y-2">
              {browserStats.topDomains.slice(0, 5).map((site, index) => (
                <div key={site.domain} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-charcoal-300 rounded-full flex items-center justify-center text-xs font-semibold text-charcoal-700">
                      {index + 1}
                    </div>
                    <p className="font-medium text-charcoal-900">{site.domain}</p>
                  </div>
                  <p className="text-sm text-charcoal-600">{formatTime(site.duration)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Insights */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
          <h4 className="font-semibold text-charcoal-900 mb-2">Smart Insights</h4>
          {browserStats.productivityScore >= 70 ? (
            <p className="text-sm text-charcoal-600">
              Great job! You're having a productive day. Keep up the focused work.
            </p>
          ) : browserStats.productivityScore >= 40 ? (
            <p className="text-sm text-charcoal-600">
              Good balance of work and breaks. Consider using focus mode for important tasks.
            </p>
          ) : (
            <p className="text-sm text-charcoal-600">
              Lots of entertainment and social activity detected. Try setting specific times for these activities.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
