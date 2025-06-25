import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  onQuickCapture: () => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

export default function AppHeader({ onQuickCapture, focusMode, onToggleFocusMode }: AppHeaderProps) {
  const { user } = useAuth();

  const getGreeting = () => {
    // Get current time in user's local timezone (browser automatically handles this)
    const now = new Date();
    const hour = now.getHours();
    
    // More nuanced time-based greetings
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night"; // Late night/early morning hours
  };

  const getUserDisplayName = () => {
    if (!user) return "there";
    
    // Priority: firstName, then firstName + lastName, then email username
    if (user.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
    }
    
    // Fallback to email username if no first name
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      // Capitalize first letter and make it more readable
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }
    
    return "there";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    
    if (user.firstName) {
      const firstInitial = user.firstName.charAt(0).toUpperCase();
      const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : "";
      return firstInitial + lastInitial;
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return "U";
  };

  return (
    <header className="bg-white border-b border-charcoal-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">
                {getGreeting()}, {getUserDisplayName()} 👋
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
              <span className="text-sm text-charcoal-600">Smart Focus</span>
              <Switch checked={focusMode} onCheckedChange={onToggleFocusMode} />
              {focusMode && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
