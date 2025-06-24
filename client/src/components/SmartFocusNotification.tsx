import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, X, Focus } from "lucide-react";

interface SmartFocusNotificationProps {
  isVisible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
  activityType: string;
}

export default function SmartFocusNotification({ 
  isVisible, 
  onAccept, 
  onDismiss, 
  activityType 
}: SmartFocusNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, onDismiss]);

  if (!show) return null;

  const getMessage = () => {
    switch (activityType) {
      case 'development':
        return 'Development work detected. Enable focus mode for better concentration?';
      case 'learning':
        return 'Learning activity detected. Would you like to start a focus session?';
      case 'productivity':
        return 'Productive work detected. Focus mode can help eliminate distractions.';
      default:
        return 'Focus mode recommended for this activity.';
    }
  };

  return (
    <div className="smart-focus-notification">
      <Card className="w-80 p-4 bg-white border border-teal-200 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-charcoal-900 mb-1">Smart Focus</h4>
            <p className="text-sm text-charcoal-600 mb-3">
              {getMessage()}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => {
                  onAccept();
                  setShow(false);
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Focus className="w-3 h-3 mr-1" />
                Enable
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onDismiss();
                  setShow(false);
                }}
                className="text-charcoal-600"
              >
                Not now
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onDismiss();
              setShow(false);
            }}
            className="text-charcoal-400 hover:text-charcoal-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}