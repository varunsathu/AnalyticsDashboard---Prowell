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
  cleanupCompletedTasks(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // No demo data initialization - only real user data
  }

  // Removed static demo browser data - all activity tracking now uses authentic user data only

  // Removed static demo health data - all health metrics now use authentic device data only

  // Users (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  private async initializeDefaultCategories(userId: string) {
    // Check if user already has default categories
    const existingCategories = await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.isDefault, true)));
    
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: "Work", color: "blue", type: "task", isDefault: true },
        { name: "Personal", color: "emerald", type: "task", isDefault: true },
        { name: "Learning", color: "amber", type: "task", isDefault: true },
        { name: "Health", color: "red", type: "task", isDefault: true },
        { name: "Finance", color: "green", type: "task", isDefault: true },
      ];

      await db.insert(categories).values(
        defaultCategories.map(cat => ({
          ...cat,
          userId,
        }))
      );
    }
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
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(
        sql`CASE WHEN status = 'pending' THEN 0 ELSE 1 END`,
        desc(tasks.createdAt)
      );
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
    console.log(`Storage: Deleting task ${taskId} (type: ${typeof taskId}) for user ${userId}`);
    
    if (typeof taskId !== 'number' || isNaN(taskId)) {
      console.error(`Storage: Invalid taskId type or value:`, taskId, typeof taskId);
      throw new Error(`Invalid task ID: ${taskId}`);
    }
    
    try {
      const result = await db
        .delete(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
      
      const success = (result.rowCount || 0) > 0;
      console.log(`Storage: Delete task ${taskId} result: ${success}, rowCount: ${result.rowCount}`);
      return success;
    } catch (error) {
      console.error(`Storage: Error deleting task ${taskId}:`, error);
      throw error;
    }
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
    console.log('Storage searchNotes - userId:', userId, 'query:', query);
    
    const result = await db
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
    
    console.log('Storage searchNotes - found:', result.length, 'notes');
    return result;
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
    // Legacy function - no longer generates mock data
    // Real device sync should use the /api/health-metrics/real-sync endpoint
    throw new Error(`Device sync requires real device connection. Use device-specific sync methods for ${deviceSource}.`);
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

    // Fetch all data for the week
    const browserActivities = await this.getUserBrowserActivities(userId, weekStart, weekEnd);
    const allTasks = await this.getUserTasks(userId);
    const focusSessions = await this.getUserFocusSessions(userId, weekStart, weekEnd);
    const notes = await this.getUserNotes(userId);
    const journalEntries = await this.getUserJournalEntries(userId, 30);
    const healthMetrics = await this.getUserHealthMetrics(userId, undefined, weekStart, weekEnd);

    // Filter tasks created/updated during the week
    const weekTasks = allTasks.filter(task => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : new Date();
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    // Filter notes and journal entries for the week
    const weekNotes = notes.filter(note => {
      const noteDate = note.createdAt ? new Date(note.createdAt) : new Date();
      return noteDate >= weekStart && noteDate <= weekEnd;
    });

    const weekJournalEntries = journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

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

    // Calculate focus session stats
    const totalFocusTime = focusSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const completedFocusSessions = focusSessions.filter(session => session.completedDuration > 0).length;

    // Calculate task completion stats
    const completedTasks = weekTasks.filter(task => task.status === 'completed').length;
    const taskCompletionRate = weekTasks.length > 0 ? (completedTasks / weekTasks.length) * 100 : 0;

    // Calculate health metrics average
    const avgHealthMetrics = this.calculateHealthAverages(healthMetrics);

    // Calculate comprehensive productivity score
    const productivityScore = this.calculateEnhancedProductivityScore({
      browserStats: categoryTotals,
      totalBrowserTime,
      focusTime: totalFocusTime,
      focusSessions: focusSessions.length,
      taskCompletionRate,
      notesCreated: weekNotes.length,
      journalEntries: weekJournalEntries.length,
    });

    // Generate comprehensive recommendations
    const recommendations = this.generateEnhancedRecommendations({
      browserStats,
      tasks: weekTasks,
      focusSessions,
      notes: weekNotes,
      journalEntries: weekJournalEntries,
      healthMetrics: avgHealthMetrics,
      totalFocusTime,
      taskCompletionRate,
    });

    const report: InsertWeeklyReport = {
      weekStart,
      weekEnd,
      browserStats: {
        ...browserStats,
        focusTime: totalFocusTime,
        focusSessions: completedFocusSessions,
        tasksCompleted: completedTasks,
        taskCompletionRate,
        notesCreated: weekNotes.length,
        journalDays: weekJournalEntries.length,
        healthMetrics: avgHealthMetrics,
      },
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

  private calculateHealthAverages(healthMetrics: HealthMetric[]): Record<string, number> {
    const averages: Record<string, number> = {};
    const totals: Record<string, { sum: number; count: number }> = {};

    healthMetrics.forEach(metric => {
      if (!totals[metric.type]) {
        totals[metric.type] = { sum: 0, count: 0 };
      }
      totals[metric.type].sum += metric.value;
      totals[metric.type].count += 1;
    });

    Object.entries(totals).forEach(([type, data]) => {
      averages[type] = Math.round(data.sum / data.count);
    });

    return averages;
  }

  private calculateEnhancedProductivityScore(data: {
    browserStats: Record<string, number>;
    totalBrowserTime: number;
    focusTime: number;
    focusSessions: number;
    taskCompletionRate: number;
    notesCreated: number;
    journalEntries: number;
  }): number {
    let score = 0;
    let maxScore = 0;

    // Browser productivity (40% weight)
    if (data.totalBrowserTime > 0) {
      const productivityTime = (data.browserStats.development || 0) + (data.browserStats.productivity || 0) + (data.browserStats.learning || 0);
      const browserProductivity = Math.min(100, (productivityTime / data.totalBrowserTime) * 100);
      score += browserProductivity * 0.4;
    }
    maxScore += 40;

    // Focus sessions (25% weight)
    const focusScore = Math.min(100, (data.focusTime / 3600) * 25); // 1 hour = 25 points
    score += focusScore * 0.25;
    maxScore += 25;

    // Task completion (20% weight)
    score += data.taskCompletionRate * 0.2;
    maxScore += 20;

    // Notes creation (10% weight)
    const notesScore = Math.min(100, data.notesCreated * 20); // 5 notes = 100 points
    score += notesScore * 0.1;
    maxScore += 10;

    // Journal consistency (5% weight)
    const journalScore = Math.min(100, (data.journalEntries / 7) * 100); // Daily journaling = 100 points
    score += journalScore * 0.05;
    maxScore += 5;

    return Math.round((score / maxScore) * 100);
  }

  private generateEnhancedRecommendations(data: {
    browserStats: any;
    tasks: Task[];
    focusSessions: FocusSession[];
    notes: Note[];
    journalEntries: JournalEntry[];
    healthMetrics: Record<string, number>;
    totalFocusTime: number;
    taskCompletionRate: number;
  }): any {
    const recommendations = [];

    // Browser usage recommendations
    const socialTime = data.browserStats.categories.social || 0;
    const entertainmentTime = data.browserStats.categories.entertainment || 0;
    const developmentTime = data.browserStats.categories.development || 0;
    const totalTime = data.browserStats.totalTime || 0;

    if (socialTime > 3600) {
      recommendations.push({
        type: 'time_management',
        priority: 'high',
        message: 'High social media usage detected',
        suggestion: `Reduce ${Math.round(socialTime/3600)}h of social media time. Try setting specific check-in times.`,
      });
    }

    if (entertainmentTime > 7200) {
      recommendations.push({
        type: 'time_management',
        priority: 'medium',
        message: 'Entertainment time is above recommended levels',
        suggestion: 'Balance entertainment with learning activities for better productivity.',
      });
    }

    // Focus session recommendations
    if (developmentTime > 0 && data.focusSessions.length < 3) {
      recommendations.push({
        type: 'focus',
        priority: 'medium',
        message: 'Use focus sessions during development work',
        suggestion: 'Try Pomodoro technique for 25-minute focused work sessions.',
      });
    }

    if (data.totalFocusTime < 1800) { // Less than 30 minutes
      recommendations.push({
        type: 'focus',
        priority: 'medium',
        message: 'Low focus time this week',
        suggestion: 'Aim for at least 2 hours of focused work daily using the timer.',
      });
    }

    // Task management recommendations
    if (data.taskCompletionRate < 70) {
      recommendations.push({
        type: 'productivity',
        priority: 'high',
        message: `Task completion rate is ${Math.round(data.taskCompletionRate)}%`,
        suggestion: 'Break large tasks into smaller, manageable subtasks.',
      });
    }

    // Notes and learning recommendations
    if (data.notes.length === 0) {
      recommendations.push({
        type: 'learning',
        priority: 'low',
        message: 'No notes created this week',
        suggestion: 'Use Smart Notes to capture insights and track your learning progress.',
      });
    }

    // Journal consistency recommendations
    if (data.journalEntries.length < 3) {
      recommendations.push({
        type: 'reflection',
        priority: 'low',
        message: 'Infrequent journaling detected',
        suggestion: 'Daily journaling helps track mood, goals, and personal growth.',
      });
    }

    // Health metrics recommendations
    if (data.healthMetrics.steps && data.healthMetrics.steps < 8000) {
      recommendations.push({
        type: 'health',
        priority: 'medium',
        message: 'Low daily step count',
        suggestion: 'Aim for 10,000 steps daily. Take walking breaks during work.',
      });
    }

    if (data.healthMetrics.sleep && data.healthMetrics.sleep < 7) {
      recommendations.push({
        type: 'health',
        priority: 'high',
        message: 'Insufficient sleep detected',
        suggestion: 'Aim for 7-9 hours of sleep for optimal productivity and health.',
      });
    }

    return recommendations;
  }

  private generateRecommendations(browserStats: any, tasks: Task[], focusSessions: FocusSession[]): any {
    // Legacy method - kept for backward compatibility
    return this.generateEnhancedRecommendations({
      browserStats,
      tasks,
      focusSessions,
      notes: [],
      journalEntries: [],
      healthMetrics: {},
      totalFocusTime: 0,
      taskCompletionRate: 0,
    });
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
    if (type) {
      return await db
        .select()
        .from(categories)
        .where(and(eq(categories.userId, userId), eq(categories.type, type)))
        .orderBy(categories.name);
    }
    
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
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
    // Check if it's a default category - don't allow deletion
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
    
    if (!category) {
      return false;
    }
    
    if (category.isDefault) {
      console.log('Cannot delete default category:', category.name);
      return false;
    }
    
    // Delete the category but keep notes and tasks (they'll just have the category name as string)
    const result = await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
    
    return (result.rowCount ?? 0) > 0;
  }

  async cleanupCompletedTasks(userId: string): Promise<number> {
    // Delete completed tasks older than 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const result = await db
      .delete(tasks)
      .where(and(
        eq(tasks.userId, userId),
        eq(tasks.status, 'completed'),
        sql`completed_at < ${weekAgo}`
      ));
    
    return result.rowCount ?? 0;
  }
}

export const storage = new DatabaseStorage();
