import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, FileText, Plus, Files } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Note, InsertNote } from "@shared/schema";

interface PlainNotepadProps {
  focusMode?: boolean;
}

export default function PlainNotepad({ focusMode = false }: PlainNotepadProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's notes
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: InsertNote) => {
      return apiRequest("/api/notes", {
        method: "POST",
        body: JSON.stringify(noteData),
      });
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setCurrentNoteId(newNote.id);
      setIsCreating(false);
      toast({
        title: "Note created",
        description: "Your note has been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Could not save your note",
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, noteData }: { id: number; noteData: Partial<InsertNote> }) => {
      return apiRequest(`/api/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(noteData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note updated",
        description: "Your changes have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Could not update your note",
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim() && currentNoteId && !isCreating) {
        updateNoteMutation.mutate({
          id: currentNoteId,
          noteData: { content, title: title || "Quick Note" }
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, title, currentNoteId, isCreating]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before saving",
        variant: "destructive",
      });
      return;
    }

    if (isCreating) {
      createNoteMutation.mutate({
        title: title || "Quick Note",
        content,
        category: "quick",
        tags: ["quick-notes"],
      });
    } else if (currentNoteId) {
      updateNoteMutation.mutate({
        id: currentNoteId,
        noteData: { content, title: title || "Quick Note" }
      });
    }
  };

  const handleNewNote = () => {
    setContent("");
    setTitle("");
    setCurrentNoteId(null);
    setIsCreating(true);
  };

  const handleLoadNote = (noteId: string) => {
    const note = notes.find(n => n.id.toString() === noteId);
    if (note) {
      setContent(note.content);
      setTitle(note.title);
      setCurrentNoteId(note.id);
      setIsCreating(false);
    }
  };

  const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;
  const currentNote = currentNoteId ? notes.find(n => n.id === currentNoteId) : null;

  return (
    <Card className={`${focusMode ? 'focus-highlight border-teal-200' : 'bg-white border border-charcoal-200'} mb-8`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-charcoal-600" />
            <h3 className="text-lg font-semibold text-charcoal-900">Quick Notes</h3>
            {currentNote && (
              <span className="text-sm text-charcoal-500">
                - {currentNote.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notes.length > 0 && (
              <Select onValueChange={handleLoadNote}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Load note" />
                </SelectTrigger>
                <SelectContent>
                  {notes.slice(0, 10).map((note) => (
                    <SelectItem key={note.id} value={note.id.toString()}>
                      {note.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={handleNewNote}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              New
            </Button>
            <Button
              onClick={handleSave}
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
        
        <div className="p-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title (optional)"
            className="w-full px-3 py-2 text-sm border border-charcoal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
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

        {(focusMode || isCreating) && (
          <div className="px-4 pb-4">
            <div className="text-xs text-charcoal-500 bg-charcoal-50 rounded p-2">
              💡 {isCreating 
                ? "Click Save to create a new note. Auto-saves after creation."
                : "This notepad auto-saves as you type. Perfect for capturing thoughts without breaking your flow."
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}