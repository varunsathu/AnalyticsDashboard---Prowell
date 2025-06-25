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
} from "@shared/schema";
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