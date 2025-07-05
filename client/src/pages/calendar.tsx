import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import CalendarView from "@/components/CalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Clock, Users, MapPin } from "lucide-react";
import type { CalendarEvent } from "@shared/schema";

export default function CalendarPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [filterSource, setFilterSource] = useState("all");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: events = [], isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter events by source
  const filteredEvents = events.filter(event => 
    filterSource === "all" || event.source === filterSource
  );

  // Generate time slots for day/week view
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour24: hour,
        display: hour <= 12 ? `${hour === 0 ? 12 : hour}:00 ${hour < 12 ? 'AM' : 'PM'}` : `${hour - 12}:00 PM`
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get events for current view
  const getEventsForTimeSlot = (hour: number) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventHour = eventStart.getHours();
      return eventHour === hour && eventStart.toDateString() === currentDate.toDateString();
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const end = new Date(endTime).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `${start} - ${end}`;
  };

  const getEventColor = (source: string, isAiGenerated: boolean | null) => {
    if (isAiGenerated) return "bg-green-100 border-l-4 border-green-500 text-green-800";
    switch (source) {
      case "google": return "bg-blue-100 border-l-4 border-blue-500 text-blue-800";
      case "outlook": return "bg-purple-100 border-l-4 border-purple-500 text-purple-800";
      case "apple": return "bg-gray-100 border-l-4 border-gray-500 text-gray-800";
      default: return "bg-gray-100 border-l-4 border-gray-400 text-gray-800";
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const eventStats = {
    total: events.length,
    today: events.filter(e => new Date(e.startTime).toDateString() === new Date().toDateString()).length,
    thisWeek: events.filter(e => {
      const eventDate = new Date(e.startTime);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length,
    aiGenerated: events.filter(e => e.isAiGenerated).length
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Calendar
              </h2>
              <p className="text-gray-600 mt-1">{formatDate(currentDate)}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Calendar Stats */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{eventStats.total}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{eventStats.today}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{eventStats.thisWeek}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{eventStats.aiGenerated}</div>
              <div className="text-sm text-gray-600">AI Suggested</div>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook Calendar</SelectItem>
                  <SelectItem value="manual">Manual Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                Google
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-1" />
                Outlook
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                AI Suggested
              </Badge>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-6">
            {/* Time-based Calendar View */}
            <div className="col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {viewMode === "day" ? "Daily Schedule" : 
                     viewMode === "week" ? "Weekly Overview" : "Monthly View"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {viewMode === "day" ? (
                    <div className="space-y-2">
                      {timeSlots.map(slot => {
                        const slotEvents = getEventsForTimeSlot(slot.hour24);
                        return (
                          <div key={slot.time} className="flex items-center border-b border-gray-100 py-2">
                            <div className="w-20 text-sm text-gray-500 font-medium">
                              {slot.display}
                            </div>
                            <div className="flex-1 min-h-[60px] pl-4">
                              {slotEvents.map(event => (
                                <div
                                  key={event.id}
                                  className={`p-3 rounded-lg mb-2 ${getEventColor(event.source, event.isAiGenerated)}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">{event.title}</h4>
                                      <p className="text-sm opacity-75">
                                        {formatEventTime(event.startTime.toString(), event.endTime.toString())}
                                      </p>
                                      {event.location && (
                                        <p className="text-xs opacity-75 flex items-center mt-1">
                                          <MapPin className="w-3 h-3 mr-1" />
                                          {event.location}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <CalendarView />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Today's Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .filter(e => new Date(e.startTime).toDateString() === new Date().toDateString())
                      .slice(0, 3)
                      .map(event => (
                        <div key={event.id} className="flex items-center space-x-3">
                          <div className={`w-2 h-8 rounded-full ${
                            event.source === 'google' ? 'bg-blue-500' :
                            event.source === 'outlook' ? 'bg-purple-500' :
                            event.isAiGenerated ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatEventTime(event.startTime.toString(), event.endTime.toString())}
                            </p>
                          </div>
                        </div>
                      ))}
                    {events.filter(e => new Date(e.startTime).toDateString() === new Date().toDateString()).length === 0 && (
                      <p className="text-sm text-gray-500">No events today</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Calendar Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm">Google Calendar</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {events.filter(e => e.source === 'google').length} events
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span className="text-sm">Outlook Calendar</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {events.filter(e => e.source === 'outlook').length} events
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm">AI Suggestions</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {events.filter(e => e.isAiGenerated).length} events
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average daily events</span>
                      <span className="font-medium">{Math.round(eventStats.thisWeek / 7)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Busiest day</span>
                      <span className="font-medium">Tuesday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Free time slots</span>
                      <span className="font-medium text-green-600">12 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}