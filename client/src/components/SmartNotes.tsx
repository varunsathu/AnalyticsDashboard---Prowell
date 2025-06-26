import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { encryptNoteContent, decryptNoteContent } from "@/lib/encryption";
import type { Note, InsertNote } from "@shared/schema";

export default function SmartNotes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Construct query URL with proper parameters
  const queryKey = useMemo(() => {
    if (debouncedSearchQuery.trim()) {
      return ["/api/notes/search", debouncedSearchQuery];
    }
    return ["/api/notes"];
  }, [debouncedSearchQuery]);

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey,
    queryFn: async () => {
      let url = "/api/notes";
      if (debouncedSearchQuery.trim()) {
        url = `/api/notes/search?q=${encodeURIComponent(debouncedSearchQuery)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: InsertNote) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error("Failed to create note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes/search"] });
      setIsCreateDialogOpen(false);
      setNewNoteTitle("");
      setNewNoteContent("");
      setNewNoteTags("");
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, noteData }: { id: number; noteData: Partial<InsertNote> }) => {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error("Failed to update note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes/search"] });
      setEditingNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes/search"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const handleCreateNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    const tags = newNoteTags.split(",").map(tag => tag.trim()).filter(Boolean);
    
    createNoteMutation.mutate({
      title: newNoteTitle,
      content: newNoteContent,
      category: "general",
      tags: tags,
    });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setNewNoteTags(Array.isArray(note.tags) ? note.tags.join(", ") : "");
    setIsCreateDialogOpen(true);
  };

  const handleUpdateNote = () => {
    if (!editingNote || !newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    const tags = newNoteTags.split(",").map(tag => tag.trim()).filter(Boolean);
    
    updateNoteMutation.mutate({
      id: editingNote.id,
      noteData: {
        title: newNoteTitle,
        content: newNoteContent,
        tags: tags,
      },
    });
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const getTagColor = (tag: string) => {
    const colors = {
      work: "bg-blue-100 text-blue-700",
      planning: "bg-amber-100 text-amber-700",
      learning: "bg-emerald-100 text-emerald-700",
      goals: "bg-teal-100 text-teal-700",
      personal: "bg-purple-100 text-purple-700",
      projects: "bg-orange-100 text-orange-700",
      general: "bg-gray-100 text-gray-700",
      "quick-notes": "bg-green-100 text-green-700",
    };
    return colors[tag as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-charcoal-900">Smart Notes</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                onClick={() => {
                  setEditingNote(null);
                  setNewNoteTitle("");
                  setNewNoteContent("");
                  setNewNoteTags("");
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Enter note title..."
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Write your note content..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newNoteTags}
                    onChange={(e) => setNewNoteTags(e.target.value)}
                    placeholder="work, personal, ideas..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingNote ? handleUpdateNote : handleCreateNote}
                    disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                  >
                    {editingNote ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-charcoal-400" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-charcoal-50 rounded-lg animate-pulse">
                <div className="h-4 bg-charcoal-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-charcoal-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-charcoal-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-charcoal-500 mb-4">
              {searchQuery ? "No notes found matching your search." : "No notes yet. Create your first note!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-charcoal-900 flex-1">{note.title}</h4>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditNote(note)}
                      className="h-6 w-6 p-0 text-charcoal-400 hover:text-teal-600"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNote(note.id)}
                      className="h-6 w-6 p-0 text-charcoal-400 hover:text-red-600"
                      disabled={deleteNoteMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-xs text-charcoal-500 ml-2">
                    {formatDistanceToNow(note.createdAt ? new Date(note.createdAt) : new Date(), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-charcoal-600 text-sm mb-3 line-clamp-2">
                  {note.content}
                </p>
                <div className="flex items-center space-x-2">
                  {Array.isArray(note.tags) && note.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={`text-xs ${getTagColor(tag)}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full mt-4 border-dashed border-charcoal-300 hover:border-charcoal-400"
              onClick={() => {
                setEditingNote(null);
                setNewNoteTitle("");
                setNewNoteContent("");
                setNewNoteTags("");
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Quick Note
            </Button>
          </DialogTrigger>
        </Dialog>
      </CardContent>
    </Card>
  );
}
