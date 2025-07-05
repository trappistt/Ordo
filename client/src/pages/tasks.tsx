import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import TaskList from "@/components/TaskList";
import AddTaskModal from "@/components/AddTaskModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, CheckSquare, Clock, AlertCircle, Calendar } from "lucide-react";
import type { Task } from "@shared/schema";

export default function TasksPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = filterCategory === "all" || task.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "completed" && task.completed) ||
                         (filterStatus === "pending" && !task.completed);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasksCount = tasks.filter(t => 
    !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(tasksByCategory);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-6 h-6" />
                Task Management
              </h2>
              <p className="text-gray-600 mt-1">Organize and track your daily tasks</p>
            </div>
            <Button onClick={() => setIsAddTaskModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </header>

        {/* Task Overview Stats */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{pendingTasks}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{overdueTasksCount}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({tasksByCategory[category]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Task List */}
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tasks ({filteredTasks.length})</span>
                    {searchTerm && (
                      <Badge variant="outline">
                        Search: "{searchTerm}"
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
                          <div className="flex-1 space-y-2">
                            <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded" />
                            <div className="w-1/2 h-3 bg-gray-200 animate-pulse rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? "No tasks found" : "No tasks yet"}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm 
                          ? "Try adjusting your search or filters" 
                          : "Create your first task to get started"
                        }
                      </p>
                    </div>
                  ) : (
                    <TaskList />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Task Analytics Sidebar */}
            <div className="space-y-6">
              {/* Categories Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map(category => {
                      const count = tasksByCategory[category];
                      const percentage = Math.round((count / totalTasks) * 100);
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              category === 'work' ? 'bg-blue-500' :
                              category === 'personal' ? 'bg-green-500' :
                              category === 'health' ? 'bg-red-500' :
                              category === 'finance' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`} />
                            <span className="capitalize text-sm">{category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{count}</span>
                            <span className="text-xs text-gray-400">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setFilterStatus("pending")}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      View Pending Tasks
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const today = new Date().toDateString();
                        // This would need to be implemented with proper date filtering
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Today's Tasks
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600"
                      onClick={() => {
                        // Filter overdue tasks
                        setFilterStatus("pending");
                      }}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Overdue Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Productivity Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Productivity Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                      <span>Break large tasks into smaller, manageable chunks</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                      <span>Set realistic deadlines to avoid stress</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2" />
                      <span>Use the AI assistant for optimal scheduling</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={() => setIsAddTaskModalOpen(false)} 
      />
    </div>
  );
}