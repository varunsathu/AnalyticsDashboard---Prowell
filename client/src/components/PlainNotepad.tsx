import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlainNotepadProps {
  focusMode?: boolean;
}

export default function PlainNotepad({ focusMode = false }: PlainNotepadProps) {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim() && (!lastSaved || Date.now() - lastSaved.getTime() > 30000)) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, lastSaved]);

  // Load saved content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('plainNotepad');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  const handleAutoSave = async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    try {
      localStorage.setItem('plainNotepad', content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('plainNotepad', content);
      setLastSaved(new Date());
      toast({
        title: "Saved",
        description: "Your notes have been saved locally",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save your notes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "";
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Saved just now";
    if (diffMins === 1) return "Saved 1 minute ago";
    if (diffMins < 60) return `Saved ${diffMins} minutes ago`;
    
    return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <Card className={`${focusMode ? 'focus-highlight border-teal-200' : 'bg-white border border-charcoal-200'} mb-8`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-charcoal-600" />
            <h3 className="text-lg font-semibold text-charcoal-900">Quick Notes</h3>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-charcoal-500">
                {formatLastSaved()}
              </span>
            )}
            <Button
              onClick={handleManualSave}
              disabled={isSaving}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Save className="w-3 h-3 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={focusMode 
              ? "Capture your thoughts, ideas, and notes while you focus..." 
              : "Write anything here - thoughts, ideas, meeting notes, reminders..."
            }
            className={`min-h-[300px] ${focusMode ? 'min-h-[400px]' : ''} border-0 resize-none focus:ring-0 focus:border-0 text-base leading-relaxed`}
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          />
        </div>

        {focusMode && (
          <div className="px-4 pb-4">
            <div className="text-xs text-charcoal-500 bg-charcoal-50 rounded p-2">
              💡 This notepad auto-saves as you type. Perfect for capturing thoughts without breaking your flow.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}