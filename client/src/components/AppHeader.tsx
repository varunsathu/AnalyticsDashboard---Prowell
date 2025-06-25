import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Settings, LogOut, Zap, Brain, Palette } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  onQuickCapture: () => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

export default function AppHeader({ onQuickCapture, focusMode, onToggleFocusMode }: AppHeaderProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = '/auth/logout';
  };

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

  const getDailyReflection = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = now.getHours();
    
    // Define time periods
    let timePeriod: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timePeriod = 'morning';
    else if (hour >= 12 && hour < 17) timePeriod = 'afternoon';
    else if (hour >= 17 && hour < 22) timePeriod = 'evening';
    else timePeriod = 'night';

    const reflections = {
      Monday: {
        morning: "Who do you want to become by nightfall — and what brings you closer?",
        afternoon: "You've come this far — what's worth finishing strong?",
        evening: "What's something you're quietly proud of tonight?",
        night: "Your mind did enough today — let it rest like it deserves to."
      },
      Tuesday: {
        morning: "Today is a blank canvas — what's the first stroke you'll make?",
        afternoon: "The day's in motion — are you aligned with your momentum?",
        evening: "How did the creator in you express today?",
        night: "Rest easy — even your dreams deserve direction and purpose."
      },
      Wednesday: {
        morning: "What's one intention that could quietly shape the rest of your day?",
        afternoon: "Halfway through — what's the one thing still worth doing well today?",
        evening: "Even if the day felt ordinary, what made it yours?",
        night: "Not everything needs closure tonight — just your peace."
      },
      Thursday: {
        morning: "If you honored just one promise to yourself today, what would it be?",
        afternoon: "Pause. Recalibrate. What matters most in the remaining hours?",
        evening: "What tiny thing moved you forward — even if no one noticed?",
        night: "The world quiets down — what thought do you want to take into sleep?"
      },
      Friday: {
        morning: "What would a courageous version of you start doing right now?",
        afternoon: "What are you resisting that might actually free you up?",
        evening: "Did anything today surprise you — about yourself or the world?",
        night: "Inhale stillness. Exhale whatever wasn't yours to carry."
      },
      Saturday: {
        morning: "The morning is yours — what would feel like a small personal win by noon?",
        afternoon: "What deserves a second wind right now?",
        evening: "What part of today do you want to carry into tomorrow?",
        night: "Let go of the weight. Tomorrow's a fresh start with your name on it."
      },
      Sunday: {
        morning: "What kind of energy do you want to lead with today?",
        afternoon: "What's holding you back right now — and what would ease the block?",
        evening: "Did you stay true to something that matters to you today?",
        night: "What would you love to wake up excited about tomorrow?"
      }
    };

    return reflections[dayName as keyof typeof reflections]?.[timePeriod] || 
           "Ready to tackle your goals today?";
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
                {getDailyReflection()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Capture - Only show in focus mode if essential */}
            {!focusMode && (
              <Button onClick={onQuickCapture} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Quick Capture
              </Button>
            )}

            {/* Focus Mode Toggle with Settings Dropdown */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-charcoal-600">
                {focusMode ? "Deep Focus" : "Smart Focus"}
              </span>
              <Switch checked={focusMode} onCheckedChange={onToggleFocusMode} />
              {focusMode && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              )}
              
            </div>

            {/* Quick Thoughts in Focus Mode */}
            {focusMode && (
              <Button 
                onClick={onQuickCapture} 
                variant="outline"
                size="sm"
                className="border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                <Plus className="w-3 h-3 mr-1" />
                Capture Thought
              </Button>
            )}

            {/* Profile with Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-10 h-10 rounded-full p-0 bg-gradient-to-br from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700">
                  <div className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold">
                    {getUserInitials()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{getUserDisplayName()}</span>
                    {user?.email && (
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <Brain className="mr-2 h-4 w-4" />
                  Focus Presets
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Zap className="mr-2 h-4 w-4" />
                  Productivity Insights
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Palette className="mr-2 h-4 w-4" />
                  Ambient Sounds
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
