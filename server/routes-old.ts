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
      const user = await storage.getUser(getUserId(req));
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
    return "demo-user-id"; // Fallback for development
  };

  // Tasks
  app.get("/api/tasks", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const tasks = await storage.getUserTasks(getUserId(req));
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req: any, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(getUserId(req), taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = updateTaskSchema.parse({ ...req.body, id: taskId });
      const task = await storage.updateTask(getUserId(req), taskData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(getUserId(req), taskId);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Notes
  app.get("/api/notes", async (req: any, res) => {
    try {
      const { search } = req.query;
      let notes;
      if (search && typeof search === 'string') {
        notes = await storage.searchNotes(getUserId(req), search);
      } else {
        notes = await storage.getUserNotes(getUserId(req));
      }
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req: any, res) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(getUserId(req), noteData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.put("/api/notes/:id", async (req: any, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const noteData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(getUserId(req), noteId, noteData);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.delete("/api/notes/:id", async (req: any, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const success = await storage.deleteNote(getUserId(req), noteId);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Activities
  app.get("/api/activities", async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const activities = await storage.getUserActivities(getUserId(req), start, end);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req: any, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(getUserId(req), activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.get("/api/activities/stats", async (req: any, res) => {
    try {
      const { date } = req.query;
      const statsDate = date ? new Date(date as string) : new Date();
      const stats = await storage.getActivityStats(getUserId(req), statsDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity stats" });
    }
  });

  // Events
  app.get("/api/events", async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const events = await storage.getUserEvents(getUserId(req), start, end);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req: any, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(getUserId(req), eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.put("/api/events/:id", async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(getUserId(req), eventId, eventData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.delete("/api/events/:id", async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(getUserId(req), eventId);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Focus Sessions
  app.get("/api/focus-sessions", async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const sessions = await storage.getUserFocusSessions(getUserId(req), start, end);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch focus sessions" });
    }
  });

  app.post("/api/focus-sessions", async (req: any, res) => {
    try {
      const sessionData = insertFocusSessionSchema.parse(req.body);
      const session = await storage.createFocusSession(getUserId(req), sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid focus session data" });
    }
  });

  app.put("/api/focus-sessions/:id", async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const sessionData = insertFocusSessionSchema.partial().parse(req.body);
      const session = await storage.updateFocusSession(getUserId(req), sessionId, sessionData);
      if (!session) {
        return res.status(404).json({ message: "Focus session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid focus session data" });
    }
  });

  // Browser Activities
  app.get("/api/browser-activities", async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const activities = await storage.getUserBrowserActivities(getUserId(req), start, end);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch browser activities" });
    }
  });

  app.post("/api/browser-activities", async (req: any, res) => {
    try {
      const activityData = insertBrowserActivitySchema.parse(req.body);
      const activity = await storage.createBrowserActivity(getUserId(req), activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid browser activity data" });
    }
  });

  app.get("/api/browser-activities/stats", async (req: any, res) => {
    try {
      const { date } = req.query;
      const statsDate = date ? new Date(date as string) : new Date();
      const stats = await storage.getBrowserActivityStats(getUserId(req), statsDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch browser activity stats" });
    }
  });

  // Health Metrics
  app.get("/api/health-metrics", async (req: any, res) => {
    try {
      const { type, startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const metrics = await storage.getUserHealthMetrics(getUserId(req), type as string, start, end);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health metrics" });
    }
  });

  app.post("/api/health-metrics", async (req: any, res) => {
    try {
      const metricData = insertHealthMetricSchema.parse(req.body);
      const metric = await storage.createHealthMetric(getUserId(req), metricData);
      res.json(metric);
    } catch (error) {
      res.status(400).json({ message: "Invalid health metric data" });
    }
  });

  app.get("/api/health-metrics/latest", async (req: any, res) => {
    try {
      const metrics = await storage.getLatestHealthMetrics(getUserId(req));
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest health metrics" });
    }
  });

  // Weekly Reports
  app.get("/api/weekly-reports", async (req: any, res) => {
    try {
      const { limit } = req.query;
      const reports = await storage.getUserWeeklyReports(getUserId(req), limit ? parseInt(limit as string) : undefined);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly reports" });
    }
  });

  app.post("/api/weekly-reports/generate", async (req: any, res) => {
    try {
      const { weekStart } = req.body;
      const report = await storage.generateWeeklyReport(getUserId(req), new Date(weekStart));
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate weekly report" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: any, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const [tasks, activities, focusSessions, browserStats, healthMetrics] = await Promise.all([
        storage.getUserTasks(getUserId(req)),
        storage.getUserActivities(getUserId(req), startOfDay, endOfDay),
        storage.getUserFocusSessions(getUserId(req), startOfDay, endOfDay),
        storage.getBrowserActivityStats(getUserId(req), today),
        storage.getLatestHealthMetrics(getUserId(req)),
      ]);

      const completedTasks = tasks.filter(task => task.status === 'completed');
      const totalTasks = tasks.length;
      const todayCompletedTasks = completedTasks.filter(task => 
        task.completedAt && 
        task.completedAt >= startOfDay && 
        task.completedAt <= endOfDay
      ).length;

      const focusTime = focusSessions
        .filter(session => session.type === 'focus')
        .reduce((sum, session) => sum + session.completedDuration, 0);

      const activityStats = await storage.getActivityStats(getUserId(req), today);

      res.json({
        focusTime: Math.floor(focusTime), // in minutes
        tasksCompleted: todayCompletedTasks,
        totalTasks,
        weeklyGoals: 4, // Mock data for weekly goals
        totalWeeklyGoals: 7,
        productivityScore: browserStats.productivityScore || Math.min(100, Math.round((focusTime / 240) * 100)),
        activityStats,
        browserStats,
        healthMetrics,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
