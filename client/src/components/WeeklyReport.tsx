import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertCircle, CheckCircle, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, subWeeks } from "date-fns";

export default function WeeklyReport() {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date()));
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/weekly-reports"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (weekStart: Date) => {
      return apiRequest("POST", "/api/weekly-reports/generate", { weekStart });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-reports"] });
      toast({ title: "Weekly report generated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to generate report", variant: "destructive" });
    },
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
    }
  };

  const latestReport = reports[0];

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-charcoal-600" />
            <CardTitle className="text-xl font-bold text-charcoal-900">Weekly Insights</CardTitle>
          </div>
          <Button
            onClick={() => generateReportMutation.mutate(selectedWeek)}
            disabled={generateReportMutation.isPending}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!latestReport ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
            <p className="text-charcoal-600 mb-2">No weekly reports yet</p>
            <p className="text-sm text-charcoal-500 mb-4">
              Generate your first weekly report to see productivity insights and recommendations
            </p>
            <Button
              onClick={() => generateReportMutation.mutate(selectedWeek)}
              disabled={generateReportMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Generate This Week's Report
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Week of {format(new Date(latestReport.weekStart), 'MMM d, yyyy')}
                </h3>
                <p className="text-sm text-charcoal-600 mt-1">
                  {format(new Date(latestReport.weekStart), 'MMM d')} - {format(new Date(latestReport.weekEnd), 'MMM d')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">
                  {latestReport.productivityScore}%
                </div>
                <p className="text-sm text-charcoal-600">Productivity Score</p>
              </div>
            </div>

            {/* Browser Activity Summary */}
            <div>
              <h4 className="font-semibold text-charcoal-900 mb-3">Browser Activity Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatTime(latestReport.browserStats.totalTime)}
                  </p>
                  <p className="text-sm text-blue-700">Total Screen Time</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">
                    {latestReport.browserStats.topSites?.length || 0}
                  </p>
                  <p className="text-sm text-green-700">Unique Sites</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-2xl font-bold text-amber-600">
                    {Object.keys(latestReport.browserStats.categories || {}).length}
                  </p>
                  <p className="text-sm text-amber-700">Categories</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {latestReport.browserStats.categories && (
              <div>
                <h4 className="font-semibold text-charcoal-900 mb-3">Time by Category</h4>
                <div className="space-y-2">
                  {Object.entries(latestReport.browserStats.categories)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([category, time]) => {
                      const percentage = latestReport.browserStats.totalTime > 0 
                        ? Math.round(((time as number) / latestReport.browserStats.totalTime) * 100)
                        : 0;
                      
                      return (
                        <div key={category} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                          <div>
                            <p className="font-medium text-charcoal-900 capitalize">{category}</p>
                            <p className="text-sm text-charcoal-600">{percentage}% of total time</p>
                          </div>
                          <p className="font-semibold text-charcoal-900">
                            {formatTime(time as number)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {latestReport.recommendations && latestReport.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-charcoal-900 mb-3">Smart Recommendations</h4>
                <div className="space-y-3">
                  {latestReport.recommendations.map((rec: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {rec.priority === 'high' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-1">{rec.message}</p>
                          <p className="text-sm opacity-80">{rec.suggestion}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rec.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Week Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-charcoal-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const previousWeek = subWeeks(selectedWeek, 1);
                  setSelectedWeek(previousWeek);
                  generateReportMutation.mutate(previousWeek);
                }}
                disabled={generateReportMutation.isPending}
              >
                Previous Week
              </Button>
              <p className="text-sm text-charcoal-600">
                Generated {format(new Date(latestReport.createdAt), 'MMM d, h:mm a')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateReportMutation.mutate(new Date())}
                disabled={generateReportMutation.isPending}
              >
                This Week
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}