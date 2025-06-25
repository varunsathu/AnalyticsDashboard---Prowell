import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Save, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JournalEntry, InsertJournalEntry } from "@shared/schema";

const moodOptions = [
  { value: "amazing", label: "🤩 Amazing", color: "bg-green-500" },
  { value: "great", label: "😊 Great", color: "bg-green-400" },
  { value: "good", label: "🙂 Good", color: "bg-blue-400" },
  { value: "okay", label: "😐 Okay", color: "bg-yellow-400" },
  { value: "low", label: "😔 Low", color: "bg-orange-400" },
  { value: "difficult", label: "😰 Difficult", color: "bg-red-400" },
];

export default function JournalEntry() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertJournalEntry>>({
    date: selectedDate,
    title: "",
    content: "",
    mood: "",
    tags: [],
    weather: "",
    highlights: "",
    gratitude: "",
    challenges: "",
    tomorrowGoals: "",
    isPrivate: true,
  });
  const [newTag, setNewTag] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch journal entry for selected date
  const { data: entry, isLoading } = useQuery({
    queryKey: ["/api/journal", selectedDate],
    enabled: !!selectedDate,
  });

  // Create/Update journal entry mutation
  const saveMutation = useMutation({
    mutationFn: async (data: InsertJournalEntry) => {
      const method = entry ? "PATCH" : "POST";
      const url = entry ? `/api/journal/${entry.id}` : "/api/journal";
      return apiRequest(url, { method, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      setIsEditing(false);
      toast({
        title: "Saved",
        description: "Your journal entry has been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    },
  });

  // Update form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        date: entry.date,
        title: entry.title || "",
        content: entry.content || "",
        mood: entry.mood || "",
        tags: entry.tags || [],
        weather: entry.weather || "",
        highlights: entry.highlights || "",
        gratitude: entry.gratitude || "",
        challenges: entry.challenges || "",
        tomorrowGoals: entry.tomorrowGoals || "",
        isPrivate: entry.isPrivate ?? true,
      });
    } else {
      setFormData({
        date: selectedDate,
        title: "",
        content: "",
        mood: "",
        tags: [],
        weather: "",
        highlights: "",
        gratitude: "",
        challenges: "",
        tomorrowGoals: "",
        isPrivate: true,
      });
    }
  }, [entry, selectedDate]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate.toISOString().split('T')[0]);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!formData.content?.trim()) {
      toast({
        title: "Content required",
        description: "Please write something in your journal entry",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      ...formData,
      date: selectedDate,
    } as InsertJournalEntry);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const selectedMood = moodOptions.find(mood => mood.value === formData.mood);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-40 bg-charcoal-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <Card className="bg-white border border-charcoal-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateChange('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-charcoal-600" />
              <CardTitle className="text-lg text-charcoal-900">
                {formatDate(new Date(selectedDate))}
              </CardTitle>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateChange('next')}
              disabled={selectedDate >= new Date().toISOString().split('T')[0]}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Journal Entry Form */}
      <Card className="bg-white border border-charcoal-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-charcoal-600" />
              <CardTitle className="text-lg text-charcoal-900">
                {entry ? "Today's Journal" : "New Journal Entry"}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {!isEditing && entry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
              {(isEditing || !entry) && (
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {(isEditing || !entry) ? (
            <>
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                  Title (optional)
                </label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What's today about?"
                />
              </div>

              {/* Mood & Weather */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                    How are you feeling?
                  </label>
                  <Select
                    value={formData.mood || ""}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moodOptions.map((mood) => (
                        <SelectItem key={mood.value} value={mood.value}>
                          {mood.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                    Weather
                  </label>
                  <Input
                    value={formData.weather || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))}
                    placeholder="Sunny, Rainy, Cloudy..."
                  />
                </div>
              </div>

              {/* Main Content */}
              <div>
                <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                  What's on your mind? *
                </label>
                <Textarea
                  value={formData.content || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write about your day, thoughts, experiences..."
                  className="min-h-[200px] resize-none"
                />
              </div>

              {/* Structured Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                    Today's Highlights
                  </label>
                  <Textarea
                    value={formData.highlights || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
                    placeholder="What went well today?"
                    className="min-h-[80px] resize-none"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                    Grateful For
                  </label>
                  <Textarea
                    value={formData.gratitude || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, gratitude: e.target.value }))}
                    placeholder="What are you thankful for?"
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                    Challenges
                  </label>
                  <Textarea
                    value={formData.challenges || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                    placeholder="What was difficult today?"
                    className="min-h-[80px] resize-none"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                    Tomorrow's Goals
                  </label>
                  <Textarea
                    value={formData.tomorrowGoals || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, tomorrowGoals: e.target.value }))}
                    placeholder="What do you want to focus on tomorrow?"
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-charcoal-700 mb-1 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button variant="outline" size="sm" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Read-only view */
            <div className="space-y-4">
              {entry.title && (
                <h3 className="text-xl font-semibold text-charcoal-900">{entry.title}</h3>
              )}
              
              <div className="flex items-center gap-4">
                {selectedMood && (
                  <Badge className={`${selectedMood.color} text-white`}>
                    {selectedMood.label}
                  </Badge>
                )}
                {entry.weather && (
                  <span className="text-sm text-charcoal-600">Weather: {entry.weather}</span>
                )}
              </div>

              <div className="prose max-w-none">
                <p className="text-charcoal-800 whitespace-pre-wrap">{entry.content}</p>
              </div>

              {entry.highlights && (
                <div>
                  <h4 className="font-semibold text-charcoal-900 mb-1">Highlights</h4>
                  <p className="text-charcoal-700 whitespace-pre-wrap">{entry.highlights}</p>
                </div>
              )}

              {entry.gratitude && (
                <div>
                  <h4 className="font-semibold text-charcoal-900 mb-1">Grateful For</h4>
                  <p className="text-charcoal-700 whitespace-pre-wrap">{entry.gratitude}</p>
                </div>
              )}

              {entry.challenges && (
                <div>
                  <h4 className="font-semibold text-charcoal-900 mb-1">Challenges</h4>
                  <p className="text-charcoal-700 whitespace-pre-wrap">{entry.challenges}</p>
                </div>
              )}

              {entry.tomorrowGoals && (
                <div>
                  <h4 className="font-semibold text-charcoal-900 mb-1">Tomorrow's Goals</h4>
                  <p className="text-charcoal-700 whitespace-pre-wrap">{entry.tomorrowGoals}</p>
                </div>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}