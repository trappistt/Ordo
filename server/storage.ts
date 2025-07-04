import {
  users,
  tasks,
  calendarEvents,
  aiPlans,
  userPreferences,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type CalendarEvent,
  type InsertCalendarEvent,
  type AiPlan,
  type UserPreferences,
  type InsertUserPreferences,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  getUserTasks(userId: string): Promise<Task[]>;
  getTasksByDate(userId: string, date: Date): Promise<Task[]>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(taskId: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(taskId: number): Promise<void>;
  toggleTaskCompletion(taskId: number): Promise<Task>;
  
  // Calendar operations
  getUserCalendarEvents(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(eventId: number, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(eventId: number): Promise<void>;
  
  // AI Plans
  createAiPlan(userId: string, planDate: Date, suggestions: any): Promise<AiPlan>;
  getLatestAiPlan(userId: string, planDate: Date): Promise<AiPlan | undefined>;
  
  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(userId: string, preferences: InsertUserPreferences): Promise<UserPreferences>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async getUserTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByDate(userId: string, date: Date): Promise<Task[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          gte(tasks.dueDate, startOfDay),
          lte(tasks.dueDate, endOfDay)
        )
      );
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, userId })
      .returning();
    return newTask;
  }

  async updateTask(taskId: number, updates: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();
    return updatedTask;
  }

  async deleteTask(taskId: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }

  async toggleTaskCompletion(taskId: number): Promise<Task> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    const [updatedTask] = await db
      .update(tasks)
      .set({
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();
    return updatedTask;
  }

  // Calendar operations
  async getUserCalendarEvents(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.userId, userId),
          gte(calendarEvents.startTime, startDate),
          lte(calendarEvents.endTime, endDate)
        )
      )
      .orderBy(calendarEvents.startTime);
  }

  async createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db
      .insert(calendarEvents)
      .values({ ...event, userId })
      .returning();
    return newEvent;
  }

  async updateCalendarEvent(eventId: number, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(calendarEvents.id, eventId))
      .returning();
    return updatedEvent;
  }

  async deleteCalendarEvent(eventId: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
  }

  // AI Plans
  async createAiPlan(userId: string, planDate: Date, suggestions: any): Promise<AiPlan> {
    const [plan] = await db
      .insert(aiPlans)
      .values({
        userId,
        planDate,
        suggestions,
      })
      .returning();
    return plan;
  }

  async getLatestAiPlan(userId: string, planDate: Date): Promise<AiPlan | undefined> {
    const startOfDay = new Date(planDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(planDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [plan] = await db
      .select()
      .from(aiPlans)
      .where(
        and(
          eq(aiPlans.userId, userId),
          gte(aiPlans.planDate, startOfDay),
          lte(aiPlans.planDate, endOfDay)
        )
      )
      .orderBy(desc(aiPlans.createdAt))
      .limit(1);
    return plan;
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(userId: string, preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [prefs] = await db
      .insert(userPreferences)
      .values({ ...preferences, userId })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return prefs;
  }
}

export const storage = new DatabaseStorage();
