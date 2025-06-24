import { useState, useEffect, useRef } from "react";

interface TimerSession {
  type: 'focus' | 'break';
  duration: number; // in seconds
}

export function useTimer() {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState<TimerSession>({ type: 'focus', duration: 25 * 60 });
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // in minutes
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      handleSessionComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (session.type === 'focus') {
      setCompletedSessions(prev => prev + 1);
      setTotalFocusTime(prev => prev + 25);
      
      // Switch to break
      const breakDuration = completedSessions % 4 === 3 ? 15 * 60 : 5 * 60; // Long break every 4 sessions
      setSession({ type: 'break', duration: breakDuration });
      setTime(breakDuration);
    } else {
      // Switch to focus
      setSession({ type: 'focus', duration: 25 * 60 });
      setTime(25 * 60);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(session.duration);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
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
