import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import PlainNotepad from "@/components/PlainNotepad";
import JournalEntry from "@/components/JournalEntry";
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
  const [activeView, setActiveView] = useState<'dashboard' | 'journal' | 'analytics'>('dashboard');
  
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

        {/* View Toggle */}
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-charcoal-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('journal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'journal'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-charcoal-50'
              }`}
            >
              Journal
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'analytics'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-charcoal-50'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-8">
          {activeView === 'journal' ? (
            /* Journal View */
            <JournalEntry />
          ) : activeView === 'analytics' ? (
            /* Analytics View */
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Browser & Activity Analytics */}
                <div className="space-y-8">
                  <ActivityTracker />
                  <WeeklyReport />
                </div>

                {/* Right Column - Health Metrics */}
                <div className="space-y-8">
                  <HealthMetrics />
                </div>
              </div>
            </div>
          ) : (
            /* Dashboard View */
            <div>
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
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                      <TaskManager />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                      <SmartNotes />
                      <CalendarWidget />
                      <FocusTimer />
                    </div>
                  </div>
                </div>
              )}
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
