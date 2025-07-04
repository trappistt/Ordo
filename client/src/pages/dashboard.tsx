import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import TaskList from "@/components/TaskList";
import CalendarView from "@/components/CalendarView";
import AIAssistant from "@/components/AIAssistant";
import QuickStats from "@/components/QuickStats";
import AddTaskModal from "@/components/AddTaskModal";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const generateAIPlanMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/ai/generate-plan", {
        date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "AI Plan Generated",
        description: "Your daily plan has been optimized by AI!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/plan"] });
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
        description: "Failed to generate AI plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Dashboard</h2>
              <p className="text-gray-600 mt-1">{currentDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* AI Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">AI Ready</span>
              </div>

              {/* Quick Actions */}
              <Button onClick={() => setIsAddTaskModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => generateAIPlanMutation.mutate()}
                disabled={generateAIPlanMutation.isPending}
              >
                {generateAIPlanMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                AI Plan
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Tasks Panel */}
            <div className="col-span-5 space-y-6">
              <TaskList />
              <QuickStats />
            </div>

            {/* Calendar and AI Panel */}
            <div className="col-span-7 space-y-6">
              <CalendarView />
              <AIAssistant />
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
