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
  type User,
  type InsertUser,
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
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tasks
  getUserTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(userId: number, task: InsertTask): Promise<Task>;
  updateTask(userId: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(userId: number, taskId: number): Promise<boolean>;

  // Notes
  getUserNotes(userId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(userId: number, note: InsertNote): Promise<Note>;
  updateNote(userId: number, noteId: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(userId: number, noteId: number): Promise<boolean>;
  searchNotes(userId: number, query: string): Promise<Note[]>;

  // Activities
  getUserActivities(userId: number, startDate?: Date, endDate?: Date): Promise<Activity[]>;
  createActivity(userId: number, activity: InsertActivity): Promise<Activity>;
  getActivityStats(userId: number, date: Date): Promise<any>;

  // Events
  getUserEvents(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]>;
  createEvent(userId: number, event: InsertEvent): Promise<Event>;
  updateEvent(userId: number, eventId: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(userId: number, eventId: number): Promise<boolean>;

  // Focus Sessions
  getUserFocusSessions(userId: number, startDate?: Date, endDate?: Date): Promise<FocusSession[]>;
  createFocusSession(userId: number, session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(userId: number, sessionId: number, session: Partial<InsertFocusSession>): Promise<FocusSession | undefined>;

  // Browser Activities
  getUserBrowserActivities(userId: number, startDate?: Date, endDate?: Date): Promise<BrowserActivity[]>;
  createBrowserActivity(userId: number, activity: InsertBrowserActivity): Promise<BrowserActivity>;
  getBrowserActivityStats(userId: number, date: Date): Promise<any>;
  categorizeUrl(url: string): string;

  // Health Metrics
  getUserHealthMetrics(userId: number, type?: string, startDate?: Date, endDate?: Date): Promise<HealthMetric[]>;
  createHealthMetric(userId: number, metric: InsertHealthMetric): Promise<HealthMetric>;
  getLatestHealthMetrics(userId: number): Promise<Record<string, HealthMetric>>;

  // Weekly Reports
  getUserWeeklyReports(userId: number, limit?: number): Promise<WeeklyReport[]>;
  createWeeklyReport(userId: number, report: InsertWeeklyReport): Promise<WeeklyReport>;
  generateWeeklyReport(userId: number, weekStart: Date): Promise<WeeklyReport>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private notes: Map<number, Note>;
  private activities: Map<number, Activity>;
  private events: Map<number, Event>;
  private focusSessions: Map<number, FocusSession>;
  private browserActivities: Map<number, BrowserActivity>;
  private healthMetrics: Map<number, HealthMetric>;
  private weeklyReports: Map<number, WeeklyReport>;
  private currentUserId: number;
  private currentTaskId: number;
  private currentNoteId: number;
  private currentActivityId: number;
  private currentEventId: number;
  private currentFocusSessionId: number;
  private currentBrowserActivityId: number;
  private currentHealthMetricId: number;
  private currentWeeklyReportId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.notes = new Map();
    this.activities = new Map();
    this.events = new Map();
    this.focusSessions = new Map();
    this.browserActivities = new Map();
    this.healthMetrics = new Map();
    this.weeklyReports = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentNoteId = 1;
    this.currentActivityId = 1;
    this.currentEventId = 1;
    this.currentFocusSessionId = 1;
    this.currentBrowserActivityId = 1;
    this.currentHealthMetricId = 1;
    this.currentWeeklyReportId = 1;

    // Initialize with demo user
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoUser: User = {
      id: 1,
      username: 'varun',
      password: 'demo',
      name: 'Varun',
      email: 'varun@example.com',
      createdAt: new Date(),
    };
    this.users.set(1, demoUser);
    this.currentUserId = 2;

    // Add demo browser activities
    this.initializeDemoBrowserData();
    this.initializeDemoHealthData();
  }

  private initializeDemoBrowserData() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const demoActivities: Omit<BrowserActivity, 'id' | 'createdAt'>[] = [
      {
        userId: 1,
        url: 'https://github.com/vercel/next.js',
        domain: 'github.com',
        title: 'GitHub - vercel/next.js: The React Framework',
        category: 'development',
        duration: 2340, // 39 minutes
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 2340 * 1000),
      },
      {
        userId: 1,
        url: 'https://stackoverflow.com/questions/react-hooks',
        domain: 'stackoverflow.com',
        title: 'React Hooks - Stack Overflow',
        category: 'development',
        duration: 1800, // 30 minutes
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 1800 * 1000),
      },
      {
        userId: 1,
        url: 'https://www.youtube.com/watch?v=programming-tutorial',
        domain: 'youtube.com',
        title: 'Advanced React Patterns - YouTube',
        category: 'learning',
        duration: 3600, // 1 hour
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000),
      },
      {
        userId: 1,
        url: 'https://twitter.com/home',
        domain: 'twitter.com',
        title: 'Twitter / X',
        category: 'social',
        duration: 900, // 15 minutes
        startTime: new Date(today.getTime() + 16 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000 + 900 * 1000),
      },
    ];

    demoActivities.forEach(activity => {
      const id = this.currentBrowserActivityId++;
      this.browserActivities.set(id, {
        ...activity,
        id,
        createdAt: new Date(),
      });
    });
  }

  private initializeDemoHealthData() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const demoMetrics: Omit<HealthMetric, 'id' | 'createdAt'>[] = [
      {
        userId: 1,
        type: 'steps',
        value: 8543,
        unit: 'steps',
        metadata: null,
        recordedAt: today,
      },
      {
        userId: 1,
        type: 'heartRate',
        value: 72,
        unit: 'bpm',
        metadata: { context: 'resting' },
        recordedAt: today,
      },
      {
        userId: 1,
        type: 'calories',
        value: 2150,
        unit: 'calories',
        metadata: null,
        recordedAt: today,
      },
      {
        userId: 1,
        type: 'workout',
        value: 45,
        unit: 'minutes',
        metadata: { type: 'cardio', intensity: 'moderate' },
        recordedAt: today,
      },
    ];

    demoMetrics.forEach(metric => {
      const id = this.currentHealthMetricId++;
      this.healthMetrics.set(id, {
        ...metric,
        id,
        createdAt: new Date(),
      });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Tasks
  async getUserTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(userId: number, insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      userId,
      description: insertTask.description || null,
      estimatedTime: insertTask.estimatedTime || null,
      dueDate: insertTask.dueDate || null,
      status: 'pending',
      actualTime: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(userId: number, updateTask: UpdateTask): Promise<Task | undefined> {
    const existingTask = this.tasks.get(updateTask.id);
    if (!existingTask || existingTask.userId !== userId) {
      return undefined;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updateTask,
      updatedAt: new Date(),
      completedAt: updateTask.status === 'completed' ? new Date() : existingTask.completedAt,
    };
    this.tasks.set(updateTask.id, updatedTask);
    return updatedTask;
  }

  async deleteTask(userId: number, taskId: number): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.userId !== userId) {
      return false;
    }
    return this.tasks.delete(taskId);
  }

  // Notes
  async getUserNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.userId === userId);
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(userId: number, insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const note: Note = {
      ...insertNote,
      id,
      userId,
      category: insertNote.category || null,
      tags: insertNote.tags || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(userId: number, noteId: number, updateNote: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notes.get(noteId);
    if (!existingNote || existingNote.userId !== userId) {
      return undefined;
    }

    const updatedNote: Note = {
      ...existingNote,
      ...updateNote,
      updatedAt: new Date(),
    };
    this.notes.set(noteId, updatedNote);
    return updatedNote;
  }

  async deleteNote(userId: number, noteId: number): Promise<boolean> {
    const note = this.notes.get(noteId);
    if (!note || note.userId !== userId) {
      return false;
    }
    return this.notes.delete(noteId);
  }

  async searchNotes(userId: number, query: string): Promise<Note[]> {
    const userNotes = await this.getUserNotes(userId);
    const lowercaseQuery = query.toLowerCase();
    return userNotes.filter(note =>
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }

  // Activities
  async getUserActivities(userId: number, startDate?: Date, endDate?: Date): Promise<Activity[]> {
    let userActivities = Array.from(this.activities.values()).filter(activity => activity.userId === userId);
    
    if (startDate) {
      userActivities = userActivities.filter(activity => activity.startTime >= startDate);
    }
    if (endDate) {
      userActivities = userActivities.filter(activity => activity.endTime <= endDate);
    }
    
    return userActivities;
  }

  async createActivity(userId: number, insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      userId,
      metadata: insertActivity.metadata || null,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivityStats(userId: number, date: Date): Promise<any> {
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
  async getUserEvents(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let userEvents = Array.from(this.events.values()).filter(event => event.userId === userId);
    
    if (startDate) {
      userEvents = userEvents.filter(event => event.startTime >= startDate);
    }
    if (endDate) {
      userEvents = userEvents.filter(event => event.endTime <= endDate);
    }
    
    return userEvents;
  }

  async createEvent(userId: number, insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...insertEvent,
      id,
      userId,
      description: insertEvent.description || null,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(userId: number, eventId: number, updateEvent: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(eventId);
    if (!existingEvent || existingEvent.userId !== userId) {
      return undefined;
    }

    const updatedEvent: Event = {
      ...existingEvent,
      ...updateEvent,
    };
    this.events.set(eventId, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(userId: number, eventId: number): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event || event.userId !== userId) {
      return false;
    }
    return this.events.delete(eventId);
  }

  // Focus Sessions
  async getUserFocusSessions(userId: number, startDate?: Date, endDate?: Date): Promise<FocusSession[]> {
    let userSessions = Array.from(this.focusSessions.values()).filter(session => session.userId === userId);
    
    if (startDate) {
      userSessions = userSessions.filter(session => session.startTime >= startDate);
    }
    if (endDate) {
      userSessions = userSessions.filter(session => session.endTime && session.endTime <= endDate);
    }
    
    return userSessions;
  }

  async createFocusSession(userId: number, insertSession: InsertFocusSession): Promise<FocusSession> {
    const id = this.currentFocusSessionId++;
    const session: FocusSession = {
      ...insertSession,
      id,
      userId,
      endTime: insertSession.endTime || null,
      createdAt: new Date(),
    };
    this.focusSessions.set(id, session);
    return session;
  }

  async updateFocusSession(userId: number, sessionId: number, updateSession: Partial<InsertFocusSession>): Promise<FocusSession | undefined> {
    const existingSession = this.focusSessions.get(sessionId);
    if (!existingSession || existingSession.userId !== userId) {
      return undefined;
    }

    const updatedSession: FocusSession = {
      ...existingSession,
      ...updateSession,
    };
    this.focusSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  // Browser Activities
  async getUserBrowserActivities(userId: number, startDate?: Date, endDate?: Date): Promise<BrowserActivity[]> {
    let userActivities = Array.from(this.browserActivities.values()).filter(activity => activity.userId === userId);
    
    if (startDate) {
      userActivities = userActivities.filter(activity => activity.startTime >= startDate);
    }
    if (endDate) {
      userActivities = userActivities.filter(activity => activity.endTime <= endDate);
    }
    
    return userActivities.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async createBrowserActivity(userId: number, insertActivity: InsertBrowserActivity): Promise<BrowserActivity> {
    const id = this.currentBrowserActivityId++;
    const activity: BrowserActivity = {
      ...insertActivity,
      id,
      userId,
      createdAt: new Date(),
    };
    this.browserActivities.set(id, activity);
    return activity;
  }

  async getBrowserActivityStats(userId: number, date: Date): Promise<any> {
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
  async getUserHealthMetrics(userId: number, type?: string, startDate?: Date, endDate?: Date): Promise<HealthMetric[]> {
    let userMetrics = Array.from(this.healthMetrics.values()).filter(metric => metric.userId === userId);
    
    if (type) {
      userMetrics = userMetrics.filter(metric => metric.type === type);
    }
    if (startDate) {
      userMetrics = userMetrics.filter(metric => metric.recordedAt >= startDate);
    }
    if (endDate) {
      userMetrics = userMetrics.filter(metric => metric.recordedAt <= endDate);
    }
    
    return userMetrics.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }

  async createHealthMetric(userId: number, insertMetric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.currentHealthMetricId++;
    const metric: HealthMetric = {
      ...insertMetric,
      id,
      userId,
      metadata: insertMetric.metadata || null,
      createdAt: new Date(),
    };
    this.healthMetrics.set(id, metric);
    return metric;
  }

  async getLatestHealthMetrics(userId: number): Promise<Record<string, HealthMetric>> {
    const userMetrics = await this.getUserHealthMetrics(userId);
    const latest: Record<string, HealthMetric> = {};
    
    userMetrics.forEach(metric => {
      if (!latest[metric.type] || metric.recordedAt > latest[metric.type].recordedAt) {
        latest[metric.type] = metric;
      }
    });
    
    return latest;
  }

  // Weekly Reports
  async getUserWeeklyReports(userId: number, limit: number = 10): Promise<WeeklyReport[]> {
    return Array.from(this.weeklyReports.values())
      .filter(report => report.userId === userId)
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
      .slice(0, limit);
  }

  async createWeeklyReport(userId: number, insertReport: InsertWeeklyReport): Promise<WeeklyReport> {
    const id = this.currentWeeklyReportId++;
    const report: WeeklyReport = {
      ...insertReport,
      id,
      userId,
      createdAt: new Date(),
    };
    this.weeklyReports.set(id, report);
    return report;
  }

  async generateWeeklyReport(userId: number, weekStart: Date): Promise<WeeklyReport> {
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
}

export const storage = new MemStorage();
