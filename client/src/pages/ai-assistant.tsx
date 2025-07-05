import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import AIAssistant from "@/components/AIAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Send, Sparkles, TrendingUp, Clock, Target, Lightbulb, Zap } from "lucide-react";

export default function AIAssistantPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "ai" as const,
      message: "Hi! I'm your AI productivity assistant. I can help you optimize your schedule, suggest task prioritization, and provide insights about your productivity patterns. How can I help you today?",
      timestamp: new Date()
    }
  ]);

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
        description: "Your daily plan has been optimized!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/plan"] });
      // Add to chat history
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        type: "ai",
        message: "I've generated a new optimized plan for your day! Check out the suggestions in your dashboard.",
        timestamp: new Date()
      }]);
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
          <p className="text-gray-600">Loading AI Assistant...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user" as const,
      message: chatInput,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMessage]);

    // Simulate AI response (in a real app, this would call your AI service)
    setTimeout(() => {
      let aiResponse = "";
      const input = chatInput.toLowerCase();

      if (input.includes("plan") || input.includes("schedule")) {
        aiResponse = "I can help you create an optimized daily plan! Based on your current tasks and calendar, I suggest focusing on high-priority items during your peak energy hours. Would you like me to generate a new plan for today?";
      } else if (input.includes("productivity") || input.includes("efficient")) {
        aiResponse = "Here are some productivity tips based on your patterns: 1) Block time for deep work in the morning, 2) Group similar tasks together, 3) Take regular breaks to maintain focus. Your completion rate has improved by 15% this week!";
      } else if (input.includes("time") || input.includes("manage")) {
        aiResponse = "Time management is key to productivity! I notice you work best in 90-minute focused blocks. Try the Pomodoro technique for smaller tasks, and reserve your 10 AM - 12 PM slot for important work.";
      } else if (input.includes("task") || input.includes("priority")) {
        aiResponse = "For task prioritization, I recommend the Eisenhower Matrix: Important & Urgent tasks first, then Important but Not Urgent. Your quarterly report should be your top priority today.";
      } else {
        aiResponse = "I understand you're looking for help with productivity. I can assist with task prioritization, schedule optimization, time management tips, and generating personalized daily plans. What specific area would you like to focus on?";
      }

      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        type: "ai",
        message: aiResponse,
        timestamp: new Date()
      }]);
    }, 1000);

    setChatInput("");
  };

  const quickActions = [
    {
      title: "Generate Daily Plan",
      description: "Create an AI-optimized schedule for today",
      icon: Sparkles,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      action: () => generateAIPlanMutation.mutate()
    },
    {
      title: "Productivity Analysis",
      description: "Get insights about your work patterns",
      icon: TrendingUp,
      color: "bg-green-50 text-green-700 border-green-200",
      action: () => setChatHistory(prev => [...prev, {
        id: Date.now(),
        type: "user",
        message: "Show me my productivity analysis",
        timestamp: new Date()
      }])
    },
    {
      title: "Time Management Tips",
      description: "Personalized advice for better time use",
      icon: Clock,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      action: () => setChatHistory(prev => [...prev, {
        id: Date.now(),
        type: "user",
        message: "Give me time management tips",
        timestamp: new Date()
      }])
    },
    {
      title: "Task Prioritization",
      description: "Help organize tasks by importance",
      icon: Target,
      color: "bg-orange-50 text-orange-700 border-orange-200",
      action: () => setChatHistory(prev => [...prev, {
        id: Date.now(),
        type: "user",
        message: "Help me prioritize my tasks",
        timestamp: new Date()
      }])
    }
  ];

  const aiInsights = [
    {
      title: "Peak Productivity Hours",
      value: "10 AM - 12 PM",
      trend: "+12%",
      icon: Zap,
      color: "text-green-600"
    },
    {
      title: "Average Focus Time",
      value: "45 minutes",
      trend: "+8%",
      icon: Clock,
      color: "text-blue-600"
    },
    {
      title: "Task Completion Rate",
      value: "78%",
      trend: "+15%",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Weekly Efficiency",
      value: "92%",
      trend: "+5%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bot className="w-6 h-6" />
                AI Assistant
              </h2>
              <p className="text-gray-600 mt-1">Your intelligent productivity companion</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                AI Online
              </Badge>
            </div>
          </div>
        </header>

        {/* AI Insights Dashboard */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-4 gap-6">
            {aiInsights.map((insight, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{insight.value}</div>
                <div className="text-sm text-gray-600">{insight.title}</div>
                <div className={`text-xs font-medium ${insight.color}`}>{insight.trend} this week</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-3 gap-6 h-full">
            
            {/* Chat Interface */}
            <div className="col-span-2 flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Chat Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
                    {chatHistory.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Ask me about productivity, scheduling, or task management..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 resize-none"
                      rows={2}
                    />
                    <Button onClick={handleSendMessage} disabled={!chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`w-full p-3 border rounded-lg text-left hover:shadow-md transition-shadow ${action.color}`}
                        disabled={generateAIPlanMutation.isPending}
                      >
                        <div className="flex items-center space-x-3">
                          <action.icon className="w-5 h-5" />
                          <div>
                            <h4 className="font-medium text-sm">{action.title}</h4>
                            <p className="text-xs opacity-75">{action.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIAssistant />
                </CardContent>
              </Card>

              {/* AI Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                      <span>Smart schedule optimization based on your patterns</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                      <span>Intelligent task prioritization and time blocking</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2" />
                      <span>Productivity insights and personalized recommendations</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                      <span>Natural language interaction for workflow assistance</span>
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