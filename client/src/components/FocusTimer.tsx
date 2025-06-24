import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";

export default function FocusTimer() {
  const {
    time,
    isRunning,
    session,
    completedSessions,
    totalFocusTime,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
  } = useTimer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const progress = session.type === 'focus' 
    ? ((25 * 60 - time) / (25 * 60)) * 100
    : ((5 * 60 - time) / (5 * 60)) * 100;

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <CardTitle className="text-xl font-bold text-charcoal-900">Focus Timer</CardTitle>
      </CardHeader>

      <CardContent className="p-6 text-center">
        {/* Timer Display */}
        <div className="mb-6">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="w-full h-full border-8 border-charcoal-200 rounded-full" />
            <div 
              className="absolute inset-0 border-8 border-teal-600 rounded-full transition-all duration-300"
              style={{
                clipPath: `polygon(50% 0%, 100% 0%, 100% ${progress}%, 50% 50%)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-charcoal-900">
                {formatTime(time)}
              </span>
            </div>
          </div>
          <p className="text-charcoal-600 font-medium capitalize">
            {session.type === 'focus' ? 'Focus Session' : 'Break Time'}
          </p>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={resetTimer}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            size="icon"
            className="w-16 h-16 rounded-full bg-teal-600 hover:bg-teal-700"
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={skipSession}
          >
            <FastForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-charcoal-900">{completedSessions}</p>
            <p className="text-sm text-charcoal-600">Sessions Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-charcoal-900">{formatFocusTime(totalFocusTime)}</p>
            <p className="text-sm text-charcoal-600">Focus Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
