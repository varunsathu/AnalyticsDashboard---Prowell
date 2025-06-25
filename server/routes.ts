import type { Express } from "express";
import { createServer, type Server } from "http";
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
  users,
  tasks,
  notes,
  focusSessions,
  browserActivities,
  healthMetrics,
} from "@shared/schema";
import { db } from "./db";
import { setupAuth, isAuthenticated } from "./replitAuth";

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

  // Helper function to get user ID from request
  const getUserId = (req: any): string => {
    if (req.user?.claims?.sub) {
      return req.user.claims.sub;
    }
    // Create demo user if not authenticated (for development)
    return "demo-user-id";
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
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(userId, taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const taskId = parseInt(req.params.id);
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
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(userId, taskId);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
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
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(userId, noteData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.put("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const noteId = parseInt(req.params.id);
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.updateNote(userId, noteId, noteData);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const noteId = parseInt(req.params.id);
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
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const notes = await storage.searchNotes(userId, query);
      res.json(notes);
    } catch (error) {
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
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(userId, eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.put("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const eventId = parseInt(req.params.id);
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
      const eventId = parseInt(req.params.id);
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
      const sessionData = insertFocusSessionSchema.parse(req.body);
      const session = await storage.createFocusSession(userId, sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.put("/api/focus-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const sessionId = parseInt(req.params.id);
      const sessionData = insertFocusSessionSchema.parse(req.body);
      const session = await storage.updateFocusSession(userId, sessionId, sessionData);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
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

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      // In production, add proper admin role checking
      // const isAdmin = req.user?.role === 'admin';
      // if (!isAdmin) return res.status(403).json({ message: "Admin access required" });

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

      const stats = {
        users: {
          total: allUsers.length,
          active: activeUsers.length,
          newThisWeek: newUsersThisWeek.length,
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
          dailyActiveUsers: [], // Simplified for demo
          featureUsage: [
            { feature: "Task Management", usage: 89 },
            { feature: "Focus Timer", usage: 76 },
            { feature: "Smart Notes", usage: 65 },
            { feature: "Activity Tracking", usage: 54 },
            { feature: "Health Metrics", usage: 43 },
            { feature: "Calendar", usage: 38 }
          ],
          peakUsageHours: [] // Simplified for demo
        },
        health: {
          apiResponseTime: 125,
          uptime: 99.8,
          errorRate: 0.2,
          databaseSize: 2.4
        },
        billing: {
          monthlyRevenue: 15420.50,
          totalCosts: 8940.25,
          profitMargin: 42.0,
          costBreakdown: {
            compute: 4250.80,
            database: 2140.30,
            storage: 1890.15,
            bandwidth: 659.00
          },
          userCosts: allUsers.slice(0, 10).map((user, index) => {
            // Calculate realistic usage based on user activity
            const userTasks = allTasks.filter(task => task.userId === user.id);
            const userSessions = allFocusSessions.filter(session => session.userId === user.id);
            const userBrowserActivities = allBrowserActivities.filter(activity => activity.userId === user.id);
            
            const apiCalls = userTasks.length * 15 + userSessions.length * 8 + userBrowserActivities.length * 2;
            const computeHours = userSessions.reduce((sum, session) => sum + (session.completedDuration || 0), 0) / 60;
            const storageGB = (userTasks.length * 0.01 + allNotes.filter(note => note.userId === user.id).length * 0.05);
            const bandwidthGB = apiCalls * 0.0002;
            
            const costs = {
              compute: computeHours * 3.00,
              storage: storageGB * 5.00,
              bandwidth: bandwidthGB * 1.45,
              apiCalls: (apiCalls / 1000) * 0.50
            };
            
            return {
              userId: user.id,
              email: user.email || 'N/A',
              monthlyUsage: {
                apiCalls: Math.floor(apiCalls),
                storageGB: parseFloat(storageGB.toFixed(2)),
                computeHours: parseFloat(computeHours.toFixed(1)),
                bandwidthGB: parseFloat(bandwidthGB.toFixed(2))
              },
              costs: {
                total: parseFloat((costs.compute + costs.storage + costs.bandwidth + costs.apiCalls).toFixed(2)),
                compute: parseFloat(costs.compute.toFixed(2)),
                storage: parseFloat(costs.storage.toFixed(2)),
                bandwidth: parseFloat(costs.bandwidth.toFixed(2))
              },
              tier: computeHours > 30 ? "enterprise" : computeHours > 15 ? "premium" : computeHours > 5 ? "basic" : "free"
            };
          }),
          pricing: {
            computePerHour: 3.00,
            storagePerGB: 5.00,
            bandwidthPerGB: 1.45,
            apiCallsPer1000: 0.50
          }
        }
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

  const httpServer = createServer(app);
  return httpServer;
}