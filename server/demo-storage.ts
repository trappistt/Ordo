// Demo storage with sample data for showcasing features
import type { IStorage } from './storage';
import type { User, UpsertUser, Task, InsertTask, CalendarEvent, InsertCalendarEvent, AiPlan, UserPreferences, InsertUserPreferences, CalendarIntegration, InsertCalendarIntegration } from '@shared/schema';

// Sample demo data
const demoUser: User = {
  id: "demo-user",
  email: "demo@tasksync.ai",
  firstName: "Demo",
  lastName: "User",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const demoTasks: Task[] = [
  {
    id: 1,
    userId: "demo-user",
    title: "Complete quarterly report",
    description: "Analyze Q4 performance metrics and prepare presentation",
    category: "work",
    priority: "high",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    estimatedDuration: 180, // 3 hours
    completed: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: "demo-user",
    title: "Schedule dentist appointment",
    description: "Call Dr. Smith's office for routine checkup",
    category: "health",
    priority: "medium",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    estimatedDuration: 15,
    completed: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    userId: "demo-user",
    title: "Review investment portfolio",
    description: "Check performance and rebalance if needed",
    category: "finance",
    priority: "medium",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    estimatedDuration: 60,
    completed: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    userId: "demo-user",
    title: "Grocery shopping",
    description: "Weekly grocery run - milk, bread, vegetables",
    category: "personal",
    priority: "low",
    dueDate: new Date(), // Today
    estimatedDuration: 45,
    completed: true,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    userId: "demo-user",
    title: "Learn React hooks",
    description: "Complete online course on advanced React patterns",
    category: "learning",
    priority: "medium",
    dueDate: new Date(), // Today
    estimatedDuration: 120,
    completed: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const demoEvents: CalendarEvent[] = [
  {
    id: 1,
    userId: "demo-user",
    externalId: "google-123",
    title: "Team Standup",
    description: "Daily team sync meeting",
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(9, 30, 0, 0)),
    location: "Conference Room A",
    source: "google",
    isAiGenerated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: "demo-user",
    externalId: "ai-suggested-1",
    title: "Focus Time: Quarterly Report",
    description: "AI-suggested dedicated time for deep work",
    startTime: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(13, 0, 0, 0)),
    location: "",
    source: "manual",
    isAiGenerated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    userId: "demo-user",
    externalId: "outlook-456",
    title: "Client Meeting",
    description: "Project review with ABC Corp",
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    endTime: new Date(new Date().setHours(15, 30, 0, 0)),
    location: "Video Call",
    source: "outlook",
    isAiGenerated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const demoAiPlan: AiPlan = {
  id: 1,
  userId: "demo-user",
  planDate: new Date(),
  suggestions: {
    suggestions: [
      {
        type: "optimization",
        title: "Time Block for Deep Work",
        description: "Schedule your quarterly report during your peak focus hours (10 AM - 1 PM) when you're most productive.",
        icon: "fas fa-lightbulb",
        color: "blue"
      },
      {
        type: "suggestion",
        title: "Break Up Learning Session",
        description: "Split your 2-hour React learning into two 1-hour sessions with a break to improve retention.",
        icon: "fas fa-clock",
        color: "green"
      },
      {
        type: "time_analysis",
        title: "Overcommitted Today",
        description: "You have 5.75 hours of tasks but only 4 hours of available time. Consider moving some tasks to tomorrow.",
        icon: "fas fa-exclamation-triangle",
        color: "yellow"
      }
    ],
    scheduleOptimization: [
      {
        taskId: 1,
        title: "Quarterly Report - Part 1",
        startTime: "10:00",
        endTime: "12:00",
        type: "task",
        description: "Focus on data analysis first",
        estimatedDuration: 120
      },
      {
        title: "Lunch Break",
        startTime: "12:00",
        endTime: "13:00",
        type: "break",
        description: "Take a proper break to recharge",
        estimatedDuration: 60
      }
    ],
    insights: {
      totalFocusTime: 5.25,
      taskCompletionEstimate: 75,
      productivityScore: 82,
      recommendations: [
        "Start with high-priority tasks during peak energy hours",
        "Use the Pomodoro technique for learning sessions",
        "Schedule buffer time between meetings",
        "Consider delegating or postponing low-priority tasks"
      ]
    }
  },
  applied: false,
  createdAt: new Date(),
};

export class DemoStorage implements IStorage {
  private tasks = [...demoTasks];
  private events = [...demoEvents];
  private nextTaskId = 6;

  async getUser(id: string): Promise<User | undefined> {
    return demoUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return demoUser;
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return this.tasks;
  }

  async getTasksByDate(userId: string, date: Date): Promise<Task[]> {
    const targetDate = date.toDateString();
    return this.tasks.filter(task => 
      task.dueDate && new Date(task.dueDate).toDateString() === targetDate
    );
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: this.nextTaskId++,
      userId,
      title: task.title,
      description: task.description || null,
      category: task.category,
      priority: task.priority || "medium",
      dueDate: task.dueDate || null,
      estimatedDuration: task.estimatedDuration || null,
      completed: task.completed || false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(taskId: number, updates: Partial<InsertTask>): Promise<Task> {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');
    
    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.tasks[taskIndex];
  }

  async deleteTask(taskId: number): Promise<void> {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }

  async toggleTaskCompletion(taskId: number): Promise<Task> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    task.updatedAt = new Date();
    
    return task;
  }

  async getUserCalendarEvents(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    // Return today's events by default
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= today && eventDate < tomorrow;
    });
  }

  async createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      id: this.events.length + 1,
      userId,
      title: event.title,
      description: event.description || null,
      externalId: event.externalId || null,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || null,
      source: event.source,
      isAiGenerated: event.isAiGenerated || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async updateCalendarEvent(eventId: number, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');
    
    this.events[eventIndex] = {
      ...this.events[eventIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.events[eventIndex];
  }

  async deleteCalendarEvent(eventId: number): Promise<void> {
    this.events = this.events.filter(e => e.id !== eventId);
  }

  async createAiPlan(userId: string, planDate: Date, suggestions: any): Promise<AiPlan> {
    return {
      ...demoAiPlan,
      suggestions,
      planDate,
    };
  }

  async getLatestAiPlan(userId: string, planDate: Date): Promise<AiPlan | undefined> {
    return demoAiPlan;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return {
      id: 1,
      userId,
      workingHours: { start: "09:00", end: "17:00" },
      timeZone: "America/New_York",
      aiEnabled: true,
      notifications: { email: true, push: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async upsertUserPreferences(userId: string, preferences: InsertUserPreferences): Promise<UserPreferences> {
    return {
      id: 1,
      userId,
      workingHours: preferences.workingHours || null,
      timeZone: preferences.timeZone || "America/New_York",
      aiEnabled: preferences.aiEnabled || true,
      notifications: preferences.notifications || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}