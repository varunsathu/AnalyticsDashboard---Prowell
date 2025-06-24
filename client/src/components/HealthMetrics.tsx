import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Footprints, Flame, Activity, Watch } from "lucide-react";

const metricIcons = {
  steps: Footprints,
  heartRate: Heart,
  calories: Flame,
  workout: Activity,
};

const metricColors = {
  steps: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
  heartRate: { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50" },
  calories: { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50" },
  workout: { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50" },
};

export default function HealthMetrics() {
  const { data: healthMetrics } = useQuery({
    queryKey: ["/api/health-metrics/latest"],
  });

  const formatValue = (type: string, value: number, unit: string) => {
    if (type === 'steps') {
      return value.toLocaleString();
    }
    if (type === 'calories') {
      return value.toLocaleString();
    }
    return value.toString();
  };

  const getGoalProgress = (type: string, value: number) => {
    const goals = {
      steps: 10000,
      heartRate: 75, // resting heart rate goal
      calories: 2200,
      workout: 60, // minutes per day
    };

    const goal = goals[type as keyof typeof goals];
    if (!goal) return 0;

    if (type === 'heartRate') {
      // For heart rate, lower is better (within healthy range)
      return value <= goal ? 100 : Math.max(0, 100 - ((value - goal) / goal * 100));
    }

    return Math.min(100, (value / goal) * 100);
  };

  if (!healthMetrics || Object.keys(healthMetrics).length === 0) {
    return (
      <Card className="bg-white border border-charcoal-200">
        <CardHeader className="border-b border-charcoal-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Watch className="w-5 h-5 text-charcoal-600" />
              <CardTitle className="text-xl font-bold text-charcoal-900">Health & Fitness</CardTitle>
            </div>
            <Badge variant="outline" className="text-charcoal-600">
              Apple Watch
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Watch className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
            <p className="text-charcoal-600 mb-2">Connect your Apple Watch</p>
            <p className="text-sm text-charcoal-500">
              Sync your health data to track fitness goals and wellness metrics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = Object.values(healthMetrics);

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Watch className="w-5 h-5 text-charcoal-600" />
            <CardTitle className="text-xl font-bold text-charcoal-900">Health & Fitness</CardTitle>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200">
            Connected
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {metrics.map((metric) => {
            const IconComponent = metricIcons[metric.type as keyof typeof metricIcons] || Activity;
            const colors = metricColors[metric.type as keyof typeof metricColors] || metricColors.workout;
            const progress = getGoalProgress(metric.type, metric.value);
            
            return (
              <div key={metric.type} className={`p-4 ${colors.light} rounded-lg border border-charcoal-200`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900 capitalize">
                        {metric.type === 'heartRate' ? 'Heart Rate' : metric.type}
                      </p>
                      <p className="text-sm text-charcoal-600">
                        {metric.type === 'workout' && metric.metadata?.type 
                          ? `${metric.metadata.type} workout`
                          : metric.type === 'heartRate' && metric.metadata?.context
                          ? metric.metadata.context
                          : 'Today'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-charcoal-900">
                      {formatValue(metric.type, metric.value, metric.unit)}
                    </p>
                    <p className="text-sm text-charcoal-600">{metric.unit}</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-charcoal-200 rounded-full h-2 mb-2">
                  <div 
                    className={`${colors.bg} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-charcoal-500">
                  <span>{Math.round(progress)}% of goal</span>
                  {metric.type === 'steps' && <span>Goal: 10,000</span>}
                  {metric.type === 'calories' && <span>Goal: 2,200</span>}
                  {metric.type === 'workout' && <span>Goal: 60 min</span>}
                  {metric.type === 'heartRate' && <span>Target: ≤75 bpm</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Health Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-charcoal-900 mb-2">Today's Health Score</h4>
          <div className="flex items-center justify-between">
            <p className="text-sm text-charcoal-600">
              {metrics.length >= 3 ? "Great activity day! Keep up the momentum." : 
               metrics.length >= 2 ? "Good progress on your health goals." : 
               "Start your day with some movement!"}
            </p>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < Math.ceil(metrics.length / 1) ? 'bg-green-500' : 'bg-charcoal-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}