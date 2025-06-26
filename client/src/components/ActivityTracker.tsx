import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, GraduationCap, Coffee, Globe, Users, TrendingUp, Eye, EyeOff, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isTracking, setIsTracking] = useState(() => {
    return localStorage.getItem('browser-tracking-enabled') === 'true';
  });
  const [currentUrl, setCurrentUrl] = useState('');
  const [activeTime, setActiveTime] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch browser activity stats with real-time updates
  const { data: browserStats, refetch } = useQuery({
    queryKey: ["/api/browser-activities/stats"],
    refetchInterval: isTracking ? 5000 : false, // Refresh every 5 seconds when tracking
    staleTime: 0, // Always consider data stale for real-time updates
  });

  // Mutation to save browser activity
  const saveActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const response = await fetch("/api/browser-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityData),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save activity: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/browser-activities/stats"] });
    },
  });

  // Track browser activity with real-time updates
  useEffect(() => {
    if (!isTracking) return;

    let startTime = Date.now();
    let currentDomain = '';
    let sessionId = `session_${Date.now()}`;

    const getCurrentDomain = () => {
      try {
        return window.location.hostname || 'replit.app';
      } catch (e) {
        return 'replit.app';
      }
    };

    const saveActivity = (domain: string, duration: number) => {
      if (duration > 3) { // Track activities longer than 3 seconds
        saveActivityMutation.mutate({
          url: `https://${domain}`,
          title: document.title || domain,
          domain: domain,
          duration,
          startTime: new Date(Date.now() - duration * 1000).toISOString(),
          endTime: new Date().toISOString(),
        });
      }
    };

    const trackActivity = () => {
      const newDomain = getCurrentDomain();
      
      if (newDomain !== currentDomain) {
        // Save previous domain activity
        if (currentDomain) {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          saveActivity(currentDomain, duration);
        }
        
        // Start tracking new domain
        currentDomain = newDomain;
        startTime = Date.now();
        sessionId = `session_${Date.now()}`;
      }
      
      setCurrentUrl(`https://${newDomain}`);
    };

    // Initialize tracking
    trackActivity();

    // Track visibility changes (tab switch, minimize window)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - save current session
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (currentDomain) {
          saveActivity(currentDomain, duration);
        }
      } else {
        // Page visible - restart tracking
        startTime = Date.now();
        currentDomain = getCurrentDomain();
      }
    };

    // Track window focus/blur
    const handleFocus = () => {
      startTime = Date.now();
      currentDomain = getCurrentDomain();
    };

    const handleBlur = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (currentDomain) {
        saveActivity(currentDomain, duration);
      }
    };

    // Save activity before page unload with security validation
    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (currentDomain && duration > 0 && duration < 86400) { // Max 24 hours
        try {
          // Security: Sanitize domain and validate data
          const sanitizedDomain = currentDomain.replace(/[^a-zA-Z0-9.-]/g, '');
          const sanitizedTitle = (document.title || currentDomain).substring(0, 200);
          
          const data = JSON.stringify({
            url: `https://${sanitizedDomain}`,
            title: sanitizedTitle,
            domain: sanitizedDomain,
            duration: Math.min(duration, 86400), // Cap at 24 hours
            startTime: new Date(Date.now() - duration * 1000).toISOString(),
            endTime: new Date().toISOString(),
          });
          
          navigator.sendBeacon('/api/browser-activities', data);
        } catch (error) {
          console.warn('Failed to save activity data:', error);
        }
      }
    };

    // Periodic save every 30 seconds for long sessions
    const periodicSave = setInterval(() => {
      if (!document.hidden && currentDomain) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (duration >= 30) {
          saveActivity(currentDomain, duration);
          startTime = Date.now(); // Reset timer
        }
      }
    }, 30000);

    // Active time counter
    const activeTimer = setInterval(() => {
      if (!document.hidden) {
        setActiveTime(prev => prev + 1);
      }
    }, 1000);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      // Cleanup
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearInterval(periodicSave);
      clearInterval(activeTimer);
      
      // Final save on cleanup
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (currentDomain && duration > 0) {
        saveActivity(currentDomain, duration);
      }
    };
  }, [isTracking, saveActivityMutation]);

  const toggleTracking = () => {
    const newTrackingState = !isTracking;
    setIsTracking(newTrackingState);
    localStorage.setItem('browser-tracking-enabled', newTrackingState.toString());
    
    if (newTrackingState) {
      toast({
        title: "Browser Tracking Enabled",
        description: "Now monitoring your browser activity for productivity insights",
      });
      refetch();
    } else {
      toast({
        title: "Browser Tracking Disabled",
        description: "Browser activity monitoring has been turned off",
      });
    }
  };

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

  const typedBrowserStats = browserStats as any;
  const categoryStats = typedBrowserStats?.categoryStats || {};
  const totalTime = typedBrowserStats?.totalTime || 0;
  const categories = Object.entries(categoryStats);
  const totalTimeFormatted = formatTime(totalTime);

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-charcoal-900">Browser Activity Tracking</CardTitle>
            <p className="text-sm text-charcoal-600 mt-1">
              {isTracking ? (
                <>Total screen time: {totalTimeFormatted} • Productivity Score: {(browserStats as any)?.productivityScore || 0}%</>
              ) : (
                "Activity tracking is disabled"
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isTracking}
                onCheckedChange={toggleTracking}
                className="data-[state=checked]:bg-teal-600"
              />
              <span className="text-sm text-charcoal-600">
                {isTracking ? "Tracking" : "Disabled"}
              </span>
            </div>
            {isTracking && (
              <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                {(browserStats as any)?.productivityScore || 0}% productive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!isTracking ? (
          <Alert className="mb-6">
            <EyeOff className="h-4 w-4" />
            <AlertDescription>
              Browser activity tracking is disabled. Enable tracking to see your productivity insights and website usage patterns.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Current Activity Display */}
        {isTracking && (
          <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-charcoal-900">Live Activity Tracking</span>
              </div>
              <div className="text-sm text-charcoal-600">
                Session time: {formatTime(activeTime)}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-charcoal-600">
              <span>Current domain: {currentUrl ? new URL(currentUrl).hostname : 'replit.app'}</span>
              <span>Updates every 5 seconds</span>
            </div>
          </div>
        )}

        {/* Browser Categories */}
        <div className="mb-6">
          <h3 className="font-semibold text-charcoal-900 mb-4">Time by Category</h3>
          <div className="space-y-3">
            {isTracking && browserStats ? (
              Object.entries((browserStats as any)?.categoryStats || {}).length > 0 ? 
                Object.entries((browserStats as any)?.categoryStats || {}).map(([category, stats]: [string, any]) => {
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
                          <p className="text-sm text-charcoal-600">{stats?.count || 0} sites visited</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-charcoal-900">{formatTime(stats?.duration || 0)}</p>
                        <p className="text-xs text-charcoal-500">{stats?.percentage || 0}% of total</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-charcoal-500">
                    No browser activity tracked today. Start browsing to see insights.
                  </div>
                )
            ) : (
              <div className="text-center py-8 text-charcoal-500">
                {isTracking ? "Loading activity data..." : "Enable tracking to view activity breakdown"}
              </div>
            )}
          </div>
        </div>

        {/* Top Domains */}
        {isTracking && browserStats && (browserStats as any)?.topDomains?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-charcoal-900 mb-4">Top Websites</h3>
            <div className="space-y-2">
              {((browserStats as any)?.topDomains || []).slice(0, 5).map((site: any, index: number) => (
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
        {isTracking && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
            <h4 className="font-semibold text-charcoal-900 mb-2">Smart Insights</h4>
            {browserStats ? (
              (browserStats as any)?.productivityScore >= 70 ? (
                <p className="text-sm text-charcoal-600">
                  Great job! You're having a productive day. Keep up the focused work.
                </p>
              ) : (browserStats as any)?.productivityScore >= 40 ? (
                <p className="text-sm text-charcoal-600">
                  Good balance of work and breaks. Consider using focus mode for important tasks.
                </p>
              ) : (
                <p className="text-sm text-charcoal-600">
                  {(browserStats as any)?.productivityScore > 0 
                    ? "Lots of entertainment and social activity detected. Try setting specific times for these activities."
                    : "Start browsing to see productivity insights and recommendations."
                  }
                </p>
              )
            ) : (
              <p className="text-sm text-charcoal-600">
                Activity data will appear here as you browse. Insights include productivity scores and recommendations.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
