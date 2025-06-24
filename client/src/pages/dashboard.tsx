import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import StatsOverview from "@/components/StatsOverview";
import TaskManager from "@/components/TaskManager";
import ActivityTracker from "@/components/ActivityTracker";
import SmartNotes from "@/components/SmartNotes";
import CalendarWidget from "@/components/CalendarWidget";
import FocusTimer from "@/components/FocusTimer";
import QuickCaptureModal from "@/components/QuickCaptureModal";
import { useFocusMode } from "@/hooks/useFocusMode";

export default function Dashboard() {
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const { focusMode, toggleFocusMode } = useFocusMode();

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
          <StatsOverview />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <TaskManager />
              <ActivityTracker />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <SmartNotes />
              <CalendarWidget />
              <FocusTimer />
            </div>
          </div>
        </div>

        <QuickCaptureModal
          isOpen={isQuickCaptureOpen}
          onClose={() => setIsQuickCaptureOpen(false)}
        />
      </div>
    </div>
  );
}
