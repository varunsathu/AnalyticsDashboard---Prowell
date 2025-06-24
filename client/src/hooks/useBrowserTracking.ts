import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BrowserActivity {
  url: string;
  title: string;
  startTime: Date;
  category?: string;
}

export function useBrowserTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<BrowserActivity | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const createActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      return apiRequest("POST", "/api/browser-activities", activityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/browser-activities/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const categorizeUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      const categories = {
        development: ['github.com', 'stackoverflow.com', 'developer.mozilla.org', 'docs.google.com', 'codepen.io', 'jsfiddle.net'],
        learning: ['youtube.com', 'coursera.org', 'udemy.com', 'khanacademy.org', 'edx.org', 'pluralsight.com'],
        social: ['twitter.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'discord.com'],
        entertainment: ['netflix.com', 'spotify.com', 'twitch.tv', 'hulu.com', 'disney.com'],
        productivity: ['notion.so', 'trello.com', 'asana.com', 'slack.com', 'zoom.us', 'google.com'],
      };

      for (const [category, domains] of Object.entries(categories)) {
        if (domains.some(d => domain.includes(d))) {
          return category;
        }
      }

      return 'productivity';
    } catch {
      return 'productivity';
    }
  };

  const startTracking = () => {
    if (typeof window === 'undefined') return;
    
    setIsTracking(true);
    
    // Track initial page
    const initialActivity: BrowserActivity = {
      url: window.location.href,
      title: document.title,
      startTime: new Date(),
      category: categorizeUrl(window.location.href),
    };
    
    setCurrentActivity(initialActivity);

    // Track page changes and time spent
    intervalRef.current = setInterval(() => {
      if (currentActivity) {
        const now = new Date();
        const duration = Math.floor((now.getTime() - currentActivity.startTime.getTime()) / 1000);
        
        // Only track if user spent more than 10 seconds on the page
        if (duration >= 10) {
          const domain = new URL(currentActivity.url).hostname;
          
          createActivityMutation.mutate({
            url: currentActivity.url,
            domain,
            title: currentActivity.title,
            category: currentActivity.category || categorizeUrl(currentActivity.url),
            duration,
            startTime: currentActivity.startTime,
            endTime: now,
          });
        }
        
        // Update current activity
        setCurrentActivity({
          url: window.location.href,
          title: document.title,
          startTime: now,
          category: categorizeUrl(window.location.href),
        });
      }
    }, 30000); // Check every 30 seconds
  };

  const stopTracking = () => {
    setIsTracking(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Save final activity
    if (currentActivity) {
      const now = new Date();
      const duration = Math.floor((now.getTime() - currentActivity.startTime.getTime()) / 1000);
      
      if (duration >= 10) {
        const domain = new URL(currentActivity.url).hostname;
        
        createActivityMutation.mutate({
          url: currentActivity.url,
          domain,
          title: currentActivity.title,
          category: currentActivity.category || categorizeUrl(currentActivity.url),
          duration,
          startTime: currentActivity.startTime,
          endTime: now,
        });
      }
    }
    
    setCurrentActivity(null);
  };

  useEffect(() => {
    // Auto-start tracking when hook is initialized
    startTracking();
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTracking();
      } else {
        startTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopTracking();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    isTracking,
    currentActivity,
    startTracking,
    stopTracking,
  };
}