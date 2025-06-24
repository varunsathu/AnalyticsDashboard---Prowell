import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useVoiceCapture } from "@/hooks/useVoiceCapture";
import { useToast } from "@/hooks/use-toast";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCaptureModal({ isOpen, onClose }: QuickCaptureModalProps) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isListening, transcript, startListening, stopListening } = useVoiceCapture();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Task created successfully!" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      return apiRequest("POST", "/api/notes", noteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Note created successfully!" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create note", variant: "destructive" });
    },
  });

  const handleClose = () => {
    setContent("");
    stopListening();
    onClose();
  };

  const handleSaveAsTask = () => {
    const taskContent = content || transcript;
    if (!taskContent.trim()) return;

    createTaskMutation.mutate({
      title: taskContent.trim(),
      category: "personal",
      priority: "medium",
    });
  };

  const handleSaveAsNote = () => {
    const noteContent = content || transcript;
    if (!noteContent.trim()) return;

    createNoteMutation.mutate({
      title: "Quick Note",
      content: noteContent.trim(),
      category: "general",
    });
  };

  const handleVoiceCapture = () => {
    if (isListening) {
      stopListening();
      setContent(transcript);
    } else {
      startListening();
    }
  };

  const displayContent = content || transcript;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-charcoal-900">
              Quick Capture
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-charcoal-700 mb-2">
              What's on your mind?
            </Label>
            <Textarea
              value={displayContent}
              onChange={(e) => setContent(e.target.value)}
              className="h-32 resize-none"
              placeholder="Task, note, or idea..."
            />
            {isListening && (
              <p className="text-xs text-teal-600 mt-1">
                Listening... Click the microphone to stop
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSaveAsTask}
              disabled={!displayContent.trim() || createTaskMutation.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              Save as Task
            </Button>
            <Button
              onClick={handleSaveAsNote}
              disabled={!displayContent.trim() || createNoteMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              Save as Note
            </Button>
          </div>

          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className={`w-12 h-12 rounded-full ${
                isListening
                  ? "bg-red-100 hover:bg-red-200 text-red-600"
                  : "bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-600"
              }`}
              onClick={handleVoiceCapture}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
