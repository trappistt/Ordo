import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, MoreVertical, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Task } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TaskList() {
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("POST", `/api/tasks/${taskId}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Task status has been updated.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work": return "bg-blue-100 text-blue-700";
      case "personal": return "bg-indigo-100 text-indigo-700";
      case "finance": return "bg-purple-100 text-purple-700";
      case "health": return "bg-green-100 text-green-700";
      case "learning": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "No due date";
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Due: Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Due: Tomorrow";
    } else {
      return `Due: ${date.toLocaleDateString()}`;
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "today") {
      const today = new Date();
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && taskDate.toDateString() === today.toDateString();
    }
    if (filter === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && taskDate.toDateString() === tomorrow.toDateString();
    }
    if (filter === "week") {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && taskDate <= weekFromNow;
    }
    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
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
          <CardTitle>My Tasks</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <p>No tasks found. Add a new task to get started!</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border cursor-grab transition-all hover:shadow-md ${
                  task.completed 
                    ? "bg-gray-50 border-gray-200 opacity-75" 
                    : getPriorityColor(task.priority)
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskMutation.mutate(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    <Badge variant="outline" className={task.completed ? 'bg-gray-100 text-gray-600' : ''}>
                      {task.completed ? 'Completed' : task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {task.completed && task.completedAt 
                      ? `Completed ${new Date(task.completedAt).toLocaleString()}`
                      : formatDueDate(task.dueDate)
                    }
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getCategoryColor(task.category)}>
                      {task.category}
                    </Badge>
                    {task.estimatedDuration && (
                      <span className="text-xs text-gray-500">
                        Estimated: {formatDuration(task.estimatedDuration)}
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => deleteTaskMutation.mutate(task.id)}>
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
