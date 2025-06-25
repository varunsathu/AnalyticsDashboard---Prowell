import {
  users,
  tasks,
  notes,
  activities,
  events,
  focusSessions,
  browserActivities,
  healthMetrics,
  weeklyReports,
  journalEntries,
  categories,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type UpdateTask,
  type Note,
  type InsertNote,
  type Activity,
  type InsertActivity,
  type Event,
  type InsertEvent,
  type FocusSession,
  type InsertFocusSession,
  type BrowserActivity,
  type InsertBrowserActivity,
  type HealthMetric,
  type InsertHealthMetric,
  type WeeklyReport,
  type InsertWeeklyReport,
  type JournalEntry,
  type InsertJournalEntry,
  type UpdateJournalEntry,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, like, sql } from "drizzle-orm";

export interface IStorage {
  // Users (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Tasks
  getUserTasks(userId: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(userId: string, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(userId: string, taskId: number): Promise<boolean>;

  // Notes
  getUserNotes(userId: string): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(userId: string, note: InsertNote): Promise<Note>;
  updateNote(userId: string, noteId: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(userId: string, noteId: number): Promise<boolean>;
  searchNotes(userId: string, query: string): Promise<Note[]>;

  // Activities
  getUserActivities(userId: string, startDate?: Date, endDate?: Date): Promise<Activity[]>;
  createActivity(userId: string, activity: InsertActivity): Promise<Activity>;
  getActivityStats(userId: string, date: Date): Promise<any>;

  // Events
  getUserEvents(userId: string, startDate?: Date, endDate?: Date): Promise<Event[]>;
  createEvent(userId: string, event: InsertEvent): Promise<Event>;
  updateEvent(userId: string, eventId: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(userId: string, eventId: number): Promise<boolean>;

  // Focus Sessions
  getUserFocusSessions(userId: string, startDate?: Date, endDate?: Date): Promise<FocusSession[]>;
  createFocusSession(userId: string, session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(userId: string, sessionId: number, session: Partial<InsertFocusSession>): Promise<FocusSession | undefined>;

  // Browser Activities
  getUserBrowserActivities(userId: string, startDate?: Date, endDate?: Date): Promise<BrowserActivity[]>;
  createBrowserActivity(userId: string, activity: InsertBrowserActivity): Promise<BrowserActivity>;
  getBrowserActivityStats(userId: string, date: Date): Promise<any>;
  categorizeUrl(url: string): string;

  // Health Metrics
  getUserHealthMetrics(userId: string, type?: string, startDate?: Date, endDate?: Date): Promise<HealthMetric[]>;
  createHealthMetric(userId: string, metric: InsertHealthMetric): Promise<HealthMetric>;
  getLatestHealthMetrics(userId: string): Promise<Record<string, HealthMetric>>;
  simulateDeviceSync(userId: string, deviceSource: string): Promise<HealthMetric[]>;

  // Weekly Reports
  getUserWeeklyReports(userId: string, limit?: number): Promise<WeeklyReport[]>;
  createWeeklyReport(userId: string, report: InsertWeeklyReport): Promise<WeeklyReport>;
  generateWeeklyReport(userId: string, weekStart: Date): Promise<WeeklyReport>;

  // Journal Entries
  getUserJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;
  getJournalEntry(userId: string, date: string): Promise<JournalEntry | undefined>;
  createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(userId: string, id: number, entry: UpdateJournalEntry): Promise<JournalEntry | undefined>;
  deleteJournalEntry(userId: string, id: number): Promise<boolean>;

  // Categories
  getUserCategories(userId: string, type?: string): Promise<Category[]>;
  createCategory(userId: string, category: InsertCategory): Promise<Category>;
  deleteCategory(userId: string, categoryId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize database with demo data if needed (async operation)
    this.initializeDemoData().catch(err => {
      console.log('Demo data initialization failed:', err.message);
    });
  }

  private async initializeDemoData() {
    try {
      // Check if demo user already exists
      const existingUser = await db.select().from(users).where(eq(users.id, 'demo-user-id')).limit(1);
      
      if (existingUser.length === 0) {
        // Create demo user for testing
        const demoUser = await this.upsertUser({
          id: 'demo-user-id',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          profileImageUrl: null,
        });

        // Add demo browser activities and health data
        await this.initializeDemoBrowserData(demoUser.id);
        await this.initializeDemoHealthData(demoUser.id);
        await this.initializeDefaultCategories(demoUser.id);
      }
    } catch (error) {
      console.log('Demo data initialization skipped (tables may not exist yet)');
    }
  }

  private async initializeDemoBrowserData(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const demoActivities = [
      {
        userId,
        url: 'https://github.com/vercel/next.js',
        domain: 'github.com',
        title: 'GitHub - vercel/next.js: The React Framework',
        category: 'development' as const,
        duration: 2340, // 39 minutes
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 2340 * 1000),
      },
      {
        userId,
        url: 'https://stackoverflow.com/questions/react-hooks',
        domain: 'stackoverflow.com',
        title: 'React Hooks - Stack Overflow',
        category: 'development' as const,
        duration: 1800, // 30 minutes
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 1800 * 1000),
      },
      {
        userId,
        url: 'https://www.youtube.com/watch?v=programming-tutorial',
        domain: 'youtube.com',
        title: 'Advanced React Patterns - YouTube',
        category: 'learning' as const,
        duration: 3600, // 1 hour
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000),
      },
      {
        userId,
        url: 'https://twitter.com/home',
        domain: 'twitter.com',
        title: 'Twitter / X',
        category: 'social' as const,
        duration: 900, // 15 minutes
        startTime: new Date(today.getTime() + 16 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000 + 900 * 1000),
      },
    ];

    await db.insert(browserActivities).values(demoActivities);
  }

  private async initializeDemoHealthData(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const demoMetrics = [
      {
        userId,
        type: 'steps' as const,
        value: 8543,
        unit: 'steps',
        metadata: null,
        recordedAt: today,
      },
      {
        userId,
        type: 'heartRate' as const,
        value: 72,
        unit: 'bpm',
        metadata: { context: 'resting' },
        recordedAt: today,
      },
      {
        userId,
        type: 'calories' as const,
        value: 2150,
        unit: 'calories',
        metadata: null,
        recordedAt: today,
      },
      {
        userId,
        type: 'workout' as const,
        value: 45,
        unit: 'minutes',
        metadata: { type: 'cardio', intensity: 'moderate' },
        recordedAt: today,
      },
    ];

    await db.insert(healthMetrics).values(demoMetrics);
  }

  // Users (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
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

  // Tasks
  async getUserTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(userId: string, insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({ ...insertTask, userId })
      .returning();
    return task;
  }

  async updateTask(userId: string, updateTask: UpdateTask): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({
        ...updateTask,
        updatedAt: new Date(),
        completedAt: updateTask.status === 'completed' ? new Date() : undefined,
      })
      .where(and(eq(tasks.id, updateTask.id), eq(tasks.userId, userId)))
      .returning();
    return task || undefined;
  }

  async deleteTask(userId: string, taskId: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Notes
  async getUserNotes(userId: string): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async createNote(userId: string, insertNote: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values({ ...insertNote, userId })
      .returning();
    return note;
  }

  async updateNote(userId: string, noteId: number, updateNote: Partial<InsertNote>): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set({ ...updateNote, updatedAt: new Date() })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();
    return note || undefined;
  }

  async deleteNote(userId: string, noteId: number): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async searchNotes(userId: string, query: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          sql`(
            ${notes.title} ILIKE ${`%${query}%`} OR 
            ${notes.content} ILIKE ${`%${query}%`}
          )`
        )
      )
      .orderBy(desc(notes.createdAt));
  }

  // Activities
  async getUserActivities(userId: string, startDate?: Date, endDate?: Date): Promise<Activity[]> {
    let conditions = [eq(activities.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(activities.startTime, startDate));
    }
    if (endDate) {
      conditions.push(lte(activities.endTime, endDate));
    }
    
    return await db
      .select()
      .from(activities)
      .where(and(...conditions))
      .orderBy(desc(activities.startTime));
  }

  async createActivity(userId: string, insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values({ ...insertActivity, userId })
      .returning();
    return activity;
  }

  async getActivityStats(userId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayActivities = await this.getUserActivities(userId, startOfDay, endOfDay);
    
    const categoryStats = dayActivities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = 0;
      }
      acc[activity.category] += activity.duration;
      return acc;
    }, {} as Record<string, number>);

    const totalTime = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);

    return {
      totalTime,
      categoryStats,
      activities: dayActivities,
    };
  }

  // Events
  async getUserEvents(userId: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let conditions = [eq(events.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(events.startTime, startDate));
    }
    if (endDate) {
      conditions.push(lte(events.endTime, endDate));
    }
    
    return await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.startTime));
  }

  async createEvent(userId: string, insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({ ...insertEvent, userId })
      .returning();
    return event;
  }

  async updateEvent(userId: string, eventId: number, updateEvent: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updateEvent)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .returning();
    return event || undefined;
  }

  async deleteEvent(userId: string, eventId: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Focus Sessions
  async getUserFocusSessions(userId: string, startDate?: Date, endDate?: Date): Promise<FocusSession[]> {
    let conditions = [eq(focusSessions.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(focusSessions.startTime, startDate));
    }
    if (endDate) {
      conditions.push(lte(focusSessions.endTime, endDate));
    }
    
    return await db
      .select()
      .from(focusSessions)
      .where(and(...conditions))
      .orderBy(desc(focusSessions.startTime));
  }

  async createFocusSession(userId: string, insertSession: InsertFocusSession): Promise<FocusSession> {
    const [session] = await db
      .insert(focusSessions)
      .values({ ...insertSession, userId })
      .returning();
    return session;
  }

  async updateFocusSession(userId: string, sessionId: number, updateSession: Partial<InsertFocusSession>): Promise<FocusSession | undefined> {
    const [session] = await db
      .update(focusSessions)
      .set(updateSession)
      .where(and(eq(focusSessions.id, sessionId), eq(focusSessions.userId, userId)))
      .returning();
    return session || undefined;
  }

  // Browser Activities
  async getUserBrowserActivities(userId: string, startDate?: Date, endDate?: Date): Promise<BrowserActivity[]> {
    let conditions = [eq(browserActivities.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(browserActivities.startTime, startDate));
    }
    if (endDate) {
      conditions.push(lte(browserActivities.endTime, endDate));
    }
    
    return await db
      .select()
      .from(browserActivities)
      .where(and(...conditions))
      .orderBy(desc(browserActivities.startTime));
  }

  async createBrowserActivity(userId: string, insertActivity: InsertBrowserActivity): Promise<BrowserActivity> {
    const [activity] = await db
      .insert(browserActivities)
      .values({ ...insertActivity, userId })
      .returning();
    return activity;
  }

  async getBrowserActivityStats(userId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayActivities = await this.getUserBrowserActivities(userId, startOfDay, endOfDay);
    
    const categoryStats = dayActivities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = { duration: 0, count: 0, percentage: 0 };
      }
      acc[activity.category].duration += activity.duration;
      acc[activity.category].count += 1;
      return acc;
    }, {} as Record<string, { duration: number; count: number; percentage: number }>);

    const totalTime = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);

    // Calculate percentages
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].percentage = totalTime > 0 
        ? Math.round((categoryStats[category].duration / totalTime) * 100)
        : 0;
    });

    // Get top domains
    const domainStats = dayActivities.reduce((acc, activity) => {
      if (!acc[activity.domain]) {
        acc[activity.domain] = 0;
      }
      acc[activity.domain] += activity.duration;
      return acc;
    }, {} as Record<string, number>);

    const topDomains = Object.entries(domainStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([domain, duration]) => ({ domain, duration }));

    return {
      totalTime,
      categoryStats,
      topDomains,
      activities: dayActivities,
      productivityScore: this.calculateProductivityScore(categoryStats, totalTime),
    };
  }

  categorizeUrl(url: string): string {
    const domain = new URL(url).hostname.toLowerCase();
    
    const categories = {
      development: ['github.com', 'stackoverflow.com', 'developer.mozilla.org', 'docs.google.com', 'codepen.io', 'jsfiddle.net'],
      learning: ['youtube.com', 'coursera.org', 'udemy.com', 'khanacademy.org', 'edx.org', 'pluralsight.com'],
      social: ['twitter.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'discord.com'],
      entertainment: ['netflix.com', 'spotify.com', 'twitch.tv', 'hulu.com', 'disney.com'],
      productivity: ['notion.so', 'trello.com', 'asana.com', 'slack.com', 'zoom.us', 'google.com'],
    };

    for (const [category, domains] of Object.entries(categories)) {
      if (domains.some(d => domain.includes(d))) {
        return category;
      }
    }

    return 'productivity'; // Default category
  }

  private calculateProductivityScore(categoryStats: Record<string, any>, totalTime: number): number {
    if (totalTime === 0) return 0;

    const weights = {
      development: 1.0,
      learning: 0.9,
      productivity: 0.8,
      social: 0.3,
      entertainment: 0.1,
    };

    let weightedTime = 0;
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const weight = weights[category as keyof typeof weights] || 0.5;
      weightedTime += stats.duration * weight;
    });

    return Math.min(100, Math.round((weightedTime / totalTime) * 100));
  }

  // Health Metrics
  async getUserHealthMetrics(userId: string, type?: string, startDate?: Date, endDate?: Date): Promise<HealthMetric[]> {
    let conditions = [eq(healthMetrics.userId, userId)];
    
    if (type) {
      conditions.push(eq(healthMetrics.type, type));
    }
    if (startDate) {
      conditions.push(gte(healthMetrics.recordedAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(healthMetrics.recordedAt, endDate));
    }
    
    return await db
      .select()
      .from(healthMetrics)
      .where(and(...conditions))
      .orderBy(desc(healthMetrics.recordedAt));
  }

  async createHealthMetric(userId: string, insertMetric: InsertHealthMetric): Promise<HealthMetric> {
    const [metric] = await db
      .insert(healthMetrics)
      .values({ ...insertMetric, userId })
      .returning();
    return metric;
  }

  async getLatestHealthMetrics(userId: string): Promise<Record<string, HealthMetric>> {
    const userMetrics = await this.getUserHealthMetrics(userId);
    const latest: Record<string, HealthMetric> = {};
    
    userMetrics.forEach(metric => {
      if (!latest[metric.type] || metric.recordedAt > latest[metric.type].recordedAt) {
        latest[metric.type] = metric;
      }
    });
    
    return latest;
  }

  async simulateDeviceSync(userId: string, deviceSource: string): Promise<HealthMetric[]> {
    const now = new Date();
    const syncedMetrics: InsertHealthMetric[] = [];

    // Generate device-specific mock data based on source
    const deviceProfiles = {
      apple_watch: {
        steps: { range: [8000, 15000], accuracy: 0.95 },
        heartRate: { range: [60, 90], accuracy: 0.98 },
        calories: { range: [1800, 2800], accuracy: 0.90 },
        workout: { range: [30, 120], accuracy: 0.95 },
        sleep: { range: [6, 9], accuracy: 0.85 }
      },
      android_watch: {
        steps: { range: [7500, 14000], accuracy: 0.92 },
        heartRate: { range: [62, 88], accuracy: 0.95 },
        calories: { range: [1700, 2700], accuracy: 0.88 },
        workout: { range: [25, 100], accuracy: 0.90 },
        sleep: { range: [6, 8.5], accuracy: 0.80 }
      },
      fitbit: {
        steps: { range: [8500, 16000], accuracy: 0.97 },
        heartRate: { range: [58, 85], accuracy: 0.96 },
        calories: { range: [1900, 2900], accuracy: 0.93 },
        workout: { range: [35, 150], accuracy: 0.92 },
        sleep: { range: [6.5, 9], accuracy: 0.88 }
      },
      smart_glasses: {
        steps: { range: [5000, 12000], accuracy: 0.75 },
        heartRate: { range: [65, 95], accuracy: 0.70 },
        calories: { range: [1600, 2400], accuracy: 0.75 },
        workout: { range: [20, 80], accuracy: 0.85 },
        sleep: { range: [5, 8], accuracy: 0.60 }
      },
      smart_ring: {
        steps: { range: [7000, 13000], accuracy: 0.88 },
        heartRate: { range: [55, 82], accuracy: 0.94 },
        calories: { range: [1750, 2600], accuracy: 0.85 },
        workout: { range: [40, 130], accuracy: 0.88 },
        sleep: { range: [7, 9.5], accuracy: 0.92 }
      },
      auto: {
        steps: { range: [8000, 15000], accuracy: 0.95 },
        heartRate: { range: [60, 90], accuracy: 0.95 },
        calories: { range: [1800, 2800], accuracy: 0.90 },
        workout: { range: [30, 120], accuracy: 0.90 },
        sleep: { range: [6, 9], accuracy: 0.85 }
      }
    };

    const profile = deviceProfiles[deviceSource as keyof typeof deviceProfiles] || deviceProfiles.auto;

    // Generate realistic metrics based on device profile
    Object.entries(profile).forEach(([type, config]) => {
      const [min, max] = config.range;
      const baseValue = Math.floor(Math.random() * (max - min + 1)) + min;
      const value = Math.floor(baseValue * config.accuracy);

      syncedMetrics.push({
        type,
        value,
        unit: this.getMetricUnit(type),
        recordedAt: now,
        metadata: {
          source: deviceSource,
          accuracy: config.accuracy,
          syncTime: now.toISOString()
        }
      });
    });

    // Save synced metrics to database
    const savedMetrics: HealthMetric[] = [];
    for (const metric of syncedMetrics) {
      const saved = await this.createHealthMetric(userId, metric);
      savedMetrics.push(saved);
    }

    return savedMetrics;
  }

  private getMetricUnit(type: string): string {
    const units: Record<string, string> = {
      steps: 'count',
      heartRate: 'bpm',
      calories: 'cal',
      workout: 'minutes',
      sleep: 'hours'
    };
    return units[type] || 'unit';
  }

  // Weekly Reports
  async getUserWeeklyReports(userId: string, limit: number = 10): Promise<WeeklyReport[]> {
    return await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.userId, userId))
      .orderBy(desc(weeklyReports.weekStart))
      .limit(limit);
  }

  async createWeeklyReport(userId: string, insertReport: InsertWeeklyReport): Promise<WeeklyReport> {
    const [report] = await db
      .insert(weeklyReports)
      .values({ ...insertReport, userId })
      .returning();
    return report;
  }

  async generateWeeklyReport(userId: string, weekStart: Date): Promise<WeeklyReport> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const browserActivities = await this.getUserBrowserActivities(userId, weekStart, weekEnd);
    const tasks = await this.getUserTasks(userId);
    const focusSessions = await this.getUserFocusSessions(userId, weekStart, weekEnd);

    // Calculate browser stats
    const categoryTotals = browserActivities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + activity.duration;
      return acc;
    }, {} as Record<string, number>);

    const totalBrowserTime = Object.values(categoryTotals).reduce((sum, time) => sum + time, 0);
    const browserStats = {
      totalTime: totalBrowserTime,
      categories: categoryTotals,
      topSites: this.getTopSites(browserActivities),
    };

    // Calculate productivity score
    const productivityScore = this.calculateProductivityScore(
      Object.entries(categoryTotals).reduce((acc, [cat, duration]) => {
        acc[cat] = { duration, count: 0, percentage: 0 };
        return acc;
      }, {} as Record<string, any>),
      totalBrowserTime
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(browserStats, tasks, focusSessions);

    const report: InsertWeeklyReport = {
      weekStart,
      weekEnd,
      browserStats,
      productivityScore,
      recommendations,
    };

    return await this.createWeeklyReport(userId, report);
  }

  private getTopSites(activities: BrowserActivity[]): Array<{ domain: string; duration: number; percentage: number }> {
    const domainTotals = activities.reduce((acc, activity) => {
      acc[activity.domain] = (acc[activity.domain] || 0) + activity.duration;
      return acc;
    }, {} as Record<string, number>);

    const totalTime = Object.values(domainTotals).reduce((sum, time) => sum + time, 0);

    return Object.entries(domainTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([domain, duration]) => ({
        domain,
        duration,
        percentage: totalTime > 0 ? Math.round((duration / totalTime) * 100) : 0,
      }));
  }

  private generateRecommendations(browserStats: any, tasks: Task[], focusSessions: FocusSession[]): any {
    const recommendations = [];

    // Browser usage recommendations
    const socialTime = browserStats.categories.social || 0;
    const entertainmentTime = browserStats.categories.entertainment || 0;
    const developmentTime = browserStats.categories.development || 0;

    if (socialTime > 3600) { // More than 1 hour on social
      recommendations.push({
        type: 'time_management',
        priority: 'high',
        message: 'Consider reducing social media time to boost productivity',
        suggestion: 'Set specific times for social media check-ins',
      });
    }

    if (entertainmentTime > 7200) { // More than 2 hours entertainment
      recommendations.push({
        type: 'time_management',
        priority: 'medium',
        message: 'High entertainment usage detected',
        suggestion: 'Balance entertainment with learning or productive activities',
      });
    }

    if (developmentTime > 0 && focusSessions.length < 3) {
      recommendations.push({
        type: 'focus',
        priority: 'medium',
        message: 'Use focus sessions during development work',
        suggestion: 'Try Pomodoro technique for better concentration',
      });
    }

    // Task completion recommendations
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;

    if (totalTasks > 0 && completedTasks / totalTasks < 0.7) {
      recommendations.push({
        type: 'productivity',
        priority: 'high',
        message: 'Task completion rate could be improved',
        suggestion: 'Break down large tasks into smaller, manageable ones',
      });
    }

    return recommendations;
  }

  // Journal Entries
  async getUserJournalEntries(userId: string, limit: number = 30): Promise<JournalEntry[]> {
    const entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.date))
      .limit(limit);
    
    return entries;
  }

  async getJournalEntry(userId: string, date: string): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.date, date)
      ));
    
    return entry;
  }

  async createJournalEntry(userId: string, insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values({
        ...insertEntry,
        userId,
      })
      .returning();
    
    return entry;
  }

  async updateJournalEntry(userId: string, entryId: number, updateEntry: UpdateJournalEntry): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .update(journalEntries)
      .set({
        ...updateEntry,
        updatedAt: new Date(),
      })
      .where(and(
        eq(journalEntries.id, entryId),
        eq(journalEntries.userId, userId)
      ))
      .returning();
    
    return entry;
  }

  async deleteJournalEntry(userId: string, entryId: number): Promise<boolean> {
    const result = await db
      .delete(journalEntries)
      .where(and(
        eq(journalEntries.id, entryId),
        eq(journalEntries.userId, userId)
      ));
    
    return (result.rowCount ?? 0) > 0;
  }

  // Categories
  async getUserCategories(userId: string, type?: string): Promise<Category[]> {
    const query = db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));
    
    if (type) {
      query.where(eq(categories.type, type));
    }
    
    return await query.orderBy(categories.name);
  }

  async createCategory(userId: string, insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values({
        ...insertCategory,
        userId,
      })
      .returning();
    
    return category;
  }

  async deleteCategory(userId: string, categoryId: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId),
        eq(categories.isDefault, false) // Prevent deletion of default categories
      ));
    
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
