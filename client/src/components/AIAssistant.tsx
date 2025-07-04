import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, RefreshCw, Lightbulb, CheckCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { AiPlan } from "@shared/schema";

interface AISuggestion {
  type: "optimization" | "suggestion" | "time_analysis";
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface AIPlanData {
  suggestions: AISuggestion[];
  scheduleOptimization: any[];
  insights: {
    totalFocusTime: number;
    taskCompletionEstimate: number;
    productivityScore: number;
    recommendations: string[];
  };
}

export default function AIAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: aiPlan } = useQuery<AiPlan>({
    queryKey: ["/api/ai/plan", today],
    retry: false,
  });

  const regeneratePlanMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/ai/generate-plan", {
        date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/plan"] });
      toast({
        title: "AI Plan Regenerated",
        description: "Your daily plan has been updated with fresh insights!",
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
        description: "Failed to regenerate AI plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getIconComponent = (iconClass: string) => {
    if (iconClass.includes('lightbulb')) return <Lightbulb className="w-4 h-4 text-white" />;
    if (iconClass.includes('check')) return <CheckCircle className="w-4 h-4 text-white" />;
    if (iconClass.includes('clock')) return <Clock className="w-4 h-4 text-white" />;
    return <Bot className="w-4 h-4 text-white" />;
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200";
      case "green": return "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200";
      case "yellow": return "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200";
      default: return "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200";
    }
  };

  const getIconBgColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-500";
      case "green": return "bg-green-500";
      case "yellow": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const aiPlanData: AIPlanData | null = aiPlan?.suggestions as AIPlanData || null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bot className="text-white text-sm" />
            </div>
            <CardTitle>AI Assistant</CardTitle>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => regeneratePlanMutation.mutate()}
            disabled={regeneratePlanMutation.isPending}
          >
            {regeneratePlanMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!aiPlanData ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Generate your first AI-powered daily plan!</p>
            <Button 
              onClick={() => regeneratePlanMutation.mutate()}
              disabled={regeneratePlanMutation.isPending}
            >
              {regeneratePlanMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Bot className="w-4 h-4 mr-2" />
              )}
              Generate AI Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Insights */}
            <div className="space-y-4">
              {aiPlanData.suggestions?.map((suggestion, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${getColorClasses(suggestion.color)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 ${getIconBgColor(suggestion.color)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {getIconComponent(suggestion.icon)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{suggestion.title}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">AI Analysis Ready</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Your AI assistant is ready to provide personalized productivity insights based on your tasks and schedule.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Productivity Insights */}
            {aiPlanData.insights && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Productivity Insights</h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {aiPlanData.insights.totalFocusTime}h
                    </div>
                    <div className="text-xs text-gray-600">Focus Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {aiPlanData.insights.taskCompletionEstimate}%
                    </div>
                    <div className="text-xs text-gray-600">Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {aiPlanData.insights.productivityScore}
                    </div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                </div>
                {aiPlanData.insights.recommendations?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {aiPlanData.insights.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* AI Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              <Button size="sm">Apply Suggestions</Button>
              <Button variant="outline" size="sm">AI Preferences</Button>
              <Button variant="outline" size="sm">Export Plan</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
