import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import {
  insertTaskSchema,
  updateTaskSchema,
  insertNoteSchema,
  insertActivitySchema,
  insertEventSchema,
  insertFocusSessionSchema,
  insertBrowserActivitySchema,
  insertHealthMetricSchema,
  insertWeeklyReportSchema,
  insertJournalEntrySchema,
  updateJournalEntrySchema,
  insertCategorySchema,
  users,
  tasks,
  notes,
  focusSessions,
  browserActivities,
  healthMetrics,
} from "@shared/schema";
import { db } from "./db";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sanitizeObject, sanitizeText, sanitizeHtml } from "./security/sanitization";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  // Helper function to get user ID from request with validation
  const getUserId = (req: any): string => {
    if (req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      // Security: Validate user ID format to prevent injection
      if (typeof userId !== 'string' || !/^[a-zA-Z0-9\-_]+$/.test(userId)) {
        throw new Error('Invalid user ID format');
      }
      return userId;
    }
    // Create demo user if not authenticated (for development)
    return "demo-user-id";
  };

  // Helper function to validate and sanitize integer parameters
  const validateIntParam = (param: any, name: string): number => {
    const num = parseInt(param);
    if (isNaN(num) || num < 0) {
      throw new Error(`Invalid ${name} parameter`);
    }
    return num;
  };

  // Helper function to validate date parameters
  const validateDateParam = (dateStr: string): Date => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date;
  };

  // Tasks
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      console.log('Creating task for user:', userId, 'with data:', req.body);
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(userId, taskData);
      console.log('Task created successfully:', task);
      res.json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(400).json({ message: "Invalid task data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const taskId = validateIntParam(req.params.id, 'task ID');
      const taskData = updateTaskSchema.parse({ ...req.body, id: taskId });
      const task = await storage.updateTask(userId, taskData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const taskId = validateIntParam(req.params.id, 'task ID');
      const success = await storage.deleteTask(userId, taskId);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  app.delete("/api/tasks/bulk", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const requestBody = req.body;
      console.log('Raw request body:', JSON.stringify(requestBody));
      
      const { taskIds } = requestBody;
      console.log('Extracted taskIds:', taskIds, 'type:', typeof taskIds, 'for user:', userId);
      
      if (!taskIds) {
        return res.status(400).json({ message: "taskIds field is required" });
      }
      
      if (!Array.isArray(taskIds)) {
        return res.status(400).json({ message: "taskIds must be an array" });
      }

      if (taskIds.length === 0) {
        return res.status(400).json({ message: "No task IDs provided" });
      }

      let deletedCount = 0;
      const errors = [];
      
      for (let i = 0; i < taskIds.length; i++) {
        const id = taskIds[i];
        console.log(`Processing taskId[${i}]:`, id, 'type:', typeof id);
        
        try {
          let taskId;
          if (typeof id === 'number') {
            taskId = id;
          } else if (typeof id === 'string') {
            taskId = parseInt(id, 10);
          } else {
            taskId = Number(id);
          }
          
          console.log(`Converted taskId:`, taskId, 'isNaN:', isNaN(taskId));
          
          if (isNaN(taskId) || taskId <= 0) {
            errors.push(`Invalid task ID: ${id} (converted to ${taskId})`);
            continue;
          }
          
          console.log(`Attempting to delete task ${taskId} for user ${userId}`);
          const success = await storage.deleteTask(userId, taskId);
          console.log(`Delete result for task ${taskId}:`, success);
          if (success) {
            deletedCount++;
          } else {
            errors.push(`Task ${taskId} not found or unauthorized`);
          }
        } catch (error) {
          console.error(`Failed to delete task ${id}:`, error);
          errors.push(`Task ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      console.log(`Successfully deleted ${deletedCount} tasks, errors:`, errors);
      res.json({ success: true, deletedCount, errors: errors.length > 0 ? errors : undefined });
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      res.status(500).json({ message: "Failed to delete tasks", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Notes
  app.get("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const notes = await storage.getUserNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      console.log('Creating note for user:', userId, 'with data:', req.body);
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(userId, noteData);
      console.log('Note created successfully:', note);
      res.json(note);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(400).json({ message: "Invalid note data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const noteId = validateIntParam(req.params.id, 'note ID');
      const updates = req.body;
      console.log('Updating note:', noteId, 'for user:', userId, 'with data:', updates);
      const note = await storage.updateNote(userId, noteId, updates);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      console.log('Note updated successfully:', note);
      res.json(note);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ message: "Failed to update note", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const noteId = validateIntParam(req.params.id, 'note ID');
      const success = await storage.deleteNote(userId, noteId);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  app.get("/api/notes/search", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const query = req.query.q as string;
      console.log('Search request - userId:', userId, 'query:', query);
      
      if (!query || query.trim() === '') {
        console.log('Empty search query, returning empty array');
        return res.json([]); // Return empty array for empty queries
      }
      
      const notes = await storage.searchNotes(userId, query);
      console.log('Search results:', notes.length, 'notes found');
      res.json(notes);
    } catch (error) {
      console.error('Error searching notes:', error);
      res.status(500).json({ message: "Failed to search notes" });
    }
  });

  // Activities
  app.get("/api/activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const activities = await storage.getUserActivities(userId, startDate, endDate);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(userId, activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.get("/api/activities/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const stats = await storage.getActivityStats(userId, date);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity stats" });
    }
  });

  // Events
  app.get("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const events = await storage.getUserEvents(userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      console.log('Creating event for user:', userId, 'with data:', req.body);
      
      // Convert date strings to Date objects
      const eventData = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      };
      
      const validatedData = insertEventSchema.parse(eventData);
      console.log('Validated event data:', validatedData);
      const event = await storage.createEvent(userId, validatedData);
      console.log('Event created successfully:', event);
      res.json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(400).json({ message: "Invalid event data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const eventId = validateIntParam(req.params.id, 'event ID');
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.updateEvent(userId, eventId, eventData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const eventId = validateIntParam(req.params.id, 'event ID');
      const success = await storage.deleteEvent(userId, eventId);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Focus Sessions
  app.get("/api/focus-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const sessions = await storage.getUserFocusSessions(userId, startDate, endDate);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch focus sessions" });
    }
  });

  app.post("/api/focus-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      console.log('Creating focus session for user:', userId, 'with data:', req.body);
      
      // Convert date strings to Date objects
      const sessionData = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
      };
      
      const validatedData = insertFocusSessionSchema.parse(sessionData);
      console.log('Validated session data:', validatedData);
      const session = await storage.createFocusSession(userId, validatedData);
      console.log('Focus session created successfully:', session);
      res.json(session);
    } catch (error) {
      console.error('Error creating focus session:', error);
      res.status(400).json({ message: "Invalid session data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/focus-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const sessionId = parseInt(req.params.id);
      
      // Convert date strings to Date objects
      const sessionData = {
        ...req.body,
        startTime: req.body.startTime ? new Date(req.body.startTime) : undefined,
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
      };
      
      const validatedData = insertFocusSessionSchema.parse(sessionData);
      const session = await storage.updateFocusSession(userId, sessionId, validatedData);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error('Error updating focus session:', error);
      res.status(400).json({ message: "Invalid session data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch("/api/focus-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const sessionId = parseInt(req.params.id);
      console.log('Updating focus session:', sessionId, 'for user:', userId, 'with data:', req.body);
      
      // Convert date strings to Date objects for partial updates
      const sessionData: any = { ...req.body };
      if (sessionData.startTime) {
        sessionData.startTime = new Date(sessionData.startTime);
      }
      if (sessionData.endTime) {
        sessionData.endTime = new Date(sessionData.endTime);
      }
      
      const session = await storage.updateFocusSession(userId, sessionId, sessionData);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      console.log('Focus session updated successfully:', session);
      res.json(session);
    } catch (error) {
      console.error('Error updating focus session:', error);
      res.status(400).json({ message: "Invalid session data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Browser Activities
  app.get("/api/browser-activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const activities = await storage.getUserBrowserActivities(userId, startDate, endDate);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch browser activities" });
    }
  });

  app.post("/api/browser-activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const activityData = insertBrowserActivitySchema.parse(req.body);
      const activity = await storage.createBrowserActivity(userId, activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid browser activity data" });
    }
  });

  app.get("/api/browser-activities/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const stats = await storage.getBrowserActivityStats(userId, date);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch browser activity stats" });
    }
  });

  // Health Metrics
  app.get("/api/health-metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const type = req.query.type as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const metrics = await storage.getUserHealthMetrics(userId, type, startDate, endDate);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health metrics" });
    }
  });

  app.post("/api/health-metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const metricData = insertHealthMetricSchema.parse(req.body);
      const metric = await storage.createHealthMetric(userId, metricData);
      res.json(metric);
    } catch (error) {
      res.status(400).json({ message: "Invalid health metric data" });
    }
  });

  app.get("/api/health-metrics/latest", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const metrics = await storage.getLatestHealthMetrics(userId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest health metrics" });
    }
  });

  app.post("/api/health-metrics/sync", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { deviceType, source } = req.body;
      
      // Simulate device sync - in production, this would integrate with actual APIs
      const mockData = await storage.simulateDeviceSync(userId, source);
      res.json({ success: true, syncedMetrics: mockData.length, source });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync health data" });
    }
  });

  app.post("/api/health-metrics/real-sync", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { source, data, timestamp } = req.body;
      
      // Process real device data
      const syncedMetrics = [];
      
      for (const [metricType, value] of Object.entries(data)) {
        if (typeof value === 'number' && value > 0) {
          const metric = await storage.createHealthMetric(userId, {
            type: metricType,
            value: Math.round(value),
            unit: getMetricUnit(metricType),
            recordedAt: new Date(timestamp),
            metadata: {
              source,
              realDevice: true,
              syncTime: new Date().toISOString(),
            }
          });
          syncedMetrics.push(metric);
        }
      }
      
      res.json({ success: true, syncedMetrics: syncedMetrics.length, source, realDevice: true });
    } catch (error) {
      console.error('Real device sync error:', error);
      res.status(500).json({ message: "Failed to sync real device data" });
    }
  });

  function getMetricUnit(type: string): string {
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
  app.get("/api/weekly-reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const reports = await storage.getUserWeeklyReports(userId, limit);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly reports" });
    }
  });

  app.post("/api/weekly-reports/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const weekStart = new Date(req.body.weekStart);
      const report = await storage.generateWeeklyReport(userId, weekStart);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate weekly report" });
    }
  });

function calculateDynamicCosts(users: any[], tasks: any[], notes: any[], focusSessions: any[], browserActivities: any[], healthMetrics: any[]) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  // Calculate costs based on actual resource usage
  const totalRecords = tasks.length + notes.length + focusSessions.length + browserActivities.length + healthMetrics.length;
  const activeUsers = users.filter(user => user.updatedAt && new Date(user.updatedAt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
  
  // Dynamic cost calculation based on real usage
  const computeCostPerHour = 0.02; // $0.02 per CPU hour
  const databaseCostPerGB = 0.15; // $0.15 per GB stored
  const storageCostPerGB = 0.05; // $0.05 per GB
  const bandwidthCostPerGB = 0.08; // $0.08 per GB transferred
  
  // Calculate actual resource consumption
  const estimatedCPUHours = activeUsers * 2.5; // 2.5 hours per active user
  const estimatedStorageGB = totalRecords * 0.001; // 1KB per record average
  const estimatedBandwidthGB = totalRecords * 0.0005; // 0.5KB per request
  const estimatedDatabaseGB = totalRecords * 0.0008; // 0.8KB per database record
  
  // Calculate individual cost components
  const computeCost = estimatedCPUHours * computeCostPerHour;
  const databaseCost = estimatedDatabaseGB * databaseCostPerGB;
  const storageCost = estimatedStorageGB * storageCostPerGB;
  const bandwidthCost = estimatedBandwidthGB * bandwidthCostPerGB;
  const monitoringCost = activeUsers * 0.10; // $0.10 per active user for monitoring
  const backupCost = estimatedDatabaseGB * 0.03; // $0.03 per GB for backups
  
  const monthlyTotal = computeCost + databaseCost + storageCost + bandwidthCost + monitoringCost + backupCost;
  const dailyAverage = monthlyTotal / daysInMonth;
  const yearlyProjected = monthlyTotal * 12;
  
  // Calculate growth trend (simplified)
  const growthRate = Math.min(activeUsers * 0.05, 0.25); // Max 25% growth
  const forecast = monthlyTotal * (1 + growthRate);
  
  return {
    monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    yearlyProjected: Math.round(yearlyProjected * 100) / 100,
    breakdown: {
      compute: Math.round(computeCost * 100) / 100,
      database: Math.round(databaseCost * 100) / 100,
      storage: Math.round(storageCost * 100) / 100,
      bandwidth: Math.round(bandwidthCost * 100) / 100,
      monitoring: Math.round(monitoringCost * 100) / 100,
      backup: Math.round(backupCost * 100) / 100
    },
    resourceUsage: {
      cpuHours: Math.round(estimatedCPUHours * 100) / 100,
      memoryGBHours: Math.round(estimatedCPUHours * 0.5 * 100) / 100, // 0.5GB per CPU hour
      storageGB: Math.round(estimatedStorageGB * 100) / 100,
      bandwidthGB: Math.round(estimatedBandwidthGB * 100) / 100,
      databaseConnections: totalRecords,
      apiRequests: totalRecords * 3 // Estimate 3 API requests per record operation
    },
    topResourceUsers: users.slice(0, 3).map(user => {
      const userRecords = [
        ...tasks.filter(t => t.userId === user.id),
        ...notes.filter(n => n.userId === user.id),
        ...focusSessions.filter(f => f.userId === user.id)
      ].length;
      
      return {
        userId: user.id,
        email: user.email || 'N/A',
        resourceUsage: {
          cpuMinutes: Math.round(userRecords * 0.5 * 100) / 100,
          storageGB: Math.round(userRecords * 0.001 * 100) / 100,
          apiCalls: userRecords * 3,
          bandwidthGB: Math.round(userRecords * 0.0005 * 100) / 100
        }
      };
    }),
    trends: {
      lastMonth: Math.round(monthlyTotal * 0.92 * 100) / 100, // Assume 8% growth from last month
      growth: Math.round(growthRate * 100 * 100) / 100,
      forecast: Math.round(forecast * 100) / 100
    }
  };
}

function calculatePeakUsageHours(tasks: any[], notes: any[], focusSessions: any[], browserActivities: any[]) {
  const hourlyActivity = new Map<number, number>();
  
  // Initialize all hours (0-23) with 0 activity
  for (let hour = 0; hour < 24; hour++) {
    hourlyActivity.set(hour, 0);
  }
  
  // Count activity by hour from all real user actions
  const countActivityByHour = (timestamp: string | Date) => {
    if (!timestamp) return;
    try {
      const date = new Date(timestamp);
      if (date && !isNaN(date.getTime())) {
        const hour = date.getHours();
        hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
      }
    } catch (error) {
      // Skip invalid timestamps
    }
  };
  
  // Count task activity
  tasks.forEach(task => {
    countActivityByHour(task.createdAt);
    countActivityByHour(task.updatedAt);
  });
  
  // Count note activity
  notes.forEach(note => {
    countActivityByHour(note.createdAt);
    countActivityByHour(note.updatedAt);
  });
  
  // Count focus session activity
  focusSessions.forEach(session => {
    countActivityByHour(session.createdAt);
    countActivityByHour(session.startTime);
  });
  
  // Count browser activity
  browserActivities.forEach(activity => {
    countActivityByHour(activity.timestamp || activity.startTime);
  });
  
  // Convert to array and sort by activity count (descending)
  const peakHours = Array.from(hourlyActivity.entries())
    .map(([hour, users]) => ({ hour, users }))
    .filter(item => item.users > 0) // Only show hours with actual activity
    .sort((a, b) => b.users - a.users)
    .slice(0, 6); // Top 6 peak hours
  
  return peakHours;
}

function calculateFeatureUsage(users: any[], tasks: any[], notes: any[], focusSessions: any[], browserActivities: any[], healthMetrics: any[]) {
  const totalUsers = Math.max(users.length, 1);
  
  // Calculate actual user adoption rates as percentages
  const usersWithTasks = new Set(tasks.map(task => task.userId)).size;
  const usersWithNotes = new Set(notes.map(note => note.userId)).size;
  const usersWithFocusSessions = new Set(focusSessions.map(session => session.userId)).size;
  const usersWithBrowserActivities = new Set(browserActivities.map(activity => activity.userId)).size;
  const usersWithHealthMetrics = new Set(healthMetrics.map(metric => metric.userId)).size;
  
  return [
    { 
      feature: "Task Management", 
      usage: Math.round((usersWithTasks / totalUsers) * 100)
    },
    { 
      feature: "Focus Timer", 
      usage: Math.round((usersWithFocusSessions / totalUsers) * 100)
    },
    { 
      feature: "Smart Notes", 
      usage: Math.round((usersWithNotes / totalUsers) * 100)
    },
    { 
      feature: "Browser Tracking", 
      usage: Math.round((usersWithBrowserActivities / totalUsers) * 100)
    },
    { 
      feature: "Health Metrics", 
      usage: Math.round((usersWithHealthMetrics / totalUsers) * 100)
    },
    { 
      feature: "Calendar", 
      usage: 0 // No calendar events table exists yet
    }
  ].filter(item => item.usage > 0 || item.feature === "Calendar"); // Only show features with actual usage
}

function generateDailyActiveUsers(users: any[], tasks: any[], notes: any[], focusSessions: any[], browserActivities: any[]): Array<{date: string, activeUsers: number, newUsers: number}> {
    const dailyData: Array<{date: string, activeUsers: number, newUsers: number}> = [];
    const activityByDate = new Map();

    // Collect all actual activity dates from real data
    const collectActivityDate = (date: any, userId: string) => {
      if (!date) return;
      try {
        const activityDate = new Date(date);
        if (activityDate && !isNaN(activityDate.getTime())) {
          const dateStr = activityDate.toISOString().split('T')[0];
          if (!activityByDate.has(dateStr)) {
            activityByDate.set(dateStr, { activeUsers: new Set(), newUsers: 0 });
          }
          activityByDate.get(dateStr).activeUsers.add(userId);
        }
      } catch (error) {
        // Skip invalid dates
      }
    };

    // Collect task activity
    tasks.forEach(task => {
      collectActivityDate(task.createdAt || task.updatedAt, task.userId);
    });

    // Collect note activity
    notes.forEach(note => {
      collectActivityDate(note.createdAt || note.updatedAt, note.userId);
    });

    // Collect focus session activity
    focusSessions.forEach(session => {
      collectActivityDate(session.createdAt, session.userId);
    });

    // Collect browser activity
    browserActivities.forEach(activity => {
      collectActivityDate(activity.timestamp || activity.startTime, activity.userId);
    });

    // Count new users by registration date
    users.forEach(user => {
      if (user.createdAt) {
        try {
          const userDate = new Date(user.createdAt);
          if (userDate && !isNaN(userDate.getTime())) {
            const dateStr = userDate.toISOString().split('T')[0];
            if (!activityByDate.has(dateStr)) {
              activityByDate.set(dateStr, { activeUsers: new Set(), newUsers: 0 });
            }
            activityByDate.get(dateStr).newUsers++;
          }
        } catch (error) {
          // Skip invalid dates
        }
      }
    });

    // Convert to array and sort by date (only include dates with actual activity)
    activityByDate.forEach((data, date) => {
      dailyData.push({
        date,
        activeUsers: data.activeUsers.size,
        newUsers: data.newUsers
      });
    });

    // Sort by date descending and return only recent activity
    return dailyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  function getUserGrowthMetrics(users: any[]) {
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const newThisWeek = users.filter(user => 
      user.createdAt && new Date(user.createdAt) > thisWeek
    ).length;
    
    const newLastWeek = users.filter(user => 
      user.createdAt && 
      new Date(user.createdAt) > lastWeek && 
      new Date(user.createdAt) <= thisWeek
    ).length;
    
    const newThisMonth = users.filter(user => 
      user.createdAt && new Date(user.createdAt) > thisMonth
    ).length;
    
    const weekOverWeekGrowth = newLastWeek > 0 ? 
      ((newThisWeek - newLastWeek) / newLastWeek * 100) : 
      (newThisWeek > 0 ? 100 : 0);
    
    return {
      newThisWeek,
      newThisMonth,
      weekOverWeekGrowth: Math.round(weekOverWeekGrowth * 10) / 10,
      totalUsers: users.length
    };
  }

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      // SECURITY: Restrict admin access to specific user ID
      const userId = getUserId(req);
      const ADMIN_USER_ID = process.env.ADMIN_USER_ID; // Must be set in environment for security
      
      if (!ADMIN_USER_ID || userId !== ADMIN_USER_ID) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const timeRange = req.query.timeRange || "7d";
      
      // Get comprehensive admin statistics
      const [allUsers, allTasks, allNotes, allFocusSessions, allBrowserActivities, allHealthMetrics] = await Promise.all([
        db.select().from(users),
        db.select().from(tasks),
        db.select().from(notes),
        db.select().from(focusSessions),
        db.select().from(browserActivities),
        db.select().from(healthMetrics)
      ]);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const activeUsers = allUsers.filter(user => 
        user.updatedAt && new Date(user.updatedAt) > weekAgo
      );

      const newUsersThisWeek = allUsers.filter(user => 
        user.createdAt && new Date(user.createdAt) > weekAgo
      );

      const completedTasks = allTasks.filter(task => task.status === 'completed');
      
      const totalFocusMinutes = allFocusSessions.reduce((sum, session) => 
        sum + (session.completedDuration || 0), 0
      );

      const userGrowthMetrics = getUserGrowthMetrics(allUsers);

      const stats = {
        users: {
          total: allUsers.length,
          active: activeUsers.length,
          newThisWeek: newUsersThisWeek.length,
          growth: userGrowthMetrics,
          topUsers: activeUsers.slice(0, 5).map((user, index) => ({
            id: user.id,
            email: user.email || 'N/A',
            firstName: user.firstName || 'Unknown',
            lastName: user.lastName || 'User',
            lastActive: user.updatedAt || user.createdAt || new Date(),
            tasksCompleted: allTasks.filter(task => task.userId === user.id && task.status === 'completed').length,
            focusMinutes: allFocusSessions
              .filter(session => session.userId === user.id)
              .reduce((sum, session) => sum + (session.completedDuration || 0), 0)
          }))
        },
        usage: {
          totalTasks: allTasks.length,
          completedTasks: completedTasks.length,
          totalNotes: allNotes.length,
          totalFocusSessions: allFocusSessions.length,
          totalFocusMinutes: totalFocusMinutes,
          totalBrowserActivities: allBrowserActivities.length,
          averageSessionLength: allFocusSessions.length > 0 ? 
            totalFocusMinutes / allFocusSessions.length : 0
        },
        activity: {
          dailyActiveUsers: generateDailyActiveUsers(allUsers, allTasks, allNotes, allFocusSessions, allBrowserActivities),
          featureUsage: calculateFeatureUsage(allUsers, allTasks, allNotes, allFocusSessions, allBrowserActivities, allHealthMetrics),
          peakUsageHours: calculatePeakUsageHours(allTasks, allNotes, allFocusSessions, allBrowserActivities)
        },
        health: {
          apiResponseTime: 0, // Real API monitoring not implemented yet
          uptime: 0, // System uptime tracking not implemented
          errorRate: 0, // Error rate monitoring not implemented
          databaseSize: 0 // Database size monitoring not implemented
        },
        costs: calculateDynamicCosts(allUsers, allTasks, allNotes, allFocusSessions, allBrowserActivities, allHealthMetrics)
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const today = new Date();
      const [activityStats, browserStats, tasks, events] = await Promise.all([
        storage.getActivityStats(userId, today),
        storage.getBrowserActivityStats(userId, today),
        storage.getUserTasks(userId),
        storage.getUserEvents(userId, today, today)
      ]);

      const stats = {
        todayStats: {
          ...activityStats,
          ...browserStats,
        },
        taskStats: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status === 'pending').length,
        },
        upcomingEvents: events.length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Journal Entries
  app.get("/api/journal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { limit } = req.query;
      const entries = await storage.getUserJournalEntries(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(entries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal/:date", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { date } = req.params;
      const entry = await storage.getJournalEntry(userId, date);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  app.post("/api/journal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const entry = await storage.createJournalEntry(userId, req.body);
      res.json(entry);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.patch("/api/journal/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const entry = await storage.updateJournalEntry(userId, parseInt(id), req.body);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error('Error updating journal entry:', error);
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  app.delete("/api/journal/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const success = await storage.deleteJournalEntry(userId, parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Categories
  app.get("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { type } = req.query;
      console.log('Fetching categories for user:', userId, 'type:', type);
      const categories = await storage.getUserCategories(userId, type as string);
      console.log('Found categories:', categories);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      console.log('Creating category for user:', userId, 'with data:', req.body);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(userId, categoryData);
      console.log('Category created successfully:', category);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Category validation error:', error.errors);
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error('Error creating category:', error);
      res.status(500).json({ message: "Failed to create category", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const categoryId = parseInt(req.params.id);
      console.log('Deleting category:', categoryId, 'for user:', userId);
      const success = await storage.deleteCategory(userId, categoryId);
      if (!success) {
        return res.status(404).json({ message: "Category not found or cannot be deleted" });
      }
      res.json({ success });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  app.post("/api/tasks/cleanup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      console.log('Running task cleanup for user:', userId);
      const deletedCount = await storage.cleanupCompletedTasks(userId);
      res.json({ success: true, deletedCount });
    } catch (error) {
      console.error('Error cleaning up tasks:', error);
      res.status(500).json({ message: "Failed to cleanup tasks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}