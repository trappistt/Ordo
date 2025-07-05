import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import TasksPage from "@/pages/tasks";
import CalendarPage from "@/pages/calendar";
import AIAssistantPage from "@/pages/ai-assistant";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/AuthPage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SmartScheduler...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="*" component={AuthPage} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/tasks" component={TasksPage} />
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/ai-assistant" component={AIAssistantPage} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
