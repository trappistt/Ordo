import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertTaskSchema, insertCalendarEventSchema, insertUserPreferencesSchema } from "@shared/schema";
import { generateAiPlan } from "./services/openai";
import { googleCalendarService } from "./services/google-calendar";
import { outlookCalendarService } from "./services/outlook-calendar";
import { isAuthenticated } from "./localAuth";
import { storage } from "./storage";

export async function registerLocalRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedTask = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(userId, validatedTask);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateTask(taskId, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.post('/api/tasks/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.toggleTaskCompletion(taskId);
      res.json(task);
    } catch (error) {
      console.error("Error toggling task:", error);
      res.status(400).json({ message: "Failed to toggle task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      await storage.deleteTask(taskId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(400).json({ message: "Failed to delete task" });
    }
  });

  // Calendar routes
  app.get('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = new Date(req.query.start as string || new Date());
      const endDate = new Date(req.query.end as string || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      
      const events = await storage.getUserCalendarEvents(userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // AI routes
  app.post('/api/ai/generate-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.body;
      const planDate = new Date(date || new Date());

      // Get user's tasks and calendar events for the day
      const tasks = await storage.getTasksByDate(userId, planDate);
      const startOfDay = new Date(planDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(planDate);
      endOfDay.setHours(23, 59, 59, 999);
      const events = await storage.getUserCalendarEvents(userId, startOfDay, endOfDay);

      // Get user preferences
      const preferences = await storage.getUserPreferences(userId);

      // Generate AI plan
      const aiSuggestions = await generateAiPlan(tasks, events, preferences);
      
      // Save the plan
      const plan = await storage.createAiPlan(userId, planDate, aiSuggestions);
      
      res.json(plan);
    } catch (error) {
      console.error("Error generating AI plan:", error);
      res.status(500).json({ message: "Failed to generate AI plan" });
    }
  });

  app.get('/api/ai/plan/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planDate = new Date(req.params.date);
      const plan = await storage.getLatestAiPlan(userId, planDate);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching AI plan:", error);
      res.status(500).json({ message: "Failed to fetch AI plan" });
    }
  });

  // User preferences routes
  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedPreferences = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.upsertUserPreferences(userId, validatedPreferences);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(400).json({ message: "Failed to update preferences" });
    }
  });

  // Calendar integration routes (simplified for local development)
  app.get('/api/calendar/integrations', isAuthenticated, async (req: any, res) => {
    // For local development, return empty array to show setup instructions
    res.json([]);
  });

  // Google Calendar OAuth routes
  app.get('/api/auth/google', isAuthenticated, (req, res) => {
    const authUrl = googleCalendarService.getAuthUrl();
    res.json({ authUrl });
  });

  app.get('/api/auth/google/callback', isAuthenticated, async (req, res) => {
    try {
      const { code } = req.query;
      const userId = (req as any).user.claims.sub;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code not provided" });
      }

      const tokens = await googleCalendarService.exchangeCodeForTokens(code as string);
      // For local development, just log the tokens instead of storing them
      console.log('Google OAuth tokens received:', tokens);
      
      res.redirect('/calendar');
    } catch (error) {
      console.error("Error in Google OAuth callback:", error);
      res.status(500).json({ message: "Failed to complete Google OAuth" });
    }
  });

  // Outlook Calendar OAuth routes
  app.get('/api/auth/outlook', isAuthenticated, (req, res) => {
    const authUrl = outlookCalendarService.getAuthUrl();
    res.json({ authUrl });
  });

  app.get('/api/auth/outlook/callback', isAuthenticated, async (req, res) => {
    try {
      const { code } = req.query;
      const userId = (req as any).user.claims.sub;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code not provided" });
      }

      // For local development, just log the code instead of processing it
      console.log('Outlook OAuth code received:', code);
      
      res.redirect('/calendar');
    } catch (error) {
      console.error("Error in Outlook OAuth callback:", error);
      res.status(500).json({ message: "Failed to complete Outlook OAuth" });
    }
  });

  return server;
} 