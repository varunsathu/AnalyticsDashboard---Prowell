import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Video, Users, Dumbbell } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import type { Event } from "@shared/schema";

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
  const [currentDate] = useState(new Date());

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const mockEvents = [
    {
      id: 1,
      title: "Team Standup",
      type: "meeting" as const,
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000),
    },
    {
      id: 2,
      title: "Client Presentation",
      type: "meeting" as const,
      startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
    {
      id: 3,
      title: "Gym Session",
      type: "personal" as const,
      startTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 11 * 60 * 60 * 1000),
    },
  ];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-charcoal-900">Calendar</CardTitle>
          <Button size="sm" variant="ghost" className="text-teal-600">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
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
                className={`p-2 rounded cursor-pointer transition-colors ${
                  isToday(day)
                    ? "bg-teal-600 text-white font-semibold"
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

        {/* Upcoming Events */}
        <div>
          <h3 className="font-semibold text-charcoal-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {mockEvents.map((event) => {
              const IconComponent = eventIcons[event.type];
              const colors = eventColors[event.type];
              
              return (
                <div
                  key={event.id}
                  className={`flex items-center space-x-3 p-3 ${colors.bg} rounded-lg border-l-4 ${colors.border}`}
                >
                  <IconComponent className={`w-4 h-4 ${colors.text}`} />
                  <div className="flex-1">
                    <p className="font-medium text-charcoal-900">{event.title}</p>
                    <p className="text-sm text-charcoal-600">
                      {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
