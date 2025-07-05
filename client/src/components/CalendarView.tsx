import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import type { CalendarEvent } from "@shared/schema";

export default function CalendarView() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getEventColor = (source: string, isAiGenerated: boolean) => {
    if (isAiGenerated) return "bg-green-50 border-l-4 border-green-400";
    switch (source) {
      case "google": return "bg-blue-50 border-l-4 border-blue-400";
      case "outlook": return "bg-purple-50 border-l-4 border-purple-400";
      case "apple": return "bg-gray-50 border-l-4 border-gray-400";
      default: return "bg-gray-50 border-l-4 border-gray-300";
    }
  };

  const getDurationColor = (source: string, isAiGenerated: boolean) => {
    if (isAiGenerated) return "text-green-600 bg-green-100";
    switch (source) {
      case "google": return "text-blue-600 bg-blue-100";
      case "outlook": return "text-purple-600 bg-purple-100";
      case "apple": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-4 py-2">
                <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="flex-1 h-16 bg-gray-100 animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Schedule</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Sync
            </Button>
            <Select defaultValue="today">
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No events scheduled for today.</p>
              <p className="text-sm mt-1">Connect your calendar to see your schedule here.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center space-x-4 py-2">
                <div className="w-20 text-sm text-gray-500 font-medium">
                  {formatTime(event.startTime)}
                </div>
                <div className={`flex-1 p-3 rounded-lg ${getEventColor(event.source, event.isAiGenerated)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.isAiGenerated ? "AI Suggested • " : ""}
                        {event.description || event.location || "No details"}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getDurationColor(event.source, event.isAiGenerated)}`}>
                      {formatDuration(event.startTime, event.endTime)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
