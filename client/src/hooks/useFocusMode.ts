import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useFocusMode() {
  const [focusMode, setFocusMode] = useState(false);
  const [focusSession, setFocusSession] = useState<any>(null);
  const queryClient = useQueryClient();

  const createFocusSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      return apiRequest("POST", "/api/focus-sessions", sessionData);
    },
    onSuccess: (data) => {
      setFocusSession(data);
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const updateFocusSessionMutation = useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: number; data: any }) => {
      return apiRequest("PUT", `/api/focus-sessions/${sessionId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem("focusMode");
    if (stored) {
      setFocusMode(JSON.parse(stored));
    }
  }, []);

  const toggleFocusMode = () => {
    const newFocusMode = !focusMode;
    setFocusMode(newFocusMode);
    localStorage.setItem("focusMode", JSON.stringify(newFocusMode));

    if (newFocusMode) {
      // Start focus session
      createFocusSessionMutation.mutate({
        type: 'focus',
        duration: 25, // 25 minutes
        completedDuration: 0,
        startTime: new Date(),
      });

      // Add body class for focus mode styling
      document.body.classList.add('focus-mode-active');
      
      // Hide distracting elements
      const distractingElements = document.querySelectorAll('.focus-hide');
      distractingElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    } else {
      // End focus session
      if (focusSession) {
        const now = new Date();
        const startTime = new Date(focusSession.startTime);
        const completedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
        
        updateFocusSessionMutation.mutate({
          sessionId: focusSession.id,
          data: {
            endTime: now,
            completedDuration: Math.min(completedMinutes, 25),
          },
        });
      }

      setFocusSession(null);
      document.body.classList.remove('focus-mode-active');
      
      // Show hidden elements
      const distractingElements = document.querySelectorAll('.focus-hide');
      distractingElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    }
  };

  const enableSmartFocus = () => {
    // Automatically enable focus mode during work activities
    const currentUrl = window.location.href;
    const workDomains = ['github.com', 'stackoverflow.com', 'docs.google.com'];
    
    if (workDomains.some(domain => currentUrl.includes(domain)) && !focusMode) {
      setFocusMode(true);
      localStorage.setItem("focusMode", JSON.stringify(true));
    }
  };

  return {
    focusMode,
    focusSession,
    toggleFocusMode,
    enableSmartFocus,
  };
}
