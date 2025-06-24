import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Note } from "@shared/schema";

export default function SmartNotes() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes", { search: searchQuery }],
  });

  const mockNotes = [
    {
      id: 1,
      title: "Meeting Notes - Product Planning",
      content: "Discussed new feature requirements and timeline. Key decisions on architecture and user experience...",
      tags: ["work", "planning"],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 2,
      title: "Learning Goals for Q2",
      content: "1. Master React Hooks and Context API 2. Learn TypeScript fundamentals 3. Explore Node.js backend development...",
      tags: ["learning", "goals"],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: 3,
      title: "Weekend Project Ideas",
      content: "Build a personal finance tracker, create a reading list app, or develop a habit tracking mobile app...",
      tags: ["personal", "projects"],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  const tagColors = {
    work: "bg-blue-100 text-blue-700",
    planning: "bg-amber-100 text-amber-700",
    learning: "bg-emerald-100 text-emerald-700",
    goals: "bg-teal-100 text-teal-700",
    personal: "bg-purple-100 text-purple-700",
    projects: "bg-orange-100 text-orange-700",
  };

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-charcoal-900">Smart Notes</CardTitle>
          <Button size="sm" variant="ghost" className="text-teal-600">
            <Plus className="w-4 h-4" />
          </Button>
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
        <div className="space-y-4">
          {mockNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-charcoal-900">{note.title}</h4>
                <span className="text-xs text-charcoal-500">
                  {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                </span>
              </div>
              <p className="text-charcoal-600 text-sm mb-3 line-clamp-2">
                {note.content}
              </p>
              <div className="flex items-center space-x-2">
                {note.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`text-xs ${tagColors[tag as keyof typeof tagColors] || "bg-charcoal-100 text-charcoal-700"}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-4 border-dashed border-charcoal-300 hover:border-charcoal-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Quick Note
        </Button>
      </CardContent>
    </Card>
  );
}
