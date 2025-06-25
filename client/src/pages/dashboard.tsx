import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import PlainNotepad from "@/components/PlainNotepad";
import StatsOverview from "@/components/StatsOverview";
import TaskManager from "@/components/TaskManager";
import ActivityTracker from "@/components/ActivityTracker";
import SmartNotes from "@/components/SmartNotes";
import CalendarWidget from "@/components/CalendarWidget";
import FocusTimer from "@/components/FocusTimer";
import HealthMetrics from "@/components/HealthMetrics";
import WeeklyReport from "@/components/WeeklyReport";
import QuickCaptureModal from "@/components/QuickCaptureModal";
import SmartFocusNotification from "@/components/SmartFocusNotification";
import { useFocusMode } from "@/hooks/useFocusMode";
import { useBrowserTracking } from "@/hooks/useBrowserTracking";

export default function Dashboard() {
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [showSmartFocusNotification, setShowSmartFocusNotification] = useState(false);
  const [smartFocusActivityType, setSmartFocusActivityType] = useState('');
  
  const { focusMode, toggleFocusMode } = useFocusMode();
  const { isTracking, currentActivity } = useBrowserTracking();

  // Show smart focus suggestions based on activity
  useEffect(() => {
    if (currentActivity && 
        (currentActivity.category === 'development' || currentActivity.category === 'learning') &&
        !focusMode) {
      setSmartFocusActivityType(currentActivity.category);
      setShowSmartFocusNotification(true);
    }
  }, [currentActivity, focusMode]);

  return (
    <div className="min-h-screen bg-charcoal-50 font-inter">
      {focusMode && <div className="focus-mode-overlay" />}
      
      <div className={focusMode ? "focus-mode-content" : ""}>
        <AppHeader
          onQuickCapture={() => setIsQuickCaptureOpen(true)}
          focusMode={focusMode}
          onToggleFocusMode={toggleFocusMode}
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Plain Notepad - Always visible in both modes */}
          <PlainNotepad focusMode={focusMode} />

          {focusMode ? (
            /* Focus Mode Layout - Minimal and Centered */
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Essential Focus Elements Only */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Task Focus */}
                <div className="focus-highlight">
                  <FocusTimer />
                </div>
                
                {/* Quick Thoughts & Notes */}
                <div className="focus-highlight">
                  <SmartNotes />
                </div>
              </div>
              
              {/* Minimal Task View - Only Active Tasks */}
              <div className="focus-highlight">
                <TaskManager />
              </div>
            </div>
          ) : (
            /* Normal Mode Layout */
            <div className="space-y-8">
              {/* Stats Overview moved below notepad */}
              <StatsOverview />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  <TaskManager />
                  <ActivityTracker />
                  <WeeklyReport />
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <SmartNotes />
                  <CalendarWidget />
                  <FocusTimer />
                  <HealthMetrics />
                </div>
              </div>
            </div>
          )}
        </div>

        <QuickCaptureModal
          isOpen={isQuickCaptureOpen}
          onClose={() => setIsQuickCaptureOpen(false)}
        />

        <SmartFocusNotification
          isVisible={showSmartFocusNotification}
          activityType={smartFocusActivityType}
          onAccept={() => {
            toggleFocusMode();
            setShowSmartFocusNotification(false);
          }}
          onDismiss={() => setShowSmartFocusNotification(false)}
        />
      </div>
    </div>
  );
}
