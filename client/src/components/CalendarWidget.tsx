import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Video, Users, Dumbbell, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfDay, endOfDay, isEqual } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Event, InsertEvent } from "@shared/schema";

const eventIcons = {
  meeting: Video,
  personal: Users,
  work: Dumbbell,
};

const eventColors = {
  meeting: { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
  personal: { border: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600" },
  work: { border: "border-amber-500", bg: "bg-amber-50", text: "text-amber-600" },
};

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: InsertEvent) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateDialogOpen(false);
      setNewEventTitle("");
      setNewEventType("");
      setNewEventStartTime("");
      setNewEventEndTime("");
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = () => {
    if (!newEventTitle.trim() || !newEventType || !newEventStartTime || !newEventEndTime) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    
    const [startHour, startMinute] = newEventStartTime.split(":").map(Number);
    const [endHour, endMinute] = newEventEndTime.split(":").map(Number);
    
    startDate.setHours(startHour, startMinute, 0);
    endDate.setHours(endHour, endMinute, 0);

    createEventMutation.mutate({
      title: newEventTitle,
      description: "",
      type: newEventType,
      startTime: startDate,
      endTime: endDate,
      allDay: false,
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  // Filter events for today
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return isEqual(startOfDay(eventDate), startOfDay(new Date()));
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-charcoal-900">Calendar</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                onClick={() => {
                  setNewEventTitle("");
                  setNewEventType("");
                  setNewEventStartTime("");
                  setNewEventEndTime("");
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Enter event title..."
                  />
                </div>
                <div>
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select value={newEventType} onValueChange={setNewEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newEventStartTime}
                      onChange={(e) => setNewEventStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEventEndTime}
                      onChange={(e) => setNewEventEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Selected Date</Label>
                  <p className="text-sm text-charcoal-600 mt-1">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateEvent}
                    disabled={createEventMutation.isPending}
                  >
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="text-charcoal-600 hover:text-charcoal-900"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-semibold text-charcoal-900">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="text-charcoal-600 hover:text-charcoal-900"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mini Calendar */}
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-charcoal-600 mb-2">
            {weekDays.map((day, index) => (
              <div key={`${day}-${index}`}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {days.map((day, index) => (
              <div
                key={`${day.toISOString()}-${index}`}
                onClick={() => setSelectedDate(day)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  isToday(day)
                    ? "bg-teal-600 text-white font-semibold"
                    : isEqual(startOfDay(day), startOfDay(selectedDate))
                    ? "bg-teal-100 text-teal-700 font-medium"
                    : !isSameMonth(day, currentDate)
                    ? "text-charcoal-400"
                    : "hover:bg-charcoal-100"
                }`}
              >
                {format(day, 'd')}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Events */}
        <div>
          <h3 className="font-semibold text-charcoal-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {todayEvents.length === 0 ? (
              <div className="text-center py-4">
                <Calendar className="w-8 h-8 text-charcoal-400 mx-auto mb-2" />
                <p className="text-charcoal-500 text-sm">No events scheduled for today</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-teal-600 mt-2"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Event
                </Button>
              </div>
            ) : (
              todayEvents.map((event) => {
                const IconComponent = eventIcons[event.type as keyof typeof eventIcons] || Calendar;
                const colors = eventColors[event.type as keyof typeof eventColors] || eventColors.work;
                
                return (
                  <div
                    key={event.id}
                    className={`flex items-center space-x-3 p-3 ${colors.bg} rounded-lg border-l-4 ${colors.border}`}
                  >
                    <IconComponent className={`w-4 h-4 ${colors.text}`} />
                    <div className="flex-1">
                      <p className="font-medium text-charcoal-900">{event.title}</p>
                      <p className="text-sm text-charcoal-600">
                        {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
