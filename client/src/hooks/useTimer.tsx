import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

interface FocusSession {
  id: number;
  userId: string;
  type: string;
  duration: number;
  completedDuration: number;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
}

interface InsertFocusSession {
  type: string;
  duration: number;
  completedDuration: number;
  startTime: Date;
  endTime?: Date;
}

interface Session {
  type: 'focus' | 'break';
  duration: number; // in seconds
}

export function useTimer() {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState<Session>({ type: 'focus', duration: 25 * 60 });
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's focus sessions
  const { data: todaysSessions = [] } = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions", { date: new Date().toISOString().split('T')[0] }],
    queryFn: async () => {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const response = await fetch(
        `/api/focus-sessions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch focus sessions");
      return response.json();
    },
  });

  // Create focus session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: InsertFocusSession) => {
      const response = await fetch("/api/focus-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sessionData,
          startTime: sessionData.startTime.toISOString(),
          endTime: sessionData.endTime?.toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create focus session");
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
    },
  });

  // Update focus session
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, sessionData }: { id: number; sessionData: Partial<InsertFocusSession> }) => {
      const response = await fetch(`/api/focus-sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sessionData,
          endTime: sessionData.endTime?.toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to update focus session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
    },
  });

  // Calculate stats
  const completedSessions = todaysSessions.filter(s => s.type === 'focus' && s.completedDuration > 0).length;
  const totalFocusTime = Math.round(
    todaysSessions
      .filter(s => s.type === 'focus')
      .reduce((acc, s) => acc + s.completedDuration, 0) / 60
  );

  // Timer effect
  useEffect(() => {
    if (isRunning && time > 0) {
      timerRef.current = setTimeout(() => {
        setTime(time - 1);
      }, 1000);
    } else if (time === 0) {
      completeSession();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, time]);

  const startTimer = () => {
    if (!isRunning && !sessionStartTime) {
      // Start new session
      const startTime = new Date();
      setSessionStartTime(startTime);
      
      createSessionMutation.mutate({
        type: session.type,
        duration: session.duration,
        completedDuration: 0,
        startTime: startTime,
      });
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(session.duration);
    setSessionStartTime(null);
    setCurrentSessionId(null);
  };

  const skipSession = () => {
    completeSession();
  };

  const completeSession = () => {
    setIsRunning(false);
    
    if (currentSessionId && sessionStartTime) {
      const completedDuration = session.duration - time;
      const endTime = new Date();
      
      updateSessionMutation.mutate({
        id: currentSessionId,
        sessionData: {
          completedDuration,
          endTime,
        },
      });
    }

    // Switch session type
    if (session.type === 'focus') {
      setSession({ type: 'break', duration: 5 * 60 });
      setTime(5 * 60);
      toast({
        title: "Focus session completed!",
        description: "Time for a short break.",
      });
    } else {
      setSession({ type: 'focus', duration: 25 * 60 });
      setTime(25 * 60);
      toast({
        title: "Break time over!",
        description: "Ready for another focus session?",
      });
    }
    
    setSessionStartTime(null);
    setCurrentSessionId(null);
  };

  return {
    time,
    isRunning,
    session,
    completedSessions,
    totalFocusTime,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
  };
}