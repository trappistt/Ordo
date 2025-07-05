import type { Express } from "express";
import { createServer, type Server } from "http";
import { DemoStorage } from "./demo-storage";
import { insertTaskSchema, insertCalendarEventSchema, insertUserPreferencesSchema } from "@shared/schema";
import { generateAiPlan } from "./services/openai";
import { googleCalendarService } from "./services/google-calendar";
import { outlookCalendarService } from "./services/outlook-calendar";

const demoStorage = new DemoStorage();

export async function registerDemoRoutes(app: Express): Promise<Server> {
  // Demo user middleware - always authenticated as demo user
  const demoAuth = (req: any, res: any, next: any) => {
    req.user = {
      claims: {
        sub: "demo-user",
        email: "demo@tasksync.ai",
        first_name: "Demo",
        last_name: "User"
      }
    };
    next();
  };

  // Auth routes
  app.get('/api/auth/user', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await demoStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Task routes
  app.get('/api/tasks', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await demoStorage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedTask = insertTaskSchema.parse(req.body);
      const task = await demoStorage.createTask(userId, validatedTask);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', demoAuth, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      const task = await demoStorage.updateTask(taskId, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.post('/api/tasks/:id/toggle', demoAuth, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await demoStorage.toggleTaskCompletion(taskId);
      res.json(task);
    } catch (error) {
      console.error("Error toggling task:", error);
      res.status(400).json({ message: "Failed to toggle task" });
    }
  });

  app.delete('/api/tasks/:id', demoAuth, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      await demoStorage.deleteTask(taskId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(400).json({ message: "Failed to delete task" });
    }
  });

  // Calendar routes
  app.get('/api/calendar/events', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = new Date(req.query.start as string || new Date());
      const endDate = new Date(req.query.end as string || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      
      const events = await demoStorage.getUserCalendarEvents(userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // AI routes
  app.post('/api/ai/generate-plan', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.body;
      const planDate = new Date(date || new Date());

      // Get user's tasks and calendar events for the day
      const tasks = await demoStorage.getTasksByDate(userId, planDate);
      const startOfDay = new Date(planDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(planDate);
      endOfDay.setHours(23, 59, 59, 999);
      const events = await demoStorage.getUserCalendarEvents(userId, startOfDay, endOfDay);

      // Get user preferences
      const preferences = await demoStorage.getUserPreferences(userId);

      // Generate AI plan
      const aiSuggestions = await generateAiPlan(tasks, events, preferences);
      
      // Save the plan
      const plan = await demoStorage.createAiPlan(userId, planDate, aiSuggestions);
      
      res.json(plan);
    } catch (error) {
      console.error("Error generating AI plan:", error);
      res.status(500).json({ message: "Failed to generate AI plan" });
    }
  });

  app.get('/api/ai/plan/:date', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planDate = new Date(req.params.date);
      const plan = await demoStorage.getLatestAiPlan(userId, planDate);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching AI plan:", error);
      res.status(500).json({ message: "Failed to fetch AI plan" });
    }
  });

  // User preferences routes
  app.get('/api/preferences', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await demoStorage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/preferences', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedPreferences = insertUserPreferencesSchema.parse(req.body);
      const preferences = await demoStorage.upsertUserPreferences(userId, validatedPreferences);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(400).json({ message: "Failed to update preferences" });
    }
  });

  // Calendar integration routes (demo mode - shows setup instructions)
  app.get('/api/calendar/integrations', demoAuth, async (req: any, res) => {
    // In demo mode, return empty array to show integration setup UI
    res.json([]);
  });

  // Google Calendar OAuth routes
  app.get('/api/auth/google', (req, res) => {
    // In demo mode, return setup instructions
    res.json({
      message: "Calendar integration setup required",
      instructions: [
        "1. Go to Google Cloud Console (https://console.cloud.google.com/)",
        "2. Create a new project or select existing one",
        "3. Enable Google Calendar API",
        "4. Create OAuth 2.0 credentials",
        "5. Add your domain to authorized origins",
        "6. Set environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
      ],
      authUrl: googleCalendarService.getAuthUrl()
    });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }

      // Exchange code for tokens
      const tokens = await googleCalendarService.exchangeCodeForTokens(code as string);
      
      // In a real app, save tokens to database
      // For demo, just redirect with success message
      res.redirect('/?calendar=google&status=connected');
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect('/?calendar=google&status=error');
    }
  });

  // Outlook Calendar OAuth routes
  app.get('/api/auth/outlook', (req, res) => {
    // In demo mode, return setup instructions
    res.json({
      message: "Outlook Calendar integration setup required",
      instructions: [
        "1. Go to Azure Portal (https://portal.azure.com/)",
        "2. Navigate to App registrations",
        "3. Create a new registration",
        "4. Add Calendar.ReadWrite permissions",
        "5. Generate client secret",
        "6. Set environment variables: OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET"
      ],
      authUrl: outlookCalendarService.getAuthUrl()
    });
  });

  app.get('/api/auth/outlook/callback', async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }

      // Exchange code for tokens
      const tokens = await outlookCalendarService.exchangeCodeForTokens(code as string);
      
      // In a real app, save tokens to database
      // For demo, just redirect with success message
      res.redirect('/?calendar=outlook&status=connected');
    } catch (error) {
      console.error("Outlook OAuth callback error:", error);
      res.redirect('/?calendar=outlook&status=error');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}