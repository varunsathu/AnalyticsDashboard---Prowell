import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

interface AppHeaderProps {
  onQuickCapture: () => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

export default function AppHeader({ onQuickCapture, focusMode, onToggleFocusMode }: AppHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="bg-white border-b border-charcoal-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">
                {getGreeting()}, Varun 👋
              </h1>
              <p className="text-charcoal-600 text-sm mt-1">
                Ready to tackle your goals today?
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Capture */}
            <Button onClick={onQuickCapture} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Quick Capture
            </Button>

            {/* Focus Mode Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-charcoal-600">Focus Mode</span>
              <Switch checked={focusMode} onCheckedChange={onToggleFocusMode} />
              {focusMode && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>

            {/* Profile */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold">
              V
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
