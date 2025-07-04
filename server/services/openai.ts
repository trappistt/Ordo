import OpenAI from "openai";
import type { Task, CalendarEvent, UserPreferences } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface AISuggestion {
  type: "optimization" | "suggestion" | "time_analysis";
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface ScheduleBlock {
  taskId?: number;
  title: string;
  startTime: string;
  endTime: string;
  type: "task" | "meeting" | "break" | "focus";
  description: string;
  estimatedDuration: number;
}

interface AIPlanResponse {
  suggestions: AISuggestion[];
  scheduleOptimization: ScheduleBlock[];
  insights: {
    totalFocusTime: number;
    taskCompletionEstimate: number;
    productivityScore: number;
    recommendations: string[];
  };
}

export async function generateAiPlan(
  tasks: Task[],
  events: CalendarEvent[],
  preferences?: UserPreferences | null
): Promise<AIPlanResponse> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI productivity assistant that helps optimize daily schedules. Analyze the user's tasks and calendar events to provide intelligent scheduling suggestions. 

Consider:
- Task priorities (high, medium, low)
- Estimated durations
- Due dates and deadlines
- Existing calendar events
- Working hours and preferences
- Energy levels throughout the day
- Context switching between different types of work

Provide responses in JSON format with specific, actionable suggestions.`
        },
        {
          role: "user",
          content: `Please analyze my schedule and provide optimization suggestions:

TASKS:
${tasks.map(task => `
- ${task.title} (Priority: ${task.priority}, Due: ${task.dueDate || 'No due date'}, Estimated: ${task.estimatedDuration || 'Not specified'} minutes, Category: ${task.category})
`).join('')}

CALENDAR EVENTS:
${events.map(event => `
- ${event.title} (${event.startTime} - ${event.endTime}) at ${event.location || 'No location'}
`).join('')}

USER PREFERENCES:
- Working Hours: ${preferences?.workingHours ? JSON.stringify(preferences.workingHours) : '9 AM - 5 PM (default)'}
- Time Zone: ${preferences?.timeZone || 'America/New_York'}
- AI Enabled: ${preferences?.aiEnabled !== false}

Please provide a JSON response with:
1. suggestions: Array of 3-5 optimization suggestions with type, title, description, icon (FontAwesome class), and color (Tailwind class)
2. scheduleOptimization: Suggested time blocks for tasks considering existing events
3. insights: Analysis including total focus time, completion estimates, productivity score (1-100), and recommendations

Focus on practical, actionable advice that helps maximize productivity while maintaining work-life balance.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and provide fallbacks
    return {
      suggestions: result.suggestions || [
        {
          type: "optimization",
          title: "Schedule Analysis Complete",
          description: "I've analyzed your tasks and calendar to provide optimization suggestions.",
          icon: "fas fa-lightbulb",
          color: "blue"
        }
      ],
      scheduleOptimization: result.scheduleOptimization || [],
      insights: {
        totalFocusTime: result.insights?.totalFocusTime || 0,
        taskCompletionEstimate: result.insights?.taskCompletionEstimate || 0,
        productivityScore: result.insights?.productivityScore || 75,
        recommendations: result.insights?.recommendations || ["Consider time blocking for focused work periods"]
      }
    };
  } catch (error) {
    console.error("Error generating AI plan:", error);
    
    // Provide meaningful fallback response
    return {
      suggestions: [
        {
          type: "optimization",
          title: "AI Analysis Unavailable",
          description: "Unable to generate AI suggestions at this time. Please try again later.",
          icon: "fas fa-exclamation-triangle",
          color: "yellow"
        }
      ],
      scheduleOptimization: [],
      insights: {
        totalFocusTime: 0,
        taskCompletionEstimate: 0,
        productivityScore: 0,
        recommendations: ["AI analysis temporarily unavailable"]
      }
    };
  }
}
