import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Heart, Activity, Footprints, Zap, Watch, Smartphone, Glasses, Circle, Moon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function HealthMetrics() {
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState<string>("auto");

  const { data: healthMetrics, isLoading } = useQuery({
    queryKey: ["/api/health-metrics/latest"],
  });

  const syncMutation = useMutation({
    mutationFn: async (deviceType: string) => {
      return await apiRequest(`/api/health-metrics/sync`, {
        method: "POST",
        body: JSON.stringify({ deviceType, source: selectedDevice }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-metrics/latest"] });
    },
  });

  const metrics = healthMetrics || {};
  
  const deviceTypes = [
    { id: "auto", name: "Auto-detect", icon: Zap, description: "Automatically sync from available devices" },
    { id: "apple_watch", name: "Apple Watch", icon: Watch, description: "Apple HealthKit integration" },
    { id: "android_watch", name: "Android Watch", icon: Watch, description: "Google Fit / Samsung Health" },
    { id: "fitbit", name: "Fitbit", icon: Activity, description: "Fitbit Web API" },
    { id: "smart_glasses", name: "Smart Glasses", icon: Glasses, description: "AR/VR fitness tracking" },
    { id: "smart_ring", name: "Smart Ring", icon: Circle, description: "Oura Ring / similar devices" },
  ];

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">Loading health data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Health Metrics
        </CardTitle>
        <CardDescription>Multi-device wellness tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Sync Source
          </label>
          <div className="grid grid-cols-2 gap-2">
            {deviceTypes.slice(0, 4).map((device) => {
              const Icon = device.icon;
              return (
                <Button
                  key={device.id}
                  variant={selectedDevice === device.id ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-auto p-2"
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-xs">{device.name}</div>
                  </div>
                </Button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {deviceTypes.slice(4).map((device) => {
              const Icon = device.icon;
              return (
                <Button
                  key={device.id}
                  variant={selectedDevice === device.id ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-auto p-2"
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-xs">{device.name}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Steps</span>
              <span className="font-medium">{metrics.steps?.value || 0}</span>
            </div>
            <Progress value={(metrics.steps?.value || 0) / 100} className="h-2" />
            <div className="text-xs text-slate-500">Goal: 10,000 steps</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Calories</span>
              <span className="font-medium">{metrics.calories?.value || 0}</span>
            </div>
            <Progress value={(metrics.calories?.value || 0) / 25} className="h-2" />
            <div className="text-xs text-slate-500">Goal: 2,500 calories</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{metrics.heartRate?.value || 72}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">BPM</div>
          </div>

          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Activity className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{metrics.workout?.value || 0}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Minutes</div>
          </div>

          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Moon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{metrics.sleep?.value || 8}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Hours</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              <Footprints className="w-3 h-3 mr-1" />
              {selectedDevice === "auto" ? "Multi-device" : deviceTypes.find(d => d.id === selectedDevice)?.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Last sync: 2min ago
            </Badge>
            {metrics.steps?.metadata?.accuracy && (
              <Badge variant="outline" className="text-xs">
                {Math.round(metrics.steps.metadata.accuracy * 100)}% accuracy
              </Badge>
            )}
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => syncMutation.mutate(selectedDevice)}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}